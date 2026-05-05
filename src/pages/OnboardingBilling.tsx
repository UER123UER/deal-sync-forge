import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  BadgePercent,
  Building2,
  CheckCircle2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { getFallbackOnboardingStatus, useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FREE_BILLING_PROMO_CODE, isFreeBillingPromoCode, normalizePromoCode } from '@/lib/billingPromoCodes';
import { cn } from '@/lib/utils';

export default function OnboardingBilling() {
  const { user, profile, loading: authLoading } = useAuth();
  const { data: onboardingStatus } = useOnboardingStatus({ user, profile, loading: authLoading });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [launching, setLaunching] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoTouched, setPromoTouched] = useState(false);
  const [savingPromo, setSavingPromo] = useState(false);

  const status = params.get('status');
  const currentStatus =
    onboardingStatus ??
    getFallbackOnboardingStatus({
      user,
      profile,
    });
  const normalizedPromoCode = normalizePromoCode(promoCode);
  const promoApplied = isFreeBillingPromoCode(promoCode);
  const promoCodeError = promoTouched && promoCode.trim().length > 0 && !promoApplied;

  useEffect(() => {
    if (status !== 'success' || !user) return;
    let cancelled = false;
    const verify = async () => {
      setVerifying(true);
      for (let i = 0; i < 5; i++) {
        const { data, error } = await supabase.functions.invoke('check-subscription');
        if (!cancelled && !error && (data as any)?.subscribed) {
          toast({ title: 'Subscription active', description: 'Welcome aboard!' });
          await queryClient.invalidateQueries({ queryKey: ['onboarding_status'] });
          await queryClient.invalidateQueries({ queryKey: ['profile'] });
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (!cancelled) {
        setVerifying(false);
        setParams({}, { replace: true });
      }
    };
    void verify();
    return () => {
      cancelled = true;
    };
  }, [status, user, queryClient, setParams, toast]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (currentStatus.subscriptionStatus === 'active' || currentStatus.billingWaived) {
    return <Navigate to="/onboarding/deposit" replace />;
  }

  const handleCheckout = async () => {
    setLaunching(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if ((data as any)?.url) {
        window.location.href = (data as any).url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      toast({
        title: 'Could not start checkout',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
      setLaunching(false);
    }
  };

  const handlePromoContinue = async () => {
    setPromoTouched(true);
    if (!promoApplied) return;

    setSavingPromo(true);
    const appliedAt = new Date().toISOString();
    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        billing_waived: true,
        billing_promo_code: normalizedPromoCode || FREE_BILLING_PROMO_CODE,
        billing_monthly_fee_amount: 0,
        billing_promo_applied_at: appliedAt,
      },
    });

    if (error) {
      setSavingPromo(false);
      toast({ title: 'Promo code could not be saved', description: error.message, variant: 'destructive' });
      return;
    }

    queryClient.setQueriesData({ queryKey: ['onboarding_status'] }, (existing) => ({
      ...((existing && typeof existing === 'object') ? (existing as Record<string, unknown>) : {}),
      ...currentStatus,
      hasBillingAccount: true,
      billingWaived: true,
      billingPromoCode: normalizedPromoCode || FREE_BILLING_PROMO_CODE,
      billingMonthlyFeeAmount: 0,
    }));

    void queryClient.invalidateQueries({ queryKey: ['onboarding_status'] });
    toast({ title: 'Promo code applied', description: 'Your membership is $0/month. Next up: deposit setup.' });
    navigate('/onboarding/deposit', { replace: true });
    setSavingPromo(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <CreditCard className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 2 of 3</div>
          <CardTitle className="text-2xl">Activate Your Membership</CardTitle>
          <CardDescription>
            Complete your brokerage membership through Stripe ACH bank debit, or apply an approved promo code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border bg-background p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">United Estates Realty</p>
                <p className="text-lg font-semibold">Agent Membership</p>
              </div>
              <div className="text-right">
                <p className={cn('text-3xl font-bold', promoApplied && 'text-emerald-700')}>{promoApplied ? '$0' : '$98'}</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{promoApplied ? 'Monthly brokerage fee waived by promo code' : 'Recurring monthly billing on the same day each month'}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>Cancel anytime by contacting the brokerage</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{promoApplied ? 'No Stripe checkout needed for $0/month access' : 'Securely processed by Stripe'}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border bg-muted/15 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <BadgePercent className="h-4 w-4 text-primary" />
              Promo code
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input
                id="billing-promo-code"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(event) => {
                  setPromoCode(event.target.value);
                  if (promoTouched) setPromoTouched(false);
                }}
                onBlur={() => setPromoTouched(true)}
                className={cn(
                  promoApplied && 'border-emerald-500 focus-visible:ring-emerald-500/30',
                  promoCodeError && 'border-destructive focus-visible:ring-destructive/30'
                )}
              />
              <Button type="button" variant="outline" onClick={() => setPromoTouched(true)}>
                Apply
              </Button>
            </div>
            {promoApplied ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                Promo applied. Monthly billing is $0.
              </p>
            ) : promoCodeError ? (
              <p className="mt-2 text-xs text-destructive">
                That code is not valid. Use {FREE_BILLING_PROMO_CODE} to make the monthly fee $0.
              </p>
            ) : null}
          </div>

          {promoApplied ? (
            <Button type="button" className="w-full" size="lg" onClick={handlePromoContinue} disabled={savingPromo}>
              {savingPromo ? 'Applying promo...' : 'Continue with $0/month Promo'}
            </Button>
          ) : (
            <>
              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div className="text-sm leading-relaxed text-blue-800">
                  <p className="font-medium">ACH bank debit only</p>
                  <p className="text-xs text-blue-700/90">
                    Credit and debit cards are not accepted. You'll connect your bank through Stripe's secure checkout to
                    authorize the recurring $98 monthly ACH debit.
                  </p>
                </div>
              </div>

              <Button
                type="button"
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={launching || verifying}
              >
                {verifying ? (
                  'Verifying subscription...'
                ) : launching ? (
                  'Redirecting to Stripe...'
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Continue to Stripe Checkout
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </>
          )}

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{promoApplied ? 'The approved promo is stored on your account.' : 'Bank credentials are handled by Stripe and never stored on our servers.'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
