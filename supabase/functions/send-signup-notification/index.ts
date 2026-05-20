import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OFFICE_EMAIL = 'brokerage@unitedestatesagent.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { email, firstName, lastName, licenseNumber, referralCode } = await req.json();

    const user = Deno.env.get('GMAIL_USER');
    const pass = Deno.env.get('GMAIL_APP_PASSWORD');
    if (!user || !pass) {
      return new Response(JSON.stringify({ error: 'GMAIL_USER / GMAIL_APP_PASSWORD not configured' }), {
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
        subject: `New Agent Signup: ${(firstName || '').trim()} ${(lastName || '').trim()}`.trim(),
        content: 'A new agent just signed up.',
        html,
      });
    } finally {
      await client.close();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('send-signup-notification error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message || String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});