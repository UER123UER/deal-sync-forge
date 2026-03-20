

## Audit: 60 Things Not Working

After reviewing the entire codebase, here is a comprehensive list of non-functional, broken, or placeholder features across the application.

---

### Transactions Page
1. **"Export Deals" button** — no export logic, does nothing on click
2. **"Download Forms" button** — no download logic, does nothing on click
3. **No deal deletion** — cannot delete a deal from the transactions list
4. **No bulk actions** — no multi-select or bulk operations on deals
5. **No pagination** — deals list has no pagination for large datasets
6. **No sorting** — table columns are not sortable (by price, date, agent, etc.)

### Deal Detail Page
7. **"Edit" button next to address** — does nothing, no inline editing
8. **"Make Visible To Office" button** — does nothing
9. **"Schedule Open House" dropdown item** — does nothing
10. **"View Open Houses" dropdown item** — does nothing
11. **"Add Offer" button** — does nothing
12. **"Email" button** — does nothing (no email integration)
13. **"Change Status" dropdown items** — clicking Draft/Active/Pending/Archive does nothing (no mutation called)
14. **"Add MLS# Number" button** — does nothing, no inline editing
15. **"Add a New Contact" link** — does nothing
16. **"Download Archive" button** — does nothing
17. **Checklist items cannot be marked complete** — no checkbox to toggle completion
18. **Checklist drag-and-drop** — grip handle is visual only, no reordering logic
19. **Checklist "Email" menu item** — does nothing
20. **Checklist "Upload" menu item** — does nothing
21. **Checklist "Message Office" menu item** — does nothing
22. **Checklist "Notify Office to Review" menu item** — does nothing
23. **Checklist "Delete" menu item** — does nothing (no delete mutation)
24. **"Photos" tab** — shows "Coming soon" placeholder
25. **"Tasks" tab** — shows "Coming soon" placeholder
26. **"Notes" tab** — shows "Coming soon" placeholder
27. **"Marketing" tab** — shows "Coming soon" placeholder
28. **No deal price editing** — price is shown but cannot be changed
29. **No listing date editing** — listing start/expiration dates cannot be edited
30. **CDA information** — only shows a truncated UUID, no real CDA data

### Signature Panel (DocuSign)
31. **"Next: View in Docusign" button** — does nothing (no DocuSign integration)
32. **"Add New Recipient" link** — does nothing
33. **"Add More Attachments" link** — does nothing
34. **Hardcoded "From" sender** — always shows "Karl Brisard" regardless of user
35. **Attachment date hardcoded** — always says "Uploaded Jan 21, 7:42 AM"
36. **Remove attachment (X button)** — does nothing

### Form Editor
37. **"Save" button** — does nothing (no save mutation to persist form edits)
38. **"Report an Issue" button** — does nothing
39. **Form fields don't persist** — edits are lost on navigation; state resets on mount
40. **Form data initializes incorrectly** — `useState` with deal data won't update when deal loads asynchronously (stale initial state)

### New Deal Flow
41. **Agent search uses MOCK_AGENTS** — hardcoded mock data, not querying real contacts/agents from Supabase
42. **Agent search input doesn't filter** — typing in the search field has no effect on displayed agents
43. **No address dropdown close on click-outside** — dropdown stays open until an address is selected
44. **No validation on seller form** — seller can be saved with empty first/last name
45. **Seller's current address field** — no autocomplete (unlike the property address field)
46. **No error toast on deal creation failure** — errors are only logged to console

### People Page
47. **"New Contact > Add contact manually"** — does nothing (no create form)
48. **"Import CSV Spreadsheet"** — does nothing
49. **"Google Connect"** — does nothing
50. **"Microsoft Connect"** — does nothing
51. **"Lead Routing" button** — does nothing
52. **All filter buttons (Leads, Tags, Parked Contacts, Assignee, Flow, More)** — do nothing
53. **Clicking a contact row** — does nothing (no contact detail view)
54. **No contact editing** — cannot edit existing contacts
55. **No contact deletion** — cannot delete contacts

### Tasks Page
56. **Due date selector** — "Select date" is a visual placeholder, no date picker implemented
57. **"Attach Client" link** — does nothing
58. **"Attach Property" link** — does nothing
59. **"Attach Deal" link** — does nothing
60. **Filter buttons (Assignee, Status, Type, Date Range)** — do nothing
61. **"More" task type button** — does nothing
62. **"Add Assignee" button** — does nothing (hardcoded "KB" avatar)
63. **No task editing** — cannot edit an existing task
64. **No task deletion** — cannot delete a task
65. **No task completion toggle** — cannot mark tasks as done

### Inbox Page
66. **"New Email" button** — does nothing
67. **"Sign in with Google" button** — does nothing
68. **"Sign in with Outlook" button** — does nothing
69. **Entire inbox is a static placeholder** — no email functionality at all

### Sidebar / Navigation
70. **Listings page** — "Coming soon" placeholder
71. **Open House page** — "Coming soon" placeholder
72. **Calendar page** — "Coming soon" placeholder
73. **Finances page** — "Coming soon" placeholder

### Data / Backend Issues
74. **Zustand store (`deals.ts`) is unused** — still has hardcoded SAMPLE_DEALS but nothing references it anymore (dead code)
75. **HERE API key is hardcoded in client-side code** — should be in environment variable
76. **No authentication** — RLS policies are fully permissive; anyone can read/write all data
77. **No user profile system** — no concept of which user owns which data
78. **Index page is a placeholder** — shows default Lovable placeholder image

---

**Total: 78 items identified** (18 more than requested). These range from completely non-functional buttons to missing features and backend concerns. The most critical categories are: **non-functional action buttons** (about 40 items), **missing CRUD operations** (edit/delete for contacts, tasks, deals), and **placeholder pages** (4 sidebar routes + inbox).

