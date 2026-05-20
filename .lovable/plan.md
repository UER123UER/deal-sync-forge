## Problem

`send-to-office` is failing with `BrokenPipe: broken pipe` while writing the email body to `smtp.gmail.com:465`. This happens because the current hand-rolled SMTP client:

1. Doesn't wait for / parse multi-line SMTP responses (Gmail returns several `250-` continuation lines after `EHLO`, then `334` challenges for `AUTH LOGIN`). A single `read()` can swallow part of the next response, causing auth to silently fail.
2. Doesn't check SMTP status codes, so if Gmail rejects `AUTH LOGIN` (e.g. because 2FA / app-password mismatch, or because Gmail prefers `AUTH PLAIN`), the code keeps writing — and Gmail closes the socket → `EPIPE` on the big MIME body write.
3. Builds multipart/mixed with attachments manually, which is also fragile (CRLF, base64 line length, boundary terminators).

Gmail SMTP works, but it's strict. The robust fix is to use a maintained Deno SMTP client instead of rolling our own.

## Plan

### 1. Replace SMTP transport with `denomailer`

Use `https://deno.land/x/denomailer@1.6.0/mod.ts` (pure Deno, supports Gmail TLS 465, attachments, proper AUTH PLAIN/LOGIN negotiation).

### 2. Rewrite `supabase/functions/send-to-office/index.ts`

- Keep: CORS, payload (`{ dealId }`), Supabase service-role client, listing `checklist-documents/{dealId}/...` in `deal-photos` bucket, downloading each file.
- Replace: the `sendMailWithAttachments` function and SMTP code with denomailer's `SMTPClient`:
  ```ts
  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: { username: GMAIL_USER, password: GMAIL_APP_PASSWORD },
    },
  });
  await client.send({
    from: `United Estates Realty <${GMAIL_USER}>`,
    to: OFFICE_EMAIL,
    subject: `Deal Sent to Office: ${addressLine}`,
    content: "Deal documents attached.",
    html,
    attachments: attachments.map(a => ({
      filename: a.filename,
      content: a.content,         // Uint8Array
      encoding: "binary",
      contentType: a.mime,
    })),
  });
  await client.close();
  ```
- Surface clearer errors: if `GMAIL_USER` / `GMAIL_APP_PASSWORD` are missing, return 500 with a specific message; on send failure, log `error.message` and return it in the response so the toast can show the real reason.
- Guard against zero attachments: still send the email but note `0 documents` in the body (today this works, keep it).

### 3. Apply the same client to `supabase/functions/send-signup-notification/index.ts`

Same `SMTPClient` setup, no attachments. Removes the duplicate fragile SMTP code.

### 4. Frontend (no change needed)

`DealDetail.handleToggleVisibility` already calls `send-to-office` and toasts on failure. Once the function returns success, the toast will switch to the success branch automatically.

### 5. Verification steps

1. Deploy both functions.
2. From the deal detail page, toggle "Send to Office" with at least one uploaded checklist document.
3. Check the function logs — expect `success: true` and a `250 2.0.0 OK` from Gmail, no `BrokenPipe`.
4. Confirm `brokerage@unitedestatesagent.com` receives the email with PDFs attached.

### Pre-reqs to confirm

- `GMAIL_USER` secret is set to `brokerage@unitedestatesagent.com` (the Google Workspace inbox).
- `GMAIL_APP_PASSWORD` is the 16-char app password generated under that same Google account with 2-Step Verification enabled.
- Google Workspace admin hasn't disabled "Less secure apps" / SMTP for the domain — app passwords still need SMTP access enabled in Workspace Admin (Apps → Google Workspace → Gmail → End User Access → "Allow per-user outbound gateways" / "POP & IMAP access").

If auth still fails after the rewrite, the cause will be one of the Workspace-side toggles above, not the code.
