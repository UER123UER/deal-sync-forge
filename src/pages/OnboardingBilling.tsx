import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FileSignature,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
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
import {
  ACH_ESIGN_CONSENT_TEXT,
  buildDocumentBody,
  getAchPaymentAuthorizationDocument,
} from '@/lib/onboardingLegalDocuments';
import { recordOnboardingSignatures } from '@/lib/onboardingSignatureRecorder';
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

export default function OnboardingBilling() {
  const { user, profile, loading: authLoading } = useAuth();
  const { data: onboardingStatus, isLoading } = useOnboardingStatus({ user, profile, loading: authLoading });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('checking');
  const [authorizationSignature, setAuthorizationSignature] = useState('');
  const [agreedToAchTerms, setAgreedToAchTerms] = useState(false);
  const [agreedToEsign, setAgreedToEsign] = useState(false);
  const [saving, setSaving] = useState(false);
  const currentStatus =
    onboardingStatus ??
    getFallbackOnboardingStatus({
      user,
      profile,
    });

  const defaultAccountHolderName = useMemo(
    () =>
      currentStatus.latestBillingAccount?.account_holder_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim(),
    [currentStatus.latestBillingAccount?.account_holder_name, profile?.first_name, profile?.last_name]
  );

  const defaultSignatureName = useMemo(
    () => [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim(),
    [profile?.first_name, profile?.last_name]
  );

  useEffect(() => {
    if (!accountHolderName && defaultAccountHolderName) setAccountHolderName(defaultAccountHolderName);
    if (!routingNumber && currentStatus.latestBillingAccount?.routing_number) {
      setRoutingNumber(currentStatus.latestBillingAccount.routing_number);
    }
    if (!authorizationSignature && defaultSignatureName) {
      setAuthorizationSignature(defaultSignatureName);
    }
    if (currentStatus.latestBillingAccount?.account_type) {
      setAccountType(currentStatus.latestBillingAccount.account_type);
    }
  }, [accountHolderName, authorizationSignature, currentStatus, defaultAccountHolderName, defaultSignatureName, routingNumber]);

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
  const canSubmit =
    accountHolderName.trim().length > 0 &&
    authorizationSignature.trim().length > 0 &&
    agreedToAchTerms &&
    agreedToEsign &&
    routingResult.valid &&
    accountResult.valid &&
    confirmResult.valid;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSaving(true);

    const billingPayload = {
      user_id: user.id,
      account_holder_name: accountHolderName.trim(),
      routing_number: routingNumber,
      account_number_last4: accountNumber.slice(-4),
      account_type: accountType,
    };

    const existingBillingId = currentStatus.latestBillingAccount?.id;
    const response = existingBillingId
      ? await supabase.from('bank_accounts').update(billingPayload).eq('id', existingBillingId)
      : await supabase.from('bank_accounts').insert(billingPayload);

    if (response.error) {
      setSaving(false);
      toast({ title: 'Error saving billing account', description: response.error.message, variant: 'destructive' });
      return;
    }

    queryClient.setQueriesData({ queryKey: ['onboarding_status'] }, (existing) => ({
      ...((existing && typeof existing === 'object') ? (existing as Record<string, unknown>) : {}),
      ...currentStatus,
      hasBillingAccount: true,
      latestBillingAccount: {
        id: existingBillingId ?? 'pending-billing-account',
        account_holder_name: billingPayload.account_holder_name,
        routing_number: billingPayload.routing_number,
        account_number_last4: billingPayload.account_number_last4,
        account_type: billingPayload.account_type,
      },
    }));

    const achDocument = getAchPaymentAuthorizationDocument({
      bankName,
      accountHolderName: billingPayload.account_holder_name,
      accountNumberLast4: billingPayload.account_number_last4,
      accountType: billingPayload.account_type,
    });

    try {
      await recordOnboardingSignatures([
        {
          documentKey: achDocument.key,
          documentTitle: achDocument.title,
          documentVersion: achDocument.version,
          documentBody: buildDocumentBody(achDocument),
          signedName: authorizationSignature.trim(),
          signerEmail: user.email ?? null,
          signatureType: 'typed_name',
          signatureValue: authorizationSignature.trim(),
          consentText: ACH_ESIGN_CONSENT_TEXT,
          agreedToTerms: true,
          agreedToEsign: true,
          evidence: {
            onboarding_step: 'billing',
            monthly_fee_amount: 98,
            bank_name: bankName.trim() || null,
            account_holder_name: billingPayload.account_holder_name,
            account_type: billingPayload.account_type,
            account_number_last4: billingPayload.account_number_last4,
          },
        },
      ]);
    } catch (error) {
      setSaving(false);
      toast({
        title: 'Billing saved but authorization record failed',
        description:
          error instanceof Error
            ? error.message
            : 'The ACH authorization signature record could not be stored.',
        variant: 'destructive',
      });
      return;
    }

    void queryClient.invalidateQueries({ queryKey: ['onboarding_status'] });
    toast({ title: 'Billing authorization saved', description: 'Next up: choose your deposit account.' });
    navigate('/onboarding/deposit', { replace: true });
    setSaving(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <CreditCard className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Step 2 of 3</div>
          <CardTitle className="text-2xl">Set Up Billing</CardTitle>
          <CardDescription>We will use this account for your $98 monthly brokerage membership fee.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-start gap-2.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-xs leading-relaxed text-blue-700">
                Enter the account you want us to use for billing. United Estates Realty stores your ACH authorization
                together with the signed document version, timestamp, and audit details. The operational bank table only
                keeps the routing number and the last 4 digits of the account number.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billing-holder-name">Account Holder Name</Label>
              <Input
                id="billing-holder-name"
                placeholder="Full legal name on account"
                value={accountHolderName}
                onChange={(event) => setAccountHolderName(event.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billing-bank-name">Bank Name</Label>
              <Input
                id="billing-bank-name"
                placeholder="Optional"
                value={bankName}
                onChange={(event) => setBankName(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billing-routing">Routing Number</Label>
              <Input
                id="billing-routing"
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
                required
              />
              <FieldHint value={routingNumber} result={routingResult} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billing-account">Account Number</Label>
              <Input
                id="billing-account"
                placeholder="Enter your account number"
                type="password"
                value={accountNumber}
                onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, '').slice(0, 17))}
                className={cn(
                  accountNumber &&
                    (accountResult.valid
                      ? 'border-emerald-500 focus-visible:ring-emerald-500/30'
                      : 'border-destructive focus-visible:ring-destructive/30')
                )}
                required
              />
              <FieldHint value={accountNumber} result={accountResult} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="billing-confirm-account">Confirm Account Number</Label>
              <Input
                id="billing-confirm-account"
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
                required
              />
              <FieldHint value={confirmAccountNumber} result={confirmResult} />
            </div>

            <div className="space-y-3">
              <Label>Account Type</Label>
              <RadioGroup value={accountType} onValueChange={setAccountType} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="checking" id="billing-checking" />
                  <Label htmlFor="billing-checking" className="cursor-pointer font-normal">Checking</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="savings" id="billing-savings" />
                  <Label htmlFor="billing-savings" className="cursor-pointer font-normal">Savings</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="rounded-2xl border bg-muted/15 p-5">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <FileSignature className="h-4 w-4 text-primary" />
                ACH payment authorization
              </div>

              <div className="mt-4 rounded-xl border bg-background px-4 py-4 text-sm leading-6 text-foreground/90">
                <p>
                  The sole payment method accepted by United Estates Realty is ACH bank draft. By signing below, you
                  authorize recurring monthly ACH debit entries of <strong>$98.00</strong> from the designated account
                  on the <strong>1st day of each calendar month</strong>.
                </p>
                <p className="mt-3">
                  This authorization remains in effect until terminated in writing by either party with at least ten
                  (10) business days&apos; notice before the next scheduled draft date.
                </p>
                <ul className="mt-3 space-y-1 pl-5">
                  <li className="list-disc">Bank name: {bankName || 'Not entered yet'}</li>
                  <li className="list-disc">Account holder: {accountHolderName || 'Not entered yet'}</li>
                  <li className="list-disc">Account type: {accountType}</li>
                  <li className="list-disc">Account ending in: {accountNumber.slice(-4) || '____'}</li>
                </ul>
                <p className="mt-3">
                  By signing, you also certify that the onboarding information you provided is true, accurate, and complete.
                </p>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-[1.35fr_0.65fr]">
                <div className="space-y-2">
                  <Label htmlFor="billing-signature-name">Typed Legal Name</Label>
                  <Input
                    id="billing-signature-name"
                    placeholder="Type your full legal name"
                    value={authorizationSignature}
                    onChange={(event) => setAuthorizationSignature(event.target.value)}
                    className="text-lg italic"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <div className="flex h-10 items-center rounded-md border bg-background px-3 text-sm text-foreground">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>

              <label className="mt-4 flex items-start gap-3 rounded-xl border bg-background px-4 py-3">
                <Checkbox checked={agreedToAchTerms} onCheckedChange={(checked) => setAgreedToAchTerms(checked === true)} />
                <span className="text-sm leading-6 text-foreground/90">
                  I authorize United Estates Realty to debit the designated account for $98.00 on the 1st of each month.
                  I understand returned payments and uncured ACH failures are governed by the Independent Contractor Agreement.
                </span>
              </label>

              <label className="mt-3 flex items-start gap-3 rounded-xl border bg-background px-4 py-3">
                <Checkbox checked={agreedToEsign} onCheckedChange={(checked) => setAgreedToEsign(checked === true)} />
                <span className="text-sm leading-6 text-foreground/90">{ACH_ESIGN_CONSENT_TEXT}</span>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={saving || !canSubmit}>
              {saving ? 'Saving billing...' : 'Continue to Deposit Setup'}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Securely stored. Full account numbers are not saved to your operational banking records.</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
