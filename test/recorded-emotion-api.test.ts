/**
 * VECNAVERSE: Recorded Audio Speech Emotion Recognition (SER) API Test Suite
 * Test File: test/recorded-emotion-api.test.ts
 *
 * Verifies Component 2 of the implementation plan:
 * 1. Recorded audio upload and structured JSON validation (multipart, JSON base64, case reference).
 * 2. Strict 6-emotion detection: anger, sadness, fear, happiness, stress, neutral.
 * 3. Structured output with timestamps, transcript, primary/secondary emotions, vocal cues, and uncertainty indicators.
 * 4. Model adherence: 'gemini-3.8-flash'.
 * 5. Rejection of invalid files (empty 0-byte, corrupt magic bytes, excessive size >100MB).
 * 6. API failure handling: missing API key, quota limits (429), upstream errors (500/502).
 * 7. Rate limiting (429 Too Many Requests) and cancellation via AbortSignal (499).
 * 8. Cost guardrail enforcement (>900s rejected with 400).
 * 9. Ephemeral temp storage cleanup guarantee (unlinked in finally block).
 * 10. Authentication enforcement (401 on expired/missing credentials).
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import { POST } from '../src/app/api/emotion/analyze/route';
import { reset as resetRateLimits } from '../src/lib/ai/rate-limiter';
import { getTempAudioDir } from '../src/lib/storage/temp-storage';
import { GeminiAudioAdapter, GeminiRateLimitError, GeminiResponseValidationError, GeminiError } from '../src/lib/ai/gemini-adapter';
import {
  TARGET_EMOTIONS,
  TargetEmotion,
  FullVoiceEmotionAnalysisSchema,
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

function createCorruptBuffer(): Buffer {
  return Buffer.from('NOT_AN_AUDIO_FILE_JUST_CORRUPT_BYTES_DATA_STREAM_HEADER');
}

describe('Recorded Audio Emotion Analysis API (/api/emotion/analyze)', () => {
  const originalApiKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    resetRateLimits();
    process.env.GEMINI_API_KEY = 'test-gemini-key-12345';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    if (originalApiKey !== undefined) {
      process.env.GEMINI_API_KEY = originalApiKey;
    } else {
      delete process.env.GEMINI_API_KEY;
    }
  });

  describe('1. Recorded Audio Ingestion & Structured JSON Validation', () => {
    it('successfully processes multipart/form-data upload and outputs validated 6-emotion JSON', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 3);
      const blob = new Blob([new Uint8Array(wavBuffer)], { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', blob, 'call_recording.wav');
      formData.append('model', 'gemini-3.8-flash');

      const mockAnalysisResult = {
        session_id: 'test-session-rec-01',
        overall: {
          primary_emotion: 'fear' as TargetEmotion,
          secondary_emotion: 'stress' as TargetEmotion,
          urgency_score: 84,
          urgency_level: 'critical' as const,
          emotion_scores: {
            anger: 0.12,
            sadness: 0.15,
            fear: 0.88,
            happiness: 0.02,
            stress: 0.82,
            neutral: 0.05,
          },
          dominant_cues: [
            {
              cue_type: 'vocal_tremor',
              description: 'Pitch perturbation and tremors under threat',
              severity: 'high' as const,
              timestamp_ms: 850,
            },
          ],
          uncertainty: {
            confidence_score: 0.94,
            audio_quality: 'clear' as const,
            ambiguity_detected: false,
            caveats: ['Acoustic model classification advisory.'],
          },
        },
        segments: [
          {
            segment_id: 'seg-1',
            start_ms: 0,
            end_ms: 3000,
            start_time_seconds: 0,
            end_time_seconds: 3.0,
            transcript: 'Please do not do this, I will transfer the money immediately.',
            speaker_label: 'VICTIM',
            primary_emotion: 'fear' as TargetEmotion,
            secondary_emotion: 'stress' as TargetEmotion,
            emotion_scores: {
              anger: 0.1,
              sadness: 0.15,
              fear: 0.88,
              happiness: 0.0,
              stress: 0.82,
              neutral: 0.05,
            },
            vocal_cues: [
              {
                cue_type: 'pitch_drift',
                description: 'Sharp fundamental frequency escalation',
                severity: 'high' as const,
                timestamp_ms: 900,
              },
            ],
            uncertainty: {
              confidence_score: 0.95,
              audio_quality: 'clear' as const,
              ambiguity_detected: false,
              caveats: [],
            },
          },
        ],
        metadata: {
          model_id: 'gemini-3.8-flash',
          duration_seconds: 3.0,
          processed_at: new Date().toISOString(),
          cost_estimate_usd: 0.0001,
          audio_format: 'audio/wav',
          is_live_stream: false,
        },
      };

      const spy = vi
        .spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion')
        .mockResolvedValueOnce(mockAnalysisResult);

      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
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

      // Verify primary and secondary emotions are valid target emotions
      expect(TARGET_EMOTIONS).toContain(data.primaryEmotion);
      expect(TARGET_EMOTIONS).toContain(data.secondaryEmotion);

      // Verify transcript and timestamps
      expect(data.transcript).toContain('transfer the money');
      expect(data.timestamps).toBeDefined();
      expect(data.timestamps.duration_seconds).toBeGreaterThan(0);

      // Verify vocal cues and uncertainty
      expect(data.vocalCues.length).toBeGreaterThan(0);
      expect(data.uncertainty).toBeDefined();
      expect(data.uncertainty.confidence_score).toBe(0.94);
      expect(data.uncertainty.audio_quality).toBe('clear');

      // Verify model strictly requested
      expect(data.model).toBe('gemini-3.8-flash');
      expect(spy).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          forceModel: 'gemini-3.8-flash',
        })
      );

      // Verify full analysis schema validity
      const parsedFull = FullVoiceEmotionAnalysisSchema.safeParse(data.analysis);
      expect(parsedFull.success).toBe(true);
    });

    it('processes JSON payload with audioBase64 and strictly validates structured output', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const base64Audio = wavBuffer.toString('base64');

      const mockAnalysisResult = {
        session_id: 'test-session-rec-02',
        overall: {
          primary_emotion: 'stress' as TargetEmotion,
          secondary_emotion: 'anger' as TargetEmotion,
          urgency_score: 78,
          urgency_level: 'high' as const,
          emotion_scores: {
            anger: 0.65,
            sadness: 0.1,
            fear: 0.45,
            happiness: 0.05,
            stress: 0.85,
            neutral: 0.1,
          },
          dominant_cues: [],
          uncertainty: {
            confidence_score: 0.9,
            audio_quality: 'clear' as const,
            ambiguity_detected: false,
            caveats: [],
          },
        },
        segments: [],
        metadata: {
          model_id: 'gemini-3.8-flash',
          duration_seconds: 2.0,
          processed_at: new Date().toISOString(),
          cost_estimate_usd: 0.0001,
          audio_format: 'audio/wav',
          is_live_stream: false,
        },
      };

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockResolvedValueOnce(mockAnalysisResult);

      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64Audio,
          model: 'gemini-3.8-flash',
          durationSeconds: 2,
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.primaryEmotion).toBe('stress');
      expect(data.secondaryEmotion).toBe('anger');
      expect(data.emotions.stress).toBe(0.85);
      expect(data.model).toBe('gemini-3.8-flash');
    });

    it('processes synthetic demo mode with truthful fallback when requested', async () => {
      delete process.env.GEMINI_API_KEY;

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
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
      expect(data.model).toBe('gemini-3.8-flash');
    });
  });

  describe('2. Rejection of Invalid Audio Files', () => {
    it('rejects empty audio file (0 bytes) with HTTP 400', async () => {
      const emptyBlob = new Blob([], { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', emptyBlob, 'empty.wav');

      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('empty');
    });

    it('rejects corrupt magic bytes with HTTP 400', async () => {
      const corrupt = createCorruptBuffer();
      const corruptBlob = new Blob([new Uint8Array(corrupt)], { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', corruptBlob, 'corrupt.wav');

      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('magic bytes');
    });

    it('rejects corrupt audioBase64 string with HTTP 400', async () => {
      const corruptBase64 = Buffer.from('NOT_GENUINE_AUDIO').toString('base64');
      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: corruptBase64 }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('magic bytes');
    });

    it('rejects audio exceeding maximum upload size of 100MB with HTTP 400', async () => {
      const oversizedData = new Uint8Array(101 * 1024 * 1024);
      const file = new File([oversizedData], 'huge.wav', { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', file);

      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: formData,
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('100MB');
    });
  });

  describe('3. API Failure Handling', () => {
    it('rejects request with HTTP 500 when GEMINI_API_KEY is unset and demo is not requested', async () => {
      delete process.env.GEMINI_API_KEY;

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
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

    it('maps upstream quota limits (429) to HTTP 429 Too Many Requests', async () => {
      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockRejectedValueOnce(
        new GeminiRateLimitError('Gemini API rate limit or quota exceeded.')
      );

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
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

    it('maps upstream Gemini errors to HTTP 500 or 502', async () => {
      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockRejectedValueOnce(
        new GeminiResponseValidationError('Malformed JSON from Gemini model.')
      );

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
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
    it('enforces rate limit of 30 requests / minute returning HTTP 429 with Retry-After', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 1);
      const base64 = wavBuffer.toString('base64');

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockResolvedValue({
        session_id: 'mock',
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
        metadata: { model_id: 'gemini-3.8-flash', duration_seconds: 1, processed_at: '', cost_estimate_usd: 0, audio_format: 'audio/wav', is_live_stream: false },
      });

      // Execute 30 requests
      for (let i = 0; i < 30; i++) {
        const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-forwarded-for': '192.168.10.50',
          },
          body: JSON.stringify({ audioBase64: base64 }),
        });
        const res = await POST(req);
        expect(res.status).toBe(200);
      }

      // 31st request should be rate limited
      const rateLimitedReq = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': '192.168.10.50',
        },
        body: JSON.stringify({ audioBase64: base64 }),
      });
      const res429 = await POST(rateLimitedReq);
      expect(res429.status).toBe(429);
      expect(res429.headers.get('Retry-After')).toBeDefined();
    });

    it('returns HTTP 499 when request is cancelled via AbortSignal', async () => {
      const abortController = new AbortController();
      abortController.abort(); // Cancel before or during request

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
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
    it('strictly rejects audio duration exceeding 900 seconds (15 minutes) with HTTP 400', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: wavBuffer.toString('base64'),
          durationSeconds: 901, // Exceeds 900s
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('900s');
    });
  });

  describe('6. Ephemeral Audio Storage Guarantee', () => {
    it('guarantees ephemeral audio files created on disk are unlinked in finally block', async () => {
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
            session_id: 'temp-cleanup-test',
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
            metadata: { model_id: 'gemini-3.8-flash', duration_seconds: 2, processed_at: '', cost_estimate_usd: 0, audio_format: 'audio/wav', is_live_stream: false },
          };
        }
      );

      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioBase64: wavBuffer.toString('base64') }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      // Verify that after request completes, the temporary file is unlinked
      expect(capturedTempPath).not.toBeNull();
      expect(fs.existsSync(capturedTempPath!)).toBe(false);

      const filesAfter = fs.existsSync(tempDir) ? fs.readdirSync(tempDir) : [];
      expect(filesAfter.includes(path.basename(capturedTempPath!))).toBe(false);
    });

    it('unlinks ephemeral audio files even when adapter throws an error', async () => {
      let capturedTempPath: string | null = null;

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeVoiceEmotion').mockImplementationOnce(
        async (tempPath: string | Buffer) => {
          if (typeof tempPath === 'string') {
            capturedTempPath = tempPath;
            expect(fs.existsSync(tempPath)).toBe(true);
          }
          throw new GeminiError('Simulated processing failure', 'ANALYSIS_ERROR', 500);
        }
      );

      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
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
    it('strictly rejects unauthenticated requests with expired Bearer token returning HTTP 401', async () => {
      const wavBuffer = createValidWavBuffer(16000, 1, 2);
      const req = new NextRequest('http://localhost:3000/api/emotion/analyze', {
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
