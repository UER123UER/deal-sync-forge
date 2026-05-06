## Mobile Audit — Findings & Fix Plan

I scanned every page and shared component for the same class of issues you reported on the People page (panel wider than the viewport, can't scroll, content cut off). Here's everything I found and how I'll fix it.

### Category 1 — Side panels wider than a phone (same bug as People)

These slide-over panels use a fixed pixel width that exceeds a 390px viewport, so labels and form fields are cut off the left edge and the panel can't scroll horizontally.

| File | Current | Fix |
|---|---|---|
| `src/components/deal/SignaturePanel.tsx` (line 131) | `w-[400px]` | `w-full md:w-[400px]` + `initial/exit x: '100%'` |
| `src/components/admin/PdfEditorSidebar.tsx` (line 103) | `w-[350px]` always shown | hide on mobile or make `w-full md:w-[350px]` (PDF editor isn't usable on phone but should at least not break) |
| `src/pages/MarketingEditor.tsx` modal (line 3009) | `w-[480px] max-w-[95vw]` — OK, but inner grids are cramped | verify padding `p-6` → `p-4 md:p-6` |

### Category 2 — People page header/toolbar overflow on mobile

The People page header (`src/pages/People.tsx` line 712) uses a single horizontal flex row with `px-6`, a 256px search box (`w-64`), view toggle, and Add Contact button — on a 390px screen these wrap awkwardly and the search bar overflows. The 4-column stats grid (`grid-cols-4`, line 744) squeezes "Total Contacts / Follow-up Overdue" into 2-line stacks (visible in your screenshot 2).

Fixes:
- Header: stack on mobile — search becomes full-width on its own row, view toggle hidden on mobile (board view isn't usable), Add Contact stays.
- Stats bar: `grid-cols-2 md:grid-cols-4` so each card has room to breathe.
- Filter bar: it already uses `flex-wrap`, but the 5 select triggers (`w-32` each = 640px total) overflow — change to `flex-1 min-w-[8rem]` so they share rows cleanly.

### Category 3 — Pages not built around the standard PageShell

These pages render their own custom header/toolbar instead of `PageShell`, so they don't get the responsive padding/wrapping defined in `src/index.css` (lines 320–385):

- `src/pages/People.tsx` — custom header with `px-6` and `h-14`
- `src/pages/Inbox.tsx` — needs verification
- `src/pages/MarketingEditor.tsx` — editor toolbar is desktop-only
- `src/pages/AdminPdfEditor.tsx`, `src/pages/FormEditor.tsx` — desktop-only tools

Fix: convert People's header/toolbar to use the same responsive padding tokens (`var(--page-padding-x)`) and wrap-friendly layout the rest of the app uses.

### Category 4 — Non-responsive 2-column grids on small phones

`grid-cols-2` with no `sm:` breakpoint becomes very tight on a 360–390px screen (each cell ≈ 170px minus padding):

- `src/pages/NewDeal.tsx` (lines 413, 416, 428, 447, 450, 460, 465) — 7 instances
- `src/pages/Profile.tsx` (line 509) — First/Last name
- `src/pages/Finances.tsx` (line 187)
- `src/pages/People.tsx` form (lines 1238, 1306) — First/Last name + dates

Fix: change `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` (or keep 2-col only for short pairs like First/Last name where it's readable).

### Category 5 — Bottom mobile nav overlap

`src/components/layout/AppLayout.tsx` already adds `pb-16` to clear the bottom nav, but several panels and the People side-panel use `bottom-0` which goes *under* the bottom nav (60–64px). The Save Contact button in your screenshot 1 is partially behind the iOS home indicator + browser chrome.

Fix: side panels on mobile use `bottom-16` (above bottom nav) and add `pb-[env(safe-area-inset-bottom)]` to the footer button row.

### Category 6 — Tables that need horizontal scroll on mobile

- `src/pages/People.tsx` list view (line 877) — `<table className="w-full">` with 6+ columns. Wrap in `overflow-x-auto` and add `min-w-[640px]` to the table, OR render a card layout on mobile.
- `src/pages/Transactions.tsx`, `src/pages/Finances.tsx` — same pattern, need verification.

### Category 7 — Touch target sizes

Many controls use `h-7` or `h-8` (28–32px). Apple/Google guidelines recommend ≥44px. On the People filter bar, the select triggers and the view toggle buttons fall well below this. Fix: bump to `h-9` on mobile (`h-9 md:h-8`).

---

## Implementation order

1. **Side panels (Category 1)** — apply the same `w-full md:w-[Xpx]` fix to SignaturePanel and PdfEditorSidebar.
2. **People page mobile layout (Categories 2, 3, 6, 7)** — restructure header/toolbar/stats/table for mobile.
3. **Bottom nav clearance (Category 5)** — adjust panel `bottom` and add safe-area padding to footer button rows on People, Tasks, SignaturePanel.
4. **Form grids (Category 4)** — `grid-cols-1 sm:grid-cols-2` sweep across NewDeal, Profile, Finances, People form.
5. **Quick verification pass** — open Inbox, Calendar, MarketingEditor, Listings on a 390px viewport via the browser tool, screenshot, and patch any remaining overflow.

### Out of scope (intentionally)

- `AdminPdfEditor` / `FormEditor` / `MarketingEditor` canvas — these are inherently desktop tools (Authentisign clone). I'll make them not crash on mobile but won't redesign them for touch.
- The bottom mobile nav itself — already working correctly.

Approve and I'll implement in the order above.