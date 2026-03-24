import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, BUSINESS_CONFIG } from "../_shared/config.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Time thresholds in milliseconds
const FIRST_REMINDER_THRESHOLD = 60 * 60 * 1000; // 1 hour
const SECOND_REMINDER_THRESHOLD = 24 * 60 * 60 * 1000; // 24 hours

interface CartItem {
  product_name: string;
  product_image: string;
  size: string;
  quantity: number;
  price: number;
}

interface AbandonedCart {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  items: CartItem[];
  cart_total: number;
  created_at: string;
  first_reminder_sent_at: string | null;
  second_reminder_sent_at: string | null;
  discount_code: string | null;
}

async function sendRecoveryEmail(
  to: string,
  cart: AbandonedCart,
  isSecondReminder: boolean,
  discountCode?: string
) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return null;
  }

  const items = cart.items as CartItem[];
  const itemsList = items
    .map((item) => `• ${item.product_name} (${item.size}) x${item.quantity}`)
    .join("\n");

  const subject = isSecondReminder
    ? `🎁 Here's 5% OFF to complete your order at ${BUSINESS_CONFIG.name}!`
    : `Hey, you left something behind at ${BUSINESS_CONFIG.name}!`;

  const discountMessage = discountCode
    ? `\n\nUse code ${discountCode} for 5% off your order!`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #000; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 24px;">${BUSINESS_CONFIG.name}</h1>
        </div>
        
        <div style="background-color: #fff; padding: 30px;">
          <h2 style="color: #000; margin: 0 0 20px 0;">
            ${isSecondReminder ? "🎁 Don't miss out! Here's a special offer" : "You left some classics in your cart!"}
          </h2>
          
          <p style="color: #555; line-height: 1.6;">
            ${isSecondReminder
              ? "We noticed you haven't completed your order. As a special offer, here's 5% off to help you get those retro kits you were eyeing!"
              : "Your cart is waiting for you. Complete your order before these legendary kits are gone!"}
          </p>
          
          ${discountCode ? `
          <div style="background-color: #f0f9ff; border: 2px dashed #0ea5e9; padding: 15px; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 5px 0; font-size: 14px; color: #555;">Your exclusive discount code:</p>
            <p style="margin: 0; font-size: 24px; font-weight: bold; color: #0ea5e9;">${discountCode}</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #888;">5% off your entire order</p>
          </div>
          ` : ""}
          
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #000; font-size: 16px;">Your Cart:</h3>
            ${items.map((item) => `
              <div style="display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee;">
                <div style="flex: 1;">
                  <p style="margin: 0; font-weight: bold; color: #000;">${item.product_name}</p>
                  <p style="margin: 2px 0 0 0; font-size: 12px; color: #888;">Size: ${item.size} | Qty: ${item.quantity}</p>
                </div>
                <p style="margin: 0; font-weight: bold; color: #000;">Rs. ${(item.price * item.quantity).toLocaleString()}</p>
              </div>
            `).join("")}
            <div style="padding-top: 15px; text-align: right;">
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #000;">
                Total: Rs. ${cart.cart_total.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${BUSINESS_CONFIG.domain}/shop" style="display: inline-block; background-color: #000; color: #fff; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
              Complete Your Order
            </a>
          </div>
          
          <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">
            Need help? Reply to this email or contact us at ${BUSINESS_CONFIG.email}
          </p>
        </div>
        
        <div style="padding: 20px; text-align: center; color: #888; font-size: 12px;">
          <p style="margin: 0;">© ${new Date().getFullYear()} ${BUSINESS_CONFIG.name}</p>
          <p style="margin: 5px 0 0 0;">${BUSINESS_CONFIG.domain}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: BUSINESS_CONFIG.fromEmail,
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Resend API error:", errorText);
      return null;
    }

    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Failed to send email:", error);
    return null;
  }
}

async function generateDiscountCode(supabase: ReturnType<typeof createClient>, cartId: string): Promise<string> {
  const code = `COMEBACK-${cartId.slice(0, 8).toUpperCase()}`;
  
  // Create discount code in database
  await supabase.from("discount_codes").insert({
    code,
    description: "Abandoned cart recovery - 5% off",
    discount_type: "percentage",
    discount_value: 5,
    is_active: true,
    max_uses: 1,
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Valid for 7 days
  });

  return code;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const now = Date.now();
    
    // Find abandoned carts that need reminders
    const { data: abandonedCarts, error: fetchError } = await supabase
      .from("abandoned_carts")
      .select("*")
      .is("recovered_at", null)
      .order("created_at", { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    const stats = {
      checked: abandonedCarts?.length || 0,
      firstReminders: 0,
      secondReminders: 0,
      errors: 0,
    };

    for (const cart of abandonedCarts || []) {
      const cartAge = now - new Date(cart.created_at).getTime();
      
      // Get recipient email
      let recipientEmail: string | null = cart.guest_email;
      
      if (!recipientEmail && cart.user_id) {
        // Fetch user email from profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", cart.user_id)
          .single();
        
        recipientEmail = profile?.email || null;
      }

      if (!recipientEmail) {
        console.log(`No email for cart ${cart.id}, skipping`);
        continue;
      }

      // Check if we need to send first reminder (after 1 hour)
      if (!cart.first_reminder_sent_at && cartAge >= FIRST_REMINDER_THRESHOLD) {
        console.log(`Sending first reminder for cart ${cart.id}`);
        
        const resendId = await sendRecoveryEmail(recipientEmail, cart as AbandonedCart, false);
        
        if (resendId) {
          await supabase
            .from("abandoned_carts")
            .update({ first_reminder_sent_at: new Date().toISOString() })
            .eq("id", cart.id);

          await supabase.from("marketing_emails_log").insert({
            recipient_email: recipientEmail,
            email_type: "abandoned_cart_first",
            reference_id: cart.id,
            resend_id: resendId,
          });

          stats.firstReminders++;
        } else {
          stats.errors++;
        }
      }
      
      // Check if we need to send second reminder with discount (after 24 hours)
      else if (
        cart.first_reminder_sent_at &&
        !cart.second_reminder_sent_at &&
        cartAge >= SECOND_REMINDER_THRESHOLD
      ) {
        console.log(`Sending second reminder with discount for cart ${cart.id}`);
        
        // Generate discount code if not already created
        let discountCode = cart.discount_code;
        if (!discountCode) {
          discountCode = await generateDiscountCode(supabase, cart.id);
          await supabase
            .from("abandoned_carts")
            .update({ discount_code: discountCode })
            .eq("id", cart.id);
        }
        
        const resendId = await sendRecoveryEmail(recipientEmail, cart as AbandonedCart, true, discountCode);
        
        if (resendId) {
          await supabase
            .from("abandoned_carts")
            .update({ second_reminder_sent_at: new Date().toISOString() })
            .eq("id", cart.id);

          await supabase.from("marketing_emails_log").insert({
            recipient_email: recipientEmail,
            email_type: "abandoned_cart_second",
            reference_id: cart.id,
            resend_id: resendId,
          });

          stats.secondReminders++;
        } else {
          stats.errors++;
        }
      }
    }

    console.log("Abandoned cart check complete:", stats);

    return new Response(
      JSON.stringify({ success: true, stats }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-abandoned-carts:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
