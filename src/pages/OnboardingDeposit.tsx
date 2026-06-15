import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Eye, EyeOff, Landmark, ShieldCheck, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { getFallbackOnboardingStatus, useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validateAccountConfirm, validateAccountNumber, validateRoutingNumber } from '@/lib/bankingValidation';
import { cn } from '@/lib/utils';

function FieldHint({ value, result }: { value: string; result: { valid: boolean; message: string } }) {
  if (!value) return null;

  return (
    <p className={cn('mt-1 flex items-center gap-1 text-xs', result.valid ? 'text-emerald-600' : 'text-destructive')}>
      {result.valid ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
      {result.message}
    </p>
  );
}

export default function OnboardingDeposit() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const { data: onboardingStatus, isLoading } = useOnboardingStatus({ user, profile, loading: authLoading });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [useBillingAccount, setUseBillingAccount] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);
  const [accountType, setAccountType] = useState('checking');
  const [saving, setSaving] = useState(false);

  const currentStatus =
    onboardingStatus ??
    getFallbackOnboardingStatus({
      user,
      profile,
    });

  const defaultAgentName = useMemo(
    () =>
      currentStatus.latestDepositAccount?.agent_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim(),
    [currentStatus.latestDepositAccount?.agent_name, profile?.first_name, profile?.last_name]
  );

  useEffect(() => {
    if (!agentName && defaultAgentName) setAgentName(defaultAgentName);

    if (currentStatus.latestDepositAccount) {
      if (!bankName && currentStatus.latestDepositAccount.bank_name) {
        setBankName(currentStatus.latestDepositAccount.bank_name);
      }
      if (!routingNumber) setRoutingNumber(currentStatus.latestDepositAccount.routing_number);
      setAccountType(currentStatus.latestDepositAccount.account_type);
    }
  }, [agentName, bankName, currentStatus, defaultAgentName, routingNumber]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const routingResult = validateRoutingNumber(routingNumber);
  const accountResult = validateAccountNumber(accountNumber);
  const confirmResult = validateAccountConfirm(accountNumber, confirmAccountNumber);
  const canSubmitDifferentAccount =
    agentName.trim().length > 0 &&
    routingResult.valid &&
    accountResult.valid &&
    confirmResult.valid;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!agentName.trim()) return;
    if (useBillingAccount && !currentStatus.latestBillingAccount) {
      toast({ title: 'Billing account missing', description: 'Please finish billing first.', variant: 'destructive' });
      return;
    }
    if (!useBillingAccount && !canSubmitDifferentAccount) return;

    setSaving(true);

    const depositPayload = useBillingAccount
      ? {
          owner_id: user.id,
          agent_name: agentName.trim(),
          bank_name: bankName.trim() || null,
          routing_number: currentStatus.latestBillingAccount!.routing_number,
          account_number_last4: currentStatus.latestBillingAccount!.account_number_last4,
          account_type: currentStatus.latestBillingAccount!.account_type,
        }
      : {
          owner_id: user.id,
          agent_name: agentName.trim(),
          bank_name: bankName.trim() || null,
          routing_number: routingNumber,
          account_number_last4: accountNumber.slice(-4),
          account_type: accountType,
        };

    const existingDepositId = currentStatus.latestDepositAccount?.id;
    const depositResponse = existingDepositId
      ? await ((supabase as any).from('direct_deposits')).update(depositPayload).eq('id', existingDepositId)
      : await ((supabase as any).from('direct_deposits')).insert(depositPayload);

    if (depositResponse.error) {
      setSaving(false);
      toast({ title: 'Could not save deposit account', description: depositResponse.error.message, variant: 'destructive' });
      return;
    }

    const { error: profileError } = await (supabase.from('profiles') as any)
      .update({
        subscription_status: 'active',
        subscription_activated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      setSaving(false);
      toast({ title: 'Could not activate account', description: profileError.message, variant: 'destructive' });
      return;
    }

    queryClient.setQueriesData({ queryKey: ['onboarding_status'] }, (existing) => ({
      ...((existing && typeof existing === 'object') ? existing as Record<string, unknown> : {}),
      ...currentStatus,
      subscriptionStatus: 'active',
      hasDepositAccount: true,
      latestDepositAccount: {
        id: existingDepositId ?? 'pending-deposit-account',
        agent_name: depositPayload.agent_name,
        bank_name: depositPayload.bank_name,
        routing_number: depositPayload.routing_number,
        account_number_last4: depositPayload.account_number_last4,
        account_type: depositPayload.account_type,
      },
    }));

    await refreshProfile?.();
    void queryClient.invalidateQueries({ queryKey: ['onboarding_status'] });
    toast({ title: 'Welcome aboard', description: 'Your brokerage account is active.' });
    navigate('/transactions', { replace: true });
    setSaving(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Landmark className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 3 of 3</div>
          <CardTitle className="text-2xl">Set Up Direct Deposit</CardTitle>
          <CardDescription>Choose where United Estates Realty should send your commission payouts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="agent-name">Payee Name</Label>
              <Input
                id="agent-name"
                placeholder="Name on the deposit account"
                value={agentName}
                onChange={(event) => setAgentName(event.target.value)}
                required
              />
            </div>

            {currentStatus.billingWaived && !currentStatus.latestBillingAccount ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
                Monthly billing is waived with promo code {currentStatus.billingPromoCode ?? 'on file'}. Enter the account where commissions should be deposited.
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="deposit-bank-name">Bank Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="deposit-bank-name"
                  placeholder="Optional"
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {useBillingAccount ? (
              <div className="rounded-xl border bg-muted/20 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Billing account will also be used for deposits
                </div>
                {currentStatus.latestBillingAccount ? (
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>{currentStatus.latestBillingAccount.account_holder_name}</p>
                    <p className="capitalize">
                      {currentStatus.latestBillingAccount.account_type} - ending in {currentStatus.latestBillingAccount.account_number_last4}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-destructive">No billing account is available yet.</p>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="deposit-routing">Routing Number</Label>
                  <Input
                    id="deposit-routing"
                    placeholder="9-digit ABA routing number"
                    maxLength={9}
                    value={routingNumber}
                    onChange={(event) => setRoutingNumber(event.target.value.replace(/\D/g, ''))}
                    className={cn(
                      routingNumber &&
                        (routingResult.valid
                          ? 'border-emerald-500 focus-visible:ring-emerald-500/30'
                          : 'border-destructive focus-visible:ring-destructive/30')
                    )}
                    required={!useBillingAccount}
                  />
                  <FieldHint value={routingNumber} result={routingResult} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deposit-account">Account Number</Label>
                  <div className="relative">
                    <Input
                      id="deposit-account"
                      placeholder="Enter your account number"
                      type={showAccountNumber ? 'text' : 'password'}
                      value={accountNumber}
                      onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 17))}
                      className={cn(
                        'pr-10',
                        accountNumber &&
                          (accountResult.valid
                            ? 'border-emerald-500 focus-visible:ring-emerald-500/30'
                            : 'border-destructive focus-visible:ring-destructive/30')
                      )}
                      required={!useBillingAccount}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowAccountNumber((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none"
                    >
                      {showAccountNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldHint value={accountNumber} result={accountResult} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deposit-confirm-account">Confirm Account Number</Label>
                  <Input
                    id="deposit-confirm-account"
                    placeholder="Re-enter account number"
                    type="password"
                    value={confirmAccountNumber}
                    onChange={(event) => setConfirmAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 17))}
                    className={cn(
                      confirmAccountNumber &&
                        (confirmResult.valid
                          ? 'border-emerald-500 focus-visible:ring-emerald-500/30'
                          : 'border-destructive focus-visible:ring-destructive/30')
                    )}
                    required={!useBillingAccount}
                  />
                  <FieldHint value={confirmAccountNumber} result={confirmResult} />
                </div>

                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <RadioGroup value={accountType} onValueChange={setAccountType} className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="checking" id="deposit-checking" />
                      <Label htmlFor="deposit-checking" className="cursor-pointer font-normal">Checking</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="savings" id="deposit-savings" />
                      <Label htmlFor="deposit-savings" className="cursor-pointer font-normal">Savings</Label>
                    </div>
                  </RadioGroup>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={saving || (!useBillingAccount && !canSubmitDifferentAccount) || (useBillingAccount && !currentStatus.latestBillingAccount)}
            >
              {saving ? 'Finishing setup...' : 'Finish Setup'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
