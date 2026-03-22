
-- Signature requests table
CREATE TABLE public.signature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  checklist_item_id uuid REFERENCES public.checklist_items(id) ON DELETE SET NULL,
  document_name text NOT NULL,
  sender_name text NOT NULL DEFAULT 'You',
  subject text NOT NULL DEFAULT 'Please DocuSign',
  message text,
  status text NOT NULL DEFAULT 'pending',
  token text NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  form_data jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.signature_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to signature_requests" ON public.signature_requests FOR ALL TO public USING (true) WITH CHECK (true);

-- Signature recipients table
CREATE TABLE public.signature_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signature_request_id uuid REFERENCES public.signature_requests(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text NOT NULL,
  role text,
  status text NOT NULL DEFAULT 'pending',
  signed_at timestamptz,
  signature_data text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.signature_recipients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to signature_recipients" ON public.signature_recipients FOR ALL TO public USING (true) WITH CHECK (true);
