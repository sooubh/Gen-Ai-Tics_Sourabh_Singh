/**
 * ==============================================================================
 * VECNAVERSE: Voice-to-Investigation Cybercrime Audio Intelligence
 * Canonical TypeScript Types (src/types/index.ts)
 * ==============================================================================
 * Strict, vendor-neutral domain contracts adhering to evidentiary standards:
 * 1. Human verification mandatory before findings can be used in judicial filings.
 * 2. Vocal indicators strictly advisory/experimental (no lie detection, guilt inference,
 *    or psychiatric diagnosis).
 * 3. No external dispatch or autonomous side effects (no 911/112/police dispatch).
 * 4. Grounded provenance: all findings require explicit audio time/segment evidence anchors.
 * 5. Uncertainty preservation: disfluency, audio ambiguity, and model uncertainty retained.
 * 6. Audit integrity: non-destructive review history with optimistic concurrency control.
 */

// ==============================================================================
// 1. Core Evidentiary & Ethical Disclaimers
// ==============================================================================

export const DISCLAIMER_ADVISORY_VOCAL_METRICS =
  "Preliminary investigative aid only. Acoustic indicators and vocal stress metrics do NOT infer guilt, intent, deception, or credibility and must never be represented as psychological or forensic diagnosis." as const;

export const DISCLAIMER_LEGAL_EVIDENCE =
  "All automated AI indicators and extractions constitute preliminary investigative leads. Sworn officer corroboration and chain-of-custody verification are mandatory prior to inclusion in judicial affidavits or proceedings." as const;

export const DISCLAIMER_NO_EMERGENCY_DISPATCH =
  "VECNAVERSE is an investigative intelligence workspace. It does NOT integrate with 911, 112, emergency services, or automated dispatch systems. No autonomous external actions are executed." as const;

// ==============================================================================
// 2. Case Management Contracts
// ==============================================================================

export type CaseStatus =
  | 'draft'
  | 'active'
  | 'triage'
  | 'under_review'
  | 'officer_verified'
  | 'closed'
  | 'archived'
  | 'flagged'
  | 'Under Review'
  | 'Triage'
  | 'Officer Verified'
  | 'Archived'
  | 'Flagged';

export type CasePriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'urgent';

export interface CaseAnalysisRunSummary {
  id: string;
  caseId: string;
  recordingId?: string;
  status: AnalysisRunStatus | string;
  modelId: string;
  promptVersion: string;
  isSyntheticDemo?: boolean;
  analysisProvider?: string;
  acousticMetricsAvailable?: boolean;
  failureReason?: string;
  pipelineConfig?: {
    diarization?: boolean;
    transcription?: boolean;
    entityExtraction?: boolean;
    urgencyClassification?: boolean;
    acousticStressVariance?: boolean;
  };
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
}

export type CaseTranscriptSegment = TranscriptSegment;
export type CaseExtractedEntity = ExtractedEntity;
export type CaseEmergencyTrigger = EmergencyTrigger;
export type CaseVocalIndicator = VocalIndicator;
export type CaseTimelineEvent = TimelineEvent;

export interface CaseNote {
  id: string;
  caseId: string;
  officerId: string;
  officerName: string;
  content: string;
  createdAt: string;
}

export interface CaseReviewRecord {
  id: string;
  targetType: 'finding' | 'trigger' | 'transcript' | string;
  targetId: string;
  action: 'confirm' | 'correct' | 'dismiss';
  officerId: string;
  officerName: string;
  reason?: string;
  newValue?: string;
  timestamp: string;
}

export type CallerCategory = 'distressed_victim' | 'suspected_fraudster' | 'informant' | 'unknown';

export type TargetEmotion = 'anger' | 'sadness' | 'fear' | 'happiness' | 'stress' | 'neutral';

export type AudioQualityLevel = 'clear' | 'noisy' | 'distorted' | 'low_volume';

export interface SpeechEmotionProfile {
  primaryEmotion: 'fear' | 'distress' | 'anger' | 'nervousness' | 'calm' | 'neutral' | 'sadness' | 'happiness' | 'stress';
  secondaryEmotion?: 'fear' | 'distress' | 'anger' | 'nervousness' | 'calm' | 'neutral' | 'sadness' | 'happiness' | 'stress' | string;
  urgencyScore: number; // 0 - 100
  urgencyLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  confidence?: number; // 0.0 - 1.0 or 0 - 100
  audioQuality?: AudioQualityLevel | string;
  ambiguityFlag?: boolean;
  emotions: {
    anger: number; // 0.0 - 1.0
    fear: number; // 0.0 - 1.0
    distress: number; // 0.0 - 1.0
    nervousness: number; // 0.0 - 1.0
    calm: number; // 0.0 - 1.0
    sadness?: number; // 0.0 - 1.0
    happiness?: number; // 0.0 - 1.0
    stress?: number; // 0.0 - 1.0
    neutral?: number; // 0.0 - 1.0
  };
  acousticMetrics: {
    pitchJitterHz?: number;
    speechRateWpm?: number;
    vocalTremorScore?: number;
    energySpikeDb?: number;
    available?: boolean;
    disclaimer?: string;
  };
  distressPeakTimestampSeconds?: number;
  acousticMetricsAvailable?: boolean;
  disclaimer?: string;
  isSyntheticDemo?: boolean;
  analysisProvider?: string;
}

export interface Case {
  id: string;
  docketNumber: string; // e.g. '#CY-2025-0892'
  title: string;
  operationName?: string;
  description?: string;
  status: CaseStatus;
  priority: CasePriority;

  // Caller Categorization & Speech Emotion Recognition (SER)
  callerCategory?: CallerCategory;
  callerPhone?: string;
  callerName?: string;
  urgencyScore?: number; // 0 - 100
  urgencyLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  emotionProfile?: SpeechEmotionProfile;

  officerId?: string;
  officerName?: string;
  taskForce?: string;
  classificationStandard?: string;
  securityEnclave?: string;
  leadInvestigatorId?: string;
  assignedOfficerName?: string;
  department?: string;
  agency?: string;
  tags?: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  closedAt?: string | null;

  // Convenience & UI Presentation Properties
  timestamp?: string; // alias for createdAt
  intakeTimestamp?: string;
  evidenceId?: string;
  chainOfCustodyHash?: string;
  audioDuration?: string;
  audioDurationSeconds?: number;
  audioFormat?: string;
  sampleRate?: string;
  fileSize?: string;
  audioUrl?: string;
  detectedFinding?: string;
  investigatingOfficer?: string;

  // Evidentiary collections and audio attachments
  audioMetadata?: AudioMetadata;
  latestRun?: CaseAnalysisRunSummary;
  segments: CaseTranscriptSegment[];
  entities: CaseExtractedEntity[];
  triggers: CaseEmergencyTrigger[];
  vocalIndicators: CaseVocalIndicator[];
  timeline: CaseTimelineEvent[];
  notes?: CaseNote[];
  reviews?: CaseReviewRecord[];
  isSyntheticDemo?: boolean;
  fixtureId?: string;
}

// ==============================================================================
// 3. Audio Recording & Ingestion Contracts
// ==============================================================================

export type RecordingStatus =
  | 'pending_upload'
  | 'uploaded'
  | 'processing'
  | 'ready'
  | 'failed'
  | 'expired'
  | 'deleted';

export type AudioSourceType = 'recorded_file' | 'live_stream';

export type AudioFormat =
  | 'mp3'
  | 'wav'
  | 'ogg'
  | 'm4a'
  | 'webm'
  | 'flac'
  | 'unknown';

export interface AudioMetadata {
  filename: string;
  sizeBytes: number;
  durationSeconds: number;
  mimeType: string;
  format: AudioFormat | string;
  sampleRate?: number | string;
  sampleRateHz?: number;
  channels?: number;
  bitrateKbps?: number;
  sha256Hash: string;
  sha256Checksum?: string;
  uploadedAt: string;
  expiresAt: string;
  retentionHours: number;
  storagePath: string; // Private enclave path
  purged: boolean;
}

export interface Recording {
  id: string;
  caseId: string;
  filename: string;
  storagePath: string; // Internal isolated storage path (private bucket)
  sourceType: AudioSourceType;
  status: RecordingStatus;
  metadata: AudioMetadata;
  uploadedBy: string;
  retentionExpiresAt: string; // ISO 8601 scheduled deletion timestamp
  isRetained: boolean;
  deletedAt?: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ==============================================================================
// 4. Analysis Run & Pipeline Orchestration Contracts
// ==============================================================================

export type AnalysisRunStatus =
  | 'queued'
  | 'in_progress'
  | 'completed'
  | 'partial'
  | 'failed'
  | 'cancelled';

export type StageName =
  | 'preflight'
  | 'transcription'
  | 'entity_extraction'
  | 'trigger_detection'
  | 'vocal_analysis'
  | 'timeline_generation';

export type StageStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'skipped'
  | 'failed'
  | 'abstained';

export interface StageError {
  code: string;
  message: string;
  safeReason?: string;
  retryable: boolean;
}

export interface StageState {
  stage: StageName;
  status: StageStatus;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  error?: StageError;
  modelId?: string;
  promptVersion?: string;
  schemaVersion?: string;
}

export interface ModelConfigSnapshot {
  recordedSttModel: string;
  audioAnalysisModel: string;
  promptVersion: string;
  schemaVersion: string;
  vocalCueEnabled: boolean;
  liveTranscriptionEnabled: boolean;
}

export interface AnalysisRun {
  id: string;
  caseId: string;
  recordingId: string;
  status: AnalysisRunStatus;
  stages?: Record<StageName, StageState>;
  modelConfig?: ModelConfigSnapshot;
  initiatedBy?: string;
  idempotencyKey?: string;
  summary?: string;
  isSyntheticDemo?: boolean;
  analysisProvider?: string;
  acousticMetricsAvailable?: boolean;
  modelId?: string;
  failureReason?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  completedAt?: string | null;
}

// ==============================================================================
// 5. Transcript, Diarization, & Uncertainty Contracts
// ==============================================================================

export interface WordOffset {
  word: string;
  startTime: number; // Seconds from audio start (>= 0)
  endTime: number; // Seconds from audio start (>= startTime)
  confidence?: number; // 0.0 to 1.0
}

export interface SpeakerDiarization {
  speakerId: string; // e.g., "SPEAKER_01", "SPEAKER_02"
  provisionalLabel?: string; // e.g., "Caller", "Suspect", "Victim", "Unknown" (advisory only)
  confidence?: number; // 0.0 to 1.0
}

export type UncertaintyReason =
  | 'unclear_audio'
  | 'overlapping_speech'
  | 'low_confidence'
  | 'dialect_accent'
  | 'background_noise'
  | 'truncated';

export interface DisfluencyUncertainty {
  isUncertain: boolean;
  uncertaintyReason?: UncertaintyReason;
  confidenceScore?: number; // 0.0 to 1.0
  phoneticGuess?: string;
}

export interface TranscriptSegment {
  id: string;
  runId?: string;
  recordingId?: string;
  sequenceNumber?: number;
  startTime: number; // Seconds (>= 0)
  startSeconds?: number;
  endTime: number; // Seconds (>= startTime)
  endSeconds?: number;
  text: string;
  editedText?: string;
  correctedText?: string;
  editedBy?: string;
  editedAt?: string;
  speaker: string | SpeakerDiarization;
  speakerLabel?: string;
  speakerRole?: string;
  speakerId?: string;
  language?: string; // ISO code or language label
  languageConfidence?: number;
  uncertainty?: DisfluencyUncertainty;
  confidence: number;
  isThreat?: boolean;
  threatLabel?: string;
  threatType?: string;
  words?: WordOffset[];
  isInterim?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==============================================================================
// 6. Evidence Grounding Anchor
// ==============================================================================

export interface EvidenceReference {
  segmentId: string;
  quote: string;
  startTime: number; // Audio offset in seconds
  endTime: number; // Audio offset in seconds
  speakerId?: string;
}

// ==============================================================================
// 7. Extracted Entity Contracts
// ==============================================================================

export type EntityType =
  | 'person'
  | 'location'
  | 'landmark'
  | 'phone_number'
  | 'date_time'
  | 'vehicle'
  | 'role_allegation'
  | 'organization'
  | 'financial_identifier'
  | 'crypto_wallet'
  | 'money_amount'
  | 'cyber_identifier';

export type EntityVerificationStatus =
  | 'unverified'
  | 'confirmed'
  | 'corrected'
  | 'dismissed';

export interface ExtractedEntity {
  id: string;
  runId?: string;
  caseId?: string;
  type: EntityType | string;
  value: string; // Normalized extracted value
  rawText?: string; // As spoken verbatim in transcript
  text?: string; // alias
  detail?: string; // alias
  confidence: number;
  evidence?: EvidenceReference;
  verificationStatus: EntityVerificationStatus | string;
  status?: string; // alias
  normalizedValue?: string;
  segmentId?: string;
  timestamp?: number;
  correctedValue?: string;
  verificationNotes?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  legalStatuteReference?: string;
}

// ==============================================================================
// 8. Emergency & Threat Trigger Contracts
// ==============================================================================

export type TriggerSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'
  | 'advisory';

export type TriggerCategory =
  | 'threat_violence'
  | 'extortion_demand'
  | 'extortion_blackmail'
  | 'kidnapping_confinement'
  | 'financial_fraud'
  | 'distress_help_request'
  | 'deadline_ultimatum'
  | 'weapon_mention'
  | 'self_harm'
  | 'cyber_attack'
  | 'suspicious_activity';

/**
 * TriggerContext: CRITICAL semantic guardrail to differentiate actual current threats
 * from negated statements, hypothetical inquiries, or historical quotations.
 * - 'direct': Active, immediate threat or demand.
 * - 'negated': Stated with negation (e.g., "I did not threaten him", "there is no bomb").
 * - 'historical': Stated in the past (e.g., "three years ago he tried to rob me").
 * - 'hypothetical': Stated conditionally (e.g., "if someone were to rob a bank").
 * - 'quoted_reported': Quoting someone else (e.g., "she told me 'give me your wallet'").
 */
export type TriggerContext =
  | 'direct'
  | 'negated'
  | 'historical'
  | 'hypothetical'
  | 'quoted_reported';

export interface EmergencyTrigger {
  id: string;
  runId?: string;
  caseId?: string;
  category: TriggerCategory | string;
  type?: string; // alias
  title?: string;
  severity: TriggerSeverity;
  context: TriggerContext;
  contextTag?: string; // alias
  quote: string;
  explanation?: string;
  evidence?: EvidenceReference;
  statuteReference?: string; // e.g. "18 U.S.C. § 875(b) (Interstate Extortion)"
  statute?: string; // alias
  reviewStatus?: ReviewStatus;
  verificationStatus?: ReviewStatus | 'confirmed' | 'dismissed' | 'unverified' | string;
  status?: string; // alias
  segmentId?: string;
  timestamp?: number;
  timestampEnd?: number;
  timeSeconds?: number;
  timeOffset?: string;
  confidence?: number;
  officerNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  dismissalReason?: string;
}

// ==============================================================================
// 9. Vocal Indicator & Acoustic Metric Contracts (Advisory / Experimental)
// ==============================================================================

export type VocalMetricType =
  | 'pitch_perturbation'
  | 'stress_variance'
  | 'cadence_variance'
  | 'harmonic_jitter'
  | 'amplitude_shimmer'
  | 'pause_ratio'
  | 'vocal_distress_marker';

export type AcousticClassification =
  | 'elevated_stress'
  | 'moderate_stress'
  | 'baseline'
  | 'monotone'
  | 'abstained_insufficient_evidence';

export type AbstentionReason =
  | 'poor_audio_quality'
  | 'clipping'
  | 'whispering'
  | 'insufficient_duration'
  | 'feature_disabled'
  | 'background_noise';

export interface VocalIndicator {
  id: string;
  runId?: string;
  recordingId?: string;
  speakerId?: string;
  metricType?: VocalMetricType;
  type?: VocalMetricType | string; // alias
  title?: string;
  metricName?: string; // alias
  metricValue?: number; // Quantitative measure or normalized 0-100 score
  score?: number; // alias
  value?: string | number; // alias
  baselineComparison?: string; // e.g. "+180 Hz shift above baseline"
  classification?: AcousticClassification;
  variance?: string;
  trend?: string; // alias
  startTime?: number;
  endTime?: number;
  timestamp?: number;
  intervalStart?: number;
  intervalEnd?: number;
  segmentId?: string;
  confidence?: number;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  isAdvisory: true; // Strictly literal true; can never be false or omitted
  advisoryDisclaimer?: string; // Mandatory explicit legal/forensic disclaimer
  disclaimer?: string; // alias
  abstained?: boolean;
  abstentionReason?: AbstentionReason | null;
  available?: boolean;
}

// ==============================================================================
// 10. Timeline Event Contracts
// ==============================================================================

export type TimelineEventType =
  | 'threat'
  | 'call_started'
  | 'call_ended'
  | 'distress_call'
  | 'financial_demand'
  | 'location_mention'
  | 'suspect_statement'
  | 'victim_statement'
  | 'critical_finding'
  | 'officer_flag'
  | 'call_start'
  | 'demand'
  | 'transfer_attempt'
  | 'speaker_turn'
  | 'stress_spike'
  | 'officer_action';

export interface TimelineEvent {
  id: string;
  caseId?: string;
  runId?: string;
  timestamp: number | string; // e.g. 252 or "04:12.000"
  timeLabel?: string;
  timeSeconds?: number;
  timestampSeconds?: number | null; // null for untimed narrative events
  displayTime?: string; // e.g., "04:12" or "Untimed"
  title: string;
  description: string;
  segmentId?: string;
  eventType?: TimelineEventType;
  category?: TimelineEventType | string;
  severity?: TriggerSeverity;
  speakerId?: string;
  sourceSpeaker?: string;
  evidence?: EvidenceReference;
  isKeyIncident?: boolean;
  orderIndex?: number;
}

// ==============================================================================
// 11. Officer Review & Human-in-the-Loop Contracts
// ==============================================================================

export type ReviewStatus =
  | 'unreviewed'
  | 'confirmed'
  | 'corrected'
  | 'dismissed';

export type ReviewActionType = 'confirm' | 'correct' | 'dismiss';

export type ReviewTargetType =
  | 'trigger'
  | 'finding'
  | 'entity'
  | 'transcript_segment'
  | 'transcript'
  | 'vocal_indicator'
  | 'case_summary';

export interface ReviewCorrectionData {
  field: string;
  originalValue: string;
  correctedValue: string;
}

export interface OfficerReviewAction {
  id: string;
  caseId?: string;
  targetType: ReviewTargetType;
  targetId: string;
  action: ReviewActionType;
  previousState?: ReviewStatus;
  newState?: ReviewStatus;
  officerId: string;
  officerBadge?: string;
  officerName: string;
  timestamp: string; // ISO 8601
  reason?: string;
  newValue?: string;
  correctionData?: ReviewCorrectionData;
  dismissalReason?: string;
  reviewNotes?: string;
  version?: number; // Concurrency lock key to detect stale overwrites
}

export interface OfficerNotes {
  id: string;
  caseId: string;
  officerId: string;
  officerName: string;
  badgeNumber?: string;
  note: string;
  isPinned: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ==============================================================================
// 12. Audit Log Contracts
// ==============================================================================

export type AuditAction =
  | 'case_create'
  | 'case_update'
  | 'audio_upload'
  | 'analysis_start'
  | 'analysis_complete'
  | 'transcript_correct'
  | 'finding_confirm'
  | 'finding_correct'
  | 'finding_dismiss'
  | 'report_export_pdf'
  | 'report_export_csv'
  | 'audio_delete'
  | 'retention_purge'
  | 'access_denied'
  | string;

export interface AuditLogEntry {
  id: string;
  caseId?: string;
  action: AuditAction;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  officer?: string;
  resourceType?: string;
  resourceId?: string;
  timestamp: string; // ISO 8601
  enclaveSecurityLevel?: string;
  sha256?: string;
  ipAddress?: string;
  userAgent?: string;
  details: string | Record<string, unknown>; // Sanitized metadata
}

// ==============================================================================
// 13. UI & Dashboard Aggregate Types
// ==============================================================================

export interface CaseRecord {
  id: string; // e.g. #CY-2025-0892
  title: string;
  timestamp: string;
  status: CaseStatus;
  detectedFinding: string;
  investigatingOfficer: string;
  officerId: string;
  intakeTimestamp: string;
  evidenceId: string;
  chainOfCustodyHash: string;
  classification: string;
  audioDuration: string;
  audioDurationSeconds: number;
  audioFormat: string;
  sampleRate: string;
  fileSize: string;
  audioUrl?: string;
  entitiesCount: number;
  triggersCount: number;
  confidenceScore: number;
}

export interface TranscriptUtterance {
  id: string;
  speakerId: string; // "Speaker 01"
  speakerLabel: string; // "Speaker 01 [Suspect]" or "Speaker 02 [Victim]"
  speakerChannel?: number; // 1 or 2
  startTime: string; // "04:12.000"
  endTime: string; // "04:26.850"
  startSeconds: number;
  endSeconds: number;
  confidence: number; // 97.8
  text: string;
  editedText?: string;
  isThreat?: boolean;
  threatType?: string; // "EXTORTION ULTIMATUM"
  entities?: {
    text: string;
    type: 'Person' | 'Phone' | 'Bank' | 'Address' | 'Crypto' | 'Amount';
  }[];
}

export interface ForensicEntity {
  id: string;
  text: string;
  type: 'Person' | 'Phone' | 'Bank' | 'Address' | 'Crypto' | 'Date' | 'Amount';
  detail: string;
  confidence: number;
  utteranceTime: string;
  utteranceSeconds: number;
  verified: boolean;
  status: 'unverified' | 'verified' | 'dismissed';
}

export interface ThreatTrigger {
  id: string;
  type: string; // "Extortion / Ultimatum"
  timeOffset: string; // "04:12"
  timeSeconds: number;
  quote: string;
  statute: string; // "18 U.S.C. § 875(b)"
  contextTag: 'direct' | 'negated' | 'historical' | 'hypothetical';
  status: 'flagged' | 'confirmed' | 'dismissed';
  severity: 'critical' | 'high' | 'medium' | 'advisory';
}

export interface VocalMetric {
  speaker: string;
  metricName: string;
  value: string;
  percentage: number;
  description: string;
  trend: 'monotone' | 'elevated' | 'normal' | 'volatile';
}

export interface DashboardStats {
  totalCasesAnalyzed: number;
  casesChangeVsLastWeek: string;
  activeAnalyses: number;
  activeAudioFeedsLabel: string;
  flaggedTriggers: number;
  flaggedTriggersLabel: string;
  pendingReviews: number;
  pendingReviewsLabel: string;
  dailyCallActivity: { day: string; count: number; active?: boolean }[];
  avgCallsPerDay: number;
  peakDayLabel: string;
}

// ==============================================================================
// 14. API Responses & Standardized Error Envelopes
// ==============================================================================

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT_STALE_VERSION'
  | 'RATE_LIMIT_EXCEEDED'
  | 'PAYLOAD_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PROVIDER_UNAVAILABLE'
  | 'RETENTION_EXPIRED'
  | 'INTERNAL_SERVER_ERROR';

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
    pagination?: PaginationMeta;
    [key: string]: unknown;
  };
}

export interface ApiErrorDetail {
  code: ApiErrorCode;
  message: string;
  details?: unknown;
  requestId: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ==============================================================================
// 15. Case Report & Export Contracts
// ==============================================================================

export interface CaseReportSnapshot {
  case: Case;
  recording: Recording;
  analysisRun: AnalysisRun;
  transcript: TranscriptSegment[];
  entities: ExtractedEntity[];
  triggers: EmergencyTrigger[];
  vocalIndicators: VocalIndicator[];
  timeline: TimelineEvent[];
  officerNotes: OfficerNotes[];
  auditSummary: {
    totalReviewActions: number;
    reviewedBy: string[];
    generatedAt: string;
  };
  disclaimers: string[];
}
