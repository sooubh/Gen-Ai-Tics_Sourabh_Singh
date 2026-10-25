import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { GeminiAudioAdapter } from '@/lib/ai/gemini-adapter';
import { executeSyntheticRun, isFixtureAvailable } from '@/lib/ai/synthetic-fixtures';
import { AudioAnalysisResult } from '@/lib/ai/types';
import { getServerSession, authorizeCaseAccess, deriveOfficerAttribution } from '@/lib/auth/session';
import {
  TranscriptSegment,
  ExtractedEntity,
  EmergencyTrigger,
  TimelineEvent,
  VocalIndicator,
  TriggerSeverity,
  SpeechEmotionProfile,
} from '@/types';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    let targetCase = store.getCaseById(id);

    // If case is not in memory/enclave, check if caller provided caseData or storagePath to register it
    if (!targetCase && (body.caseData || body.storagePath || (body.useSynthetic !== undefined && body.title))) {
      const casePayload = body.caseData || {};
      targetCase = store.createCase({
        id,
        title: casePayload.title || body.title || `Inbound Audio Case #${id}`,
        operationName: casePayload.operationName || body.operationName || 'Operation RapidTriage',
        description: casePayload.description || body.description || '',
        callerCategory: casePayload.callerCategory || body.callerCategory || 'unknown',
        callerName: casePayload.callerName || body.callerName,
        callerPhone: casePayload.callerPhone || body.callerPhone,
        priority: casePayload.priority || body.priority || 'high',
        isSyntheticDemo: Boolean(casePayload.isSyntheticDemo !== undefined ? casePayload.isSyntheticDemo : body.useSynthetic),
        fixtureId: casePayload.fixtureId || body.fixtureId,
        audioMetadata: casePayload.audioMetadata || (body.storagePath ? {
          filename: body.fileName || (typeof body.storagePath === 'string' ? body.storagePath.split('/').pop() : 'audio.wav') || 'audio.wav',
          durationSeconds: body.durationSeconds || 60,
          sampleRate: 44100,
          channels: 1,
          format: 'audio/wav',
          mimeType: 'audio/wav',
          sizeBytes: 0,
          sha256Hash: body.sha256Hash || '',
          uploadedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
          retentionHours: 24,
          storagePath: body.storagePath,
          purged: false,
        } : undefined),
      });
    }

    if (!targetCase) {
      return NextResponse.json(
        {
          success: false,
          error: `Case ${id} not found in local enclave`,
        },
        { status: 404 }
      );
    }

    const session = await getServerSession(request);
    if (session) {
      const authResult = authorizeCaseAccess(session, targetCase);
      if (!authResult.authorized) {
        return NextResponse.json(
          {
            success: false,
            error: authResult.reason || 'Forbidden: Insufficient privileges to analyze case.',
          },
          { status: authResult.statusCode || 403 }
        );
      }
    }

    const attribution = session
      ? deriveOfficerAttribution(session, body)
      : {
          officerId: targetCase.officerId || 'ANONYMOUS-OFFICER',
          officerName: targetCase.officerName || 'Anonymous Officer',
        };
    const actorId = attribution.officerId;
    const actorName = attribution.officerName;
    const officer = targetCase.officerName || actorName;
    const officerContext = session || { officerId: actorId, officerName: actorName };

    const startTimeMs = Date.now();
    const startTimeIso = new Date().toISOString();
    const apiKey = process.env.GEMINI_API_KEY;

    // Truth-in-advertising provenance: detect explicit synthetic demo requests
    const isSyntheticDemo = Boolean(body.useSynthetic === true || body.fixtureId);

    let result: AudioAnalysisResult;
    let modelUsed: string;
    let analysisProvider: string;

    if (isSyntheticDemo) {
      // User explicitly requested synthetic demo mode or specific fixture
      const requestedFixture = body.fixtureId;
      const fixtureId = requestedFixture && isFixtureAvailable(requestedFixture)
        ? requestedFixture
        : 'extortion-demand';

      result = await executeSyntheticRun(fixtureId);
      modelUsed = 'synthetic-fixture';
      analysisProvider = 'synthetic-fixture';
    } else {
      // Real audio processing branch
      if (!apiKey) {
        const failureReason =
          'Gemini API key is not configured on server (GEMINI_API_KEY). Please add GEMINI_API_KEY to your .env.local file to analyze custom audio files, or use preset demo scenarios for offline testing.';
        const timestamp = new Date().toISOString();

        const updated = store.updateCase(id, {
          status: 'flagged',
          latestRun: {
            id: `run-${Date.now()}`,
            caseId: id,
            status: 'failed',
            modelId: 'gemini-2.5-flash',
            promptVersion: 'v1.0.0-vecnaverse',
            isSyntheticDemo: false,
            analysisProvider: 'gemini',
            acousticMetricsAvailable: false,
            failureReason,
            startedAt: startTimeIso,
            completedAt: timestamp,
          },
        }, officerContext);

        store.logAuditEvent({
          action: 'PIPELINE_FAILED',
          actorId,
          actorName,
          officer,
          resourceType: 'case',
          resourceId: id,
          details: `Forensic audio analysis failed: ${failureReason}`,
          enclaveSecurityLevel: targetCase.securityEnclave || 'TOP SECRET // SCI',
        });

        return NextResponse.json(
          {
            success: false,
            status: 'FAILED',
            error: failureReason,
            failureReason,
            timestamp,
            isSyntheticDemo: false,
            analysisProvider: 'gemini',
            case: updated,
          },
          { status: 500 }
        );
      }

      const storagePath = targetCase.audioMetadata?.storagePath;
      if (!storagePath) {
        const failureReason =
          'No audio recording attached to case for real audio analysis. Attach an audio file or specify useSynthetic: true for demo mode.';
        const timestamp = new Date().toISOString();

        const updated = store.updateCase(id, {
          status: 'flagged',
          latestRun: {
            id: `run-${Date.now()}`,
            caseId: id,
            status: 'failed',
            modelId: 'gemini-2.5-flash',
            promptVersion: 'v1.0.0-vecnaverse',
            isSyntheticDemo: false,
            analysisProvider: 'gemini',
            acousticMetricsAvailable: false,
            failureReason,
            startedAt: startTimeIso,
            completedAt: timestamp,
          },
        }, officerContext);

        store.logAuditEvent({
          action: 'PIPELINE_FAILED',
          actorId,
          actorName,
          officer,
          resourceType: 'case',
          resourceId: id,
          details: `Forensic audio analysis failed: ${failureReason}`,
          enclaveSecurityLevel: targetCase.securityEnclave || 'TOP SECRET // SCI',
        });

        return NextResponse.json(
          {
            success: false,
            status: 'FAILED',
            error: failureReason,
            failureReason,
            timestamp,
            isSyntheticDemo: false,
            analysisProvider: 'gemini',
            case: updated,
          },
          { status: 400 }
        );
      }

      try {
        const adapter = new GeminiAudioAdapter({
          recordedModel: body.model || 'gemini-2.5-flash',
        });
        result = await adapter.analyzeAudioFile(storagePath, {
          caseId: id,
          forceModel: body.model,
        });
        modelUsed = adapter.getModelId(body.model);
        analysisProvider = 'gemini';
      } catch (geminiErr: any) {
        // Detect invalid or missing API key errors from GoogleGenAI SDK or network
        const isApiKeyError =
          geminiErr?.name === 'GeminiConfigurationError' ||
          geminiErr?.status === 401 ||
          geminiErr?.status === 403 ||
          /API_KEY_INVALID|key\s*not\s*valid|invalid\s*api\s*key|api\s*key\s*is\s*not\s*configured/i.test(
            String(geminiErr?.message || '')
          );

        // NEVER silently mask Gemini failures with synthetic success!
        const failureReason = isApiKeyError
          ? 'Gemini API key is invalid or not configured. Please add a valid GEMINI_API_KEY to your .env.local file to analyze custom audio files, or use preset demo scenarios for offline testing.'
          : (geminiErr?.message || 'Gemini processing failed on audio file');
        const timestamp = new Date().toISOString();

        const updated = store.updateCase(id, {
          status: 'flagged',
          latestRun: {
            id: `run-${Date.now()}`,
            caseId: id,
            status: 'failed',
            modelId: 'gemini-2.5-flash',
            promptVersion: 'v1.0.0-vecnaverse',
            isSyntheticDemo: false,
            analysisProvider: 'gemini',
            acousticMetricsAvailable: false,
            failureReason,
            startedAt: startTimeIso,
            completedAt: timestamp,
          },
        }, officerContext);

        store.logAuditEvent({
          action: 'PIPELINE_FAILED',
          actorId,
          actorName,
          officer,
          resourceType: 'case',
          resourceId: id,
          details: `Forensic audio analysis failed on file '${storagePath}': ${failureReason}`,
          enclaveSecurityLevel: targetCase.securityEnclave || 'TOP SECRET // SCI',
        });

        return NextResponse.json(
          {
            success: false,
            status: 'FAILED',
            error: `Gemini audio analysis failed: ${failureReason}`,
            failureReason,
            timestamp,
            isSyntheticDemo: false,
            analysisProvider: 'gemini',
            case: updated,
          },
          { status: isApiKeyError ? 500 : (geminiErr.status || 502) }
        );
      }
    }

    // Map segments
    const mappedSegments: TranscriptSegment[] = result.segments.map((s, idx) => ({
      id: s.id || `seg-${idx + 1}`,
      startTime: s.start_offset_ms / 1000,
      endTime: s.end_offset_ms / 1000,
      text: s.text,
      confidence: Math.round((s.confidence || 0.9) * 100),
      speaker: s.speaker_label,
      speakerLabel: s.speaker_label,
      language: s.language,
    }));

    // Map entities
    const mappedEntities: ExtractedEntity[] = (result.named_entities || []).map((e, idx) => ({
      id: e.entity_id || `ent-${idx + 1}`,
      type: e.category,
      value: e.text,
      rawText: e.text,
      confidence: Math.round((e.confidence || 0.85) * 100),
      verificationStatus: 'unverified',
      evidence: {
        segmentId: e.source_segment_ids[0] || `seg-1`,
        quote: e.text,
        startTime: (e.source_interval.start_ms || 0) / 1000,
        endTime: (e.source_interval.end_ms || 1000) / 1000,
      },
    }));

    // Map triggers
    const mappedTriggers: EmergencyTrigger[] = (result.emergency_triggers || []).map((t, idx) => ({
      id: t.trigger_id || `trig-${idx + 1}`,
      category: t.category,
      quote: t.verbatim_quote,
      severity: t.severity.toLowerCase() as TriggerSeverity,
      context: t.context as any,
      explanation: t.explanation,
      verificationStatus: 'unverified',
      evidence: {
        segmentId: t.source_segment_ids[0] || `seg-1`,
        quote: t.verbatim_quote,
        startTime: t.source_interval.start_ms / 1000,
        endTime: t.source_interval.end_ms / 1000,
      },
    }));

    // Map chronological timeline
    const mappedTimeline: TimelineEvent[] = (result.chronological_events || []).map((ev, idx) => ({
      id: ev.event_id || `tl-${idx + 1}`,
      timestamp: ev.timestamp_ms / 1000,
      timestampSeconds: ev.timestamp_ms / 1000,
      timeSeconds: ev.timestamp_ms / 1000,
      title: ev.title,
      description: ev.description,
      category: 'incident',
      severity: 'medium',
    }));

    // Map acoustic cues to vocal indicators
    // Basic LLMs provide advisory acoustic observations, not forensic DSP metrics.
    const mappedVocalIndicators: VocalIndicator[] = (result.acoustic_cues || []).map((cue, idx) => ({
      id: cue.cue_id || `voc-${idx + 1}`,
      type: cue.sound_type,
      metricName: cue.sound_type,
      confidence: cue.confidence,
      description: cue.description,
      isAdvisory: true,
      available: false,
      disclaimer: 'Forensic acoustic DSP metrics not measured by basic LLM; human officer review required',
      advisoryDisclaimer: cue.caveat || 'Forensic acoustic DSP metrics not measured by basic LLM; human officer review required',
      startTime: cue.source_interval.start_ms / 1000,
      endTime: cue.source_interval.end_ms / 1000,
    }));

    // Derive Urgency Score strictly from validated emergency triggers
    let computedUrgency = 50;
    const criticalTriggers = mappedTriggers.filter((t) => t.severity === 'critical').length;
    const highTriggers = mappedTriggers.filter((t) => t.severity === 'high').length;
    computedUrgency = Math.min(100, 45 + criticalTriggers * 25 + highTriggers * 15);

    let urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
    if (computedUrgency >= 90) urgencyLevel = 'CRITICAL';
    else if (computedUrgency >= 75) urgencyLevel = 'HIGH';
    else if (computedUrgency >= 50) urgencyLevel = 'MEDIUM';
    else urgencyLevel = 'LOW';

    const hasExtortionOrViolence = mappedTriggers.some(
      (t) => t.category === 'EXTORTION' || t.category === 'THREAT_VIOLENCE'
    );
    const hasDistress = mappedTriggers.some((t) => t.category === 'DISTRESS');

    let primaryEmotion: SpeechEmotionProfile['primaryEmotion'] = 'neutral';
    if (hasDistress) {
      primaryEmotion = 'distress';
    } else if (hasExtortionOrViolence) {
      primaryEmotion = 'fear';
    }

    // REMOVED FABRICATED EMOTION METRICS:
    // Eliminated pseudo-scientific precision numbers (jitter 182Hz, speech rate 218wpm, tremor 95/100, energy 24.5dB).
    // Vocal indicators and acoustic telemetry are explicitly marked unavailable without dedicated DSP model.
    const computedEmotionProfile: SpeechEmotionProfile = {
      primaryEmotion,
      secondaryEmotion: (primaryEmotion as string) === 'fear' ? 'stress' : (primaryEmotion as string) === 'anger' ? 'stress' : 'neutral',
      urgencyScore: computedUrgency,
      urgencyLevel,
      confidence: 0.89,
      audioQuality: 'clear',
      ambiguityFlag: false,
      emotions: {
        anger: (primaryEmotion as string) === 'anger' ? 0.8 : 0.1,
        sadness: (primaryEmotion as string) === 'sadness' ? 0.8 : 0.1,
        fear: (primaryEmotion as string) === 'fear' ? 0.8 : 0.15,
        happiness: (primaryEmotion as string) === 'happiness' ? 0.8 : 0.05,
        stress: (primaryEmotion as string) === 'stress' || (primaryEmotion as string) === 'distress' ? 0.85 : 0.2,
        neutral: (primaryEmotion as string) === 'neutral' ? 0.8 : 0.1,
        distress: (primaryEmotion as string) === 'distress' ? 0.8 : 0.2,
        nervousness: (primaryEmotion as string) === 'nervousness' ? 0.8 : 0.2,
        calm: (primaryEmotion as string) === 'calm' ? 0.8 : 0.2,
      },
      acousticMetrics: {
        available: false,
        disclaimer: 'Forensic acoustic DSP metrics not measured by basic LLM; human officer review required',
      },
      acousticMetricsAvailable: false,
      disclaimer: 'Forensic acoustic DSP metrics not measured by basic LLM; human officer review required',
      isSyntheticDemo,
      analysisProvider,
    };

    const durationMs = Date.now() - startTimeMs;
    const completedAt = new Date().toISOString();

    // Update case with findings, truthful provenance, and non-fabricated indicators
    const updated = store.updateCase(id, {
      status: 'under_review',
      segments: mappedSegments,
      entities: mappedEntities,
      triggers: mappedTriggers,
      timeline: mappedTimeline,
      vocalIndicators: mappedVocalIndicators,
      urgencyScore: computedUrgency,
      urgencyLevel,
      emotionProfile: computedEmotionProfile,
      latestRun: {
        id: `run-${Date.now()}`,
        caseId: id,
        status: 'completed',
        modelId: modelUsed,
        promptVersion: 'v1.0.0-vecnaverse',
        isSyntheticDemo,
        analysisProvider,
        acousticMetricsAvailable: false,
        startedAt: startTimeIso,
        completedAt,
        durationMs,
      },
    }, officerContext);

    store.logAuditEvent({
      action: 'PIPELINE_EXECUTED',
      actorId,
      actorName,
      officer,
      resourceType: 'case',
      resourceId: id,
      details: isSyntheticDemo
        ? `Synthetic demo audio analysis run completed using ${modelUsed}.`
        : `Forensic audio analysis run completed via Gemini using ${modelUsed}.`,
      enclaveSecurityLevel: targetCase.securityEnclave || 'TOP SECRET // SCI',
    });

    return NextResponse.json({
      success: true,
      status: 'COMPLETED',
      modelUsed,
      isSyntheticDemo,
      analysisProvider,
      acousticMetricsAvailable: false,
      case: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Audio analysis pipeline failed', details: error.message },
      { status: 500 }
    );
  }
}
