## The problem

Right now every CRM table (`contacts`, `deals`, `tasks`, `deal_notes`, `deal_contacts`, `offers`, `open_houses`, `checklist_items`, `signature_requests`, `signature_recipients`, `signing_sessions`, `session_documents`, `session_fields`, `session_recipients`, `admin_documents`) has no `user_id` column, and its RLS policies are `USING (true)` for any authenticated user. That means every signed-in agent sees and edits every other agent's data — which is exactly what happened with Tevel and Max sharing one CRM.

## The fix

Make every record owned by the agent who created it, and scope reads/writes to that owner.

### 1. Database migration

For each table above:
- Add `user_id uuid` column (nullable temporarily).
- Backfill: assign existing rows to Tevel's user id (`8680e004-9655-4a3e-af3f-5b33d…`) so his data is preserved. Child rows (`deal_notes`, `deal_contacts`, `offers`, `open_houses`, `checklist_items`, `tasks`, `signature_requests`, `signing_sessions`, etc.) inherit from their parent `deal_id` where applicable; `session_*` inherit from `signing_sessions.created_by`; `signature_recipients` from `signature_requests`; `session_fields`/`session_documents` from `signing_sessions`.
- Set `NOT NULL` and `DEFAULT auth.uid()`.
- Replace the four `USING (true)` policies on each table with `USING (auth.uid() = user_id)` (and `WITH CHECK` for insert/update). Child tables can either get their own `user_id` (simpler, what I recommend) or use an `EXISTS` check against the parent deal/session — I'll use the explicit `user_id` column on every table for consistency and performance.
- `admin_documents` is templates managed by admins — keep it readable by all authenticated users, restrict writes to `has_role(auth.uid(),'admin')` instead of per-user. Confirm this is what you want.

### 2. Frontend

- Insert mutations (`useCreateContact`, `useDeals`, `useTasks`, deal creation in `NewDeal.tsx`, signing-session creation, etc.) need to set `user_id: user.id` (or rely on the column default `auth.uid()`). I'll standardize on the DB default so we don't have to touch every call site, and only add explicit `user_id` where the insert runs through an edge function with the service role.
- Edge functions that write on behalf of the user (`submit-signing-session`, `record-onboarding-signatures`, etc.) — verify they pass the correct `user_id`.

### 3. Data preservation for Tevel

Before enabling the new policies, backfill all existing rows to Tevel's user id so nothing of his is lost. Max's account will then start empty as expected.

## Open questions

1. Confirm Tevel's user id is `8680e004-9655-4a3e-af3f-5b33d…` (full id needed — I'll read it from `profiles`).
2. `admin_documents` (PDF templates in the Admin PDF editor) — should these stay shared/global (admin-managed, all agents use them) or be per-user? My recommendation: keep global, admin-only writes.
3. Any tables you explicitly want shared across the office (e.g. office-wide listings via `deals.visible_to_office`)? I'd leave that flag alone for now and only scope by `user_id`; the office-visibility feature can be layered back on as a follow-up policy.

Once you confirm, I'll write one migration that adds the columns, backfills Tevel's data, sets defaults, and rewrites the policies.