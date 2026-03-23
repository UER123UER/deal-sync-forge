

## Rebuild SignDocument.tsx — DocuSign-like Guided Signing Experience

### What Changes

**Only one file changes**: `src/pages/SignDocument.tsx` — complete rewrite.

The hook (`useSignatureRequests.ts`), panel (`SignaturePanel.tsx`), and route (`App.tsx`) remain unchanged.

### Architecture

The document currently renders the form content with a separate signing area below it. The rewrite places interactive field overlays directly ON the document, with a sequential guided flow.

### Field System

Define an array of signable fields based on the current recipient's role:

```text
fields = [
  { id: 'signature', type: 'signature', label: 'Sign Here', position on document },
  { id: 'initials', type: 'initials', label: 'Initial', position on document },
  { id: 'date_signed', type: 'date', label: 'Date Signed', auto-fills today's date }
]
```

Each field has states: `empty` → `active` → `completed`.

The active field index is tracked in state. When a field is completed, activeFieldIndex increments automatically, and the next field scrolls into view with a highlight animation.

### Signing Modal

When clicking a signature or initials field:
- A centered modal opens with Draw / Type tabs
- Draw: HTML5 canvas (same as current)
- Type: text input with Dancing Script cursive preview
- "Create Signature" button confirms → fills the field → closes modal → auto-advances

Date fields auto-fill immediately on click (today's date) → auto-advance.

### Field Rendering

Fields render as absolutely positioned overlays on the document container:
- **Empty**: Yellow/amber background, dashed border, pulsing label ("Sign Here ↓"), clear click target
- **Active**: Stronger yellow highlight, glowing border animation, scrolled into view
- **Completed**: Shows signature image or typed name, subtle green check, no highlight, visually locked

### Layout

```text
┌─────────────────────────────────────────────┐
│ Header: DocuSign-blue bar                    │
│ Doc title | From: sender | Signing as: name  │
│ Progress: "1 of 3 fields completed"          │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────── Document ────────┐                │
│  │ EXCLUSIVE RIGHT OF SALE  │                │
│  │ ...contract text...      │                │
│  │                          │                │
│  │  ┌─[Sign Here]──────┐   │  ← overlay     │
│  │  │  yellow field     │   │                │
│  │  └──────────────────┘   │                │
│  │                          │                │
│  │  ┌─[Initial]────────┐   │                │
│  │  │  yellow field     │   │                │
│  │  └──────────────────┘   │                │
│  │                          │                │
│  │  ┌─[Date Signed]────┐   │                │
│  │  │  yellow field     │   │                │
│  │  └──────────────────┘   │                │
│  └──────────────────────────┘                │
│                                              │
│  ┌─[Finish Signing]─────────┐  ← only when  │
│  │  strong yellow CTA        │    all done    │
│  └───────────────────────────┘                │
└─────────────────────────────────────────────┘
```

### Auto-Advance Flow

1. Page loads → first empty field is marked active → scrolled into view
2. User clicks active field → modal opens (signature/initials) or auto-fills (date)
3. On confirm → field marked completed → `activeFieldIndex++` → next field scrolls into view with `scrollIntoView({ behavior: 'smooth', block: 'center' })`
4. When all fields completed → "Finish Signing" CTA appears with strong highlight
5. Clicking "Finish Signing" → calls `useSignDocument` mutation → shows completion screen

### Signature Reuse

Once the user creates a signature (draw or type), it's stored in local state. Subsequent signature/initials fields auto-fill with the same signature — user just confirms. This matches DocuSign's "adopt and sign" pattern.

### Visual Style

- Header: `#4C00C2` (DocuSign-like deep blue/purple) with white text
- Field highlights: `bg-amber-100 border-amber-400` for empty, `ring-2 ring-amber-500 shadow-lg` for active
- Completed fields: `bg-white border-green-300` with green checkmark
- Finish CTA: Large amber/yellow button, centered below document
- Progress indicator in header: "1 of 3 completed" with mini progress bar

### Completion Screen

Same as current — centered success message with green check, document name, "You may close this window."

