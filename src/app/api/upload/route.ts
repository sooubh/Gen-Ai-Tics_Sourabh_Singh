// ==============================================================================
// VECNAVERSE: Audio Upload & Ingestion API Endpoint
// Secure multipart/form-data upload handler with magic-byte verification,
// SHA-256 custody hashing, and isolated private storage
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import path from 'path';
import {
  validateAudioPreflight,
  detectAudioSignature,
  extractWavDuration,
  estimateAudioDuration,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
} from '@/lib/audio/preflight';
import {
  savePrivateAudioByHash,
  readPrivateAudioFile,
  resolveSafeStoragePath,
  hasPrivateAudioFile,
  sanitizeFileName,
} from '@/lib/storage/private-storage';
import { store } from '@/lib/data/store';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB limit

const EXT_TO_MIME_FALLBACK: Record<string, string> = {
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/x-m4a',
  '.mp4': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.webm': 'audio/webm',
  '.aac': 'audio/aac',
  '.flac': 'audio/flac',
};

const FORMAT_TO_EXT: Record<string, string> = {
  wav: '.wav',
  mp3: '.mp3',
  m4a: '.m4a',
  mp4: '.mp4',
  ogg: '.ogg',
  webm: '.webm',
  aac: '.aac',
  flac: '.flac',
};

export async function POST(req: NextRequest) {
  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request: Multipart form data required.' },
        { status: 400 }
      );
    }

    // 1. Extract audio file entry (supports 'audio' or 'file' form field)
    const fileEntry = formData.get('audio') || formData.get('file');

    if (!fileEntry || typeof fileEntry === 'string' || typeof (fileEntry as Blob).arrayBuffer !== 'function') {
      return NextResponse.json(
        {
          success: false,
          error: 'No audio file provided in request. Expected form field "audio" or "file".',
        },
        { status: 400 }
      );
    }

    const file = fileEntry as File;
    const rawFileName = file.name || 'uploaded_recording.wav';
    const safeOriginalName = sanitizeFileName(rawFileName);
    const fileSize = file.size;

    // 2. File size validation (max 100MB)
    if (fileSize <= 0) {
      return NextResponse.json(
        { success: false, error: 'Audio file is empty (0 bytes).' },
        { status: 400 }
      );
    }

    if (fileSize > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `File size (${(fileSize / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 100MB.`,
        },
        { status: 400 }
      );
    }

    // 3. MIME type inspection
    const rawMime = (file.type || '').toLowerCase();
    const normalizedMime = rawMime.split(';')[0].trim();

    // Check extension
    const dotIdx = rawFileName.lastIndexOf('.');
    const extFromFilename = dotIdx !== -1 ? rawFileName.substring(dotIdx).toLowerCase() : '';

    // If MIME type is explicitly given and is a non-audio MIME (e.g. image/png, application/pdf, etc.)
    if (
      normalizedMime &&
      normalizedMime !== 'application/octet-stream' &&
      !normalizedMime.startsWith('audio/') &&
      normalizedMime !== 'video/mp4' &&
      normalizedMime !== 'video/webm'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported MIME type '${normalizedMime}'. Permitted audio formats: WAV, MP3, MP4, OGG, WebM, M4A, AAC, FLAC.`,
        },
        { status: 400 }
      );
    }

    // 4. Read file bytes into Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 5. Inspect magic bytes / audio signatures
    const signature = detectAudioSignature(buffer);
    if (!signature.detected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid audio file: Content failed magic bytes validation. Header does not match recognized audio format.',
        },
        { status: 400 }
      );
    }

    // 6. Comprehensive preflight check
    const preflight = validateAudioPreflight(
      safeOriginalName,
      fileSize,
      normalizedMime || signature.mimeType,
      buffer,
      { maxBytes: MAX_UPLOAD_BYTES }
    );

    if (!preflight.valid) {
      return NextResponse.json(
        { success: false, error: preflight.error || 'Audio preflight validation failed.' },
        { status: 400 }
      );
    }

    // 7. Calculate genuine SHA-256 custody hash over actual bytes
    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // 8. Determine safe storage extension
    let targetExt = extFromFilename;
    if (!targetExt || !ALLOWED_EXTENSIONS.includes(targetExt)) {
      targetExt = FORMAT_TO_EXT[signature.format || ''] || '.wav';
    }

    // 9. Save file to private storage directory (uploads/audio/<hash>.<ext>)
    const saved = savePrivateAudioByHash(buffer, sha256Hash, targetExt);

    // 10. Compute duration seconds
    let durationSeconds: number | null = null;

    // Check if client provided duration in formData
    const clientDuration = formData.get('durationSeconds') || formData.get('duration');
    if (clientDuration) {
      const parsed = parseFloat(String(clientDuration));
      if (!isNaN(parsed) && parsed > 0) {
        durationSeconds = Math.round(parsed * 10) / 10;
      }
    }

    // If not client-provided, check if WAV header contains exact duration
    if (!durationSeconds && (signature.format === 'wav' || targetExt === '.wav')) {
      const parsedWavDur = extractWavDuration(buffer);
      if (parsedWavDur) {
        durationSeconds = parsedWavDur;
      }
    }

    // Fallback: estimate from bitrate and byte length
    if (!durationSeconds || durationSeconds <= 0) {
      durationSeconds = estimateAudioDuration(buffer.length, preflight.mimeType || signature.mimeType || targetExt);
    }

    // 11. Optionally attach to case if caseId is passed
    const caseId = formData.get('caseId');
    if (caseId && typeof caseId === 'string' && caseId.trim() !== '') {
      try {
        store.attachAudio(caseId.trim(), {
          filename: safeOriginalName,
          sizeBytes: buffer.length,
          durationSeconds,
          mimeType: preflight.mimeType || signature.mimeType || 'audio/wav',
          format: preflight.format || signature.description || 'Audio Stream',
          sha256Hash,
          uploadedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          retentionHours: 24,
          storagePath: saved.storagePath,
          purged: false,
        });
      } catch (err) {
        console.warn(`[API/upload] Note: Could not attach to case #${caseId}:`, err);
      }
    }

    // 12. Return required response contract
    return NextResponse.json(
      {
        success: true,
        file: {
          storagePath: saved.storagePath,
          fileName: safeOriginalName,
          fileSize: buffer.length,
          mimeType: preflight.mimeType || signature.mimeType || 'audio/wav',
          sha256Hash,
          durationSeconds,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[API/upload] Unhandled upload error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error processing audio upload.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/upload?file=<filename>&path=<storagePath>
 * Secure retrieval of stored private audio files with path traversal defense
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const target = url.searchParams.get('file') || url.searchParams.get('path');

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "file" or "path" is required.' },
        { status: 400 }
      );
    }

    // Strict path validation to detect path traversal attempts
    let safePath: string;
    try {
      safePath = resolveSafeStoragePath(target);
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err?.message || 'Invalid or unsafe file path.' },
        { status: 400 }
      );
    }

    if (!hasPrivateAudioFile(safePath)) {
      return NextResponse.json(
        { success: false, error: 'Audio file not found in storage.' },
        { status: 404 }
      );
    }

    const buffer = readPrivateAudioFile(safePath);
    if (!buffer) {
      return NextResponse.json(
        { success: false, error: 'Unable to read audio file from storage.' },
        { status: 404 }
      );
    }

    // Determine MIME type
    const ext = path.extname(safePath).toLowerCase();
    const contentType = EXT_TO_MIME_FALLBACK[ext] || 'audio/wav';

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, no-cache',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error retrieving audio file.' },
      { status: 500 }
    );
  }
}
