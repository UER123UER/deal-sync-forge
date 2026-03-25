

## Fix Admin PDF Editor: Document Persistence + Better Drawing Tools

### Problems to Fix

1. **No document list / reload** — Documents save to Supabase but there's no way to browse and reopen them later.
2. **Line tool** — Uses two-click placement (click start, click end) which is confusing. Should be click-drag instead.
3. **Strikethrough** — Maps to same `line` tool mode, no distinct behavior. Should draw a horizontal line through text at click position.
4. **Highlight** — Places a fixed 150x20 rectangle on click. Should be click-drag to draw a highlight region of any size.

---

### Changes

#### 1. Document List on Empty State + Docs Tab (AdminPdfEditor.tsx + PdfEditorSidebar.tsx)

**Empty state**: When no PDF is loaded, show a list of previously saved documents fetched from `admin_documents` table. Each row shows file name, last updated date, and an "Open" button. Clicking loads the PDF from storage and restores annotations.

**Docs sidebar tab**: Also show saved documents in the Docs panel so you can switch between them while editing.

**Auto-save on page change**: Already saves annotations per page — also trigger save to Supabase when changing pages (not just manual Save click).

**Load existing document flow**:
- Fetch document record from `admin_documents`
- Download PDF from `admin-documents` storage bucket using `storage_path`
- Re-render with PDF.js
- Load saved annotations per page from the `annotations` JSONB column
- Set `documentId` so subsequent saves update rather than insert

**Route**: `/admin/pdf-editor/:documentId` already exists — wire it up with `useParams` to auto-load on mount.

#### 2. Fix Line Tool — Click-Drag (PdfCanvas.tsx)

Replace the two-click line placement with mouse-down/mouse-move/mouse-up drag interaction:
- `mousedown` on canvas: record start point, create a temporary `Line` object
- `mousemove`: update the line's end point in real-time
- `mouseup`: finalize the line

Use Fabric.js canvas events (`mouse:down`, `mouse:move`, `mouse:up`) instead of the React `onClick` handler for line mode.

#### 3. Fix Strikethrough — Distinct Tool Mode (PdfToolbar.tsx + PdfCanvas.tsx)

Add `'strikethrough'` to `ToolMode`. On click, place a horizontal line (fixed width ~200px, 2px stroke, red color) at the click Y position. This creates a visual strikethrough effect across text.

#### 4. Fix Highlight — Click-Drag Rectangle (PdfCanvas.tsx)

Replace fixed-size highlight with drag-to-draw:
- `mousedown`: record start, create transparent yellow `Rect`
- `mousemove`: resize rect to current mouse position
- `mouseup`: finalize

#### 5. Add Ellipse Tool Mode (PdfToolbar.tsx + PdfCanvas.tsx)

Add `'ellipse'` to `ToolMode`. Import `Ellipse` from fabric. Click-drag to draw an ellipse (no fill, red stroke) — useful for circling items on the document.

---

### File Changes

| File | Change |
|------|--------|
| `src/components/admin/PdfToolbar.tsx` | Add `'strikethrough'` and `'ellipse'` to `ToolMode` |
| `src/components/admin/PdfCanvas.tsx` | Rewrite interaction: add Fabric mouse events for drag-draw (line, highlight, ellipse, strikethrough). Remove two-click line logic. |
| `src/pages/AdminPdfEditor.tsx` | Add document list fetch, `useParams` for `:documentId`, load-from-storage function, auto-save, empty-state document browser |
| `src/components/admin/PdfEditorSidebar.tsx` | Update Docs panel to show saved documents with open/delete actions; pass document list as prop |

### Technical Details

**Drag-draw pattern** (used for line, highlight, ellipse):
```text
canvas.on('mouse:down') → create temp object, set isDrawing=true
canvas.on('mouse:move') → update object dimensions
canvas.on('mouse:up')   → finalize, set isDrawing=false
```

All drag-draw logic lives in `PdfCanvas.tsx` inside the tool-mode `useEffect`, attaching/detaching Fabric event handlers based on `activeTool`.

**Document loading**: `supabase.storage.from('admin-documents').download(storagePath)` → convert blob to ArrayBuffer → PDF.js render → restore annotations from JSONB.

