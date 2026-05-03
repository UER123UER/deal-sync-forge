import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, FileSignature, ShieldCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { UERLogo } from '@/components/UERLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { getFallbackOnboardingStatus, useOnboardingStatus } from '@/hooks/useOnboardingStatus';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  AGREEMENT_DOCUMENT_KEYS,
  AGREEMENT_ESIGN_CONSENT_TEXT,
  buildDocumentBody,
  getAgreementDocuments,
  type OnboardingLegalDocument,
} from '@/lib/onboardingLegalDocuments';
import { recordOnboardingSignatures } from '@/lib/onboardingSignatureRecorder';

function AgreementDocumentCard({ document }: { document: OnboardingLegalDocument }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-background">
      <div className="border-b px-5 py-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {document.title}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Document version: {document.version}</p>
      </div>
      <ScrollArea className="h-80">
        <div className="space-y-6 px-5 py-5">
          {document.preamble.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-foreground/90">
              {paragraph}
            </p>
          ))}

          {document.sections.map((section) => (
            <section key={section.title} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-foreground">
                {section.title}
              </h3>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-7 text-foreground/90">
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="space-y-2 pl-5 text-sm leading-7 text-foreground/90">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="list-disc">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <div className="rounded-xl border bg-muted/20 px-4 py-4">
            <div className="text-sm font-semibold text-foreground">Signature acknowledgment</div>
            <p className="mt-2 text-sm leading-7 text-foreground/90">{document.acknowledgment}</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function OnboardingAgreement() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const { data: onboardingStatus } = useOnboardingStatus({ user, profile, loading: authLoading });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const agreementDocuments = useMemo(() => getAgreementDocuments(), []);
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
    const trimmedSignatureName = signatureName.trim();

    try {
      await recordOnboardingSignatures(
        agreementDocuments.map((document) => ({
          documentKey: document.key,
          documentTitle: document.title,
          documentVersion: document.version,
          documentBody: buildDocumentBody(document),
          signedName: trimmedSignatureName,
          signerEmail: user.email ?? null,
          signatureType: 'typed_name',
          signatureValue: trimmedSignatureName,
          consentText: AGREEMENT_ESIGN_CONSENT_TEXT,
          agreedToTerms: true,
          agreedToEsign: true,
          evidence: {
            onboarding_step: 'agreement',
            license_number: currentStatus.licenseNumber ?? profile?.license_number ?? null,
            required_documents: AGREEMENT_DOCUMENT_KEYS,
          },
        }))
      );
    } catch (error) {
      setLoading(false);
      toast({
        title: 'Could not store signed agreement',
        description: error instanceof Error ? error.message : 'The legal signature record could not be saved.',
        variant: 'destructive',
      });
      return;
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        brokerage_agreement_accepted: true,
        brokerage_agreement_signed_at: signedAt,
        brokerage_agreement_signed_name: trimmedSignatureName,
      },
    });

    if (metadataError) {
      setLoading(false);
      toast({ title: 'Could not finish agreement setup', description: metadataError.message, variant: 'destructive' });
      return;
    }

    const { error: profileError } = await (supabase.from('profiles') as any)
      .update({
        brokerage_name: 'United Estates Realty',
        license_number: currentStatus.licenseNumber ?? profile?.license_number ?? null,
      })
      .eq('id', user.id);

    if (profileError) {
      setLoading(false);
      toast({ title: 'Could not finish agreement setup', description: profileError.message, variant: 'destructive' });
      return;
    }

    queryClient.setQueriesData({ queryKey: ['onboarding_status'] }, (existing) => ({
      ...((existing && typeof existing === 'object') ? (existing as Record<string, unknown>) : {}),
      ...currentStatus,
      agreementSigned: true,
      agreementSignedAt: signedAt,
      agreementSignedName: trimmedSignatureName,
      licenseNumber: currentStatus.licenseNumber ?? profile?.license_number ?? null,
    }));

    await refreshProfile?.();
    void queryClient.invalidateQueries({ queryKey: ['onboarding_status'] });
    toast({ title: 'Agreement signed', description: 'Next up: your ACH billing authorization.' });
    navigate('/onboarding/billing', { replace: true });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <Card className="overflow-hidden border-border/80 shadow-sm">
          <CardContent className="p-0">
            <div className="border-b bg-background px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-3xl">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Step 1 of 3
                  </div>
                  <h1 className="mt-2 text-3xl font-semibold text-foreground">
                    Independent Contractor Agreement and Policy Acknowledgment
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Review the brokerage agreement and policy acknowledgment below. Your typed legal name will be stored
                    as an electronic signature together with the document version, timestamp, IP address, and browser record.
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
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="space-y-1 text-sm leading-6 text-amber-900">
                  <p className="font-medium">Read before signing.</p>
                  <p>
                    These records replace the old draft language. If you want paper copies or outside legal advice before
                    signing, stop here and request that review before continuing.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {agreementDocuments.map((document) => (
                  <AgreementDocumentCard key={document.key} document={document} />
                ))}
              </div>

              <form onSubmit={handleContinue} className="space-y-5 rounded-2xl border bg-muted/15 p-5 sm:p-6">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <FileSignature className="h-4 w-4 text-primary" />
                  Legal signature
                </div>

                <div className="rounded-xl border bg-background px-4 py-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Signature evidence that will be retained
                  </div>
                  <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-foreground/90">
                    <li className="list-disc">Signed document text and document version.</li>
                    <li className="list-disc">Your typed legal name and signature method.</li>
                    <li className="list-disc">Timestamp, IP address, browser user agent, and origin URL.</li>
                  </ul>
                </div>

                <div className="grid gap-5 sm:grid-cols-[1.35fr_0.65fr]">
                  <div className="space-y-2">
                    <Label htmlFor="signature-name">Typed Legal Name</Label>
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

                {currentStatus.licenseNumber ? (
                  <div className="rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground">
                    Florida license number on file: <span className="font-medium text-foreground">{currentStatus.licenseNumber}</span>
                  </div>
                ) : null}

                <label className="flex items-start gap-3 rounded-xl border bg-background px-4 py-3">
                  <Checkbox checked={agreedToTerms} onCheckedChange={(checked) => setAgreedToTerms(checked === true)} />
                  <span className="text-sm leading-6 text-foreground/90">
                    I acknowledge that I reviewed the Independent Contractor Agreement and the Policy Acknowledgment,
                    and I voluntarily agree to be legally bound by both records as a condition of affiliation with United Estates Realty.
                  </span>
                </label>

                <label className="flex items-start gap-3 rounded-xl border bg-background px-4 py-3">
                  <Checkbox checked={agreedToEsign} onCheckedChange={(checked) => setAgreedToEsign(checked === true)} />
                  <span className="text-sm leading-6 text-foreground/90">{AGREEMENT_ESIGN_CONSENT_TEXT}</span>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    After signing, you will continue to ACH billing authorization.
                  </div>
                  <Button
                    type="submit"
                    className="sm:min-w-44"
                    disabled={loading || !signatureName.trim() || !agreedToTerms || !agreedToEsign}
                  >
                    {loading ? 'Recording signature...' : 'Sign and Continue'}
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
