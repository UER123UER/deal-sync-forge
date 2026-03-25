

## Autofill the Real Legal PDF from Deal Data

### Problem

The current FormEditor uses a custom HTML document (`ListingAgreementDocument.tsx`) that mimics the listing agreement but is not the actual legal PDF. The user needs the **real uploaded PDF** (the one stored in admin-documents, e.g. "Exclusive Right Of Sale Listing Agreement Single Agent ERS-20sa-3.pdf") to be rendered and autofilled with deal data — overlaying text on the exact PDF coordinates without modifying the PDF structure.

### Approach

Rewrite `FormEditor.tsx` to:
1. **Load the legal PDF from admin-documents storage** — find the matching admin document by file name (or let the user pick one), download it, render each page with PDF.js
2. **Overlay Fabric.js text objects** at predefined coordinates on the PDF pages — placing deal data (seller name, broker name, address, price, dates) at the exact positions where those blanks appear in the real PDF
3. **Define a field coordinate map** — a configuration object that maps field keys (sellerName, brokerName, propertyAddress, listPrice, etc.) to `{page, x, y, width, fontSize}` so each value lands precisely on the correct blank line of the PDF
4. **Keep the PDF unchanged** — the PDF is rendered as a background image; autofilled data appears as Fabric.js IText overlays that can be repositioned if needed

### Architecture

```text
FormEditor loads deal data → finds admin document PDF → renders with PDF.js
→ for each field in coordinate map, places an IText overlay with the deal value
→ user can adjust/edit overlays → Save persists annotations back to admin_documents
→ Send for Signature works as before
```

### Field Coordinate Map

A TypeScript object defining where each field goes on the PDF (coordinates calibrated to the ERS-20sa form at 1.5x scale):

```typescript
const FIELD_MAP: Record<string, { page: number; x: number; y: number; width: number; fontSize: number }> = {
  sellerName: { page: 0, x: 180, y: 118, width: 400, fontSize: 11 },
  brokerCompany: { page: 0, x: 270, y: 140, width: 350, fontSize: 11 },
  listingStartDate: { page: 0, x: 200, y: 190, width: 120, fontSize: 11 },
  listingExpiration: { page: 0, x: 420, y: 190, width: 120, fontSize: 11 },
  propertyAddress: { page: 0, x: 250, y: 270, width: 400, fontSize: 11 },
  listPrice: { page: 0, x: 220, y: 365, width: 150, fontSize: 11 },
  // ... more fields
};
```

These coordinates will need fine-tuning — I'll calibrate them against the actual PDF rendering.

### Files Changed

| File | Change |
|------|--------|
| `src/pages/FormEditor.tsx` | **Rewrite** — replace HTML document with PDF.js rendering + Fabric.js autofill overlays. Load PDF from admin-documents, apply field map, render with PdfCanvas-like approach |
| `src/components/deal/ListingAgreementDocument.tsx` | **No change** — kept for SignDocument page but no longer used in FormEditor |

### Key Details

- **PDF discovery**: Query `admin_documents` for a document whose `file_name` contains "ERS" or "Listing Agreement". If multiple exist, use the most recently uploaded one. If none found, show a message directing the user to upload one in the Admin PDF Editor first.
- **Reuses PdfCanvas component**: The existing `PdfCanvas` component handles Fabric.js overlays on PDF pages — FormEditor will use the same pattern but in a read-focused mode with autofilled IText objects.
- **Editable overlays**: Each autofilled field is an `IText` object so the user can click and adjust text if needed.
- **Save flow**: Saves annotations (the filled field positions + values) back to the deal or as a separate record, and the existing "Send for Signature" panel remains functional.
- **Page navigation**: Multi-page PDF navigation with prev/next buttons, same as AdminPdfEditor.

