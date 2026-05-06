-- Avatars storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Onboarding signature events
CREATE TABLE public.onboarding_signature_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_key TEXT NOT NULL,
  document_title TEXT NOT NULL,
  document_version TEXT NOT NULL,
  document_body TEXT NOT NULL,
  document_hash TEXT,
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signature_type TEXT NOT NULL DEFAULT 'typed_name',
  signature_value TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  agreed_to_esign BOOLEAN NOT NULL DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  origin_url TEXT,
  request_headers JSONB DEFAULT '{}'::jsonb,
  evidence JSONB DEFAULT '{}'::jsonb,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.onboarding_signature_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own onboarding signatures"
ON public.onboarding_signature_events FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding signatures"
ON public.onboarding_signature_events FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_onboarding_sig_user_id ON public.onboarding_signature_events(user_id);
CREATE INDEX idx_onboarding_sig_doc_key ON public.onboarding_signature_events(document_key);