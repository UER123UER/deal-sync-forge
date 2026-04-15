

## Plan: Make Marketing Templates Responsive to Canvas Dimensions

### Problem
Currently, `fontScale` is based only on canvas width (`w / 1080`). This causes issues:
- **Landscape (1920×1080)**: Font scale becomes ~1.78, making text and padding enormous, squishing the photo area
- **Story (1080×1920)**: Layout is fine width-wise but doesn't take advantage of the extra vertical space
- **Custom sizes**: Proportions break at extreme aspect ratios

### Solution
Update the `buildTemplate` function in `src/data/marketingTemplates.tsx` to use smarter scaling:

1. **Font scale**: Use `Math.min(w, h) / 1080` instead of `w / 1080` — this prevents text from blowing up in landscape mode (the shorter dimension constrains the scale)

2. **Header/footer proportional sizing**: Scale padding based on the new font scale so these sections shrink appropriately for landscape and grow for portrait

3. **Logo width**: Scale based on the same `Math.min` approach so the logo doesn't become oversized in landscape

4. **Photo section**: Already uses `flex: 1` which will naturally benefit once header/footer stop being oversized

### File Changed
- `src/data/marketingTemplates.tsx` — one-line change to `fontScale` calculation (line 564), from `w / 1080` to `Math.min(w, h) / 1080`

