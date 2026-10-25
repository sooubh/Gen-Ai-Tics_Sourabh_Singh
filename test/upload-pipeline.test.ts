import { describe, it, expect, afterEach } from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { POST as uploadPost } from '../src/app/api/upload/route';
import {
  validateAudioPreflight,
  detectAudioSignature,
  computeSha256,
} from '../src/lib/audio/preflight';
import {
  savePrivateAudioFile,
  savePrivateAudioByHash,
  resolveSafeStoragePath,
  sanitizeFileName,
  deletePrivateAudioFile,
  getStorageBaseDir,
} from '../src/lib/storage/private-storage';

/**
 * Creates a valid PCM 16-bit WAV byte buffer with proper RIFF headers
 */
function createWavBuffer(sampleRate = 44100, channels = 1, durationSec = 1): Buffer {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * channels * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * 2, 28);
  buffer.writeUInt16LE(channels * 2, 32);
  buffer.writeUInt16LE(16, 34);

  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Fill with dummy audio sine-like bytes
  for (let i = 44; i < buffer.length; i++) {
    buffer[i] = (i * 7) % 256;
  }

  return buffer;
}

/**
 * Creates a valid ID3v2 tagged MP3 byte buffer
 */
function createMp3Buffer(): Buffer {
  const buf = Buffer.alloc(128);
  buf.write('ID3', 0);
  buf[3] = 0x03;
  buf[4] = 0x00;
  buf[5] = 0x00;
  buf[6] = 0x00;
  buf[7] = 0x00;
  buf[8] = 0x00;
  buf[9] = 0x76; // Tag size
  // Frame sync
  buf[10] = 0xff;
  buf[11] = 0xfb;
  buf[12] = 0x90;
  buf[13] = 0x64;
  return buf;
}

/**
 * Creates a valid Ogg container byte buffer
 */
function createOggBuffer(): Buffer {
  const buf = Buffer.alloc(64);
  buf.write('OggS', 0);
  buf[4] = 0x00;
  buf[5] = 0x02; // BOS
  return buf;
}

/**
 * Creates a valid FLAC byte buffer
 */
function createFlacBuffer(): Buffer {
  const buf = Buffer.alloc(64);
  buf.write('fLaC', 0);
  return buf;
}

describe('Independent Verification: Audio Upload Pipeline (Agent E)', () => {
  const cleanupFiles: string[] = [];

  afterEach(() => {
    for (const f of cleanupFiles) {
      try {
        deletePrivateAudioFile(f);
      } catch {}
    }
    cleanupFiles.length = 0;
  });

  describe('1. File Upload Validation & Enforcement', () => {
    it('rejects non-audio MIME types (application/pdf, image/png, text/plain, etc.)', async () => {
      const dummyBuffer = Buffer.from('%PDF-1.4 dummy pdf content');
      const formData = new FormData();
      const fakeFile = new File([new Uint8Array(dummyBuffer)], 'intercept.pdf', { type: 'application/pdf' });
      formData.append('audio', fakeFile);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.toLowerCase()).toContain('unsupported mime type');
    });

    it('rejects executable and script files regardless of declared MIME type', async () => {
      const exeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00binary payload');
      const formData = new FormData();
      const exeFile = new File([new Uint8Array(exeBuffer)], 'exploit.exe', { type: 'application/x-msdownload' });
      formData.append('audio', exeFile);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('rejects files with spoofed extensions that fail magic bytes validation (e.g. text file renamed to .wav)', async () => {
      const textBuffer = Buffer.from('This is a plain text file pretending to be WAV audio.');
      const formData = new FormData();
      const spoofedFile = new File([new Uint8Array(textBuffer)], 'fake_call.wav', { type: 'audio/wav' });
      formData.append('audio', spoofedFile);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.toLowerCase()).toContain('magic bytes');
    });

    it('rejects empty or zero-byte files (0 bytes)', async () => {
      const emptyBuffer = Buffer.alloc(0);
      const formData = new FormData();
      const emptyFile = new File([new Uint8Array(emptyBuffer)], 'silent.wav', { type: 'audio/wav' });
      formData.append('audio', emptyFile);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadPost(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.toLowerCase()).toContain('empty');
    });

    it('rejects files exceeding 100MB threshold', async () => {
      const oversizedBytes = 101 * 1024 * 1024; // 101 MB
      // Preflight validation check directly
      const preflightResult = validateAudioPreflight('heavy_evidence.wav', oversizedBytes, 'audio/wav', undefined, {
        maxBytes: 100 * 1024 * 1024,
      });

      expect(preflightResult.valid).toBe(false);
      expect(preflightResult.error?.toLowerCase()).toContain('exceeds maximum limit of 100mb');
    });

    it('approves compliant audio formats (WAV, MP3, FLAC, OGG)', () => {
      const wav = createWavBuffer(44100, 1, 1);
      const wavSig = detectAudioSignature(wav);
      expect(wavSig.detected).toBe(true);
      expect(wavSig.format).toBe('wav');

      const mp3 = createMp3Buffer();
      const mp3Sig = detectAudioSignature(mp3);
      expect(mp3Sig.detected).toBe(true);
      expect(mp3Sig.format).toBe('mp3');

      const flac = createFlacBuffer();
      const flacSig = detectAudioSignature(flac);
      expect(flacSig.detected).toBe(true);
      expect(flacSig.format).toBe('flac');

      const ogg = createOggBuffer();
      const oggSig = detectAudioSignature(ogg);
      expect(oggSig.detected).toBe(true);
      expect(oggSig.format).toBe('ogg');
    });
  });

  describe('2. Real SHA-256 Calculation Verification Against Known Byte Buffers', () => {
    it('computes exact cryptographic SHA-256 custody hash matching Node crypto standard', () => {
      // Known test vectors
      const testBuffer1 = Buffer.from('VECNAVERSE-CYBERCRIME-AUDIO-INTELLIGENCE-2026');
      const expectedSha1 = crypto.createHash('sha256').update(testBuffer1).digest('hex');
      const actualSha1 = computeSha256(testBuffer1);
      expect(actualSha1).toBe(expectedSha1);
      expect(actualSha1.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(actualSha1)).toBe(true);

      // Binary WAV buffer test vector
      const wav = createWavBuffer(44100, 1, 1);
      const expectedSha2 = crypto.createHash('sha256').update(wav).digest('hex');
      const actualSha2 = computeSha256(wav);
      expect(actualSha2).toBe(expectedSha2);
    });

    it('ensures SHA-256 hash is strictly tamper-evident: altering a single byte produces completely different hash', () => {
      const originalWav = createWavBuffer(44100, 1, 1);
      const tamperedWav = Buffer.from(originalWav);
      // Flip a single bit in sample data
      tamperedWav[50] = tamperedWav[50] ^ 0x01;

      const hashOriginal = computeSha256(originalWav);
      const hashTampered = computeSha256(tamperedWav);

      expect(hashOriginal).not.toBe(hashTampered);
    });

    it('verifies that /api/upload returns the genuine SHA-256 calculated from actual payload bytes', async () => {
      const wav = createWavBuffer(44100, 1, 1.5);
      const expectedHash = crypto.createHash('sha256').update(wav).digest('hex');

      const formData = new FormData();
      const file = new File([new Uint8Array(wav)], 'court_exhibit_intercept.wav', { type: 'audio/wav' });
      formData.append('audio', file);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await uploadPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.file.sha256Hash).toBe(expectedHash);
      cleanupFiles.push(json.file.storagePath);
    });
  });

  describe('3. Private Storage File Save & Path Traversal Defense', () => {
    it('saves audio files exclusively inside private storage directory outside public root', () => {
      const wav = createWavBuffer(44100, 1, 0.5);
      const hash = computeSha256(wav);

      const stored = savePrivateAudioByHash(wav, hash, '.wav');
      cleanupFiles.push(stored.storagePath);

      expect(stored.storagePath).toContain('uploads/audio/');
      expect(stored.storagePath.startsWith('public/')).toBe(false);
      expect(fs.existsSync(stored.absolutePath)).toBe(true);

      const baseDir = getStorageBaseDir();
      const relative = path.relative(baseDir, stored.absolutePath);
      expect(relative.startsWith('..')).toBe(false);
    });

    it('blocks directory traversal attacks using relative dot-dot sequences (../ and ..\\)', () => {
      const maliciousPaths = [
        '../../etc/passwd',
        '..\\..\\windows\\system32\\calc.exe',
        'uploads/audio/../../../secret.txt',
        '....//....//config.json',
        '/etc/shadow',
        'C:\\Windows\\System32\\cmd.exe',
      ];

      for (const attackPath of maliciousPaths) {
        expect(() => resolveSafeStoragePath(attackPath)).toThrow(/path traversal/i);
      }
    });

    it('blocks URL-encoded path traversal attacks (%2e%2e%2f and %2e%2e%5c)', () => {
      const encodedAttacks = [
        '%2e%2e%2fetc%2fpasswd',
        '%2e%2e%5cboot.ini',
        'uploads%2faudio%2f%2e%2e%2fcompromise.wav',
      ];

      for (const attack of encodedAttacks) {
        expect(() => resolveSafeStoragePath(attack)).toThrow(/path traversal/i);
      }
    });

    it('blocks null-byte injection attacks in storage paths', () => {
      const nullBytePaths = [
        'audio.wav\0.exe',
        'safe_file.wav\0../../etc/passwd',
      ];

      for (const p of nullBytePaths) {
        expect(() => resolveSafeStoragePath(p)).toThrow(/null byte/i);
      }
    });

    it('sanitizes unsafe filenames by removing directory paths and special characters', () => {
      expect(sanitizeFileName('../../exploit.wav')).toBe('exploit.wav');
      expect(sanitizeFileName('..\\..\\payload.mp3')).toBe('payload.mp3');
      expect(sanitizeFileName('call with spaces & special!@#$%.wav')).toBe('call_with_spaces___special_____.wav');
      expect(sanitizeFileName('')).toBe('unnamed_audio.wav');
      expect(sanitizeFileName('.')).toBe('unnamed_audio.wav');
      expect(sanitizeFileName('..')).toBe('unnamed_audio.wav');
    });

    it('verifies that physical file write matches exact buffer byte length on disk', () => {
      const wav = createWavBuffer(44100, 1, 1);
      const stored = savePrivateAudioFile(wav, 'integrity_test_evidence.wav');
      cleanupFiles.push(stored.storagePath);

      expect(fs.existsSync(stored.absolutePath)).toBe(true);
      const stat = fs.statSync(stored.absolutePath);
      expect(stat.size).toBe(wav.length);

      const readBack = fs.readFileSync(stored.absolutePath);
      expect(Buffer.compare(readBack, wav)).toBe(0);
    });

    it('safely deletes file and confirms deletion from disk', () => {
      const wav = createWavBuffer(44100, 1, 0.5);
      const stored = savePrivateAudioFile(wav, 'temp_to_delete.wav');
      expect(fs.existsSync(stored.absolutePath)).toBe(true);

      const deleted = deletePrivateAudioFile(stored.storagePath);
      expect(deleted).toBe(true);
      expect(fs.existsSync(stored.absolutePath)).toBe(false);
    });
  });
});
