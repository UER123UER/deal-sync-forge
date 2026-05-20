import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const OFFICE_EMAIL = "brokerage@unitedestatesagent.com";
const BUCKET = "deal-photos";
const CHECKLIST_ROOT = "checklist-documents";

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

    const { dealId, dealAddress, agentName, agentEmail, checklistItems } = await req.json() as {
      dealId: string;
      dealAddress: string;
      agentName: string;
      agentEmail: string;
      checklistItems: { id: string; name: string }[];
    };

    // Collect all uploaded documents across checklist items
    const documents: { checklistItemName: string; fileName: string; url: string }[] = [];

    for (const item of checklistItems) {
      const folder = `${CHECKLIST_ROOT}/${dealId}/${item.id}`;
      const { data: files } = await supabaseClient.storage.from(BUCKET).list(folder);
      if (!files || files.length === 0) continue;
      for (const file of files) {
        if (!file.name) continue;
        const storagePath = `${folder}/${file.name}`;
        const { data: urlData } = supabaseClient.storage.from(BUCKET).getPublicUrl(storagePath);
        // Strip the timestamp prefix added during upload (format: timestamp-randomhex__originalname)
        const separatorIndex = file.name.indexOf("__");
        const displayName = separatorIndex === -1 ? file.name : file.name.slice(separatorIndex + 2);
        documents.push({
          checklistItemName: item.name,
          fileName: displayName,
          url: urlData.publicUrl,
        });
      }
    }

    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    if (!smtpUser || !smtpPass) throw new Error("SMTP credentials not configured");

    const docListHtml = documents.length > 0
      ? documents.map((d) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;">${d.checklistItemName}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">
              <a href="${d.url}" style="color:#4F46E5;text-decoration:none;font-size:14px;">${d.fileName}</a>
            </td>
          </tr>`
        ).join("")
      : `<tr><td colspan="2" style="padding:12px;color:#6b7280;font-size:14px;">No documents uploaded yet.</td></tr>`;

    const htmlBody = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;">
        <div style="background:#1a1a2e;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:20px;">United Estates Realty</h1>
          <p style="color:#a5b4fc;margin:6px 0 0;font-size:13px;">Deal Submitted to Office</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
          <h2 style="color:#111827;margin-top:0;font-size:18px;">New Deal Submission</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;">Property</td><td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${dealAddress || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Agent</td><td style="padding:6px 0;color:#111827;font-size:14px;">${agentName || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Agent Email</td><td style="padding:6px 0;color:#111827;font-size:14px;">${agentEmail || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Deal ID</td><td style="padding:6px 0;color:#6b7280;font-size:12px;font-family:monospace;">${dealId}</td></tr>
          </table>

          <h3 style="color:#111827;font-size:15px;margin-bottom:12px;">Uploaded Documents (${documents.length})</h3>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Checklist Item</th>
                <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">File</th>
              </tr>
            </thead>
            <tbody>${docListHtml}</tbody>
          </table>
        </div>
        <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">
          United Estates Realty · Brokerage Notification System
        </div>
      </div>
    `;

    const response = await fetch("https://mail.zoho.com/api/accounts/self/messages", {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${smtpPass}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fromAddress: smtpUser,
        toAddress: OFFICE_EMAIL,
        subject: `Deal Submitted: ${dealAddress || dealId}`,
        content: htmlBody,
        askReceipt: "no",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Email send failed: ${text}`);
    }

    return new Response(JSON.stringify({ success: true, documentCount: documents.length }), {
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
