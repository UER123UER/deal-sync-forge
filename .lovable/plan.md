## Goal
Keep only **1410 Cleveland Rd** in the `deals` table and reassign it to Max Haber's account so it appears only in Max Haber's CRM.

## Current state
- 6 deals in the database:
  - `6a1e8d93…` 72525th Rd (Elk Creek, NE) — owner: Tevel
  - `9e8b7187…` **1410 Cleveland Rd** (Miami Beach, FL) — owner: **Tevel** (needs to move to Max)
  - `c15cc1d9…` Private Road 4521 (Decatur, TX) — owner: Tevel
  - `d30cd81a…` 9381 E Bay Harbor Dr (Bay Harbor Islands, FL) — owner: Tevel
  - `f43ba470…` 4328 SW 9th Ter (Miami, FL) — owner: Tevel
  - `f948eec1…` Private Road 4331 (Dime Box, TX) — owner: test test
- Max Haber's user id: `bbeb0c36-616d-4bea-ba3c-07034c79d5a1`

## Steps

### 1. Delete the 5 unwanted deals (and their child rows)
For every deal except `9e8b7187…`, remove all child rows first, then the deal:
- `checklist_items`, `deal_notes`, `deal_contacts`, `offers`, `open_houses`, `tasks` where `deal_id` matches
- any `signing_sessions` / `signature_requests` linked to that `deal_id`, plus their cascading children (`session_documents`, `session_fields`, `session_recipients`, `signature_recipients`)
- finally `DELETE FROM deals WHERE id IN (…5 ids…)`

### 2. Reassign 1410 Cleveland Rd to Max Haber
The `prevent_user_id_change` trigger blocks direct UPDATEs to `user_id`. To safely move the deal:
- Temporarily drop the trigger on `deals` (and any equivalent on children referencing user_id)
- `UPDATE deals SET user_id = 'bbeb0c36-…' WHERE id = '9e8b7187…'`
- Also update `user_id` on every child row of this deal (checklist_items, deal_notes, deal_contacts, offers, open_houses, tasks, plus any signing/signature children that reference this deal) so they all belong to Max
- Recreate the trigger exactly as before

### 3. Verify
- `deals` contains exactly one row (`9e8b7187…`) owned by `bbeb0c36-…`
- All child tables contain no orphaned rows pointing at deleted deal ids
- Logged in as Max → 1410 Cleveland Rd appears
- Logged in as Tevel or test test → no deals appear

## Notes
- Contacts, profiles, bank accounts, signatures unrelated to deals are left untouched.
- This is destructive and cannot be undone from the app; the previous app version can still be restored from chat history if needed.
