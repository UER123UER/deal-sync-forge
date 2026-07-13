## CRM Improvements — Autonomous Build

I'll implement the highest-leverage upgrades to the CRM using only frontend + presentation code plus existing Supabase tables (no schema changes, no new secrets, no external services). Everything below is scoped so I can complete it without asking you anything.

### 1. Contacts: Lead Score + Source visible everywhere
- Show the computed lead score badge (already in `useContacts.ts`) on every contact row in `People.tsx` and on the contact detail drawer.
- Add color-coded score chip (red/amber/green) using existing `leadScoreColor` helper.
- Show contact source (Referral, Zillow, etc.) as a chip on rows.

### 2. Smart lists / saved filter views on People
- Add quick-filter tabs above the contacts list:
  - **All**, **Hot leads** (score ≥ 70), **Needs follow-up** (no touch in 30+ days), **VIP**, **Has upcoming touch**, **No email/phone**.
- Client-side filtering only — no DB changes.

### 3. Global search (⌘K command palette)
- New `CommandPalette` component mounted in `AppLayout`.
- Searches contacts, deals, tasks, and jumps to routes.
- Keyboard shortcut ⌘K / Ctrl+K.

### 4. Quick-add floating action button
- Global FAB in `AppLayout` on mobile + desktop with menu: New contact, New deal, New task.
- Opens existing forms/dialogs.

### 5. Dashboard on Home of CRM (Transactions landing)
- Add a compact stats strip at the top of `Transactions.tsx`:
  - Active deals, pipeline value, closed this month, avg days-to-close, tasks due today.
- Pure client-side aggregation over existing deals/tasks queries.

### 6. Tasks improvements
- "Due today" and "Overdue" sections at top of `Tasks.tsx`.
- Inline complete-toggle checkbox on each row.
- Overdue rows highlighted.

### 7. Stale-leads surfacing
- On People page, a dismissible banner: "You have N leads with no touch in 60+ days — review them."
- Clicking it applies the "Needs follow-up" smart filter.

### 8. Contact detail polish
- Show lead score prominently in the detail drawer header.
- Add a "Log touch" one-click button that sets `last_touch = now()` and appends a `touch_logged` activity via `useCreateContactActivity`.

### 9. Duplicate-contact detection
- On People, detect contacts sharing email or phone and show a subtle "Possible duplicates" badge with a review dialog offering to merge tags/notes into one and delete the other.

### 10. Mobile audit fixes
- Ensure People rows, Tasks rows, and Deal detail are usable at 390px (current viewport). Fix any overflow found.

### 11. Runtime hydration errors
- Fix the SSG hydration mismatch currently reported (Text content does not match server-rendered HTML) — likely a date/time or `Math.random`/`Date.now` used during render. I'll locate and gate it behind a client-only mount.

### Out of scope (needs your input or bigger lift)
- Kanban pipeline drag-and-drop (needs a `stage` column decision).
- Email/SMS sending from CRM (needs SMTP/Twilio setup you haven't approved).
- Voice-to-note (needs a mic-permission UX decision).
- Analytics dashboard beyond the stats strip (needs chart scope).

### Technical notes
- No DB migrations. All features use existing tables: `contacts`, `deals`, `tasks`, `deal_notes` (via `useContactActivities`).
- No new dependencies expected; will reuse shadcn `Command`, `Dialog`, `Badge`, `Sheet` already in the project.
- Verify with `tsgo` typecheck + Playwright screenshots at 390px and 1280px after build.

If you approve, I'll implement all 11 items in one pass and report back with screenshots.