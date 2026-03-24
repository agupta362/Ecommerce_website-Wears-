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
    
    // Create client for user verification (if authenticated)
    let userId: string | null = null;
    if (authHeader) {
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id ?? null;
    }

    // Parse request body
    const body = await req.json();
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      giftWrapCost,
      discountAmount,
      total,
      giftWrap,
      giftMessage,
      discountCode,
      notes,
      guestEmail,
      guestPhone,
      destinationBranch,
      alternatePhone,
      deliveryInstruction,
      deliveryType,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Order must contain at least one item" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone) {
      return new Response(
        JSON.stringify({ error: "Shipping address is required" }),
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
      if (item.price < 0 || item.price > 1000000) {
        return new Response(
          JSON.stringify({ error: "Invalid item price" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Use service role to create order atomically
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Validate discount code before creating order (server-side check for race conditions)
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

      // Check max_uses limit
      if (codeData.max_uses !== null && (codeData.used_count || 0) >= codeData.max_uses) {
        return new Response(
          JSON.stringify({ error: "This discount code has reached its usage limit" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check validity dates
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

    // Map delivery type to NCM API values
    // home_delivery -> Branch2Door (deliver to customer's door)
    // office_pickup -> Branch2Branch (customer picks up at NCM office)
    const ncmDeliveryType = deliveryType === 'office_pickup' ? 'Branch2Branch' : 'Branch2Door';

    // Create order
    const orderPayload = {
      order_number: "TEMP", // Will be overwritten by database trigger
      user_id: userId,
      guest_email: guestEmail || null,
      guest_phone: guestPhone || null,
      status: "pending",
      payment_method: paymentMethod,
      subtotal: subtotal || 0,
      shipping_cost: shippingCost || 0,
      gift_wrap_cost: giftWrapCost || 0,
      discount_amount: discountAmount || 0,
      total: total || 0,
      shipping_address: shippingAddress,
      gift_wrap: giftWrap || false,
      gift_message: giftMessage || null,
      discount_code: discountCode || null,
      notes: notes || null,
      destination_branch: destinationBranch ? String(destinationBranch) : null,
      alternate_phone: alternatePhone || null,
      delivery_instruction: deliveryInstruction || null,
      ncm_delivery_type: ncmDeliveryType,
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

    // Insert order items atomically
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

    // Stock is automatically decreased via database trigger on order_items INSERT

    // Increment discount code usage count if a code was applied
    if (discountCode) {
      const { error: discountError } = await adminClient.rpc('increment_discount_usage', {
        p_code: discountCode
      });
      
      if (discountError) {
        console.error("Failed to increment discount usage:", discountError);
        // Non-blocking - order still succeeds
      }
    }

    console.log("Order created successfully:", order.id, order.order_number);

    return new Response(
      JSON.stringify({ 
        success: true, 
        order: {
          id: order.id,
          order_number: order.order_number,
          created_at: order.created_at,
        }
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
