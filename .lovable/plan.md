

## Make Form Editor Save All Fields + Build Email Signature Flow

### Problem
1. **Form Save is incomplete** — only persists price, MLS#, and listing dates. Changes to seller name, broker name, company, address, and commission rate are lost.
2. **Signature panel is fake** — just shows a toast. No email is sent, no signing experience exists.

### Plan

#### 1. Form Editor — Save All Fields

Update `FormEditor.tsx` `handleSave` to persist every editable field:

- **Deal fields**: price, mls_number, listing_start_date, listing_expiration, address (parse back into address/city/state/zip)
- **Contact fields**: Update the seller contact's first_name/last_name via `useUpdateContact`. Update the agent contact's first_name/last_name/company/commission via `useUpdateContact`.
- Import and use `useUpdateContact` from `useContacts.ts`
- Parse `sellerName` back into first_name + last_name (split on first space)
- Parse `brokerName` similarly
- Update `brokerCompany` and `commissionRate` on the agent contact

Also add a "Send for Signature" button in the FormEditor header that opens the SignaturePanel.

#### 2. Signature Requests — Database Table

Create new `signature_requests` table:
| Column | Type |
|--------|------|
| id | uuid PK |
| deal_id | uuid FK → deals |
| checklist_item_id | uuid FK → checklist_items |
| document_name | text |
| sender_name | text |
| subject | text |
| message | text |
| status | text (pending/viewed/signed/voided) |
| token | text UNIQUE (for public access) |
| form_data | jsonb (snapshot of all form fields at send time) |
| created_at | timestamptz |

Create `signature_recipients` table:
| Column | Type |
|--------|------|
| id | uuid PK |
| signature_request_id | uuid FK |
| contact_id | uuid FK → contacts |
| name | text |
| email | text |
| role | text |
| status | text (pending/viewed/signed) |
| signed_at | timestamptz |
| signature_data | text (base64 drawn signature or typed name) |

#### 3. Public Signing Page

Create `/sign/:token` route (outside AppLayout) — a public page that:
- Fetches the signature request by token
- Shows the document in read-only mode (same form layout but fields are static text, not editable)
- Shows a signature area at the bottom where the signer can:
  - Draw their signature on a canvas (using simple mouse/touch drawing)
  - Or type their name (renders in a cursive font)
- "Sign & Complete" button saves the signature and updates recipient status to "signed"
- Shows confirmation page after signing

#### 4. Email Sending via Transactional Email

Use Lovable's built-in transactional email system to send signature request emails:
- Scaffold a `signature-request` email template styled like DocuSign (blue banner, document icon, "Review Document" CTA button)
- The CTA links to `/sign/:token`
- Template receives: senderName, documentName, recipientName, message, signUrl

#### 5. Wire Up SignaturePanel

Update `SignaturePanel.tsx`:
- On "Send for Signature": 
  1. Save current form data as JSON snapshot
  2. Create `signature_requests` row with a unique token
  3. Create `signature_recipients` rows for each selected contact
  4. Call `send-transactional-email` for each recipient with the signing URL
  5. Show success toast

#### 6. Track Signature Status

Add a signature status indicator to the DealDetail checklist items — show "Sent for Signature", "Viewed", "Signed" badges next to documents that have been sent.

### New Files
- `supabase/migrations/[timestamp].sql` — signature_requests + signature_recipients tables
- `src/pages/SignDocument.tsx` — public signing page
- `src/hooks/useSignatureRequests.ts` — CRUD hooks
- Transactional email template for signature requests

### Modified Files
- `src/pages/FormEditor.tsx` — save all fields, add Send for Signature button
- `src/components/deal/SignaturePanel.tsx` — wire to real email sending
- `src/App.tsx` — add `/sign/:token` route
- `src/pages/DealDetail.tsx` — show signature status on checklist items
- `src/integrations/supabase/types.ts` — add new table types

### Technical Notes
- The form data is snapshotted as JSONB at send time so the signed document preserves the exact values
- Token is a crypto.randomUUID() for unique public URLs
- Signature drawing uses an HTML canvas with mouse/touch event handlers (no external library needed)
- Email requires Lovable email domain setup — will check status and scaffold if needed

