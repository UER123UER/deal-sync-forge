import { supabase } from '@/integrations/supabase/client';
import type { OnboardingDocumentKey } from '@/lib/onboardingLegalDocuments';

export type OnboardingSignatureSubmission = {
  documentKey: OnboardingDocumentKey;
  documentTitle: string;
  documentVersion: string;
  documentBody: string;
  signedName: string;
  signerEmail?: string | null;
  signatureType?: string;
  signatureValue?: string;
  consentText: string;
  agreedToTerms: boolean;
  agreedToEsign: boolean;
  evidence?: Record<string, unknown>;
};

export async function recordOnboardingSignatures(signatures: OnboardingSignatureSubmission[]) {
  const { data, error } = await supabase.functions.invoke('record-onboarding-signatures', {
    body: { signatures },
  });

  if (error) throw error;
  return data;
}
