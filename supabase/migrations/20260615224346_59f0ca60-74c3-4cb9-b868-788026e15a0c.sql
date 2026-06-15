
ALTER FUNCTION public.prevent_user_id_change() SET search_path = public;

REVOKE ALL ON FUNCTION public.prevent_user_id_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_user_id_from_deal() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_user_id_from_session() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.set_user_id_from_signature_request() FROM PUBLIC, anon, authenticated;
