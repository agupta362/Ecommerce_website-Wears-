import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { getCorsHeaders, BUSINESS_CONFIG } from "../_shared/config.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

// Security: Sanitize log input to prevent log injection
const sanitizeForLog = (input: unknown): string => {
  if (typeof input !== 'string') return String(input).slice(0, 100);
  return input.replace(/[\n\r\t]/g, ' ').slice(0, 100);
};

interface EmailPayload {
  user: {
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    const { user, email_data } = payload;
    
    console.log("Processing email for:", sanitizeForLog(user.email));
    console.log("Email action type:", sanitizeForLog(email_data.email_action_type));

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const userName = user.user_metadata?.full_name || "there";
    const actionType = email_data.email_action_type;
    
    let redirectUrl = BUSINESS_CONFIG.domain;
    if (actionType === "recovery") {
      redirectUrl = `${BUSINESS_CONFIG.domain}/reset-password`;
    }
    
    const verifyLink = `${supabaseUrl}/auth/v1/verify?token=${email_data.token_hash}&type=${actionType}&redirect_to=${redirectUrl}`;

    let subject: string;
    let heading: string;
    let messageText: string;
    let buttonText: string;

    if (actionType === "recovery") {
      subject = `Reset Your Password - ${BUSINESS_CONFIG.name}`;
      heading = "Reset Your Password";
      messageText = "You requested to reset your password. Click the button below to set a new password for your account.";
      buttonText = "RESET PASSWORD";
    } else {
      subject = `Confirm Your Email - ${BUSINESS_CONFIG.name}`;
      heading = `Welcome to ${BUSINESS_CONFIG.name}! 👋`;
      messageText = "Thanks for signing up! Please confirm your email address to complete your registration and start shopping.";
      buttonText = "CONFIRM EMAIL";
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 2px;">${BUSINESS_CONFIG.name.toUpperCase()}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px; color: #1a1a1a; font-size: 24px;">${heading}</h2>
                      <p style="margin: 0 0 20px; color: #555555; font-size: 16px; line-height: 1.6;">Hey ${userName},</p>
                      <p style="margin: 0 0 30px; color: #555555; font-size: 16px; line-height: 1.6;">${messageText}</p>
                      <table role="presentation" style="width: 100%; border-collapse: collapse;">
                        <tr>
                          <td align="center">
                            <a href="${verifyLink}" style="display: inline-block; padding: 16px 40px; background-color: #c41e3a; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 16px; border-radius: 6px; letter-spacing: 1px;">${buttonText}</a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 30px 0 0; color: #888888; font-size: 14px; line-height: 1.6;">If the button doesn't work, copy and paste this link into your browser:</p>
                      <p style="margin: 10px 0 0; word-break: break-all;">
                        <a href="${verifyLink}" style="color: #c41e3a; font-size: 12px;">${verifyLink}</a>
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0 0 10px; color: #888888; font-size: 14px;">© ${new Date().getFullYear()} ${BUSINESS_CONFIG.name}. All rights reserved.</p>
                      <p style="margin: 0; color: #aaaaaa; font-size: 12px;">
                        ${actionType === "recovery" 
                          ? "If you didn't request a password reset, you can safely ignore this email."
                          : "If you didn't create an account, you can safely ignore this email."}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: BUSINESS_CONFIG.fromEmail,
      to: [user.email],
      subject: subject,
      html: emailHtml,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-confirmation-email:", sanitizeForLog(errorMessage));
    return new Response(
      JSON.stringify({ error: "Failed to send email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(null) },
      }
    );
  }
};

serve(handler);
