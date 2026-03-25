

## Redesign Admin PDF Editor to Match Authentisign Layout

### What Changes

Replace the current horizontal toolbar layout with a right-side vertical tab panel matching the Authentisign screenshots. The PDF stays in the center; a right sidebar has icon tabs (Signers, Docs, Tools, Layouts, Options, Feedback) that open content panels.

### Layout

```text
┌──────────────────────────────────────────────────────────┐
│  Header: Document Name                    [Upload PDF]   │
├────────────────────────────────────┬─────────┬───────────┤
│                                    │ Panel   │ Tab Icons │
│                                    │ Content │ ┌───────┐ │
│         PDF Canvas Area            │ (shows  │ │Signers│ │
│         (scrollable)               │  when   │ │ Docs  │ │
│                                    │  tab    │ │ Tools │ │
│   ┌─────────────────────┐         │  is     │ │Layouts│ │
│   │  Page with Fabric   │         │  open)  │ │Options│ │
│   │  overlay             │         │         │ │Feedbk │ │
│   └─────────────────────┘         │         │ └───────┘ │
│                                    │         │           │
│   [< Prev] Page 1/5 [Next >]      │         │           │
├────────────────────────────────────┴─────────┴───────────┤
```

### Right Sidebar Tabs

**Signers** (User icon)
- "Set signing order" toggle
- List of added signers with avatar, name, role, email
- "Add Participants" dropdown: Add Yourself, Add New, Add from Contacts
- "Map Signers" button
- Clicking a signer or "Add New" opens a detail form: First Name, Last Name, Email, Role dropdown, Signer Type (Remote Signer), Signing PIN, Custom Signature/Initials, Language, Save/Cancel

**Docs** (Document icon)
- List of attached documents with drag handle and number
- "Add a Document or Form" button

**Tools** (List icon)
- Signer dropdown (select which signer to assign fields to)
- **Signer Actions**: Sign Here, Initials buttons
- **Signer Fields**: Full Name, Email Address, Auto Date, Auto Time
- **Markup**: Text Box, Highlight, Line, Freehand, Strikethrough, Ellipse

**Layouts** (Layout icon)
- Placeholder for predefined field layouts

**Options** (Gear icon)
- Accordion sections: Change Signature, Signing Details, Expiration Dates, Reminders, Authentisign ID Position, Clear Signing Fields
- Expiration Dates: date picker + time display, Save/Cancel

**Feedback** (Help icon)
- Placeholder for feedback/help

### Files

| File | Change |
|------|--------|
| `src/pages/AdminPdfEditor.tsx` | Complete rewrite — new layout with right sidebar state management, signers list, active tab |
| `src/components/admin/PdfToolbar.tsx` | Delete — replaced by right sidebar tabs |
| `src/components/admin/PdfEditorSidebar.tsx` | New — right sidebar with 6 tab panels (Signers, Docs, Tools, Layouts, Options, Feedback) |
| `src/components/admin/PdfCanvas.tsx` | Minor — no structural changes, tool modes still passed as props |
| `src/components/admin/SignatureStampModal.tsx` | No changes |

### Interaction Details

- Clicking a tab icon toggles the panel open/closed (clicking active tab closes it)
- Active tab has green background matching screenshots (`bg-[#2D5F2B]` dark green)
- Tab icons are stacked vertically on the far right (~60px wide)
- Panel content area is ~350px wide, slides between icons and PDF area
- Tools panel sets the `activeTool` state which flows to `PdfCanvas`
- Signers are managed in local state (array of signer objects) — persisted alongside annotations on Save
- "Add from Contacts" queries existing contacts via `useContacts`

