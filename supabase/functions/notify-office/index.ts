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
// Resend hard cap is ~40MB total per email; stay under that with headroom.
const MAX_ATTACHMENT_BYTES = 35 * 1024 * 1024;

const VERIFIED_FROM = Deno.env.get("RESEND_FROM"); // e.g. "United Estates Realty <brokerage@unitedestatesagent.com>"
const TEST_RECIPIENT = Deno.env.get("RESEND_TEST_RECIPIENT"); // owner email while domain not verified

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function displayName(stored: string): string {
  const idx = stored.indexOf("__");
  return idx === -1 ? stored : stored.slice(idx + 2);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) throw new Error("RESEND_API_KEY is not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    if (!userData.user) throw new Error("User not authenticated");

    const { dealId, dealAddress, agentName, agentEmail, checklistItems } = await req.json() as {
      dealId: string;
      dealAddress: string;
      agentName: string;
      agentEmail: string;
      checklistItems: { id: string; name: string }[];
    };

    type Attach = { filename: string; content: string; content_type: string };
    type Linked = { checklistItemName: string; fileName: string; url: string };

    const attachments: Attach[] = [];
    const linked: Linked[] = [];
    let totalBytes = 0;

    for (const item of checklistItems || []) {
      const folder = `${CHECKLIST_ROOT}/${dealId}/${item.id}`;
      const { data: files } = await supabaseClient.storage.from(BUCKET).list(folder, { limit: 1000 });
      for (const file of files || []) {
        if (!file.name) continue;
        const storagePath = `${folder}/${file.name}`;
        const { data: blob, error: dlErr } = await supabaseClient.storage.from(BUCKET).download(storagePath);
        if (dlErr || !blob) continue;
        const buf = new Uint8Array(await blob.arrayBuffer());
        const fname = displayName(file.name);
        if (totalBytes + buf.byteLength > MAX_ATTACHMENT_BYTES) {
          const { data: urlData } = supabaseClient.storage.from(BUCKET).getPublicUrl(storagePath);
          linked.push({ checklistItemName: item.name, fileName: fname, url: urlData.publicUrl });
          continue;
        }
        totalBytes += buf.byteLength;
        attachments.push({
          filename: fname,
          content: bytesToBase64(buf),
          content_type: (blob as Blob).type || "application/octet-stream",
        });
      }
    }

    const linkedRows = linked.length === 0
      ? ""
      : `<h3 style="color:#111827;font-size:15px;margin:24px 0 8px;">Too large to attach — download links</h3>
         <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
           <tbody>${linked.map((d) => `
             <tr>
               <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:14px;">${d.checklistItemName}</td>
               <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;"><a href="${d.url}" style="color:#4F46E5;font-size:14px;">${d.fileName}</a></td>
             </tr>`).join("")}
           </tbody>
         </table>`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:20px;">
        <div style="background:#1a1a2e;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:20px;">United Estates Realty</h1>
          <p style="color:#a5b4fc;margin:6px 0 0;font-size:13px;">Deal Submitted to Office</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
          <h2 style="color:#111827;margin-top:0;font-size:18px;">New Deal Submission</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;width:140px;">Property</td><td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;">${dealAddress || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Agent</td><td style="padding:6px 0;color:#111827;font-size:14px;">${agentName || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Agent Email</td><td style="padding:6px 0;color:#111827;font-size:14px;">${agentEmail || "—"}</td></tr>
            <tr><td style="padding:6px 0;color:#6b7280;font-size:13px;">Deal ID</td><td style="padding:6px 0;color:#6b7280;font-size:12px;font-family:monospace;">${dealId}</td></tr>
          </table>
          <p style="color:#374151;font-size:14px;margin:0 0 8px;"><strong>${attachments.length}</strong> document(s) attached.</p>
          ${linkedRows}
        </div>
        <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">United Estates Realty · Brokerage Notification</div>
      </div>`;

    const from = VERIFIED_FROM || "United Estates Realty <onboarding@resend.dev>";
    // onboarding@resend.dev can only deliver to the Resend account owner.
    // If no verified domain is set, redirect to RESEND_TEST_RECIPIENT (if provided).
    const to = VERIFIED_FROM
      ? [OFFICE_EMAIL]
      : (TEST_RECIPIENT ? [TEST_RECIPIENT] : [OFFICE_EMAIL]);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: agentEmail || undefined,
        subject: `Deal Submitted: ${dealAddress || dealId}`,
        html,
        attachments,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Resend error (${res.status}): ${text}`);
    }

    return new Response(
      JSON.stringify({ success: true, attachmentCount: attachments.length, linkedCount: linked.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("notify-office error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
