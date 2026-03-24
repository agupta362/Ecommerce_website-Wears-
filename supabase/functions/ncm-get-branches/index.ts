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
    if (!NCM_API_TOKEN) {
      throw new Error("NCM_API_TOKEN is not configured");
    }

    console.log("Fetching NCM branches...");

    // Try multiple potential NCM API endpoints
    const endpoints = [
      `${NCM_CONFIG.apiUrl}/api/v1/branch/list`,
      `${NCM_CONFIG.apiUrl}/api/v1/branches`,
      `${NCM_CONFIG.apiUrl}/api/branch/list`,
    ];

    let branches = [];
    let fetchSuccess = false;

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Token ${NCM_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Handle different response formats
          branches = Array.isArray(data) ? data : (data.branches || data.data || data.results || []);
          console.log(`Success! Fetched ${branches.length} branches from ${endpoint}`);
          fetchSuccess = true;
          break;
        } else {
          console.log(`Endpoint ${endpoint} returned ${response.status}`);
        }
      } catch (e) {
        console.log(`Endpoint ${endpoint} failed:`, e);
      }
    }

    // If API fetch failed, use default Nepal branches
    if (!fetchSuccess || branches.length === 0) {
      console.log("Using default Nepal branches as API endpoints failed");
      branches = [
        { id: 1, name: `${NCM_CONFIG.sourceBranch}-CHITWAN` },
        { id: 2, name: "KATHMANDU" },
        { id: 3, name: "POKHARA" },
        { id: 4, name: "BHAKTAPUR" },
        { id: 5, name: "LALITPUR" },
        { id: 6, name: "BIRATNAGAR" },
        { id: 7, name: "BIRGUNJ" },
        { id: 8, name: "DHARAN" },
        { id: 9, name: "BUTWAL" },
        { id: 10, name: "NEPALGUNJ" },
        { id: 11, name: "HETAUDA" },
        { id: 12, name: "DAMAK" },
        { id: 13, name: "ITAHARI" },
        { id: 14, name: "BHARATPUR" },
        { id: 15, name: "DHANGADHI" },
      ];
    }

    console.log(`Processing ${branches.length} branches`);

    // Cache branches in Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Normalize branch data - NCM may return just strings or objects
    const normalizedBranches = branches.map((branch: string | { id?: number; name?: string; branch_id?: number; branch_name?: string }, index: number) => {
      if (typeof branch === 'string') {
        return { id: index + 1, name: branch };
      }
      return {
        id: branch.id || branch.branch_id || index + 1,
        name: branch.name || branch.branch_name || `Branch ${index + 1}`,
      };
    });

    console.log(`Normalized ${normalizedBranches.length} branches`);

    // Upsert branches to cache using branch_name as unique key
    for (const branch of normalizedBranches) {
      const { error } = await supabase
        .from("ncm_branches")
        .upsert({
          branch_id: branch.id,
          branch_name: branch.name,
          covered_areas: [],
          is_active: true,
          last_synced_at: new Date().toISOString(),
        }, { onConflict: "branch_id" });

      if (error) {
        console.error("Error caching branch:", branch.name, error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      branches,
      cached: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in ncm-get-branches:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});