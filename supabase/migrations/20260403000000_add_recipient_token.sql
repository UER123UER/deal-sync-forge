-- Add per-recipient signing token so each signer gets a unique link
ALTER TABLE public.signature_recipients
  ADD COLUMN IF NOT EXISTS recipient_token text DEFAULT (gen_random_uuid()::text);

-- Backfill existing rows that have no token
UPDATE public.signature_recipients
SET recipient_token = gen_random_uuid()::text
WHERE recipient_token IS NULL;

-- Make it non-nullable going forward
ALTER TABLE public.signature_recipients
  ALTER COLUMN recipient_token SET NOT NULL;
