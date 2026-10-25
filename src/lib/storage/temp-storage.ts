/**
 * VECNAVERSE: Temporary Audio Storage Enclave
 *
 * Implements ephemeral on-disk audio storage for live audio chunk processing
 * and transient voice emotion analysis with guaranteed automatic cleanup.
 *
 * Security & Privacy Rules:
 * - Temporary files are stored isolated outside public directories.
 * - Files are automatically cleaned up in `finally` blocks.
 * - Raw audio bytes, tokens, and API credentials are NEVER written to logs.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

/**
 * Returns the directory for temporary audio files.
 * Uses dedicated folder under OS tmpdir with fallback to uploads/temp.
 */
export function getTempAudioDir(): string {
  const dir = path.join(os.tmpdir(), 'vecnaverse-temp-audio');
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    } catch {
      // Fallback to local cwd uploads/temp
      const localDir = path.resolve(process.cwd(), 'uploads', 'temp');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true, mode: 0o700 });
      }
      return localDir;
    }
  }
  return dir;
}

export interface TempAudioHandle {
  filePath: string;
  fileName: string;
  sizeBytes: number;
  cleanup: () => void;
}

/**
 * Creates an ephemeral audio file from a Buffer.
 * Returns file handle with synchronous cleanup function.
 */
export function createTempAudioFile(
  buffer: Buffer,
  extension: string = '.wav'
): TempAudioHandle {
  if (!buffer || buffer.length === 0) {
    throw new Error('Cannot create temporary audio file from empty buffer');
  }

  const cleanExt = extension.startsWith('.') ? extension : `.${extension}`;
  const dir = getTempAudioDir();
  const fileHash = crypto.randomBytes(16).toString('hex');
  const fileName = `temp_audio_${Date.now()}_${fileHash}${cleanExt}`;
  const filePath = path.join(dir, fileName);

  fs.writeFileSync(filePath, buffer, { mode: 0o600 });

  let cleaned = false;
  const cleanup = () => {
    if (!cleaned) {
      cleaned = true;
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err: any) {
        // Redact path details in logs
        console.warn(`[TempStorage] Warning: Failed to unlink temporary file: ${err?.code || 'IO_ERROR'}`);
      }
    }
  };

  return {
    filePath,
    fileName,
    sizeBytes: buffer.length,
    cleanup,
  };
}

/**
 * Executes a function with an ephemeral audio file, guaranteeing unlinking in a finally block.
 */
export async function withTempAudioFile<T>(
  buffer: Buffer,
  fn: (tempPath: string, handle: TempAudioHandle) => Promise<T>,
  extension: string = '.wav'
): Promise<T> {
  const handle = createTempAudioFile(buffer, extension);
  try {
    return await fn(handle.filePath, handle);
  } finally {
    handle.cleanup();
  }
}

/**
 * Purges all stale temporary audio files older than maxAgeMs (default: 30 minutes).
 */
export function purgeStaleTempAudioFiles(maxAgeMs: number = 30 * 60 * 1000): number {
  const dir = getTempAudioDir();
  let count = 0;
  try {
    if (!fs.existsSync(dir)) return 0;
    const entries = fs.readdirSync(dir);
    const now = Date.now();
    for (const entry of entries) {
      const full = path.join(dir, entry);
      try {
        const stats = fs.statSync(full);
        if (stats.isFile() && now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(full);
          count++;
        }
      } catch {
        // Ignore single file errors
      }
    }
  } catch {
    // Ignore directory scan error
  }
  return count;
}
