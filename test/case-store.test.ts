import { describe, it, expect } from 'vitest';
import { store } from '../src/lib/data/store';

describe('Local Enclave Case Store & Audit Trail (PRD-FR-023, PRD-FR-024, PRD-FR-017, PRD-FR-028)', () => {
  it('initializes with seed cases and provides stats', () => {
    const { cases, total } = store.getAllCases();
    expect(total).toBeGreaterThanOrEqual(4);
    expect(cases.length).toBeGreaterThanOrEqual(4);

    const stats = store.getDashboardStats();
    expect(stats.totalCasesAnalyzed).toBeGreaterThanOrEqual(4);
    expect(stats.flaggedTriggers).toBeGreaterThanOrEqual(0);
  });

  it('creates new cybercrime case with unique docket number', () => {
    const newCase = store.createCase({
      title: 'Extortion Call Investigation',
      operationName: 'Operation BlackHat',
      description: 'Intercepted VoIP extortion demand',
      priority: 'high',
    });

    expect(newCase.id).toMatch(/^(CALL-2026|CY-2025)-\d+/);
    expect(newCase.docketNumber).toBe(`#${newCase.id}`);
    expect(newCase.status).toBe('triage');

    const fetched = store.getCaseById(newCase.id);
    expect(fetched?.title).toBe('Extortion Call Investigation');
  });

  it('records officer review and preserves original transcript on edit', () => {
    const { cases } = store.getAllCases();
    const testCase = cases.find((c) => c.segments && c.segments.length > 0);
    expect(testCase).toBeDefined();

    if (!testCase) return;
    const segment = testCase.segments[0];

    const originalText = segment.text;
    const editedText = 'Officer corrected text: Transfer 50 BTC immediately';

    store.recordReview(testCase.id, {
      caseId: testCase.id,
      targetType: 'transcript',
      targetId: segment.id,
      action: 'correct',
      newValue: editedText,
      officerId: 'JENKINS-4829',
      officerName: 'Det. S. Jenkins #4829',
    });

    const updatedCase = store.getCaseById(testCase.id);
    const updatedSeg = updatedCase?.segments.find((s) => s.id === segment.id);

    expect(updatedSeg?.text).toBe(originalText); // Original preserved!
    expect(updatedSeg?.editedText).toBe(editedText);
    expect(updatedSeg?.editedBy).toBe('Det. S. Jenkins #4829');
  });

  it('purges audio recording non-destructively and logs audit trail', () => {
    const newCase = store.createCase({
      title: 'Audio Retention Lifecycle Test',
    });

    store.attachAudio(newCase.id, {
      filename: 'test_call.wav',
      sizeBytes: 1048576,
      durationSeconds: 45,
      mimeType: 'audio/wav',
      format: 'PCM 16-bit / 44.1 kHz',
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      uploadedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      retentionHours: 24,
      storagePath: 'uploads/test_call.wav',
      purged: false,
    });

    const purgeSuccess = store.purgeAudio(newCase.id);
    expect(purgeSuccess).toBe(true);

    const purgedCase = store.getCaseById(newCase.id);
    expect(purgedCase?.audioMetadata?.purged).toBe(true);
    expect(purgedCase?.audioMetadata?.storagePath).toBe('');

    const auditLogs = store.getAuditLogs();
    const purgeLog = auditLogs.find((l) => l.action === 'AUDIO_PURGED' && l.resourceId === newCase.id);
    expect(purgeLog).toBeDefined();
    expect(purgeLog?.actorId).toBe('JENKINS-4829');
  });
});
