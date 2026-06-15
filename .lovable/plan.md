## Goal
Make CRM, deals, tasks, notes, offers, open houses, checklists, signatures, and signing sessions private to the signed-in account that owns them.

## What I found
- The database now has `user_id` on the main CRM/deal tables, and RLS policies are intended to limit rows to `auth.uid() = user_id`.
- Existing legacy rows were backfilled to one user ID, so other accounts should start empty unless their own rows are created under their own login.
- The current setup should be strengthened because child tables can still rely only on their own `user_id`, instead of also proving their parent deal/session/request belongs to the same account.

## Plan

### 1. Harden the database isolation rules
Update RLS policies for every account-owned table:
- `contacts`
- `deals`
- `tasks`
- `deal_notes`
- `deal_contacts`
- `offers`
- `open_houses`
- `checklist_items`
- `signature_requests`
- `signature_recipients`
- `signing_sessions`
- `session_documents`
- `session_fields`
- `session_recipients`

Rules:
- Users can only view, create, edit, or delete rows where `user_id = auth.uid()`.
- Child records must also match the owner of their parent record:
  - Deal children must belong to a deal owned by the same user.
  - Signature recipients must belong to a signature request owned by the same user.
  - Session documents/fields/recipients must belong to a signing session owned by the same user.
- Users cannot change a row’s `user_id` to another account.

### 2. Add owner-sync triggers for safer inserts
Add database triggers so child rows automatically inherit the correct `user_id` from their parent deal/session/request when created.

This prevents bad data like:
- a checklist item with one user’s `user_id` attached to another user’s deal
- a signing recipient attached to the wrong owner
- manually spoofed `user_id` values from the browser

### 3. Keep shared admin templates global
Leave `admin_documents` shared intentionally:
- all authenticated agents can read PDF templates
- only admins can create, edit, or delete them

This avoids breaking the Admin PDF/forms workflow.

### 4. Review frontend create paths
Update create/insert code where needed so new records are created under the current authenticated user and parent relationships are respected:
- deals and their default checklist items
- contacts and deal contacts
- tasks
- notes/offers/open houses
- signing sessions, recipients, documents, and fields
- signature requests and recipients

### 5. Verify separation
After implementation, run checks to confirm:
- every account-owned table has RLS enabled
- every account-owned table has owner-only policies
- `user_id` is required and defaults to the signed-in user
- no CRM/deal/signing rows are globally readable
- child rows cannot be attached across accounts

## Important note about existing shared data
If data was created before isolation existed, the system cannot automatically know which rows belong to which agent unless there is a reliable identifier. The safe default is:
- preserve existing legacy rows under Tevel’s account
- every other account sees only its own newly created data
- if specific records need to move to another account, we can migrate those rows once you identify which records belong to which account