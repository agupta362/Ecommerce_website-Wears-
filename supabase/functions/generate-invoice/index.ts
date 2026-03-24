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
    const { orderId, storeCode = 'RKN' } = body;

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Order ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if order exists
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, order_number, status')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if invoice already exists
    const { data: existingInvoice } = await adminClient
      .from('invoices')
      .select('*')
      .eq('order_id', orderId)
      .maybeSingle();

    if (existingInvoice) {
      return new Response(
        JSON.stringify({ success: true, invoice: existingInvoice, existing: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate invoice number using database function
    const { data: invoiceNumber, error: invoiceError } = await adminClient
      .rpc('generate_invoice_number', { p_store_code: storeCode });

    if (invoiceError) {
      console.error("Failed to generate invoice number:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Failed to generate invoice number" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract sequence number from invoice number (e.g., RKN-000001 -> 1)
    const sequenceNumber = parseInt(invoiceNumber.split('-')[1], 10);

    // Create invoice record
    const { data: invoice, error: createError } = await adminClient
      .from('invoices')
      .insert({
        order_id: orderId,
        invoice_number: invoiceNumber,
        store_code: storeCode,
        sequence_number: sequenceNumber,
        generated_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error("Failed to create invoice:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create invoice record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Invoice generated successfully:", invoice.invoice_number);

    return new Response(
      JSON.stringify({ success: true, invoice }),
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