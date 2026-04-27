import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export const getNextOnboardingPath = (status: OnboardingStatus | null | undefined) => {
  if (!status) return '/onboarding/agreement';
  if (status.subscriptionStatus === 'active') return '/transactions';
  if (!status.agreementSigned) return '/onboarding/agreement';
  if (!status.hasBillingAccount) return '/onboarding/billing';
  if (!status.hasDepositAccount) return '/onboarding/deposit';
  return '/onboarding/deposit';
};

export function useOnboardingStatus() {
  const { user, profile, loading } = useAuth();

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
      const { data: authResult } = await supabase.auth.getUser();
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

      if (billingResult.error) throw billingResult.error;
      if (depositResult.error) throw depositResult.error;

      const agreementSigned = Boolean(
        liveUser.user_metadata?.brokerage_agreement_accepted &&
        liveUser.user_metadata?.brokerage_agreement_signed_at &&
        liveUser.user_metadata?.brokerage_agreement_signed_name
      );

      return {
        subscriptionStatus: profile?.subscription_status ?? 'pending',
        agreementSigned,
        agreementSignedAt: (liveUser.user_metadata?.brokerage_agreement_signed_at as string | undefined) ?? null,
        agreementSignedName: (liveUser.user_metadata?.brokerage_agreement_signed_name as string | undefined) ?? null,
        licenseNumber: profile?.license_number ?? (liveUser.user_metadata?.license_number as string | undefined) ?? null,
        hasBillingAccount: !!billingResult.data,
        hasDepositAccount: !!depositResult.data,
        latestBillingAccount: billingResult.data as BillingAccountSummary | null,
        latestDepositAccount: depositResult.data as DepositAccountSummary | null,
      } satisfies OnboardingStatus;
    },
  });
}
