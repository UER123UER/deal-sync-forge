
CREATE OR REPLACE FUNCTION public.get_my_referral_stats()
RETURNS TABLE(total_referrals int, active_referrals int, total_earnings int)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  my_code text;
BEGIN
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

GRANT EXECUTE ON FUNCTION public.get_my_referral_stats() TO authenticated;
