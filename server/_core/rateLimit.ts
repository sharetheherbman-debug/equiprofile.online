/**
 * Rate limiting utilities
 * Simple in-memory rate limiter for API endpoints
 */

import { TRPCError } from "@trpc/server";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store for development
// WARNING: This will not work correctly in multi-instance production environments
// and will lose data on server restarts. For production, implement Redis-backed
// storage using a library like ioredis or connect-redis.
// See: https://github.com/express-rate-limit/rate-limit-redis
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

/**
 * Default rate limit configurations
 */
export const RateLimits = {
  // Public endpoints
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  },

  // Authenticated endpoints
  authenticated: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000,
  },

  // File uploads
  fileUpload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
  },

  // Admin endpoints
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 500,
  },

  // AI/LLM endpoints
  ai: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
  },
};

/**
 * Check rate limit for a user
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig,
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  // No entry or expired window
  if (!entry || now > entry.resetAt) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, newEntry);

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Within window
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(key, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit middleware for tRPC
 */
export function rateLimitMiddleware(
  key: string,
  config: RateLimitConfig = RateLimits.authenticated,
) {
  const result = checkRateLimit(key, config);

  if (!result.allowed) {
    const resetIn = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Rate limit exceeded. Try again in ${resetIn} seconds.`,
    });
  }

  return result;
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);

/**
 * Get rate limit key for user
 */
export function getRateLimitKey(
  userId: number | null,
  endpoint: string,
): string {
  return userId ? `user:${userId}:${endpoint}` : `anon:${endpoint}`;
}

/**
 * Get rate limit headers
 */
export function getRateLimitHeaders(result: {
  remaining: number;
  resetAt: number;
}): Record<string, string> {
  return {
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
  };
}
