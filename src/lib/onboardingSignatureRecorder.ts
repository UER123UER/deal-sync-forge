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

function toErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return String(error);
}

function buildClientSideRows(userId: string, signatures: OnboardingSignatureSubmission[]) {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;
  const language = typeof navigator !== 'undefined' ? navigator.language : null;
  const originUrl = typeof window !== 'undefined' ? window.location.href : null;

  return signatures.map((signature) => ({
    user_id: userId,
    document_key: signature.documentKey,
    document_title: signature.documentTitle,
    document_version: signature.documentVersion,
    document_body: signature.documentBody,
    signer_name: signature.signedName,
    signer_email: signature.signerEmail ?? null,
    signature_type: signature.signatureType ?? 'typed_name',
    signature_value: signature.signatureValue ?? signature.signedName,
    consent_text: signature.consentText,
    agreed_to_terms: signature.agreedToTerms,
    agreed_to_esign: signature.agreedToEsign,
    ip_address: null,
    user_agent: userAgent,
    origin_url: originUrl,
    request_headers: {
      'user-agent': userAgent,
      language,
      fallback: 'client-direct-insert',
    },
    evidence: {
      ...(signature.evidence ?? {}),
      signature_capture_mode: 'client-direct-insert',
    },
  }));
}

export async function recordOnboardingSignatures(signatures: OnboardingSignatureSubmission[]) {
  try {
    const { data, error } = await supabase.functions.invoke('record-onboarding-signatures', {
      body: { signatures },
    });

    if (!error) return data;

    console.warn('record-onboarding-signatures edge function unavailable; falling back to direct insert.', error);
  } catch (error) {
    console.warn('record-onboarding-signatures edge function failed before fallback.', error);
  }

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        records: [],
        fallback: 'metadata-only',
        error: toErrorMessage(authError ?? 'No authenticated user was available for the signature fallback.'),
      };
    }

    const rows = buildClientSideRows(user.id, signatures);
    const { data: fallbackData, error: fallbackError } = await (supabase as any)
      .from('onboarding_signature_events')
      .insert(rows)
      .select('id, document_key, document_version, document_hash, signed_at');

    if (fallbackError) {
      console.warn('Unable to save onboarding signatures with direct insert; continuing with auth metadata only.', fallbackError);
      return {
        success: false,
        records: [],
        fallback: 'metadata-only',
        error: toErrorMessage(fallbackError),
      };
    }

    return {
      success: true,
      records: fallbackData ?? [],
      fallback: 'direct-db-insert',
    };
  } catch (error) {
    console.warn('Unable to save onboarding signatures; continuing with auth metadata only.', error);
    return {
      success: false,
      records: [],
      fallback: 'metadata-only',
      error: toErrorMessage(error),
    };
  }
}
