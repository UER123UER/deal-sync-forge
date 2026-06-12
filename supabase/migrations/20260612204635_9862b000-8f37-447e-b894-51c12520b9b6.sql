
ALTER TABLE public.contacts             ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.deals                ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.tasks                ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.deal_notes           ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.deal_contacts        ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.offers               ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.open_houses          ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.checklist_items      ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.signature_requests   ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.signature_recipients ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.signing_sessions     ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.session_documents    ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.session_fields       ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE public.session_recipients   ADD COLUMN IF NOT EXISTS user_id uuid;

UPDATE public.contacts             SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.deals                SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.tasks                SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.deal_notes           SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.deal_contacts        SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.offers               SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.open_houses          SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.checklist_items      SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.signature_requests   SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.signature_recipients SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.signing_sessions     SET user_id = COALESCE(NULLIF(created_by,'')::uuid, '8680e004-9655-4a3e-af3f-5b33d4bf6a18'::uuid) WHERE user_id IS NULL;
UPDATE public.session_documents    SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.session_fields       SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;
UPDATE public.session_recipients   SET user_id = '8680e004-9655-4a3e-af3f-5b33d4bf6a18' WHERE user_id IS NULL;

ALTER TABLE public.contacts             ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.deals                ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.tasks                ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.deal_notes           ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.deal_contacts        ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.offers               ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.open_houses          ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.checklist_items      ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.signature_requests   ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.signature_recipients ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.signing_sessions     ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.session_documents    ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.session_fields       ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.session_recipients   ALTER COLUMN user_id SET NOT NULL, ALTER COLUMN user_id SET DEFAULT auth.uid();

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'contacts','deals','tasks','deal_notes','deal_contacts','offers','open_houses',
    'checklist_items','signature_requests','signature_recipients','signing_sessions',
    'session_documents','session_fields','session_recipients'
  ];
  pol record;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename=t LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
    END LOOP;
    EXECUTE format('CREATE POLICY "Owners can read %1$s" ON public.%1$I FOR SELECT TO authenticated USING (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "Owners can insert %1$s" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "Owners can update %1$s" ON public.%1$I FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)', t);
    EXECUTE format('CREATE POLICY "Owners can delete %1$s" ON public.%1$I FOR DELETE TO authenticated USING (auth.uid() = user_id)', t);
  END LOOP;
END $$;

DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='admin_documents' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.admin_documents', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Authenticated can read admin_documents"
  ON public.admin_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert admin_documents"
  ON public.admin_documents FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update admin_documents"
  ON public.admin_documents FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete admin_documents"
  ON public.admin_documents FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
