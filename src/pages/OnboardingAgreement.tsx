import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, FileSignature } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { UERLogo } from '@/components/UERLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { getFallbackOnboardingStatus, useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function OnboardingAgreement() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const { data: onboardingStatus } = useOnboardingStatus({ user, profile, loading: authLoading });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const defaultSignatureName = useMemo(
    () => [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim(),
    [profile?.first_name, profile?.last_name]
  );

  const [signatureName, setSignatureName] = useState(defaultSignatureName);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToEsign, setAgreedToEsign] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!signatureName && defaultSignatureName) {
      setSignatureName(defaultSignatureName);
    }
  }, [defaultSignatureName, signatureName]);

  const currentStatus =
    onboardingStatus ??
    getFallbackOnboardingStatus({
      user,
      profile,
    });

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const handleContinue = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!signatureName.trim() || !agreedToTerms || !agreedToEsign) return;

    setLoading(true);
    const signedAt = new Date().toISOString();

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        brokerage_agreement_accepted: true,
        brokerage_agreement_signed_at: signedAt,
        brokerage_agreement_signed_name: signatureName.trim(),
      },
    });

    if (metadataError) {
      setLoading(false);
      toast({ title: 'Could not save agreement', description: metadataError.message, variant: 'destructive' });
      return;
    }

    const { error: profileError } = await (supabase.from('profiles') as any)
      .update({
        brokerage_name: 'United Estates Realty',
        license_number: onboardingStatus?.licenseNumber ?? profile?.license_number ?? null,
      })
      .eq('id', user.id);

    if (profileError) {
      setLoading(false);
      toast({ title: 'Could not finish agreement', description: profileError.message, variant: 'destructive' });
      return;
    }

    queryClient.setQueriesData({ queryKey: ['onboarding_status'] }, (existing) => ({
      ...((existing && typeof existing === 'object') ? existing as Record<string, unknown> : {}),
      ...currentStatus,
      agreementSigned: true,
      agreementSignedAt: signedAt,
      agreementSignedName: signatureName.trim(),
      licenseNumber: currentStatus.licenseNumber ?? profile?.license_number ?? null,
    }));

    await refreshProfile?.();
    void queryClient.invalidateQueries({ queryKey: ['onboarding_status'] });
    toast({ title: 'Agreement signed', description: 'Next up: your billing setup.' });
    navigate('/onboarding/billing', { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b bg-background px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-2xl">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Brokerage Agreement
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold text-foreground">
                    United Estates Realty Independent Agent Agreement
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    This rough draft covers the main terms for joining United Estates Realty as an independent real estate agent.
                  </p>
                </div>
                <div className="flex justify-start sm:justify-end">
                  <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
                    <UERLogo width={170} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 px-6 py-8 sm:px-8">
              <section className="space-y-4 text-sm leading-7 text-foreground/90">
                <p>
                  This Independent Agent Agreement is entered into by and between <strong>United Estates Realty</strong>
                  {' '}and the undersigned real estate professional.
                </p>
                <p>
                  By signing below, the agent confirms that they are applying to join the brokerage as an
                  independent real estate agent and will maintain all licenses, memberships, and compliance
                  obligations required to legally perform real estate services in their market.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Key Terms</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    'Monthly brokerage membership fee: $98 per month.',
                    'Agent receives 100% of their earned commission, subject to any co-broke splits or legal deductions.',
                    'No transaction fee is charged by the brokerage under this draft agreement.',
                    'Agent is responsible for maintaining an active real estate license and accurate MLS / association standing.',
                    'Agent agrees to follow brokerage policies, compliance standards, and lawful advertising requirements.',
                    'Either party may terminate the relationship according to brokerage policy and any active-file obligations.',
                  ].map((term) => (
                    <div key={term} className="rounded-xl border bg-muted/20 px-4 py-3 text-sm leading-6 text-foreground/90">
                      {term}
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4 text-sm leading-7 text-foreground/90">
                <h2 className="text-lg font-semibold text-foreground">Agent Acknowledgements</h2>
                <p>
                  The agent understands that this onboarding flow is part of joining United Estates Realty and that the
                  brokerage may request additional documents, identification, or licensing verification before activating
                  the account.
                </p>
                <p>
                  The agent also agrees that electronic records, typed signatures, and electronically delivered brokerage
                  notices may be used for this onboarding and membership process.
                </p>
              </section>

              <form onSubmit={handleContinue} className="space-y-5 rounded-2xl border bg-muted/15 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileSignature className="h-4 w-4 text-primary" />
                  Signature
                </div>

                <div className="grid gap-5 sm:grid-cols-[1.35fr_0.65fr]">
                  <div className="space-y-2">
                    <Label htmlFor="signature-name">Legal Signature</Label>
                    <Input
                      id="signature-name"
                      value={signatureName}
                      onChange={(event) => setSignatureName(event.target.value)}
                      placeholder="Type your full legal name"
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

                <label className="flex items-start gap-3 rounded-xl border bg-background px-4 py-3">
                  <Checkbox checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked === true)} />
                  <span className="text-sm leading-6 text-foreground/90">
                    I agree to the brokerage terms above, including the $98 monthly membership fee and the 100% commission structure in this draft.
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-xl border bg-background px-4 py-3">
                  <Checkbox checked={agreedToEsign} onCheckedChange={(checked) => setAgreedToEsign(checked === true)} />
                  <span className="text-sm leading-6 text-foreground/90">
                    I consent to using my typed name as an electronic signature for this agreement.
                  </span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    After signing, you will continue to billing setup.
                  </div>
                  <Button
                    type="submit"
                    className="sm:min-w-44"
                    disabled={loading || !signatureName.trim() || !agreedToTerms || !agreedToEsign}
                  >
                    {loading ? 'Saving agreement...' : 'Sign and Continue'}
                  </Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
