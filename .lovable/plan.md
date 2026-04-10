

## Plan: Add Authentication, Profiles, and Subscription Paywall

### Overview
Add sign-up/sign-in pages with Google OAuth, a profiles table for agent data, and a banking info paywall screen that gates access to the main app until subscription payment details are provided.

### Flow
```text
Unauthenticated user
  → /auth (sign-in / sign-up tabs)
  → Google OAuth or email/password
  → After sign-up/sign-in, check profile.subscription_status
  → If not "active" → /onboarding/payment (paywall)
  → If "active" → /transactions (main app)
```

### Database Changes (3 migrations)

**Migration 1 — Profiles table:**
- `id` (uuid, FK to auth.users, ON DELETE CASCADE)
- `first_name`, `last_name`, `phone`, `brokerage_name`, `license_number` (text, nullable)
- `avatar_url` (text, nullable)
- `subscription_status` (text, default `'pending'` — values: `pending`, `active`, `cancelled`)
- `created_at` (timestamptz)
- RLS: users can read/update only their own row
- Trigger: auto-create profile row on `auth.users` insert

**Migration 2 — Bank accounts table:**
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, ON DELETE CASCADE)
- `account_holder_name` (text)
- `routing_number` (text)
- `account_number_last4` (text — store only last 4 digits for display)
- `account_type` (text — `checking` or `savings`)
- `created_at` (timestamptz)
- RLS: users can read/insert/update only their own rows

**Migration 3 — User roles table** (per security guidelines):
- `user_roles` table with `user_id`, `role` (app_role enum: admin, user)
- `has_role()` security definer function

### New Pages & Components

1. **`/auth` — Auth Page** (`src/pages/Auth.tsx`)
   - Tabs for Sign In / Sign Up
   - Email + password fields
   - "Sign in with Google" button using `supabase.auth.signInWithOAuth({ provider: 'google' })`
   - Forgot password link with email reset flow
   - Clean design matching the app's blue primary color scheme

2. **`/onboarding/payment` — Payment/Banking Paywall** (`src/pages/OnboardingPayment.tsx`)
   - Card with heading "Set Up Your Subscription"
   - Form fields: account holder name, routing number, account number, confirm account number, account type (checking/savings radio)
   - Basic client-side validation (routing number = 9 digits, account numbers match)
   - On submit: save to `bank_accounts` table, update `profiles.subscription_status` to `'active'`, redirect to `/transactions`
   - Skip button not shown (paywall is mandatory)

3. **`/reset-password` — Password Reset Page** (`src/pages/ResetPassword.tsx`)
   - Form to set new password after clicking email link

4. **Auth Context / Guard** (`src/hooks/useAuth.ts`)
   - `useAuth()` hook wrapping `onAuthStateChange` + `getSession`
   - Provides `user`, `session`, `profile`, `loading`, `signOut`
   - Fetches profile and checks `subscription_status`

5. **`ProtectedRoute` component** (`src/components/auth/ProtectedRoute.tsx`)
   - If not authenticated → redirect to `/auth`
   - If authenticated but `subscription_status !== 'active'` → redirect to `/onboarding/payment`
   - Otherwise render children

### Route Changes (App.tsx)
- Add `/auth`, `/onboarding/payment`, `/reset-password` as public routes
- Wrap the `<AppLayout />` route in `<ProtectedRoute />`
- Keep `/sign/:token` public (signer links must work without auth)

### Google OAuth Setup
- Code will use `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })`
- The user will need to configure Google OAuth in their Supabase dashboard (Authentication → Providers → Google) with their Google Cloud client ID and secret

### Security Notes
- Bank account numbers are stored with only last 4 digits visible after initial save
- Full account/routing numbers should ideally be sent to a payment processor — for now they'll be stored encrypted or as-is in the DB since this is an MVP
- All RLS policies scope to `auth.uid()`
- Roles stored in separate `user_roles` table per security guidelines

### Technical Details
- No edge functions needed for this step (all client-side Supabase Auth)
- Existing RLS policies on all tables currently allow public access (`true`) — these should eventually be scoped to authenticated users, but that's a separate task to avoid breaking existing functionality
- Profile auto-creation trigger ensures a profile row exists immediately after sign-up

