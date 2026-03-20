

## Fix Build Error + Build Marketing Center (Canva-like for Real Estate)

### 1. Fix Build Error
Line 40 in `DealDetail.tsx` — `formatPriceWithCommas` is missing its closing `}`. Add `};` before `const MARKETING_ITEMS`.

### 2. Marketing Center — Architecture

Based on the reference screenshots (Rechat/Douglas Elliman studio), build a **template-based marketing editor** that auto-fills deal data into pre-designed templates. Agents pick a template, it populates with their listing's data (address, price, photos, beds/baths), and they can edit text before exporting.

**New route**: `/transactions/:id/marketing` — full-screen marketing editor
**New page**: `src/pages/MarketingEditor.tsx`

### 3. Marketing Hub (replaces simple checklist in Marketing tab)

Replace the current Marketing tab checklist in DealDetail with a **template gallery** organized by category:

- **Category filter chips**: Open House, Coming Soon, Just Listed, New Price, Under Contract, Just Sold
- **Template types per category**: Email templates, Social Posts (square 1080x1080), Flyers (8.5x11), Stories (9:16)
- Each template card shows a preview thumbnail; clicking opens the editor at `/transactions/:id/marketing`

### 4. Marketing Editor Page (`MarketingEditor.tsx`)

A Canva-like editing experience:

- **Canvas area** (center): Renders the template at fixed resolution (e.g., 816x1056 for 8.5x11 flyer), scaled to fit viewport
- **Right sidebar**: Properties panel with sections:
  - **Basics** (collapsible): Edit headline, subheadline, description, price, address
  - **Agents** (collapsible): Agent name, title, phone, email, photo
  - **Font Size** slider
  - **Alignment** buttons (left/center/right)
  - **Color** swatches for text color
  - **Background Color** swatches
- **Top toolbar**: Template name display, zoom controls, Save & Share button, close button
- **Auto-fill**: On load, pull deal data (address, city, state, price, beds/baths from deal + contacts) and populate template fields
- All text on the canvas is **contentEditable** — click to edit inline

### 5. Template System

Define templates as data objects in `src/data/marketingTemplates.ts`:

```text
Template {
  id, name, category, type (email|post|flyer|story),
  width, height,
  render: (data: TemplateData) => ReactNode
}

TemplateData {
  address, city, state, zip, price,
  beds, baths, sqft, lotSize,
  photos: string[],
  agentName, agentTitle, agentPhone, agentEmail,
  headline, subheadline, description,
  openHouseDate, openHouseTime
}
```

Create 8-12 built-in templates:
- 2 flyer layouts (Window Display, Multi-Image)
- 2 open house flyers
- 2 social media posts (Just Listed, Open House)
- 2 email templates
- 2 story templates (Coming Soon, Just Sold)

### 6. Export

- **Save & Share** button: Export canvas as PNG using `html-to-image` library (or `html2canvas`)
- Download the generated image directly

### 7. Files to Create/Modify

| File | Action |
|------|--------|
| `src/pages/DealDetail.tsx` | Fix build error (line 40). Replace Marketing tab with template gallery grid |
| `src/data/marketingTemplates.tsx` | New — template definitions as React components |
| `src/pages/MarketingEditor.tsx` | New — full-screen Canva-like editor |
| `src/App.tsx` | Add route `/transactions/:id/marketing` |

### Technical Details

- Templates render as pure React components at fixed pixel dimensions, scaled via CSS `transform: scale()` for preview thumbnails and editor canvas
- `html-to-image` (npm package) converts the canvas DOM node to PNG for download
- No backend changes needed — templates are client-side, populated from existing deal data
- Editor state is local (`useState`) — edits persist only for the session (or until Save exports)

