import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OFFICE_EMAIL = 'brokerage@unitedestatesagent.com';
const BUCKET = 'deal-photos';

function chunkBase64(b64: string, size = 76): string {
  const lines: string[] = [];
  for (let i = 0; i < b64.length; i += size) lines.push(b64.slice(i, i + size));
  return lines.join('\r\n');
}

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function displayName(stored: string): string {
  const idx = stored.indexOf('__');
  return idx === -1 ? stored : stored.slice(idx + 2);
}

async function sendMailWithAttachments(opts: {
  user: string;
  pass: string;
  to: string;
  subject: string;
  html: string;
  attachments: { filename: string; content: Uint8Array; mime: string }[];
}) {
  const conn = await Deno.connectTls({ hostname: 'smtp.zoho.com', port: 465 });
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  async function read() {
    const buf = new Uint8Array(8192);
    const n = await conn.read(buf);
    return n ? decoder.decode(buf.subarray(0, n)) : '';
  }
  async function cmd(c: string) {
    await conn.write(encoder.encode(c + '\r\n'));
    return await read();
  }
  async function writeRaw(s: string) {
    // Chunk large writes
    const data = encoder.encode(s);
    let offset = 0;
    while (offset < data.length) {
      const slice = data.subarray(offset, offset + 16384);
      await conn.write(slice);
      offset += slice.length;
    }
  }

  await read();
  await cmd('EHLO localhost');
  await cmd('AUTH LOGIN');
  await cmd(btoa(opts.user));
  await cmd(btoa(opts.pass));
  await cmd(`MAIL FROM:<${opts.user}>`);
  await cmd(`RCPT TO:<${opts.to}>`);
  await cmd('DATA');

  const boundary = `----=_Part_${crypto.randomUUID()}`;
  const headers = [
    `From: United Estates Realty <${opts.user}>`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    opts.html,
    ``,
  ].join('\r\n');

  await writeRaw(headers);

  for (const att of opts.attachments) {
    const b64 = chunkBase64(toBase64(att.content));
    const part = [
      `--${boundary}`,
      `Content-Type: ${att.mime}; name="${att.filename}"`,
      `Content-Transfer-Encoding: base64`,
      `Content-Disposition: attachment; filename="${att.filename}"`,
      ``,
      b64,
      ``,
    ].join('\r\n');
    await writeRaw(part);
  }

  await writeRaw(`--${boundary}--\r\n.\r\n`);
  await read();
  await cmd('QUIT');
  try { conn.close(); } catch { /* ignore */ }
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
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    if (!smtpUser || !smtpPass) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Get deal info
    const { data: deal } = await admin
      .from('deals')
      .select('address, city, state, zip, mls_number, status, price')
      .eq('id', dealId)
      .maybeSingle();

    // List checklist item folders for this deal
    const root = `checklist-documents/${dealId}`;
    const { data: itemFolders, error: listErr } = await admin.storage
      .from(BUCKET)
      .list(root, { limit: 1000 });
    if (listErr && !`${listErr.message}`.toLowerCase().includes('not found')) {
      throw listErr;
    }

    const attachments: { filename: string; content: Uint8Array; mime: string }[] = [];
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
        const filename = displayName(f.name);
        const mime = (blob as Blob).type || 'application/octet-stream';
        attachments.push({ filename, content: buf, mime });
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

    await sendMailWithAttachments({
      user: smtpUser, pass: smtpPass, to: OFFICE_EMAIL,
      subject: `Deal Sent to Office: ${addressLine}`,
      html,
      attachments,
    });

    return new Response(JSON.stringify({ success: true, attachmentCount: attachments.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-to-office error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});