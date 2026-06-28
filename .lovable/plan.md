## Plan: Publish 6th blog — "How to Become a Real Estate Agent in Florida"

### 1. Hero image
Generate `src/assets/how-to-become-real-estate-agent-florida-2026.jpg` (16:9) — Florida real estate / palm trees + agent with sold sign style, premium quality.

### 2. Add post to `src/data/blogPosts.tsx`
- Import the new asset JSON.
- Create `FloridaLicenseArticle` component using existing `H2`, `H3`, `P`, `UL`, `Internal`, and `DataTable`/`TH`/`TD` helpers for the cost breakdown table.
- Add `FLORIDA_FAQ` array (5 FAQ items from the brief) mapped through `<Faq>`.
- Append new `BlogPost` entry to `blogPosts` array:
  - **slug**: `how-to-become-real-estate-agent-florida-2026`
  - **title**: "How to Become a Real Estate Agent in Florida: Step-by-Step Guide for 2026"
  - **description / excerpt**: short summary from intro
  - **date**: 2026-06-28
  - **readMinutes**: ~9
  - **author**: same as others
  - **image / imageAlt**: new asset
- Include internal links to `/` (United Estates Realty) and `/software` (CRM) inside the brokerage activation section and closing CTA.

### 3. SEO / sitemap
Append the new URL to `public/sitemap.xml`:
`https://unitedestatesagent.com/blog/how-to-become-real-estate-agent-florida-2026`

### 4. Verify
Run `bun run build:dev` and quick Playwright check on `/blog/how-to-become-real-estate-agent-florida-2026`.

### Technical notes
- Cost table: render as Table with columns "Cost Item" / "Amount".
- Headings preserved exactly as marked (H1 = page title, H2 per step, H3 inside FAQ).
- No business-logic / backend changes.
