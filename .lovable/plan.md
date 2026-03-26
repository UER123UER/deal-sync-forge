

## Fix PDF Autofill: Precise Coordinates, Font, and Clarity

### Problems

1. **Wrong font** — Using `Courier, Courier New, monospace` but the Ahmed Mendez reference uses a clean sans-serif font (matches the PDF's native typeface)
2. **Coordinates off** — Current FIELD_MAP positions don't align with the actual blank lines on the PDF
3. **Blurry text** — Fabric.js canvas doesn't account for `devicePixelRatio`, causing fuzzy rendering on retina/HiDPI screens
4. **Page bleeding bug** — When switching pages, annotations from page 0 leak onto page 1 because `currentPage` is already updated when the cleanup runs

### Changes (single file: `src/pages/FormEditor.tsx`)

#### 1. Font change
Replace `'Courier, Courier New, monospace'` with `'Helvetica, Arial, sans-serif'` to match the Ahmed Mendez reference document's clean proportional font.

#### 2. Recalibrate FIELD_MAP coordinates
Using the Ahmed Mendez autofilled PDF as the ground truth, update every field position. Key reference points from the PDF:

**Page 0:**
- `sellerName` ("Ahmed Mendez"): x=54, y=82 — left-aligned on line 2 baseline
- `brokerCompany` ("United Estates Realty"): x=120, y=99 — after "and brokerage"
- `listingStartDate`: x=72, y=138 — beginning date blank
- `listingExpiration`: x=333, y=138 — termination date blank  
- `streetAddress` ("15236 SW 181st Ter, Miami, FL 33187"): x=153, y=196 — after "(a) Street Address:"
- `streetAddress2`: removed (full address fits on one line in this form)
- `listPrice` ("255,000"): x=107, y=340 — after "(a) Price: $"

**Page 4 (signature page):**
- `sellerPhone1` ("(561) 306-9490"): x=148, y=37 — after "Home Telephone:"
- `sellerAddress` ("15236 SW 181st Ter, Miami, FL 33187"): x=93, y=59 — after "Address:"
- `sellerEmail` ("ahmedmendez@gmail.com"): x=118, y=80 — after "Email Address:"
- `brokerFirmName` ("United Estates Realty"): x=182, y=167 — after "Brokerage Firm Name:"
- `brokerPhone` ("561-501-1044"): x=440, y=167 — after "Telephone:"
- `brokerAddress` ("222 NE 2nd Avenue, Miami, FL 33137"): x=93, y=187 — after "Address:"

#### 3. Fix blurry text
Increase `PDF_SCALE` from 1.5 to 2.0 for sharper rendering. Additionally, set the Fabric.js canvas to use `devicePixelRatio` so text renders crisply on HiDPI displays — set canvas element dimensions to `width * dpr` / `height * dpr` and use CSS to constrain visual size.

#### 4. Fix page bleeding
Add a `prevPageRef` to track the previous page index. When the canvas useEffect fires, save the old canvas JSON under `prevPageRef.current` (the OLD page), not `currentPage` (which is already the NEW page). Then update the ref.

### Technical Details

- Font size stays at 11pt (scaled by PDF_SCALE) — matches reference
- Fill color stays `#000000` (solid black)
- `streetAddress` field now contains the full address with city/state/zip since the ERS-21tb form has one continuous address line
- The `listPrice` value will be formatted with commas (e.g., "255,000") to match the reference
- Canvas DPR fix pattern: `canvasEl.width = pageWidth * dpr; canvasEl.style.width = pageWidth + 'px'`

