import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { orderNumber, phoneLast4 } = await req.json();

    if (!orderNumber || typeof orderNumber !== "string") {
      return new Response(
        JSON.stringify({ error: "Order number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!phoneLast4 || typeof phoneLast4 !== "string" || phoneLast4.length !== 4 || !/^\d{4}$/.test(phoneLast4)) {
      return new Response(
        JSON.stringify({ error: "Last 4 digits of phone number required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Exact match only - no ilike
    const { data: order, error } = await supabase
      .from("orders")
      .select("order_number, status, ncm_status, ncm_order_id, ncm_tracking_id, created_at, shipping_address, guest_phone")
      .eq("order_number", orderNumber.trim())
      .maybeSingle();

    if (error) {
      console.error("DB error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to look up order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Phone verification: check last 4 digits against shipping phone or guest_phone
    const shippingAddress = order.shipping_address as { phone?: string } | null;
    const shippingPhone = shippingAddress?.phone || "";
    const guestPhone = order.guest_phone || "";

    const shippingLast4 = shippingPhone.replace(/\D/g, "").slice(-4);
    const guestLast4 = guestPhone.replace(/\D/g, "").slice(-4);

    if (phoneLast4 !== shippingLast4 && phoneLast4 !== guestLast4) {
      return new Response(
        JSON.stringify({ error: "Phone verification failed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return only tracking-relevant fields - no financial data, no full phone
    const safeAddress = shippingAddress
      ? { city: (shippingAddress as Record<string, string>).city, district: (shippingAddress as Record<string, string>).district }
      : {};

    return new Response(
      JSON.stringify({
        order_number: order.order_number,
        status: order.status || "pending",
        ncm_status: order.ncm_status,
        ncm_order_id: order.ncm_order_id,
        ncm_tracking_id: order.ncm_tracking_id,
        created_at: order.created_at,
        shipping_address: safeAddress,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
