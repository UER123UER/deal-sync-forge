CREATE TABLE public.onboarding_signature_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_key text NOT NULL,
  document_title text NOT NULL,
  document_version text NOT NULL,
  document_body text NOT NULL,
  document_hash text GENERATED ALWAYS AS (encode(digest(document_body, 'sha256'), 'hex')) STORED,
  signer_name text NOT NULL,
  signer_email text,
  signature_type text NOT NULL DEFAULT 'typed_name',
  signature_value text NOT NULL,
  consent_text text NOT NULL,
  agreed_to_terms boolean NOT NULL DEFAULT true,
  agreed_to_esign boolean NOT NULL DEFAULT true,
  ip_address text,
  user_agent text,
  origin_url text,
  request_headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  signed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX onboarding_signature_events_user_document_signed_at_idx
  ON public.onboarding_signature_events (user_id, document_key, signed_at DESC);

ALTER TABLE public.onboarding_signature_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding signature events"
  ON public.onboarding_signature_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view onboarding signature events"
  ON public.onboarding_signature_events FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
