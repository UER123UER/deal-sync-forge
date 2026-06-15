CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_ref text;
BEGIN
  v_ref := NULLIF(UPPER(TRIM(NEW.raw_user_meta_data ->> 'referral_code')), '');

  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, referred_by_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', ''),
    v_ref
  );
  RETURN NEW;
END;
$function$;