import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OFFICE_EMAIL = "brokerage@unitedestatesagent.com";

async function sendEmail(to: string, subject: string, html: string, replyTo?: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "United Estates Realty <onboarding@resend.dev>",
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error: ${text}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { firstName, lastName, email, licenseNumber, referredByCode } = await req.json() as {
      firstName: string;
      lastName: string;
      email: string;
      licenseNumber?: string;
      referredByCode?: string;
    };

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:#1a1a2e;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:20px;">United Estates Realty</h1>
          <p style="color:#a5b4fc;margin:6px 0 0;font-size:13px;">New Agent Sign-Up</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
          <h2 style="color:#111827;margin-top:0;font-size:18px;">A new agent just signed up</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;">Name</td><td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${firstName} ${lastName}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Email</td><td style="padding:6px 0;color:#111827;font-size:14px;">${email}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">License Number</td><td style="padding:6px 0;color:#111827;font-size:14px;">${licenseNumber || "—"}</td></tr>
            ${referredByCode ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Referred By</td><td style="padding:6px 0;color:#111827;font-size:14px;">${referredByCode}</td></tr>` : ""}
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Signed Up At</td><td style="padding:6px 0;color:#111827;font-size:14px;">${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET</td></tr>
          </table>
        </div>
        <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">United Estates Realty · Brokerage Notification</div>
      </div>`;

    await sendEmail(OFFICE_EMAIL, `New Agent Sign-Up: ${firstName} ${lastName}`, html);

    // Welcome email to the new agent
    const welcomeHtml = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:#1a1a2e;padding:28px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">Welcome to United Estates Realty</h1>
          <p style="color:#a5b4fc;margin:8px 0 0;font-size:13px;">100% Commission · $98/month</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <h2 style="color:#111827;margin-top:0;font-size:18px;">Hi ${firstName},</h2>
          <p style="color:#374151;font-size:14px;line-height:1.6;">
            Welcome aboard! Your United Estates Realty agent account is now active. You can sign in
            anytime to manage listings, transactions, contacts, signing sessions, and brokerage workflows.
          </p>
          <p style="text-align:center;margin:28px 0;">
            <a href="https://unitedestatesagent.com/auth"
               style="background:#1a1a2e;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;font-size:14px;display:inline-block;">
              Sign in to your account
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px;line-height:1.6;">
            Next steps: complete your onboarding agreement, set up billing, and submit your first deal.
            Questions? Reply to this email or reach out to <a href="mailto:brokerage@unitedestatesagent.com" style="color:#4f46e5;">brokerage@unitedestatesagent.com</a>.
          </p>
        </div>
        <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">United Estates Realty</div>
      </div>`;

    try {
      await sendEmail(email, "Welcome to United Estates Realty", welcomeHtml, OFFICE_EMAIL);
    } catch (welcomeErr) {
      console.error("welcome email failed", welcomeErr);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
