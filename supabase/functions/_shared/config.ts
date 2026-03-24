/**
 * Shared Configuration for Supabase Edge Functions
 * 
 * This file exports configuration values that are shared across all edge functions.
 * Update these values to match your site.config.ts settings.
 * 
 * IMPORTANT: When updating site.config.ts, also update these values!
 */

// =============================================================================
// NCM COURIER CONFIGURATION
// =============================================================================
export const NCM_CONFIG = {
  // Your registered source branch in NCM dashboard
  // This is where all shipments originate from
  sourceBranch: "NARAYANGHAT",
  
  // NCM API base URL
  apiUrl: "https://portal.nepalcanmove.com",
  
  // Valid delivery types
  validDeliveryTypes: ["Door2Door", "Branch2Door", "Branch2Branch", "Door2Branch"] as const,
  
  // Default package weight in kg
  defaultWeight: 0.5,
} as const;

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================
export const DATABASE_CONFIG = {
  // Prefix for order numbers (e.g., RKN-20260130-1234)
  orderNumberPrefix: "RKN",
  
  // Supabase storage bucket for product images
  storageBucket: "product-images",
} as const;

// =============================================================================
// BUSINESS CONFIGURATION
// =============================================================================
export const BUSINESS_CONFIG = {
  name: "Babal Wears",
  email: "antrikshgupta0@gmail.com",
  phone: "+977 016-1234567",
  adminEmail: "kshitizgupta148@gmail.com",
  domain: "https://babalwears.com",
  fromEmail: "Babal Wears <noreply@retrokitnepal.com>",
} as const;

// =============================================================================
// CORS HEADERS
// =============================================================================
const ALLOWED_ORIGINS = [
  "https://babalwears.com",
  "https://www.babalwears.com",
];

export const getCorsHeaders = (origin: string | null) => {
  const isLovablePreview = origin?.endsWith(".lovable.app");
  const isLocalhost = origin?.startsWith("http://localhost:");
  const isAllowed = origin && (ALLOWED_ORIGINS.includes(origin) || isLovablePreview || isLocalhost);
  const allowedOrigin = isAllowed ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
};

// Legacy static headers - kept for backward compat in webhook (external origin)
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// =============================================================================
// AUTH HELPER - Verify admin role for protected endpoints
// =============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function requireAdmin(
  req: Request,
  corsHeaders: Record<string, string>
): Promise<{ userId: string } | Response> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Verify JWT using anon client with user's token
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userId = claimsData.claims.sub as string;

  // Verify admin role using service role client
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  const { data: roleData } = await adminClient
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return new Response(JSON.stringify({ success: false, error: "Admin access required" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return { userId };
}

// Type exports
export type DeliveryType = typeof NCM_CONFIG.validDeliveryTypes[number];
