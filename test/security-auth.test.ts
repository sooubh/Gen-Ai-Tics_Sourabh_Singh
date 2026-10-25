import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import fs from 'fs';
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
import {
  savePrivateAudioFile,
  deletePrivateAudioFile,
} from '../src/lib/storage/private-storage';

describe('Independent Verification: Security & Authentication Boundaries (Agent E)', () => {
  const originalEnv = process.env.NODE_ENV;
  const originalAppEnv = process.env.APP_ENV;
  let testCaseId: string;
  let crossOfficerCaseId: string;
  const filesToCleanup: string[] = [];

  beforeEach(() => {
    // 1. Create a case assigned to Officer Jenkins (Tier 4 / TOP SECRET // SCI)
    const jenkinsCase = store.createCase({
      title: 'Intercept Docket — Jenkins Investigation',
      operationName: 'Operation Guardian',
      priority: 'high',
      officerName: 'Det. S. Jenkins #4829',
    });
    jenkinsCase.officerId = 'JENKINS-4829';
    jenkinsCase.securityEnclave = 'TOP SECRET // SCI';
    testCaseId = jenkinsCase.id;

    // 2. Create a case assigned to Officer Miller (Tier 2 / CONFIDENTIAL)
    const millerCase = store.createCase({
      title: 'Regional Fraud Case — Miller Investigation',
      operationName: 'Operation BlueSky',
      priority: 'medium',
      officerName: 'Det. A. Miller #1042',
    });
    millerCase.officerId = 'MILLER-1042';
    millerCase.leadInvestigatorId = 'MILLER-1042';
    millerCase.assignedOfficerName = 'Det. A. Miller #1042';
    millerCase.securityEnclave = 'CONFIDENTIAL';
    crossOfficerCaseId = millerCase.id;
  });

  afterEach(() => {
    (process.env as any).NODE_ENV = originalEnv;
    process.env.APP_ENV = originalAppEnv;
    for (const f of filesToCleanup) {
      try {
        deletePrivateAudioFile(f);
      } catch {}
    }
    filesToCleanup.length = 0;
    vi.restoreAllMocks();
  });

  describe('1. Verified Session Resolution (getServerSession)', () => {
    it('resolves valid session from Bearer test token with correct officer credentials', async () => {
      const req = new NextRequest('http://localhost:3000/api/cases', {
        headers: { Authorization: 'Bearer test-token-jenkins' },
      });

      const session = await getServerSession(req);
      expect(session).not.toBeNull();
      expect(session?.user.id).toBe('JENKINS-4829');
      expect(session?.user.role).toBe('lead_investigator');
      expect(session?.authProvider).toBe('mock_token');
      expect(session?.isDevFallback).toBe(false);
    });

    it('resolves authenticated officer with role and clearance from Bearer JWT claims', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: 'OFFICER-5544',
          email: 'officer5544@cybercrime.gov',
          exp: Math.floor(Date.now() / 1000) + 7200, // Valid for 2 hours
          user_metadata: {
            officerId: 'KAPOOR-5544',
            badgeNumber: '5544',
            name: 'Inspector P. Kapoor #5544',
            role: 'officer',
            department: 'Cyber Forensics Unit',
            clearanceLevel: 'Tier 3',
            securityEnclave: 'SECRET',
          },
        })
      ).toString('base64url');
      const jwtToken = `${header}.${payload}.mocksignature`;

      const req = new NextRequest('http://localhost:3000/api/cases', {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      const session = await getServerSession(req);
      expect(session).not.toBeNull();
      expect(session?.user.id).toBe('KAPOOR-5544');
      expect(session?.user.name).toBe('Inspector P. Kapoor #5544');
      expect(session?.user.role).toBe('officer');
      expect(session?.user.clearanceLevel).toBe('Tier 3');
      expect(session?.authProvider).toBe('bearer_jwt');
    });

    it('resolves session from cookie header (sb-access-token or vecnaverse_session)', async () => {
      const req = new NextRequest('http://localhost:3000/api/cases', {
        headers: { Cookie: 'vecnaverse_session=test-token-supervisor' },
      });

      const session = await getServerSession(req);
      expect(session).not.toBeNull();
      expect(session?.user.id).toBe('VANCE-0012');
      expect(session?.user.role).toBe('supervisor');
      expect(session?.authProvider).toBe('cookie');
    });

    it('strictly rejects expired Bearer tokens and returns null', async () => {
      // 1. Explicit expired test token
      const req1 = new NextRequest('http://localhost:3000/api/cases', {
        headers: { Authorization: 'Bearer test-token-expired' },
      });
      const session1 = await getServerSession(req1);
      expect(session1).toBeNull();

      // 2. JWT with expired exp claim
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const payload = Buffer.from(
        JSON.stringify({
          sub: 'EXPIRED-OFFICER',
          exp: Math.floor(Date.now() / 1000) - 300, // Expired 5 mins ago
        })
      ).toString('base64url');
      const req2 = new NextRequest('http://localhost:3000/api/cases', {
        headers: { Authorization: `Bearer ${header}.${payload}.sig` },
      });
      const session2 = await getServerSession(req2);
      expect(session2).toBeNull();
    });

    it('strictly rejects unauthenticated requests in production environment (NODE_ENV=production)', async () => {
      (process.env as any).NODE_ENV = 'production';
      process.env.APP_ENV = 'production';

      const unauthReq = new NextRequest('http://localhost:3000/api/cases');
      const session = await getServerSession(unauthReq);
      expect(session).toBeNull();
    });
  });

  describe('2. Cross-User Denial & Multi-Tenant Authorization Boundaries', () => {
    it('denies cross-officer access: Officer Miller cannot purge audio for Officer Jenkins case (403 Forbidden)', async () => {
      // Case is owned by JENKINS-4829; caller authenticated as MILLER-1042
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-other-officer' }, // Miller
      });

      const res = await retentionPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.toLowerCase()).toMatch(/(cross-officer|access denied|insufficient)/i);
    });

    it('denies cross-officer modification: Officer Jenkins cannot purge a case owned by Officer Miller (403 Forbidden)', async () => {
      // Miller's case is CONFIDENTIAL, Jenkins has Tier 4, so clearance passes, but cross-officer ownership fails
      const req = new NextRequest(`http://localhost:3000/api/cases/${crossOfficerCaseId}/retention`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-jenkins' },
      });

      const res = await retentionPost(req, { params: Promise.resolve({ id: crossOfficerCaseId }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.toLowerCase()).toContain('cross-officer modification is prohibited');
    });

    it('denies cross-officer access: Officer Miller cannot review/edit Officer Jenkins case triggers (403 Forbidden)', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/review`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-other-officer' },
        body: JSON.stringify({
          targetType: 'trigger',
          targetId: 'trig-1',
          action: 'confirm',
        }),
      });

      const res = await reviewPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('denies access if officer clearance is insufficient for TOP SECRET // SCI enclave (403)', () => {
      const millerSession: OfficerSession = {
        user: {
          id: 'MILLER-1042',
          badgeNumber: '1042',
          name: 'Det. A. Miller #1042',
          role: 'officer',
          agency: 'Regional Cyber Squad',
          department: 'Digital Forensics',
          securityEnclave: 'CONFIDENTIAL',
          clearanceLevel: 'Tier 2',
        },
        authProvider: 'mock_token',
        isDevFallback: false,
        provenance: 'TEST',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      const targetCase = store.getCaseById(testCaseId)!;
      targetCase.securityEnclave = 'TOP SECRET // SCI';

      const authResult = authorizeCaseAccess(millerSession, targetCase);
      expect(authResult.authorized).toBe(false);
      expect(authResult.statusCode).toBe(403);
      expect(authResult.reason?.toLowerCase()).toContain('security clearance insufficient');
    });

    it('permits authorized command staff (supervisor and admin) global oversight access', () => {
      const supervisorSession: OfficerSession = {
        user: {
          id: 'VANCE-0012',
          badgeNumber: '0012',
          name: 'Cmdr. M. Vance #0012',
          role: 'supervisor',
          agency: 'Task Force HQ',
          department: 'Command Staff',
          securityEnclave: 'TOP SECRET // SCI',
          clearanceLevel: 'Tier 4',
        },
        authProvider: 'mock_token',
        isDevFallback: false,
        provenance: 'TEST',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      const targetCase = store.getCaseById(testCaseId)!;
      const authResult = authorizeCaseAccess(supervisorSession, targetCase);
      expect(authResult.authorized).toBe(true);
    });

    it('enforces role-based operational gates: analysts cannot perform admin actions', () => {
      const analystSession: OfficerSession = {
        user: {
          id: 'PATEL-3312',
          badgeNumber: '3312',
          name: 'Analyst R. Patel #3312',
          role: 'analyst',
          agency: 'Cyber Forensics Unit',
          department: 'Audio Intelligence',
          securityEnclave: 'TOP SECRET // SCI',
          clearanceLevel: 'Tier 3',
        },
        authProvider: 'mock_token',
        isDevFallback: false,
        provenance: 'TEST',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      const roleCheck = requireRole(analystSession, ['admin', 'supervisor']);
      expect(roleCheck.authorized).toBe(false);
      expect(roleCheck.statusCode).toBe(403);
    });

    it('discards client-submitted officerId to defeat identity spoofing and enforces verified session attribution', () => {
      const session: OfficerSession = {
        user: { ...DEV_DEFAULT_OFFICER },
        authProvider: 'bearer_jwt',
        isDevFallback: false,
        provenance: 'VERIFIED',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      };

      const untrustedClientBody = {
        officerId: 'ATTACKER_SPOOFED_ID',
        officerName: 'Attacker Impersonator',
      };

      const attribution = deriveOfficerAttribution(session, untrustedClientBody);
      expect(attribution.officerId).toBe('JENKINS-4829'); // Must match session!
      expect(attribution.officerName).toBe('Det. S. Jenkins #4829');
    });
  });

  describe('3. Verified Retention Deletion Behavior', () => {
    it('verifies that audio file is physically removed from storage before marking purged = true', async () => {
      // 1. Create a dummy audio file on disk
      const dummyAudio = Buffer.from('RIFF....WAVEfmt ....data....test');
      const stored = savePrivateAudioFile(dummyAudio, 'retention_test_verify.wav');
      filesToCleanup.push(stored.storagePath);

      expect(fs.existsSync(stored.absolutePath)).toBe(true);

      // 2. Attach audio to test case
      store.attachAudio(testCaseId, {
        filename: 'retention_test_verify.wav',
        sizeBytes: dummyAudio.length,
        durationSeconds: 10,
        mimeType: 'audio/wav',
        format: 'PCM 16-bit / 44.1 kHz',
        sha256Hash: 'dummyhash1234567890abcdef1234567890abcdef1234567890abcdef12345678',
        uploadedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        retentionHours: 24,
        storagePath: stored.storagePath,
        purged: false,
      });

      // 3. Purge audio via retention API with authorized session
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-jenkins' },
      });

      const res = await retentionPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);

      // 4. Verify physical deletion from disk
      expect(fs.existsSync(stored.absolutePath)).toBe(false);

      // 5. Verify case state is properly marked purged
      const updatedCase = store.getCaseById(testCaseId);
      expect(updatedCase?.audioMetadata?.purged).toBe(true);
      expect(updatedCase?.audioMetadata?.storagePath).toBe('');
    });

    it('fails safely and does NOT mark purged if storage deletion cannot be confirmed', async () => {
      // Attach an audio file to the case
      store.attachAudio(testCaseId, {
        filename: 'critical_custody_audio.wav',
        sizeBytes: 1024,
        durationSeconds: 15,
        mimeType: 'audio/wav',
        format: 'PCM 16-bit / 44.1 kHz',
        sha256Hash: 'abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234',
        uploadedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        retentionHours: 24,
        storagePath: 'uploads/audio/critical_custody_audio.wav',
        purged: false,
      });

      // Mock store.purgeAudio to simulate storage disk failure / unconfirmed deletion
      vi.spyOn(store, 'purgeAudio').mockImplementation(() => {
        throw new Error('EACCES: permission denied, unlink failed');
      });

      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-jenkins' },
      });

      const res = await retentionPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.toLowerCase()).toContain('retention purge failed');

      // Crucial: Audio must NOT be marked purged!
      const unpurgedCase = store.getCaseById(testCaseId);
      expect(unpurgedCase?.audioMetadata?.purged).toBe(false);
      expect(unpurgedCase?.audioMetadata?.storagePath).toBe('uploads/audio/critical_custody_audio.wav');
    });

    it('ensures purge is idempotent: repeated purge calls succeed safely without duplicating audit entries', async () => {
      // 1. Initial successful purge
      const req1 = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-jenkins' },
      });
      const res1 = await retentionPost(req1, { params: Promise.resolve({ id: testCaseId }) });
      expect(res1.status).toBe(200);

      const initialAuditCount = store.getAuditLogs().filter(
        (l) => l.action === 'AUDIO_PURGED' && l.resourceId === testCaseId
      ).length;

      // 2. Repeat call on already-purged case
      const req2 = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, {
        method: 'POST',
        headers: { Authorization: 'Bearer test-token-jenkins' },
      });
      const res2 = await retentionPost(req2, { params: Promise.resolve({ id: testCaseId }) });
      expect(res2.status).toBe(200);

      const postRepeatAuditCount = store.getAuditLogs().filter(
        (l) => l.action === 'AUDIO_PURGED' && l.resourceId === testCaseId
      ).length;

      // Audit logs must not be spammed with duplicate purges
      expect(postRepeatAuditCount).toBe(initialAuditCount);
    });
  });
});
