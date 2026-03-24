/**
 * Client-Side Cache Utility
 * Stores data in localStorage to reduce Supabase queries and Edge Function calls.
 * Data is automatically invalidated after TTL expires.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const CACHE_PREFIX = 'app_cache_';

export function getFromCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    
    const entry: CacheEntry<T> = JSON.parse(cached);
    const isExpired = Date.now() - entry.timestamp > entry.ttl;
    
    if (isExpired) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    
    return entry.data;
  } catch {
    return null;
  }
}

export function setInCache<T>(key: string, data: T, ttlMs: number): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Quota exceeded or other error - silently fail
  }
}

export function clearCache(keyPattern?: string): void {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        if (!keyPattern || key.includes(keyPattern)) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch {
    // Silently fail
  }
}

// Clear all expired entries (call on app start)
export function cleanExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        getFromCache(key.replace(CACHE_PREFIX, '')); // Will auto-remove if expired
      }
    }
  } catch {
    // Silently fail
  }
}
