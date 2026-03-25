

## Redesign Admin PDF Editor — Authentisign-Style Layout

### Overview

Replace the current horizontal toolbar with a right-side vertical tab panel matching the reference screenshot. The layout becomes: header bar at top, scrollable PDF workspace in center, and a right sidebar with icon tabs + expandable content panels.

### Layout Structure

```text
┌─────────────────────────────────────────────────────────────┐
│ < Back  [100% ◇]  [+]     [Document Name]     [icons] Next>│
├─────────────────────────────────────────┬──────────┬────────┤
│  Document title              Page x/n   │  Panel   │ Icons  │
│                                         │  Content │┌──────┐│
│  ┌────────────────────────────┐         │  (350px) ││Signrs││
│  │                            │         │          ││ Docs ││
│  │     PDF Page Canvas        │         │          ││Tools ││
│  │     with Fabric overlay    │         │          ││Laouts││
│  │                            │         │          ││Optns ││
│  └────────────────────────────┘         │          ││Feedbk││
│                                         │          │└──────┘│
├─────────────────────────────────────────┴──────────┴────────┤
```

### Files

| File | Action |
|------|--------|
| `src/components/admin/PdfEditorSidebar.tsx` | **New** — Right sidebar with 6 icon tabs and content panels |
| `src/pages/AdminPdfEditor.tsx` | **Rewrite** — New layout with header bar, sidebar integration, signer state |
| `src/components/admin/PdfToolbar.tsx` | **Keep** but repurpose — export `ToolMode` type only; toolbar UI replaced by sidebar |
| `src/components/admin/PdfCanvas.tsx` | **Minor** — No changes needed, receives tool mode as before |

### Right Sidebar Tabs (PdfEditorSidebar.tsx)

Six vertical icon tabs on the far right (~60px strip), dark green (`#2D5F2B`) when active:

1. **Signers** (User icon) — "Set signing order" toggle, signer list with avatar/name/role/email, "Add Participants" dropdown (Add Yourself, Add New, Add from Contacts), "Map Signers" button. Adding a signer shows inline form: first/last name, email, role dropdown, signer type, save/cancel.

2. **Docs** (FileText icon) — List of attached documents with numbering, "Add a Document or Form" button.

3. **Tools** (List icon) — Signer dropdown at top, then sections: **Signer Actions** (Sign Here, Initials), **Signer Fields** (Full Name, Email, Auto Date, Auto Time), **Markup** (Text Box, Highlight, Line, Freehand, Strikethrough, Ellipse). Clicking a tool sets `activeTool`.

4. **Layouts** (LayoutGrid icon) — Placeholder panel.

5. **Options** (Settings icon) — Accordion: Change Signature, Signing Details, Expiration Dates (date picker), Reminders, Clear Signing Fields.

6. **Feedback** (HelpCircle icon) — Placeholder panel.

### Header Bar (in AdminPdfEditor.tsx)

Matches screenshot: "< Back" link, zoom controls (100% dropdown, +/-), document name centered, action icons (help, print, download, save) on right, green "Next >" button.

### Signer State

Managed in `AdminPdfEditor.tsx` as `signers: Array<{id, firstName, lastName, email, role, type}>`. Passed to sidebar. "Add from Contacts" uses `useContacts` hook. Signers are persisted alongside annotations on Save.

### Key Interactions

- Click tab icon → toggle panel open/close (re-click active tab closes it)
- Tools panel tools set `activeTool` which flows to `PdfCanvas`
- Panel is ~350px wide, pushes PDF area left when open
- Active tab icon gets `bg-[#2D5F2B] text-white` styling
- Floating help icon at bottom-right corner of the page

