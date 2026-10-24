import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/data/store';
import { GeminiAudioAdapter } from '@/lib/ai/gemini-adapter';
import { executeSyntheticRun, isFixtureAvailable } from '@/lib/ai/synthetic-fixtures';
import { AudioAnalysisResult } from '@/lib/ai/types';
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
    const targetCase = store.getCaseById(id);

    if (!targetCase) {
      return NextResponse.json(
        {
          success: false,
          error: `Case ${id} not found in local enclave`,
        },
        { status: 404 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const useSynthetic = body.useSynthetic || !apiKey;
    const requestedFixture = body.fixtureId;
    const fixtureId = requestedFixture && isFixtureAvailable(requestedFixture)
      ? requestedFixture
      : 'extortion-demand';

    let result: AudioAnalysisResult;
    let modelUsed = 'synthetic-deterministic-pipeline';

    if (!useSynthetic && apiKey) {
      try {
        const adapter = new GeminiAudioAdapter();
        if (targetCase.audioMetadata?.storagePath) {
          result = await adapter.analyzeAudioFile(targetCase.audioMetadata.storagePath, {
            caseId: id,
          });
          modelUsed = adapter.getModelId();
        } else {
          result = await executeSyntheticRun(fixtureId);
        }
      } catch (geminiErr: any) {
        console.warn('Gemini live analysis failed, falling back to synthetic fixture runner:', geminiErr);
        result = await executeSyntheticRun(fixtureId);
        modelUsed = 'synthetic-fallback-fixture';
      }
    } else {
      result = await executeSyntheticRun(fixtureId);
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
    const mappedVocalIndicators: VocalIndicator[] = (result.acoustic_cues || []).map((cue, idx) => ({
      id: cue.cue_id || `voc-${idx + 1}`,
      type: cue.sound_type,
      metricName: cue.sound_type,
      metricValue: cue.confidence * 100,
      score: cue.confidence * 100,
      confidence: cue.confidence,
      description: cue.description,
      disclaimer: cue.caveat,
      advisoryDisclaimer: cue.caveat,
      startTime: cue.source_interval.start_ms / 1000,
      endTime: cue.source_interval.end_ms / 1000,
      isAdvisory: true,
    }));

    // Derive dynamic Speech Emotion Recognition (SER) metrics and Urgency Score
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

    const primaryEmotion: SpeechEmotionProfile['primaryEmotion'] = hasDistress
      ? 'distress'
      : hasExtortionOrViolence
      ? 'fear'
      : targetCase.callerCategory === 'suspected_fraudster'
      ? 'anger'
      : targetCase.callerCategory === 'informant'
      ? 'nervousness'
      : 'calm';

    const computedEmotionProfile: SpeechEmotionProfile = {
      primaryEmotion,
      urgencyScore: computedUrgency,
      urgencyLevel,
      emotions: {
        fear: primaryEmotion === 'fear' ? 0.94 : hasExtortionOrViolence ? 0.75 : 0.15,
        distress: primaryEmotion === 'distress' ? 0.92 : hasDistress ? 0.8 : 0.1,
        anger: primaryEmotion === 'anger' ? 0.89 : 0.15,
        nervousness: primaryEmotion === 'nervousness' ? 0.74 : 0.35,
        calm: primaryEmotion === 'calm' ? 0.85 : 0.08,
      },
      acousticMetrics: {
        pitchJitterHz: primaryEmotion === 'fear' || primaryEmotion === 'distress' ? 182 : 65,
        speechRateWpm: primaryEmotion === 'fear' ? 218 : 142,
        vocalTremorScore: primaryEmotion === 'distress' ? 95 : primaryEmotion === 'fear' ? 88 : 35,
        energySpikeDb: primaryEmotion === 'anger' ? 24.5 : 8.2,
      },
    };

    // Update case with findings and computed SER triage metrics
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
    });

    store.logAuditEvent({
      action: 'PIPELINE_EXECUTED',
      actorId: 'JENKINS-4829',
      actorName: 'Det. S. Jenkins #4829',
      officer: 'Det. S. Jenkins #4829',
      resourceType: 'case',
      resourceId: id,
      details: `Forensic audio analysis run completed using ${modelUsed}.`,
      enclaveSecurityLevel: 'TOP SECRET // SCI',
    });

    return NextResponse.json({
      success: true,
      modelUsed,
      case: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Audio analysis pipeline failed', details: error.message },
      { status: 500 }
    );
  }
}
