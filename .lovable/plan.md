

## Pixel-Perfect Alignment with Reference Screenshots

### Analysis of Differences

After studying all 30+ reference images against the current codebase, here are the gaps:

---

### 1. Sidebar Navigation — Missing Items

**Current**: 3 items (Transactions, Listings, Open House)
**Reference**: ~8 items including +, People/Contacts, Tasks, Inbox/Calendar, Transactions, Open House, and $ (Finances)

**Changes**:
- Add nav items: + (create), Contacts (people icon), People (contacts icon), Tasks (hand/gesture icon), Transactions, Listings/Open House, $ (Finances)
- Match the exact icon ordering from screenshots
- Add the People dropdown that shows: People, Calendar, Tasks, Inbox sub-menu

### 2. New Pages — People/Contacts

**Missing entirely.** Reference shows:
- `/people` route with a contacts table (6980 Contacts)
- Columns: Contact name (checkbox), Email, Phone, Tags, Last Touch, Next Touch
- Filter bar: All Contacts dropdown, Leads, Tags, Parked Contacts, Assignee, Flow, More
- Right actions: Lead Routing button, + New Contact button
- New Contact dropdown: Add contact manually, Import CSV Spreadsheet, Google (Connect), Microsoft (Connect)
- Mock data with ~15 sample contacts

### 3. New Pages — Tasks

**Missing entirely.** Reference shows:
- `/tasks` route with task table
- Filters: Assignee, Status, Type, Date Range
- Columns: Task, Description, Contacts, Due Date, End Date
- Empty state: icon + "Click the Add Task button to create a new task."
- "+ New Task" button opens right slide-over panel with:
  - Type tabs: Todo, Call, In-Person Meeting, Note, More
  - Fields: title, Add Description link, Due Date, Attach Client, Attach Property, Attach Deal
  - Footer: Add Assignee (with avatar), Save button

### 4. New Pages — Inbox

**Missing entirely.** Reference shows:
- `/inbox` route
- "+ New Email" button
- Empty state: mailbox icon + "See your emails here!" + "Connect your Google or Outlook account..." text
- Sign in with Google / Sign in with Outlook buttons

### 5. Signature Panel — Wording & Layout Fixes

**Current vs Reference**:
- Title: "Send for Signature" → **"Send for Signatures"**
- Subject default: "Signature Required: {doc}" → **"Please DocuSign"**
- From field: "Current User" → **"Karl Brisard <karl.brisard@elliman.com>"** (with dropdown arrow)
- To: recipients shown differently — **"Add New Recipient"** with + icon, red asterisk on label
- From/Subject/Message labels need red asterisks for required fields
- Attachment: show document name truncated + "Uploaded Jan 21, 7:42 AM" timestamp + document icon
- Bottom CTA: "Send for Signature" → **"Next: View in Docusign"** (right-aligned, muted style)

### 6. Deal Detail — Checklist Row Actions

**Current**: Actions hidden, shown on hover
**Reference**: "Edit Form" button + chevron dropdown always visible on right side of each row (not just hover). The dropdown chevron is separate from Edit Form button, styled as a split button group.

- Each parent row: `[Edit Form] [v]` buttons always visible on right
- Each nested Digital Form row: same `[Edit Form] [v]` pattern
- Highlighted row (light blue bg) shows "Message Office" button between name and Edit Form
- Dropdown from chevron: View/Print, Docusign, Email, Upload, Message Office, Notify Office to Review, Delete

### 7. Deal Detail — Left Panel Styling

**Current vs Reference**:
- Timeline header: needs bell/notification icon beside "Timeline"
- Timeline items: need circle dots on left (timeline indicator line)
- MLS#: show **"Add MLS# Number"** as clickable link when empty (not "—")
- Contacts: role text right-aligned ("Seller Agent", "Seller")
- "Add a New Contact" with people+ icon

### 8. Sidebar — People Dropdown Sub-menu

The contacts/people icon in sidebar has a dropdown showing: People, Calendar, Tasks, Inbox

---

### Implementation Plan

**File changes**:

| File | Action |
|------|--------|
| `src/components/layout/AppSidebar.tsx` | Add all missing nav items with correct icons and People dropdown |
| `src/pages/People.tsx` | **Create** — contacts table with filters, mock data, New Contact dropdown |
| `src/pages/Tasks.tsx` | **Create** — tasks page with table, filters, Add Task slide-over |
| `src/pages/Inbox.tsx` | **Create** — inbox empty state with email connect buttons |
| `src/App.tsx` | Add routes for `/people`, `/tasks`, `/inbox` |
| `src/components/deal/SignaturePanel.tsx` | Fix wording, layout, and button text per reference |
| `src/pages/DealDetail.tsx` | Fix checklist row actions (always visible split button), left panel styling (timeline dots, MLS link, contact layout) |
| `src/store/deals.ts` | Add contacts store data for People page |

### Technical Details

- People page mock data: ~15 contacts with names, emails, phones, tags
- Tasks page: Zustand store extension for tasks (title, description, contacts, due date, end date, type, assignee)
- Sidebar: Use Popover for People dropdown sub-menu
- Checklist split button: border-grouped `[Edit Form | v]` using flex + rounded corners
- All wording changes are exact matches to reference screenshots

