import { describe, it, expect } from 'vitest';
import * as path from 'path';
import * as fs from 'fs';
import { executeSyntheticRun, listSyntheticFixtures } from '../src/lib/ai/synthetic-fixtures';
import {
  PROHIBITED_INFERENCE_TERMS,
  AudioAnalysisResultSchema,
  AnalysisRunSchema,
  STANDARD_FORENSIC_DSP_DISCLAIMER,
} from '../src/lib/ai/types';
import {
  GeminiAudioAdapter,
  normalizeGeminiModel,
  resolveAudioFilePath,
  GeminiMediaError,
  VERIFIED_GEMINI_MODELS,
} from '../src/lib/ai/gemini-adapter';

describe('AI Pipeline & Synthetic Fixture Engine (PRD-FR-003, PRD-FR-009, PRD-FR-011)', () => {
  it('lists available deterministic fixtures for offline evaluation', () => {
    const fixtures = listSyntheticFixtures();
    expect(fixtures.length).toBeGreaterThan(0);
    expect(fixtures.some((f) => f.id === 'extortion-demand')).toBe(true);
  });

  it('executes synthetic analysis run producing structured evidentiary output', async () => {
    const result = await executeSyntheticRun('extortion-demand');

    expect(result.segments.length).toBeGreaterThan(0);
    expect(result.named_entities.length).toBeGreaterThan(0);
    expect(result.emergency_triggers.length).toBeGreaterThan(0);
    expect(result.acoustic_cues.length).toBeGreaterThan(0);
    expect(result.metadata.is_synthetic_fixture).toBe(true);
    expect(result.isSyntheticDemo).toBe(true);
    expect(result.analysisProvider).toBe('synthetic-fixture');
    expect(result.acousticMetricsAvailable).toBe(false);
  });

  it('enforces legal guardrails: zero prohibited deception or guilt inference terms', async () => {
    const result = await executeSyntheticRun('extortion-demand');
    const fullText = JSON.stringify(result).toLowerCase();

    for (const term of PROHIBITED_INFERENCE_TERMS) {
      expect(fullText).not.toContain(`"${term}"`);
    }
  });

  it('classifies contextual trigger types including direct threats and negations', async () => {
    const result = await executeSyntheticRun('extortion-demand');
    const trigger = result.emergency_triggers[0];

    expect(trigger).toBeDefined();
    expect(trigger.verbatim_quote).toBeDefined();
    expect(['DIRECT', 'NEGATED', 'HYPOTHETICAL', 'HISTORICAL', 'QUOTED']).toContain(trigger.context);
  });

  it('enforces mandatory non-evidentiary legal caveat on all acoustic cues', async () => {
    const result = await executeSyntheticRun('extortion-demand');

    for (const cue of result.acoustic_cues) {
      expect(cue.caveat).toContain('does not infer guilt');
    }
  });

  it('validates genuine provenance schemas: AudioAnalysisResultSchema and AnalysisRunSchema', () => {
    const validRun = AnalysisRunSchema.parse({
      id: 'run-test-01',
      caseId: 'CALL-2026-1001',
      status: 'completed',
      modelId: 'gemini-2.5-flash',
      promptVersion: 'v1.0.0-vecnaverse',
      isSyntheticDemo: false,
      analysisProvider: 'gemini',
      acousticMetricsAvailable: false,
    });

    expect(validRun.isSyntheticDemo).toBe(false);
    expect(validRun.analysisProvider).toBe('gemini');
    expect(validRun.acousticMetricsAvailable).toBe(false);

    const failedRun = AnalysisRunSchema.parse({
      id: 'run-test-02',
      caseId: 'CALL-2026-1002',
      status: 'failed',
      modelId: 'gemini-2.5-flash',
      isSyntheticDemo: false,
      analysisProvider: 'gemini',
      acousticMetricsAvailable: false,
      failureReason: 'Audio file not found on disk',
    });

    expect(failedRun.status).toBe('failed');
    expect(failedRun.failureReason).toBe('Audio file not found on disk');
  });

  it('restricts Gemini model selection strictly to verified models (gemini-2.5-flash or gemini-2.0-flash)', () => {
    expect(normalizeGeminiModel('gemini-2.5-flash')).toBe('gemini-2.5-flash');
    expect(normalizeGeminiModel('gemini-2.0-flash')).toBe('gemini-2.0-flash');
    expect(normalizeGeminiModel('gemini-2.0-flash-exp')).toBe('gemini-2.0-flash');
    // Deprecated or arbitrary model names fallback safely to gemini-2.5-flash
    expect(normalizeGeminiModel('gemini-1.5-pro')).toBe('gemini-2.5-flash');
    expect(normalizeGeminiModel('gpt-4')).toBe('gemini-2.5-flash');
    expect(normalizeGeminiModel(undefined)).toBe('gemini-2.5-flash');

    const adapter = new GeminiAudioAdapter({ recordedModel: 'gemini-2.0-flash' as any });
    expect(adapter.getModelId()).toBe('gemini-2.0-flash');
  });

  it('resolves audio paths correctly across filesystem directories', () => {
    // Non-existent path returns null
    expect(resolveAudioFilePath('non_existent_audio_file_12345.wav')).toBeNull();

    // Resolves package.json as an existing file test
    const resolvedPackage = resolveAudioFilePath('package.json');
    expect(resolvedPackage).not.toBeNull();
    expect(fs.existsSync(resolvedPackage!)).toBe(true);
  });

  it('throws GeminiMediaError when analyzing non-existent audio file', async () => {
    const adapter = new GeminiAudioAdapter({ apiKey: 'mock-key' });
    await expect(adapter.analyzeAudioFile('/uploads/audio/MISSING_FILE_9999.wav')).rejects.toThrow(
      GeminiMediaError
    );
  });

  describe('User-Friendly Gemini Missing-Key Messaging', () => {
    it('throws GeminiConfigurationError with actionable guidance when analyzeAudioBuffer is called without an API key', async () => {
      const adapterNoKey = new GeminiAudioAdapter({ apiKey: '' });
      const dummyBuffer = Buffer.from('RIFF....WAVE');

      await expect(adapterNoKey.analyzeAudioBuffer(dummyBuffer)).rejects.toThrowError(
        'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your .env.local file to analyze custom audio files, or use preset demo scenarios offline.'
      );
    });

    it('throws GeminiConfigurationError with actionable guidance when analyzeAudioFile is called without an API key', async () => {
      const adapterNoKey = new GeminiAudioAdapter({ apiKey: '' });

      await expect(adapterNoKey.analyzeAudioFile('package.json')).rejects.toThrowError(
        'Gemini API key is not configured on the server. Please add GEMINI_API_KEY to your .env.local file to analyze custom audio files, or use preset demo scenarios offline.'
      );
    });
  });
});
