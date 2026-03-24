import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NCM_CONFIG, getCorsHeaders, requireAdmin } from "../_shared/config.ts";

const GENERIC_ERRORS = {
  VALIDATION: "Subject and message are required",
  TICKET_FAILED: "Failed to create ticket. Please try again.",
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

    const { order_id, subject, message } = await req.json();

    if (!subject || !message) {
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.VALIDATION }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Creating NCM ticket for order: ${order_id || 'general'}`);

    let ncmOrderId = null;
    if (order_id) {
      const { data: order } = await supabase
        .from("orders").select("ncm_order_id").eq("id", order_id).single();
      ncmOrderId = order?.ncm_order_id;
    }

    const ticketData: Record<string, unknown> = { subject, message };
    if (ncmOrderId) ticketData.order_id = ncmOrderId;

    const response = await fetch(`${NCM_CONFIG.apiUrl}/api/v2/vendor/ticket/create`, {
      method: "POST",
      headers: { "Authorization": `Token ${NCM_API_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(ticketData),
    });

    const responseText = await response.text();
    console.log("NCM create ticket response:", response.status);

    if (!response.ok) {
      console.error("NCM create ticket API error:", responseText.substring(0, 500));
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.TICKET_FAILED }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let responseData;
    try { responseData = JSON.parse(responseText); } catch { responseData = {}; }

    const ncmTicketId = responseData.ticket_id || responseData.id;

    const { data: ticket, error: insertError } = await supabase
      .from("ncm_tickets").insert({
        order_id: order_id || null, ncm_ticket_id: ncmTicketId,
        subject, message, status: "open",
      }).select().single();

    if (insertError) console.error("Error saving ticket locally:", insertError);

    return new Response(JSON.stringify({
      success: true, ticket_id: ticket?.id, ncm_ticket_id: ncmTicketId,
      message: "Ticket created successfully",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    console.error("Error in ncm-create-ticket:", error);
    return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.SERVER_ERROR }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
