

## Build Full Signing Sessions System

### Overview

Based on the Signing_sessions.pdf spec and reference screenshots, build an 8-step signing session workflow: Create Session → Setup (recipients, docs, settings) → Field Editor → Preview → Send → Track Status. This replaces the current simple SignaturePanel flow with a proper multi-step system.

### What Gets Built

**1. Database: New tables via migration**
- `signing_sessions` — id, deal_id, session_name, email_message, status (draft/in_progress/completed/voided), created_by, date_sent, expiration_date, reminder_interval_days, signing_order_enabled
- `session_documents` — id, session_id, name, storage_path, order, page_count
- `session_recipients` — id, session_id, contact_id, first_name, last_name, email, type (signer/reviewer/cc), order, status, signed_at, signature_data, token
- `session_fields` — id, session_id, document_id, recipient_id, type (signature/initials/date/text/checkbox), page, x, y, width, height, value

**2. New Page: `/transactions/:id/signing-sessions` — Session List & Status**
- Table showing all sessions for a deal with status, progress ("2 of 4 completed"), date
- Actions: Resend, Edit, Clone, Void
- "Create Signing Session" button

**3. New Page: `/transactions/:id/signing-session/new` (or modal) — Session Setup Wizard**
Multi-step flow within a single page:
- **Step 1 — Session Details**: Session name (doubles as email subject), email message textarea
- **Step 2 — Documents**: Shows current deal documents, drag-to-reorder, upload additional
- **Step 3 — Recipients**: Toggle "Set Signing Order", add recipients with type dropdown (Signer/Reviewer/CC), reorder via drag
- **Step 4 — Roles Assignment**: Auto-generated from document template, dropdown per role to assign recipient
- **Step 5 — Settings**: Toggle auto reminders + frequency input, toggle expiration + days input

Button: "Continue to Field Editor"

**4. New Page: `/transactions/:id/signing-session/:sessionId/prepare` — Field Editor**
- Reuses existing `PdfCanvas` + `PdfEditorSidebar` (mode='agent')
- Top bar: signer selector dropdown, zoom, undo/redo
- Left tool palette: Signature, Initials, Date, Text, Checkbox
- Fields color-coded per signer
- Multi-document navigation (tabs or dropdown)
- "Next >" button → Preview

**5. Preview Screen (step within the prepare page or new route)**
- Summary: total recipients, total signature fields, documents list, email message
- "Send" button → creates the session, sends emails, redirects to status page

**6. Updated Signing Experience (`/sign/:token`)**
- Keep existing SignDocument page but enhance to read from `session_fields` for placed field positions
- Render fields at exact coordinates on the PDF canvas
- Must complete all required fields before "Finish" button enables

**7. Integration Points**
- DealDetail checklist: "Send for Signature" opens the session wizard instead of the old SignaturePanel
- FormEditor: "Send for Signature" pre-populates the session with the current document and transitions to the wizard
- Transactions list: show signing session status badges

### Files to Create/Modify

| File | Action |
|------|--------|
| `supabase/migrations/XXX_signing_sessions.sql` | Create — 4 new tables with RLS |
| `src/integrations/supabase/types.ts` | Update — add new table types |
| `src/hooks/useSigningSessions.ts` | Create — CRUD hooks for sessions, recipients, fields |
| `src/pages/SigningSessions.tsx` | Create — session list & status page |
| `src/pages/SigningSessionSetup.tsx` | Create — multi-step setup wizard |
| `src/pages/SigningSessionPrepare.tsx` | Create — field editor (reuses PdfCanvas + PdfEditorSidebar) |
| `src/pages/SignDocument.tsx` | Update — read session_fields for field placement |
| `src/pages/FormEditor.tsx` | Update — "Send for Signature" routes to session wizard |
| `src/pages/DealDetail.tsx` | Update — add signing sessions section, link "Send for Signature" |
| `src/App.tsx` | Update — add new routes |
| `src/components/layout/AppSidebar.tsx` | Update — optionally add signing sessions nav item |

### Technical Details

- Session setup wizard uses internal step state (1-5), not separate routes, to keep it simple
- Field editor reuses `PdfCanvas` component and `PdfEditorSidebar` with `mode='agent'` — same tools already built
- Each recipient gets a unique token for their signing URL
- Sequential signing: only the current-order recipient's token is active; after they sign, next recipient is notified
- Parallel signing: all tokens active immediately
- Color-coding per signer uses a predefined palette array indexed by recipient order
- Checkbox field type added to PdfCanvas tool modes and PdfEditorSidebar tools panel

