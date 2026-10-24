import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { POST, GET } from '../src/app/api/upload/route';
import { store } from '../src/lib/data/store';
import { deletePrivateAudioFile, getStorageBaseDir } from '../src/lib/storage/private-storage';

function createValidWavBuffer(sampleRate = 44100, channels = 1, durationSec = 2): Buffer {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * channels * 2; // 16-bit PCM = 2 bytes per sample
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(channels, 22); // NumChannels
  buffer.writeUInt32LE(sampleRate, 24); // SampleRate
  buffer.writeUInt32LE(sampleRate * channels * 2, 28); // ByteRate
  buffer.writeUInt16LE(channels * 2, 32); // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

function createValidMp3Buffer(): Buffer {
  const buf = Buffer.alloc(64);
  buf.write('ID3', 0);
  buf[3] = 0x03;
  buf[4] = 0x00;
  buf[5] = 0x00;
  buf[6] = 0x00;
  buf[7] = 0x00;
  buf[8] = 0x00;
  buf[9] = 0x0a;
  buf[10] = 0xff;
  buf[11] = 0xfb;
  buf[12] = 0x90;
  buf[13] = 0x64;
  return buf;
}

describe('POST & GET /api/upload Endpoint Suite', () => {
  const uploadedFilesToCleanup: string[] = [];

  afterEach(() => {
    for (const file of uploadedFilesToCleanup) {
      try {
        deletePrivateAudioFile(file);
      } catch {}
    }
    uploadedFilesToCleanup.length = 0;
  });

  describe('Valid Uploads', () => {
    it('accepts valid WAV audio, computes genuine SHA-256 hash, and saves to private storage', async () => {
      const wavBuffer = createValidWavBuffer(44100, 1, 2.5);
      const expectedHash = crypto.createHash('sha256').update(wavBuffer).digest('hex');

      const formData = new FormData();
      const file = new File([new Uint8Array(wavBuffer)], 'emergency_call_intercept.wav', { type: 'audio/wav' });
      formData.append('audio', file);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.file).toBeDefined();
      expect(json.file.fileName).toBe('emergency_call_intercept.wav');
      expect(json.file.fileSize).toBe(wavBuffer.length);
      expect(json.file.mimeType).toBe('audio/wav');
      expect(json.file.sha256Hash).toBe(expectedHash);
      expect(json.file.durationSeconds).toBe(2.5);
      expect(json.file.storagePath).toBe(`uploads/audio/${expectedHash}.wav`);

      uploadedFilesToCleanup.push(json.file.storagePath);

      // Verify file physically exists in private storage
      const physicalPath = path.join(getStorageBaseDir(), `${expectedHash}.wav`);
      expect(fs.existsSync(physicalPath)).toBe(true);

      const savedBytes = fs.readFileSync(physicalPath);
      const verifyHash = crypto.createHash('sha256').update(savedBytes).digest('hex');
      expect(verifyHash).toBe(expectedHash);
    });

    it('accepts file uploaded via "file" form field', async () => {
      const wavBuffer = createValidWavBuffer(22050, 1, 1.0);
      const expectedHash = crypto.createHash('sha256').update(wavBuffer).digest('hex');

      const formData = new FormData();
      const file = new File([new Uint8Array(wavBuffer)], 'dispatch_radio.wav', { type: 'audio/wav' });
      formData.append('file', file);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.file.sha256Hash).toBe(expectedHash);
      uploadedFilesToCleanup.push(json.file.storagePath);
    });

    it('accepts valid MP3 audio with ID3 signature', async () => {
      const mp3Buffer = createValidMp3Buffer();
      const expectedHash = crypto.createHash('sha256').update(mp3Buffer).digest('hex');

      const formData = new FormData();
      const file = new File([new Uint8Array(mp3Buffer)], 'wiretap_audio.mp3', { type: 'audio/mpeg' });
      formData.append('audio', file);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.file.mimeType).toBe('audio/mpeg');
      expect(json.file.sha256Hash).toBe(expectedHash);
      uploadedFilesToCleanup.push(json.file.storagePath);
    });

    it('attaches uploaded audio metadata to case when caseId is supplied', async () => {
      const testCase = store.createCase({
        title: 'Upload Link Test Case',
        description: 'Testing audio upload attachment',
        callerCategory: 'distressed_victim',
      });

      const wavBuffer = createValidWavBuffer(44100, 1, 3.0);
      const formData = new FormData();
      const file = new File([new Uint8Array(wavBuffer)], 'victim_statement.wav', { type: 'audio/wav' });
      formData.append('audio', file);
      formData.append('caseId', testCase.id);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      uploadedFilesToCleanup.push(json.file.storagePath);

      const updatedCase = store.getCaseById(testCase.id);
      expect(updatedCase?.audioMetadata).toBeDefined();
      expect(updatedCase?.audioMetadata?.filename).toBe('victim_statement.wav');
      expect(updatedCase?.audioMetadata?.sha256Hash).toBe(json.file.sha256Hash);
      expect(updatedCase?.audioMetadata?.storagePath).toBe(json.file.storagePath);
    });
  });

  describe('Upload Validations & Rejections', () => {
    it('rejects request with missing audio file field', async () => {
      const formData = new FormData();
      formData.append('note', 'Missing audio payload');

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('No audio file provided');
    });

    it('rejects empty (0 byte) file', async () => {
      const emptyBuffer = Buffer.alloc(0);
      const formData = new FormData();
      const file = new File([emptyBuffer], 'silent.wav', { type: 'audio/wav' });
      formData.append('audio', file);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('empty (0 bytes)');
    });

    it('rejects non-audio file pretending to be WAV (magic byte validation)', async () => {
      const fakeWav = Buffer.from('<?php echo "This is not an audio file"; ?>');
      const formData = new FormData();
      const file = new File([fakeWav], 'exploit.wav', { type: 'audio/wav' });
      formData.append('audio', file);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toMatch(/magic bytes/i);
    });

    it('rejects non-audio MIME types (e.g. image/png)', async () => {
      const dummyBuffer = Buffer.from('\x89PNG\r\n\x1a\n');
      const formData = new FormData();
      const file = new File([dummyBuffer], 'screenshot.png', { type: 'image/png' });
      formData.append('audio', file);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Unsupported MIME type');
    });

    it('rejects files exceeding 100MB ceiling', async () => {
      // Create actual 101MB payload
      const oversizedData = new Uint8Array(101 * 1024 * 1024);
      const file = new File([oversizedData], 'massive.wav', { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', file);

      const req = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('exceeds maximum limit of 100MB');
    });
  });

  describe('GET /api/upload File Streaming & Path Traversal Protections', () => {
    it('serves stored audio file with proper audio content-type header', async () => {
      const wavBuffer = createValidWavBuffer(44100, 1, 1.0);
      const formData = new FormData();
      formData.append('audio', new File([new Uint8Array(wavBuffer)], 'stream_test.wav', { type: 'audio/wav' }));

      const postReq = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const postRes = await POST(postReq);
      const postData = await postRes.json();
      uploadedFilesToCleanup.push(postData.file.storagePath);

      const getReq = new NextRequest(`http://localhost:3000/api/upload?path=${postData.file.storagePath}`);
      const getRes = await GET(getReq);

      expect(getRes.status).toBe(200);
      expect(getRes.headers.get('content-type')).toBe('audio/wav');
      expect(getRes.headers.get('accept-ranges')).toBe('bytes');
      expect(getRes.headers.get('cache-control')).toBe('private, no-cache');
      const bodyBytes = Buffer.from(await getRes.arrayBuffer());
      expect(bodyBytes.length).toBe(wavBuffer.length);
    });

    it('handles HTTP Range requests returning 206 Partial Content for audio scrubbing', async () => {
      const wavBuffer = createValidWavBuffer(44100, 1, 1.0);
      const formData = new FormData();
      formData.append('audio', new File([new Uint8Array(wavBuffer)], 'range_test.wav', { type: 'audio/wav' }));

      const postReq = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const postRes = await POST(postReq);
      const postData = await postRes.json();
      uploadedFilesToCleanup.push(postData.file.storagePath);

      // Request initial chunk: first 500 bytes (0-499)
      const rangeReq = new NextRequest(`http://localhost:3000/api/upload?path=${postData.file.storagePath}`, {
        headers: { Range: 'bytes=0-499' },
      });
      const rangeRes = await GET(rangeReq);

      expect(rangeRes.status).toBe(206);
      expect(rangeRes.headers.get('content-range')).toBe(`bytes 0-499/${wavBuffer.length}`);
      expect(rangeRes.headers.get('content-length')).toBe('500');
      expect(rangeRes.headers.get('accept-ranges')).toBe('bytes');

      const chunkBytes = Buffer.from(await rangeRes.arrayBuffer());
      expect(chunkBytes.length).toBe(500);
      expect(chunkBytes.equals(wavBuffer.subarray(0, 500))).toBe(true);

      // Request middle-to-end chunk: bytes=1000-
      const tailReq = new NextRequest(`http://localhost:3000/api/upload?path=${postData.file.storagePath}`, {
        headers: { Range: 'bytes=1000-' },
      });
      const tailRes = await GET(tailReq);

      expect(tailRes.status).toBe(206);
      expect(tailRes.headers.get('content-range')).toBe(`bytes 1000-${wavBuffer.length - 1}/${wavBuffer.length}`);
      const tailBytes = Buffer.from(await tailRes.arrayBuffer());
      expect(tailBytes.length).toBe(wavBuffer.length - 1000);
      expect(tailBytes.equals(wavBuffer.subarray(1000))).toBe(true);
    });

    it('returns HTTP 416 Range Not Satisfiable for out-of-bounds ranges', async () => {
      const wavBuffer = createValidWavBuffer(44100, 1, 0.5);
      const formData = new FormData();
      formData.append('audio', new File([new Uint8Array(wavBuffer)], 'range_oob.wav', { type: 'audio/wav' }));

      const postReq = new NextRequest('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const postRes = await POST(postReq);
      const postData = await postRes.json();
      uploadedFilesToCleanup.push(postData.file.storagePath);

      const invalidRangeReq = new NextRequest(`http://localhost:3000/api/upload?path=${postData.file.storagePath}`, {
        headers: { Range: 'bytes=9999999-10000000' },
      });
      const invalidRangeRes = await GET(invalidRangeReq);

      expect(invalidRangeRes.status).toBe(416);
      expect(invalidRangeRes.headers.get('content-range')).toBe(`bytes */${wavBuffer.length}`);
    });

    it('returns 404 for non-existent file query', async () => {
      const getReq = new NextRequest('http://localhost:3000/api/upload?file=non_existent_12345.wav');
      const getRes = await GET(getReq);
      expect(getRes.status).toBe(404);
    });

    it('returns 400 when attempting path traversal attack on GET', async () => {
      const getReq1 = new NextRequest('http://localhost:3000/api/upload?file=../../package.json');
      const getRes1 = await GET(getReq1);
      expect(getRes1.status).toBe(400);

      const getReq2 = new NextRequest('http://localhost:3000/api/upload?path=..%2f..%2fsecret.txt');
      const getRes2 = await GET(getReq2);
      expect(getRes2.status).toBe(400);

      const getReq3 = new NextRequest('http://localhost:3000/api/upload?file=test%00.wav');
      const getRes3 = await GET(getReq3);
      expect(getRes3.status).toBe(400);
    });
  });
});
