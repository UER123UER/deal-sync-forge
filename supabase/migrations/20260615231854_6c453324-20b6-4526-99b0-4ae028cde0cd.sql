
-- Find and drop all triggers that use prevent_user_id_change
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname AS schema_name, c.relname AS table_name, t.tgname AS trigger_name
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE p.proname = 'prevent_user_id_change' AND NOT t.tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER %I ON %I.%I', r.trigger_name, r.schema_name, r.table_name);
  END LOOP;
END $$;

-- Delete unwanted deals and their children
WITH del AS (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796')
DELETE FROM public.checklist_items WHERE deal_id IN (SELECT id FROM del);
DELETE FROM public.deal_notes WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796');
DELETE FROM public.deal_contacts WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796');
DELETE FROM public.offers WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796');
DELETE FROM public.open_houses WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796');
DELETE FROM public.tasks WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796');

DELETE FROM public.session_fields WHERE session_id IN (SELECT id FROM public.signing_sessions WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796'));
DELETE FROM public.session_documents WHERE session_id IN (SELECT id FROM public.signing_sessions WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796'));
DELETE FROM public.session_recipients WHERE session_id IN (SELECT id FROM public.signing_sessions WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796'));
DELETE FROM public.signing_sessions WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796');

DELETE FROM public.signature_recipients WHERE signature_request_id IN (SELECT id FROM public.signature_requests WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796'));
DELETE FROM public.signature_requests WHERE deal_id IN (SELECT id FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796');

DELETE FROM public.deals WHERE id <> '9e8b7187-efbc-46d6-a3ee-03c24499a796';

-- Reassign 1410 Cleveland Rd and its children to Max Haber
UPDATE public.deals SET user_id='bbeb0c36-616d-4bea-ba3c-07034c79d5a1', primary_agent='Max Haber' WHERE id='9e8b7187-efbc-46d6-a3ee-03c24499a796';
UPDATE public.checklist_items SET user_id='bbeb0c36-616d-4bea-ba3c-07034c79d5a1' WHERE deal_id='9e8b7187-efbc-46d6-a3ee-03c24499a796';
UPDATE public.deal_notes SET user_id='bbeb0c36-616d-4bea-ba3c-07034c79d5a1' WHERE deal_id='9e8b7187-efbc-46d6-a3ee-03c24499a796';
UPDATE public.deal_contacts SET user_id='bbeb0c36-616d-4bea-ba3c-07034c79d5a1' WHERE deal_id='9e8b7187-efbc-46d6-a3ee-03c24499a796';
UPDATE public.offers SET user_id='bbeb0c36-616d-4bea-ba3c-07034c79d5a1' WHERE deal_id='9e8b7187-efbc-46d6-a3ee-03c24499a796';
UPDATE public.open_houses SET user_id='bbeb0c36-616d-4bea-ba3c-07034c79d5a1' WHERE deal_id='9e8b7187-efbc-46d6-a3ee-03c24499a796';
UPDATE public.tasks SET user_id='bbeb0c36-616d-4bea-ba3c-07034c79d5a1' WHERE deal_id='9e8b7187-efbc-46d6-a3ee-03c24499a796';

-- Recreate the user_id-lock triggers on all owner tables
CREATE TRIGGER prevent_user_id_change_deals BEFORE UPDATE ON public.deals FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_contacts BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_tasks BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_deal_notes BEFORE UPDATE ON public.deal_notes FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_deal_contacts BEFORE UPDATE ON public.deal_contacts FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_offers BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_open_houses BEFORE UPDATE ON public.open_houses FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_checklist_items BEFORE UPDATE ON public.checklist_items FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_signing_sessions BEFORE UPDATE ON public.signing_sessions FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_session_documents BEFORE UPDATE ON public.session_documents FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_session_fields BEFORE UPDATE ON public.session_fields FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_session_recipients BEFORE UPDATE ON public.session_recipients FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_signature_requests BEFORE UPDATE ON public.signature_requests FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
CREATE TRIGGER prevent_user_id_change_signature_recipients BEFORE UPDATE ON public.signature_recipients FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();
