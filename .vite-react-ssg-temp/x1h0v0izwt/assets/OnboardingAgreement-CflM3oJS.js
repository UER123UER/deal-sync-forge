import { jsxDEV } from "react/jsx-dev-runtime";
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, FileSignature, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { s as supabase, a as useAuth, b as useOnboardingStatus, u as useToast, g as getAgreementDocuments, d as getFallbackOnboardingStatus, U as UERLogo, L as Label, I as Input, A as AGREEMENT_ESIGN_CONSENT_TEXT, B as Button, e as buildDocumentBody, f as AGREEMENT_DOCUMENT_KEYS } from "../main.mjs";
import { C as Card, c as CardContent } from "./card-DhvFoEG1.js";
import { C as Checkbox } from "./checkbox-B7kHRerZ.js";
import { S as ScrollArea } from "./scroll-area-aYSY-tkZ.js";
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
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
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
  return /* @__PURE__ */ jsxDEV("div", { className: "overflow-hidden rounded-2xl border bg-background", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "border-b px-5 py-4", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: document.title }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 30,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-xs text-muted-foreground", children: [
        "Document version: ",
        document.version
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 33,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
      lineNumber: 29,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(ScrollArea, { className: "h-80", children: /* @__PURE__ */ jsxDEV("div", { className: "space-y-6 px-5 py-5", children: [
      document.preamble.map((paragraph) => /* @__PURE__ */ jsxDEV("p", { className: "text-sm leading-7 text-foreground/90", children: paragraph }, paragraph, false, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 38,
        columnNumber: 13
      }, this)),
      document.sections.map((section) => {
        var _a, _b;
        return /* @__PURE__ */ jsxDEV("section", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold uppercase tracking-[0.12em] text-foreground", children: section.title }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 45,
            columnNumber: 15
          }, this),
          (_a = section.paragraphs) == null ? void 0 : _a.map((paragraph) => /* @__PURE__ */ jsxDEV("p", { className: "text-sm leading-7 text-foreground/90", children: paragraph }, paragraph, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 49,
            columnNumber: 17
          }, this)),
          ((_b = section.bullets) == null ? void 0 : _b.length) ? /* @__PURE__ */ jsxDEV("ul", { className: "space-y-2 pl-5 text-sm leading-7 text-foreground/90", children: section.bullets.map((bullet) => /* @__PURE__ */ jsxDEV("li", { className: "list-disc", children: bullet }, bullet, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 56,
            columnNumber: 21
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 54,
            columnNumber: 17
          }, this) : null
        ] }, section.title, true, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 44,
          columnNumber: 13
        }, this);
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border bg-muted/20 px-4 py-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "text-sm font-semibold text-foreground", children: "Signature acknowledgment" }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 66,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-sm leading-7 text-foreground/90", children: document.acknowledgment }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 67,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 65,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
      lineNumber: 36,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
      lineNumber: 35,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
    lineNumber: 28,
    columnNumber: 5
  }, this);
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
    return /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "h-8 w-8 animate-spin rounded-full border-b-2 border-primary" }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
      lineNumber: 108,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
      lineNumber: 107,
      columnNumber: 7
    }, this);
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
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-muted/30 px-4 py-8 sm:px-6", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-5xl", children: /* @__PURE__ */ jsxDEV(Card, { className: "overflow-hidden border-border/80 shadow-sm", children: /* @__PURE__ */ jsxDEV(CardContent, { className: "p-0", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "border-b bg-background px-6 py-6 sm:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Step 1 of 3" }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 202,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "mt-2 text-3xl font-semibold text-foreground", children: "Independent Contractor Agreement and Policy Acknowledgment" }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 205,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-sm leading-6 text-muted-foreground", children: "Review the brokerage agreement and policy acknowledgment below. Your typed legal name will be stored as an electronic signature together with the document version, timestamp, IP address, and browser record." }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 208,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 201,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex justify-start sm:justify-end", children: /* @__PURE__ */ jsxDEV("div", { className: "rounded-2xl border bg-white px-4 py-3 shadow-sm", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 170 }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 215,
        columnNumber: 21
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 214,
        columnNumber: 19
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 213,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
      lineNumber: 200,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
      lineNumber: 199,
      columnNumber: 13
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "space-y-8 px-6 py-8 sm:px-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4", children: [
        /* @__PURE__ */ jsxDEV(AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 223,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1 text-sm leading-6 text-amber-900", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "font-medium", children: "Read before signing." }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 225,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("p", { children: "These records replace the old draft language. If you want paper copies or outside legal advice before signing, stop here and request that review before continuing." }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 226,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 224,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 222,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-6 lg:grid-cols-2", children: agreementDocuments.map((document) => /* @__PURE__ */ jsxDEV(AgreementDocumentCard, { document }, document.key, false, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 235,
        columnNumber: 19
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 233,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV("form", { onSubmit: handleContinue, className: "space-y-5 rounded-2xl border bg-muted/15 p-5 sm:p-6", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 text-sm font-medium text-foreground", children: [
          /* @__PURE__ */ jsxDEV(FileSignature, { className: "h-4 w-4 text-primary" }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 241,
            columnNumber: 19
          }, this),
          "Legal signature"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 240,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border bg-background px-4 py-4", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 text-sm font-medium text-foreground", children: [
            /* @__PURE__ */ jsxDEV(ShieldCheck, { className: "h-4 w-4 text-emerald-500" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
              lineNumber: 247,
              columnNumber: 21
            }, this),
            "Signature evidence that will be retained"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 246,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-3 space-y-2 pl-5 text-sm leading-6 text-foreground/90", children: [
            /* @__PURE__ */ jsxDEV("li", { className: "list-disc", children: "Signed document text and document version." }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
              lineNumber: 251,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("li", { className: "list-disc", children: "Your typed legal name and signature method." }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
              lineNumber: 252,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("li", { className: "list-disc", children: "Timestamp, IP address, browser user agent, and origin URL." }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
              lineNumber: 253,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 250,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 245,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid gap-5 sm:grid-cols-[1.35fr_0.65fr]", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDEV(Label, { htmlFor: "signature-name", children: "Typed Legal Name" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
              lineNumber: 259,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                id: "signature-name",
                value: signatureName,
                onChange: (event) => setSignatureName(event.target.value),
                placeholder: "Type your full legal name",
                className: "text-lg italic",
                required: true
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
                lineNumber: 260,
                columnNumber: 21
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 258,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDEV(Label, { children: "Date" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
              lineNumber: 270,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex h-10 items-center rounded-md border bg-background px-3 text-sm text-foreground", children: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            }) }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
              lineNumber: 271,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 269,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 257,
          columnNumber: 17
        }, this),
        currentStatus.licenseNumber ? /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border bg-background px-4 py-3 text-sm text-muted-foreground", children: [
          "Florida license number on file: ",
          /* @__PURE__ */ jsxDEV("span", { className: "font-medium text-foreground", children: currentStatus.licenseNumber }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 283,
            columnNumber: 53
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 282,
          columnNumber: 19
        }, this) : null,
        /* @__PURE__ */ jsxDEV("label", { className: "flex items-start gap-3 rounded-xl border bg-background px-4 py-3", children: [
          /* @__PURE__ */ jsxDEV(Checkbox, { checked: agreedToTerms, onCheckedChange: (checked) => setAgreedToTerms(checked === true) }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 288,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-sm leading-6 text-foreground/90", children: "I acknowledge that I reviewed the Independent Contractor Agreement and the Policy Acknowledgment, and I voluntarily agree to be legally bound by both records as a condition of affiliation with United Estates Realty." }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 289,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 287,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("label", { className: "flex items-start gap-3 rounded-xl border bg-background px-4 py-3", children: [
          /* @__PURE__ */ jsxDEV(Checkbox, { checked: agreedToEsign, onCheckedChange: (checked) => setAgreedToEsign(checked === true) }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 296,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-sm leading-6 text-foreground/90", children: AGREEMENT_ESIGN_CONSENT_TEXT }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 297,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 295,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "h-3.5 w-3.5 text-emerald-500" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
              lineNumber: 302,
              columnNumber: 21
            }, this),
            "After signing, you will continue to ACH billing authorization."
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
            lineNumber: 301,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              type: "submit",
              className: "sm:min-w-44",
              disabled: loading || !signatureName.trim() || !agreedToTerms || !agreedToEsign,
              children: loading ? "Recording signature..." : "Sign and Continue"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
              lineNumber: 305,
              columnNumber: 19
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
          lineNumber: 300,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
        lineNumber: 239,
        columnNumber: 15
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
      lineNumber: 221,
      columnNumber: 13
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
    lineNumber: 198,
    columnNumber: 11
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
    lineNumber: 197,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
    lineNumber: 196,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/pages/OnboardingAgreement.tsx",
    lineNumber: 195,
    columnNumber: 5
  }, this);
}
export {
  OnboardingAgreement as default
};
