import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import {
  getStorageBaseDir,
  ensureStorageDir,
  resetStorageBaseDir,
  sanitizeFileName,
  resolveSafeStoragePath,
  isPathSafe,
  savePrivateAudioFile,
  savePrivateAudioByHash,
  deletePrivateAudioFile,
  deletePrivateAudioFileAsync,
  readPrivateAudioFile,
  hasPrivateAudioFile,
  getPrivateAudioStats,
} from '../src/lib/storage/private-storage';

describe('Private Audio Storage Isolation & Verification Suite', () => {
  const testFilesToClean: string[] = [];

  beforeEach(() => {
    ensureStorageDir();
  });

  afterEach(() => {
    // Cleanup any test files
    for (const file of testFilesToClean) {
      try {
        deletePrivateAudioFile(file);
      } catch {}
    }
    testFilesToClean.length = 0;
  });

  describe('Storage Directory & Path Traversal Protections', () => {
    it('locates storage in private uploads/audio directory outside public', () => {
      const baseDir = getStorageBaseDir();
      expect(baseDir).toContain('uploads');
      expect(baseDir).toContain('audio');
      expect(baseDir).not.toContain('public');
      expect(fs.existsSync(baseDir)).toBe(true);
    });

    it('sanitizes unsafe filenames and rejects directory traversal components', () => {
      expect(sanitizeFileName('../../etc/shadow.wav')).toBe('shadow.wav');
      expect(sanitizeFileName('..\\..\\windows\\system32.dll')).toBe('system32.dll');
      expect(sanitizeFileName('call-recording #1 (urgent!).wav')).toBe('call-recording__1__urgent__.wav');
      expect(sanitizeFileName('file\0withnull.mp3')).toBe('filewithnull.mp3');
      expect(sanitizeFileName('')).toBe('unnamed_audio.wav');
    });

    it('throws on path traversal attacks when resolving paths', () => {
      expect(() => resolveSafeStoragePath('../../secret.txt')).toThrow(/path traversal/i);
      expect(() => resolveSafeStoragePath('..\\..\\windows\\win.ini')).toThrow(/path traversal/i);
      expect(() => resolveSafeStoragePath('uploads/audio/../../etc/passwd')).toThrow(/path traversal/i);
      expect(() => resolveSafeStoragePath('test\0null.wav')).toThrow(/null byte/i);
      expect(() => resolveSafeStoragePath('%2e%2e%2fsecret.wav')).toThrow(/path traversal/i);
    });

    it('correctly validates safe paths inside storage root', () => {
      expect(isPathSafe('valid-intercept.wav')).toBe(true);
      expect(isPathSafe('uploads/audio/valid-intercept.wav')).toBe(true);
      expect(isPathSafe('/uploads/audio/valid-intercept.wav')).toBe(true);
      expect(isPathSafe('../../outside.wav')).toBe(false);
      expect(isPathSafe('sub/../../outside.wav')).toBe(false);
    });

    it('adapts to Vercel and serverless read-only filesystem by using os.tmpdir()', () => {
      const origVercel = process.env.VERCEL;
      try {
        process.env.VERCEL = '1';
        resetStorageBaseDir();
        const baseDir = getStorageBaseDir();
        expect(baseDir).toContain('uploads');
        expect(baseDir).toContain('audio');
        expect(baseDir.startsWith(os.tmpdir())).toBe(true);
        const ensured = ensureStorageDir();
        expect(fs.existsSync(ensured)).toBe(true);
      } finally {
        if (origVercel !== undefined) {
          process.env.VERCEL = origVercel;
        } else {
          delete process.env.VERCEL;
        }
        resetStorageBaseDir();
      }
    });
  });

  describe('Storage File Operations', () => {
    it('saves audio buffer securely and verifies file exists on disk', () => {
      const dummyBuffer = Buffer.from('RIFF$---WAVEfmt ----------------data----');
      const saved = savePrivateAudioFile(dummyBuffer, 'test_evidence_1.wav');
      testFilesToClean.push(saved.fileName);

      expect(saved.storagePath).toBe('uploads/audio/test_evidence_1.wav');
      expect(fs.existsSync(saved.absolutePath)).toBe(true);
      expect(saved.sizeBytes).toBe(dummyBuffer.length);

      const readBack = readPrivateAudioFile(saved.fileName);
      expect(readBack).toBeDefined();
      expect(readBack?.toString('ascii')).toBe(dummyBuffer.toString('ascii'));
    });

    it('saves audio deterministically by SHA-256 hash', () => {
      const dummyBuffer = Buffer.from('RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00data\x04\x00\x00\x00TEST');
      const hash = crypto.createHash('sha256').update(dummyBuffer).digest('hex');

      const saved = savePrivateAudioByHash(dummyBuffer, hash, '.wav');
      testFilesToClean.push(saved.fileName);

      expect(saved.fileName).toBe(`${hash}.wav`);
      expect(saved.storagePath).toBe(`uploads/audio/${hash}.wav`);
      expect(hasPrivateAudioFile(saved.fileName)).toBe(true);

      const stats = getPrivateAudioStats(saved.fileName);
      expect(stats).not.toBeNull();
      expect(stats?.size).toBe(dummyBuffer.length);
    });
  });

  describe('Verified Deletion Against Filesystem', () => {
    it('synchronously deletes file and verifies non-existence on disk', () => {
      const dummyBuffer = Buffer.from('RIFF....WAVEfmt ....data....');
      const saved = savePrivateAudioFile(dummyBuffer, 'to_be_deleted.wav');
      expect(fs.existsSync(saved.absolutePath)).toBe(true);

      // Delete and verify return
      const deleted = deletePrivateAudioFile(saved.storagePath);
      expect(deleted).toBe(true);

      // Verify physical absence from filesystem
      expect(fs.existsSync(saved.absolutePath)).toBe(false);
      expect(hasPrivateAudioFile(saved.storagePath)).toBe(false);

      // Idempotent retry should succeed without error
      const retryDelete = deletePrivateAudioFile(saved.storagePath);
      expect(retryDelete).toBe(true);
    });

    it('asynchronously deletes file and verifies non-existence on disk', async () => {
      const dummyBuffer = Buffer.from('RIFF....WAVEfmt ....data....');
      const saved = savePrivateAudioFile(dummyBuffer, 'to_be_deleted_async.wav');
      expect(fs.existsSync(saved.absolutePath)).toBe(true);

      const deleted = await deletePrivateAudioFileAsync(saved.storagePath);
      expect(deleted).toBe(true);

      expect(fs.existsSync(saved.absolutePath)).toBe(false);
    });

    it('refuses to delete the root storage directory', () => {
      const baseDir = getStorageBaseDir();
      const result = deletePrivateAudioFile(baseDir);
      expect(result).toBe(false);
      expect(fs.existsSync(baseDir)).toBe(true);
    });
  });
});
