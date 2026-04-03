const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #1a1a2e; padding: 24px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px;">United Estates Realty</h1>
          </div>
          <div style="background: #ffffff; padding: 32px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #111827; margin-top: 0;">Hello ${recipientName},</h2>
            <p style="color: #4b5563; line-height: 1.6;">
              ${emailMessage || 'You have been requested to review and sign documents.'}
            </p>
            <p style="color: #4b5563; line-height: 1.6;">
              <strong>Session:</strong> ${sessionName || 'Signing Session'}
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${signingUrl}" style="background: #4F46E5; color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                Review &amp; Sign Documents
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 13px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${signingUrl}" style="color: #4F46E5;">${signingUrl}</a>
            </p>
          </div>
          <div style="text-align: center; padding: 16px; color: #9ca3af; font-size: 12px;">
            Sent by United Estates Realty via secure e-signature platform
          </div>
        </div>
      `

      const emailSubject = subject || `Signature Required: ${sessionName || 'Document'}`

      // Build raw MIME message
      const boundary = `boundary_${crypto.randomUUID()}`
      const rawMessage = [
        `From: United Estates Realty <${smtpUser}>`,
        `To: ${email}`,
        `Subject: ${emailSubject}`,
        `MIME-Version: 1.0`,
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        ``,
        `--${boundary}`,
        `Content-Type: text/plain; charset=UTF-8`,
        ``,
        `Hello ${recipientName}, you have been requested to sign documents. Visit: ${signingUrl}`,
        ``,
        `--${boundary}`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        htmlBody,
        ``,
        `--${boundary}--`,
      ].join('\r\n')

      try {
        // Use Zoho Mail API (SMTP submission via fetch to Zoho's send mail API)
        const response = await fetch('https://mail.zoho.com/api/accounts/self/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Zoho-oauthtoken ${smtpPass}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fromAddress: smtpUser,
            toAddress: email,
            subject: emailSubject,
            content: htmlBody,
            askReceipt: 'no',
          }),
        })

        if (!response.ok) {
          // Fallback: try basic SMTP via Deno's built-in TCP
          const text = await response.text()
          console.error(`Zoho API error for ${email}:`, text)
          
          // Try alternate approach using smtp2go or direct SMTP
          const smtpResult = await sendViaSMTP(smtpUser, smtpPass, email, emailSubject, htmlBody, recipientName, signingUrl)
          if (smtpResult.success) {
            results.push({ email, success: true })
          } else {
            results.push({ email, success: false, error: smtpResult.error })
          }
        } else {
          results.push({ email, success: true })
        }
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

async function sendViaSMTP(
  user: string,
  pass: string,
  to: string,
  subject: string,
  html: string,
  recipientName: string,
  signingUrl: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const conn = await Deno.connectTls({ hostname: 'smtp.zoho.com', port: 465 })

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    async function readResponse(): Promise<string> {
      const buf = new Uint8Array(4096)
      const n = await conn.read(buf)
      return n ? decoder.decode(buf.subarray(0, n)) : ''
    }

    async function sendCommand(cmd: string): Promise<string> {
      await conn.write(encoder.encode(cmd + '\r\n'))
      return await readResponse()
    }

    // Read greeting
    await readResponse()

    await sendCommand('EHLO localhost')
    await sendCommand(`AUTH LOGIN`)
    await sendCommand(btoa(user))
    await sendCommand(btoa(pass))
    await sendCommand(`MAIL FROM:<${user}>`)
    await sendCommand(`RCPT TO:<${to}>`)
    await sendCommand('DATA')

    const message = [
      `From: United Estates Realty <${user}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      html,
      `.`,
    ].join('\r\n')

    await conn.write(encoder.encode(message + '\r\n'))
    await readResponse()
    await sendCommand('QUIT')
    conn.close()

    return { success: true }
  } catch (err) {
    console.error('SMTP fallback error:', err)
    return { success: false, error: String(err) }
  }
}
