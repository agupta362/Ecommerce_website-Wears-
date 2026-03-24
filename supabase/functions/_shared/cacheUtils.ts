/**
 * Edge Function Caching Utilities
 * 
 * IMPORTANT: Edge Functions are stateless - in-memory variables reset on cold starts.
 * For persistent caching, use database-backed storage.
 * 
 * This utility provides patterns for:
 * 1. Database-backed token/settings caching
 * 2. Rate limiting with database state
 * 3. Response caching headers
 */

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Get cached value from database
 */
export async function getCachedValue<T>(
  supabase: SupabaseClient,
  key: string
): Promise<T | null> {
  const { data, error } = await supabase
    .from('edge_cache')
    .select('value, expires_at')
    .eq('key', key)
    .maybeSingle();
  
  if (error || !data) return null;
  
  // Check expiry
  if (new Date(data.expires_at) < new Date()) {
    // Expired - delete and return null
    await supabase.from('edge_cache').delete().eq('key', key);
    return null;
  }
  
  return data.value as T;
}

/**
 * Set cached value in database
 */
export async function setCachedValue<T>(
  supabase: SupabaseClient,
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  
  await supabase.from('edge_cache').upsert({
    key,
    value,
    expires_at: expiresAt.toISOString(),
  }, { onConflict: 'key' });
}

/**
 * HTTP Cache headers for browser/CDN caching
 */
export function getCacheHeaders(maxAgeSeconds: number): Record<string, string> {
  return {
    'Cache-Control': `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}`,
    'CDN-Cache-Control': `max-age=${maxAgeSeconds}`,
  };
}

/**
 * Clean expired cache entries (call periodically)
 */
export async function cleanExpiredCacheEntries(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase
    .from('edge_cache')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('id');
  
  if (error) {
    console.error('Failed to clean expired cache entries:', error);
    return 0;
  }
  
  return data?.length || 0;
}
