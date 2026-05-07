
-- 1) Drop overly permissive "Allow all access" policies and replace with authenticated-only access.
DROP POLICY IF EXISTS "Allow all access to deal_contacts" ON public.deal_contacts;
DROP POLICY IF EXISTS "Allow all access to checklist_items" ON public.checklist_items;
DROP POLICY IF EXISTS "Allow all access to signature_recipients" ON public.signature_recipients;
DROP POLICY IF EXISTS "Allow all access to admin_documents" ON public.admin_documents;
DROP POLICY IF EXISTS "Allow all access to signature_requests" ON public.signature_requests;
DROP POLICY IF EXISTS "Allow all access to open_houses" ON public.open_houses;
DROP POLICY IF EXISTS "Allow all access to deal_notes" ON public.deal_notes;
DROP POLICY IF EXISTS "Allow all access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Allow all access to offers" ON public.offers;
DROP POLICY IF EXISTS "Allow all access to deals" ON public.deals;
DROP POLICY IF EXISTS "Allow all access to contacts" ON public.contacts;
DROP POLICY IF EXISTS "Allow all access to session_fields" ON public.session_fields;
DROP POLICY IF EXISTS "Allow all access to session_recipients" ON public.session_recipients;
DROP POLICY IF EXISTS "Allow all access to session_documents" ON public.session_documents;
DROP POLICY IF EXISTS "Allow all access to signing_sessions" ON public.signing_sessions;

-- Generic helper to create authenticated-only ALL policies
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'deal_contacts','checklist_items','signature_recipients','admin_documents',
    'signature_requests','open_houses','deal_notes','tasks','offers','deals',
    'contacts','session_fields','session_recipients','session_documents','signing_sessions'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "Authenticated can read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (true);
       CREATE POLICY "Authenticated can insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (true);
       CREATE POLICY "Authenticated can update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
       CREATE POLICY "Authenticated can delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (true);',
      t);
  END LOOP;
END$$;

-- 2) Storage: admin-documents — keep public READ (anonymous signers fetch PDFs by URL),
--    but restrict writes to authenticated users.
DROP POLICY IF EXISTS "Allow public delete admin-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert admin-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update admin-documents" ON storage.objects;

CREATE POLICY "Authenticated can insert admin-documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'admin-documents');
CREATE POLICY "Authenticated can update admin-documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'admin-documents');
CREATE POLICY "Authenticated can delete admin-documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'admin-documents');

-- 3) Storage: deal-photos — restrict writes to authenticated. Reads stay public.
DROP POLICY IF EXISTS "Allow all deletes from deal-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow all uploads to deal-photos" ON storage.objects;

CREATE POLICY "Authenticated can upload deal-photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'deal-photos');
CREATE POLICY "Authenticated can delete deal-photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'deal-photos');

-- 4) Lock down SECURITY DEFINER functions — revoke direct EXECUTE from anon/public.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
