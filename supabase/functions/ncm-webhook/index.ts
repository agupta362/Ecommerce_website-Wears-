import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/config.ts";

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

// Extend CORS headers for webhook-specific headers
const webhookCorsHeaders = {
  ...corsHeaders,
  "Access-Control-Allow-Headers": corsHeaders["Access-Control-Allow-Headers"] + ", x-ncm-signature, x-ncm-timestamp",
};

// Generic error messages for client responses
const GENERIC_ERRORS = {
  INVALID_REQUEST: "Invalid request",
  UNAUTHORIZED: "Unauthorized",
  NOT_FOUND: "Resource not found",
  INTERNAL_ERROR: "An error occurred processing the webhook",
};

// Verify webhook signature using HMAC-SHA256
async function verifySignature(
  body: string,
  signature: string | null,
  timestamp: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !timestamp) {
    console.warn("Missing signature or timestamp header");
    return false;
  }

  // Validate timestamp to prevent replay attacks (5 minute window)
  const timestampMs = parseInt(timestamp, 10);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  if (isNaN(timestampMs) || Math.abs(now - timestampMs) > fiveMinutes) {
    console.warn(`Timestamp validation failed: received ${timestamp}, current ${now}`);
    return false;
  }

  try {
    // Create HMAC signature using timestamp + body
    const message = `${timestamp}.${body}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(message)
    );
    
    // Convert to hex string for comparison
    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    
    // Constant-time comparison to prevent timing attacks
    if (signature.length !== expectedSignature.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < signature.length; i++) {
      result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    
    return result === 0;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

// Log webhook attempt for auditing
function logWebhookAttempt(
  req: Request,
  success: boolean,
  reason: string,
  orderId?: string
): void {
  const sourceIp = req.headers.get("x-forwarded-for") || 
                   req.headers.get("x-real-ip") || 
                   "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";
  
  console.log(JSON.stringify({
    type: "webhook_attempt",
    timestamp: new Date().toISOString(),
    source_ip: sourceIp,
    user_agent: userAgent,
    success,
    reason,
    order_id: orderId,
  }));
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: webhookCorsHeaders });
  }

  // Only accept POST requests
  if (req.method !== "POST") {
    logWebhookAttempt(req, false, "Invalid method");
    return new Response(JSON.stringify({ 
      success: false, 
      error: GENERIC_ERRORS.INVALID_REQUEST 
    }), {
      status: 405,
      headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const webhookSecret = Deno.env.get("NCM_WEBHOOK_SECRET");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read raw body for signature verification
    const rawBody = await req.text();
    
    // Signature verification (mandatory)
    if (!webhookSecret) {
      console.error("NCM_WEBHOOK_SECRET not configured - rejecting webhook");
      logWebhookAttempt(req, false, "Secret not configured");
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Service temporarily unavailable" 
      }), {
        status: 503,
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }

    const signature = req.headers.get("x-ncm-signature");
    const timestamp = req.headers.get("x-ncm-timestamp");
    
    const isValid = await verifySignature(rawBody, signature, timestamp, webhookSecret);
    
    if (!isValid) {
      logWebhookAttempt(req, false, "Invalid signature");
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.UNAUTHORIZED 
      }), {
        status: 401,
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse webhook payload
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      logWebhookAttempt(req, false, "Invalid JSON payload");
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.INVALID_REQUEST 
      }), {
        status: 400,
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("NCM webhook received:", JSON.stringify(payload));

    // Handle test webhooks - acknowledge without processing
    if (payload.test === true) {
      console.log("Test webhook received - acknowledging without database operations");
      logWebhookAttempt(req, true, "Test webhook");
      return new Response(JSON.stringify({ 
        success: true,
        message: "Test webhook received successfully",
        test: true
      }), {
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract and validate data from webhook
    const {
      order_id: ncmOrderId,
      id: altNcmOrderId,
      status,
      delivery_status,
      vref_id: vendorRef,
    } = payload;

    const ncmId = ncmOrderId || altNcmOrderId;
    const currentStatus = status || delivery_status;

    // Validate required fields
    if (!ncmId && !vendorRef) {
      logWebhookAttempt(req, false, "Missing order identifier");
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.INVALID_REQUEST 
      }), {
        status: 400,
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!currentStatus || typeof currentStatus !== "string") {
      logWebhookAttempt(req, false, "Missing or invalid status");
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.INVALID_REQUEST 
      }), {
        status: 400,
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate ncmId format (must be integer if provided)
    const ncmOrderIdInt = ncmId ? parseInt(String(ncmId), 10) : null;
    const isValidNcmId = ncmOrderIdInt !== null && !isNaN(ncmOrderIdInt) && ncmOrderIdInt > 0;

    console.log(`Processing webhook - NCM ID: ${ncmId}, parsed: ${ncmOrderIdInt}, valid: ${isValidNcmId}, vendor ref: ${vendorRef}, status: ${currentStatus}`);

    // Find order by NCM order ID (if valid integer) or vendor reference
    let query = supabase.from("orders").select("id, status");
    
    if (isValidNcmId) {
      query = query.eq("ncm_order_id", ncmOrderIdInt);
    } else if (vendorRef && typeof vendorRef === "string" && vendorRef.length > 0 && vendorRef.length <= 100) {
      query = query.eq("ncm_vendor_ref", vendorRef);
    } else {
      logWebhookAttempt(req, false, "Invalid order identifier format");
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.INVALID_REQUEST 
      }), {
        status: 400,
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: orders, error: findError } = await query;

    if (findError) {
      console.error("Error finding order:", findError);
      logWebhookAttempt(req, false, "Database error");
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.INTERNAL_ERROR 
      }), {
        status: 500,
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!orders || orders.length === 0) {
      console.log(`No order found for NCM ID: ${ncmId}, vendor ref: ${vendorRef}`);
      logWebhookAttempt(req, false, "Order not found", ncmId?.toString());
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.NOT_FOUND 
      }), {
        status: 404,
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }

    const order = orders[0];
    const mappedStatus = NCM_STATUS_MAP[currentStatus] || order.status;

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        ncm_status: currentStatus,
        ncm_last_sync: new Date().toISOString(),
        status: mappedStatus,
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      logWebhookAttempt(req, false, "Update failed", order.id);
      return new Response(JSON.stringify({ 
        success: false, 
        error: GENERIC_ERRORS.INTERNAL_ERROR 
      }), {
        status: 500,
        headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Order ${order.id} updated: NCM status = ${currentStatus}, order status = ${mappedStatus}`);
    logWebhookAttempt(req, true, "Order updated", order.id);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Webhook processed successfully"
    }), {
      headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in ncm-webhook:", error);
    logWebhookAttempt(req, false, "Unexpected error");
    return new Response(JSON.stringify({ 
      success: false, 
      error: GENERIC_ERRORS.INTERNAL_ERROR 
    }), {
      status: 500,
      headers: { ...webhookCorsHeaders, "Content-Type": "application/json" },
    });
  }
});