import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OFFICE_EMAIL = 'brokerage@unitedestatesagent.com';
const BUCKET = 'deal-photos';

function displayName(stored: string): string {
  const idx = stored.indexOf('__');
  return idx === -1 ? stored : stored.slice(idx + 2);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { dealId } = await req.json();
    if (!dealId) {
      return new Response(JSON.stringify({ error: 'dealId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const user = Deno.env.get('GMAIL_USER');
    const pass = Deno.env.get('GMAIL_APP_PASSWORD');
    if (!user || !pass) {
      return new Response(JSON.stringify({ error: 'GMAIL_USER / GMAIL_APP_PASSWORD not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: deal } = await admin
      .from('deals')
      .select('address, city, state, zip, mls_number, status, price')
      .eq('id', dealId)
      .maybeSingle();

    const root = `checklist-documents/${dealId}`;
    const { data: itemFolders, error: listErr } = await admin.storage
      .from(BUCKET)
      .list(root, { limit: 1000 });
    if (listErr && !`${listErr.message}`.toLowerCase().includes('not found')) {
      throw listErr;
    }

    const attachments: { filename: string; content: Uint8Array; contentType: string; encoding: 'binary' }[] = [];
    for (const entry of itemFolders || []) {
      if (!entry.name) continue;
      const sub = `${root}/${entry.name}`;
      const { data: files } = await admin.storage.from(BUCKET).list(sub, { limit: 1000 });
      for (const f of files || []) {
        if (!f.name) continue;
        const path = `${sub}/${f.name}`;
        const { data: blob, error: dlErr } = await admin.storage.from(BUCKET).download(path);
        if (dlErr || !blob) continue;
        const buf = new Uint8Array(await blob.arrayBuffer());
        attachments.push({
          filename: displayName(f.name),
          content: buf,
          contentType: (blob as Blob).type || 'application/octet-stream',
          encoding: 'binary',
        });
      }
    }

    const addressLine = deal
      ? `${deal.address || ''}${deal.city ? ', ' + deal.city : ''}${deal.state ? ', ' + deal.state : ''} ${deal.zip || ''}`.trim()
      : dealId;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width:640px; margin:0 auto; padding:20px;">
        <div style="background:#0f1b3d;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:20px;">Deal Sent to Office</h1>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;">
          <p style="color:#111827;margin:0 0 8px;font-weight:600;">${addressLine}</p>
          ${deal?.mls_number ? `<p style="color:#374151;margin:0 0 4px;">MLS #: ${deal.mls_number}</p>` : ''}
          ${deal?.status ? `<p style="color:#374151;margin:0 0 4px;">Status: ${deal.status}</p>` : ''}
          ${deal?.price ? `<p style="color:#374151;margin:0 0 4px;">Price: $${deal.price}</p>` : ''}
          <p style="color:#4b5563;margin-top:16px;">${attachments.length} document(s) attached.</p>
        </div>
      </div>
    `;

    const client = new SMTPClient({
      connection: {
        hostname: 'smtp.gmail.com',
        port: 465,
        tls: true,
        auth: { username: user, password: pass },
      },
    });

    try {
      await client.send({
        from: `United Estates Realty <${user}>`,
        to: OFFICE_EMAIL,
        subject: `Deal Sent to Office: ${addressLine}`,
        content: `${attachments.length} document(s) attached.`,
        html,
        attachments,
      });
    } finally {
      await client.close();
    }

    return new Response(JSON.stringify({ success: true, attachmentCount: attachments.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-to-office error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});