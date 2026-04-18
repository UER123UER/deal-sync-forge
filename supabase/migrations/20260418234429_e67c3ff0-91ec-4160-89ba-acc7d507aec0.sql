ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_activated_at TIMESTAMP WITH TIME ZONE;

-- Backfill: any currently active subscriber gets activation backdated to their profile creation
UPDATE public.profiles
SET subscription_activated_at = created_at
WHERE subscription_status = 'active' AND subscription_activated_at IS NULL;