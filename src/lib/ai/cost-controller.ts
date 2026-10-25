/**
 * VECNAVERSE: Voice-to-Investigation Cybercrime Audio Intelligence
 * Gemini AI Cost Controller & Audio Duration Guardrails
 *
 * Enforces API consumption limits, live streaming timeouts,
 * budget caps, and calculates operational telemetry costs.
 */

// ==============================================================================
// 1. Cost & Duration Limits Constants
// ==============================================================================

export const MAX_AUDIO_DURATION_SECONDS = 900; // 15 minutes max single audio
export const MAX_LIVE_SESSION_DURATION_SECONDS = 600; // 10 minutes max live streaming
export const DEFAULT_SESSION_BUDGET_USD = 5.0; // Default $5.00 session budget

export const FLASH_AUDIO_COST_PER_MINUTE = 0.002; // ~$0.002 / min audio (~25 audio tokens/s @ $0.75/1M)
export const LIVE_AUDIO_COST_PER_MINUTE = 0.004; // $0.004 / min live audio streaming
export const FLASH_INPUT_COST_PER_1M_TOKENS = 0.75; // $0.75 / 1M input tokens
export const FLASH_OUTPUT_COST_PER_1M_TOKENS = 3.75; // $3.75 / 1M output tokens

// ==============================================================================
// 2. Custom Error Classes
// ==============================================================================

export class AudioDurationExceededError extends Error {
  public readonly durationSeconds: number;
  public readonly maxDurationSeconds: number;

  constructor(durationSeconds: number, maxDurationSeconds: number, message?: string) {
    super(
      message ||
        `Audio duration (${durationSeconds}s) exceeds maximum allowed duration limit of ${maxDurationSeconds}s.`
    );
    this.name = 'AudioDurationExceededError';
    this.durationSeconds = durationSeconds;
    this.maxDurationSeconds = maxDurationSeconds;
  }
}

// ==============================================================================
// 3. Audio Cost Calculation
// ==============================================================================

/**
 * Calculates estimated operational cost in USD for processing audio through Gemini models.
 *
 * Pricing rates:
 * - gemini-3.8-flash: ~$0.002 per minute ($0.75 per 1M input tokens + SER output tokens)
 * - gemini-3.8-live: $0.004 per minute of live bidirectional audio streaming
 *
 * @param durationSeconds Duration of audio in seconds
 * @param model Model identifier (e.g. 'gemini-3.8-flash', 'gemini-3.8-live')
 * @returns Cost in USD rounded to 6 decimal places
 */
export function calculateAudioCost(durationSeconds: number, model: string): number {
  if (durationSeconds <= 0) return 0;

  const normalizedModel = (model || '').toLowerCase();
  const isLive = normalizedModel.includes('live');
  const ratePerMinute = isLive ? LIVE_AUDIO_COST_PER_MINUTE : FLASH_AUDIO_COST_PER_MINUTE;

  const minutes = durationSeconds / 60;
  const cost = minutes * ratePerMinute;

  return Number(cost.toFixed(6));
}

/**
 * Calculates token-based API cost for input and output token counts.
 */
export function calculateTokenCost(
  inputTokens: number,
  outputTokens: number,
  model: string = 'gemini-3.8-flash'
): number {
  if (inputTokens <= 0 && outputTokens <= 0) return 0;

  const isFlash = model.toLowerCase().includes('flash');
  const inputRate = isFlash ? FLASH_INPUT_COST_PER_1M_TOKENS : 1.25;
  const outputRate = isFlash ? FLASH_OUTPUT_COST_PER_1M_TOKENS : 5.0;

  const inputCost = (Math.max(0, inputTokens) / 1_000_000) * inputRate;
  const outputCost = (Math.max(0, outputTokens) / 1_000_000) * outputRate;

  return Number((inputCost + outputCost).toFixed(6));
}

// ==============================================================================
// 4. Guardrail Enforcement
// ==============================================================================

export interface GuardrailCheckOptions {
  budgetCap?: number;
  throwOnError?: boolean;
  isLive?: boolean;
}

export interface GuardrailCheckResult {
  allowed: boolean;
  estimatedCost: number;
  reason?: string;
}

/**
 * Enforces duration limits and session budget caps:
 * - Single audio duration cannot exceed 900 seconds (15 minutes). Throws if exceeded.
 * - Live streaming session cannot exceed 600 seconds (10 minutes). Throws if exceeded.
 * - Session budget cap ($5.00 default) cannot be breached.
 *
 * @param durationSeconds Length of the audio in seconds
 * @param model Model identifier
 * @param currentSessionCost Cumulative USD spent in current session (default: 0)
 * @param options Custom budgetCap or throwOnError overrides
 */
export function enforceCostAndDurationGuardrails(
  durationSeconds: number,
  model: string,
  currentSessionCost: number = 0,
  options?: GuardrailCheckOptions
): GuardrailCheckResult {
  const shouldThrow = options?.throwOnError ?? true;
  const budgetCap = options?.budgetCap ?? DEFAULT_SESSION_BUDGET_USD;
  const normalizedModel = (model || '').toLowerCase();
  const isLive = options?.isLive ?? normalizedModel.includes('live');

  // Guardrail 1: Live session continuous streaming maximum (600s)
  if (isLive && durationSeconds > MAX_LIVE_SESSION_DURATION_SECONDS) {
    const errorMsg = `Live streaming duration (${durationSeconds}s) exceeds maximum continuous limit of ${MAX_LIVE_SESSION_DURATION_SECONDS}s (10 minutes).`;
    if (shouldThrow) {
      throw new AudioDurationExceededError(
        durationSeconds,
        MAX_LIVE_SESSION_DURATION_SECONDS,
        errorMsg
      );
    }
    const estimatedCost = calculateAudioCost(durationSeconds, model);
    return {
      allowed: false,
      estimatedCost,
      reason: errorMsg,
    };
  }

  // Guardrail 2: Maximum single audio duration (900s)
  if (durationSeconds > MAX_AUDIO_DURATION_SECONDS) {
    const errorMsg = `Audio duration (${durationSeconds}s) exceeds maximum allowed limit of ${MAX_AUDIO_DURATION_SECONDS}s (15 minutes).`;
    if (shouldThrow) {
      throw new AudioDurationExceededError(
        durationSeconds,
        MAX_AUDIO_DURATION_SECONDS,
        errorMsg
      );
    }
    const estimatedCost = calculateAudioCost(durationSeconds, model);
    return {
      allowed: false,
      estimatedCost,
      reason: errorMsg,
    };
  }

  // Guardrail 3: Budget cap enforcement
  const estimatedCost = calculateAudioCost(durationSeconds, model);
  const projectedTotalCost = currentSessionCost + estimatedCost;

  if (projectedTotalCost > budgetCap) {
    return {
      allowed: false,
      estimatedCost,
      reason: `Projected session cost ($${projectedTotalCost.toFixed(4)}) exceeds budget cap of $${budgetCap.toFixed(2)}.`,
    };
  }

  return {
    allowed: true,
    estimatedCost,
  };
}
