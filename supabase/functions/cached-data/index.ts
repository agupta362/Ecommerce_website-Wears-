/**
 * EDGE FUNCTION TEMPLATE: Minimal Egress Pattern
 * 
 * This template demonstrates how to minimize cached egress by:
 * 1. Using database-backed caching (survives cold starts)
 * 2. Setting HTTP cache headers for browser/CDN caching
 * 3. Batching database operations
 * 4. Returning early for cached responses
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";
import { getCachedValue, setCachedValue, getCacheHeaders } from "../_shared/cacheUtils.ts";

// Cache configuration
const CACHE_TTL_SECONDS = 300; // 5 minutes database cache
const HTTP_CACHE_SECONDS = 60; // 1 minute browser cache

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { cache_key, fresh } = await req.json().catch(() => ({}));
    const cacheKey = cache_key || 'default';
    
    // Step 1: Check database cache (unless fresh=true requested)
    if (!fresh) {
      const cached = await getCachedValue(supabase, cacheKey);
      
      if (cached) {
        console.log('Cache HIT - returning cached data');
        return new Response(JSON.stringify({
          success: true,
          data: cached,
          cached: true,
        }), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            ...getCacheHeaders(HTTP_CACHE_SECONDS),
          },
        });
      }
    }
    
    // Step 2: Cache MISS - fetch fresh data
    console.log('Cache MISS - fetching fresh data');
    
    // Your data fetching logic here
    const freshData = {
      timestamp: new Date().toISOString(),
      message: 'This is fresh data from the cached-data template',
    };
    
    // Step 3: Store in database cache
    await setCachedValue(supabase, cacheKey, freshData, CACHE_TTL_SECONDS);
    
    // Step 4: Return with cache headers
    return new Response(JSON.stringify({
      success: true,
      data: freshData,
      cached: false,
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...getCacheHeaders(HTTP_CACHE_SECONDS),
      },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
