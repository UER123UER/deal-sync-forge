

## "Coming Soon" Items — Complete List and Implementation Plan

Here is every "coming soon" placeholder in the app, grouped by page, and the plan to make each one functional.

---

### A. Sidebar Pages (4 items)
**Currently**: Routes in `App.tsx` render static "Coming soon" divs.

| # | Page | Plan |
|---|------|------|
| 1 | **Listings** `/listings` | Create `src/pages/Listings.tsx` — a grid/table of deals filtered to `status = 'active'`, showing address, price, photos placeholder, MLS#. Reuses `useDeals` hook. |
| 2 | **Open House** `/open-house` | Create `src/pages/OpenHouse.tsx` — requires new `open_houses` table (deal_id, date, start_time, end_time, notes). Page shows upcoming open houses in a card/list view with ability to create/edit/delete. |
| 3 | **Calendar** `/calendar` | Create `src/pages/Calendar.tsx` — a monthly calendar view showing tasks (by due_date) and open houses. Use a simple custom calendar grid or `react-day-picker` in month mode. Clicking a day shows that day's items. |
| 4 | **Finances** `/finances` | Create `src/pages/Finances.tsx` — summary dashboard pulling commission data from deals/contacts. Show total expected commissions, per-deal breakdown, simple bar chart of monthly volume. |

### B. Deal Detail Tabs (4 items)
**Currently**: `{activeTab} — Coming soon` for Photos, Tasks, Notes, Marketing.

| # | Tab | Plan |
|---|-----|------|
| 5 | **Photos** | Create Supabase storage bucket `deal-photos`. Tab shows upload dropzone, grid of uploaded photos with delete. New hook `useDealPhotos`. |
| 6 | **Tasks** | Filter existing `tasks` table by deal_id (requires adding `deal_id` column to tasks table). Show deal-specific tasks with create/complete/delete inline. |
| 7 | **Notes** | New `deal_notes` table (id, deal_id, content, created_at). Tab shows chronological notes with text input to add new ones. |
| 8 | **Marketing** | Simple marketing checklist/status panel — e.g. "Yard Sign", "Flyer", "Social Post" with toggle states. New `deal_marketing` table or store as JSON. |

### C. Deal Detail Action Buttons (8 items)
**Currently**: `toast.info('... coming soon')`.

| # | Button | Plan |
|---|--------|------|
| 9 | **Make Visible To Office** | Add `visible_to_office` boolean column to deals. Toggle it on click, show badge when active. |
| 10 | **Schedule Open House** | Open a dialog to create an open house entry (reuses open_houses table from item 2). |
| 11 | **View Open Houses** | Navigate to `/open-house?deal={id}` or show filtered list in a dialog. |
| 12 | **Add Offer** | New `offers` table (id, deal_id, amount, buyer_name, status, created_at). Dialog to create offer, list in sidebar. |
| 13 | **Email** (action bar) | Open `mailto:` link with deal contacts pre-filled. |
| 14 | **Add a New Contact** | Open a dialog/popover to search existing contacts or create new, then link via `deal_contacts`. |
| 15 | **Download Archive** | Generate a ZIP of deal data (JSON export + any uploaded files) using client-side JSZip. |
| 16 | **Checklist Email/Upload/Message/Notify** | Email: `mailto:` with doc name. Upload: file input that stores to Supabase storage. Message Office: toast confirmation. Notify: toast confirmation (placeholder for future notification system). |

### D. Transactions Page (1 item)
| # | Button | Plan |
|---|--------|------|
| 17 | **Download Forms** | Generate a PDF/ZIP of all checklist form data for selected deals. Use client-side generation. |

### E. People Page (3 items)
| # | Button | Plan |
|---|--------|------|
| 18 | **Import CSV** | File input + CSV parser (papaparse). Parse rows, preview in dialog, bulk insert to contacts table. |
| 19 | **Google Connect** | Placeholder OAuth flow — show info that Google Contacts sync requires OAuth setup in Supabase dashboard. |
| 20 | **Microsoft Connect** | Same as Google — show setup instructions dialog. |

### F. Inbox Page (3 items)
| # | Button | Plan |
|---|--------|------|
| 21 | **New Email** | Open a compose dialog with To/Subject/Body fields. Since no email backend exists, show a toast that email sending requires SMTP/API configuration. |
| 22 | **Sign in with Google** | Show dialog explaining Google OAuth email integration requires setup. Link to Supabase auth providers dashboard. |
| 23 | **Sign in with Outlook** | Same as Google — show setup dialog for Microsoft OAuth. |

---

### Database Migrations Required

1. **`open_houses`** table: id, deal_id (FK), scheduled_date, start_time, end_time, notes, created_at
2. **`deal_notes`** table: id, deal_id (FK), content (text), created_at
3. **`offers`** table: id, deal_id (FK), amount (text), buyer_name (text), status (text), notes (text), created_at
4. **Add `deal_id`** column to `tasks` table (nullable UUID)
5. **Add `visible_to_office`** column to `deals` table (boolean, default false)
6. **Create `deal-photos`** storage bucket

### New Files
- `src/pages/Listings.tsx`
- `src/pages/OpenHouse.tsx`
- `src/pages/Calendar.tsx`
- `src/pages/Finances.tsx`
- `src/hooks/useOpenHouses.ts`
- `src/hooks/useDealNotes.ts`
- `src/hooks/useOffers.ts`
- `src/hooks/useDealPhotos.ts`

### Modified Files
- `src/App.tsx` — replace placeholder routes with new page components
- `src/pages/DealDetail.tsx` — implement all 4 tabs + wire action buttons
- `src/pages/Transactions.tsx` — implement Download Forms
- `src/pages/People.tsx` — implement CSV import, show setup dialogs for Google/Microsoft
- `src/pages/Inbox.tsx` — implement compose dialog + setup dialogs
- `src/hooks/useTasks.ts` — support optional deal_id filtering
- `src/hooks/useDeals.ts` — add visible_to_office toggle hook

