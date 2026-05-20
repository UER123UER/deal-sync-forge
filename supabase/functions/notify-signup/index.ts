import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OFFICE_EMAIL = "brokerage@unitedestatesagent.com";

async function sendGmail(
  user: string,
  appPassword: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const conn = await Deno.connectTls({ hostname: "smtp.gmail.com", port: 465 });
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  async function read(): Promise<string> {
    const buf = new Uint8Array(4096);
    const n = await conn.read(buf);
    return n ? dec.decode(buf.subarray(0, n)) : "";
  }
  async function cmd(s: string): Promise<string> {
    await conn.write(enc.encode(s + "\r\n"));
    return await read();
  }

  await read(); // greeting
  await cmd("EHLO localhost");
  await cmd("AUTH LOGIN");
  await cmd(btoa(user));
  await cmd(btoa(appPassword));
  await cmd(`MAIL FROM:<${user}>`);
  await cmd(`RCPT TO:<${to}>`);
  await cmd("DATA");

  const msg = [
    `From: United Estates Realty <${user}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    html,
    `.`,
  ].join("\r\n");

  await conn.write(enc.encode(msg + "\r\n"));
  await read();
  await cmd("QUIT");
  conn.close();
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

    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    if (!smtpUser || !smtpPass) throw new Error("SMTP credentials not configured");

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
            ${referredByCode ? `<tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Referred By Code</td><td style="padding:6px 0;color:#111827;font-size:14px;">${referredByCode}</td></tr>` : ""}
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Signed Up At</td><td style="padding:6px 0;color:#111827;font-size:14px;">${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET</td></tr>
          </table>
        </div>
        <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">United Estates Realty · Brokerage Notification</div>
      </div>`;

    await sendGmail(smtpUser, smtpPass, OFFICE_EMAIL, `New Agent Sign-Up: ${firstName} ${lastName}`, html);

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
