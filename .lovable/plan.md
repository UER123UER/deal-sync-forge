## Root cause

The toast “Failed to email documents to office” is fired by `DealDetail.handleToggleVisibility`, which calls the `notify-office` edge function — not the older `send-to-office` Gmail/denomailer code we’ve been editing. That’s why the previous fixes didn’t change anything for you.

Two real problems inside `supabase/functions/notify-office/index.ts`:

1. It sends links, not attachments. You asked for files attached.
2. It sends `from: "United Estates Realty <onboarding@resend.dev>"`. Resend’s shared `onboarding@resend.dev` sender is restricted — it can only deliver to the email address that owns the Resend account. Sending to `brokerage@unitedestatesagent.com` from it is rejected, which surfaces as the generic toast.

The old `send-to-office` Gmail function is also broken (Google rejects the app password: `535 5.7.8 BadCredentials`), but nothing in the app calls it anymore, so we’ll just remove it.

## Fix

### 1. Rewrite `supabase/functions/notify-office/index.ts`

- Keep the existing payload contract (`dealId, dealAddress, agentName, agentEmail, checklistItems`) so the frontend doesn’t change.
- Use the service-role Supabase client to list and download every file under `deal-photos/checklist-documents/{dealId}/{itemId}/...`.
- For each file, build a Resend attachment:
  ```ts
  attachments.push({
    filename: displayName,            // strip the "uuid__" prefix
    content: base64(fileBytes),       // base64-encoded string
    content_type: blob.type || 'application/octet-stream',
  });
  ```
- Send via Resend REST:
  ```ts
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'United Estates Realty <brokerage@unitedestatesagent.com>',
      to: ['brokerage@unitedestatesagent.com'],
      reply_to: agentEmail || undefined,
      subject: `Deal Submitted: ${dealAddress || dealId}`,
      html,                // same template, minus the link table
      attachments,
    }),
  });
  ```
- Return the actual Resend error message in the 500 body so the toast (and logs) shows the real reason instead of a generic failure.
- Cap total attachment payload (Resend limit is ~40 MB combined). If we exceed it, fall back to including a signed-URL list for the over-limit files and note that in the email.

### 2. Improve the frontend signal

In `src/pages/DealDetail.tsx` `handleToggleVisibility`:
- Read `data` and `error` from `supabase.functions.invoke('notify-office', ...)`.
- On failure, show `toast.error(error.message || data?.error || 'Failed to email documents to office')` so you see the underlying cause (e.g. domain not verified) instead of the opaque message.
- Roll back `visible_to_office` to `false` if the email send fails, so the UI matches reality.

### 3. Remove the dead Gmail function

Delete `supabase/functions/send-to-office/` and `supabase/functions/send-signup-notification/` (both denomailer / Gmail, both failing auth, neither called by the app). Replace `send-signup-notification` usages — if any — with the working Resend pattern. (Quick search shows only `notify-signup` is wired up.)

## Required before this works in production

Resend will only accept `from: brokerage@unitedestatesagent.com` once that domain is verified in your Resend account:

1. Resend dashboard → Domains → Add Domain → `unitedestatesagent.com`.
2. Add the SPF, DKIM, and (optional) DMARC DNS records Resend shows you to your domain registrar.
3. Wait for status to flip to **Verified**.

Until the domain is verified, I’ll have the function fall back to `from: 'United Estates Realty <onboarding@resend.dev>'` AND override `to:` to the verified Resend account owner email if `RESEND_TEST_RECIPIENT` is set — that way testing works while DNS propagates, and you’ll get a clear error in the toast if neither is configured.

## Verification

1. From the deal detail page, toggle “Send to Office” with at least one uploaded checklist document.
2. Check `notify-office` edge function logs — expect `success: true` and an attachment count.
3. Confirm `brokerage@unitedestatesagent.com` receives the email with the PDFs attached.
4. If it still fails, the toast and logs will now show the exact Resend error (most likely “domain not verified”), which tells you exactly what DNS step to finish.
