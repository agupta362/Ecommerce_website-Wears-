import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/config.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const {
      items,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      subtotal,
      discountAmount,
      discountCode,
      total,
      storeLocation,
      storeCode = 'RKN',
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order must contain at least one item" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!paymentMethod) {
      return new Response(
        JSON.stringify({ error: "Payment method is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate items structure
    for (const item of items) {
      if (!item.productId || !item.productName || !item.size || !item.quantity || !item.price) {
        return new Response(
          JSON.stringify({ error: "Invalid item structure" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (item.quantity < 1 || item.quantity > 100) {
        return new Response(
          JSON.stringify({ error: "Invalid item quantity" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Validate discount code if provided
    if (discountCode) {
      const { data: codeData, error: codeError } = await adminClient
        .from("discount_codes")
        .select("code, is_active, max_uses, used_count, valid_from, valid_until")
        .eq("code", discountCode.toUpperCase().trim())
        .maybeSingle();

      if (codeError || !codeData) {
        return new Response(
          JSON.stringify({ error: "Invalid discount code" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (!codeData.is_active) {
        return new Response(
          JSON.stringify({ error: "This discount code is no longer active" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (codeData.max_uses !== null && (codeData.used_count || 0) >= codeData.max_uses) {
        return new Response(
          JSON.stringify({ error: "This discount code has reached its usage limit" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const now = new Date();
      if (codeData.valid_from && new Date(codeData.valid_from) > now) {
        return new Response(
          JSON.stringify({ error: "This discount code is not yet active" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (codeData.valid_until && new Date(codeData.valid_until) < now) {
        return new Response(
          JSON.stringify({ error: "This discount code has expired" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Build shipping address from store location or customer info
    const shippingAddress = {
      fullName: customerName || storeLocation?.fullName || "Walk-in Customer",
      phone: customerPhone || storeLocation?.phone || "",
      city: storeLocation?.city || "Store",
      district: storeLocation?.district || "Location",
      address: storeLocation?.addressLine1 || "In-Store Purchase",
      addressLine1: storeLocation?.addressLine1 || "In-Store Purchase",
    };

    // Create order with order_source = 'in_store'
    const orderPayload = {
      order_number: "TEMP", // Will be overwritten by database trigger
      user_id: null, // Walk-in orders don't have a user
      guest_email: customerEmail || null,
      guest_phone: customerPhone || null,
      status: "confirmed", // In-store orders are immediately confirmed
      payment_method: paymentMethod === 'qr' ? 'esewa' : 'cod', // Map to existing enum
      subtotal: subtotal || 0,
      shipping_cost: 0, // No shipping for in-store
      gift_wrap_cost: 0,
      discount_amount: discountAmount || 0,
      total: total || 0,
      shipping_address: shippingAddress,
      gift_wrap: false,
      discount_code: discountCode || null,
      order_source: 'in_store',
    };

    const { data: order, error: orderError } = await adminClient
      .from("orders")
      .insert([orderPayload])
      .select()
      .single();

    if (orderError) {
      console.error("Order creation failed:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert order items (triggers stock reduction)
    const orderItems = items.map((item: {
      productId: string;
      productName: string;
      productImage?: string;
      size: string;
      quantity: number;
      price: number;
    }) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_image: item.productImage || null,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await adminClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation failed:", itemsError);
      // Rollback: delete the order
      await adminClient.from("orders").delete().eq("id", order.id);
      return new Response(
        JSON.stringify({ error: "Failed to create order items" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment discount code usage if applied
    if (discountCode) {
      await adminClient.rpc('increment_discount_usage', { p_code: discountCode });
    }

    // Auto-generate invoice for in-store orders
    const { data: invoiceNumber, error: invoiceError } = await adminClient
      .rpc('generate_invoice_number', { p_store_code: storeCode });

    let invoice = null;
    if (!invoiceError && invoiceNumber) {
      const sequenceNumber = parseInt(invoiceNumber.split('-')[1], 10);
      
      const { data: newInvoice } = await adminClient
        .from('invoices')
        .insert({
          order_id: order.id,
          invoice_number: invoiceNumber,
          store_code: storeCode,
          sequence_number: sequenceNumber,
          generated_by: user.id,
        })
        .select()
        .single();
      
      invoice = newInvoice;
    }

    console.log("In-store order created:", order.id, order.order_number);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: {
          id: order.id,
          order_number: order.order_number,
          created_at: order.created_at,
        },
        invoice: invoice,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});