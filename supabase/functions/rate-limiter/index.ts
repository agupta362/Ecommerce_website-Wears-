import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";

// Rate limit configurations per action type
const RATE_LIMITS: Record<string, { maxAttempts: number; windowMinutes: number; blockMinutes: number }> = {
  'login': { maxAttempts: 5, windowMinutes: 1, blockMinutes: 5 },
  'signup': { maxAttempts: 3, windowMinutes: 5, blockMinutes: 15 },
  'order': { maxAttempts: 5, windowMinutes: 60, blockMinutes: 30 },
  'review': { maxAttempts: 3, windowMinutes: 1440, blockMinutes: 60 },
  'contact': { maxAttempts: 3, windowMinutes: 60, blockMinutes: 30 },
  'newsletter': { maxAttempts: 3, windowMinutes: 60, blockMinutes: 30 },
};

// Security: Sanitize log input to prevent log injection
const sanitizeForLog = (input: unknown): string => {
  if (typeof input !== 'string') return String(input).slice(0, 100);
  return input.replace(/[\n\r\t]/g, ' ').slice(0, 100);
};

const RETRY_CONFIG = { maxRetries: 1, baseDelayMs: 100, maxDelayMs: 500 };
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const getRetryDelay = (attempt: number): number => {
  const delay = Math.min(RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt), RETRY_CONFIG.maxDelayMs);
  return delay + Math.random() * delay * 0.1;
};

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let lastError: Error | null = null;
  let action: string | undefined;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { action: requestAction, identifier } = await req.json();
      action = requestAction;

      if (!action || !identifier) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const config = RATE_LIMITS[action];
      if (!config) {
        return new Response(
          JSON.stringify({ error: 'Invalid action type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const now = new Date();

      const { data: existingRecord, error: fetchError } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .eq('action_type', action)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingRecord) {
        if (existingRecord.blocked_until && new Date(existingRecord.blocked_until) > now) {
          const retryAfter = Math.ceil((new Date(existingRecord.blocked_until).getTime() - now.getTime()) / 1000);
          return new Response(
            JSON.stringify({ allowed: false, reason: 'blocked', retryAfter, message: `Too many attempts. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).` }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const windowStart = new Date(existingRecord.window_start);
        const windowEnd = new Date(windowStart.getTime() + config.windowMinutes * 60 * 1000);

        if (now < windowEnd) {
          if (existingRecord.attempts >= config.maxAttempts) {
            const blockedUntil = new Date(now.getTime() + config.blockMinutes * 60 * 1000);
            await supabase.from('rate_limits').update({ blocked_until: blockedUntil.toISOString(), attempts: existingRecord.attempts + 1 }).eq('id', existingRecord.id);
            const retryAfter = config.blockMinutes * 60;
            return new Response(
              JSON.stringify({ allowed: false, reason: 'rate_limited', retryAfter, message: `Too many attempts. Please try again in ${config.blockMinutes} minute(s).` }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          await supabase.from('rate_limits').update({ attempts: existingRecord.attempts + 1 }).eq('id', existingRecord.id);
          return new Response(
            JSON.stringify({ allowed: true, remaining: config.maxAttempts - existingRecord.attempts - 1 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          await supabase.from('rate_limits').update({ attempts: 1, window_start: now.toISOString(), blocked_until: null }).eq('id', existingRecord.id);
          return new Response(
            JSON.stringify({ allowed: true, remaining: config.maxAttempts - 1 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        await supabase.from('rate_limits').insert({ identifier, action_type: action, attempts: 1, window_start: now.toISOString() });
        return new Response(
          JSON.stringify({ allowed: true, remaining: config.maxAttempts - 1 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`Rate limiter error (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}):`, lastError.message);
      if (attempt < RETRY_CONFIG.maxRetries) {
        await sleep(getRetryDelay(attempt));
        continue;
      }
      console.error('Rate limiter: All retries exhausted, failing open');
      return new Response(
        JSON.stringify({ allowed: true }),
        { headers: { ...getCorsHeaders(null), 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response(
    JSON.stringify({ allowed: true }),
    { headers: { ...getCorsHeaders(null), 'Content-Type': 'application/json' } }
  );
});
