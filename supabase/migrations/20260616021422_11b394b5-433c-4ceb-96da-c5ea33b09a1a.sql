
DROP POLICY IF EXISTS "Authenticated can read admin-documents" ON storage.objects;

CREATE POLICY "Admins can read admin-documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'admin-documents' AND public.has_role(auth.uid(), 'admin'));
