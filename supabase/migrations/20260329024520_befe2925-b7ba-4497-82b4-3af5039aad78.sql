
-- Signing Sessions
CREATE TABLE public.signing_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  session_name text NOT NULL DEFAULT '',
  email_message text,
  status text NOT NULL DEFAULT 'draft',
  created_by text DEFAULT 'Agent',
  date_sent timestamp with time zone,
  expiration_date timestamp with time zone,
  reminder_interval_days integer DEFAULT 0,
  signing_order_enabled boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.signing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to signing_sessions" ON public.signing_sessions FOR ALL TO public USING (true) WITH CHECK (true);

-- Session Documents
CREATE TABLE public.session_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.signing_sessions(id) ON DELETE CASCADE,
  name text NOT NULL,
  storage_path text NOT NULL,
  sort_order integer DEFAULT 0,
  page_count integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.session_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to session_documents" ON public.session_documents FOR ALL TO public USING (true) WITH CHECK (true);

-- Session Recipients
CREATE TABLE public.session_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.signing_sessions(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  type text NOT NULL DEFAULT 'signer',
  sort_order integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  signed_at timestamp with time zone,
  signature_data text,
  token text NOT NULL DEFAULT (gen_random_uuid())::text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.session_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to session_recipients" ON public.session_recipients FOR ALL TO public USING (true) WITH CHECK (true);

-- Session Fields
CREATE TABLE public.session_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.signing_sessions(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.session_documents(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES public.session_recipients(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'signature',
  page integer NOT NULL DEFAULT 0,
  x double precision NOT NULL DEFAULT 0,
  y double precision NOT NULL DEFAULT 0,
  width double precision NOT NULL DEFAULT 150,
  height double precision NOT NULL DEFAULT 40,
  value text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.session_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to session_fields" ON public.session_fields FOR ALL TO public USING (true) WITH CHECK (true);
