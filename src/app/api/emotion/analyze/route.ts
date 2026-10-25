/**
 * VECNAVERSE: Recorded Audio Speech Emotion Recognition (SER) API
 * Endpoint: /api/emotion/analyze
 *
 * Implements structured voice emotion classification for recorded audio using
 * Gemini Flash ("gemini-3.8-flash") with fallback to synthetic preview if offline.
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
 * - Sliding-window rate limiting (30 req/min) per client IP.
 * - Duration ceiling (max 900s / 15 mins) and cost controls ($0.75/1M input tokens).
 * - Temporary audio storage by default: unlinks ephemeral files immediately upon completion in finally block.
 * - Cancellation via AbortSignal (HTTP 499).
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
  FullVoiceEmotionAnalysisSchema,
  generateMockEmotionAnalysis,
} from '@/lib/ai/emotion-schemas';
import {
  enforceCostAndDurationGuardrails,
  calculateAudioCost,
} from '@/lib/ai/cost-controller';
import { withTempAudioFile } from '@/lib/storage/temp-storage';
import {
  validateAudioPreflight,
  detectAudioSignature,
  estimateAudioDuration,
  extractWavDuration,
} from '@/lib/audio/preflight';
import { store } from '@/lib/data/store';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB ceiling

const RecordedAnalyzeJsonSchema = z.object({
  caseId: z.string().optional(),
  model: z.string().optional(),
  durationSeconds: z.number().positive().optional(),
  storagePath: z.string().optional(),
  audioBase64: z.string().optional(),
  useSynthetic: z.boolean().optional(),
  demo: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const signal = req.signal;

  try {
    // 0. Cancellation check
    if (signal?.aborted) {
      return NextResponse.json(
        { success: false, error: 'Voice emotion analysis was cancelled by client.' },
        { status: 499 }
      );
    }

    // 1. Authentication Check
    const session = await getServerSession(req);
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

    // 2. Rate Limiting Check (30 requests / minute)
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      officerId;

    const rateResult = checkLimit(`emotion:${clientIp}`, 30, 60000);
    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded for voice emotion analysis. Please retry later.',
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

    const contentType = req.headers.get('content-type') || '';
    let audioBuffer: Buffer | null = null;
    let fileName = 'recorded_audio.wav';
    let mimeType = 'audio/wav';
    let durationSeconds: number | null = null;
    let caseId: string | null = null;
    let requestedModel = 'gemini-3.8-flash';
    let storagePath: string | null = null;
    let isDemo = false;

    // 3. Ingestion: Multipart Audio Upload or JSON Reference
    if (contentType.includes('multipart/form-data')) {
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch {
        return NextResponse.json(
          { success: false, error: 'Malformed multipart form data in request.' },
          { status: 400 }
        );
      }

      const fileEntry = formData.get('audio') || formData.get('file');
      if (!fileEntry || typeof fileEntry === 'string' || typeof (fileEntry as Blob).arrayBuffer !== 'function') {
        return NextResponse.json(
          { success: false, error: 'No audio file provided in request. Expected "audio" or "file".' },
          { status: 400 }
        );
      }

      const file = fileEntry as File;
      fileName = file.name || 'recorded_audio.wav';
      const explicitSize = Number(formData.get('fileSize') || 0);
      const fileSize = explicitSize > 0 ? explicitSize : file.size;

      if (fileSize <= 0) {
        return NextResponse.json(
          { success: false, error: 'Audio file is empty (0 bytes).' },
          { status: 400 }
        );
      }

      if (fileSize > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { success: false, error: `File size exceeds maximum limit of 100MB.` },
          { status: 400 }
        );
      }

      const arrayBuf = await file.arrayBuffer();
      audioBuffer = Buffer.from(arrayBuf);
      mimeType = file.type || 'audio/wav';

      const cId = formData.get('caseId');
      if (cId && typeof cId === 'string') caseId = cId.trim();

      const m = formData.get('model');
      if (m && typeof m === 'string') requestedModel = m.trim();

      const dur = formData.get('durationSeconds');
      if (dur) durationSeconds = parseFloat(String(dur));

      const demoFlag = formData.get('demo') || formData.get('useSynthetic');
      if (demoFlag === 'true' || demoFlag === '1') isDemo = true;
    } else {
      // JSON payload
      let rawJson: any;
      try {
        rawJson = await req.json();
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON request body.' },
          { status: 400 }
        );
      }

      const parsed = RecordedAnalyzeJsonSchema.safeParse(rawJson);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: 'Invalid JSON request payload for emotion analysis.' },
          { status: 400 }
        );
      }

      const body = parsed.data;
      if (body.caseId) caseId = body.caseId.trim();
      if (body.model) requestedModel = body.model.trim();
      if (body.durationSeconds) durationSeconds = body.durationSeconds;
      if (body.storagePath) storagePath = body.storagePath.trim();
      if (body.demo || body.useSynthetic) isDemo = true;

      if (body.audioBase64) {
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
            { success: false, error: 'Audio file is empty (0 bytes).' },
            { status: 400 }
          );
        }

        if (audioBuffer.length > MAX_UPLOAD_BYTES) {
          return NextResponse.json(
            { success: false, error: `File size exceeds maximum limit of 100MB.` },
            { status: 400 }
          );
        }
      } else if (caseId && !storagePath) {
        // Resolve storage path from existing case in store
        const existingCase = store.getCaseById(caseId);
        if (!existingCase) {
          return NextResponse.json(
            { success: false, error: `Case #${caseId} not found.` },
            { status: 404 }
          );
        }
        storagePath = existingCase.audioMetadata?.storagePath || null;
      } else if (!storagePath) {
        return NextResponse.json(
          { success: false, error: 'No audio file provided in request. Expected "audio", "file", or "audioBase64".' },
          { status: 400 }
        );
      }
    }

    // Check query params for demo flag
    const url = new URL(req.url);
    if (url.searchParams.get('demo') === 'true' || url.searchParams.get('useSynthetic') === 'true') {
      isDemo = true;
    }

    // 4. Magic Bytes & Preflight Verification
    if (audioBuffer) {
      const signature = detectAudioSignature(audioBuffer);
      if (!signature.detected) {
        return NextResponse.json(
          { success: false, error: 'File failed magic bytes validation. Header is not recognized audio.' },
          { status: 400 }
        );
      }

      const preflight = validateAudioPreflight(fileName, audioBuffer.length, mimeType, audioBuffer);
      if (!preflight.valid) {
        return NextResponse.json(
          { success: false, error: preflight.error || 'Audio preflight validation failed.' },
          { status: 400 }
        );
      }

      if (!durationSeconds || durationSeconds <= 0) {
        if (signature.format === 'wav') {
          durationSeconds = extractWavDuration(audioBuffer) || estimateAudioDuration(audioBuffer.length, mimeType);
        } else {
          durationSeconds = estimateAudioDuration(audioBuffer.length, mimeType);
        }
      }
    }

    // 5. Enforce Cost and Duration Guardrails (Max 900 seconds)
    const effectiveDuration = durationSeconds || 60;
    try {
      enforceCostAndDurationGuardrails(effectiveDuration, requestedModel, 0, {
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
        { success: false, error: 'Voice emotion analysis was cancelled by client.' },
        { status: 499 }
      );
    }

    // 6. Execute Voice Emotion Analysis with Temporary Audio Storage
    let analysis: FullVoiceEmotionAnalysis;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      if (isDemo) {
        analysis = generateMockEmotionAnalysis({
          metadata: {
            model_id: requestedModel,
            duration_seconds: effectiveDuration,
            processed_at: new Date().toISOString(),
            cost_estimate_usd: calculateAudioCost(effectiveDuration, requestedModel),
            audio_format: mimeType,
            is_live_stream: false,
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
        recordedModel: requestedModel as any,
      });

      if (audioBuffer) {
        // Wrap execution in withTempAudioFile to guarantee temporary file unlinking in finally block
        const ext = path.extname(fileName) || '.wav';
        analysis = await withTempAudioFile(
          audioBuffer,
          async (tempPath) => {
            return await adapter.analyzeVoiceEmotion(tempPath, {
              mimeType,
              durationSeconds: effectiveDuration,
              forceModel: requestedModel,
              signal,
            });
          },
          ext
        );
      } else if (storagePath) {
        analysis = await adapter.analyzeVoiceEmotion(storagePath, {
          durationSeconds: effectiveDuration,
          forceModel: requestedModel,
          signal,
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'No audio data or valid storage path available for analysis.' },
          { status: 400 }
        );
      }
    }

    // 7. Validate full schema adherence strictly
    const validated = FullVoiceEmotionAnalysisSchema.parse(analysis);

    // 8. If associated with a case, update case findings in store
    if (caseId) {
      try {
        const targetCase = store.getCaseById(caseId);
        if (targetCase) {
          store.updateCase(caseId, {
            urgencyScore: validated.overall.urgency_score,
            urgencyLevel: validated.overall.urgency_level.toUpperCase() as any,
            emotionProfile: {
              primaryEmotion: validated.overall.primary_emotion as any,
              urgencyScore: validated.overall.urgency_score,
              urgencyLevel: validated.overall.urgency_level.toUpperCase() as any,
              emotions: {
                fear: validated.overall.emotion_scores.fear,
                distress: validated.overall.emotion_scores.stress,
                anger: validated.overall.emotion_scores.anger,
                nervousness: validated.overall.emotion_scores.stress * 0.8,
                calm: validated.overall.emotion_scores.neutral,
              },
              acousticMetrics: {
                available: false,
                disclaimer: 'Forensic acoustic DSP metrics not measured by basic LLM; human officer review required',
              },
            },
            latestRun: {
              id: `run-${Date.now()}`,
              caseId,
              status: 'completed',
              modelId: requestedModel,
              promptVersion: 'v2.0.0-ser-emotion',
              isSyntheticDemo: !apiKey,
              analysisProvider: apiKey ? 'gemini' : 'synthetic-fixture',
              startedAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              durationMs: effectiveDuration * 1000,
            },
          });

          store.logAuditEvent({
            action: 'PIPELINE_EXECUTED',
            actorId: officerId,
            actorName: `Officer ${officerId}`,
            resourceType: 'case',
            resourceId: caseId,
            details: `Speech emotion analysis executed using ${requestedModel}. Primary emotion: ${validated.overall.primary_emotion}.`,
          });
        }
      } catch (storeErr) {
        console.warn(`[API/emotion/analyze] Warning: Failed to update case #${caseId}:`, storeErr);
      }
    }

    const timestamps = {
      start_ms: validated.segments[0]?.start_ms ?? 0,
      end_ms: validated.segments[validated.segments.length - 1]?.end_ms ?? Math.round(effectiveDuration * 1000),
      duration_seconds: effectiveDuration,
    };

    const transcript =
      validated.segments.map((s) => s.transcript).filter(Boolean).join(' ') ||
      'Recorded voice speech analysis completed.';

    return NextResponse.json({
      success: true,
      analysis: validated,
      primaryEmotion: validated.overall.primary_emotion,
      secondaryEmotion: validated.overall.secondary_emotion,
      primary_emotion: validated.overall.primary_emotion,
      secondary_emotion: validated.overall.secondary_emotion,
      emotions: validated.overall.emotion_scores,
      emotion_scores: validated.overall.emotion_scores,
      urgencyScore: validated.overall.urgency_score,
      urgencyLevel: validated.overall.urgency_level,
      confidence: validated.overall.uncertainty.confidence_score,
      audioQuality: validated.overall.uncertainty.audio_quality,
      ambiguityFlag: validated.overall.uncertainty.ambiguity_detected,
      vocalCues: validated.overall.dominant_cues,
      vocal_cues: validated.overall.dominant_cues,
      uncertainty: validated.overall.uncertainty,
      transcript,
      timestamps,
      model: requestedModel,
      receivedBytes: audioBuffer ? audioBuffer.length : undefined,
    });
  } catch (err: any) {
    if (signal?.aborted || err?.name === 'AbortError' || /abort/i.test(err?.message || '')) {
      return NextResponse.json(
        { success: false, error: 'Voice emotion analysis was cancelled by client.' },
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
    const safeErrorMsg = String(err?.message || err).replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
    console.error('[API/emotion/analyze] Error:', safeErrorMsg);

    const statusCode = err?.status || (err instanceof GeminiResponseValidationError ? 502 : 500);
    return NextResponse.json(
      { success: false, error: safeErrorMsg || 'Voice emotion analysis failed.' },
      { status: statusCode }
    );
  }
}
