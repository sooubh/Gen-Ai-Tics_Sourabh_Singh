import { describe, it, expect, beforeEach } from 'vitest';
import { store } from '../src/lib/data/store';
import { POST as analyzePost } from '../src/app/api/cases/[id]/analyze/route';
import { POST as reviewPost } from '../src/app/api/cases/[id]/review/route';
import { GET as exportGet } from '../src/app/api/cases/[id]/export/route';
import { escapeCsvField } from '../src/lib/export/csv-utils';
import { POST as retentionPost } from '../src/app/api/cases/[id]/retention/route';
import { GET as telemetryGet } from '../src/app/api/telemetry/route';
import { NextRequest } from 'next/server';

describe('Cybercrime API Routes & SER Triage Suite', () => {
  let testCaseId: string;

  beforeEach(() => {
    const newCase = store.createCase({
      title: 'Emergency Triage Test Call',
      description: 'Extortion and distress test intercept',
      callerCategory: 'distressed_victim',
      callerName: 'Pooja Verma',
      callerPhone: '+91 98765 43210',
      urgencyScore: 88,
    });
    testCaseId = newCase.id;
  });

  describe('POST /api/cases/[id]/analyze', () => {
    it('returns 404 for non-existent case', async () => {
      const req = new NextRequest('http://localhost:3000/api/cases/INVALID-9999/analyze', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const res = await analyzePost(req, { params: Promise.resolve({ id: 'INVALID-9999' }) });
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('falls back to default valid synthetic fixture when no API key is set', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ useSynthetic: true }),
      });
      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.case.segments.length).toBeGreaterThan(0);
      expect(data.case.emotionProfile).toBeDefined();
      expect(data.case.urgencyScore).toBeGreaterThanOrEqual(50);
      expect(data.case.emotionProfile.primaryEmotion).toBeDefined();
    });

    it('sets truthful provenance (isSyntheticDemo: true, analysisProvider: synthetic-fixture) in demo mode', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ useSynthetic: true, fixtureId: 'extortion-demand' }),
      });
      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.isSyntheticDemo).toBe(true);
      expect(data.analysisProvider).toBe('synthetic-fixture');
      expect(data.modelUsed).toBe('synthetic-fixture');
      expect(data.case.latestRun.isSyntheticDemo).toBe(true);
      expect(data.case.latestRun.analysisProvider).toBe('synthetic-fixture');
    });

    it('removes fabricated emotion metrics: eliminates hardcoded jitter, speech rate, tremor, and energy', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ useSynthetic: true }),
      });
      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      const metrics = data.case.emotionProfile.acousticMetrics;

      expect(metrics.available).toBe(false);
      expect(metrics.disclaimer).toContain('Forensic acoustic DSP metrics not measured by basic LLM');
      expect(metrics.pitchJitterHz).toBeUndefined();
      expect(metrics.speechRateWpm).toBeUndefined();
      expect(metrics.vocalTremorScore).toBeUndefined();
      expect(metrics.energySpikeDb).toBeUndefined();
    });

    it('rejects unconfigured API key on real audio analysis without masking as synthetic success', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      try {
        const realCase = store.createCase({
          title: 'Real Audio Intercept Test',
          audioMetadata: {
            filename: 'real_intercept.wav',
            storagePath: '/uploads/audio/real_intercept.wav',
            durationSeconds: 15,
            sampleRate: 16000,
            channels: 1,
            format: 'wav',
            mimeType: 'audio/wav',
            sizeBytes: 480000,
            sha256Hash: 'a'.repeat(64),
            uploadedAt: new Date().toISOString(),
            expiresAt: new Date().toISOString(),
            retentionHours: 24,
            purged: false,
          },
        });

        // Request REAL analysis (useSynthetic is false/omitted)
        const req = new NextRequest(`http://localhost:3000/api/cases/${realCase.id}/analyze`, {
          method: 'POST',
          body: JSON.stringify({ useSynthetic: false }),
        });
        const res = await analyzePost(req, { params: Promise.resolve({ id: realCase.id }) });
        expect(res.status).toBe(500);

        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.status).toBe('FAILED');
        expect(data.failureReason).toContain('Gemini API key is not configured');
        expect(data.isSyntheticDemo).toBe(false);
        expect(data.case.latestRun.status).toBe('failed');
      } finally {
        if (originalKey) process.env.GEMINI_API_KEY = originalKey;
      }
    });

    it('returns FAILED status and records failure when real audio file is missing from disk', async () => {
      process.env.GEMINI_API_KEY = 'mock-api-key-for-test';

      try {
        const realCase = store.createCase({
          title: 'Missing File Test',
          audioMetadata: {
            filename: 'non_existent_file.wav',
            storagePath: '/uploads/audio/NON_EXISTENT_AUDIO_CALL_404.wav',
            durationSeconds: 10,
            sampleRate: 16000,
            channels: 1,
            format: 'wav',
            mimeType: 'audio/wav',
            sizeBytes: 320000,
            sha256Hash: 'b'.repeat(64),
            uploadedAt: new Date().toISOString(),
            expiresAt: new Date().toISOString(),
            retentionHours: 24,
            purged: false,
          },
        });

        const req = new NextRequest(`http://localhost:3000/api/cases/${realCase.id}/analyze`, {
          method: 'POST',
          body: JSON.stringify({ useSynthetic: false }),
        });
        const res = await analyzePost(req, { params: Promise.resolve({ id: realCase.id }) });
        expect(res.status).toBe(400); // Bad media / not found on disk

        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.status).toBe('FAILED');
        expect(data.failureReason).toContain('Audio file not found on disk');
        expect(data.isSyntheticDemo).toBe(false);
        expect(data.case.latestRun.status).toBe('failed');
      } finally {
        delete process.env.GEMINI_API_KEY;
      }
    });
  });

  describe('POST /api/cases/[id]/review', () => {
    it('returns 400 when required attributes are missing', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/review`, {
        method: 'POST',
        body: JSON.stringify({ targetId: '123' }), // missing targetType and action
      });
      const res = await reviewPost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(400);
    });

    it('confirms and corrects triggers without marking them dismissed', async () => {
      // First populate triggers via analyze
      const analyzeReq = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ fixtureId: 'extortion-demand', useSynthetic: true }),
      });
      await analyzePost(analyzeReq, { params: Promise.resolve({ id: testCaseId }) });

      const updatedCase = store.getCaseById(testCaseId);
      expect(updatedCase?.triggers.length).toBeGreaterThan(0);
      const trigger = updatedCase!.triggers[0];

      // Test 'correct' action
      const reviewReq = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'trigger',
          targetId: trigger.id,
          action: 'correct',
          reason: 'Officer verified context note',
        }),
      });
      const reviewRes = await reviewPost(reviewReq, { params: Promise.resolve({ id: testCaseId }) });
      expect(reviewRes.status).toBe(200);

      const reviewedCase = store.getCaseById(testCaseId);
      const reviewedTrigger = reviewedCase!.triggers.find((t) => t.id === trigger.id);
      expect(reviewedTrigger?.verificationStatus).toBe('confirmed'); // MUST NOT be 'dismissed'
    });

    it('updates entity value and normalizedValue on entity correction', async () => {
      const analyzeReq = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ fixtureId: 'extortion-demand', useSynthetic: true }),
      });
      await analyzePost(analyzeReq, { params: Promise.resolve({ id: testCaseId }) });

      const targetCase = store.getCaseById(testCaseId);
      expect(targetCase?.entities.length).toBeGreaterThan(0);
      const entity = targetCase!.entities[0];

      const reviewReq = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/review`, {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'entity',
          targetId: entity.id,
          action: 'correct',
          newValue: '5000000 INR (Corrected)',
        }),
      });
      const reviewRes = await reviewPost(reviewReq, { params: Promise.resolve({ id: testCaseId }) });
      expect(reviewRes.status).toBe(200);

      const refreshed = store.getCaseById(testCaseId);
      const refreshedEntity = refreshed!.entities.find((e) => e.id === entity.id);
      expect(refreshedEntity?.value).toBe('5000000 INR (Corrected)');
      expect(refreshedEntity?.normalizedValue).toBe('5000000 INR (Corrected)');
      expect(refreshedEntity?.verificationStatus).toBe('corrected');
    });
  });

  describe('GET /api/cases/[id]/export', () => {
    it('defends against formula injection with leading whitespace or pipe symbols', () => {
      expect(escapeCsvField('=SUM(A1:A10)')).toBe('"\'=SUM(A1:A10)"');
      expect(escapeCsvField('   =cmd|/C calc')).toBe('"\'   =cmd|/C calc"');
      expect(escapeCsvField('|calc.exe')).toBe('"\'|calc.exe"');
      expect(escapeCsvField('+12345')).toBe('"\'+12345"');
      expect(escapeCsvField('Safe Text')).toBe('"Safe Text"');
    });

    it('exports sanitized CSV containing Speech Emotion and Vocal Indicator rows', async () => {
      const analyzeReq = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ fixtureId: 'extortion-demand', useSynthetic: true }),
      });
      await analyzePost(analyzeReq, { params: Promise.resolve({ id: testCaseId }) });

      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/export?format=csv`);
      const res = await exportGet(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);
      const csv = await res.text();
      expect(csv).toContain('DocketNumber');
      expect(csv).toContain('TRIGGER');
      expect(csv).toContain('TRANSCRIPT');
      expect(csv).toContain('VOCAL_INDICATOR');
    });
  });

  describe('POST /api/cases/[id]/retention', () => {
    it('performs idempotent audio purge without duplicate audit log spam', async () => {
      const req1 = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, { method: 'POST' });
      const res1 = await retentionPost(req1, { params: Promise.resolve({ id: testCaseId }) });
      expect(res1.status).toBe(200);

      const targetCase = store.getCaseById(testCaseId);
      expect(targetCase?.audioMetadata?.purged).toBe(true);

      // Repeat call should succeed idempotently
      const req2 = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/retention`, { method: 'POST' });
      const res2 = await retentionPost(req2, { params: Promise.resolve({ id: testCaseId }) });
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.success).toBe(true);
    });
  });

  describe('GET /api/telemetry', () => {
    it('returns genuine system health, storage check, and compliance disclaimers without hardcoded CJIS claim', async () => {
      const res = await telemetryGet();
      expect(res.status).toBe(200);
      const data = await res.json();

      // System telemetry
      expect(data.system).toBeDefined();
      expect(data.system.nodeVersion).toMatch(/^v\d+/);
      expect(typeof data.system.uptimeSeconds).toBe('number');
      expect(data.system.memoryUsage.heapUsedMb).toBeGreaterThan(0);

      // Storage writability
      expect(data.storage).toBeDefined();
      expect(typeof data.storage.writable).toBe('boolean');

      // Compliance disclaimers
      expect(data.compliance).toBeDefined();
      expect(data.compliance.thirdPartyAudited).toBe(false);
      expect(data.compliance.notice).toContain('third-party audit');
      expect(data.cjisCompliant).toBeUndefined();
      expect(data.isolatedDiskBacking).toBeUndefined();
    });
  });
});
