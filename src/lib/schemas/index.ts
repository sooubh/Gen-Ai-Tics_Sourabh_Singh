/**
 * ==============================================================================
 * VECNAVERSE: Voice-to-Investigation Cybercrime Audio Intelligence
 * Runtime Zod Validation Schemas (src/lib/schemas/index.ts)
 * ==============================================================================
 * Comprehensive runtime validation for:
 * 1. Client HTTP Requests (CRUD, Upload authorization, Analysis start, Reviews)
 * 2. Server API Responses (Standard envelopes, errors, and pagination)
 * 3. AI Provider Model Raw Outputs (STT normalization, Entities, Triggers, Acoustics)
 * 4. Human-in-the-Loop Evidentiary Actions (Review transitions, corrections, locks)
 */

import { z } from 'zod';
import {
  DISCLAIMER_ADVISORY_VOCAL_METRICS,
  DISCLAIMER_LEGAL_EVIDENCE,
  DISCLAIMER_NO_EMERGENCY_DISPATCH,
} from '@/types';

// ==============================================================================
// 1. Core Disclaimers & Evidentiary Constants
// ==============================================================================

export {
  DISCLAIMER_ADVISORY_VOCAL_METRICS,
  DISCLAIMER_LEGAL_EVIDENCE,
  DISCLAIMER_NO_EMERGENCY_DISPATCH,
};

// ==============================================================================
// 2. Case Management Schemas
// ==============================================================================

export const CaseStatusSchema = z.enum([
  'draft',
  'active',
  'under_review',
  'closed',
  'archived',
]);

export const CasePrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
  'urgent',
]);

export const CaseSchema = z.object({
  id: z.string().uuid(),
  caseNumber: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_\-\.\/]+$/i, {
      message: 'Case number may only contain alphanumeric characters, hyphens, slashes, and periods',
    }),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  status: CaseStatusSchema,
  priority: CasePrioritySchema,
  leadInvestigatorId: z.string().min(1),
  assignedOfficerName: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  agency: z.string().max(100).optional(),
  tags: z.array(z.string().min(1).max(50)).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable().optional(),
});

export const CreateCaseRequestSchema = z.object({
  caseNumber: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Z0-9_\-\.\/]+$/i, {
      message: 'Case number may only contain alphanumeric characters, hyphens, slashes, and periods',
    })
    .optional(),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(2000).optional(),
  priority: CasePrioritySchema.default('medium'),
  department: z.string().max(100).optional(),
  agency: z.string().max(100).optional(),
  tags: z.array(z.string().min(1).max(50)).default([]),
});

export const UpdateCaseRequestSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: CaseStatusSchema.optional(),
  priority: CasePrioritySchema.optional(),
  assignedOfficerName: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  agency: z.string().max(100).optional(),
  tags: z.array(z.string().min(1).max(50)).optional(),
});

export const CaseFilterQuerySchema = z.object({
  status: CaseStatusSchema.optional(),
  priority: CasePrioritySchema.optional(),
  search: z.string().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sortBy: z.enum(['createdAt', 'updatedAt', 'priority', 'caseNumber']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ==============================================================================
// 3. Audio Recording & Ingestion Schemas
// ==============================================================================

export const RecordingStatusSchema = z.enum([
  'pending_upload',
  'uploaded',
  'processing',
  'ready',
  'failed',
  'expired',
  'deleted',
]);

export const AudioSourceTypeSchema = z.enum(['recorded_file', 'live_stream']);

export const AudioFormatSchema = z.enum([
  'mp3',
  'wav',
  'ogg',
  'm4a',
  'webm',
  'flac',
  'unknown',
]);

export const AudioMetadataSchema = z.object({
  durationSeconds: z.number().nonnegative().max(1800, {
    message: 'Audio duration cannot exceed 30 minutes (1800s) for single-session investigation',
  }),
  fileSizeBytes: z.number().int().positive().max(524288000, {
    message: 'File size cannot exceed 500 MB',
  }),
  mimeType: z.string().min(1).max(100),
  format: AudioFormatSchema,
  sampleRateHz: z.number().int().positive().optional(),
  channels: z.number().int().positive().max(8).optional(),
  bitrateKbps: z.number().positive().optional(),
  sha256Checksum: z.string().length(64).regex(/^[a-f0-9]{64}$/i).optional(),
});

export const RecordingSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  filename: z.string().min(1).max(255),
  storagePath: z.string().min(1).max(500),
  sourceType: AudioSourceTypeSchema,
  status: RecordingStatusSchema,
  metadata: AudioMetadataSchema,
  uploadedBy: z.string().min(1),
  retentionExpiresAt: z.string().datetime(),
  isRetained: z.boolean(),
  deletedAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const AuthorizeUploadRequestSchema = z.object({
  caseId: z.string().uuid({ message: 'Valid case ID is required' }),
  filename: z.string().min(1, 'Filename required').max(255),
  fileSizeBytes: z
    .number()
    .int()
    .positive('File size must be positive')
    .max(524288000, 'File exceeds 500 MB maximum threshold'),
  mimeType: z
    .string()
    .regex(/^audio\/(mpeg|mp3|wav|x-wav|wave|ogg|mp4|x-m4a|m4a|webm|flac)$/i, {
      message: 'MIME type must be an authorized audio format (mp3, wav, ogg, m4a, webm, flac)',
    }),
});

export const CompleteUploadRequestSchema = z.object({
  recordingId: z.string().uuid(),
  storagePath: z.string().min(1),
  fileSizeBytes: z.number().int().positive().max(524288000),
  durationSeconds: z.number().nonnegative().max(1800),
  mimeType: z.string().min(1),
  format: AudioFormatSchema,
  sha256Checksum: z.string().length(64).regex(/^[a-f0-9]{64}$/i).optional(),
});

// ==============================================================================
// 4. Analysis Run & Orchestration Schemas
// ==============================================================================

export const AnalysisRunStatusSchema = z.enum([
  'queued',
  'in_progress',
  'completed',
  'partial',
  'failed',
  'cancelled',
]);

export const StageNameSchema = z.enum([
  'preflight',
  'transcription',
  'entity_extraction',
  'trigger_detection',
  'vocal_analysis',
  'timeline_generation',
]);

export const StageStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'skipped',
  'failed',
  'abstained',
]);

export const StageErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  safeReason: z.string().optional(),
  retryable: z.boolean(),
});

export const StageStateSchema = z.object({
  stage: StageNameSchema,
  status: StageStatusSchema,
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  durationMs: z.number().nonnegative().optional(),
  error: StageErrorSchema.optional(),
  modelId: z.string().optional(),
  promptVersion: z.string().optional(),
  schemaVersion: z.string().optional(),
});

export const ModelConfigSnapshotSchema = z.object({
  recordedSttModel: z.string().min(1),
  audioAnalysisModel: z.string().min(1),
  promptVersion: z.string().min(1),
  schemaVersion: z.string().min(1),
  vocalCueEnabled: z.boolean(),
  liveTranscriptionEnabled: z.boolean(),
});

export const AnalysisRunSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  recordingId: z.string().optional(),
  status: AnalysisRunStatusSchema,
  stages: z.record(StageNameSchema, StageStateSchema).optional(),
  modelConfig: ModelConfigSnapshotSchema.optional(),
  initiatedBy: z.string().optional(),
  idempotencyKey: z.string().max(128).optional(),
  summary: z.string().optional(),
  modelId: z.string().optional(),
  isSyntheticDemo: z.boolean().default(false),
  analysisProvider: z.string().optional(),
  acousticMetricsAvailable: z.boolean().default(false),
  failureReason: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  completedAt: z.string().nullable().optional(),
});

export const StartAnalysisRequestSchema = z.object({
  caseId: z.string().uuid(),
  recordingId: z.string().uuid(),
  idempotencyKey: z.string().max(128).optional(),
  enableVocalCues: z.boolean().default(true),
  promptVersion: z.string().optional(),
});

// ==============================================================================
// 5. Transcript, Diarization & Disfluency Schemas
// ==============================================================================

export const WordOffsetSchema = z.object({
  word: z.string(),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  confidence: z.number().min(0).max(1).optional(),
});

export const SpeakerDiarizationSchema = z.object({
  speakerId: z.string().min(1),
  provisionalLabel: z.string().max(50).optional(),
  confidence: z.number().min(0).max(1).optional(),
});

export const UncertaintyReasonSchema = z.enum([
  'unclear_audio',
  'overlapping_speech',
  'low_confidence',
  'dialect_accent',
  'background_noise',
  'truncated',
]);

export const DisfluencyUncertaintySchema = z.object({
  isUncertain: z.boolean(),
  uncertaintyReason: UncertaintyReasonSchema.optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  phoneticGuess: z.string().optional(),
});

export const TranscriptSegmentSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid(),
  recordingId: z.string().uuid(),
  sequenceNumber: z.number().int().nonnegative(),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  text: z.string(),
  correctedText: z.string().optional(),
  speaker: SpeakerDiarizationSchema,
  language: z.string().min(2).max(20),
  languageConfidence: z.number().min(0).max(1).optional(),
  uncertainty: DisfluencyUncertaintySchema,
  words: z.array(WordOffsetSchema).optional(),
  isInterim: z.boolean().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const CorrectTranscriptRequestSchema = z.object({
  segmentId: z.string().uuid(),
  correctedText: z.string().min(1, 'Corrected text cannot be empty').max(5000),
  officerNotes: z.string().max(1000).optional(),
  version: z.number().int().nonnegative({
    message: 'Version token required for optimistic concurrency control',
  }),
});

// ==============================================================================
// 6. Evidence Reference Schema
// ==============================================================================

export const EvidenceReferenceSchema = z.object({
  segmentId: z.string().uuid(),
  quote: z.string().min(1),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  speakerId: z.string().optional(),
});

// ==============================================================================
// 7. Extracted Entity Schemas
// ==============================================================================

export const EntityTypeSchema = z.enum([
  'person',
  'location',
  'landmark',
  'phone_number',
  'date_time',
  'vehicle',
  'role_allegation',
  'organization',
  'financial_identifier',
  'cyber_identifier',
]);

export const EntityVerificationStatusSchema = z.enum([
  'unverified',
  'confirmed',
  'corrected',
  'dismissed',
]);

export const ExtractedEntitySchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid(),
  caseId: z.string().uuid(),
  type: EntityTypeSchema,
  value: z.string().min(1),
  rawText: z.string().min(1),
  confidence: z.number().min(0).max(1),
  evidence: EvidenceReferenceSchema,
  verificationStatus: EntityVerificationStatusSchema,
  correctedValue: z.string().optional(),
  verificationNotes: z.string().optional(),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().datetime().optional(),
  legalStatuteReference: z.string().optional(),
});

export const ReviewEntityRequestSchema = z.object({
  action: z.enum(['confirm', 'correct', 'dismiss']),
  correctedValue: z.string().min(1).optional(),
  dismissalReason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  version: z.number().int().nonnegative(),
});

// ==============================================================================
// 8. Emergency & Threat Trigger Schemas
// ==============================================================================

export const TriggerSeveritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

export const TriggerCategorySchema = z.enum([
  'threat_violence',
  'extortion_blackmail',
  'kidnapping_confinement',
  'financial_fraud',
  'distress_help_request',
  'weapon_mention',
  'self_harm',
  'cyber_attack',
  'suspicious_activity',
]);

export const TriggerContextSchema = z.enum([
  'direct',
  'negated',
  'historical',
  'hypothetical',
  'quoted_reported',
]);

export const EmergencyTriggerSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid(),
  caseId: z.string().uuid(),
  category: TriggerCategorySchema,
  severity: TriggerSeveritySchema,
  context: TriggerContextSchema,
  quote: z.string().min(1),
  explanation: z.string().min(1),
  evidence: EvidenceReferenceSchema,
  statuteReference: z.string().optional(),
  reviewStatus: z.enum(['unreviewed', 'confirmed', 'corrected', 'dismissed']),
  officerNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.string().datetime().optional(),
  dismissalReason: z.string().optional(),
});

export const ReviewTriggerRequestSchema = z.object({
  action: z.enum(['confirm', 'correct', 'dismiss']),
  statuteReference: z.string().max(200).optional(),
  dismissalReason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  version: z.number().int().nonnegative(),
});

// ==============================================================================
// 9. Vocal Indicator & Acoustic Metric Schemas (Advisory / Experimental)
// ==============================================================================

export const VocalMetricTypeSchema = z.enum([
  'pitch_perturbation',
  'stress_variance',
  'cadence_variance',
  'harmonic_jitter',
  'amplitude_shimmer',
  'pause_ratio',
  'vocal_distress_marker',
]);

export const AcousticClassificationSchema = z.enum([
  'elevated_stress',
  'moderate_stress',
  'baseline',
  'monotone',
  'abstained_insufficient_evidence',
]);

export const AbstentionReasonSchema = z.enum([
  'poor_audio_quality',
  'clipping',
  'whispering',
  'insufficient_duration',
  'feature_disabled',
  'background_noise',
]);

export const VocalIndicatorSchema = z.object({
  id: z.string().uuid(),
  runId: z.string().uuid(),
  recordingId: z.string().uuid(),
  speakerId: z.string().min(1),
  metricType: VocalMetricTypeSchema,
  metricValue: z.number().min(0).max(100),
  baselineComparison: z.string(),
  classification: AcousticClassificationSchema,
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  confidence: z.number().min(0).max(1),
  // Mandatory guardrails: Must be advisory and include warning
  isAdvisory: z.literal(true),
  advisoryDisclaimer: z.string().default(DISCLAIMER_ADVISORY_VOCAL_METRICS),
  abstained: z.boolean().optional(),
  abstentionReason: AbstentionReasonSchema.nullable().optional(),
});

// ==============================================================================
// 10. Timeline Event Schemas
// ==============================================================================

export const TimelineEventTypeSchema = z.enum([
  'threat',
  'call_started',
  'call_ended',
  'distress_call',
  'financial_demand',
  'location_mention',
  'suspect_statement',
  'victim_statement',
  'critical_finding',
  'officer_flag',
]);

export const TimelineEventSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  runId: z.string().uuid(),
  timestampSeconds: z.number().nonnegative().nullable().optional(),
  displayTime: z.string().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  eventType: TimelineEventTypeSchema,
  severity: TriggerSeveritySchema.optional(),
  speakerId: z.string().optional(),
  evidence: EvidenceReferenceSchema.optional(),
  isKeyIncident: z.boolean().default(false),
  orderIndex: z.number().int().nonnegative(),
});

export const CreateTimelineEventRequestSchema = z.object({
  caseId: z.string().uuid(),
  timestampSeconds: z.number().nonnegative().optional(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  eventType: TimelineEventTypeSchema,
  severity: TriggerSeveritySchema.optional(),
  speakerId: z.string().optional(),
  isKeyIncident: z.boolean().default(false),
});

// ==============================================================================
// 11. Officer Review & Human-in-the-Loop Schemas
// ==============================================================================

export const ReviewStatusSchema = z.enum([
  'unreviewed',
  'confirmed',
  'corrected',
  'dismissed',
]);

export const ReviewActionTypeSchema = z.enum(['confirm', 'correct', 'dismiss']);

export const ReviewTargetTypeSchema = z.enum([
  'trigger',
  'entity',
  'transcript_segment',
  'vocal_indicator',
  'case_summary',
]);

export const ReviewCorrectionDataSchema = z.object({
  field: z.string().min(1),
  originalValue: z.string(),
  correctedValue: z.string(),
});

export const OfficerReviewActionSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  targetType: ReviewTargetTypeSchema,
  targetId: z.string().uuid(),
  action: ReviewActionTypeSchema,
  previousState: ReviewStatusSchema,
  newState: ReviewStatusSchema,
  officerId: z.string().min(1),
  officerBadge: z.string().max(50).optional(),
  officerName: z.string().min(1).max(100),
  timestamp: z.string().datetime(),
  correctionData: ReviewCorrectionDataSchema.optional(),
  dismissalReason: z.string().max(500).optional(),
  reviewNotes: z.string().max(1000).optional(),
  version: z.number().int().nonnegative(),
});

export const CreateOfficerNoteRequestSchema = z.object({
  caseId: z.string().uuid(),
  note: z.string().min(1, 'Note cannot be empty').max(5000),
  isPinned: z.boolean().default(false),
});

export const OfficerNotesSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  officerId: z.string().min(1),
  officerName: z.string().min(1).max(100),
  badgeNumber: z.string().max(50).optional(),
  note: z.string().min(1).max(5000),
  isPinned: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// ==============================================================================
// 12. Audit Log Schemas
// ==============================================================================

export const AuditActionSchema = z.enum([
  'case_create',
  'case_update',
  'audio_upload',
  'analysis_start',
  'analysis_complete',
  'transcript_correct',
  'finding_confirm',
  'finding_correct',
  'finding_dismiss',
  'report_export_pdf',
  'report_export_csv',
  'audio_delete',
  'retention_purge',
  'access_denied',
]);

export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid().optional(),
  actorId: z.string().min(1),
  actorRole: z.string().min(1),
  action: AuditActionSchema,
  resourceType: z.string().min(1),
  resourceId: z.string().min(1),
  timestamp: z.string().datetime(),
  ipAddress: z.string().optional(),
  userAgent: z.string().max(255).optional(),
  details: z.record(z.string(), z.unknown()),
});

// ==============================================================================
// 13. API Responses & Standardized Error Envelopes
// ==============================================================================

export const ApiErrorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'CONFLICT_STALE_VERSION',
  'RATE_LIMIT_EXCEEDED',
  'PAYLOAD_TOO_LARGE',
  'UNSUPPORTED_MEDIA_TYPE',
  'PROVIDER_UNAVAILABLE',
  'RETENTION_EXPIRED',
  'INTERNAL_SERVER_ERROR',
]);

export const PaginationMetaSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalCount: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export const ApiErrorDetailSchema = z.object({
  code: ApiErrorCodeSchema,
  message: z.string(),
  details: z.unknown().optional(),
  requestId: z.string(),
  timestamp: z.string().datetime(),
});

export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: ApiErrorDetailSchema,
});

export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        requestId: z.string(),
        timestamp: z.string().datetime(),
        pagination: PaginationMetaSchema.optional(),
      })
      .passthrough()
      .optional(),
  });
}

// ==============================================================================
// 14. Raw AI Provider Model Output Validation Schemas
// ==============================================================================

/**
 * Raw JSON schema for Gemini Speech-To-Text normalization
 */
export const ModelRawTranscriptItemSchema = z.object({
  speakerId: z.string().min(1).default('SPEAKER_01'),
  provisionalLabel: z.string().optional(),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  text: z.string().min(1),
  language: z.string().default('en'),
  isUnclear: z.boolean().default(false),
  uncertaintyReason: UncertaintyReasonSchema.optional(),
  confidence: z.number().min(0).max(1).default(0.95),
  words: z.array(WordOffsetSchema).optional(),
});

export const ModelTranscriptOutputSchema = z.array(ModelRawTranscriptItemSchema);

/**
 * Raw JSON schema for Gemini Entity Extraction
 */
export const ModelRawEntityItemSchema = z.object({
  type: EntityTypeSchema,
  value: z.string().min(1),
  rawText: z.string().min(1),
  quote: z.string().min(1),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  confidence: z.number().min(0).max(1).default(0.9),
  statuteReference: z.string().optional(),
});

export const ModelEntityExtractionOutputSchema = z.array(ModelRawEntityItemSchema);

/**
 * Raw JSON schema for Gemini Emergency & Threat Trigger Detection
 */
export const ModelRawTriggerItemSchema = z.object({
  category: TriggerCategorySchema,
  severity: TriggerSeveritySchema,
  context: TriggerContextSchema,
  quote: z.string().min(1),
  explanation: z.string().min(1),
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  statuteReference: z.string().optional(),
});

export const ModelTriggerDetectionOutputSchema = z.array(ModelRawTriggerItemSchema);

/**
 * Raw JSON schema for Gemini Vocal Acoustic Analysis (Advisory Only)
 */
export const ModelRawVocalItemSchema = z.object({
  speakerId: z.string().min(1),
  metricType: VocalMetricTypeSchema,
  metricValue: z.number().min(0).max(100),
  baselineComparison: z.string().min(1),
  classification: AcousticClassificationSchema,
  startTime: z.number().nonnegative(),
  endTime: z.number().nonnegative(),
  confidence: z.number().min(0).max(1).default(0.85),
  abstained: z.boolean().default(false),
  abstentionReason: AbstentionReasonSchema.nullable().optional(),
});

export const ModelVocalAnalysisOutputSchema = z.array(ModelRawVocalItemSchema);

/**
 * Complete consolidated model output envelope
 */
export const ModelCompleteAnalysisOutputSchema = z.object({
  summary: z.string().min(1),
  detectedLanguage: z.string().default('en'),
  transcript: ModelTranscriptOutputSchema,
  entities: ModelEntityExtractionOutputSchema,
  triggers: ModelTriggerDetectionOutputSchema,
  vocalIndicators: ModelVocalAnalysisOutputSchema.optional(),
});
