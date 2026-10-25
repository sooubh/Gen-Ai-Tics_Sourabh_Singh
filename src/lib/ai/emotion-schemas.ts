/**
 * VECNAVERSE: Voice-to-Investigation Cybercrime Audio Intelligence
 * Speech Emotion Recognition (SER) Schemas, Types, and Helper Utilities
 *
 * Implements strict runtime validation for the 6 target emotions,
 * vocal cues, uncertainty indicators, per-segment and session analyses,
 * urgency calculation, and fallback mock generators.
 */

import { z } from 'zod';

// ==============================================================================
// 1. Target Emotions & Severity Types
// ==============================================================================

export const TARGET_EMOTIONS = [
  'anger',
  'sadness',
  'fear',
  'happiness',
  'stress',
  'neutral',
] as const;

export type TargetEmotion = (typeof TARGET_EMOTIONS)[number];

export const TargetEmotionSchema = z.enum(TARGET_EMOTIONS);

export const VocalCueSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type VocalCueSeverity = z.infer<typeof VocalCueSeveritySchema>;

export const AudioQualitySchema = z.enum(['clear', 'noisy', 'distorted', 'low_volume']);
export type AudioQuality = z.infer<typeof AudioQualitySchema>;

export const UrgencyLevelSchema = z.enum(['low', 'medium', 'high', 'critical']);
export type UrgencyLevel = z.infer<typeof UrgencyLevelSchema>;

// ==============================================================================
// 2. Emotion Scores Schema (0.0 to 1.0 strictly for each target emotion)
// ==============================================================================

export const EmotionScoresSchema = z.object({
  anger: z.number().min(0, 'anger score must be >= 0').max(1, 'anger score must be <= 1'),
  sadness: z.number().min(0, 'sadness score must be >= 0').max(1, 'sadness score must be <= 1'),
  fear: z.number().min(0, 'fear score must be >= 0').max(1, 'fear score must be <= 1'),
  happiness: z.number().min(0, 'happiness score must be >= 0').max(1, 'happiness score must be <= 1'),
  stress: z.number().min(0, 'stress score must be >= 0').max(1, 'stress score must be <= 1'),
  neutral: z.number().min(0, 'neutral score must be >= 0').max(1, 'neutral score must be <= 1'),
});

export type EmotionScores = z.infer<typeof EmotionScoresSchema>;

// ==============================================================================
// 3. Vocal Cue & Uncertainty Schemas
// ==============================================================================

export const VocalCueSchema = z.object({
  cue_type: z.string().min(1, 'cue_type must not be empty'),
  description: z.string(),
  severity: VocalCueSeveritySchema,
  timestamp_ms: z.number().nonnegative('timestamp_ms must be non-negative'),
});

export type VocalCue = z.infer<typeof VocalCueSchema>;

export const UncertaintyIndicatorSchema = z.object({
  confidence_score: z
    .number()
    .min(0, 'confidence_score must be >= 0')
    .max(1, 'confidence_score must be <= 1'),
  audio_quality: AudioQualitySchema,
  ambiguity_detected: z.boolean(),
  caveats: z.array(z.string()).default([]),
});

export type UncertaintyIndicator = z.infer<typeof UncertaintyIndicatorSchema>;

// ==============================================================================
// 4. Segment Emotion Result Schema
// ==============================================================================

export const SegmentEmotionResultSchema = z.object({
  segment_id: z.string().min(1, 'segment_id is required'),
  start_ms: z.number().nonnegative('start_ms must be non-negative'),
  end_ms: z.number().nonnegative('end_ms must be non-negative'),
  start_time_seconds: z.number().nonnegative('start_time_seconds must be non-negative'),
  end_time_seconds: z.number().nonnegative('end_time_seconds must be non-negative'),
  transcript: z.string(),
  speaker_label: z.string().min(1, 'speaker_label is required'),
  primary_emotion: TargetEmotionSchema,
  secondary_emotion: TargetEmotionSchema.nullable().optional(),
  emotion_scores: EmotionScoresSchema,
  vocal_cues: z.array(VocalCueSchema).default([]),
  uncertainty: UncertaintyIndicatorSchema,
});

export type SegmentEmotionResult = z.infer<typeof SegmentEmotionResultSchema>;

// ==============================================================================
// 5. Full Voice Emotion Analysis Schema
// ==============================================================================

export const DominantCueSchema = z.union([VocalCueSchema, z.string()]);
export type DominantCue = z.infer<typeof DominantCueSchema>;

export const OverallEmotionSchema = z.object({
  primary_emotion: TargetEmotionSchema,
  secondary_emotion: TargetEmotionSchema.nullable().optional(),
  urgency_score: z
    .number()
    .min(0, 'urgency_score must be >= 0')
    .max(100, 'urgency_score must be <= 100'),
  urgency_level: UrgencyLevelSchema,
  emotion_scores: EmotionScoresSchema,
  dominant_cues: z.array(DominantCueSchema).default([]),
  uncertainty: UncertaintyIndicatorSchema,
});

export type OverallEmotion = z.infer<typeof OverallEmotionSchema>;

export const EmotionAnalysisMetadataSchema = z.object({
  model_id: z.string().min(1, 'model_id is required'),
  duration_seconds: z.number().nonnegative('duration_seconds must be non-negative'),
  processed_at: z.string(),
  cost_estimate_usd: z.number().nonnegative('cost_estimate_usd must be non-negative'),
  audio_format: z.string(),
  is_live_stream: z.boolean().default(false),
});

export type EmotionAnalysisMetadata = z.infer<typeof EmotionAnalysisMetadataSchema>;

export const FullVoiceEmotionAnalysisSchema = z.object({
  session_id: z.string().min(1, 'session_id is required'),
  overall: OverallEmotionSchema,
  segments: z.array(SegmentEmotionResultSchema),
  metadata: EmotionAnalysisMetadataSchema,
});

export type FullVoiceEmotionAnalysis = z.infer<typeof FullVoiceEmotionAnalysisSchema>;

// ==============================================================================
// 6. Validation Helpers
// ==============================================================================

export function validateTargetEmotion(data: unknown): TargetEmotion {
  return TargetEmotionSchema.parse(data);
}

export function validateEmotionScores(data: unknown): EmotionScores {
  return EmotionScoresSchema.parse(data);
}

export function validateVocalCue(data: unknown): VocalCue {
  return VocalCueSchema.parse(data);
}

export function validateUncertaintyIndicator(data: unknown): UncertaintyIndicator {
  return UncertaintyIndicatorSchema.parse(data);
}

export function validateSegmentEmotionResult(data: unknown): SegmentEmotionResult {
  return SegmentEmotionResultSchema.parse(data);
}

export function validateFullVoiceEmotionAnalysis(data: unknown): FullVoiceEmotionAnalysis {
  return FullVoiceEmotionAnalysisSchema.parse(data);
}

export function safeValidateEmotionAnalysis(data: unknown) {
  return FullVoiceEmotionAnalysisSchema.safeParse(data);
}

export function isTargetEmotion(value: unknown): value is TargetEmotion {
  return TargetEmotionSchema.safeParse(value).success;
}

// ==============================================================================
// 7. Urgency Calculation Helper
// ==============================================================================

/**
 * Calculates a triage urgency score (0-100) and urgency level ('low'|'medium'|'high'|'critical')
 * derived strictly from weighted speech emotion recognition scores and acoustic distress cues.
 */
export function calculateUrgency(
  scores: Partial<EmotionScores>,
  cues: Array<VocalCue | string> = []
): { urgencyScore: number; urgencyLevel: UrgencyLevel } {
  const fear = Math.max(0, Math.min(1, scores.fear ?? 0));
  const stress = Math.max(0, Math.min(1, scores.stress ?? 0));
  const anger = Math.max(0, Math.min(1, scores.anger ?? 0));
  const sadness = Math.max(0, Math.min(1, scores.sadness ?? 0));
  const happiness = Math.max(0, Math.min(1, scores.happiness ?? 0));
  const neutral = Math.max(0, Math.min(1, scores.neutral ?? 0));

  // Base weighted score: fear (40%), stress (35%), anger (25%), sadness (10%)
  // Mitigated by neutral/calm/happiness (-20%)
  let rawScore =
    fear * 40 +
    stress * 35 +
    anger * 25 +
    sadness * 10 -
    happiness * 20 -
    neutral * 20;

  // Add acoustic vocal cue modifiers
  for (const cue of cues) {
    if (typeof cue === 'object' && cue !== null) {
      if (cue.severity === 'critical') rawScore += 15;
      else if (cue.severity === 'high') rawScore += 10;
      else if (cue.severity === 'medium') rawScore += 5;
    }
  }

  const urgencyScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  let urgencyLevel: UrgencyLevel = 'low';
  if (urgencyScore >= 80) {
    urgencyLevel = 'critical';
  } else if (urgencyScore >= 60) {
    urgencyLevel = 'high';
  } else if (urgencyScore >= 35) {
    urgencyLevel = 'medium';
  } else {
    urgencyLevel = 'low';
  }

  return { urgencyScore, urgencyLevel };
}

export const calculateUrgencyFromScores = calculateUrgency;


// ==============================================================================
// 8. Mock & Fallback Analysis Generators
// ==============================================================================

/**
 * Generates an advisory mock emotion analysis adhering to FullVoiceEmotionAnalysisSchema.
 */
export function generateMockEmotionAnalysis(
  overrides?: Partial<FullVoiceEmotionAnalysis>
): FullVoiceEmotionAnalysis {
  const defaultScores: EmotionScores = {
    anger: 0.15,
    sadness: 0.1,
    fear: 0.65,
    happiness: 0.0,
    stress: 0.82,
    neutral: 0.1,
  };

  const defaultCues: VocalCue[] = [
    {
      cue_type: 'vocal_tremor',
      description: 'Acoustic pitch perturbation and tremor indicating heightened acute distress',
      severity: 'high',
      timestamp_ms: 1800,
    },
    {
      cue_type: 'pitch_strain',
      description: 'Frequency elevation and elevated speech cadence during ransom ultimatum',
      severity: 'critical',
      timestamp_ms: 3600,
    },
  ];

  const { urgencyScore, urgencyLevel } = calculateUrgency(defaultScores, defaultCues);

  const mock: FullVoiceEmotionAnalysis = {
    session_id: overrides?.session_id || `session-mock-${Date.now()}`,
    overall: {
      primary_emotion: 'stress',
      secondary_emotion: 'fear',
      urgency_score: urgencyScore,
      urgency_level: urgencyLevel,
      emotion_scores: defaultScores,
      dominant_cues: defaultCues,
      uncertainty: {
        confidence_score: 0.88,
        audio_quality: 'clear',
        ambiguity_detected: false,
        caveats: [
          'Advisory assistive analysis only; not a lie detector or legal proof of guilt.',
          'Acoustic markers observed require investigator review.',
        ],
      },
      ...overrides?.overall,
    },
    segments: overrides?.segments || [
      {
        segment_id: 'seg-1',
        start_ms: 0,
        end_ms: 3200,
        start_time_seconds: 0,
        end_time_seconds: 3.2,
        transcript: 'Listen to me, you have two hours to send the transfer or the server keys get wiped!',
        speaker_label: 'SPEAKER_01',
        primary_emotion: 'anger',
        secondary_emotion: 'stress',
        emotion_scores: {
          anger: 0.88,
          sadness: 0.05,
          fear: 0.1,
          happiness: 0.0,
          stress: 0.75,
          neutral: 0.05,
        },
        vocal_cues: [
          {
            cue_type: 'vocal_strain',
            description: 'Aggressive acoustic modulation and pitch peaks',
            severity: 'critical',
            timestamp_ms: 1400,
          },
        ],
        uncertainty: {
          confidence_score: 0.92,
          audio_quality: 'clear',
          ambiguity_detected: false,
          caveats: [],
        },
      },
      {
        segment_id: 'seg-2',
        start_ms: 3300,
        end_ms: 7500,
        start_time_seconds: 3.3,
        end_time_seconds: 7.5,
        transcript: 'Please don\'t do this, our hospital operations depend on those backup records!',
        speaker_label: 'SPEAKER_02',
        primary_emotion: 'fear',
        secondary_emotion: 'stress',
        emotion_scores: {
          anger: 0.05,
          sadness: 0.45,
          fear: 0.85,
          happiness: 0.0,
          stress: 0.9,
          neutral: 0.05,
        },
        vocal_cues: [
          {
            cue_type: 'vocal_tremor',
            description: 'Micro-tremor in vocal tract, pitch destabilization',
            severity: 'high',
            timestamp_ms: 4200,
          },
        ],
        uncertainty: {
          confidence_score: 0.89,
          audio_quality: 'clear',
          ambiguity_detected: false,
          caveats: [],
        },
      },
    ],
    metadata: {
      model_id: 'gemini-3.8-flash',
      duration_seconds: 7.5,
      processed_at: new Date().toISOString(),
      cost_estimate_usd: 0.002,
      audio_format: 'audio/wav',
      is_live_stream: false,
      ...overrides?.metadata,
    },
  };

  return FullVoiceEmotionAnalysisSchema.parse(mock);
}

/**
 * Generates a safe fallback analysis when audio is noisy, degraded, or processing fails safely.
 */
export function generateFallbackEmotionAnalysis(
  reason: string = 'Audio analysis fallback triggered due to audio degradation or provider unavailability.',
  durationSeconds: number = 0
): FullVoiceEmotionAnalysis {
  const neutralScores: EmotionScores = {
    anger: 0.0,
    sadness: 0.0,
    fear: 0.0,
    happiness: 0.0,
    stress: 0.0,
    neutral: 1.0,
  };

  const fallback: FullVoiceEmotionAnalysis = {
    session_id: `fallback-session-${Date.now()}`,
    overall: {
      primary_emotion: 'neutral',
      secondary_emotion: null,
      urgency_score: 10,
      urgency_level: 'low',
      emotion_scores: neutralScores,
      dominant_cues: [],
      uncertainty: {
        confidence_score: 0.1,
        audio_quality: 'noisy',
        ambiguity_detected: true,
        caveats: [
          reason,
          'Emotion estimation abstained: Audio features insufficient for confident classification.',
        ],
      },
    },
    segments: [],
    metadata: {
      model_id: 'gemini-3.8-flash',
      duration_seconds: Math.max(0, durationSeconds),
      processed_at: new Date().toISOString(),
      cost_estimate_usd: 0,
      audio_format: 'audio/wav',
      is_live_stream: false,
    },
  };

  return FullVoiceEmotionAnalysisSchema.parse(fallback);
}

// ==============================================================================
// 9. Live Emotion Streaming Schemas & Response Validator
// ==============================================================================

export const LiveEmotionTimestampsSchema = z.object({
  start_ms: z.number().nonnegative(),
  end_ms: z.number().nonnegative(),
  duration_ms: z.number().nonnegative(),
});

export const LiveVocalCueSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  type: z.string().optional(),
  cue_type: z.string().optional(),
  description: z.string(),
  severity: VocalCueSeveritySchema,
  timestamp_ms: z.number().nonnegative().optional(),
  timestamp: z.number().optional(),
  score: z.number().optional(),
});

export const LiveEmotionResponseSchema = z.object({
  success: z.literal(true),
  timestamp: z.string(),
  timestamps: LiveEmotionTimestampsSchema,
  transcript: z.string(),
  primaryEmotion: TargetEmotionSchema,
  secondaryEmotion: TargetEmotionSchema.nullable().optional(),
  primary_emotion: TargetEmotionSchema.optional(),
  secondary_emotion: TargetEmotionSchema.nullable().optional(),
  emotions: EmotionScoresSchema,
  emotion_scores: EmotionScoresSchema.optional(),
  urgencyScore: z.number().min(0).max(100),
  urgencyLevel: UrgencyLevelSchema,
  confidence: z.number().min(0).max(1),
  audioQuality: AudioQualitySchema,
  ambiguityFlag: z.boolean(),
  vocalCues: z.array(z.union([VocalCueSchema, LiveVocalCueSchema, z.string()])),
  vocal_cues: z.array(z.union([VocalCueSchema, LiveVocalCueSchema, z.string()])).optional(),
  uncertainty: UncertaintyIndicatorSchema,
  model: z.string(),
  receivedBytes: z.number().nonnegative().optional(),
  analysis: FullVoiceEmotionAnalysisSchema.optional(),
});

export type LiveEmotionResponse = z.infer<typeof LiveEmotionResponseSchema>;

export function validateLiveEmotionResponse(data: unknown): LiveEmotionResponse {
  return LiveEmotionResponseSchema.parse(data);
}

