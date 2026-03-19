

## Real Estate Transaction Management Platform

### Overview
A full-featured real estate transaction management interface with deal creation workflows, checklist management, document editing, and signature sending — all matching the reference screenshots pixel-for-pixel.

### Phase 1: Layout & Navigation
- **App Shell**: Fixed 64px icon sidebar (dark slate) + main content area + top header bar
- **Sidebar Navigation**: Transactions (active), Listings, Open House icons with tooltip labels and expandable text menu
- **Routing**: `/transactions`, `/transactions/new`, `/transactions/:id`, `/transactions/:id/form/:formId`

### Phase 2: Transactions Dashboard
- Search bar with placeholder "Search deals by address, MLS# or agent name"
- Action buttons: Export Deals, Download Forms, + New Deal
- Tab filters: All Deals, Draft, Active, Pending, Archive
- Data table with columns: Address (with thumbnail), Status, Price, Critical Dates, Primary Agent
- Mock data with sample deals; clicking a row navigates to deal detail
- Analytics and View controls in top-right of tab bar

### Phase 3: New Deal — Multi-Step Flow
Full-page guided flow with "Create New Deal" header and close (X) button. Each step transitions smoothly:

1. **Property Type**: Radio list — Sale-Condo, Sale-Single Family Home, Sale-Land, Sale-New Construction, Sale-Commercial, Lease-Commercial, Lease-Condo, Lease-Single Family Home, Referral
2. **Property Address**: Input field ("Enter MLS# or Address") with mock autocomplete dropdown showing address suggestions with pin icons, plus Skip button
3. **Representation Side**: Buyer / Seller / Both radio options — selecting auto-advances and reveals next section inline
4. **Agent Search**: "Search for teams or agents" with grouped results showing team name, location, and individual agents with avatars
5. **Seller Info**: Legal name input or "Add Seller" option opening a form with Role, First/Last Name, Email, Phone, Company/Trust, Current Address
6. **Agent Details + Commission**: Role dropdown, First/Last Name, Email, Phone, Company/Trust, MLS ID, MLS (required with red validation), Commission input with % / $ toggle, Cancel/Save buttons
7. **Success**: Congratulations message with "View Deal" CTA

All state persisted in React context/store across steps.

### Phase 4: Deal Detail Page
- **Header**: Large address title, city/state subtitle with Edit link, contact avatars
- **Action Bar**: Make Visible To Office, Open House (dropdown), Add Offer, Email, Change Status (dropdown)
- **Tab Bar**: Checklists (default active), Photos, Tasks, Notes, Marketing

### Phase 5: Checklists — Two-Column Layout
**Left Panel (3 cols):**
- Timeline section (Listing Expiration, Listing Start Date)
- Details section (MLS#, Side, Type)
- Contacts section (agent avatars + roles, Add a New Contact)
- CDA Information (Deal #)
- Listing Information (List Price)
- Download Archive button

**Right Panel (9 cols) — Checklist Items:**
- "Listing" section header
- Expandable rows with chevron toggle: Exclusive Right of Sale Listing Agreement, Tax Roll, Lead-Based Paint Pamphlet, Sellers Property Disclosure, Affiliated Business Arrangement Disclosure, Lead Based Paint Disclosure (Pre 1978), Compensation Agreements, etc.
- Each expandable row reveals nested "Digital Form" sub-item with doc icon
- Row actions: "Edit Form" button + chevron dropdown menu
- Dropdown options: Edit Form, Docusign, View/Print, Email
- Highlighted row state (light blue background) for selected/active items
- "Message Office" button on certain rows
- Drag handles (dots) on left side of rows

### Phase 6: Document Form Editor
- Full-page document view styled as a legal form (letter-width centered container)
- Title bar with document name, "Report an Issue" button, Save button, Close (X)
- Document body with legal prose and inline editable fields (blue-tinted underlined inputs)
- Fields for: seller name, broker info, property address, dates, terms, commission percentages
- Legal document typography (serif font for document body)
- `onBlur` field saving behavior

### Phase 7: Send for Signature (Slide-Over Panel)
- Right-side 400px slide-over panel triggered from "Docusign" action
- From field (read-only current user)
- To field (multi-select from deal contacts + Add New Recipient)
- Subject line
- Message textarea
- Attachment preview with thumbnail and remove option
- Add More Attachments link
- Fixed bottom bar with "Send for Signature" CTA button

### Data & State Management
- React Context or Zustand store for deal data (no backend initially — all client-side with localStorage persistence)
- Supabase integration deferred to when user explicitly requests it
- Mock data seeded for demo: sample deals, agents, addresses, checklist items

### Technical Approach
- Framer Motion for step transitions and slide-over animations
- Zod for New Deal form validation
- Lucide icons throughout
- Strict adherence to design brief: 8px spacing, 40px table rows, 48px checklist items, sharp 1px borders, minimal shadows

