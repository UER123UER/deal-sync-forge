-- Add referral_code to profiles — permanent, unique code per agent
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate a code for any existing profiles that don't have one yet
UPDATE public.profiles
SET referral_code = 'REF-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
WHERE referral_code IS NULL;

-- Auto-generate code for all future profiles via the handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    'REF-' || upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  );
  RETURN NEW;
END;
$$;

-- Track who referred whom: store the referral_code used at signup on the referred user's profile
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_code text;
