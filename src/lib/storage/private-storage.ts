// ==============================================================================
// VECNAVERSE: Private Audio Storage Subsystem
// Enclave-isolated storage outside public directories with path-traversal defense
// and filesystem-verified deletion
// ==============================================================================

import fs from 'fs';
import path from 'path';
import os from 'os';

export const PRIVATE_STORAGE_REL_DIR = 'uploads/audio';

let _activeStorageBaseDir: string | null = null;

export function resetStorageBaseDir(): void {
  _activeStorageBaseDir = null;
}

/**
 * Returns the absolute path to the private audio storage root directory.
 * Automatically adapts to serverless environments (Vercel, AWS Lambda)
 * where process.cwd() is read-only (/var/task) and only os.tmpdir() (/tmp) is writable.
 */
export function getStorageBaseDir(): string {
  if (_activeStorageBaseDir) {
    return _activeStorageBaseDir;
  }

  // 1. Explicit env configuration
  if (process.env.UPLOAD_DIR) {
    _activeStorageBaseDir = path.resolve(process.env.UPLOAD_DIR);
    return _activeStorageBaseDir;
  }

  // 2. Serverless / Vercel detection (/var/task is read-only on AWS Lambda / Vercel)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    process.cwd().startsWith('/var/task');

  if (isServerless) {
    _activeStorageBaseDir = path.join(os.tmpdir(), 'uploads', 'audio');
    return _activeStorageBaseDir;
  }

  // 3. Local development fallback
  _activeStorageBaseDir = path.resolve(process.cwd(), 'uploads', 'audio');
  return _activeStorageBaseDir;
}

/**
 * Ensures the private audio storage directory exists on disk.
 * Falls back to os.tmpdir() if process.cwd() is read-only.
 */
export function ensureStorageDir(): string {
  let baseDir = getStorageBaseDir();
  try {
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    return baseDir;
  } catch (err: any) {
    // If mkdirSync failed on process.cwd() (e.g. read-only filesystem /var/task on Vercel),
    // automatically switch and fallback to os.tmpdir()
    const serverlessFallback = path.join(os.tmpdir(), 'uploads', 'audio');
    if (!fs.existsSync(serverlessFallback)) {
      fs.mkdirSync(serverlessFallback, { recursive: true });
    }
    _activeStorageBaseDir = serverlessFallback;
    return serverlessFallback;
  }
}

/**
 * Sanitizes a filename, stripping directory paths, null bytes, and unsafe characters.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== 'string') {
    return 'unnamed_audio.wav';
  }
  // Strip null bytes
  let safe = fileName.replace(/\0/g, '');
  // Normalize Windows backslashes so basename works consistently across platforms
  safe = safe.replace(/\\/g, '/');
  // Extract basename only
  safe = path.posix.basename(safe);
  // Keep alphanumeric, dash, underscore, dot
  safe = safe.replace(/[^a-zA-Z0-9._-]/g, '_');
  // Avoid hidden files or empty names
  if (!safe || safe === '.' || safe === '..') {
    safe = 'unnamed_audio.wav';
  }
  return safe;
}

/**
 * Resolves a file path or name strictly within the private storage root directory.
 * Throws an Error if path traversal is attempted or path points outside storage base.
 */
export function resolveSafeStoragePath(filePathOrName: string): string {
  if (!filePathOrName || typeof filePathOrName !== 'string') {
    throw new Error('Invalid file path: path must be a non-empty string');
  }

  // Reject null bytes
  if (filePathOrName.includes('\0')) {
    throw new Error('Path traversal attack detected: Null byte in path');
  }

  // Reject URL-encoded traversal patterns
  const lower = filePathOrName.toLowerCase();
  if (lower.includes('%2e') || lower.includes('%2f') || lower.includes('%5c')) {
    throw new Error('Path traversal attack detected: Encoded path traversal');
  }

  const baseDir = getStorageBaseDir();
  let cleaned = filePathOrName.trim();

  // If the path starts with /uploads/audio/ or uploads/audio/, treat it as relative to storage root
  const isUploadsAudioPrefix = /^[/\\]*(uploads[/\\]audio|audio)[/\\]/i.test(cleaned);
  cleaned = cleaned.replace(/^[/\\]*(uploads[/\\]audio[/\\]|audio[/\\])/i, '');

  let resolved: string;
  const isWindowsAbsolute = /^[a-zA-Z]:[/\\]/.test(filePathOrName);
  if (isWindowsAbsolute) {
    throw new Error(`Path traversal attack detected: Windows drive root in '${filePathOrName}'`);
  }

  if (path.isAbsolute(filePathOrName) && !isUploadsAudioPrefix) {
    resolved = path.resolve(filePathOrName);
  } else {
    // Treat as relative to baseDir
    cleaned = cleaned.replace(/^[/\\]+/, '');
    if (cleaned.includes('..')) {
      throw new Error(`Path traversal attack detected: Directory traversal sequence in '${filePathOrName}'`);
    }
    resolved = path.resolve(baseDir, cleaned);
  }

  // Enforce boundary check against base directory
  const normalizedBase = path.resolve(baseDir);
  const relative = path.relative(normalizedBase, resolved);

  // Must not start with .. and must not be an absolute path (which happens across drive roots on Windows)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path traversal attempt detected: Access denied for '${filePathOrName}'`);
  }

  return resolved;
}

/**
 * Verifies if a given path or filename is safely within the private audio storage root.
 */
export function isPathSafe(filePathOrName: string): boolean {
  try {
    resolveSafeStoragePath(filePathOrName);
    return true;
  } catch {
    return false;
  }
}

export interface StoredAudioFile {
  storagePath: string; // e.g., 'uploads/audio/hash.wav'
  absolutePath: string;
  sizeBytes: number;
  fileName: string;
}

/**
 * Saves an audio buffer to private storage under the specified sanitized file name.
 * Verifies that the file is physically written to disk and matches byte length.
 */
export function savePrivateAudioFile(buffer: Buffer, fileName: string): StoredAudioFile {
  ensureStorageDir();
  const safeName = sanitizeFileName(fileName);
  const targetPath = resolveSafeStoragePath(safeName);

  fs.writeFileSync(targetPath, buffer);

  // Filesystem write verification
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Storage failure: File was not written to disk at ${targetPath}`);
  }
  const stat = fs.statSync(targetPath);
  if (stat.size !== buffer.length) {
    throw new Error(`Storage failure: Written size (${stat.size}) does not match buffer size (${buffer.length})`);
  }

  return {
    storagePath: `${PRIVATE_STORAGE_REL_DIR}/${safeName}`,
    absolutePath: targetPath,
    sizeBytes: stat.size,
    fileName: safeName,
  };
}

/**
 * Saves an audio buffer named deterministically by its SHA-256 hash and extension.
 */
export function savePrivateAudioByHash(
  buffer: Buffer,
  sha256Hash: string,
  extension: string
): StoredAudioFile {
  const cleanExt = extension.startsWith('.') ? extension.toLowerCase() : `.${extension.toLowerCase()}`;
  const safeHash = sha256Hash.replace(/[^a-f0-9]/gi, '');
  const fileName = `${safeHash}${cleanExt}`;
  return savePrivateAudioFile(buffer, fileName);
}

/**
 * Deletes a private audio file from disk, verifying with the filesystem that
 * the file is actually unlinked and no longer exists before returning success.
 */
export function deletePrivateAudioFile(filePathOrName: string): boolean {
  if (!filePathOrName || filePathOrName.trim() === '') {
    return false;
  }

  try {
    const targetPath = resolveSafeStoragePath(filePathOrName);
    const baseDir = getStorageBaseDir();

    // Prevent deletion of base directory itself
    if (path.resolve(targetPath) === path.resolve(baseDir)) {
      return false;
    }

    if (!fs.existsSync(targetPath)) {
      // File already gone -> verified deleted
      return true;
    }

    fs.unlinkSync(targetPath);

    // CRITICAL: Actually verify against filesystem that the file was deleted
    const stillExists = fs.existsSync(targetPath);
    if (stillExists) {
      console.error(`[PrivateStorage] Deletion verification failed: file still exists on disk at ${targetPath}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[PrivateStorage] Deletion failed for '${filePathOrName}':`, error);
    return false;
  }
}

/**
 * Asynchronously deletes a private audio file, verifying against the filesystem
 * before resolving true.
 */
export async function deletePrivateAudioFileAsync(filePathOrName: string): Promise<boolean> {
  if (!filePathOrName || filePathOrName.trim() === '') {
    return false;
  }

  try {
    const targetPath = resolveSafeStoragePath(filePathOrName);
    const baseDir = getStorageBaseDir();

    if (path.resolve(targetPath) === path.resolve(baseDir)) {
      return false;
    }

    try {
      await fs.promises.access(targetPath);
    } catch {
      // File does not exist -> verified deleted
      return true;
    }

    await fs.promises.unlink(targetPath);

    // CRITICAL: Actually verify against filesystem
    try {
      await fs.promises.access(targetPath);
      // If access succeeds, file still exists!
      console.error(`[PrivateStorage] Async deletion verification failed: file still exists at ${targetPath}`);
      return false;
    } catch {
      // Access failed -> successfully deleted
      return true;
    }
  } catch (error) {
    console.error(`[PrivateStorage] Async deletion failed for '${filePathOrName}':`, error);
    return false;
  }
}

/**
 * Reads a private audio file from disk if it exists.
 */
export function readPrivateAudioFile(filePathOrName: string): Buffer | null {
  try {
    const targetPath = resolveSafeStoragePath(filePathOrName);
    if (!fs.existsSync(targetPath)) {
      return null;
    }
    return fs.readFileSync(targetPath);
  } catch (error) {
    console.error(`[PrivateStorage] Failed to read file '${filePathOrName}':`, error);
    return null;
  }
}

/**
 * Checks if a private audio file exists in storage.
 */
export function hasPrivateAudioFile(filePathOrName: string): boolean {
  try {
    const targetPath = resolveSafeStoragePath(filePathOrName);
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

/**
 * Gets file stats for a private audio file.
 */
export function getPrivateAudioStats(filePathOrName: string): fs.Stats | null {
  try {
    const targetPath = resolveSafeStoragePath(filePathOrName);
    if (!fs.existsSync(targetPath)) {
      return null;
    }
    return fs.statSync(targetPath);
  } catch {
    return null;
  }
}
