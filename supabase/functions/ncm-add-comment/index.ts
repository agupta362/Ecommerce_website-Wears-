import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NCM_CONFIG, getCorsHeaders, requireAdmin } from "../_shared/config.ts";

const GENERIC_ERRORS = {
  VALIDATION: "Invalid request data",
  NOT_FOUND: "Order not found or no shipment exists",
  COMMENT_FAILED: "Failed to add comment. Please try again.",
  SERVER_ERROR: "An unexpected error occurred. Please try again.",
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require admin authentication
  const authResult = await requireAdmin(req, corsHeaders);
  if (authResult instanceof Response) return authResult;

  try {
    const NCM_API_TOKEN = Deno.env.get("NCM_API_TOKEN");
    if (!NCM_API_TOKEN) {
      console.error("NCM_API_TOKEN is not configured");
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.SERVER_ERROR }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id, ncm_order_id, comment } = await req.json();

    if (!comment) {
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.VALIDATION }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order_id && !ncm_order_id) {
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.VALIDATION }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let actualNcmOrderId = ncm_order_id;
    let orderId = order_id;

    if (!actualNcmOrderId && orderId) {
      const { data: order } = await supabase
        .from("orders").select("ncm_order_id").eq("id", orderId).single();
      if (!order?.ncm_order_id) {
        return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.NOT_FOUND }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      actualNcmOrderId = order.ncm_order_id;
    }

    console.log(`Adding comment to NCM order: ${actualNcmOrderId}`);

    const response = await fetch(`${NCM_CONFIG.apiUrl}/api/v1/comment`, {
      method: "POST",
      headers: { "Authorization": `Token ${NCM_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: actualNcmOrderId, comment }),
    });

    const responseText = await response.text();
    console.log("NCM add comment response status:", response.status);

    if (!response.ok) {
      console.error("NCM comment API error:", responseText.substring(0, 500));
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.COMMENT_FAILED }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (orderId) {
      await supabase.from("ncm_comments").insert({
        order_id: orderId, ncm_order_id: actualNcmOrderId,
        comment, author: "Vendor", is_vendor: true,
      });
    }

    return new Response(JSON.stringify({ success: true, ncm_order_id: actualNcmOrderId, message: "Comment added successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in ncm-add-comment:", error);
    return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.SERVER_ERROR }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
