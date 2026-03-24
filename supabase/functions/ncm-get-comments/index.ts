import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NCM_CONFIG, getCorsHeaders } from "../_shared/config.ts";

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NCM_API_TOKEN = Deno.env.get("NCM_API_TOKEN");
    if (!NCM_API_TOKEN) {
      throw new Error("NCM_API_TOKEN is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id, ncm_order_id } = await req.json();

    if (!order_id && !ncm_order_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Either order_id or ncm_order_id is required" 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let actualNcmOrderId = ncm_order_id;
    let orderId = order_id;

    // Look up ncm_order_id if only order_id provided
    if (!actualNcmOrderId && orderId) {
      const { data: order } = await supabase
        .from("orders")
        .select("ncm_order_id")
        .eq("id", orderId)
        .single();

      if (!order?.ncm_order_id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "No NCM shipment exists for this order" 
        }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      actualNcmOrderId = order.ncm_order_id;
    }

    console.log(`Fetching comments for NCM order: ${actualNcmOrderId}`);

    // Fetch comments from NCM API v1
    const url = `${NCM_CONFIG.apiUrl}/api/v1/order/comment?id=${actualNcmOrderId}`;
    console.log("Calling NCM API:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Token ${NCM_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    const responseText = await response.text();
    console.log("NCM comments response:", response.status, responseText.substring(0, 500));

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `NCM API returned ${response.status}`,
        details: responseText.substring(0, 500)
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let commentsData;
    try {
      commentsData = JSON.parse(responseText);
    } catch {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "NCM returned invalid JSON",
        details: responseText.substring(0, 500)
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract comments array safely - ensure it's always an array
    const rawComments = commentsData.comments || commentsData;
    const commentsArray = Array.isArray(rawComments) ? rawComments : [];

    // Cache comments in our database if we have order_id
    if (orderId && commentsArray.length > 0) {
      for (const comment of commentsArray) {
        await supabase.from("ncm_comments").upsert({
          order_id: orderId,
          ncm_order_id: actualNcmOrderId,
          comment: comment.comment || comment.message || comment.text,
          author: comment.author || comment.user || "NCM",
          is_vendor: comment.is_vendor ?? false,
          created_at: comment.created_at || comment.timestamp || new Date().toISOString(),
        }, { onConflict: "id" });
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      ncm_order_id: actualNcmOrderId,
      comments: commentsArray
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in ncm-get-comments:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});