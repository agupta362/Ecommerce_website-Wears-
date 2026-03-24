import { supabase } from '@/integrations/supabase/client';

export type RateLimitAction = 'login' | 'signup' | 'order' | 'review' | 'contact' | 'newsletter';

interface RateLimitResponse {
  allowed: boolean;
  remaining?: number;
  retryAfter?: number;
  message?: string;
  reason?: 'blocked' | 'rate_limited';
}

// Cache configuration
const CACHE_TTL_MS = 30000; // 30 second cache

interface CachedResult {
  result: RateLimitResponse;
  timestamp: number;
}

// All actions now fail open on error to prevent blocking legitimate users

// Check cache first
function getCachedResult(key: string): RateLimitResponse | null {
  try {
    const cached = sessionStorage.getItem(`rate_limit_${key}`);
    if (cached) {
      const parsed: CachedResult = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_TTL_MS) {
        return parsed.result;
      }
      sessionStorage.removeItem(`rate_limit_${key}`);
    }
  } catch {
    // Ignore sessionStorage errors
  }
  return null;
}

// Cache a result
function setCachedResult(key: string, result: RateLimitResponse): void {
  try {
    sessionStorage.setItem(`rate_limit_${key}`, JSON.stringify({
      result,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore sessionStorage errors (quota exceeded, etc.)
  }
}

// Single attempt, no client-side retries (server handles retries)
export async function checkRateLimit(
  action: RateLimitAction,
  identifier: string
): Promise<RateLimitResponse> {
  const cacheKey = `${action}_${identifier}`;
  
  // Check cache first - return cached "allowed" results
  const cached = getCachedResult(cacheKey);
  if (cached && cached.allowed) {
    return cached;
  }

  try {
    const { data, error } = await supabase.functions.invoke('rate-limiter', {
      body: { action, identifier },
    });

    if (error) {
      throw error;
    }

    const response = data as RateLimitResponse;
    
    // Cache successful "allowed" results to reduce future calls
    if (response.allowed) {
      setCachedResult(cacheKey, response);
    }

    return response;
  } catch (error) {
    console.error('Rate limit check error:', error instanceof Error ? error.message : error);
    // Fail open for all actions - don't block legitimate users when service is unavailable
    return { allowed: true };
  }
}

// Helper to generate a simple fingerprint for anonymous users
// Security: Uses deterministic hashing of browser characteristics
export function getAnonymousIdentifier(): string {
  // Use a combination of factors to create a semi-unique identifier
  const nav = window.navigator;
  const screen = window.screen;
  
  const fingerprint = [
    nav.userAgent,
    nav.language,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
  ].join('|');
  
  // Simple deterministic hash function (not for crypto, just for identification)
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  return `anon_${Math.abs(hash).toString(36)}`;
}
