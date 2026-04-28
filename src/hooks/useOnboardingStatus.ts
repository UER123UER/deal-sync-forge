import { useQuery } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/hooks/useAuth';

type BillingAccountSummary = {
  id: string;
  account_holder_name: string;
  routing_number: string;
  account_number_last4: string;
  account_type: string;
};

type DepositAccountSummary = {
  id: string;
  agent_name: string;
  bank_name: string | null;
  routing_number: string;
  account_number_last4: string;
  account_type: string;
};

export type OnboardingStatus = {
  subscriptionStatus: string;
  agreementSigned: boolean;
  agreementSignedAt: string | null;
  agreementSignedName: string | null;
  licenseNumber: string | null;
  hasBillingAccount: boolean;
  hasDepositAccount: boolean;
  latestBillingAccount: BillingAccountSummary | null;
  latestDepositAccount: DepositAccountSummary | null;
};

export const getFallbackOnboardingStatus = ({
  user,
  profile,
}: {
  user: User | null;
  profile: Profile | null;
}): OnboardingStatus => {
  const agreementSigned = Boolean(
    user?.user_metadata?.brokerage_agreement_accepted &&
    user?.user_metadata?.brokerage_agreement_signed_at &&
    user?.user_metadata?.brokerage_agreement_signed_name
  );

  return {
    subscriptionStatus: profile?.subscription_status ?? 'pending',
    agreementSigned,
    agreementSignedAt: (user?.user_metadata?.brokerage_agreement_signed_at as string | undefined) ?? null,
    agreementSignedName: (user?.user_metadata?.brokerage_agreement_signed_name as string | undefined) ?? null,
    licenseNumber: profile?.license_number ?? (user?.user_metadata?.license_number as string | undefined) ?? null,
    hasBillingAccount: false,
    hasDepositAccount: false,
    latestBillingAccount: null,
    latestDepositAccount: null,
  };
};

export const getNextOnboardingPath = (status: OnboardingStatus | null | undefined) => {
  if (!status) return '/onboarding/agreement';
  if (status.subscriptionStatus === 'active') return '/transactions';
  if (!status.agreementSigned) return '/onboarding/agreement';
  if (!status.hasBillingAccount) return '/onboarding/billing';
  if (!status.hasDepositAccount) return '/onboarding/deposit';
  return '/onboarding/deposit';
};

export function useOnboardingStatus({
  user,
  profile,
  loading,
}: {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}) {
  return useQuery({
    queryKey: [
      'onboarding_status',
      user?.id,
      profile?.subscription_status,
      profile?.license_number,
      user?.user_metadata?.brokerage_agreement_signed_at,
      user?.user_metadata?.brokerage_agreement_signed_name,
    ],
    enabled: !!user && !loading,
    queryFn: async () => {
      const fallbackStatus = getFallbackOnboardingStatus({ user, profile });
      const { data: authResult, error: authError } = await supabase.auth.getUser();
      const liveUser = authResult.user ?? user!;
      const [billingResult, depositResult] = await Promise.all([
        supabase
          .from('bank_accounts')
          .select('id, account_holder_name, routing_number, account_number_last4, account_type')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('direct_deposits')
          .select('id, agent_name, bank_name, routing_number, account_number_last4, account_type')
          .eq('owner_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (authError) {
        console.warn('Unable to refresh auth user during onboarding status lookup.', authError);
      }
      if (billingResult.error) {
        console.warn('Unable to load billing account during onboarding status lookup.', billingResult.error);
      }
      if (depositResult.error) {
        console.warn('Unable to load deposit account during onboarding status lookup.', depositResult.error);
      }

      const agreementSigned = Boolean(
        liveUser.user_metadata?.brokerage_agreement_accepted &&
        liveUser.user_metadata?.brokerage_agreement_signed_at &&
        liveUser.user_metadata?.brokerage_agreement_signed_name
      );

      return {
        subscriptionStatus: fallbackStatus.subscriptionStatus,
        agreementSigned,
        agreementSignedAt: (liveUser.user_metadata?.brokerage_agreement_signed_at as string | undefined) ?? null,
        agreementSignedName: (liveUser.user_metadata?.brokerage_agreement_signed_name as string | undefined) ?? null,
        licenseNumber: fallbackStatus.licenseNumber ?? (liveUser.user_metadata?.license_number as string | undefined) ?? null,
        hasBillingAccount: !!billingResult.data,
        hasDepositAccount: !!depositResult.data,
        latestBillingAccount: (billingResult.data as BillingAccountSummary | null) ?? null,
        latestDepositAccount: (depositResult.data as DepositAccountSummary | null) ?? null,
      } satisfies OnboardingStatus;
    },
  });
}
