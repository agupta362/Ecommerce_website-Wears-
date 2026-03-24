import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { BUSINESS_CONFIG, corsHeaders } from "../_shared/config.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const results = { reviewRequests: 0, reEngagement: 0, errors: [] as string[] };

    // 1. Review request emails: orders delivered 2+ days ago, no review_request sent yet
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: deliveredOrders } = await supabase
      .from("orders")
      .select("id, user_id, guest_email, order_number, created_at")
      .eq("status", "delivered")
      .lt("updated_at", twoDaysAgo)
      .not("user_id", "is", null)
      .limit(50);

    for (const order of deliveredOrders || []) {
      const { data: existing } = await supabase
        .from("email_sequences")
        .select("id")
        .eq("order_id", order.id)
        .eq("email_type", "review_request")
        .maybeSingle();

      if (existing) continue;

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", order.user_id)
        .maybeSingle();

      const email = profile?.email || order.guest_email;
      if (!email) continue;

      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name, product_image")
        .eq("order_id", order.id)
        .limit(3);

      const productNames = orderItems?.map(i => i.product_name).join(", ") || "your recent purchase";

      if (resendApiKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: BUSINESS_CONFIG.fromEmail,
              to: [email],
              subject: `How was ${productNames}? Leave a review! ⭐`,
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <h2>Hey ${profile?.full_name || "there"}! 👋</h2>
                  <p>Your order <strong>${order.order_number}</strong> has been delivered. We hope you love it!</p>
                  <p>Would you mind leaving a quick review? It helps other fans find the perfect kit.</p>
                  <p><strong>Items:</strong> ${productNames}</p>
                  <div style="text-align:center;margin:24px 0">
                    <a href="${BUSINESS_CONFIG.domain}/account" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold">Leave a Review ⭐</a>
                  </div>
                  <p style="color:#666;font-size:12px">Thank you for supporting ${BUSINESS_CONFIG.name}!</p>
                </div>
              `,
            }),
          });
          results.reviewRequests++;
        } catch (e) {
          results.errors.push(`Review email failed for ${order.id}: ${e.message}`);
        }
      }

      await supabase.from("email_sequences").insert({
        order_id: order.id,
        user_id: order.user_id,
        email_type: "review_request",
        scheduled_for: twoDaysAgo,
        sent_at: new Date().toISOString(),
      });

      await supabase.from("marketing_emails_log").insert({
        recipient_email: email,
        email_type: "review_request",
        reference_id: order.id,
      });
    }

    // 2. Re-engagement emails: users whose last order was 30+ days ago
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: staleUsers } = await supabase
      .from("orders")
      .select("user_id")
      .eq("status", "delivered")
      .not("user_id", "is", null)
      .lt("created_at", thirtyDaysAgo)
      .limit(50);

    const uniqueUserIds = [...new Set((staleUsers || []).map(o => o.user_id).filter(Boolean))];

    for (const userId of uniqueUserIds) {
      const { data: recentOrder } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", userId)
        .gte("created_at", thirtyDaysAgo)
        .limit(1);

      if (recentOrder && recentOrder.length > 0) continue;

      const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const { data: alreadySent } = await supabase
        .from("marketing_emails_log")
        .select("id")
        .eq("email_type", "re_engagement")
        .gte("sent_at", sixtyDaysAgo)
        .limit(1);

      if (alreadySent && alreadySent.length > 0) continue;

      const { data: profile } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", userId)
        .maybeSingle();

      if (!profile?.email) continue;

      const { data: featured } = await supabase
        .from("products")
        .select("name, slug, price, images")
        .eq("is_active", true)
        .eq("is_featured", true)
        .limit(3);

      const productHtml = (featured || []).map(p => 
        `<div style="display:inline-block;width:30%;text-align:center;margin:8px">
          ${p.images?.[0] ? `<img src="${p.images[0]}" style="width:100%;border-radius:8px" />` : ''}
          <p style="font-size:14px;font-weight:bold">${p.name}</p>
          <p style="color:#666">NPR ${p.price.toLocaleString()}</p>
        </div>`
      ).join('');

      if (resendApiKey) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: BUSINESS_CONFIG.fromEmail,
              to: [profile.email],
              subject: "We miss you! 🏟️ Check out what's new",
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px">
                  <h2>Hey ${profile.full_name || "Legend"}! 🏟️</h2>
                  <p>It's been a while since your last order. We've got fresh kits waiting for you!</p>
                  ${productHtml ? `<h3>Recommended for you:</h3><div>${productHtml}</div>` : ''}
                  <div style="text-align:center;margin:24px 0">
                    <a href="${BUSINESS_CONFIG.domain}/shop" style="background:#000;color:#fff;padding:12px 24px;text-decoration:none;font-weight:bold">Shop New Arrivals</a>
                  </div>
                  <p style="color:#666;font-size:12px">${BUSINESS_CONFIG.name} — Wear the Legacy</p>
                </div>
              `,
            }),
          });
          results.reEngagement++;
        } catch (e) {
          results.errors.push(`Re-engagement failed for ${userId}: ${e.message}`);
        }
      }

      await supabase.from("marketing_emails_log").insert({
        recipient_email: profile.email,
        email_type: "re_engagement",
      });
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
