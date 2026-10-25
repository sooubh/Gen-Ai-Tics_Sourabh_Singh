/**
 * VECNAVERSE: Voice-to-Investigation Cybercrime Audio Intelligence
 * Sliding-Window In-Memory Rate Limiter
 *
 * Implements granular rate limiting per IP or Officer ID to safeguard
 * Gemini LLM/SER quotas, avoid denial-of-service, and enforce forensic accountability.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
}

export interface RateLimiterOptions {
  defaultLimit?: number; // Default requests per window (default: 30)
  defaultWindowMs?: number; // Default window in milliseconds (default: 60,000 = 1 minute)
}

export class SlidingWindowRateLimiter {
  private windows: Map<string, number[]> = new Map();
  private defaultLimit: number;
  private defaultWindowMs: number;

  constructor(options?: RateLimiterOptions) {
    this.defaultLimit = options?.defaultLimit ?? 30;
    this.defaultWindowMs = options?.defaultWindowMs ?? 60_000;
  }

  /**
   * Checks whether a request from the given identifier is allowed under the sliding window.
   * If allowed, records the request timestamp.
   *
   * @param identifier IP address, Officer Badge ID, or session token
   * @param limit Maximum allowed requests in the window (defaults to 30)
   * @param windowMs Duration of the sliding window in ms (defaults to 60,000)
   */
  checkLimit(
    identifier: string,
    limit?: number,
    windowMs?: number
  ): RateLimitResult {
    const key = identifier?.trim() || 'anonymous';
    const maxRequests = limit ?? this.defaultLimit;
    const windowDuration = windowMs ?? this.defaultWindowMs;

    const now = Date.now();
    const windowStart = now - windowDuration;

    // Prune entries outside the sliding window
    let timestamps = this.windows.get(key) || [];
    timestamps = timestamps.filter((ts) => ts > windowStart);

    if (timestamps.length >= maxRequests) {
      const oldest = timestamps[0];
      const resetMs = oldest ? Math.max(0, oldest + windowDuration - now) : windowDuration;
      this.windows.set(key, timestamps);

      return {
        allowed: false,
        remaining: 0,
        resetMs,
      };
    }

    // Record request timestamp
    timestamps.push(now);
    this.windows.set(key, timestamps);

    const oldest = timestamps[0];
    const resetMs = oldest ? Math.max(0, oldest + windowDuration - now) : windowDuration;
    const remaining = Math.max(0, maxRequests - timestamps.length);

    return {
      allowed: true,
      remaining,
      resetMs,
    };
  }

  /**
   * Resets rate limit counters.
   * If identifier is specified, resets only that key.
   * If omitted, clears all active sliding windows.
   */
  reset(identifier?: string): void {
    if (identifier) {
      this.windows.delete(identifier.trim());
    } else {
      this.windows.clear();
    }
  }

  /**
   * Inspects current usage without recording a new request.
   */
  peek(
    identifier: string,
    limit?: number,
    windowMs?: number
  ): RateLimitResult {
    const key = identifier?.trim() || 'anonymous';
    const maxRequests = limit ?? this.defaultLimit;
    const windowDuration = windowMs ?? this.defaultWindowMs;

    const now = Date.now();
    const windowStart = now - windowDuration;

    const timestamps = (this.windows.get(key) || []).filter((ts) => ts > windowStart);
    const oldest = timestamps[0];
    const resetMs = oldest ? Math.max(0, oldest + windowDuration - now) : 0;
    const remaining = Math.max(0, maxRequests - timestamps.length);

    return {
      allowed: timestamps.length < maxRequests,
      remaining,
      resetMs,
    };
  }
}

// Singleton instance for application-wide rate limiting
export const rateLimiter = new SlidingWindowRateLimiter({
  defaultLimit: 30,
  defaultWindowMs: 60_000,
});

/**
 * Convenience function delegating to the singleton rate limiter instance.
 */
export function checkLimit(
  identifier: string,
  limit?: number,
  windowMs?: number
): RateLimitResult {
  return rateLimiter.checkLimit(identifier, limit, windowMs);
}

/**
 * Convenience function resetting the singleton rate limiter instance.
 */
export function reset(identifier?: string): void {
  rateLimiter.reset(identifier);
}

// Backward and test aliases
export const RateLimiter = SlidingWindowRateLimiter;
