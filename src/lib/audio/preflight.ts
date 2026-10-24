// ==============================================================================
// VECNAVERSE: Audio Preflight Validation
// Validates file format, MIME type, size limits, audio magic bytes, and SHA-256 custody hash
// ==============================================================================

import crypto from 'crypto';

export interface PreflightValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  format?: string;
  sha256Hash?: string;
  durationSeconds?: number;
  detectedFormat?: string;
  sizeBytes?: number;
}

export const ALLOWED_EXTENSIONS = [
  '.wav',
  '.mp3',
  '.flac',
  '.m4a',
  '.ogg',
  '.webm',
  '.aac',
  '.mp4',
];

export const ALLOWED_MIME_TYPES = [
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/ogg',
  'audio/opus',
  'audio/webm',
  'audio/x-m4a',
  'audio/m4a',
  'audio/aac',
  'audio/flac',
  'audio/x-flac',
];

export const MIME_FORMAT_MAP: Record<string, string> = {
  'audio/wav': 'PCM 16-bit / 44.1 kHz / 2ch',
  'audio/x-wav': 'PCM 16-bit / 44.1 kHz / 2ch',
  'audio/wave': 'PCM 16-bit / 44.1 kHz / 2ch',
  'audio/mpeg': 'MPEG-1 Layer 3 / 44.1 kHz',
  'audio/mp3': 'MPEG-1 Layer 3 / 44.1 kHz',
  'audio/flac': 'FLAC Lossless 24-bit / 48 kHz',
  'audio/x-flac': 'FLAC Lossless 24-bit / 48 kHz',
  'audio/mp4': 'AAC 44.1 kHz / Stereo',
  'audio/m4a': 'AAC 44.1 kHz / Stereo',
  'audio/x-m4a': 'AAC 44.1 kHz / Stereo',
  'audio/aac': 'AAC Audio Stream',
  'audio/ogg': 'Ogg Vorbis 48 kHz / 2ch',
  'audio/opus': 'Opus Audio 48 kHz',
  'audio/webm': 'WebM Audio / Opus 48 kHz',
};

const DEFAULT_MAX_BYTES = 524288000; // 500 MB default ceiling

/**
 * Inspects the initial bytes of a buffer to verify genuine audio magic bytes.
 */
export function detectAudioSignature(buffer: Buffer): {
  detected: boolean;
  format?: string;
  mimeType?: string;
  description?: string;
} {
  if (!buffer || buffer.length < 2) {
    return { detected: false };
  }

  // 1. WAV / WAVE: starts with 'RIFF' or 'RIFX' and contains 'WAVE' at offset 8
  if (
    buffer.length >= 12 &&
    (buffer.subarray(0, 4).toString('ascii') === 'RIFF' || buffer.subarray(0, 4).toString('ascii') === 'RIFX') &&
    buffer.subarray(8, 12).toString('ascii') === 'WAVE'
  ) {
    return {
      detected: true,
      format: 'wav',
      mimeType: 'audio/wav',
      description: 'PCM 16-bit / 44.1 kHz / 2ch',
    };
  }

  // 2. FLAC: starts with 'fLaC' (0x66 0x4C 0x61 0x43)
  if (buffer.length >= 4 && buffer.subarray(0, 4).toString('ascii') === 'fLaC') {
    return {
      detected: true,
      format: 'flac',
      mimeType: 'audio/flac',
      description: 'FLAC Lossless 24-bit / 48 kHz',
    };
  }

  // 3. OGG: starts with 'OggS' (0x4F 0x67 0x67 0x53)
  if (buffer.length >= 4 && buffer.subarray(0, 4).toString('ascii') === 'OggS') {
    return {
      detected: true,
      format: 'ogg',
      mimeType: 'audio/ogg',
      description: 'Ogg Vorbis 48 kHz / 2ch',
    };
  }

  // 4. MP4 / M4A (ISO base media box with 'ftyp' at offset 4)
  if (buffer.length >= 8 && buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
    const brand = buffer.length >= 12 ? buffer.subarray(8, 12).toString('ascii').trim().toLowerCase() : '';
    const isM4a = brand.includes('m4a');
    return {
      detected: true,
      format: isM4a ? 'm4a' : 'mp4',
      mimeType: isM4a ? 'audio/x-m4a' : 'audio/mp4',
      description: 'AAC 44.1 kHz / Stereo',
    };
  }

  // 5. WebM (EBML header: 0x1A 0x45 0xDF 0xA3)
  if (
    buffer.length >= 4 &&
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return {
      detected: true,
      format: 'webm',
      mimeType: 'audio/webm',
      description: 'WebM Audio / Opus 48 kHz',
    };
  }

  // 6. MP3 with ID3v2 tag (starts with 'ID3')
  if (buffer.length >= 3 && buffer.subarray(0, 3).toString('ascii') === 'ID3') {
    return {
      detected: true,
      format: 'mp3',
      mimeType: 'audio/mpeg',
      description: 'MPEG-1 Layer 3 / 44.1 kHz',
    };
  }

  // 7. MP3 raw MPEG Audio frame sync:
  // 11 bits set: 0xFF followed by 0xE0, with valid MPEG version and non-zero layer bits
  if (
    buffer.length >= 2 &&
    buffer[0] === 0xff &&
    (buffer[1] & 0xe0) === 0xe0 &&
    (buffer[1] & 0x18) !== 0x08 && // MPEG reserved version
    (buffer[1] & 0x06) !== 0x00    // Layer bits cannot be 00 in MPEG audio
  ) {
    return {
      detected: true,
      format: 'mp3',
      mimeType: 'audio/mpeg',
      description: 'MPEG-1 Layer 3 / 44.1 kHz',
    };
  }

  // 8. AAC ADTS frame sync: 12 bits 0xFFF (0xFF followed by high 4 bits set and layer bits 00)
  if (
    buffer.length >= 2 &&
    buffer[0] === 0xff &&
    (buffer[1] & 0xf6) === 0xf0
  ) {
    return {
      detected: true,
      format: 'aac',
      mimeType: 'audio/aac',
      description: 'AAC Audio Stream',
    };
  }

  return { detected: false };
}

/**
 * Extracts accurate duration in seconds from standard PCM WAV header.
 */
export function extractWavDuration(buffer: Buffer): number | null {
  try {
    if (buffer.length < 44) return null;
    const riff = buffer.subarray(0, 4).toString('ascii');
    const wave = buffer.subarray(8, 12).toString('ascii');
    if ((riff !== 'RIFF' && riff !== 'RIFX') || wave !== 'WAVE') return null;

    let offset = 12;
    let byteRate = 0;
    let dataSize = 0;

    while (offset + 8 <= buffer.length) {
      const chunkId = buffer.subarray(offset, offset + 4).toString('ascii');
      const chunkSize = buffer.readUInt32LE(offset + 4);

      if (chunkId === 'fmt ') {
        if (offset + 20 <= buffer.length) {
          byteRate = buffer.readUInt32LE(offset + 16);
        }
      } else if (chunkId === 'data') {
        dataSize = chunkSize;
        break;
      }

      offset += 8 + chunkSize;
      if (chunkSize % 2 !== 0) offset += 1; // Word align
    }

    if (byteRate > 0 && dataSize > 0) {
      const seconds = dataSize / byteRate;
      if (Number.isFinite(seconds) && seconds > 0) {
        return Math.round(seconds * 10) / 10;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Estimates audio duration based on file format and size in bytes.
 */
export function estimateAudioDuration(sizeBytes: number, mimeOrFormat: string): number {
  const lower = (mimeOrFormat || '').toLowerCase();
  let bytesPerSec = 16000; // default ~128 kbps (MP3 / AAC / M4A)
  if (lower.includes('wav')) {
    bytesPerSec = 176400; // 44.1 kHz 16-bit stereo PCM
  } else if (lower.includes('flac')) {
    bytesPerSec = 88200; // ~700 kbps lossless
  } else if (lower.includes('ogg') || lower.includes('opus')) {
    bytesPerSec = 20000; // 160 kbps Vorbis
  } else if (lower.includes('webm')) {
    bytesPerSec = 12000; // 96 kbps Opus
  } else if (lower.includes('mp4') || lower.includes('m4a') || lower.includes('aac')) {
    bytesPerSec = 16000; // 128 kbps AAC
  }
  const est = sizeBytes / bytesPerSec;
  return Math.max(1, Math.round(est * 10) / 10);
}

/**
 * Validates audio file preflight parameters, size constraints, header signatures,
 * and computes SHA-256 custody hash.
 */
export function validateAudioPreflight(
  filename: string,
  sizeBytes: number,
  declaredMimeType?: string,
  buffer?: Buffer,
  options?: {
    maxBytes?: number;
    durationSeconds?: number;
    verifyMagicBytes?: boolean;
  }
): PreflightValidationResult {
  // 1. Filename & Extension check
  if (!filename || filename.trim() === '') {
    return { valid: false, error: 'Filename is missing or empty' };
  }

  const dotIdx = filename.lastIndexOf('.');
  if (dotIdx === -1) {
    return {
      valid: false,
      error: `Filename '${filename}' lacks an extension. Permitted formats: WAV, MP3, FLAC, M4A, OGG, WebM, AAC.`,
    };
  }

  const ext = filename.substring(dotIdx).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported audio format '${ext}'. Permitted formats: WAV, MP3, FLAC, M4A, OGG, WebM, AAC.`,
    };
  }

  // 2. Size limit check
  if (sizeBytes <= 0) {
    return { valid: false, error: 'Audio file is empty (0 bytes)' };
  }

  const effectiveMaxBytes =
    options?.maxBytes ?? (process.env.MAX_UPLOAD_BYTES ? Number(process.env.MAX_UPLOAD_BYTES) : DEFAULT_MAX_BYTES);

  if (sizeBytes > effectiveMaxBytes) {
    return {
      valid: false,
      error: `File size (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${(effectiveMaxBytes / (1024 * 1024)).toFixed(0)}MB.`,
    };
  }

  // 3. Resolve MIME and format description
  const normalizedMime = (declaredMimeType || '').toLowerCase();
  let formatDesc = MIME_FORMAT_MAP[normalizedMime] || `${ext.replace('.', '').toUpperCase()} Audio Stream`;
  let resolvedMime = normalizedMime;

  let sha256Hash: string | undefined;
  let durationSeconds: number | undefined = options?.durationSeconds;
  let detectedFormat: string | undefined;

  // 4. Magic bytes validation & custody hash if buffer is provided
  if (buffer) {
    if (buffer.length === 0) {
      return { valid: false, error: 'Audio file buffer is empty (0 bytes)' };
    }

    const sig = detectAudioSignature(buffer);
    if (!sig.detected) {
      return {
        valid: false,
        error: 'File content does not match any recognized audio signature (invalid magic bytes).',
      };
    }

    detectedFormat = sig.format;
    if (sig.mimeType && (!resolvedMime || resolvedMime === 'application/octet-stream')) {
      resolvedMime = sig.mimeType;
    }
    if (sig.description && (!formatDesc || formatDesc.endsWith('Audio Stream'))) {
      formatDesc = sig.description;
    }

    sha256Hash = computeSha256(buffer);

    // Extract or estimate duration
    if (!durationSeconds || durationSeconds <= 0) {
      if (detectedFormat === 'wav' || ext === '.wav') {
        const wavDur = extractWavDuration(buffer);
        if (wavDur) durationSeconds = wavDur;
      }
      if (!durationSeconds) {
        durationSeconds = estimateAudioDuration(buffer.length, resolvedMime || ext);
      }
    }
  }

  return {
    valid: true,
    mimeType: resolvedMime || 'audio/wav',
    format: formatDesc,
    sha256Hash,
    durationSeconds,
    detectedFormat,
    sizeBytes,
  };
}

/**
 * Computes deterministic SHA-256 hash in hexadecimal over actual buffer bytes.
 */
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
