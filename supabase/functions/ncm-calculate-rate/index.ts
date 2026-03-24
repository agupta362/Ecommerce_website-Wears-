import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NCM_CONFIG, getCorsHeaders } from "../_shared/config.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NCM_API_TOKEN = Deno.env.get("NCM_API_TOKEN");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials are not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { to_branch, delivery_type = "normal" } = await req.json();

    if (!to_branch) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Destination branch (to_branch) is required" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Calculating rate: ${NCM_CONFIG.sourceBranch} -> ${to_branch}, type: ${delivery_type}`);

    // Try NCM API first (if token is available)
    let ncmApiSuccess = false;
    let ncmRate = null;

    if (NCM_API_TOKEN) {
      try {
        const url = new URL(`${NCM_CONFIG.apiUrl}/api/v1/shipping-rate`);
        url.searchParams.set("from_branch", NCM_CONFIG.sourceBranch);
        url.searchParams.set("to_branch", to_branch);
        url.searchParams.set("delivery_type", delivery_type);

        console.log("Attempting NCM API:", url.toString());

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Authorization": `Token ${NCM_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const responseText = await response.text();
          try {
            const rateData = JSON.parse(responseText);
            ncmRate = rateData.rate || rateData.price || rateData.shipping_rate;
            if (ncmRate && typeof ncmRate === 'number') {
              ncmApiSuccess = true;
              console.log("NCM API rate fetched:", ncmRate);
            }
          } catch {
            console.log("NCM API returned non-JSON response");
          }
        } else {
          console.log("NCM API returned status:", response.status);
        }
      } catch (apiError) {
        console.log("NCM API error:", apiError);
      }
    }

    // If NCM API succeeded, return that rate
    if (ncmApiSuccess && ncmRate) {
      return new Response(JSON.stringify({ 
        success: true, 
        rate: ncmRate,
        source_branch: NCM_CONFIG.sourceBranch,
        destination_branch: to_branch,
        delivery_type,
        rate_source: "ncm_api",
        is_default: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // First, try branch-specific rate from ncm_branches table
    console.log("Looking up branch-specific rate for:", to_branch);

    const { data: branchData, error: branchError } = await supabase
      .from('ncm_branches')
      .select('shipping_rate, office_pickup_rate, per_kg_rate, estimated_days')
      .eq('branch_name', to_branch.toUpperCase())
      .single();

    if (!branchError && branchData) {
      // Determine which rate to use based on delivery_type
      const isOfficePickup = delivery_type === 'office_pickup' || delivery_type === 'Branch2Branch';
      const rate = isOfficePickup && branchData.office_pickup_rate 
        ? branchData.office_pickup_rate 
        : branchData.shipping_rate;
      
      if (rate) {
        console.log("Found branch-specific rate:", rate, "for delivery_type:", delivery_type);
        return new Response(JSON.stringify({ 
          success: true, 
          rate: rate,
          home_delivery_rate: branchData.shipping_rate,
          office_pickup_rate: branchData.office_pickup_rate,
          per_kg_rate: branchData.per_kg_rate || 30,
          estimated_days: branchData.estimated_days || '3-5 days',
          source_branch: NCM_CONFIG.sourceBranch,
          destination_branch: to_branch,
          delivery_type,
          rate_source: "branch_specific",
          is_default: false
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fallback to zone-based pricing from database
    console.log("Falling back to zone-based pricing for:", to_branch);

    // Check if branch is in any specific zone
    const { data: matchingZone, error: zoneError } = await supabase
      .from('ncm_rate_zones')
      .select('*')
      .contains('branches', [to_branch.toUpperCase()])
      .single();

    if (!zoneError && matchingZone) {
      console.log("Found zone for branch:", matchingZone.zone_name);
      return new Response(JSON.stringify({ 
        success: true, 
        rate: matchingZone.base_rate,
        zone_name: matchingZone.zone_name,
        per_kg_rate: matchingZone.per_kg_rate,
        estimated_days: matchingZone.estimated_days,
        source_branch: NCM_CONFIG.sourceBranch,
        destination_branch: to_branch,
        delivery_type,
        rate_source: "zone_based",
        is_default: false
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use default zone (Remote Areas)
    const { data: defaultZone, error: defaultError } = await supabase
      .from('ncm_rate_zones')
      .select('*')
      .eq('is_default', true)
      .single();

    if (!defaultError && defaultZone) {
      console.log("Using default zone:", defaultZone.zone_name);
      return new Response(JSON.stringify({ 
        success: true, 
        rate: defaultZone.base_rate,
        zone_name: defaultZone.zone_name,
        per_kg_rate: defaultZone.per_kg_rate,
        estimated_days: defaultZone.estimated_days,
        source_branch: NCM_CONFIG.sourceBranch,
        destination_branch: to_branch,
        delivery_type,
        rate_source: "zone_default",
        is_default: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Ultimate fallback: hardcoded rate
    console.log("No zones found, using hardcoded fallback");
    return new Response(JSON.stringify({ 
      success: true, 
      rate: 150,
      source_branch: NCM_CONFIG.sourceBranch,
      destination_branch: to_branch,
      delivery_type,
      rate_source: "hardcoded_fallback",
      is_default: true,
      message: "Using default shipping rate"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in ncm-calculate-rate:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage,
      rate: 150,
      rate_source: "error_fallback",
      is_default: true
    }), {
      status: 200, // Return 200 with default rate on error
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});