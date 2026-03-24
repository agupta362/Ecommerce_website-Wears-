import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NCM_CONFIG, getCorsHeaders } from "../_shared/config.ts";

// Security: Generic error messages for clients
const GENERIC_ERRORS = {
  VALIDATION: "Invalid request data",
  NOT_FOUND: "Order not found or no shipment exists",
  TRACKING_FAILED: "Unable to retrieve tracking information. Please try again.",
  SERVER_ERROR: "An unexpected error occurred. Please try again.",
};

// Map NCM statuses to our order statuses
const NCM_STATUS_MAP: Record<string, string> = {
  "created": "shipped",
  "picked": "shipped",
  "pickup order created": "shipped",
  "sent for pickup": "shipped",
  "pickup complete": "shipped",
  "in_transit": "shipped",
  "sent for delivery": "shipped",
  "out for delivery": "shipped",
  "out_for_delivery": "shipped",
  "delivered": "delivered",
  "returned": "returned",
  "cancelled": "cancelled",
  "return_initiated": "return_initiated",
};

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
      console.error("NCM_API_TOKEN is not configured");
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.SERVER_ERROR 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id, ncm_order_id } = await req.json();

    if (!order_id && !ncm_order_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.VALIDATION 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let actualNcmOrderId = ncm_order_id;
    let orderId = order_id;

    // If only order_id provided, look up ncm_order_id
    if (!actualNcmOrderId && orderId) {
      const { data: order, error } = await supabase
        .from("orders")
        .select("ncm_order_id")
        .eq("id", orderId)
        .single();

      if (error || !order?.ncm_order_id) {
        console.error("Order lookup failed:", error);
        return new Response(JSON.stringify({ 
          success: false, 
          error: GENERIC_ERRORS.NOT_FOUND 
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      actualNcmOrderId = order.ncm_order_id;
    }

    console.log(`Tracking NCM order: ${actualNcmOrderId}`);

    // Fetch status from NCM API v1
    const response = await fetch(`${NCM_CONFIG.apiUrl}/api/v1/order/status?id=${actualNcmOrderId}`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${NCM_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    // Always read response as text first
    const responseText = await response.text();
    console.log("NCM tracking response status:", response.status);

    if (!response.ok) {
      // Log detailed error server-side only
      console.error("NCM tracking API error:", responseText.substring(0, 500));
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.TRACKING_FAILED 
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try to parse JSON response
    let trackingData;
    try {
      trackingData = JSON.parse(responseText);
    } catch {
      console.error("NCM returned invalid JSON:", responseText.substring(0, 500));
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.TRACKING_FAILED 
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract status from response
    const ncmStatus = trackingData.status || trackingData.order_status || trackingData.delivery_status || "unknown";
    const mappedStatus = NCM_STATUS_MAP[ncmStatus.toLowerCase()] || "shipped";

    // Update order if we have order_id
    if (orderId) {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          ncm_status: ncmStatus,
          ncm_last_sync: new Date().toISOString(),
          status: mappedStatus,
        })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order:", updateError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      ncm_order_id: actualNcmOrderId,
      ncm_status: ncmStatus,
      mapped_status: mappedStatus,
      last_synced: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in ncm-track-shipment:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: GENERIC_ERRORS.SERVER_ERROR 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});