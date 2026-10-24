/**
 * VECNAVERSE: Voice-to-Investigation Cybercrime Audio Intelligence
 * AI & Audio Analysis Domain Types and Runtime Schemas
 *
 * Implements strict schema boundaries, non-evidentiary caveats,
 * context-preserving emergency triggers, and neutral speaker representations.
 */

import { z } from 'zod';

// ==============================================================================
// 1. Audio Transcript & Speaker Segment Schemas
// ==============================================================================

export const AudioSegmentSchema = z.object({
  id: z.string().min(1, 'Segment ID is required'),
  start_offset_ms: z.number().nonnegative('Start offset must be >= 0'),
  end_offset_ms: z.number().nonnegative('End offset must be >= 0'),
  speaker_label: z.string().min(1, 'Neutral speaker label required (e.g. SPEAKER_01)'),
  text: z.string().min(1, 'Segment text must not be empty'),
  language: z.string().default('en'),
  confidence: z.number().min(0).max(1).default(1.0),
}).refine((seg) => seg.end_offset_ms >= seg.start_offset_ms, {
  message: 'end_offset_ms must be greater than or equal to start_offset_ms',
  path: ['end_offset_ms'],
});

export type AudioSegment = z.infer<typeof AudioSegmentSchema>;

export const SpeakerTurnSchema = z.object({
  speaker_label: z.string().min(1),
  start_offset_ms: z.number().nonnegative(),
  end_offset_ms: z.number().nonnegative(),
  summary: z.string().optional(),
});

export type SpeakerTurn = z.infer<typeof SpeakerTurnSchema>;

// ==============================================================================
// 2. Named Entity Schemas (Strictly explicit, no external enrichment)
// ==============================================================================

export const EntityCategorySchema = z.enum([
  'PERSON',
  'LOCATION',
  'ORGANIZATION',
  'PHONE',
  'DATE_TIME',
  'VEHICLE',
  'MONETARY_AMOUNT',
  'WEAPON',
  'OTHER',
]);

export type EntityCategory = z.infer<typeof EntityCategorySchema>;

export const SourceIntervalSchema = z.object({
  start_ms: z.number().nonnegative(),
  end_ms: z.number().nonnegative(),
}).refine((interval) => interval.end_ms >= interval.start_ms, {
  message: 'end_ms must be >= start_ms',
  path: ['end_ms'],
});

export type SourceInterval = z.infer<typeof SourceIntervalSchema>;

export const NamedEntitySchema = z.object({
  entity_id: z.string().min(1),
  category: EntityCategorySchema,
  text: z.string().min(1, 'Extracted entity text cannot be empty'),
  source_segment_ids: z.array(z.string()).min(1, 'Must anchor to at least one segment ID'),
  source_interval: SourceIntervalSchema,
  confidence: z.number().min(0).max(1).default(1.0),
  // Guardrail PRD-CHECK-05: Entities remain unverified until officer confirms
  unverified: z.boolean().default(true),
});

export type NamedEntity = z.infer<typeof NamedEntitySchema>;

// ==============================================================================
// 3. Emergency Trigger Schemas (Context-aware: Negation, History, Hypothetical)
// ==============================================================================

export const TriggerCategorySchema = z.enum([
  'EXTORTION',
  'THREAT_VIOLENCE',
  'CALL_FOR_HELP',
  'KIDNAPPING_RANSOM',
  'WEAPON_MENTION',
  'SUSPICIOUS_MEETING',
  'DISTRESS',
  'OTHER',
]);

export type TriggerCategory = z.infer<typeof TriggerCategorySchema>;

export const TriggerContextSchema = z.enum([
  'DIRECT',        // Active, immediate, direct statement
  'NEGATED',       // Explicitly stated as NOT happening ("no bomb", "I am not threatening")
  'HYPOTHETICAL',  // Conditional / hypothetical discussion ("if someone were to")
  'HISTORICAL',    // Recounting a past event ("last year they threatened me")
  'QUOTED',        // Quoting someone else or reporting 3rd party statement
]);

export type TriggerContext = z.infer<typeof TriggerContextSchema>;

export const TriggerSeveritySchema = z.enum([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

export type TriggerSeverity = z.infer<typeof TriggerSeveritySchema>;

export const EmergencyTriggerSchema = z.object({
  trigger_id: z.string().min(1),
  category: TriggerCategorySchema,
  verbatim_quote: z.string().min(1, 'Verbatim quote is required'),
  context: TriggerContextSchema,
  explanation: z.string().min(1, 'Contextual rationale required'),
  source_segment_ids: z.array(z.string()).min(1, 'Must link to source segment'),
  source_interval: SourceIntervalSchema,
  severity: TriggerSeveritySchema,
});

export type EmergencyTrigger = z.infer<typeof EmergencyTriggerSchema>;

// ==============================================================================
// 4. Advisory Acoustic Cue Schemas (Strict non-evidentiary, no lie detection)
// ==============================================================================

export const AcousticCueTypeSchema = z.enum([
  'RAISED_VOICE',
  'BACKGROUND_NOISE',
  'GUNSHOT_BANG',
  'SIREN',
  'CRYING_SOBBING',
  'WHISPERING',
  'RAPID_SPEECH',
  'LONG_PAUSE',
  'TREMBLING_VOICE',
  'OTHER',
]);

export type AcousticCueType = z.infer<typeof AcousticCueTypeSchema>;

export const STANDARD_ACOUSTIC_CAVEAT =
  'Advisory acoustic observation only. Not forensic evidence; does not infer guilt, deception, honesty, or psychological intent.';

export const STANDARD_FORENSIC_DSP_DISCLAIMER =
  'Forensic acoustic DSP metrics not measured by basic LLM; human officer review required';

export const AcousticCueSchema = z.object({
  cue_id: z.string().min(1),
  source_interval: SourceIntervalSchema,
  sound_type: AcousticCueTypeSchema,
  description: z.string().min(1),
  confidence: z.number().min(0).max(1).default(0.8),
  caveat: z.string().default(STANDARD_ACOUSTIC_CAVEAT),
  available: z.boolean().optional(),
  disclaimer: z.string().optional(),
});

export type AcousticCue = z.infer<typeof AcousticCueSchema>;

// ==============================================================================
// 5. Chronological Timeline Event Schema
// ==============================================================================

export const ChronologicalEventSchema = z.object({
  event_id: z.string().min(1),
  timestamp_ms: z.number().nonnegative(),
  title: z.string().min(1),
  description: z.string().min(1),
  source_segment_ids: z.array(z.string()).default([]),
});

export type ChronologicalEvent = z.infer<typeof ChronologicalEventSchema>;

// ==============================================================================
// 6. Complete Audio Analysis Result & Metadata Schema
// ==============================================================================

export const AnalysisMetadataSchema = z.object({
  model_id: z.string().default('gemini-2.5-flash'),
  modelId: z.string().optional(),
  run_timestamp: z.string(),
  duration_seconds: z.number().nonnegative(),
  language_detected: z.string(),
  speaker_count: z.number().int().nonnegative(),
  execution_time_ms: z.number().nonnegative(),
  is_synthetic_fixture: z.boolean().optional(),
  isSyntheticDemo: z.boolean().optional(),
  analysisProvider: z.string().optional(),
  acousticMetricsAvailable: z.boolean().optional(),
  failureReason: z.string().optional(),
  fixture_id: z.string().optional(),
  audio_format: z.string().optional(),
  prompt_version: z.string().default('v1.0.0-vecnaverse'),
  schema_version: z.string().default('v1.0.0'),
});

export type AnalysisMetadata = z.infer<typeof AnalysisMetadataSchema>;

export const AudioAnalysisResultSchema = z.object({
  segments: z.array(AudioSegmentSchema),
  speaker_turns: z.array(SpeakerTurnSchema).default([]),
  named_entities: z.array(NamedEntitySchema).default([]),
  emergency_triggers: z.array(EmergencyTriggerSchema).default([]),
  acoustic_cues: z.array(AcousticCueSchema).default([]),
  chronological_events: z.array(ChronologicalEventSchema).default([]),
  metadata: AnalysisMetadataSchema,
  isSyntheticDemo: z.boolean().optional(),
  analysisProvider: z.string().optional(),
  acousticMetricsAvailable: z.boolean().optional(),
  modelId: z.string().optional(),
  failureReason: z.string().optional(),
});

export type AudioAnalysisResult = z.infer<typeof AudioAnalysisResultSchema>;

// ==============================================================================
// 7. Analysis Run Execution Schema & Provenance
// ==============================================================================

export const AnalysisRunStatusSchema = z.enum([
  'queued',
  'in_progress',
  'completed',
  'partial',
  'failed',
  'cancelled',
  'QUEUED',
  'IN_PROGRESS',
  'COMPLETED',
  'PARTIAL',
  'FAILED',
  'CANCELLED',
]);

export type AnalysisRunStatus = z.infer<typeof AnalysisRunStatusSchema>;

export const AnalysisRunSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  recordingId: z.string().optional(),
  status: AnalysisRunStatusSchema,
  modelId: z.string().default('gemini-2.5-flash'),
  promptVersion: z.string().default('v1.0.0-vecnaverse'),
  isSyntheticDemo: z.boolean().default(false),
  analysisProvider: z.string().default('gemini'),
  acousticMetricsAvailable: z.boolean().default(false),
  failureReason: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().nullable().optional(),
  durationMs: z.number().optional(),
  summary: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AnalysisRun = z.infer<typeof AnalysisRunSchema>;

// Prohibited terms for deception/guilt inference (guardrails PRD-FR-011, PRD-FR-012, TEST-019)
export const PROHIBITED_INFERENCE_TERMS = [
  'lying',
  'liar',
  'deceptive',
  'deception',
  'guilty',
  'guilt',
  'dishonest',
  'dishonesty',
  'polygraph',
  'lie detector',
  'untruthful',
  'culpable',
] as const;
