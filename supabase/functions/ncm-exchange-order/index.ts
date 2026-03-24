import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NCM_CONFIG, getCorsHeaders, requireAdmin } from "../_shared/config.ts";

const GENERIC_ERRORS = {
  VALIDATION: "Invalid request data",
  NOT_FOUND: "Order not found",
  NO_SHIPMENT: "No shipment exists for this order",
  EXCHANGE_FAILED: "Failed to create exchange. Please try again or contact support.",
  SERVER_ERROR: "An unexpected error occurred. Please try again.",
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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

    const { order_id, exchange_items, reason } = await req.json();

    if (!order_id) {
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.VALIDATION }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders").select("*, order_items(*)").eq("id", order_id).single();

    if (orderError || !order) {
      console.error("Order lookup failed:", orderError);
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.NOT_FOUND }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.ncm_order_id) {
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.NO_SHIPMENT }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Creating exchange for NCM order: ${order.ncm_order_id}`);

    const exchangeData: Record<string, unknown> = {
      order_id: order.ncm_order_id,
      exchange_items: exchange_items || [],
      reason: reason || "Customer requested exchange",
    };

    const response = await fetch(`${NCM_CONFIG.apiUrl}/api/v2/vendor/order/exchange-create`, {
      method: "POST",
      headers: { "Authorization": `Token ${NCM_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(exchangeData),
    });

    const responseText = await response.text();
    console.log("NCM exchange order response status:", response.status);

    if (!response.ok) {
      console.error("NCM exchange API error:", responseText.substring(0, 500));
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.EXCHANGE_FAILED }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let responseData;
    try { responseData = JSON.parse(responseText); } catch { responseData = {}; }

    const newNcmOrderId = responseData.new_order_id || responseData.exchange_order_id;
    const newTrackingId = responseData.new_tracking_id || responseData.exchange_tracking_id;

    const { error: updateError } = await supabase
      .from("orders").update({
        status: "exchange_created", ncm_status: "exchange_created",
        ncm_last_sync: new Date().toISOString(),
        admin_notes: `Exchange created. ${order.admin_notes || ''}`,
      }).eq("id", order_id);

    if (updateError) console.error("Error updating order:", updateError);

    return new Response(JSON.stringify({
      success: true, order_id, original_ncm_order_id: order.ncm_order_id,
      new_ncm_order_id: newNcmOrderId, new_tracking_id: newTrackingId,
      message: "Exchange order created successfully",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    console.error("Error in ncm-exchange-order:", error);
    return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.SERVER_ERROR }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
