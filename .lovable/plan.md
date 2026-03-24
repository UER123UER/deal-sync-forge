

## Multi-Feature Update Plan

The user is requesting 8 distinct changes. Here's the plan:

---

### 1. Seller Search in NewDeal (Step 5)
Add a contact search input above the Role field in the Seller Legal Name step. When the user types, filter existing contacts (from `useContacts`). Selecting a contact auto-fills first name, last name, email, phone, and company into `sellerForm`.

**File**: `src/pages/NewDeal.tsx` — Add search input + dropdown similar to Step 4's agent search, but for sellers.

---

### 2. Export Contacts (People page)
Add an "Export" button next to the New Contact dropdown on the People page. Clicking it generates a CSV of all contacts (or filtered/selected contacts) using PapaParse's `unparse` and triggers a download.

**File**: `src/pages/People.tsx` — Add Export button, implement CSV download using `Papa.unparse`.

---

### 3. Role Dropdown in New Contact Panel
Replace the free-text Role input in the create/edit contact panel with a `<Select>` dropdown using the same `CONTACT_ROLES` list from DealDetail (Buyer, Buyer Agent, Seller, Seller Broker, Title, etc.).

**File**: `src/pages/People.tsx` — Import `Select` components, replace Role `<Input>` with `<Select>`.

---

### 4. Remove "Download Forms" Button
Remove the Download Forms button and its handler from the Transactions page.

**File**: `src/pages/Transactions.tsx` — Remove `handleDownloadForms` function and the button.

---

### 5. Referral Tab (New Page)
Create a new Referral page at `/referral` with:
- A generated QR code (using a lightweight library or inline SVG via `qrcode` npm package) pointing to a referral link
- A copyable referral link
- Earnings display: "$20 per referral" with a mock counter of total earned

Add "Referral" nav item in the sidebar below Finances.

**Files**: New `src/pages/Referral.tsx`, update `AppSidebar.tsx` and `App.tsx`.

---

### 6. Calendar: Add Holidays + Create Events
Enhance the Calendar page:
- Add US federal holidays (hardcoded list) displayed on their respective days
- Add a "+" button or click-on-day to create events/tasks directly from the calendar
- Show a dialog to enter event title, date, and optionally time
- Use the existing `useCreateTask` hook to persist

**File**: `src/pages/Calendar.tsx` — Add holidays data, add create-event dialog, wire to `useCreateTask`.

---

### 7. Fix Photo Upload
The photo upload hook looks correct but may fail due to Supabase storage bucket permissions. Check and ensure the upload flow works. The code itself (`useDealPhotos.ts`) appears functional — the issue is likely a missing storage bucket or RLS policy. Will add error toast feedback so failures are visible.

**File**: `src/pages/DealDetail.tsx` — Ensure `handlePhotoUpload` shows error details on failure.

---

### 8. Remove "Report an Issue" Button
Remove the Report an Issue button from the FormEditor header.

**File**: `src/pages/FormEditor.tsx` — Remove the button (lines 156-158).

---

### 9. Contact Brokerage Tab (New Page)
Create a new "Contact Brokerage" page at `/contact-brokerage` with:
- A category dropdown: Compliance Question, IT Question, General Question
- File upload area for images, PDFs, and documents (stored in Supabase storage or shown as attachments)
- A message/description textarea
- Submit button that shows a success toast

Add "Contact Brokerage" nav item in the sidebar below Referral.

**Files**: New `src/pages/ContactBrokerage.tsx`, update `AppSidebar.tsx` and `App.tsx`.

---

### Summary of File Changes

| File | Change |
|------|--------|
| `src/pages/NewDeal.tsx` | Add seller contact search above Role field |
| `src/pages/People.tsx` | Add Export button + Role dropdown in contact panel |
| `src/pages/Transactions.tsx` | Remove Download Forms button |
| `src/pages/FormEditor.tsx` | Remove Report an Issue button |
| `src/pages/Calendar.tsx` | Add holidays + create event from calendar |
| `src/pages/DealDetail.tsx` | Better error handling on photo upload |
| `src/pages/Referral.tsx` | New page: QR code, referral link, earnings |
| `src/pages/ContactBrokerage.tsx` | New page: category dropdown, file upload, message |
| `src/components/layout/AppSidebar.tsx` | Add Referral + Contact Brokerage nav items |
| `src/App.tsx` | Add routes for `/referral` and `/contact-brokerage` |

