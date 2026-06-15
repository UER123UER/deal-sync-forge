import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, FileSignature, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { s as supabase, a as useAuth, b as useOnboardingStatus, u as useToast, g as getAgreementDocuments, d as getFallbackOnboardingStatus, U as UERLogo, L as Label, I as Input, A as AGREEMENT_ESIGN_CONSENT_TEXT, B as Button, e as buildDocumentBody, f as AGREEMENT_DOCUMENT_KEYS } from "../main.mjs";
import { C as Card, d as CardContent } from "./card-D3uDNDlq.js";
import { C as Checkbox } from "./checkbox-D50hG86N.js";
import { S as ScrollArea } from "./scroll-area-krGJLbGz.js";
import "vite-react-ssg";
import "@supabase/supabase-js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "next-themes";
import "sonner";
import "@radix-ui/react-toast";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
import "@radix-ui/react-label";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-scroll-area";
function toErrorMessage(error) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = error.message;
    if (typeof message === "string") return message;
  }
  return String(error);
}
function buildClientSideRows(userId, signatures) {
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;
  const language = typeof navigator !== "undefined" ? navigator.language : null;
  const originUrl = typeof window !== "undefined" ? window.location.href : null;
  return signatures.map((signature) => ({
    user_id: userId,
    document_key: signature.documentKey,
    document_title: signature.documentTitle,
    document_version: signature.documentVersion,
    document_body: signature.documentBody,
    signer_name: signature.signedName,
    signer_email: signature.signerEmail ?? null,
    signature_type: signature.signatureType ?? "typed_name",
    signature_value: signature.signatureValue ?? signature.signedName,
    consent_text: signature.consentText,
    agreed_to_terms: signature.agreedToTerms,
    agreed_to_esign: signature.agreedToEsign,
    ip_address: null,
    user_agent: userAgent,
    origin_url: originUrl,
    request_headers: {
      "user-agent": userAgent,
      language,
      fallback: "client-direct-insert"
    },
    evidence: {
      ...signature.evidence ?? {},
      signature_capture_mode: "client-direct-insert"
    }
  }));
}
async function recordOnboardingSignatures(signatures) {
  try {
    const { data, error } = await supabase.functions.invoke("record-onboarding-signatures", {
      body: { signatures }
    });
    if (!error) return data;
    console.warn("record-onboarding-signatures edge function unavailable; falling back to direct insert.", error);
  } catch (error) {
    console.warn("record-onboarding-signatures edge function failed before fallback.", error);
  }
  try {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        records: [],
        fallback: "metadata-only",
        error: toErrorMessage(authError ?? "No authenticated user was available for the signature fallback.")
      };
    }
    const rows = buildClientSideRows(user.id, signatures);
    const { data: fallbackData, error: fallbackError } = await supabase.from("onboarding_signature_events").insert(rows).select("id, document_key, document_version, document_hash, signed_at");
    if (fallbackError) {
      console.warn("Unable to save onboarding signatures with direct insert; continuing with auth metadata only.", fallbackError);
      return {
        success: false,
        records: [],
        fallback: "metadata-only",
        error: toErrorMessage(fallbackError)
      };
    }
    return {
      success: true,
      records: fallbackData ?? [],
      fallback: "direct-db-insert"
    };
  } catch (error) {
    console.warn("Unable to save onboarding signatures; continuing with auth metadata only.", error);
    return {
      success: false,
      records: [],
      fallback: "metadata-only",
      error: toErrorMessage(error)
    };
  }
}
function AgreementDocumentCard({ document }) {
  return /* @__PURE__ */ jsxs("div", { className: "overflow-hidden rounded-2xl border bg-background", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b px-5 py-4", children: [
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: document.title }),
      /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
        "Document version: ",
        document.version
      ] })
    ] }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "h-80", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 px-5 py-5", children: [
      document.preamble.map((paragraph) => /* @__PURE__ */ jsx("p", { className: "text-sm leading-7 text-foreground/90", children: paragraph }, paragraph)),
      document.sections.map((section) => {
        var _a, _b;
        return /* @__PURE__ */ jsxs("section", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold uppercase tracking-[0.12em] text-foreground", children: section.title }),
          (_a = section.paragraphs) == null ? void 0 : _a.map((paragraph) => /* @__PURE__ */ jsx("p", { className: "text-sm leading-7 text-foreground/90", children: paragraph }, paragraph)),
          ((_b = section.bullets) == null ? void 0 : _b.length) ? /* @__PURE__ */ jsx("ul", { className: "space-y-2 pl-5 text-sm leading-7 text-foreground/90", children: section.bullets.map((bullet) => /* @__PURE__ */ jsx("li", { className: "list-disc", children: bullet }, bullet)) }) : null
        ] }, section.title);
      }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-muted/20 px-4 py-4", children: [
        /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-foreground", children: "Signature acknowledgment" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-7 text-foreground/90", children: document.acknowledgment })
      ] })
    ] }) })
  ] });
}
function OnboardingAgreement() {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const { data: onboardingStatus } = useOnboardingStatus({ user, profile, loading: authLoading });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const agreementDocuments = useMemo(() => getAgreementDocuments(), []);
  const defaultSignatureName = useMemo(
    () => [profile == null ? void 0 : profile.first_name, profile == null ? void 0 : profile.last_name].filter(Boolean).join(" ").trim(),
    [profile == null ? void 0 : profile.first_name, profile == null ? void 0 : profile.last_name]
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
  const currentStatus = onboardingStatus ?? getFallbackOnboardingStatus({
    user,
    profile
  });
  if (authLoading || !user) {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-b-2 border-primary" }) });
  }
  const handleContinue = async (event) => {
    event.preventDefault();
    if (!signatureName.trim() || !agreedToTerms || !agreedToEsign) return;
    setLoading(true);
    const signedAt = (/* @__PURE__ */ new Date()).toISOString();
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
          signatureType: "typed_name",
          signatureValue: trimmedSignatureName,
          consentText: AGREEMENT_ESIGN_CONSENT_TEXT,
          agreedToTerms: true,
          agreedToEsign: true,
          evidence: {
            onboarding_step: "agreement",
            license_number: currentStatus.licenseNumber ?? (profile == null ? void 0 : profile.license_number) ?? null,
            required_documents: AGREEMENT_DOCUMENT_KEYS
          }
        }))
      );
    } catch (error) {
      console.warn("Onboarding signature audit record could not be saved; continuing with auth metadata.", error);
    }
    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        brokerage_agreement_accepted: true,
        brokerage_agreement_signed_at: signedAt,
        brokerage_agreement_signed_name: trimmedSignatureName,
        brokerage_agreement_document_versions: agreementDocuments.reduce((versions, document) => {
          versions[document.key] = document.version;
          return versions;
        }, {})
      }
    });
    if (metadataError) {
      setLoading(false);
      toast({ title: "Could not finish agreement setup", description: metadataError.message, variant: "destructive" });
      return;
    }
    const { error: profileError } = await supabase.from("profiles").update({
      brokerage_name: "United Estates Realty",
      license_number: currentStatus.licenseNumber ?? (profile == null ? void 0 : profile.license_number) ?? null
    }).eq("id", user.id);
    if (profileError) {
      setLoading(false);
      toast({ title: "Could not finish agreement setup", description: profileError.message, variant: "destructive" });
      return;
    }
    queryClient.setQueriesData({ queryKey: ["onboarding_status"] }, (existing) => ({
      ...existing && typeof existing === "object" ? existing : {},
      ...currentStatus,
      agreementSigned: true,
      agreementSignedAt: signedAt,
      agreementSignedName: trimmedSignatureName,
      licenseNumber: currentStatus.licenseNumber ?? (profile == null ? void 0 : profile.license_number) ?? null
    }));
    await (refreshProfile == null ? void 0 : refreshProfile());
    void queryClient.invalidateQueries({ queryKey: ["onboarding_status"] });
    toast({ title: "Agreement signed", description: "Next up: your ACH billing authorization." });
    navigate("/onboarding/billing", { replace: true });
    setLoading(false);
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-muted/30 px-4 py-8 sm:px-6", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-5xl", children: /* @__PURE__ */ jsx(Card, { className: "overflow-hidden border-border/80 shadow-sm", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b bg-background px-6 py-6 sm:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Step 1 of 3" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-2 text-3xl font-semibold text-foreground", children: "Independent Contractor Agreement and Policy Acknowledgment" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-muted-foreground", children: "Review the brokerage agreement and policy acknowledgment below. Your typed legal name will be stored as an electronic signature together with the document version, timestamp, IP address, and browser record." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-start sm:justify-end", children: /* @__PURE__ */ jsx("div", { className: "rounded-2xl border bg-white px-4 py-3 shadow-sm", children: /* @__PURE__ */ jsx(UERLogo, { width: 170 }) }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-8 px-6 py-8 sm:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4", children: [
        /* @__PURE__ */ jsx(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1 text-sm leading-6 text-amber-900", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: "Read before signing." }),
          /* @__PURE__ */ jsx("p", { children: "These records replace the old draft language. If you want paper copies or outside legal advice before signing, stop here and request that review before continuing." })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid gap-6 lg:grid-cols-2", children: agreementDocuments.map((document) => /* @__PURE__ */ jsx(AgreementDocumentCard, { document }, document.key)) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleContinue, className: "space-y-5 rounded-2xl border bg-muted/15 p-5 sm:p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-foreground", children: [
          /* @__PURE__ */ jsx(FileSignature, { className: "h-4 w-4 text-primary" }),
          "Legal signature"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-background px-4 py-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-foreground", children: [
            /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-emerald-500" }),
            "Signature evidence that will be retained"
          ] }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-3 space-y-2 pl-5 text-sm leading-6 text-foreground/90", children: [
            /* @__PURE__ */ jsx("li", { className: "list-disc", children: "Signed document text and document version." }),
            /* @__PURE__ */ jsx("li", { className: "list-disc", children: "Your typed legal name and signature method." }),
            /* @__PURE__ */ jsx("li", { className: "list-disc", children: "Timestamp, IP address, browser user agent, and origin URL." })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid gap-5 sm:grid-cols-[1.35fr_0.65fr]", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "signature-name", children: "Typed Legal Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "signature-name",
                value: signatureName,
                onChange: (event) => setSignatureName(event.target.value),
                placeholder: "Type your full legal name",
                className: "text-lg italic",
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { children: "Date" }),
            /* @__PURE__ */ jsx("div", { className: "flex h-10 items-center rounded-md border bg-background px-3 text-sm text-foreground", children: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            }) })
          ] })
        ] }),
        currentStatus.licenseNumber ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground", children: [
          "Florida license number on file: ",
          /* @__PURE__ */ jsx("span", { className: "font-medium text-foreground", children: currentStatus.licenseNumber })
        ] }) : null,
        /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 rounded-xl border bg-background px-4 py-3", children: [
          /* @__PURE__ */ jsx(Checkbox, { checked: agreedToTerms, onCheckedChange: (checked) => setAgreedToTerms(checked === true) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm leading-6 text-foreground/90", children: "I acknowledge that I reviewed the Independent Contractor Agreement and the Policy Acknowledgment, and I voluntarily agree to be legally bound by both records as a condition of affiliation with United Estates Realty." })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 rounded-xl border bg-background px-4 py-3", children: [
          /* @__PURE__ */ jsx(Checkbox, { checked: agreedToEsign, onCheckedChange: (checked) => setAgreedToEsign(checked === true) }),
          /* @__PURE__ */ jsx("span", { className: "text-sm leading-6 text-foreground/90", children: AGREEMENT_ESIGN_CONSENT_TEXT })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-500" }),
            "After signing, you will continue to ACH billing authorization."
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              className: "sm:min-w-44",
              disabled: loading || !signatureName.trim() || !agreedToTerms || !agreedToEsign,
              children: loading ? "Recording signature..." : "Sign and Continue"
            }
          )
        ] })
      ] })
    ] })
  ] }) }) }) });
}
export {
  OnboardingAgreement as default
};
