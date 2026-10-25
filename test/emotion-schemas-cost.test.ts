/**
 * VECNAVERSE: Voice-to-Investigation Cybercrime Audio Intelligence
 * Unit & Integration Test Suite: Emotion Schemas, Rate Limiter & Cost Controller
 *
 * Verifies:
 * 1. Strict Target Emotion Schemas (6 emotions, negative/overflow score rejection, cues, uncertainty)
 * 2. Urgency Scoring & Mock/Fallback Generation
 * 3. Sliding-Window In-Memory Rate Limiting & Per-Identifier Resets
 * 4. Gemini Cost Controller (Flash $0.002/min, Live $0.004/min, >900s & >600s guardrails, budget caps)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  TARGET_EMOTIONS,
  TargetEmotionSchema,
  EmotionScoresSchema,
  VocalCueSchema,
  UncertaintyIndicatorSchema,
  SegmentEmotionResultSchema,
  FullVoiceEmotionAnalysisSchema,
  validateTargetEmotion,
  validateEmotionScores,
  validateFullVoiceEmotionAnalysis,
  isTargetEmotion,
  calculateUrgency,
  generateMockEmotionAnalysis,
  generateFallbackEmotionAnalysis,
} from '@/lib/ai/emotion-schemas';

import {
  SlidingWindowRateLimiter,
  checkLimit,
  reset,
} from '@/lib/ai/rate-limiter';

import {
  MAX_AUDIO_DURATION_SECONDS,
  MAX_LIVE_SESSION_DURATION_SECONDS,
  DEFAULT_SESSION_BUDGET_USD,
  FLASH_AUDIO_COST_PER_MINUTE,
  LIVE_AUDIO_COST_PER_MINUTE,
  AudioDurationExceededError,
  calculateAudioCost,
  calculateTokenCost,
  enforceCostAndDurationGuardrails,
} from '@/lib/ai/cost-controller';

// ==============================================================================
// 1. Emotion Schemas & Zod Boundary Tests
// ==============================================================================

describe('Emotion Schemas & Zod Boundary Enforcement', () => {
  describe('TargetEmotionSchema (6 Target Emotions)', () => {
    it('strictly accepts each of the 6 target emotions', () => {
      const expectedEmotions = ['anger', 'sadness', 'fear', 'happiness', 'stress', 'neutral'] as const;

      expect(TARGET_EMOTIONS).toEqual(expectedEmotions);

      expectedEmotions.forEach((emotion) => {
        expect(TargetEmotionSchema.parse(emotion)).toBe(emotion);
        expect(validateTargetEmotion(emotion)).toBe(emotion);
        expect(isTargetEmotion(emotion)).toBe(true);
      });
    });

    it('strictly rejects non-target and invalid emotion strings', () => {
      const invalidEmotions = [
        'joy',
        'surprise',
        'disgust',
        'calm',
        'anxiety',
        'rage',
        'cheerful',
        '',
        'ANGER', // Case-sensitive
        'Stress',
        null,
        undefined,
        123,
      ];

      invalidEmotions.forEach((invalid) => {
        expect(() => TargetEmotionSchema.parse(invalid)).toThrow();
        expect(isTargetEmotion(invalid)).toBe(false);
      });
    });
  });

  describe('EmotionScoresSchema (0.0 to 1.0 Normalized Scores)', () => {
    const validScores = {
      anger: 0.1,
      sadness: 0.2,
      fear: 0.85,
      happiness: 0.0,
      stress: 0.9,
      neutral: 0.05,
    };

    it('accepts valid normalized scores between 0.0 and 1.0 for all 6 emotions', () => {
      const parsed = EmotionScoresSchema.parse(validScores);
      expect(parsed).toEqual(validScores);
      expect(validateEmotionScores(validScores)).toEqual(validScores);
    });

    it('accepts boundary scores 0.0 and 1.0 exactly', () => {
      const allZeros = { anger: 0, sadness: 0, fear: 0, happiness: 0, stress: 0, neutral: 0 };
      const allOnes = { anger: 1, sadness: 1, fear: 1, happiness: 1, stress: 1, neutral: 1 };

      expect(EmotionScoresSchema.parse(allZeros)).toEqual(allZeros);
      expect(EmotionScoresSchema.parse(allOnes)).toEqual(allOnes);
    });

    it('rejects negative emotion scores', () => {
      expect(() =>
        EmotionScoresSchema.parse({ ...validScores, anger: -0.01 })
      ).toThrow(/anger score must be >= 0/i);

      expect(() =>
        EmotionScoresSchema.parse({ ...validScores, stress: -1.0 })
      ).toThrow(/stress score must be >= 0/i);
    });

    it('rejects scores exceeding 1.0', () => {
      expect(() =>
        EmotionScoresSchema.parse({ ...validScores, fear: 1.01 })
      ).toThrow(/fear score must be <= 1/i);

      expect(() =>
        EmotionScoresSchema.parse({ ...validScores, happiness: 2.0 })
      ).toThrow(/happiness score must be <= 1/i);
    });

    it('rejects non-numeric values and missing emotions', () => {
      expect(() =>
        EmotionScoresSchema.parse({ ...validScores, fear: '0.85' })
      ).toThrow();

      const missingNeutral = { ...validScores };
      delete (missingNeutral as Record<string, unknown>).neutral;
      expect(() => EmotionScoresSchema.parse(missingNeutral)).toThrow();
    });
  });

  describe('VocalCueSchema & UncertaintyIndicatorSchema', () => {
    it('validates vocal cues across all valid severities', () => {
      const severities = ['low', 'medium', 'high', 'critical'] as const;

      severities.forEach((severity, idx) => {
        const cue = {
          cue_type: 'pitch_strain',
          description: `Acoustic strain detected with ${severity} severity`,
          severity,
          timestamp_ms: idx * 1000,
        };
        const parsed = VocalCueSchema.parse(cue);
        expect(parsed.severity).toBe(severity);
        expect(parsed.timestamp_ms).toBe(idx * 1000);
      });
    });

    it('rejects invalid vocal cues (negative timestamp or invalid severity)', () => {
      expect(() =>
        VocalCueSchema.parse({
          cue_type: 'tremor',
          description: 'tremor',
          severity: 'extreme', // Invalid
          timestamp_ms: 100,
        })
      ).toThrow();

      expect(() =>
        VocalCueSchema.parse({
          cue_type: 'tremor',
          description: 'tremor',
          severity: 'high',
          timestamp_ms: -500, // Invalid
        })
      ).toThrow(/timestamp_ms must be non-negative/i);

      expect(() =>
        VocalCueSchema.parse({
          cue_type: '', // Empty cue_type
          description: 'desc',
          severity: 'low',
          timestamp_ms: 100,
        })
      ).toThrow();
    });

    it('validates uncertainty indicators across all 4 audio qualities', () => {
      const qualities = ['clear', 'noisy', 'distorted', 'low_volume'] as const;

      qualities.forEach((quality) => {
        const uncertainty = {
          confidence_score: 0.85,
          audio_quality: quality,
          ambiguity_detected: false,
          caveats: ['Requires human verification'],
        };
        const parsed = UncertaintyIndicatorSchema.parse(uncertainty);
        expect(parsed.audio_quality).toBe(quality);
      });
    });

    it('rejects uncertainty indicators with invalid confidence score or audio quality', () => {
      expect(() =>
        UncertaintyIndicatorSchema.parse({
          confidence_score: 1.2, // > 1.0
          audio_quality: 'clear',
          ambiguity_detected: false,
          caveats: [],
        })
      ).toThrow(/confidence_score must be <= 1/i);

      expect(() =>
        UncertaintyIndicatorSchema.parse({
          confidence_score: -0.1, // < 0
          audio_quality: 'clear',
          ambiguity_detected: false,
          caveats: [],
        })
      ).toThrow(/confidence_score must be >= 0/i);

      expect(() =>
        UncertaintyIndicatorSchema.parse({
          confidence_score: 0.9,
          audio_quality: 'studio_pristine', // Invalid
          ambiguity_detected: false,
          caveats: [],
        })
      ).toThrow();
    });
  });

  describe('SegmentEmotionResultSchema & FullVoiceEmotionAnalysisSchema', () => {
    const validSegment = {
      segment_id: 'seg-101',
      start_ms: 1000,
      end_ms: 4500,
      start_time_seconds: 1.0,
      end_time_seconds: 4.5,
      transcript: 'Where is the authorization code?',
      speaker_label: 'SPEAKER_01',
      primary_emotion: 'stress' as const,
      secondary_emotion: 'anger' as const,
      emotion_scores: {
        anger: 0.65,
        sadness: 0.1,
        fear: 0.2,
        happiness: 0.0,
        stress: 0.85,
        neutral: 0.1,
      },
      vocal_cues: [
        {
          cue_type: 'elevated_cadence',
          description: 'Spike in speech cadence',
          severity: 'medium' as const,
          timestamp_ms: 1200,
        },
      ],
      uncertainty: {
        confidence_score: 0.9,
        audio_quality: 'clear' as const,
        ambiguity_detected: false,
        caveats: [],
      },
    };

    it('validates a complete segment emotion result', () => {
      const parsed = SegmentEmotionResultSchema.parse(validSegment);
      expect(parsed.primary_emotion).toBe('stress');
      expect(parsed.secondary_emotion).toBe('anger');
      expect(parsed.transcript).toBe('Where is the authorization code?');
    });

    it('accepts null or omitted secondary_emotion in segment result', () => {
      const withNullSecondary = { ...validSegment, secondary_emotion: null };
      expect(SegmentEmotionResultSchema.parse(withNullSecondary).secondary_emotion).toBeNull();

      const withoutSecondary = { ...validSegment };
      delete (withoutSecondary as Record<string, unknown>).secondary_emotion;
      expect(SegmentEmotionResultSchema.parse(withoutSecondary).secondary_emotion).toBeUndefined();
    });

    it('validates a complete FullVoiceEmotionAnalysis structure', () => {
      const fullAnalysis = {
        session_id: 'session-case-8812',
        overall: {
          primary_emotion: 'fear' as const,
          secondary_emotion: 'stress' as const,
          urgency_score: 85,
          urgency_level: 'critical' as const,
          emotion_scores: {
            anger: 0.1,
            sadness: 0.2,
            fear: 0.9,
            happiness: 0.0,
            stress: 0.85,
            neutral: 0.05,
          },
          dominant_cues: [
            {
              cue_type: 'tremor',
              description: 'Vocal tract tremor',
              severity: 'critical' as const,
              timestamp_ms: 2200,
            },
          ],
          uncertainty: {
            confidence_score: 0.94,
            audio_quality: 'clear' as const,
            ambiguity_detected: false,
            caveats: ['Officer verification required'],
          },
        },
        segments: [validSegment],
        metadata: {
          model_id: 'gemini-3.8-flash',
          duration_seconds: 15.4,
          processed_at: new Date().toISOString(),
          cost_estimate_usd: 0.000513,
          audio_format: 'audio/wav',
          is_live_stream: false,
        },
      };

      const parsed = FullVoiceEmotionAnalysisSchema.parse(fullAnalysis);
      expect(parsed.session_id).toBe('session-case-8812');
      expect(parsed.overall.urgency_score).toBe(85);
      expect(parsed.overall.urgency_level).toBe('critical');
      expect(parsed.segments).toHaveLength(1);
      expect(validateFullVoiceEmotionAnalysis(fullAnalysis)).toBeDefined();
    });

    it('rejects FullVoiceEmotionAnalysis when urgency_score exceeds 100 or is negative', () => {
      const invalidUrgency = {
        session_id: 'sess-1',
        overall: {
          primary_emotion: 'neutral' as const,
          urgency_score: 105, // > 100
          urgency_level: 'low' as const,
          emotion_scores: { anger: 0, sadness: 0, fear: 0, happiness: 0, stress: 0, neutral: 1 },
          dominant_cues: [],
          uncertainty: {
            confidence_score: 0.8,
            audio_quality: 'clear' as const,
            ambiguity_detected: false,
            caveats: [],
          },
        },
        segments: [],
        metadata: {
          model_id: 'gemini-3.8-flash',
          duration_seconds: 10,
          processed_at: new Date().toISOString(),
          cost_estimate_usd: 0.001,
          audio_format: 'audio/wav',
          is_live_stream: false,
        },
      };

      expect(() => FullVoiceEmotionAnalysisSchema.parse(invalidUrgency)).toThrow(
        /urgency_score must be <= 100/i
      );
    });
  });

  describe('Urgency Calculation & Mock/Fallback Generators', () => {
    it('calculates urgency accurately based on distress emotions and vocal cues', () => {
      // Acute distress: high fear + high stress
      const highDistress = calculateUrgency(
        { fear: 0.9, stress: 0.85, anger: 0.4, neutral: 0.0, happiness: 0.0 },
        [
          {
            cue_type: 'tremor',
            description: 'Vocal tremor',
            severity: 'critical',
            timestamp_ms: 1000,
          },
        ]
      );
      expect(highDistress.urgencyScore).toBeGreaterThanOrEqual(80);
      expect(highDistress.urgencyLevel).toBe('critical');

      // Calming / neutral: low urgency
      const neutralAudio = calculateUrgency({
        neutral: 0.95,
        happiness: 0.2,
        fear: 0.0,
        stress: 0.05,
      });
      expect(neutralAudio.urgencyScore).toBeLessThan(35);
      expect(neutralAudio.urgencyLevel).toBe('low');

      // Moderate stress
      const moderateAudio = calculateUrgency({
        stress: 0.7,
        sadness: 0.3,
        fear: 0.3,
      });
      expect(moderateAudio.urgencyScore).toBeGreaterThanOrEqual(35);
      expect(moderateAudio.urgencyScore).toBeLessThan(80);
      expect(['medium', 'high']).toContain(moderateAudio.urgencyLevel);
    });

    it('clamps urgency score strictly within 0 and 100', () => {
      // Massive positive weights
      const maxed = calculateUrgency(
        { fear: 1.0, stress: 1.0, anger: 1.0, sadness: 1.0 },
        [
          { cue_type: 'c1', description: 'c1', severity: 'critical', timestamp_ms: 1 },
          { cue_type: 'c2', description: 'c2', severity: 'critical', timestamp_ms: 2 },
          { cue_type: 'c3', description: 'c3', severity: 'critical', timestamp_ms: 3 },
        ]
      );
      expect(maxed.urgencyScore).toBe(100);

      // Strong negative weights
      const minimized = calculateUrgency({ neutral: 1.0, happiness: 1.0 });
      expect(minimized.urgencyScore).toBe(0);
      expect(minimized.urgencyLevel).toBe('low');
    });

    it('generateMockEmotionAnalysis produces a schema-valid FullVoiceEmotionAnalysis object', () => {
      const mock = generateMockEmotionAnalysis();
      const validated = FullVoiceEmotionAnalysisSchema.parse(mock);
      expect(validated.overall.primary_emotion).toBeDefined();
      expect(validated.segments.length).toBeGreaterThan(0);
      expect(validated.metadata.cost_estimate_usd).toBeGreaterThan(0);
    });

    it('generateFallbackEmotionAnalysis produces a schema-valid fallback analysis with low confidence', () => {
      const fallback = generateFallbackEmotionAnalysis('Severe line static detected', 12.5);
      const validated = FullVoiceEmotionAnalysisSchema.parse(fallback);

      expect(validated.overall.primary_emotion).toBe('neutral');
      expect(validated.overall.uncertainty.ambiguity_detected).toBe(true);
      expect(validated.overall.uncertainty.confidence_score).toBeLessThanOrEqual(0.3);
      expect(validated.overall.uncertainty.caveats).toContain('Severe line static detected');
      expect(validated.metadata.duration_seconds).toBe(12.5);
    });
  });
});

// ==============================================================================
// 2. Rate Limiter Tests (Sliding Window & Resets)
// ==============================================================================

describe('Sliding-Window In-Memory Rate Limiter', () => {
  let customLimiter: SlidingWindowRateLimiter;

  beforeEach(() => {
    reset(); // Reset global singleton
    customLimiter = new SlidingWindowRateLimiter({ defaultLimit: 5, defaultWindowMs: 1000 });
  });

  it('allows requests up to the configured limit and decrements remaining', () => {
    const id = 'officer-test-4829';

    for (let i = 1; i <= 5; i++) {
      const res = customLimiter.checkLimit(id);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(5 - i);
    }

    // 6th request exceeds limit of 5
    const rejected = customLimiter.checkLimit(id);
    expect(rejected.allowed).toBe(false);
    expect(rejected.remaining).toBe(0);
    expect(rejected.resetMs).toBeGreaterThan(0);
  });

  it('resets a specific identifier with reset(identifier)', () => {
    const officerA = 'officer-alpha';
    const officerB = 'officer-beta';

    // Exhaust limits for both
    for (let i = 0; i < 5; i++) {
      customLimiter.checkLimit(officerA);
      customLimiter.checkLimit(officerB);
    }

    expect(customLimiter.checkLimit(officerA).allowed).toBe(false);
    expect(customLimiter.checkLimit(officerB).allowed).toBe(false);

    // Reset only officerA
    customLimiter.reset(officerA);

    // officerA is immediately allowed again
    const resA = customLimiter.checkLimit(officerA);
    expect(resA.allowed).toBe(true);
    expect(resA.remaining).toBe(4);

    // officerB remains blocked
    const resB = customLimiter.checkLimit(officerB);
    expect(resB.allowed).toBe(false);
  });

  it('resets all identifiers with reset() without arguments', () => {
    const id1 = 'id-1';
    const id2 = 'id-2';

    for (let i = 0; i < 5; i++) {
      customLimiter.checkLimit(id1);
      customLimiter.checkLimit(id2);
    }

    expect(customLimiter.checkLimit(id1).allowed).toBe(false);
    expect(customLimiter.checkLimit(id2).allowed).toBe(false);

    // Global reset
    customLimiter.reset();

    expect(customLimiter.checkLimit(id1).allowed).toBe(true);
    expect(customLimiter.checkLimit(id2).allowed).toBe(true);
  });

  it('operates with default limit of 30 requests/minute on singleton', () => {
    const id = 'officer-global-30';
    reset(id);

    // First request
    const first = checkLimit(id);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(29);

    // Fire 29 more requests
    for (let i = 0; i < 29; i++) {
      checkLimit(id);
    }

    // 31st request is rejected
    const blocked = checkLimit(id);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);

    reset(id);
    expect(checkLimit(id).allowed).toBe(true);
  });

  it('restores request capacity after sliding window expires', () => {
    const now = 1_000_000;
    const dateSpy = vi.spyOn(Date, 'now').mockReturnValue(now);

    const testLimiter = new SlidingWindowRateLimiter({ defaultLimit: 2, defaultWindowMs: 10_000 });
    const id = 'sliding-test';

    // Make 2 requests at t = now
    expect(testLimiter.checkLimit(id).allowed).toBe(true);
    expect(testLimiter.checkLimit(id).allowed).toBe(true);

    // 3rd at t = now is blocked
    expect(testLimiter.checkLimit(id).allowed).toBe(false);

    // Advance time by 10,001 ms (outside sliding window)
    dateSpy.mockReturnValue(now + 10_001);

    // Requests are allowed again
    const postWindow = testLimiter.checkLimit(id);
    expect(postWindow.allowed).toBe(true);
    expect(postWindow.remaining).toBe(1);

    dateSpy.mockRestore();
  });
});

// ==============================================================================
// 3. Gemini Cost Controller & Duration Guardrails Tests
// ==============================================================================

describe('Gemini Cost Controller & Duration Guardrails', () => {
  describe('Accurate Pricing Estimation', () => {
    it('accurately calculates audio processing cost for gemini-3.8-flash ($0.002/min)', () => {
      // 0 seconds -> $0
      expect(calculateAudioCost(0, 'gemini-3.8-flash')).toBe(0);

      // 30 seconds -> $0.001
      expect(calculateAudioCost(30, 'gemini-3.8-flash')).toBe(0.001);

      // 60 seconds (1 minute) -> $0.002
      expect(calculateAudioCost(60, 'gemini-3.8-flash')).toBe(0.002);

      // 300 seconds (5 minutes) -> $0.010
      expect(calculateAudioCost(300, 'gemini-3.8-flash')).toBe(0.01);

      // 900 seconds (15 minutes maximum) -> $0.030
      expect(calculateAudioCost(900, 'gemini-3.8-flash')).toBe(0.03);

      expect(FLASH_AUDIO_COST_PER_MINUTE).toBe(0.002);
    });

    it('accurately calculates live audio streaming cost for gemini-3.8-live ($0.004/min)', () => {
      // 60 seconds (1 minute) -> $0.004
      expect(calculateAudioCost(60, 'gemini-3.8-live')).toBe(0.004);

      // 300 seconds (5 minutes) -> $0.020
      expect(calculateAudioCost(300, 'gemini-3.8-live')).toBe(0.02);

      // 600 seconds (10 minutes live maximum) -> $0.040
      expect(calculateAudioCost(600, 'gemini-3.8-live')).toBe(0.04);

      expect(LIVE_AUDIO_COST_PER_MINUTE).toBe(0.004);
    });

    it('accurately computes token-based costs ($0.75/1M input, $3.75/1M output for Flash)', () => {
      // 1,000,000 input tokens -> $0.75
      expect(calculateTokenCost(1_000_000, 0, 'gemini-3.8-flash')).toBe(0.75);

      // 1,000,000 output tokens -> $3.75
      expect(calculateTokenCost(0, 1_000_000, 'gemini-3.8-flash')).toBe(3.75);

      // Combined 1M input + 100k output -> $0.75 + $0.375 = $1.125
      expect(calculateTokenCost(1_000_000, 100_000, 'gemini-3.8-flash')).toBe(1.125);
    });
  });

  describe('Duration Guardrails (>900s Single Audio & >600s Live)', () => {
    it('strictly throws AudioDurationExceededError when single audio exceeds 900 seconds (15 minutes)', () => {
      expect(MAX_AUDIO_DURATION_SECONDS).toBe(900);

      // 900 seconds exactly is allowed
      expect(() =>
        enforceCostAndDurationGuardrails(900, 'gemini-3.8-flash')
      ).not.toThrow();

      // 901 seconds throws
      expect(() =>
        enforceCostAndDurationGuardrails(901, 'gemini-3.8-flash')
      ).toThrow(AudioDurationExceededError);

      expect(() =>
        enforceCostAndDurationGuardrails(901, 'gemini-3.8-flash')
      ).toThrow(/exceeds maximum allowed limit of 900s/i);

      // 1800 seconds (30 mins) throws
      expect(() =>
        enforceCostAndDurationGuardrails(1800, 'gemini-3.8-flash')
      ).toThrow(AudioDurationExceededError);
    });

    it('strictly throws AudioDurationExceededError when live streaming exceeds 600 seconds (10 minutes)', () => {
      expect(MAX_LIVE_SESSION_DURATION_SECONDS).toBe(600);

      // 600 seconds exactly is allowed for live
      expect(() =>
        enforceCostAndDurationGuardrails(600, 'gemini-3.8-live')
      ).not.toThrow();

      // 601 seconds throws for live
      expect(() =>
        enforceCostAndDurationGuardrails(601, 'gemini-3.8-live')
      ).toThrow(AudioDurationExceededError);

      expect(() =>
        enforceCostAndDurationGuardrails(601, 'gemini-3.8-live')
      ).toThrow(/exceeds maximum continuous limit of 600s/i);
    });

    it('supports non-throwing validation via throwOnError: false option', () => {
      const batchResult = enforceCostAndDurationGuardrails(950, 'gemini-3.8-flash', 0, {
        throwOnError: false,
      });

      expect(batchResult.allowed).toBe(false);
      expect(batchResult.reason).toMatch(/exceeds maximum allowed limit of 900s/i);
      expect(batchResult.estimatedCost).toBeGreaterThan(0);

      const liveResult = enforceCostAndDurationGuardrails(650, 'gemini-3.8-live', 0, {
        throwOnError: false,
      });

      expect(liveResult.allowed).toBe(false);
      expect(liveResult.reason).toMatch(/exceeds maximum continuous limit of 600s/i);
    });
  });

  describe('Budget Cap Guardrail ($5.00 Default)', () => {
    it('allows calls within the default $5.00 session budget', () => {
      expect(DEFAULT_SESSION_BUDGET_USD).toBe(5.0);

      // 5 minutes of flash audio = $0.01. Current session cost $0.50 -> $0.51 <= $5.00
      const res = enforceCostAndDurationGuardrails(300, 'gemini-3.8-flash', 0.5);
      expect(res.allowed).toBe(true);
      expect(res.estimatedCost).toBe(0.01);
      expect(res.reason).toBeUndefined();
    });

    it('rejects processing when cumulative cost exceeds $5.00 session budget', () => {
      // Current session spent $4.995. Audio cost = 300s flash ($0.010). Total = $5.005 > $5.00
      const res = enforceCostAndDurationGuardrails(300, 'gemini-3.8-flash', 4.995);
      expect(res.allowed).toBe(false);
      expect(res.reason).toMatch(/exceeds budget cap of \$5.00/i);
    });

    it('supports custom budget caps passed in options', () => {
      // Custom budget cap of $0.005. 300s flash costs $0.010 -> rejected
      const res = enforceCostAndDurationGuardrails(300, 'gemini-3.8-flash', 0.0, {
        budgetCap: 0.005,
      });
      expect(res.allowed).toBe(false);
      expect(res.reason).toMatch(/exceeds budget cap of \$0.01/i);
    });
  });
});
