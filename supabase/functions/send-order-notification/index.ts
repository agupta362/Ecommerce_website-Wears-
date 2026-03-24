import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders, BUSINESS_CONFIG } from "../_shared/config.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Security: Sanitize log input to prevent log injection
const sanitizeForLog = (input: unknown): string => {
  if (typeof input !== 'string') return String(input).slice(0, 100);
  return input.replace(/[\n\r\t]/g, ' ').slice(0, 100);
};

interface OrderItem {
  productName: string;
  productImage: string | null;
  size: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  phone2?: string;
  district: string;
  city: string;
  address: string;
}

interface OrderNotificationRequest {
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  giftWrapCost: number;
  discountAmount: number;
  total: number;
  giftWrap: boolean;
  giftMessage?: string;
  discountCode?: string;
  notes?: string;
  guestEmail?: string;
  guestPhone?: string;
  createdAt: string;
  alternatePhone?: string;
  deliveryInstruction?: string;
}

const formatCurrency = (amount: number): string => {
  return `Rs. ${amount.toLocaleString('en-NP')}`;
};

const formatPaymentMethod = (method: string): string => {
  const methods: Record<string, string> = {
    cod: 'Cash on Delivery',
    bank_transfer: 'Bank Transfer',
    esewa: 'eSewa',
    khalti: 'Khalti',
  };
  return methods[method] || method;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const orderData: OrderNotificationRequest = await req.json();
    
    console.log("Received order notification request:", sanitizeForLog(orderData.orderNumber));

    const itemsHtml = orderData.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.productName}</strong><br/>
          <span style="color: #6b7280;">Size: ${item.size}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
      </tr>
    `).join('');

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
      <div style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <div style="background: linear-gradient(135deg, #dc2626, #991b1b); color: #ffffff; padding: 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🆕 New Order Received!</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 18px; font-weight: bold;">${orderData.orderNumber}</p>
        </div>
        <div style="padding: 24px;">
          <p style="color: #6b7280; margin: 0 0 20px 0; text-align: center;">⏰ ${formatDate(orderData.createdAt)}</p>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 12px 0; font-size: 16px; color: #374151;">👤 Customer Details</h2>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${orderData.shippingAddress.fullName}</p>
            <p style="margin: 4px 0;"><strong>Phone:</strong> ${orderData.shippingAddress.phone}</p>
            ${orderData.shippingAddress.phone2 || orderData.alternatePhone ? `<p style="margin: 4px 0;"><strong>Alt. Phone:</strong> ${orderData.shippingAddress.phone2 || orderData.alternatePhone}</p>` : ''}
            ${orderData.guestEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> ${orderData.guestEmail}</p>` : ''}
          </div>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 12px 0; font-size: 16px; color: #374151;">📍 Shipping Address</h2>
            <p style="margin: 0;">${orderData.shippingAddress.address}<br/>${orderData.shippingAddress.city}, ${orderData.shippingAddress.district}</p>
          </div>
          ${orderData.deliveryInstruction ? `
          <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 8px 0; font-size: 16px; color: #92400e;">🚚 Delivery Instructions</h2>
            <p style="margin: 0; color: #78350f;">${orderData.deliveryInstruction}</p>
          </div>` : ''}
          <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 12px 0; font-size: 16px; color: #374151;">🛒 Order Items</h2>
            <table style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px; overflow: hidden;">
              <thead><tr style="background-color: #e5e7eb;"><th style="padding: 12px; text-align: left;">Item</th><th style="padding: 12px; text-align: center;">Qty</th><th style="padding: 12px; text-align: right;">Price</th></tr></thead>
              <tbody>${itemsHtml}</tbody>
            </table>
          </div>
          <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
            <h2 style="margin: 0 0 12px 0; font-size: 16px; color: #374151;">💳 Payment Summary</h2>
            <table style="width: 100%;">
              <tr><td style="padding: 4px 0;">Payment Method:</td><td style="text-align: right; font-weight: bold;">${formatPaymentMethod(orderData.paymentMethod)}</td></tr>
              <tr><td style="padding: 4px 0;">Subtotal:</td><td style="text-align: right;">${formatCurrency(orderData.subtotal)}</td></tr>
              ${orderData.discountAmount > 0 ? `<tr><td style="padding: 4px 0; color: #059669;">Discount${orderData.discountCode ? ` (${orderData.discountCode})` : ''}:</td><td style="text-align: right; color: #059669;">-${formatCurrency(orderData.discountAmount)}</td></tr>` : ''}
              <tr><td style="padding: 4px 0;">Shipping:</td><td style="text-align: right;">${orderData.shippingCost === 0 ? 'FREE' : formatCurrency(orderData.shippingCost)}</td></tr>
              ${orderData.giftWrap ? `<tr><td style="padding: 4px 0;">🎁 Gift Wrap:</td><td style="text-align: right;">${formatCurrency(orderData.giftWrapCost)}</td></tr>` : ''}
              <tr style="border-top: 2px solid #e5e7eb;"><td style="padding: 12px 0 4px 0; font-size: 18px; font-weight: bold;">TOTAL:</td><td style="text-align: right; font-size: 18px; font-weight: bold; color: #dc2626;">${formatCurrency(orderData.total)}</td></tr>
            </table>
          </div>
          ${orderData.giftWrap && orderData.giftMessage ? `<div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin-bottom: 20px;"><h2 style="margin: 0 0 8px 0; font-size: 16px; color: #92400e;">🎁 Gift Message</h2><p style="margin: 0; font-style: italic; color: #78350f;">"${orderData.giftMessage}"</p></div>` : ''}
          ${orderData.notes ? `<div style="background-color: #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 20px;"><h2 style="margin: 0 0 8px 0; font-size: 16px; color: #1e40af;">📝 Customer Notes</h2><p style="margin: 0; color: #1e3a8a;">${orderData.notes}</p></div>` : ''}
        </div>
        <div style="background-color: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${BUSINESS_CONFIG.name} - Admin Order Notification</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(JSON.stringify({ success: false, error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const fromEmail = BUSINESS_CONFIG.fromEmail;
    const toEmail = BUSINESS_CONFIG.adminEmail;

    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `🆕 New Order: ${orderData.orderNumber} - ${formatCurrency(orderData.total)}`,
      html: emailHtml,
    });

    console.log("Resend API response:", JSON.stringify(emailResponse));

    if ('error' in emailResponse && emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return new Response(JSON.stringify({ success: false, error: "Failed to send email", details: emailResponse.error }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Admin notification email sent successfully");

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-order-notification function:", sanitizeForLog(errorMessage));
    return new Response(
      JSON.stringify({ error: "Failed to send notification", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(null) } }
    );
  }
};

serve(handler);
