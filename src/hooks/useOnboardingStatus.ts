import { useQuery } from '@tanstack/react-query';
import type { User } from '@supabase/supabase-js';

import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/hooks/useAuth';
import { AGREEMENT_DOCUMENT_KEYS } from '@/lib/onboardingLegalDocuments';
import { isFreeBillingPromoCode, normalizePromoCode } from '@/lib/billingPromoCodes';

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

type AgreementSignatureSummary = {
  document_key: string;
  signed_at: string;
  signer_name: string;
};

export type OnboardingStatus = {
  subscriptionStatus: string;
  agreementSigned: boolean;
  agreementSignedAt: string | null;
  agreementSignedName: string | null;
  licenseNumber: string | null;
  hasBillingAccount: boolean;
  billingWaived: boolean;
  billingPromoCode: string | null;
  billingMonthlyFeeAmount: number;
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
  const billingPromoCode =
    typeof user?.user_metadata?.billing_promo_code === 'string'
      ? normalizePromoCode(user.user_metadata.billing_promo_code)
      : null;
  const billingWaived = Boolean(user?.user_metadata?.billing_waived) || (billingPromoCode ? isFreeBillingPromoCode(billingPromoCode) : false);
  const billingMonthlyFeeAmount =
    typeof user?.user_metadata?.billing_monthly_fee_amount === 'number'
      ? user.user_metadata.billing_monthly_fee_amount
      : billingWaived
        ? 0
        : 98;

  return {
    subscriptionStatus: profile?.subscription_status ?? 'pending',
    agreementSigned,
    agreementSignedAt: (user?.user_metadata?.brokerage_agreement_signed_at as string | undefined) ?? null,
    agreementSignedName: (user?.user_metadata?.brokerage_agreement_signed_name as string | undefined) ?? null,
    licenseNumber: profile?.license_number ?? (user?.user_metadata?.license_number as string | undefined) ?? null,
    hasBillingAccount: billingWaived,
    billingWaived,
    billingPromoCode,
    billingMonthlyFeeAmount,
    hasDepositAccount: false,
    latestBillingAccount: null,
    latestDepositAccount: null,
  };
};

export const getNextOnboardingPath = (status: OnboardingStatus | null | undefined) => {
  if (!status) return '/onboarding/agreement';
  if (!status.agreementSigned) return '/onboarding/agreement';
  if (status.subscriptionStatus !== 'active' && !status.billingWaived) return '/onboarding/billing';
  if (!status.hasDepositAccount) return '/onboarding/deposit';
  return '/transactions';
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
      user?.user_metadata?.billing_promo_code,
      user?.user_metadata?.billing_waived,
      user?.user_metadata?.billing_monthly_fee_amount,
    ],
    enabled: !!user && !loading,
    queryFn: async () => {
      const fallbackStatus = getFallbackOnboardingStatus({ user, profile });
      const { data: authResult, error: authError } = await supabase.auth.getUser();
      const liveUser = authResult.user ?? user!;
      const liveBillingPromoCode =
        typeof liveUser.user_metadata?.billing_promo_code === 'string'
          ? normalizePromoCode(liveUser.user_metadata.billing_promo_code)
          : fallbackStatus.billingPromoCode;
      const liveBillingWaived =
        Boolean(liveUser.user_metadata?.billing_waived) ||
        (liveBillingPromoCode ? isFreeBillingPromoCode(liveBillingPromoCode) : false) ||
        fallbackStatus.billingWaived;
      const liveBillingMonthlyFeeAmount =
        typeof liveUser.user_metadata?.billing_monthly_fee_amount === 'number'
          ? liveUser.user_metadata.billing_monthly_fee_amount
          : liveBillingWaived
            ? 0
            : fallbackStatus.billingMonthlyFeeAmount;
      const [billingResult, depositResult, agreementSignaturesResult] = await Promise.all([
        supabase
          .from('bank_accounts')
          .select('id, account_holder_name, routing_number, account_number_last4, account_type')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        (supabase as any)
          .from('direct_deposits')
          .select('id, agent_name, bank_name, routing_number, account_number_last4, account_type')
          .eq('owner_id', user!.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        (supabase as any)
          .from('onboarding_signature_events')
          .select('document_key, signed_at, signer_name')
          .eq('user_id', user!.id)
          .in('document_key', AGREEMENT_DOCUMENT_KEYS)
          .order('signed_at', { ascending: false }),
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
      if (agreementSignaturesResult.error) {
        console.warn('Unable to load onboarding agreement signatures.', agreementSignaturesResult.error);
      }

      const legacyAgreementSigned = Boolean(
        liveUser.user_metadata?.brokerage_agreement_accepted &&
        liveUser.user_metadata?.brokerage_agreement_signed_at &&
        liveUser.user_metadata?.brokerage_agreement_signed_name
      );

      const latestSignaturesByKey = new Map<string, AgreementSignatureSummary>();

      for (const row of (agreementSignaturesResult.data ?? []) as AgreementSignatureSummary[]) {
        if (!latestSignaturesByKey.has(row.document_key)) {
          latestSignaturesByKey.set(row.document_key, row);
        }
      }

      const agreementBundleSigned = AGREEMENT_DOCUMENT_KEYS.every((key) => latestSignaturesByKey.has(key));
      const agreementSignatureRows = Array.from(latestSignaturesByKey.values());
      const latestAgreementSignature = agreementSignatureRows
        .map((row) => row.signed_at)
        .sort((left, right) => new Date(left).getTime() - new Date(right).getTime())
        .at(-1);
      const agreementSigned = agreementBundleSigned || legacyAgreementSigned;

      return {
        subscriptionStatus: fallbackStatus.subscriptionStatus,
        agreementSigned,
        agreementSignedAt:
          latestAgreementSignature ??
          (liveUser.user_metadata?.brokerage_agreement_signed_at as string | undefined) ??
          null,
        agreementSignedName:
          agreementSignatureRows[0]?.signer_name ??
          (liveUser.user_metadata?.brokerage_agreement_signed_name as string | undefined) ??
          null,
        licenseNumber: fallbackStatus.licenseNumber ?? (liveUser.user_metadata?.license_number as string | undefined) ?? null,
        hasBillingAccount: !!billingResult.data || liveBillingWaived,
        billingWaived: liveBillingWaived,
        billingPromoCode: liveBillingPromoCode ?? null,
        billingMonthlyFeeAmount: liveBillingMonthlyFeeAmount,
        hasDepositAccount: !!depositResult.data,
        latestBillingAccount: (billingResult.data as BillingAccountSummary | null) ?? null,
        latestDepositAccount: (depositResult.data as DepositAccountSummary | null) ?? null,
      } satisfies OnboardingStatus;
    },
  });
}
