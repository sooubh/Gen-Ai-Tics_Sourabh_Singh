import { describe, it, expect } from 'vitest';
import { executeSyntheticRun, listSyntheticFixtures } from '../src/lib/ai/synthetic-fixtures';
import { PROHIBITED_INFERENCE_TERMS } from '../src/lib/ai/types';

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
});
