import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NCM_CONFIG, getCorsHeaders, requireAdmin } from "../_shared/config.ts";

const GENERIC_ERRORS = {
  VALIDATION: "Invalid request data",
  NOT_FOUND: "Ticket not found",
  CLOSE_FAILED: "Failed to close ticket. Please try again.",
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

    const { ticket_id, ncm_ticket_id } = await req.json();

    if (!ticket_id && !ncm_ticket_id) {
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.VALIDATION }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let actualNcmTicketId = ncm_ticket_id;
    let localTicketId = ticket_id;

    if (!actualNcmTicketId && localTicketId) {
      const { data: ticket } = await supabase
        .from("ncm_tickets").select("ncm_ticket_id").eq("id", localTicketId).single();
      if (!ticket?.ncm_ticket_id) {
        return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.NOT_FOUND }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      actualNcmTicketId = ticket.ncm_ticket_id;
    }

    console.log(`Closing NCM ticket: ${actualNcmTicketId}`);

    const response = await fetch(`${NCM_CONFIG.apiUrl}/api/v2/vendor/ticket/close/${actualNcmTicketId}`, {
      method: "POST",
      headers: { "Authorization": `Token ${NCM_API_TOKEN}`, "Content-Type": "application/json" },
    });

    const responseText = await response.text();
    console.log("NCM close ticket response:", response.status);

    if (!response.ok) {
      console.error("NCM close ticket API error:", responseText.substring(0, 500));
      return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.CLOSE_FAILED }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (localTicketId) {
      await supabase.from("ncm_tickets").update({
        status: "closed", closed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).eq("id", localTicketId);
    } else {
      await supabase.from("ncm_tickets").update({
        status: "closed", closed_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }).eq("ncm_ticket_id", actualNcmTicketId);
    }

    return new Response(JSON.stringify({
      success: true, ncm_ticket_id: actualNcmTicketId, message: "Ticket closed successfully",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: unknown) {
    console.error("Error in ncm-close-ticket:", error);
    return new Response(JSON.stringify({ success: false, error: GENERIC_ERRORS.SERVER_ERROR }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
