const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OFFICE_EMAIL = 'brokerage@unitedestatesagent.com';

async function sendMail(opts: {
  user: string;
  pass: string;
  to: string;
  subject: string;
  html: string;
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

  await read();
  await cmd('EHLO localhost');
  await cmd('AUTH LOGIN');
  await cmd(btoa(opts.user));
  await cmd(btoa(opts.pass));
  await cmd(`MAIL FROM:<${opts.user}>`);
  await cmd(`RCPT TO:<${opts.to}>`);
  await cmd('DATA');

  const message = [
    `From: United Estates Realty <${opts.user}>`,
    `To: ${opts.to}`,
    `Subject: ${opts.subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    opts.html,
    `.`,
  ].join('\r\n');

  await conn.write(encoder.encode(message + '\r\n'));
  await read();
  await cmd('QUIT');
  try { conn.close(); } catch { /* ignore */ }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email, firstName, lastName, licenseNumber, referralCode } = await req.json();

    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPass = Deno.env.get('SMTP_PASS');
    if (!smtpUser || !smtpPass) {
      return new Response(JSON.stringify({ error: 'SMTP not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background:#0f1b3d;padding:20px;border-radius:8px 8px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:20px;">New Agent Signup</h1>
        </div>
        <div style="background:#fff;padding:24px;border:1px solid #e5e7eb;border-top:none;">
          <p style="color:#111827;margin:0 0 12px;">A new agent just signed up on United Estates Realty.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;">
            <tr><td style="padding:6px 0;font-weight:600;">Name:</td><td>${firstName || ''} ${lastName || ''}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Email:</td><td>${email || ''}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">License #:</td><td>${licenseNumber || '—'}</td></tr>
            <tr><td style="padding:6px 0;font-weight:600;">Referral Code:</td><td>${referralCode || '—'}</td></tr>
          </table>
        </div>
      </div>
    `;

    await sendMail({
      user: smtpUser, pass: smtpPass, to: OFFICE_EMAIL,
      subject: `New Agent Signup: ${firstName || ''} ${lastName || ''}`.trim(),
      html,
    });

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-signup-notification error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});