// ==============================================================================
// VECNAVERSE: Local In-Memory & File-Backed Store
// Zero external database dependencies; self-contained in local environment.
// ==============================================================================

// Safe server-only module loader that avoids bundling Node 'fs'/'path' into browser clients
const getNodeModules = () => {
  if (typeof window === 'undefined') {
    try {
      const req = eval('require');
      return {
        fs: req('fs'),
        path: req('path'),
      };
    } catch {
      return { fs: null, path: null };
    }
  }
  return { fs: null, path: null };
};

import {
  Case,
  CaseStatus,
  AudioMetadata,
  OfficerReviewAction,
  CaseNote,
  AuditLogEntry,
  DashboardStats,
  ExtractedEntity,
  EmergencyTrigger,
  TranscriptSegment,
  CallerCategory,
  SpeechEmotionProfile,
} from '@/types';
import { INITIAL_CASES } from './initial-cases';
import { OfficerSession } from '@/lib/auth/session';

interface LocalDbSchema {
  cases: Case[];
  auditLogs: AuditLogEntry[];
}

class CaseStore {
  private cases: Case[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private initialized: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;

    // Check browser localStorage first
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('vecnaverse_cases');
      if (stored) {
        try {
          this.cases = JSON.parse(stored);
          const storedAudit = localStorage.getItem('vecnaverse_audit');
          this.auditLogs = storedAudit ? JSON.parse(storedAudit) : [];
          this.initialized = true;
          return;
        } catch {}
      }
    }

    const { fs: nodeFs, path: nodePath } = getNodeModules();
    if (nodeFs && nodePath) {
      try {
        const dataDir = nodePath.join(process.cwd(), 'data');
        const dbFile = nodePath.join(dataDir, 'db.json');
        if (!nodeFs.existsSync(dataDir)) {
          nodeFs.mkdirSync(dataDir, { recursive: true });
        }
        if (nodeFs.existsSync(dbFile)) {
          const raw = nodeFs.readFileSync(dbFile, 'utf-8');
          if (raw && raw.trim().length > 0) {
            const parsed: LocalDbSchema = JSON.parse(raw);
            this.cases = parsed.cases || [];
            this.auditLogs = parsed.auditLogs || [];
            this.initialized = true;
            return;
          }
        }
      } catch (err) {
        console.warn('Error reading local DB, falling back to seed cases:', err);
      }
    }

    // Default: Initial seeded cases
    this.cases = JSON.parse(JSON.stringify(INITIAL_CASES));
    this.auditLogs = [
      {
        id: 'AUD-001',
        action: 'SYSTEM_BOOTSTRAP',
        actorId: 'OFFICER-01',
        actorName: 'Investigating Officer 01',
        officer: 'Investigating Officer 01',
        resourceType: 'system',
        resourceId: 'enclave-local',
        details: 'Local secure enclave initialized with clean forensic case records.',
        timestamp: new Date().toISOString(),
        enclaveSecurityLevel: 'TOP SECRET // SCI',
      },
    ];
    this.persist();
    this.initialized = true;
  }

  private persist() {
    // 1. Browser LocalStorage support
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('vecnaverse_cases', JSON.stringify(this.cases));
        localStorage.setItem('vecnaverse_audit', JSON.stringify(this.auditLogs));
      } catch (e) {
        console.warn('LocalStorage save failed:', e);
      }
    }

    // 2. Server Disk persistence support
    const { fs: nodeFs, path: nodePath } = getNodeModules();
    if (nodeFs && nodePath) {
      try {
        const dataDir = nodePath.join(process.cwd(), 'data');
        const dbFile = nodePath.join(dataDir, 'db.json');
        if (!nodeFs.existsSync(dataDir)) {
          nodeFs.mkdirSync(dataDir, { recursive: true });
        }
        const data: LocalDbSchema = {
          cases: this.cases,
          auditLogs: this.auditLogs,
        };
        const tmpFile = nodePath.join(dataDir, `db.tmp.${process.pid}.${Date.now()}`);
        nodeFs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
        try {
          nodeFs.renameSync(tmpFile, dbFile);
        } catch {
          nodeFs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
          if (nodeFs.existsSync(tmpFile)) {
            try { nodeFs.unlinkSync(tmpFile); } catch {}
          }
        }
      } catch (err) {
        console.warn('Failed to persist local DB file (running in-memory):', err);
      }
    }
  }

  public getCases(): Case[] {
    return [...this.cases];
  }

  public getAllCases(options?: {
    status?: CaseStatus;
    callerCategory?: string;
    urgencyLevel?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): { cases: Case[]; total: number; page: number; totalPages: number } {
    let result = [...this.cases];

    if (options?.status) {
      result = result.filter((c) => c.status === options.status);
    }

    if (options?.callerCategory) {
      result = result.filter((c) => c.callerCategory === options.callerCategory);
    }

    if (options?.urgencyLevel) {
      result = result.filter((c) => c.urgencyLevel === options.urgencyLevel);
    }

    if (options?.search) {
      const q = options.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.docketNumber.toLowerCase().includes(q) ||
          (c.callerName ? c.callerName.toLowerCase().includes(q) : false) ||
          (c.callerPhone ? c.callerPhone.toLowerCase().includes(q) : false) ||
          (c.operationName ? c.operationName.toLowerCase().includes(q) : false) ||
          (c.description ? c.description.toLowerCase().includes(q) : false) ||
          c.entities.some((e: ExtractedEntity) => (e.value || e.text || '').toLowerCase().includes(q))
      );
    }

    // Dynamic Triage Sorting: Prioritize by Urgency Score desc, then updated timestamp
    result.sort((a, b) => {
      const urgA = a.urgencyScore ?? (a.priority === 'critical' ? 90 : a.priority === 'high' ? 75 : 50);
      const urgB = b.urgencyScore ?? (b.priority === 'critical' ? 90 : b.priority === 'high' ? 75 : 50);
      if (urgB !== urgA) return urgB - urgA;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    const total = result.length;
    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      cases: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public reloadFromDisk() {
    const { fs: nodeFs, path: nodePath } = getNodeModules();
    if (nodeFs && nodePath) {
      try {
        const dataDir = nodePath.join(process.cwd(), 'data');
        const dbFile = nodePath.join(dataDir, 'db.json');
        if (nodeFs.existsSync(dbFile)) {
          const raw = nodeFs.readFileSync(dbFile, 'utf-8');
          if (raw && raw.trim().length > 0) {
            const parsed: LocalDbSchema = JSON.parse(raw);
            if (parsed.cases && Array.isArray(parsed.cases)) {
              this.cases = parsed.cases;
            }
            if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
              this.auditLogs = parsed.auditLogs;
            }
          }
        }
      } catch (err) {
        console.warn('Error reloading local DB from disk:', err);
      }
    }
  }

  public getCaseById(id: string): Case | null {
    const cleanId = id.replace(/^#/, '');
    let found = this.cases.find(
      (c) => c.id === cleanId || c.docketNumber === id || c.docketNumber === `#${id}`
    );
    if (!found && typeof window === 'undefined') {
      this.reloadFromDisk();
      found = this.cases.find(
        (c) => c.id === cleanId || c.docketNumber === id || c.docketNumber === `#${id}`
      );
    }
    return found || null;
  }

  public upsertCase(caseData: Case): Case {
    const idx = this.cases.findIndex(
      (c) => c.id === caseData.id || c.docketNumber === caseData.docketNumber
    );
    if (idx >= 0) {
      this.cases[idx] = { ...this.cases[idx], ...caseData, updatedAt: new Date().toISOString() };
      this.persist();
      return this.cases[idx];
    } else {
      this.cases.unshift(caseData);
      this.persist();
      return caseData;
    }
  }

  public createCase(
    data: {
      id?: string;
      title: string;
      operationName?: string;
      description?: string;
      priority?: Case['priority'];
      officerName?: string;
      taskForce?: string;
      classificationStandard?: string;
      callerCategory?: CallerCategory;
      callerName?: string;
      callerPhone?: string;
      urgencyScore?: number;
      urgencyLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      emotionProfile?: SpeechEmotionProfile;
      audioMetadata?: AudioMetadata;
      isSyntheticDemo?: boolean;
      fixtureId?: string;
    },
    officerSession?: OfficerSession | { officerId?: string; officerName?: string }
  ): Case {
    const caseNum = Math.floor(1000 + Math.random() * 9000);
    const newId = data.id || `CALL-2026-${caseNum}`;
    const now = new Date().toISOString();

    const officerId = (officerSession as any)?.user?.id || (officerSession as any)?.officerId || 'JENKINS-4829';
    const officerName = (officerSession as any)?.user?.name || (officerSession as any)?.officerName || data.officerName || 'Det. S. Jenkins #4829';

    const newCase: Case = {
      id: newId,
      docketNumber: `#${newId}`,
      title: data.title,
      operationName: data.operationName || 'Operation RapidTriage',
      description: data.description || '',
      status: 'triage',
      priority: data.priority || 'high',
      callerCategory: data.callerCategory || 'unknown',
      callerName: data.callerName,
      callerPhone: data.callerPhone,
      urgencyScore: data.urgencyScore,
      urgencyLevel: data.urgencyLevel,
      emotionProfile: data.emotionProfile,
      audioMetadata: data.audioMetadata,
      officerId,
      officerName,
      leadInvestigatorId: officerId,
      taskForce: data.taskForce || 'Cybercrime Quick Reaction Team (QRT)',
      classificationStandard: data.classificationStandard || 'FedRAMP High / CJIS Tier 4',
      securityEnclave: 'TOP SECRET // SCI',
      createdAt: now,
      updatedAt: now,
      segments: [],
      entities: [],
      triggers: [],
      vocalIndicators: [],
      timeline: [
        {
          id: `TL-${Date.now()}`,
          timestamp: 0,
          timeLabel: '00:00',
          title: 'Emergency Call Received',
          description: `Call intake registered by ${officerName}`,
          category: 'call_start',
        },
      ],
      notes: [],
      reviews: [],
      isSyntheticDemo: data.isSyntheticDemo ?? false,
      fixtureId: data.fixtureId,
    };

    this.cases.unshift(newCase);
    this.logAuditEvent({
      action: 'CASE_CREATED',
      actorId: officerId,
      actorName: officerName,
      officer: officerName,
      resourceType: 'case',
      resourceId: newId,
      details: `Docket #${newId} created: "${data.title}"`,
      enclaveSecurityLevel: 'TOP SECRET // SCI',
    });

    this.persist();
    return newCase;
  }

  public updateCase(
    id: string,
    updates: Partial<Case>,
    officerSession?: OfficerSession | { officerId?: string; officerName?: string }
  ): Case | null {
    const existing = this.getCaseById(id);
    if (!existing) return null;

    const safeUpdates = { ...updates };
    delete (safeUpdates as any).id;
    delete (safeUpdates as any).docketNumber;
    delete (safeUpdates as any).createdAt;

    Object.assign(existing, safeUpdates, { updatedAt: new Date().toISOString() });

    const actorId = (officerSession as any)?.user?.id || (officerSession as any)?.officerId || 'JENKINS-4829';
    const actorName = (officerSession as any)?.user?.name || (officerSession as any)?.officerName || 'Det. S. Jenkins #4829';

    this.logAuditEvent({
      action: 'CASE_UPDATED',
      actorId,
      actorName,
      officer: actorName,
      resourceType: 'case',
      resourceId: existing.id,
      details: `Case #${existing.id} updated by authorized officer: [${Object.keys(safeUpdates).join(', ')}]`,
      enclaveSecurityLevel: existing.securityEnclave || 'TOP SECRET // SCI',
    });

    this.persist();
    return existing;
  }

  public deleteCase(
    id: string,
    officerSession?: OfficerSession | { officerId?: string; officerName?: string }
  ): boolean {
    const cleanId = id.replace(/^#/, '');
    const index = this.cases.findIndex((c) => c.id === cleanId);
    if (index === -1) return false;

    const actorId = (officerSession as any)?.user?.id || (officerSession as any)?.officerId || 'JENKINS-4829';
    const actorName = (officerSession as any)?.user?.name || (officerSession as any)?.officerName || 'Det. S. Jenkins #4829';

    this.cases.splice(index, 1);
    this.logAuditEvent({
      action: 'CASE_DELETED',
      actorId,
      actorName,
      officer: actorName,
      resourceType: 'case',
      resourceId: cleanId,
      details: `Docket #${cleanId} deleted by authorized officer`,
      enclaveSecurityLevel: 'TOP SECRET // SCI',
    });
    this.persist();
    return true;
  }

  public attachAudio(
    caseId: string,
    metadata: AudioMetadata,
    officerSession?: OfficerSession | { officerId?: string; officerName?: string }
  ): Case | null {
    const existing = this.getCaseById(caseId);
    if (!existing) return null;

    existing.audioMetadata = metadata;
    existing.status = 'under_review';
    existing.updatedAt = new Date().toISOString();

    const actorId = (officerSession as any)?.user?.id || (officerSession as any)?.officerId || 'JENKINS-4829';
    const actorName = (officerSession as any)?.user?.name || (officerSession as any)?.officerName || 'Det. S. Jenkins #4829';

    this.logAuditEvent({
      action: 'AUDIO_ATTACHED',
      actorId,
      actorName,
      officer: actorName,
      resourceType: 'audio',
      resourceId: caseId,
      details: `Audio file ${metadata.filename} attached (${(metadata.sizeBytes / (1024 * 1024)).toFixed(1)}MB). Chain-of-custody SHA256: ${metadata.sha256Hash.substring(0, 16)}...`,
      enclaveSecurityLevel: 'TOP SECRET // SCI',
    });

    this.persist();
    return existing;
  }

  public purgeAudio(
    caseId: string,
    officerSession?: OfficerSession | { officerId?: string; officerName?: string }
  ): boolean {
    const existing = this.getCaseById(caseId);
    if (!existing) return false;

    // Idempotent: if already purged, return true immediately
    if (existing.audioMetadata?.purged) return true;

    if (!existing.audioMetadata) {
      existing.audioMetadata = {
        filename: 'AUDIO_STREAM.wav',
        durationSeconds: 0,
        sampleRate: 0,
        channels: 0,
        format: '',
        mimeType: 'audio/wav',
        sizeBytes: 0,
        sha256Hash: '',
        uploadedAt: existing.createdAt || new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        retentionHours: 24,
        storagePath: '',
        purged: false,
      };
    }

    // Delete local file from disk if it exists and verify deletion against filesystem
    const { fs: nodeFs, path: nodePath } = getNodeModules();
    if (nodeFs && nodePath && existing.audioMetadata.storagePath) {
      const fullPath = nodePath.isAbsolute(existing.audioMetadata.storagePath)
        ? existing.audioMetadata.storagePath
        : nodePath.join(process.cwd(), existing.audioMetadata.storagePath.replace(/^\//, ''));

      // If file exists, attempt deletion and verify deletion on filesystem
      if (nodeFs.existsSync(fullPath)) {
        try {
          nodeFs.unlinkSync(fullPath);
        } catch (unlinkErr: any) {
          console.error(`[Store] Audio purge failed: could not unlink ${fullPath}:`, unlinkErr);
          const actorId = (officerSession as any)?.user?.id || (officerSession as any)?.officerId || 'JENKINS-4829';
          const actorName = (officerSession as any)?.user?.name || (officerSession as any)?.officerName || 'Det. S. Jenkins #4829';
          this.logAuditEvent({
            action: 'AUDIO_PURGE_FAILED',
            actorId,
            actorName,
            officer: actorName,
            resourceType: 'audio',
            resourceId: caseId,
            details: `Storage unlink failed: ${unlinkErr.message}. Record unpurged.`,
            enclaveSecurityLevel: existing.securityEnclave || 'TOP SECRET // SCI',
          });
          throw new Error(`Storage file deletion failed for case #${caseId}: ${unlinkErr.message}`);
        }

        // Mandatory storage verification: file MUST NOT exist after unlink
        if (nodeFs.existsSync(fullPath)) {
          console.error('[Store] Audio purge failed: file still exists on disk after unlink:', fullPath);
          const actorId = (officerSession as any)?.user?.id || (officerSession as any)?.officerId || 'JENKINS-4829';
          const actorName = (officerSession as any)?.user?.name || (officerSession as any)?.officerName || 'Det. S. Jenkins #4829';
          this.logAuditEvent({
            action: 'AUDIO_PURGE_UNVERIFIED',
            actorId,
            actorName,
            officer: actorName,
            resourceType: 'audio',
            resourceId: caseId,
            details: `Storage deletion unverified: file still detected at ${fullPath}. Record unpurged.`,
            enclaveSecurityLevel: existing.securityEnclave || 'TOP SECRET // SCI',
          });
          throw new Error(`Storage file deletion unconfirmed for case #${caseId}: file still detected on storage.`);
        }
      }
    }

    // Deletion verified (or file never existed). Mark purged and clear path.
    existing.audioMetadata.purged = true;
    existing.audioMetadata.storagePath = '';
    existing.updatedAt = new Date().toISOString();

    const actorId = (officerSession as any)?.user?.id || (officerSession as any)?.officerId || 'JENKINS-4829';
    const actorName = (officerSession as any)?.user?.name || (officerSession as any)?.officerName || 'Det. S. Jenkins #4829';

    this.logAuditEvent({
      action: 'AUDIO_PURGED',
      actorId,
      actorName,
      officer: actorName,
      resourceType: 'audio',
      resourceId: caseId,
      details: `Audio for case #${existing.id} purged in compliance with retention policy (storage deletion verified). Findings preserved.`,
      enclaveSecurityLevel: existing.securityEnclave || 'TOP SECRET // SCI',
    });

    this.persist();
    return true;
  }

  public recordReview(
    caseId: string,
    review: Omit<OfficerReviewAction, 'id' | 'timestamp'>,
    officerSession?: OfficerSession | { officerId?: string; officerName?: string }
  ): Case | null {
    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return null;

    // Server-derived officer identity: session identity always takes precedence over untrusted review payload
    const officerId = (officerSession as any)?.user?.id || (officerSession as any)?.officerId || review.officerId || 'JENKINS-4829';
    const officerName = (officerSession as any)?.user?.name || (officerSession as any)?.officerName || review.officerName || 'Det. S. Jenkins #4829';

    const actionId = `REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const fullReview: OfficerReviewAction = {
      ...review,
      id: actionId,
      officerId,
      officerName,
      timestamp: new Date().toISOString(),
    };

    if (!targetCase.reviews) {
      targetCase.reviews = [];
    }
    targetCase.reviews.push(fullReview);

    // Apply updates based on targetType (supports canonical schema and legacy aliases)
    if (review.targetType === 'trigger') {
      const trig = (targetCase.triggers || []).find((t: EmergencyTrigger) => t.id === review.targetId);
      if (trig) {
        trig.verificationStatus =
          review.action === 'confirm'
            ? 'confirmed'
            : review.action === 'correct'
            ? 'confirmed'
            : 'dismissed';
        trig.verifiedBy = officerName;
        trig.verifiedAt = fullReview.timestamp;
        if (review.reason) trig.officerNotes = review.reason;
        if (review.newValue) trig.explanation = review.newValue;
      }
    } else if (review.targetType === 'finding' || review.targetType === 'entity') {
      const ent = (targetCase.entities || []).find((e: ExtractedEntity) => e.id === review.targetId);
      if (ent) {
        ent.verificationStatus =
          review.action === 'confirm'
            ? 'confirmed'
            : review.action === 'correct'
            ? 'corrected'
            : 'dismissed';
        if (review.newValue) {
          ent.value = review.newValue;
          ent.normalizedValue = review.newValue;
        }
        ent.verifiedBy = officerName;
        ent.verifiedAt = fullReview.timestamp;
      }
    } else if (review.targetType === 'transcript' || review.targetType === 'transcript_segment') {
      const seg = (targetCase.segments || []).find((s: TranscriptSegment) => s.id === review.targetId);
      if (seg) {
        if (review.newValue) {
          seg.editedText = review.newValue;
          seg.editedBy = officerName;
          seg.editedAt = fullReview.timestamp;
        }
      }
    }

    targetCase.status = 'officer_verified';
    targetCase.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      action: `OFFICER_REVIEW_${review.action.toUpperCase()}`,
      actorId: officerId,
      actorName: officerName,
      officer: officerName,
      resourceType: review.targetType,
      resourceId: review.targetId,
      details: `Officer reviewed ${review.targetType} ${review.targetId}: ${review.action.toUpperCase()}${review.reason ? ` (${review.reason})` : ''}`,
      enclaveSecurityLevel: targetCase.securityEnclave || 'TOP SECRET // SCI',
    });

    this.persist();
    return targetCase;
  }

  public addNote(
    caseId: string,
    content: string,
    officerName: string = 'Det. S. Jenkins #4829',
    officerSession?: OfficerSession | { officerId?: string; officerName?: string }
  ): Case | null {
    const targetCase = this.getCaseById(caseId);
    if (!targetCase) return null;

    const actorId = (officerSession as any)?.user?.id || (officerSession as any)?.officerId || 'JENKINS-4829';
    const resolvedOfficerName = (officerSession as any)?.user?.name || (officerSession as any)?.officerName || officerName;

    const newNote: CaseNote = {
      id: `NOTE-${Date.now()}`,
      caseId: targetCase.id,
      officerId: actorId,
      officerName: resolvedOfficerName,
      content,
      createdAt: new Date().toISOString(),
    };

    if (!targetCase.notes) {
      targetCase.notes = [];
    }
    targetCase.notes.push(newNote);
    targetCase.updatedAt = new Date().toISOString();

    this.logAuditEvent({
      action: 'NOTE_ADDED',
      actorId,
      actorName: resolvedOfficerName,
      officer: resolvedOfficerName,
      resourceType: 'case_note',
      resourceId: targetCase.id,
      details: `Case note recorded on #${targetCase.id}`,
      enclaveSecurityLevel: 'TOP SECRET // SCI',
    });

    this.persist();
    return targetCase;
  }

  public getDashboardStats(): DashboardStats {
    const totalCases = this.cases.length;
    const underReview = this.cases.filter((c) => c.status === 'under_review' || c.status === 'Under Review').length;
    const totalTriggers = this.cases.reduce((sum, c) => sum + (c.triggers?.length || 0), 0);
    const activeAnalyses = this.cases.filter((c) => c.status === 'triage' || c.status === 'under_review').length;

    return {
      totalCasesAnalyzed: totalCases,
      casesChangeVsLastWeek: '+0.0% vs last wk',
      activeAnalyses,
      activeAudioFeedsLabel: 'Active audio feeds',
      flaggedTriggers: totalTriggers,
      flaggedTriggersLabel: 'Keyword / pattern hit',
      pendingReviews: underReview,
      pendingReviewsLabel: 'Awaiting officer signoff',
      dailyCallActivity: [
        { day: 'M', count: 0 },
        { day: 'T', count: 0 },
        { day: 'W', count: 0 },
        { day: 'T', count: 0 },
        { day: 'F', count: 0 },
        { day: 'S', count: 0 },
        { day: 'S', count: totalCases, active: true },
      ],
      avgCallsPerDay: totalCases,
      peakDayLabel: `Current active: ${totalCases}`,
    };
  }

  public reset(): void {
    this.cases = JSON.parse(JSON.stringify(INITIAL_CASES));
    this.auditLogs = [
      {
        id: 'AUD-001',
        action: 'SYSTEM_BOOTSTRAP',
        actorId: 'OFFICER-01',
        actorName: 'Investigating Officer 01',
        officer: 'Investigating Officer 01',
        resourceType: 'system',
        resourceId: 'enclave-local',
        details: 'Local secure enclave initialized with clean forensic case records.',
        timestamp: new Date().toISOString(),
        enclaveSecurityLevel: 'TOP SECRET // SCI',
      },
    ];
    this.persist();
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs].reverse();
  }

  public logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.push(fullEntry);
    this.persist();
  }
}

// Global singleton instance with cross-module server enclave persistence
const globalRef = typeof globalThis !== 'undefined' ? (globalThis as any) : {};
export const store: CaseStore = globalRef.__vecnaverse_store || new CaseStore();
if (typeof window === 'undefined') {
  globalRef.__vecnaverse_store = store;
}

/**
 * Checks whether a given case is a synthetic demo / fixture case.
 */
export function isSyntheticCase(caseData?: Case | null): boolean {
  if (!caseData) return false;
  if (caseData.isSyntheticDemo === true) return true;
  if (caseData.fixtureId) return true;
  const id = caseData.id || '';
  if (id.startsWith('FIXTURE-')) {
    return true;
  }
  const filename = caseData.audioMetadata?.filename || '';
  if (
    filename.includes('DIGITAL_ARREST') ||
    filename.includes('EXTORTION') ||
    filename.includes('INFORMANT_TIP') ||
    filename.includes('PANIC_9104') ||
    filename.includes('COERCION_9088') ||
    filename.includes('WHISTLEBLOWER_9065') ||
    filename.includes('MULE_ACCOUNT_9051')
  ) {
    return true;
  }
  return false;
}

