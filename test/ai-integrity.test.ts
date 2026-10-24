import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { store } from '../src/lib/data/store';
import { POST as analyzePost } from '../src/app/api/cases/[id]/analyze/route';
import { GeminiAudioAdapter } from '../src/lib/ai/gemini-adapter';
import { executeSyntheticRun, getSyntheticFixture } from '../src/lib/ai/synthetic-fixtures';
import {
  STANDARD_ACOUSTIC_CAVEAT,
  STANDARD_FORENSIC_DSP_DISCLAIMER,
  PROHIBITED_INFERENCE_TERMS,
} from '../src/lib/ai/types';

describe('Independent Verification: AI Pipeline Integrity & Non-Fabrication (Agent E)', () => {
  const originalGeminiApiKey = process.env.GEMINI_API_KEY;
  let testCaseId: string;

  beforeEach(() => {
    const newCase = store.createCase({
      title: 'AI Pipeline Integrity Test Docket',
      operationName: 'Operation TruthfulAI',
      description: 'Extortion threat intake recording',
      priority: 'high',
      callerCategory: 'distressed_victim',
      callerName: 'Sunita Mehra',
      callerPhone: '+91 98102 44321',
      urgencyScore: 70,
    });
    testCaseId = newCase.id;

    // Attach mock audio metadata with storage path
    store.attachAudio(testCaseId, {
      filename: 'extortion_demand.wav',
      sizeBytes: 1024 * 512,
      durationSeconds: 95,
      mimeType: 'audio/wav',
      format: 'PCM 16-bit / 44.1 kHz',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      retentionHours: 24,
      storagePath: 'uploads/audio/extortion_demand.wav',
      purged: false,
    });
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = originalGeminiApiKey;
    vi.restoreAllMocks();
  });

  describe('1. Gemini Failure Is NOT Masked By Synthetic Success (P0 Audit Finding)', () => {
    it('returns HTTP 500 failure when GEMINI_API_KEY is not configured and synthetic mode is not explicitly requested', async () => {
      delete process.env.GEMINI_API_KEY;

      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          useSynthetic: false, // Requesting real analysis
        }),
      });

      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });

      // Must fail with 500, NOT succeed with a fake fixture
      expect(res.status).toBe(500);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.status).toBe('FAILED');
      expect(data.error).toContain('Gemini API key is not configured');
      expect(data.isSyntheticDemo).toBe(false);
      expect(data.analysisProvider).toBe('gemini');

      // Check that case status was updated to flagged with failed run record
      const updatedCase = store.getCaseById(testCaseId);
      expect(updatedCase?.status).toBe('flagged');
      expect(updatedCase?.latestRun?.status).toBe('failed');
      expect(updatedCase?.latestRun?.failureReason).toBeDefined();

      // Check audit log for failure event
      const auditLogs = store.getAuditLogs();
      const failLog = auditLogs.find((l) => l.action === 'PIPELINE_FAILED' && l.resourceId === testCaseId);
      expect(failLog).toBeDefined();
    });

    it('returns HTTP 502 failure when real Gemini API call throws a provider error (network/quota/model error)', async () => {
      process.env.GEMINI_API_KEY = 'mock-api-key-active';

      // Mock GeminiAudioAdapter.prototype.analyzeAudioFile to reject with an upstream error
      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeAudioFile').mockRejectedValue(
        new Error('Gemini upstream 503: Service Unavailable / Overloaded')
      );

      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          useSynthetic: false,
        }),
      });

      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });

      // Must NOT silently mask error with synthetic fixture (returns 502 Bad Gateway)
      expect(res.status).toBe(502);
      const data = await res.json();

      expect(data.success).toBe(false);
      expect(data.status).toBe('FAILED');
      expect(data.error).toContain('Gemini audio analysis failed');
      expect(data.error).toContain('Service Unavailable / Overloaded');
      expect(data.isSyntheticDemo).toBe(false);

      const updatedCase = store.getCaseById(testCaseId);
      expect(updatedCase?.status).toBe('flagged');
      expect(updatedCase?.latestRun?.status).toBe('failed');
    });

    it('fails safely with HTTP 400 when real audio analysis is attempted without attached storage path', async () => {
      process.env.GEMINI_API_KEY = 'mock-api-key-active';

      // Remove audioMetadata from case
      const noAudioCase = store.createCase({
        title: 'Case with no audio',
      });
      delete (noAudioCase as any).audioMetadata;

      const req = new NextRequest(`http://localhost:3000/api/cases/${noAudioCase.id}/analyze`, {
        method: 'POST',
        body: JSON.stringify({ useSynthetic: false }),
      });

      const res = await analyzePost(req, { params: Promise.resolve({ id: noAudioCase.id }) });
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.error.toLowerCase()).toContain('no audio recording attached');
    });
  });

  describe('2. Truthful Provenance Assignment (isSyntheticDemo)', () => {
    it('sets isSyntheticDemo = true and analysisProvider = "synthetic-fixture" when synthetic demo is explicitly requested', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          useSynthetic: true,
          fixtureId: 'extortion-demand',
        }),
      });

      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.isSyntheticDemo).toBe(true);
      expect(data.analysisProvider).toBe('synthetic-fixture');
      expect(data.modelUsed).toBe('synthetic-fixture');

      // Case record provenance
      const updatedCase = store.getCaseById(testCaseId);
      expect(updatedCase?.latestRun?.isSyntheticDemo).toBe(true);
      expect(updatedCase?.latestRun?.analysisProvider).toBe('synthetic-fixture');
      expect(updatedCase?.emotionProfile?.isSyntheticDemo).toBe(true);
      expect(updatedCase?.emotionProfile?.analysisProvider).toBe('synthetic-fixture');
    });

    it('sets isSyntheticDemo = false and analysisProvider = "gemini" when real analysis succeeds', async () => {
      process.env.GEMINI_API_KEY = 'mock-valid-gemini-key';

      // Mock successful Gemini response
      const mockGeminiResult = await executeSyntheticRun('extortion-demand');
      mockGeminiResult.metadata.is_synthetic_fixture = false;
      mockGeminiResult.metadata.isSyntheticDemo = false;
      mockGeminiResult.isSyntheticDemo = false;
      mockGeminiResult.analysisProvider = 'gemini';

      vi.spyOn(GeminiAudioAdapter.prototype, 'analyzeAudioFile').mockResolvedValue(mockGeminiResult);
      vi.spyOn(GeminiAudioAdapter.prototype, 'getModelId').mockReturnValue('gemini-2.5-flash');

      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          useSynthetic: false,
        }),
      });

      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);
      const data = await res.json();

      expect(data.success).toBe(true);
      expect(data.isSyntheticDemo).toBe(false);
      expect(data.analysisProvider).toBe('gemini');
      expect(data.modelUsed).toBe('gemini-2.5-flash');

      const updatedCase = store.getCaseById(testCaseId);
      expect(updatedCase?.latestRun?.isSyntheticDemo).toBe(false);
      expect(updatedCase?.latestRun?.analysisProvider).toBe('gemini');
    });

    it('ensures synthetic fixtures self-identify with isSyntheticDemo and is_synthetic_fixture', async () => {
      const fixture = await executeSyntheticRun('extortion-demand');
      expect(fixture.isSyntheticDemo).toBe(true);
      expect(fixture.metadata.is_synthetic_fixture).toBe(true);
      expect(fixture.metadata.isSyntheticDemo).toBe(true);
      expect(fixture.analysisProvider).toBe('synthetic-fixture');
    });
  });

  describe('3. Non-Fabrication of Acoustic Metrics & Legal Disclaimers (P0 Audit Finding)', () => {
    it('does NOT fabricate fixed pseudo-scientific numbers (pitch jitter 182Hz, tremor 95, energy 24.5dB)', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          useSynthetic: true,
          fixtureId: 'extortion-demand',
        }),
      });

      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });
      expect(res.status).toBe(200);
      const data = await res.json();

      const profile = data.case.emotionProfile;
      expect(profile).toBeDefined();

      // Fabricated metrics must NOT exist or must be flagged unavailable
      expect(profile.acousticMetricsAvailable).toBe(false);
      expect(profile.acousticMetrics?.available).toBe(false);

      // Verify that previously hardcoded fabricated metrics are eliminated
      expect(profile.acousticMetrics?.pitchJitterHz).toBeUndefined();
      expect(profile.acousticMetrics?.vocalTremorScore).toBeUndefined();
      expect(profile.acousticMetrics?.energySpikeDb).toBeUndefined();
    });

    it('includes mandatory forensic DSP disclaimers on all acoustic cues and emotion profiles', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          useSynthetic: true,
          fixtureId: 'extortion-demand',
        }),
      });

      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });
      const data = await res.json();

      // Check emotionProfile disclaimer
      expect(data.case.emotionProfile.disclaimer).toContain('Forensic acoustic DSP metrics not measured by basic LLM');

      // Check vocal indicators
      const vocalIndicators = data.case.vocalIndicators;
      expect(vocalIndicators.length).toBeGreaterThan(0);

      for (const cue of vocalIndicators) {
        expect(cue.isAdvisory).toBe(true);
        expect(cue.available).toBe(false);
        expect(cue.disclaimer).toContain('Forensic acoustic DSP metrics not measured by basic LLM');
        expect(cue.advisoryDisclaimer).toMatch(/(Forensic acoustic DSP metrics|does not infer guilt)/);
      }
    });

    it('strictly forbids prohibited deception and guilt terms (lying, deceptive, dishonest) in all outputs', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          useSynthetic: true,
          fixtureId: 'extortion-demand',
        }),
      });

      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });
      const textOutput = JSON.stringify(await res.json()).toLowerCase();

      for (const term of PROHIBITED_INFERENCE_TERMS) {
        expect(textOutput).not.toContain(`"${term}"`);
      }
    });

    it('calculates urgency score dynamically from verified trigger severity rather than caller category heuristics', async () => {
      const req = new NextRequest(`http://localhost:3000/api/cases/${testCaseId}/analyze`, {
        method: 'POST',
        body: JSON.stringify({
          useSynthetic: true,
          fixtureId: 'extortion-demand',
        }),
      });

      const res = await analyzePost(req, { params: Promise.resolve({ id: testCaseId }) });
      const data = await res.json();

      const triggers = data.case.triggers;
      const criticalCount = triggers.filter((t: any) => t.severity === 'critical').length;
      const highCount = triggers.filter((t: any) => t.severity === 'high').length;

      // Urgency formula: Math.min(100, 45 + criticalCount * 25 + highCount * 15)
      const expectedUrgency = Math.min(100, 45 + criticalCount * 25 + highCount * 15);
      expect(data.case.urgencyScore).toBe(expectedUrgency);
    });
  });
});
