/**
 * VECNAVERSE: Live Audio Speech Emotion Recognition (SER) API
 * Endpoint: /api/live/emotion
 *
 * Implements real-time voice emotion classification for live microphone/phone
 * streaming chunks using Gemini Live ("gemini-3.8-live") with fallback to synthetic demo.
 *
 * Strictly classifies the 6 target emotions:
 * - anger
 * - sadness
 * - fear
 * - happiness
 * - stress
 * - neutral
 *
 * Features:
 * - Validated JSON schema output with timestamps, transcript, primary/secondary emotions,
 *   vocal cues, and uncertainty indicators.
 * - Server-side authentication and request attribution via getServerSession.
 * - Sliding-window rate limiting (60 req/min) per client IP.
 * - Continuous live streaming ceiling (max 600s / 10 mins) and cost controls ($0.004/min).
 * - Ephemeral audio storage via withTempAudioFile: unlinks temp files in finally block.
 * - Request cancellation support via AbortSignal (HTTP 499).
 * - Redacts raw audio bytes and secrets from logs.
 */

import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth/session';
import { checkLimit } from '@/lib/ai/rate-limiter';
import {
  GeminiAudioAdapter,
  GeminiRateLimitError,
  GeminiResponseValidationError,
} from '@/lib/ai/gemini-adapter';
import {
  FullVoiceEmotionAnalysis,
  generateMockEmotionAnalysis,
  LiveEmotionResponseSchema,
} from '@/lib/ai/emotion-schemas';
import {
  enforceCostAndDurationGuardrails,
  calculateAudioCost,
} from '@/lib/ai/cost-controller';
import { withTempAudioFile } from '@/lib/storage/temp-storage';
import {
  detectAudioSignature,
  validateAudioPreflight,
  estimateAudioDuration,
  extractWavDuration,
} from '@/lib/audio/preflight';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_LIVE_CHUNK_BYTES = 25 * 1024 * 1024; // 25 MB ceiling for single streaming chunk

const LivePayloadJsonSchema = z.object({
  audioBase64: z.string().optional(),
  mimeType: z.string().optional(),
  fileName: z.string().optional(),
  durationSeconds: z.number().positive().optional(),
  caseId: z.string().optional(),
  demo: z.boolean().optional(),
  useSynthetic: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const signal = request.signal;

  try {
    // 0. Immediate cancellation check
    if (signal?.aborted) {
      return NextResponse.json(
        { success: false, error: 'Live emotion analysis was cancelled by client.' },
        { status: 499 }
      );
    }

    // 1. Authentication Check
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required: A verified officer session or Bearer token is required.',
        },
        { status: 401 }
      );
    }
    const officerId = session.user.id;

    // 2. Sliding-Window Rate Limiting (60 requests / minute)
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      officerId;

    const rateResult = checkLimit(`live-emotion:${clientIp}`, 60, 60000);
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded for live emotion streaming. Please retry later.',
          retryAfterMs: rateResult.resetMs,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateResult.resetMs / 1000)),
          },
        }
      );
    }

    // 3. Audio Chunk Ingestion & Validation
    const contentType = request.headers.get('content-type') || '';
    let audioBuffer: Buffer | null = null;
    let fileName = 'mic_slice.wav';
    let mimeType = 'audio/wav';
    let durationSeconds: number | null = null;
    let isDemo = false;

    if (contentType.includes('multipart/form-data')) {
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return NextResponse.json(
          { success: false, error: 'Malformed multipart form data in live audio chunk.' },
          { status: 400 }
        );
      }

      const fileEntry =
        formData.get('audio') ||
        formData.get('slice') ||
        formData.get('file');

      if (!fileEntry || typeof fileEntry === 'string' || typeof (fileEntry as Blob).arrayBuffer !== 'function') {
        return NextResponse.json(
          { success: false, error: 'No audio slice provided in request. Expected "audio" or "slice".' },
          { status: 400 }
        );
      }

      const file = fileEntry as File;
      fileName = file.name || 'mic_slice.wav';
      const explicitSize = Number(formData.get('fileSize') || 0);
      const fileSize = explicitSize > 0 ? explicitSize : file.size;

      if (fileSize <= 0) {
        return NextResponse.json(
          { success: false, error: 'Audio stream chunk is empty (0 bytes).' },
          { status: 400 }
        );
      }

      if (fileSize > MAX_LIVE_CHUNK_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Live audio chunk exceeds maximum size limit of 25MB.' },
          { status: 400 }
        );
      }

      const arrayBuf = await file.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuf);
      mimeType = file.type || 'audio/wav';

      const dur = formData.get('durationSeconds');
      if (dur) durationSeconds = parseFloat(String(dur));

      const demoFlag = formData.get('demo') || formData.get('useSynthetic');
      if (demoFlag === 'true' || demoFlag === '1') isDemo = true;
    } else if (contentType.includes('application/json')) {
      let rawJson: any;
      try {
        rawJson = await request.json();
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON request body.' },
          { status: 400 }
        );
      }

      const parsed = LivePayloadJsonSchema.safeParse(rawJson);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON payload structure for live emotion analysis.' },
          { status: 400 }
        );
      }

      const body = parsed.data;
      if (!body.audioBase64 || body.audioBase64.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Audio stream chunk is empty (0 bytes).' },
          { status: 400 }
        );
      }

      try {
        audioBuffer = Buffer.from(body.audioBase64, 'base64');
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid base64 encoding in "audioBase64".' },
          { status: 400 }
        );
      }

      if (audioBuffer.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Audio stream chunk is empty (0 bytes).' },
          { status: 400 }
        );
      }

      if (audioBuffer.length > MAX_LIVE_CHUNK_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Live audio chunk exceeds maximum size limit of 25MB.' },
          { status: 400 }
        );
      }

      if (body.fileName) fileName = body.fileName;
      if (body.mimeType) mimeType = body.mimeType;
      if (body.durationSeconds) durationSeconds = body.durationSeconds;
      if (body.demo || body.useSynthetic) isDemo = true;
    } else if (contentType.includes('audio/') || contentType.includes('application/octet-stream')) {
      const arrayBuf = await request.arrayBuffer();
      if (arrayBuf.byteLength === 0) {
        return NextResponse.json(
          { success: false, error: 'Audio stream chunk is empty (0 bytes).' },
          { status: 400 }
        );
      }

      if (arrayBuf.byteLength > MAX_LIVE_CHUNK_BYTES) {
        return NextResponse.json(
          { success: false, error: 'Live audio chunk exceeds maximum size limit of 25MB.' },
          { status: 400 }
        );
      }

      audioBuffer = Buffer.from(arrayBuf);
      mimeType = contentType.split(';')[0].trim() || 'audio/wav';
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported Content-Type. Expected multipart/form-data, application/json, or audio/*.' },
        { status: 400 }
      );
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Audio stream chunk is empty (0 bytes).' },
        { status: 400 }
      );
    }

    // Check query params for demo flag
    const url = new URL(request.url);
    if (url.searchParams.get('demo') === 'true' || url.searchParams.get('useSynthetic') === 'true') {
      isDemo = true;
    }

    // 4. Magic Bytes & Preflight Verification
    const signature = detectAudioSignature(audioBuffer);
    if (!signature.detected) {
      return NextResponse.json(
        { success: false, error: 'Audio chunk failed magic bytes validation. Header is not recognized audio.' },
        { status: 400 }
      );
    }

    const preflight = validateAudioPreflight(fileName, audioBuffer.length, mimeType, audioBuffer);
    if (!preflight.valid) {
      return NextResponse.json(
        { success: false, error: preflight.error || 'Audio chunk preflight validation failed.' },
        { status: 400 }
      );
    }

    // Estimate chunk duration
    if (!durationSeconds || durationSeconds <= 0) {
      if (signature.format === 'wav') {
        durationSeconds = extractWavDuration(audioBuffer) || estimateAudioDuration(audioBuffer.length, mimeType);
      } else {
        durationSeconds = estimateAudioDuration(audioBuffer.length, mimeType);
      }
    }
    const effectiveDuration = durationSeconds || 3;

    // 5. Enforce Cost and Duration Guardrails for Live Streaming (gemini-3.8-live, max 600s/900s)
    try {
      enforceCostAndDurationGuardrails(effectiveDuration, 'gemini-3.8-live', 0, {
        isLive: true,
        throwOnError: true,
      });
    } catch (guardErr: any) {
      return NextResponse.json(
        { success: false, error: guardErr.message },
        { status: 400 }
      );
    }

    // Check cancellation again before external API invocation
    if (signal?.aborted) {
      return NextResponse.json(
        { success: false, error: 'Live emotion analysis was cancelled by client.' },
        { status: 499 }
      );
    }

    // 6. Execute Voice Emotion Analysis using 'gemini-3.8-live' with Temporary Audio Storage
    let analysis: FullVoiceEmotionAnalysis;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      if (isDemo) {
        analysis = generateMockEmotionAnalysis({
          metadata: {
            model_id: 'gemini-3.8-live',
            duration_seconds: effectiveDuration,
            processed_at: new Date().toISOString(),
            cost_estimate_usd: calculateAudioCost(effectiveDuration, 'gemini-3.8-live'),
            audio_format: mimeType,
            is_live_stream: true,
          },
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in environment variables.',
          },
          { status: 500 }
        );
      }
    } else {
      const adapter = new GeminiAudioAdapter({
        apiKey,
        recordedModel: 'gemini-3.8-live' as any,
      });

      const ext = path.extname(fileName) || (signature.format ? `.${signature.format}` : '.wav');

      // Temporary audio storage by default: any temp audio file created on disk is unlinked in finally block
      analysis = await withTempAudioFile(
        audioBuffer,
        async (tempPath) => {
          return await adapter.analyzeVoiceEmotion(tempPath, {
            mimeType,
            durationSeconds: effectiveDuration,
            forceModel: 'gemini-3.8-live',
            signal,
          });
        },
        ext
      );
    }

    // 7. Structure Output Validating strictly against LiveEmotionResponseSchema
    const transcript =
      analysis.segments.map((s) => s.transcript).filter(Boolean).join(' ') ||
      'Live microphone speech slice ingested and processed.';

    const timestamps = {
      start_ms: analysis.segments[0]?.start_ms ?? 0,
      end_ms: analysis.segments[analysis.segments.length - 1]?.end_ms ?? Math.round(effectiveDuration * 1000),
      duration_ms: Math.round(effectiveDuration * 1000),
    };

    const vocalCues = analysis.overall.dominant_cues.map((cue, idx) => {
      if (typeof cue === 'string') {
        return {
          id: `cue-${Date.now()}-${idx}`,
          title: cue,
          type: 'acoustic_marker',
          cue_type: 'acoustic_marker',
          description: cue,
          severity: 'medium' as const,
          timestamp_ms: timestamps.start_ms,
        };
      }
      return {
        id: `cue-${Date.now()}-${idx}`,
        title: cue.cue_type,
        type: cue.cue_type,
        ...cue,
      };
    });

    const responseBody = {
      success: true as const,
      timestamp: new Date().toISOString(),
      timestamps,
      transcript,
      primaryEmotion: analysis.overall.primary_emotion,
      secondaryEmotion: analysis.overall.secondary_emotion,
      primary_emotion: analysis.overall.primary_emotion,
      secondary_emotion: analysis.overall.secondary_emotion,
      emotions: analysis.overall.emotion_scores,
      emotion_scores: analysis.overall.emotion_scores,
      urgencyScore: analysis.overall.urgency_score,
      urgencyLevel: analysis.overall.urgency_level,
      confidence: analysis.overall.uncertainty.confidence_score,
      audioQuality: analysis.overall.uncertainty.audio_quality,
      ambiguityFlag: analysis.overall.uncertainty.ambiguity_detected,
      vocalCues,
      vocal_cues: vocalCues,
      uncertainty: analysis.overall.uncertainty,
      model: 'gemini-3.8-live',
      receivedBytes: audioBuffer.length,
      analysis,
    };

    const validated = LiveEmotionResponseSchema.parse(responseBody);
    return NextResponse.json(validated);
  } catch (err: any) {
    if (signal?.aborted || err?.name === 'AbortError' || /abort/i.test(err?.message || '')) {
      return NextResponse.json(
        { success: false, error: 'Live emotion analysis was cancelled by client.' },
        { status: 499 }
      );
    }

    if (
      err instanceof GeminiRateLimitError ||
      err?.status === 429 ||
      /rate\s*limit|quota|resource\s*exhausted/i.test(err?.message || '')
    ) {
      return NextResponse.json(
        { success: false, error: err?.message || 'Gemini quota or rate limit exceeded.' },
        { status: 429 }
      );
    }

    // Privacy protection: Redact API keys and raw audio bytes from server logs
    const safeMsg = String(err?.message || err).replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
    console.error('[API/live/emotion] Error:', safeMsg);

    const statusCode = err?.status || (err instanceof GeminiResponseValidationError ? 502 : 500);
    return NextResponse.json(
      { success: false, error: safeMsg || 'Live emotion analysis failed.' },
      { status: statusCode }
    );
  }
}
