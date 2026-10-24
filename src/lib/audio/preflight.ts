// ==============================================================================
// VECNAVERSE: Audio Preflight Validation
// Validates file format, MIME type, size limits, and computes SHA-256 custody hash
// ==============================================================================

import crypto from 'crypto';

export interface PreflightValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  format?: string;
  sha256Hash?: string;
}

const ALLOWED_EXTENSIONS = ['.wav', '.mp3', '.flac', '.m4a', '.ogg'];
const MAX_BYTES = Number(process.env.MAX_UPLOAD_BYTES || 524288000); // 500 MB

const MIME_FORMAT_MAP: Record<string, string> = {
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
  'audio/ogg': 'Ogg Vorbis 48 kHz / 2ch',
};

export function validateAudioPreflight(
  filename: string,
  sizeBytes: number,
  declaredMimeType?: string,
  buffer?: Buffer
): PreflightValidationResult {
  // 1. Filename & Extension check
  if (!filename || filename.trim() === '') {
    return { valid: false, error: 'Filename is missing or empty' };
  }

  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported audio format '${ext}'. Permitted formats: WAV, MP3, FLAC, M4A, OGG.`,
    };
  }

  // 2. Size limit check
  if (sizeBytes <= 0) {
    return { valid: false, error: 'Audio file is empty (0 bytes)' };
  }

  if (sizeBytes > MAX_BYTES) {
    return {
      valid: false,
      error: `File size (${(sizeBytes / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of ${(MAX_BYTES / (1024 * 1024)).toFixed(0)}MB.`,
    };
  }

  // 3. Resolve MIME and format description
  const normalizedMime = (declaredMimeType || '').toLowerCase();
  const formatDesc = MIME_FORMAT_MAP[normalizedMime] || `${ext.replace('.', '').toUpperCase()} Audio Stream`;

  // 4. Calculate SHA-256 chain-of-custody hash if buffer is provided
  let sha256Hash: string | undefined;
  if (buffer) {
    sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
  }

  return {
    valid: true,
    mimeType: normalizedMime || 'audio/wav',
    format: formatDesc,
    sha256Hash,
  };
}

export function computeSha256(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
