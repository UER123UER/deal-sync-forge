
-- 1. bank_accounts: missing DELETE policy
CREATE POLICY "Users can delete their own bank accounts"
ON public.bank_accounts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 2. get_my_referral_stats: require authentication, revoke from anon
DROP FUNCTION IF EXISTS public.get_my_referral_stats();

CREATE OR REPLACE FUNCTION public.get_my_referral_stats()
RETURNS TABLE(total_referrals integer, active_referrals integer, total_earnings integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_code text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT referral_code INTO my_code FROM public.profiles WHERE id = auth.uid();
  IF my_code IS NULL THEN
    RETURN QUERY SELECT 0, 0, 0;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::int,
    COUNT(*) FILTER (WHERE subscription_status = 'active')::int,
    COALESCE(SUM(
      CASE WHEN subscription_status = 'active' AND subscription_activated_at IS NOT NULL
        THEN GREATEST(1, FLOOR(EXTRACT(EPOCH FROM (now() - subscription_activated_at))/(60*60*24*30))::int + 1) * 20
        ELSE 0 END
    ), 0)::int
  FROM public.profiles
  WHERE referred_by_code = my_code;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_referral_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_referral_stats() TO authenticated;

-- 3. Storage policies: admin-documents — restrict writes to admins
DROP POLICY IF EXISTS "Authenticated can insert admin-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can update admin-documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete admin-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read admin-documents" ON storage.objects;

CREATE POLICY "Admins can insert admin-documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'admin-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update admin-documents"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'admin-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete admin-documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'admin-documents' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can read admin-documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'admin-documents');

-- 4. Storage policies: deal-photos — scope to deal owner (path: {dealId}/{file})
DROP POLICY IF EXISTS "Allow all reads from deal-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload deal-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can delete deal-photos" ON storage.objects;

CREATE POLICY "Owners can read their deal-photos"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'deal-photos'
  AND EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id::text = (storage.foldername(name))[1]
      AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can upload deal-photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'deal-photos'
  AND EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id::text = (storage.foldername(name))[1]
      AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can update deal-photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'deal-photos'
  AND EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id::text = (storage.foldername(name))[1]
      AND d.user_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete deal-photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'deal-photos'
  AND EXISTS (
    SELECT 1 FROM public.deals d
    WHERE d.id::text = (storage.foldername(name))[1]
      AND d.user_id = auth.uid()
  )
);

-- 5. Storage policies: avatars — scope listing to owner (public URLs still work via CDN)
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;

CREATE POLICY "Users can read their own avatar"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
