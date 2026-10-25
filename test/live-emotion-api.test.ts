/**
 * VECNAVERSE: Live Audio Speech Emotion Recognition (SER) API Test Suite
 * Test File: test/live-emotion-api.test.ts
 *
 * Verifies Component 3 of the implementation plan:
 * 1. Live microphone/phone streaming chunk ingestion and 6-emotion response.
 * 2. Ingestion modes: multipart/form-data ('audio'/'slice'), JSON base64, raw stream.
 * 3. Strict 6-emotion detection: anger, sadness, fear, happiness, stress, neutral.
 * 4. Structured JSON output with timestamps, transcript, primary/secondary emotions, vocal cues, uncertainty indicators.
 * 5. Model adherence: 'gemini-3.8-live'.
 * 6. Rejection of invalid files (empty 0-byte, corrupt magic bytes, excessive size >25MB).
 * 7. API failure handling: missing key (500), quota limits (429), upstream errors (500/502).
 * 8. Rate limiting (429 Too Many Requests) and cancellation via AbortSignal (499).
 * 9. Cost guardrail enforcement (live max continuous duration >600s/900s rejected with 400).
 * 10. Ephemeral temp storage cleanup guarantee (unlinked in finally block).
 * 11. Authentication enforcement (401 on expired/missing credentials).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { POST } from '../src/app/api/live/emotion/route';
import { reset as resetRateLimits } from '../src/lib/ai/rate-limiter';
import { getTempAudioDir } from '../src/lib/storage/temp-storage';
import { GeminiAudioAdapter, GeminiRateLimitError, GeminiResponseValidationError, GeminiError } from '../src/lib/ai/gemini-adapter';
import {
  TARGET_EMOTIONS,
  TargetEmotion,
  LiveEmotionResponseSchema,
} from '../src/lib/ai/emotion-schemas';

function createValidWavBuffer(sampleRate = 16000, channels = 1, durationSec = 2): Buffer {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples * channels * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt subchunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * 2, 28);
  buffer.writeUInt16LE(channels * 2, 32);
  buffer.writeUInt16LE(16, 34);

  // data subchunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

function createValidWebmBuffer(): Buffer {
  const buf = Buffer.alloc(256);
  // EBML header: 0x1A 0x45 0xDF 0xA3
  buf[0] = 0x1a;
  buf[1] = 0x45;
  buf[2] = 0xdf;
  buf[3] = 0xa3;
  return buf;
}

function createCorruptBuffer(): Buffer {
  return Buffer.from('NOT_AN_AUDIO_CHUNK_CORRUPT_BYTES_RAW_DATA_12345');
}

describe('Live Streaming Audio Emotion API (/api/live/emotion)', () => {
  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    resetRateLimits();
    process.env.GEMINI_API_KEY = 'test-gemini-live-key';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  describe('1. Live Microphone / Phone Streaming Chunk Ingestion & 6-Emotion Response', () => {
    it('ingests live audio chunk via multipart/form-data and outputs validated 6-emotion JSON using gemini-3.8-live', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const blob = new Blob([new Uint8Array(wavBuffer)], { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', blob, 'mic-slice.wav');
      formData.append('durationSeconds', '2');

      const mockLiveAnalysis = {
        session_id: 'live-session-mic-01',
        overall: {
          primary_emotion: 'stress' as TargetEmotion,
          secondary_emotion: 'fear' as TargetEmotion,
          urgency_score: 82,
          urgency_level: 'critical' as const,
          emotion_scores: {
            anger: 0.1,
            sadness: 0.2,
            fear: 0.75,
            happiness: 0.05,
            stress: 0.88,
            neutral: 0.1,
          },
          dominant_cues: [
            {
              cue_type: 'vocal_tremor',
              description: 'Micro-tremor amplitude modulation detected in live phonation path',
              severity: 'high' as const,
              timestamp_ms: 600,
            },
          ],
          uncertainty: {
            confidence_score: 0.92,
            audio_quality: 'clear' as const,
            ambiguity_detected: false,
            caveats: ['Real-time streaming inference advisory.'],
          },
        },
        segments: [
          {
            segment_id: 'seg-live-1',
            start_ms: 0,
            end_ms: 2000,
            start_time_seconds: 0,
            end_time_seconds: 2.0,
            transcript: 'They are threatening to freeze all my accounts right now.',
            speaker_label: 'CALLER',
            primary_emotion: 'stress' as TargetEmotion,
            secondary_emotion: 'fear' as TargetEmotion,
            emotion_scores: {
              anger: 0.1,
              sadness: 0.2,
              fear: 0.75,
              happiness: 0.05,
              stress: 0.88,
              neutral: 0.1,
            },
            vocal_cues: [
              {
                cue_type: 'rapid_speech',
                description: 'Accelerated phonation rate under duress',
                severity: 'high' as const,
                timestamp_ms: 500,
              },
            ],
            uncertainty: {
              confidence_score: 0.92,
              audio_quality: 'clear' as const,
              ambiguity_detected: false,
              caveats: [],
            },
          },
        ],
        metadata: {
          model_id: 'gemini-3.8-live',
          duration_seconds: 2.0,
          processed_at: new Date().toISOString(),
          cost_estimate_usd: 0.000133,
          audio_format: 'audio/wav',
          is_live_stream: true,
        },
      };

      const spy = vi
        .spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion')
        .mockResolvedValueOnce(mockLiveAnalysis);

      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);

      // Verify strict 6 target emotions presence
      TARGET_EMOTIONS.forEach((emotion) => {
        expect(data.emotions).toHaveProperty(emotion);
        expect(typeof data.emotions[emotion]).toBe('number');
        expect(data.emotions[emotion]).toBeGreaterThanOrEqual(0);
        expect(data.emotions[emotion]).toBeLessThanOrEqual(1);
      });

      // Verify primary and secondary emotions
      expect(data.primaryEmotion).toBe('stress');
      expect(data.secondaryEmotion).toBe('fear');
      expect(TARGET_EMOTIONS).toContain(data.primaryEmotion);
      expect(TARGET_EMOTIONS).toContain(data.secondaryEmotion);

      // Verify timestamps, transcript, and cues
      expect(data.timestamps).toBeDefined();
      expect(data.timestamps.duration_ms).toBe(2000);
      expect(data.transcript).toContain('threatening to freeze');
      expect(data.vocalCues.length).toBeGreaterThan(0);
      expect(data.uncertainty).toBeDefined();
      expect(data.uncertainty.confidence_score).toBe(0.92);

      // Verify model adherence strictly to 'gemini-3.8-live'
      expect(data.model).toBe('gemini-3.8-live');
      expect(spy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          forceModel: 'gemini-3.8-live',
        })
      );

      // Validate against LiveEmotionResponseSchema
      const validated = LiveEmotionResponseSchema.safeParse(data);
      expect(validated.success).toBe(true);
    });

    it('ingests live audio chunk via "slice" form field (LiveMonitorView compatibility)', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const blob = new Blob([new Uint8Array(wavBuffer)], { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('slice', blob, 'slice.wav');

      const mockLiveAnalysis = {
        session_id: 'live-slice-01',
        overall: {
          primary_emotion: 'fear' as TargetEmotion,
          secondary_emotion: 'stress' as TargetEmotion,
          urgency_score: 85,
          urgency_level: 'critical' as const,
          emotion_scores: { anger: 0.1, sadness: 0.1, fear: 0.85, happiness: 0.0, stress: 0.75, neutral: 0.1 },
          dominant_cues: [],
          uncertainty: { confidence_score: 0.9, audio_quality: 'clear' as const, ambiguity_detected: false, caveats: [] },
        },
        segments: [],
        metadata: { model_id: 'gemini-3.8-live', duration_seconds: 2, processed_at: '', cost_estimate_usd: 0, audio_format: 'audio/wav', is_live_stream: true },
      };

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockResolvedValueOnce(mockLiveAnalysis);

      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.primaryEmotion).toBe('fear');
      expect(data.model).toBe('gemini-3.8-live');
    });

    it('ingests live WebM audio chunk via raw audio body stream', async () => {
      const webmBuffer = createValidWebmBuffer();

      const mockLiveAnalysis = {
        session_id: 'live-raw-01',
        overall: {
          primary_emotion: 'neutral' as TargetEmotion,
          secondary_emotion: null,
          urgency_score: 20,
          urgency_level: 'low' as const,
          emotion_scores: { anger: 0.05, sadness: 0.05, fear: 0.1, happiness: 0.1, stress: 0.1, neutral: 0.8 },
          dominant_cues: [],
          uncertainty: { confidence_score: 0.88, audio_quality: 'clear' as const, ambiguity_detected: false, caveats: [] },
        },
        segments: [],
        metadata: { model_id: 'gemini-3.8-live', duration_seconds: 3, processed_at: '', cost_estimate_usd: 0, audio_format: 'audio/webm', is_live_stream: true },
      };

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockResolvedValueOnce(mockLiveAnalysis);

      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'audio/webm' },
        body: new Uint8Array(webmBuffer),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.primaryEmotion).toBe('neutral');
      expect(data.model).toBe('gemini-3.8-live');
    });

    it('ingests live audio via JSON audioBase64 payload', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 2);

      const mockLiveAnalysis = {
        session_id: 'live-json-01',
        overall: {
          primary_emotion: 'anger' as TargetEmotion,
          secondary_emotion: 'stress' as TargetEmotion,
          urgency_score: 75,
          urgency_level: 'high' as const,
          emotion_scores: { anger: 0.85, sadness: 0.05, fear: 0.2, happiness: 0.0, stress: 0.7, neutral: 0.1 },
          dominant_cues: [],
          uncertainty: { confidence_score: 0.91, audio_quality: 'clear' as const, ambiguity_detected: false, caveats: [] },
        },
        segments: [],
        metadata: { model_id: 'gemini-3.8-live', duration_seconds: 2, processed_at: '', cost_estimate_usd: 0, audio_format: 'audio/wav', is_live_stream: true },
      };

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockResolvedValueOnce(mockLiveAnalysis);

      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: wavBuffer.toString('base64'),
          durationSeconds: 2,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.primaryEmotion).toBe('anger');
      expect(data.model).toBe('gemini-3.8-live');
    });

    it('supports live demo mode when requested without GEMINI_API_KEY', async () => {
      delete process.env.GEMINI_API_KEY;

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: wavBuffer.toString('base64'),
          demo: true,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(TARGET_EMOTIONS).toContain(data.primaryEmotion);
      expect(data.model).toBe('gemini-3.8-live');
    });
  });

  describe('2. Rejection of Invalid Audio Chunks', () => {
    it('rejects empty audio slice (0 bytes) with HTTP 400', async () => {
      const emptyBlob = new Blob([], { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', emptyBlob, 'empty.wav');

      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('empty');
    });

    it('rejects corrupt magic bytes in chunk with HTTP 400', async () => {
      const corrupt = createCorruptBuffer();
      const corruptBlob = new Blob([new Uint8Array(corrupt)], { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', corruptBlob, 'corrupt.wav');

      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('magic bytes');
    });

    it('rejects live audio chunk exceeding 25MB ceiling with HTTP 400', async () => {
      const oversizedData = new Uint8Array(26 * 1024 * 1024);
      const file = new File([oversizedData], 'oversized.wav', { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', file);

      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('25MB');
    });
  });

  describe('3. API Failure Handling', () => {
    it('rejects live request with HTTP 500 when GEMINI_API_KEY is unset and demo is not requested', async () => {
      delete process.env.GEMINI_API_KEY;

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: wavBuffer.toString('base64') }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('GEMINI_API_KEY');
    });

    it('maps live Gemini quota limits (429) to HTTP 429 Too Many Requests', async () => {
      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockRejectedValueOnce(
        new GeminiRateLimitError('Gemini live stream quota exceeded.')
      );

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: wavBuffer.toString('base64') }),
      });

      const res = await POST(req);
      expect(res.status).toBe(429);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.toLowerCase()).toMatch(/quota|rate limit/);
    });

    it('maps live Gemini upstream errors to HTTP 500 or 502', async () => {
      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockRejectedValueOnce(
        new GeminiResponseValidationError('Malformed JSON from Gemini live session.')
      );

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: wavBuffer.toString('base64') }),
      });

      const res = await POST(req);
      expect(res.status).toBe(502);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Malformed JSON');
    });
  });

  describe('4. Rate Limiting & Client Request Cancellation', () => {
    it('enforces live rate limit of 60 requests / minute returning HTTP 429 with Retry-After', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 1);
      const base64 = wavBuffer.toString('base64');

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockResolvedValue({
        session_id: 'live-rl-mock',
        overall: {
          primary_emotion: 'neutral',
          secondary_emotion: null,
          urgency_score: 10,
          urgency_level: 'low',
          emotion_scores: { anger: 0, sadness: 0, fear: 0, happiness: 0, stress: 0, neutral: 1 },
          dominant_cues: [],
          uncertainty: { confidence_score: 0.9, audio_quality: 'clear', ambiguity_detected: false, caveats: [] },
        },
        segments: [],
        metadata: { model_id: 'gemini-3.8-live', duration_seconds: 1, processed_at: '', cost_estimate_usd: 0, audio_format: 'audio/wav', is_live_stream: true },
      });

      // Execute 60 requests
      for (let i = 0; i < 60; i++) {
        const req = new NextRequest('http://localhost:3000/api/live/emotion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': '10.0.0.99',
          },
          body: JSON.stringify({ audioBase64: base64 }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
      }

      // 61st request should be rate limited
      const rateLimitedReq = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '10.0.0.99',
        },
        body: JSON.stringify({ audioBase64: base64 }),
      });
      const res429 = await POST(rateLimitedReq);
      expect(res429.status).toBe(429);
      expect(res429.headers.get('Retry-After')).toBeDefined();
    });

    it('returns HTTP 499 when live emotion request is cancelled via AbortSignal', async () => {
      const abortController = new AbortController();
      abortController.abort(); // Cancel before or during request

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: wavBuffer.toString('base64') }),
        signal: abortController.signal,
      });

      const res = await POST(req);
      expect(res.status).toBe(499);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('cancelled');
    });
  });

  describe('5. Cost Guardrail Enforcement', () => {
    it('strictly rejects continuous live duration exceeding 600s limit with HTTP 400', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: wavBuffer.toString('base64'),
          durationSeconds: 601, // Exceeds MAX_LIVE_SESSION_DURATION_SECONDS (600s)
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('600s');
    });
  });

  describe('6. Ephemeral Audio Storage Guarantee', () => {
    it('guarantees ephemeral audio files created on disk for live chunks are unlinked in finally block', async () => {
      const tempDir = getTempAudioDir();
      const filesBefore = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      let capturedTempPath: string | null = null;

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockImplementationOnce(
        async (tempPath: string | Buffer) => {
          if (typeof tempPath === 'string') {
            capturedTempPath = tempPath;
            // File must exist while the adapter is executing
            expect(fs.existsSync(tempPath)).toBe(true);
          }
          return {
            session_id: 'temp-live-cleanup-test',
            overall: {
              primary_emotion: 'neutral',
              secondary_emotion: null,
              urgency_score: 10,
              urgency_level: 'low',
              emotion_scores: { anger: 0, sadness: 0, fear: 0, happiness: 0, stress: 0, neutral: 1 },
              dominant_cues: [],
              uncertainty: { confidence_score: 0.9, audio_quality: 'clear', ambiguity_detected: false, caveats: [] },
            },
            segments: [],
            metadata: { model_id: 'gemini-3.8-live', duration_seconds: 2, processed_at: '', cost_estimate_usd: 0, audio_format: 'audio/wav', is_live_stream: true },
          };
        }
      );

      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: wavBuffer.toString('base64') }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      // Verify temp file is unlinked in finally block
      expect(capturedTempPath).not.toBeNull();
      expect(fs.existsSync(capturedTempPath!)).toBe(false);

      const filesAfter = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];
      expect(filesAfter.includes(path.basename(capturedTempPath!))).toBe(false);
    });

    it('unlinks ephemeral audio files even when live analysis fails', async () => {
      let capturedTempPath: string | null = null;

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockImplementationOnce(
        async (tempPath: string | Buffer) => {
          if (typeof tempPath === 'string') {
            capturedTempPath = tempPath;
            expect(fs.existsSync(tempPath)).toBe(true);
          }
          throw new GeminiError('Simulated live stream failure', 'LIVE_ANALYSIS_ERROR', 500);
        }
      );

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: wavBuffer.toString('base64') }),
      });

      const res = await POST(req);
      expect(res.status).toBe(500);

      // Even on failure, temp file must be unlinked in finally block
      expect(capturedTempPath).not.toBeNull();
      expect(fs.existsSync(capturedTempPath!)).toBe(false);
    });
  });

  describe('7. Authentication Enforcement', () => {
    it('strictly rejects unauthenticated live requests with expired Bearer token returning HTTP 401', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/live/emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-expired',
        },
        body: JSON.stringify({ audioBase64: wavBuffer.toString('base64') }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Authentication required');
    });
  });
});
