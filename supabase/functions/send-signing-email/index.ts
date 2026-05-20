const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sendGmail(
  user: string,
  appPassword: string,
  to: string,
  subject: string,
  html: string,
): Promise<void> {
  const conn = await Deno.connectTls({ hostname: 'smtp.gmail.com', port: 465 });
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  async function read(): Promise<string> {
    const buf = new Uint8Array(4096);
    const n = await conn.read(buf);
    return n ? dec.decode(buf.subarray(0, n)) : '';
  }
  async function cmd(s: string): Promise<string> {
    await conn.write(enc.encode(s + '\r\n'));
    return await read();
  }

  await read(); // greeting
  await cmd('EHLO localhost');
  await cmd('AUTH LOGIN');
  await cmd(btoa(user));
  await cmd(btoa(appPassword));
  await cmd(`MAIL FROM:<${user}>`);
  await cmd(`RCPT TO:<${to}>`);
  await cmd('DATA');

  const msg = [
    `From: United Estates Realty <${user}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    ``,
    html,
    `.`,
  ].join('\r\n');

  await conn.write(enc.encode(msg + '\r\n'));
  await read();
  await cmd('QUIT');
  conn.close();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recipients, subject, sessionName, emailMessage } = await req.json()

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return new Response(JSON.stringify({ error: 'recipients is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')

    if (!smtpUser || !smtpPass) {
      return new Response(JSON.stringify({ error: 'SMTP credentials not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results: { email: string; success: boolean; error?: string }[] = []

    for (const recipient of recipients) {
      const { email, firstName, lastName, signingUrl } = recipient
      const recipientName = `${firstName} ${lastName}`.trim()
      const emailSubject = subject || `Signature Required: ${sessionName || 'Document'}`

      const htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
          <div style="background:#1a1a2e;padding:24px;border-radius:8px 8px 0 0;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:20px;">United Estates Realty</h1>
          </div>
          <div style="background:#ffffff;padding:32px;border:1px solid #e5e7eb;border-top:none;">
            <h2 style="color:#111827;margin-top:0;">Hello ${recipientName},</h2>
            <p style="color:#4b5563;line-height:1.6;">${emailMessage || 'You have been requested to review and sign documents.'}</p>
            <p style="color:#4b5563;line-height:1.6;"><strong>Session:</strong> ${sessionName || 'Signing Session'}</p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${signingUrl}" style="background:#4F46E5;color:#ffffff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:600;display:inline-block;">
                Review &amp; Sign Documents
              </a>
            </div>
            <p style="color:#9ca3af;font-size:13px;">
              If the button doesn't work, copy and paste this link:<br/>
              <a href="${signingUrl}" style="color:#4F46E5;">${signingUrl}</a>
            </p>
          </div>
          <div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">
            Sent by United Estates Realty via secure e-signature platform
          </div>
        </div>`

      try {
        await sendGmail(smtpUser, smtpPass, email, emailSubject, htmlBody)
        results.push({ email, success: true })
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err)
        results.push({ email, success: false, error: String(err) })
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('send-signing-email error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
