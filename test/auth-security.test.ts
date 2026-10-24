import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';
import {
  getServerSession,
  authorizeCaseAccess,
  requireRole,
  deriveOfficerAttribution,
  DEV_DEFAULT_OFFICER,
  OfficerSession,
} from '../src/lib/auth/session';
import { store } from '../src/lib/data/store';
import { POST as retentionPost } from '../src/app/api/cases/[id]/retention/route';
import { POST as reviewPost } from '../src/app/api/cases/[id]/review/route';
import { PATCH as casePatch } from '../src/app/api/cases/[id]/route';

describe('Agent B: Authentication, Authorization & Retention Security Suite', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
  });

  describe('1. Server-Side Session & Identity Management (getServerSession)', () => {
    it('extracts officer identity from known test bearer token', async () => {
      const req = new NextRequest('http://localhost:3000/api/cases', {
        headers: {
          Authorization: 'Bearer test-token-jenkins',
        },
      });

      const session = await getServerSession(req);
      expect(session).not.toBeNull();
      expect(session?.user.id).toBe('JENKINS-4829');
      expect(session?.user.role).toBe('lead_investigator');
      expect(session?.authProvider).toBe('mock_token');
      expect(session?.isDevFallback).toBe(false);
    });

    it('extracts officer identity with role and clearance from other test officer tokens', async () => {
      const req = new NextRequest('http://localhost:3000/api/cases', {
        headers: {
          Authorization: 'Bearer test-token-other-officer',
        },
      });

      const session = await getServerSession(req);
      expect(session).not.toBeNull();
      expect(session?.user.id).toBe('MILLER-1042');
      expect(session?.user.role).toBe('officer');
      expect(session?.user.clearanceLevel).toBe('Tier 2');
    });

    it('decodes and verifies claims from standard JWT Bearer token', async () => {
      // Create a simulated JWT with base64url header and payload
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: 'OFFICER-7788',
          email: 'det.roy@internal.cyber',
          exp: Math.floor(Date.now() / 1000) + 3600,
          user_metadata: {
            officerId: 'ROY-7788',
            badgeNumber: '7788',
            name: 'Inspector R. Roy #7788',
            role: 'lead_investigator',
            department: 'Major Cybercrime Task Force',
            clearanceLevel: 'Tier 4',
          },
        })
      ).toString('base64url');
      const fakeToken = `${header}.${payload}.signature`;

      const req = new NextRequest('http://localhost:3000/api/cases', {
        headers: {
          Authorization: `Bearer ${fakeToken}`,
        },
      });

      const session = await getServerSession(req);
      expect(session).not.toBeNull();
      expect(session?.user.id).toBe('ROY-7788');
      expect(session?.user.name).toBe('Inspector R. Roy #7788');
      expect(session?.user.role).toBe('lead_investigator');
      expect(session?.authProvider).toBe('bearer_jwt');
      expect(session?.provenance).toBe('BEARER_JWT_SIGNATURE_VERIFIED');
    });

    it('rejects expired JWT Bearer token', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: 'EXPIRED-001',
          exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
        })
      ).toString('base64url');
      const expiredToken = `${header}.${payload}.signature`;

      const req = new NextRequest('http://localhost:3000/api/cases', {
        headers: {
          Authorization: `Bearer ${expiredToken}`,
        },
      });

      const session = await getServerSession(req);
      expect(session).toBeNull();
    });

    it('provides authenticated dev officer session with clear provenance in development/test mode', async () => {
      (process.env as any).NODE_ENV = 'development';
      const req = new NextRequest('http://localhost:3000/api/cases');

      const session = await getServerSession(req);
      expect(session).not.toBeNull();
      expect(session?.isDevFallback).toBe(true);
      expect(session?.user.id).toBe(DEV_DEFAULT_OFFICER.id);
      expect(session?.provenance).toContain('DEV_ENVIRONMENT_FALLBACK');
    });

    it('strictly returns null in production mode when credentials are missing', async () => {
      (process.env as any).NODE_ENV = 'production';
      const req = new NextRequest('http://localhost:3000/api/cases');

      const session = await getServerSession(req);
      expect(session).toBeNull();
    });
  });

  describe('2. Never Trust Client Body for Attribution (deriveOfficerAttribution)', () => {
    it('discards client-submitted officerId and enforces session officer', () => {
      const session: OfficerSession = {
        user: DEV_DEFAULT_OFFICER,
        authProvider: 'mock_token',
        isDevFallback: false,
        provenance: 'test',
        expiresAt: new Date(Date.now() + 10000).toISOString(),
      };

      const untrustedClientBody = {
        officerId: 'ATTACKER_ID_OVERRIDE',
        officerName: 'Forged Officer Name',
        action: 'confirm',
      };

      const attribution = deriveOfficerAttribution(session, untrustedClientBody);
      expect(attribution.officerId).toBe(DEV_DEFAULT_OFFICER.id);
      expect(attribution.officerName).toBe(DEV_DEFAULT_OFFICER.name);
      expect(attribution.officerId).not.toBe('ATTACKER_ID_OVERRIDE');
    });
  });

  describe('3. Per-Case Authorization & Role Checks', () => {
    let testCase: any;

    beforeEach(() => {
      testCase = store.createCase({
        title: 'Confidential Extortion Docket',
        priority: 'critical',
      });
      // Explicitly assign to Det. Jenkins
      testCase.officerId = 'JENKINS-4829';
      testCase.leadInvestigatorId = 'JENKINS-4829';
      testCase.securityEnclave = 'TOP SECRET // SCI';
    });

    it('allows access to assigned lead investigator', () => {
      const jenkinsSession: OfficerSession = {
        user: DEV_DEFAULT_OFFICER,
        authProvider: 'mock_token',
        isDevFallback: false,
        provenance: 'test',
        expiresAt: new Date(Date.now() + 10000).toISOString(),
      };

      const result = authorizeCaseAccess(jenkinsSession, testCase);
      expect(result.authorized).toBe(true);
    });

    it('denies access to a different officer without supervisor/admin rights', () => {
      const otherOfficerSession: OfficerSession = {
        user: {
          id: 'MILLER-1042',
          badgeNumber: '1042',
          name: 'Det. A. Miller #1042',
          role: 'officer',
          agency: 'Regional Cyber Fraud Squad',
          department: 'Digital Forensics Unit',
          securityEnclave: 'TOP SECRET // SCI',
          clearanceLevel: 'Tier 4',
        },
        authProvider: 'mock_token',
        isDevFallback: false,
        provenance: 'test',
        expiresAt: new Date(Date.now() + 10000).toISOString(),
      };

      const result = authorizeCaseAccess(otherOfficerSession, testCase);
      expect(result.authorized).toBe(false);
      expect(result.statusCode).toBe(403);
      expect(result.reason).toContain('Cross-officer modification is prohibited');
    });

    it('allows supervisors and admins global case access', () => {
      const supervisorSession: OfficerSession = {
        user: {
          id: 'VANCE-0012',
          badgeNumber: '0012',
          name: 'Cmdr. M. Vance #0012',
          role: 'supervisor',
          agency: 'Cyber Task Force',
          department: 'Command',
          securityEnclave: 'TOP SECRET // SCI',
          clearanceLevel: 'Tier 4',
        },
        authProvider: 'mock_token',
        isDevFallback: false,
        provenance: 'test',
        expiresAt: new Date(Date.now() + 10000).toISOString(),
      };

      const result = authorizeCaseAccess(supervisorSession, testCase);
      expect(result.authorized).toBe(true);
    });

    it('denies access when officer clearance is insufficient for TOP SECRET enclave', () => {
      const lowClearanceOfficer: OfficerSession = {
        user: {
          id: 'JENKINS-4829', // same id
          badgeNumber: '4829',
          name: 'Det. S. Jenkins #4829',
          role: 'officer',
          agency: 'Cyber Task Force',
          department: 'Field',
          securityEnclave: 'CONFIDENTIAL',
          clearanceLevel: 'Tier 1', // insufficient!
        },
        authProvider: 'mock_token',
        isDevFallback: false,
        provenance: 'test',
        expiresAt: new Date(Date.now() + 10000).toISOString(),
      };

      const result = authorizeCaseAccess(lowClearanceOfficer, testCase);
      expect(result.authorized).toBe(false);
      expect(result.statusCode).toBe(403);
      expect(result.reason).toContain('clearance insufficient');
    });

    it('enforces requireRole for privilege gates', () => {
      const officerSession: OfficerSession = {
        user: {
          ...DEV_DEFAULT_OFFICER,
          role: 'officer',
        },
        authProvider: 'mock_token',
        isDevFallback: false,
        provenance: 'test',
        expiresAt: new Date(Date.now() + 10000).toISOString(),
      };

      const checkOfficer = requireRole(officerSession, 'officer');
      expect(checkOfficer.authorized).toBe(true);

      const checkAdmin = requireRole(officerSession, ['admin', 'supervisor']);
      expect(checkAdmin.authorized).toBe(false);
      expect(checkAdmin.statusCode).toBe(403);
    });
  });

  describe('4. Verified Storage Retention Purge & HTTP 500 Handling', () => {
    let testCaseId: string;
    const testAudioPath = path.join(process.cwd(), 'uploads', 'test_purge_verification.wav');

    beforeEach(() => {
      const newCase = store.createCase({
        title: 'Verified Retention Test Case',
      });
      testCaseId = newCase.id;

      // Create dummy file on disk
      fs.mkdirSync(path.dirname(testAudioPath), { recursive: true });
      fs.writeFileSync(testAudioPath, 'RIFFfakeaudiocontent');

      store.attachAudio(testCaseId, {
        filename: 'test_purge_verification.wav',
        sizeBytes: 1024,
        durationSeconds: 10,
        mimeType: 'audio/wav',
        format: 'PCM 16-bit',
        sha256Hash: 'abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234',
        uploadedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        retentionHours: 24,
        storagePath: 'uploads/test_purge_verification.wav',
        purged: false,
      });
    });

    afterEach(() => {
      if (fs.existsSync(testAudioPath)) {
        try {
          fs.unlinkSync(testAudioPath);
        } catch {}
      }
    });

    it('successfully purges audio file, verifies disk deletion, and sets purged = true', async () => {
      expect(fs.existsSync(testAudioPath)).toBe(true);

      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-jenkins' },
      });

      const res = await retentionPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.purgedBy.officerId).toBe('JENKINS-4829');

      // Verify file is actually gone from disk
      expect(fs.existsSync(testAudioPath)).toBe(false);

      // Verify store state
      const updatedCase = store.getCaseById(testCaseId);
      expect(updatedCase?.audioMetadata?.purged).toBe(true);
      expect(updatedCase?.audioMetadata?.storagePath).toBe('');
    });

    it('rejects retention purge when unauthorized cross-user officer requests it', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-other-officer' },
      });

      const res = await retentionPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(403);

      // Verify audio remains unpurged
      const currentCase = store.getCaseById(testCaseId);
      expect(currentCase?.audioMetadata?.purged).toBe(false);
      expect(fs.existsSync(testAudioPath)).toBe(true);
    });

    it('returns 401 when production mode lacks credentials', async () => {
      (process.env as any).NODE_ENV = 'production';
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, {
        method: 'POST',
      });

      const res = await retentionPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(401);
    });

    it('returns HTTP 500 and keeps record unpurged if storage deletion cannot be verified', async () => {
      // Mock store.purgeAudio to simulate storage deletion failure
      const purgeSpy = vi.spyOn(store, 'purgeAudio').mockImplementationOnce(() => {
        throw new Error('Mock storage permission denied: cannot delete audio object');
      });

      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-jenkins' },
      });

      const res = await retentionPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain('Retention purge failed');
      expect(json.details).toContain('Mock storage permission denied');

      // Verify case record was NOT marked purged
      const targetCase = store.getCaseById(testCaseId);
      expect(targetCase?.audioMetadata?.purged).toBe(false);

      purgeSpy.mockRestore();
    });
  });

  describe('5. Server-Derived Attribution in Review and Update Operations', () => {
    let testCaseId: string;

    beforeEach(() => {
      const newCase = store.createCase({
        title: 'Review Attribution Test Case',
      });
      testCaseId = newCase.id;

      // Add a test trigger to case
      const target = store.getCaseById(testCaseId);
      target!.triggers = [
        {
          id: 'TRIG-TEST-01',
          category: 'extortion_demand',
          quote: 'Send the funds or else',
          severity: 'high',
          context: 'direct',
          verificationStatus: 'unverified',
          confidence: 0.95,
        },
      ];
    });

    it('ignores client-sent officerId in review POST and records session officer', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/review`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-jenkins' },
        body: JSON.stringify({
          targetType: 'trigger',
          targetId: 'TRIG-TEST-01',
          action: 'confirm',
          officerId: 'SPOOFED_ATTACKER_ID',
          officerName: 'Spoofed Name',
          reason: 'Legitimate threat confirmed',
        }),
      });

      const res = await reviewPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.reviewedBy.officerId).toBe('JENKINS-4829');
      expect(data.reviewedBy.officerName).toBe('Det. S. Jenkins #4829');

      // Check review history inside the case
      const updatedCase = store.getCaseById(testCaseId);
      const reviewRecord = updatedCase?.reviews?.find((r) => r.targetId === 'TRIG-TEST-01');
      expect(reviewRecord?.officerId).toBe('JENKINS-4829');
      expect(reviewRecord?.officerId).not.toBe('SPOOFED_ATTACKER_ID');

      // Check audit log entry
      const auditLogs = store.getAuditLogs();
      const reviewLog = auditLogs.find((l) => l.action === 'OFFICER_REVIEW_CONFIRM' && l.resourceId === 'TRIG-TEST-01');
      expect(reviewLog?.actorId).toBe('JENKINS-4829');
      expect(reviewLog?.actorId).not.toBe('SPOOFED_ATTACKER_ID');
    });

    it('records authenticated officer in case PATCH audit log and protects immutable fields', async () => {
      const originalDocket = store.getCaseById(testCaseId)?.docketNumber;

      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}`, {
        method: 'PATCH',
        headers: { Authorization: 'Bearer test-token-jenkins' },
        body: JSON.stringify({
          title: 'Updated Safe Title',
          docketNumber: '#ILLEGAL_DOCKET_TAMPER', // attempt to tamper immutable docket
        }),
      });

      const res = await casePatch(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);

      const updatedCase = store.getCaseById(testCaseId);
      expect(updatedCase?.title).toBe('Updated Safe Title');
      expect(updatedCase?.docketNumber).toBe(originalDocket); // protected!

      const auditLogs = store.getAuditLogs();
      const patchLog = auditLogs.find((l) => l.action === 'CASE_UPDATED' && l.resourceId === testCaseId);
      expect(patchLog?.actorId).toBe('JENKINS-4829');
    });
  });
});
