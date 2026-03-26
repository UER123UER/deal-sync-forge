

## Add Signature Prep Editor to FormEditor

### What Changes

When an agent clicks "Send for Signature" in the FormEditor, instead of immediately opening the send panel, the editor transitions into a **signature preparation mode** — a layout nearly identical to the Admin PDF Editor with the right-side sidebar (Signers, Tools, etc.). The agent can place "Sign Here", "Initials", and "Date" fields on the PDF, assign them to signers, then click "Next >" to open the send panel.

### Flow

```text
FormEditor (autofill mode)
  → Click "Send for Signature"
  → Enter Signature Prep mode (same page, sidebar appears)
     - Right sidebar with tabs: Signers, Tools
     - Signers auto-populated from deal contacts
     - Tools: Designated Signature, Initials, Date fields
     - Agent places fields on the PDF pages
  → Click "Next >" in header
  → SignaturePanel opens with recipients pre-selected
  → Send creates the signature request with designated field positions
```

### Layout in Prep Mode

```text
┌─ Header: ← Back  |  doc name  |  Page X of Y  |  Next > ─────┐
├───────────────────────┬──────────────┬─────────────────────────┤
│                       │              │ [Signers] [Tools]  tabs │
│   PDF with autofill   │  Panel area  │                         │
│   + designated fields │  (~300px)    │                         │
│                       │              │                         │
└───────────────────────┴──────────────┴─────────────────────────┘
```

### Files Changed

| File | Change |
|------|--------|
| `src/pages/FormEditor.tsx` | Add `signaturePrepMode` state. When true: show the `PdfEditorSidebar` (reuse existing component), swap header buttons to "← Back" and "Next >", enable `PdfCanvas` tool interactions. Auto-populate signers from deal contacts. On "Next >", collect designated fields from canvas and open `SignaturePanel` with field data. |
| `src/components/admin/PdfEditorSidebar.tsx` | Minor: make the component work without doc-management features (hide Docs/Layouts/Options tabs when used in agent context via a new `mode?: 'admin' | 'agent'` prop). |
| `src/components/deal/SignaturePanel.tsx` | Accept optional `designatedFields` prop to include field placement data in the signature request. |
| `src/hooks/useSignatureRequests.ts` | Pass `designated_fields` to the signature request creation if provided. |

### Key Details

- **Reuses existing components**: `PdfEditorSidebar` and `PdfCanvas` from the admin editor — no duplication
- **Signers tab**: Auto-populated from `dealContacts`, no need to manually add
- **Tools tab**: Only shows "Designated Signature", "Designated Initials", "Designated Date" tools (the markup tools like highlight/line are hidden in agent mode)
- **Canvas switching**: In prep mode, the raw Fabric canvas is replaced with the `PdfCanvas` component which supports tool interactions
- **Designated fields are saved**: When "Next >" is clicked, designated field positions are extracted from the Fabric canvas objects and passed through to the signature request so the signer sees exactly where to sign
- **No route change**: This is a mode toggle within FormEditor, not a new page

