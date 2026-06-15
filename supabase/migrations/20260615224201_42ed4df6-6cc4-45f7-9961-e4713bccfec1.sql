
-- 1. Lock user_id immutability on all account-owned tables
CREATE OR REPLACE FUNCTION public.prevent_user_id_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'user_id cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Trigger to auto-inherit user_id from a parent deal
CREATE OR REPLACE FUNCTION public.set_user_id_from_deal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_user uuid;
BEGIN
  SELECT user_id INTO parent_user FROM public.deals WHERE id = NEW.deal_id;
  IF parent_user IS NULL THEN
    RAISE EXCEPTION 'parent deal not found or not owned';
  END IF;
  IF NEW.user_id IS NULL THEN
    NEW.user_id := parent_user;
  ELSIF NEW.user_id <> parent_user THEN
    RAISE EXCEPTION 'user_id must match parent deal owner';
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Trigger to auto-inherit user_id from a parent signing_session
CREATE OR REPLACE FUNCTION public.set_user_id_from_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_user uuid;
BEGIN
  SELECT user_id INTO parent_user FROM public.signing_sessions WHERE id = NEW.session_id;
  IF parent_user IS NULL THEN
    RAISE EXCEPTION 'parent signing session not found or not owned';
  END IF;
  IF NEW.user_id IS NULL THEN
    NEW.user_id := parent_user;
  ELSIF NEW.user_id <> parent_user THEN
    RAISE EXCEPTION 'user_id must match parent signing session owner';
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Trigger to auto-inherit user_id from a parent signature_request
CREATE OR REPLACE FUNCTION public.set_user_id_from_signature_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_user uuid;
BEGIN
  SELECT user_id INTO parent_user FROM public.signature_requests WHERE id = NEW.signature_request_id;
  IF parent_user IS NULL THEN
    RAISE EXCEPTION 'parent signature request not found or not owned';
  END IF;
  IF NEW.user_id IS NULL THEN
    NEW.user_id := parent_user;
  ELSIF NEW.user_id <> parent_user THEN
    RAISE EXCEPTION 'user_id must match parent signature request owner';
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Attach owner-immutability triggers to every account-owned table
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'contacts','deals','tasks','deal_notes','deal_contacts','offers','open_houses',
    'checklist_items','signature_requests','signature_recipients','signing_sessions',
    'session_documents','session_fields','session_recipients'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS prevent_user_id_change_trg ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER prevent_user_id_change_trg BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change()',
      t
    );
  END LOOP;
END $$;

-- 6. Attach parent-inheritance triggers to deal-child tables
DROP TRIGGER IF EXISTS set_user_id_from_deal_trg ON public.deal_notes;
CREATE TRIGGER set_user_id_from_deal_trg BEFORE INSERT ON public.deal_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_deal();

DROP TRIGGER IF EXISTS set_user_id_from_deal_trg ON public.deal_contacts;
CREATE TRIGGER set_user_id_from_deal_trg BEFORE INSERT ON public.deal_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_deal();

DROP TRIGGER IF EXISTS set_user_id_from_deal_trg ON public.offers;
CREATE TRIGGER set_user_id_from_deal_trg BEFORE INSERT ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_deal();

DROP TRIGGER IF EXISTS set_user_id_from_deal_trg ON public.open_houses;
CREATE TRIGGER set_user_id_from_deal_trg BEFORE INSERT ON public.open_houses
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_deal();

DROP TRIGGER IF EXISTS set_user_id_from_deal_trg ON public.checklist_items;
CREATE TRIGGER set_user_id_from_deal_trg BEFORE INSERT ON public.checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_deal();

DROP TRIGGER IF EXISTS set_user_id_from_deal_trg ON public.signature_requests;
CREATE TRIGGER set_user_id_from_deal_trg BEFORE INSERT ON public.signature_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_deal();

DROP TRIGGER IF EXISTS set_user_id_from_deal_trg ON public.signing_sessions;
CREATE TRIGGER set_user_id_from_deal_trg BEFORE INSERT ON public.signing_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_deal();

-- 7. Attach parent-inheritance triggers to signing_sessions children
DROP TRIGGER IF EXISTS set_user_id_from_session_trg ON public.session_documents;
CREATE TRIGGER set_user_id_from_session_trg BEFORE INSERT ON public.session_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_session();

DROP TRIGGER IF EXISTS set_user_id_from_session_trg ON public.session_fields;
CREATE TRIGGER set_user_id_from_session_trg BEFORE INSERT ON public.session_fields
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_session();

DROP TRIGGER IF EXISTS set_user_id_from_session_trg ON public.session_recipients;
CREATE TRIGGER set_user_id_from_session_trg BEFORE INSERT ON public.session_recipients
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_session();

-- 8. Attach parent-inheritance trigger to signature_recipients
DROP TRIGGER IF EXISTS set_user_id_from_signature_request_trg ON public.signature_recipients;
CREATE TRIGGER set_user_id_from_signature_request_trg BEFORE INSERT ON public.signature_recipients
  FOR EACH ROW EXECUTE FUNCTION public.set_user_id_from_signature_request();

-- 9. Tighten RLS so a child row's parent must also be owned by the same user.
-- Deal-children: contacts in deal_contacts, notes, offers, open_houses, checklist_items, signature_requests, signing_sessions

DROP POLICY IF EXISTS "Owners can insert deal_notes" ON public.deal_notes;
CREATE POLICY "Owners can insert deal_notes" ON public.deal_notes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert deal_contacts" ON public.deal_contacts;
CREATE POLICY "Owners can insert deal_contacts" ON public.deal_contacts
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND d.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.contacts c WHERE c.id = contact_id AND c.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert offers" ON public.offers;
CREATE POLICY "Owners can insert offers" ON public.offers
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert open_houses" ON public.open_houses;
CREATE POLICY "Owners can insert open_houses" ON public.open_houses
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert checklist_items" ON public.checklist_items;
CREATE POLICY "Owners can insert checklist_items" ON public.checklist_items
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert signature_requests" ON public.signature_requests;
CREATE POLICY "Owners can insert signature_requests" ON public.signature_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND d.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert signing_sessions" ON public.signing_sessions;
CREATE POLICY "Owners can insert signing_sessions" ON public.signing_sessions
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND d.user_id = auth.uid())
  );

-- Tasks: deal_id is optional. If supplied, must be owned by same user.
DROP POLICY IF EXISTS "Owners can insert tasks" ON public.tasks;
CREATE POLICY "Owners can insert tasks" ON public.tasks
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND (
      deal_id IS NULL
      OR EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND d.user_id = auth.uid())
    )
  );

-- Signing session children
DROP POLICY IF EXISTS "Owners can insert session_documents" ON public.session_documents;
CREATE POLICY "Owners can insert session_documents" ON public.session_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.signing_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert session_fields" ON public.session_fields;
CREATE POLICY "Owners can insert session_fields" ON public.session_fields
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.signing_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Owners can insert session_recipients" ON public.session_recipients;
CREATE POLICY "Owners can insert session_recipients" ON public.session_recipients
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.signing_sessions s WHERE s.id = session_id AND s.user_id = auth.uid())
  );

-- Signature recipients
DROP POLICY IF EXISTS "Owners can insert signature_recipients" ON public.signature_recipients;
CREATE POLICY "Owners can insert signature_recipients" ON public.signature_recipients
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.signature_requests r WHERE r.id = signature_request_id AND r.user_id = auth.uid())
  );
