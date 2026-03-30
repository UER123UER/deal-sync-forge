ALTER TABLE public.signing_sessions
ADD COLUMN IF NOT EXISTS role_assignments jsonb NOT NULL DEFAULT '[]'::jsonb;
