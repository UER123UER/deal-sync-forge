
CREATE TABLE public.admin_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name text NOT NULL,
  storage_path text NOT NULL,
  annotations jsonb DEFAULT '{}',
  designated_fields jsonb DEFAULT '[]',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.admin_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to admin_documents"
  ON public.admin_documents
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-documents', 'admin-documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow public read admin-documents"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'admin-documents');

CREATE POLICY "Allow public insert admin-documents"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'admin-documents');

CREATE POLICY "Allow public update admin-documents"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'admin-documents');

CREATE POLICY "Allow public delete admin-documents"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'admin-documents');
