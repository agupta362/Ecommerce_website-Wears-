import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NCM_CONFIG, getCorsHeaders, requireAdmin } from "../_shared/config.ts";

// Map NCM status to order status
const NCM_STATUS_MAP: Record<string, string> = {
  "Pickup Order Created": "shipped",
  "Sent for Pickup": "shipped",
  "Pickup Complete": "shipped",
  "Sent for Delivery": "shipped",
  "Out for Delivery": "shipped",
  "Delivered": "delivered",
  "Returned": "cancelled",
  "Cancelled": "cancelled",
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Require admin authentication
  const authResult = await requireAdmin(req, corsHeaders);
  if (authResult instanceof Response) return authResult;

  try {
    const NCM_API_TOKEN = Deno.env.get("NCM_API_TOKEN");
    if (!NCM_API_TOKEN) {
      throw new Error("NCM_API_TOKEN is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting NCM status sync...");

    // Fetch all orders with NCM shipments that are not yet delivered/cancelled
    const { data: orders, error: fetchError } = await supabase
      .from("orders")
      .select("id, ncm_order_id, ncm_status, status")
      .not("ncm_order_id", "is", null)
      .not("status", "in", '("delivered","cancelled")');

    if (fetchError) {
      console.error("Error fetching orders:", fetchError);
      throw new Error("Failed to fetch orders for sync");
    }

    console.log(`Found ${orders?.length || 0} orders to sync`);

    const results = {
      total: orders?.length || 0,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Sync each order
    for (const order of orders || []) {
      try {
        console.log(`Syncing order ${order.id}, NCM ID: ${order.ncm_order_id}`);

        // Fetch tracking info from NCM API
        const response = await fetch(`${NCM_CONFIG.apiUrl}/api/order/${order.ncm_order_id}/`, {
          method: "GET",
          headers: {
            "Authorization": `Token ${NCM_API_TOKEN}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`NCM API error for order ${order.id}:`, response.status, errorText);
          results.failed++;
          results.errors.push(`Order ${order.id}: NCM API error ${response.status}`);
          continue;
        }

        const trackingData = await response.json();
        const currentStatus = trackingData.status || trackingData.delivery_status || "Unknown";
        const mappedOrderStatus = NCM_STATUS_MAP[currentStatus] || order.status;

        // Update if status changed
        if (order.ncm_status !== currentStatus) {
          const { error: updateError } = await supabase
            .from("orders")
            .update({
              ncm_status: currentStatus,
              ncm_last_sync: new Date().toISOString(),
              status: mappedOrderStatus,
            })
            .eq("id", order.id);

          if (updateError) {
            console.error(`Error updating order ${order.id}:`, updateError);
            results.failed++;
            results.errors.push(`Order ${order.id}: Update failed`);
          } else {
            console.log(`Order ${order.id} updated: ${order.ncm_status} -> ${currentStatus}`);
            results.updated++;
          }
        } else {
          // Just update last sync time
          await supabase
            .from("orders")
            .update({ ncm_last_sync: new Date().toISOString() })
            .eq("id", order.id);
        }

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (orderError: unknown) {
        const orderErrorMessage = orderError instanceof Error ? orderError.message : "Unknown error";
        console.error(`Error syncing order ${order.id}:`, orderError);
        results.failed++;
        results.errors.push(`Order ${order.id}: ${orderErrorMessage}`);
      }
    }

    console.log("NCM status sync complete:", results);

    return new Response(JSON.stringify({ 
      success: true, 
      ...results,
      message: `Synced ${results.updated}/${results.total} orders`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in ncm-sync-statuses:", error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});