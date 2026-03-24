import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { NCM_CONFIG, getCorsHeaders, requireAdmin } from "../_shared/config.ts";

// Valid delivery types - NCM accepts exactly these values (case-sensitive)
type DeliveryType = typeof NCM_CONFIG.validDeliveryTypes[number];

// Security: Generic error messages for clients
const GENERIC_ERRORS = {
  VALIDATION: "Invalid request data",
  NOT_FOUND: "Order not found",
  ALREADY_EXISTS: "Shipment already exists for this order",
  BRANCH_INVALID: "Invalid delivery branch",
  SHIPMENT_FAILED: "Failed to create shipment. Please try again or contact support.",
  SERVER_ERROR: "An unexpected error occurred. Please try again.",
};

// errorResponse helper moved inside serve handler to access corsHeaders

// Validate delivery type
const validateDeliveryType = (type: string): DeliveryType | null => {
  if (NCM_CONFIG.validDeliveryTypes.includes(type as DeliveryType)) {
    return type as DeliveryType;
  }
  return null;
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

  // Helper to create error response
  const errorResponse = (genericMessage: string, status = 400, internalDetails?: unknown) => {
    console.error(`NCM Error [${status}]: ${genericMessage}`, internalDetails || '');
    return new Response(JSON.stringify({ success: false, error: genericMessage }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  };

  try {
    const NCM_API_TOKEN = Deno.env.get("NCM_API_TOKEN");
    if (!NCM_API_TOKEN) {
      console.error("NCM_API_TOKEN is not configured");
      return errorResponse(GENERIC_ERRORS.SERVER_ERROR, 500);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      order_id, 
      delivery_type = "Door2Door",
      package_description,
      weight = NCM_CONFIG.defaultWeight,
      cod_confirmed = true
    } = await req.json();

    if (!order_id) {
      return errorResponse(GENERIC_ERRORS.VALIDATION, 400, "Missing order_id");
    }

    // Validate delivery_type strictly
    const validatedDeliveryType = validateDeliveryType(delivery_type);
    if (!validatedDeliveryType) {
      return errorResponse(GENERIC_ERRORS.VALIDATION, 400, `Invalid delivery_type: ${delivery_type}`);
    }

    console.log(`Creating NCM shipment for order: ${order_id}`);
    console.log(`Delivery type: ${validatedDeliveryType}, Weight: ${weight}, COD: ${cod_confirmed}`);

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return errorResponse(GENERIC_ERRORS.NOT_FOUND, 404, orderError);
    }

    // Check if shipment already exists
    if (order.ncm_order_id) {
      return errorResponse(GENERIC_ERRORS.ALREADY_EXISTS, 400, { existing_ncm_id: order.ncm_order_id });
    }

    // Parse shipping address
    const shippingAddress = order.shipping_address as {
      fullName?: string;
      phone?: string;
      phone2?: string;
      city?: string;
      district?: string;
      address?: string;
    };

    // ============ STRICT PAYLOAD VALIDATION ============
    
    // Validate customer name
    const customerName = shippingAddress.fullName?.trim();
    if (!customerName) {
      return errorResponse(GENERIC_ERRORS.VALIDATION, 400, "Missing customer name");
    }

    // Validate primary phone
    const customerPhone = shippingAddress.phone?.trim() || order.guest_phone?.trim();
    if (!customerPhone) {
      return errorResponse(GENERIC_ERRORS.VALIDATION, 400, "Missing phone");
    }

    // Validate address
    const addressParts = [
      shippingAddress.address?.trim(),
      shippingAddress.city?.trim(),
      shippingAddress.district?.trim()
    ].filter(Boolean);
    
    if (addressParts.length === 0) {
      return errorResponse(GENERIC_ERRORS.VALIDATION, 400, "Missing address");
    }
    const fullAddress = addressParts.join(", ");

    // Get destination branch NAME from database
    let destinationBranchName = order.destination_branch?.trim();
    
    if (!destinationBranchName) {
      return errorResponse(GENERIC_ERRORS.BRANCH_INVALID, 400, "Missing destination branch");
    }

    // If destination_branch is stored as ID (number), look up the name
    if (!isNaN(Number(destinationBranchName))) {
      const branchId = Math.floor(Number(destinationBranchName));
      if (!Number.isFinite(branchId) || branchId <= 0) {
        return errorResponse(GENERIC_ERRORS.BRANCH_INVALID, 400, "Branch ID must be a positive integer");
      }
      const { data: branchData, error: branchError } = await supabase
        .from("ncm_branches")
        .select("branch_name")
        .eq("branch_id", branchId)
        .single();
      
      if (branchError || !branchData) {
        return errorResponse(GENERIC_ERRORS.BRANCH_INVALID, 400, branchError);
      }
      destinationBranchName = branchData.branch_name;
      console.log(`Mapped branch ID ${order.destination_branch} to name: ${destinationBranchName}`);
    }

    // Validate destination branch is not empty
    if (!destinationBranchName) {
      return errorResponse(GENERIC_ERRORS.BRANCH_INVALID, 400, "Empty branch name after mapping");
    }

    // Build package description from order items
    const itemsDescription = package_description || order.order_items?.map(
      (item: { product_name: string; size: string; quantity: number }) => 
        `${item.product_name} (${item.size}) x${item.quantity}`
    ).join(", ") || "Jersey";

    // Validate weight
    const packageWeight = Number(weight);
    if (isNaN(packageWeight) || packageWeight <= 0) {
      return errorResponse(GENERIC_ERRORS.VALIDATION, 400, "Invalid weight");
    }

    // Calculate COD charge - force 0 for non-COD payment methods regardless of parameter
    const isCodPayment = order.payment_method === 'cod';
    const codCharge = (isCodPayment && cod_confirmed) ? Number(order.total) : 0;
    if (isCodPayment && cod_confirmed && (isNaN(codCharge) || codCharge <= 0)) {
      return errorResponse(GENERIC_ERRORS.VALIDATION, 400, "Invalid COD charge");
    }
    console.log(`COD calculation: payment_method=${order.payment_method}, cod_confirmed=${cod_confirmed}, codCharge=${codCharge}`);

    // Get alternate phone
    const phone2 = shippingAddress.phone2?.trim() || order.alternate_phone?.trim() || "";

    // ============ BUILD NCM PAYLOAD ============
    // NCM API expects branch NAMES as strings, not IDs
    // NCM has a short limit on vref_id - extract just the unique part (last 8 chars of order number)
    const shortRef = order.order_number?.slice(-8) || order.id.slice(0, 8);
    
    const ncmOrderData = {
      name: customerName,
      phone: customerPhone,
      phone2: phone2,
      address: fullAddress,
      fbranch: NCM_CONFIG.sourceBranch, // Source branch from config
      branch: destinationBranchName,
      delivery_type: validatedDeliveryType,
      instruction: order.delivery_instruction?.trim() || order.notes?.trim() || "",
      package: itemsDescription,
      weight: packageWeight,
      cod_charge: codCharge,
      vref_id: shortRef,
    };

    console.log("NCM order payload prepared for order:", order_id);

    // Create shipment in NCM using v1 API
    const response = await fetch(`${NCM_CONFIG.apiUrl}/api/v1/order/create`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${NCM_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ncmOrderData),
    });

    // Always read response as text first
    const responseText = await response.text();
    console.log("NCM API response status:", response.status);

    if (!response.ok) {
      // Log detailed error server-side only
      console.error("NCM API error response:", responseText.substring(0, 1000));
      return errorResponse(GENERIC_ERRORS.SHIPMENT_FAILED, 502);
    }

    // Try to parse JSON response
    let ncmResponse;
    try {
      ncmResponse = JSON.parse(responseText);
    } catch {
      console.error("NCM returned invalid JSON:", responseText.substring(0, 500));
      return errorResponse(GENERIC_ERRORS.SHIPMENT_FAILED, 502);
    }

    // Extract NCM order ID and tracking ID from response
    const ncmOrderId = ncmResponse.orderid || ncmResponse.order_id || ncmResponse.id;
    const ncmTrackingId = ncmResponse.tracking_id || ncmResponse.trackingid || ncmResponse.tracking || null;

    if (!ncmOrderId) {
      console.error("NCM did not return an order ID:", ncmResponse);
      return errorResponse(GENERIC_ERRORS.SHIPMENT_FAILED, 502);
    }

    // Update order with NCM tracking info
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        ncm_order_id: ncmOrderId,
        ncm_tracking_id: ncmTrackingId,
        ncm_status: ncmResponse.status || "created",
        ncm_created_at: new Date().toISOString(),
        ncm_last_sync: new Date().toISOString(),
        ncm_delivery_type: validatedDeliveryType,
        ncm_package_weight: packageWeight,
        ncm_cod_confirmed: cod_confirmed,
        ncm_vendor_ref: order.order_number,
        status: "shipped",
      })
      .eq("id", order_id);

    if (updateError) {
      console.error("Error updating order:", updateError);
      // Still return success since NCM shipment was created
      return new Response(JSON.stringify({ 
        success: true, 
        warning: "Shipment created but local update failed",
        ncm_order_id: ncmOrderId,
        ncm_tracking_id: ncmTrackingId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Shipment created successfully: NCM Order ID ${ncmOrderId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      ncm_order_id: ncmOrderId,
      ncm_tracking_id: ncmTrackingId,
      status: "shipped",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error in ncm-create-shipment:", error);
    return errorResponse(GENERIC_ERRORS.SERVER_ERROR, 500);
  }
});