

## Admin PDF Editor Dashboard

### What This Is

A new `/admin/pdf-editor` page where you can upload any PDF, view it rendered page-by-page, and overlay interactive annotations on top — text boxes, signatures, initials, drawn marks, lines, highlights, and designated client signing fields. This is a full PDF annotation workspace, not tied to any specific form template.

### Architecture

**PDF Rendering**: Use `pdfjs-dist` (Mozilla's PDF.js) to render each page of the uploaded PDF onto `<canvas>` elements.

**Annotation Layer**: Use `fabric.js` on a transparent canvas overlaid on each PDF page. Fabric.js provides:
- Free-draw mode (pen/brush)
- Text objects (editable text boxes)
- Line objects
- Rectangle objects (for highlights with semi-transparent fill)
- Image objects (for signature/initials stamps)
- Object selection, moving, resizing, deleting

**Tool Modes** (matching the screenshots you shared):
- **Select** — default pointer, move/resize annotations
- **Text** — click to place an editable text box
- **Sign** — click to stamp your saved signature
- **Initials** — click to stamp your saved initials
- **Highlight** — drag to create a semi-transparent yellow rectangle
- **Draw** — freehand drawing with pen tool
- **Line** — click-drag to draw a straight line
- **Text Box** — place a bordered text input area
- **Designate Signature Field** — place a "Sign Here" marker that becomes an interactive field when sent to clients
- **Designate Initials Field** — place an "Initials" marker for clients
- **Designate Date Field** — place a "Date" marker for clients

### File Structure

| File | Purpose |
|------|---------|
| `src/pages/AdminPdfEditor.tsx` | Main page: upload, toolbar, page navigation, export |
| `src/components/admin/PdfCanvas.tsx` | Single PDF page renderer + Fabric.js overlay canvas |
| `src/components/admin/PdfToolbar.tsx` | Horizontal toolbar with all tool icons |
| `src/components/admin/SignatureStampModal.tsx` | Modal to create/select signature or initials stamp |

### Page Layout

```text
┌─────────────────────────────────────────────────┐
│ Admin PDF Editor                    [Upload PDF] │
├─────────────────────────────────────────────────┤
│ Toolbar:                                         │
│ [Select][Text][Sign][Initials][Highlight]        │
│ [Draw][Line][Text Box]                           │
│ [⬜ Signature Field][⬜ Initials Field][⬜ Date] │
│ ─── separator ───                                │
│ [Delete Selected] [Undo]  [Save] [Send to Client]│
├─────────────────────────────────────────────────┤
│                                                   │
│   ┌──── Page 1 of N ────┐                        │
│   │  PDF rendered on     │                        │
│   │  canvas              │                        │
│   │                      │                        │
│   │  [text box overlay]  │  ← Fabric.js canvas   │
│   │  [signature stamp]   │    on top of PDF       │
│   │  [drawn line]        │                        │
│   └──────────────────────┘                        │
│                                                   │
│   ┌──── Page 2 of N ────┐                        │
│   │  ...                 │                        │
│   └──────────────────────┘                        │
│                                                   │
│           [< Prev] Page 1/5 [Next >]              │
└─────────────────────────────────────────────────┘
```

### Workflow

1. Click "Upload PDF" → file picker → PDF.js renders all pages
2. Select a tool from the toolbar
3. Click/drag on the PDF page to place annotations
4. "Designate" tools place colored markers (e.g., yellow "Sign Here" box) that map to client signing fields
5. "Send to Client" saves the annotation positions + PDF reference, creates a signature request with field positions, and generates a signing link
6. "Save" persists annotations to Supabase (JSON blob per document)

### Database

New table `admin_documents`:
- `id`, `user_id`, `file_name`, `storage_path` (PDF in Supabase storage), `annotations` (JSONB — serialized Fabric.js objects per page), `designated_fields` (JSONB — array of client signing field positions), `created_at`, `updated_at`

New storage bucket `admin-documents` for uploaded PDFs.

### Route & Navigation

- Route: `/admin/pdf-editor` and `/admin/pdf-editor/:documentId`
- Sidebar: Add a "Admin" nav item with a Shield icon (only visible to admin — for now, always visible; auth gating comes later)

### Dependencies

- `pdfjs-dist` — PDF rendering
- `fabric` — canvas annotation layer (v6)

### Files Modified/Created

| File | Change |
|------|--------|
| `src/pages/AdminPdfEditor.tsx` | New — main editor page |
| `src/components/admin/PdfCanvas.tsx` | New — PDF page + Fabric overlay |
| `src/components/admin/PdfToolbar.tsx` | New — tool selection bar |
| `src/components/admin/SignatureStampModal.tsx` | New — create/reuse signature |
| `src/components/layout/AppSidebar.tsx` | Add Admin nav item |
| `src/App.tsx` | Add `/admin/pdf-editor` route |
| Migration | Create `admin_documents` table + `admin-documents` storage bucket |

