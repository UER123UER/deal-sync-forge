## What I found

Yaelle's profile **is already correctly attributed to your test test referral code**:

| field | value |
| --- | --- |
| first_name | Yaelle Herbstman |
| referred_by_code | **E69708D0** (test test's code) |
| subscription_status | active |
| subscription_activated_at | 2026-06-15 23:18:05Z |

So the data is right. Your screenshot was taken either before Yaelle finished checkout, or before the Referral page was reloaded. Reloading right now will show **1 referral / $20 earned** because `Referral.tsx` calculates earnings as `months × $20` with `Math.max(1, …)`, which yields $20 for any active referral within the first 30 days.

But there are two real weaknesses worth fixing so this is bulletproof going forward:

1. **Race condition in `Signup.tsx`.** The signup flow writes `referred_by_code` from the browser **after** sign-in (`UPDATE profiles … WHERE id = …`). If the user closes the tab or the network drops between signup and the update, the referral is silently lost. The `handle_new_user` trigger already runs server-side at signup with `raw_user_meta_data` (which already contains `referral_code`), but it doesn't currently persist that into `referred_by_code`.
2. **The Referral page doesn't auto-refresh** after another agent signs up, and there's no "Refresh" control. Users assume their dashboard is wrong when it just hasn't refetched.

## Plan

### 1. Persist the referral code atomically inside the signup trigger
Update the `handle_new_user` SQL function so the new `profiles` row is inserted with `referred_by_code` already populated from `NEW.raw_user_meta_data ->> 'referral_code'` (uppercased to match how `generate_referral_code` stores codes). No race, no client-side patch step needed. This change is additive — keeps everything else the same.

### 2. Drop the now-redundant client-side `referred_by_code` update
In `src/pages/Signup.tsx`, remove the post-signin `UPDATE profiles SET referred_by_code …` block (the trigger now handles it). Keep the license_number / brokerage_name update.

### 3. Make the Referral page refresh on demand and on focus
In `src/pages/Referral.tsx`:
- Extract the data-loading logic into a `loadStats()` callback.
- Re-run `loadStats()` when the page regains focus (`visibilitychange` / `focus` listener).
- Wire the existing `RefreshCw` icon into a real **"Refresh"** button at the top of the metrics row that calls `loadStats()` and shows a toast.
- Subscribe to Supabase Realtime on `profiles` filtered by `referred_by_code = <my code>` so newly added referrals appear without a manual reload.

### 4. Verify
- Confirm Yaelle now counts as 1 referral / $20 on the test test account.
- Sign up a new test user with `?ref=E69708D0`, watch the trigger fill `referred_by_code` immediately.

## Notes
- The earnings calculation already credits a referred user immediately on activation (the `Math.max(1, …)` baseline), so the $20 will appear as soon as the page refetches.
- No schema changes are needed — only the trigger function body changes.
- Nothing on Yaelle's account changes; she remains an active subscriber.
