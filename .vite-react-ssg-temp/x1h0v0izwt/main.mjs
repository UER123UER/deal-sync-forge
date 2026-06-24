import { Head, ViteReactSSG } from "vite-react-ssg";
import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import { useLocation, Navigate, useNavigate, Outlet, Link, useParams, useSearchParams } from "react-router-dom";
import * as React from "react";
import { useState, useCallback, useEffect, useRef, Component, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";
import { useQuery, useQueryClient, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { X, Menu, MoreHorizontal, Plus, Users, Home, DollarSign, Gift, Phone, Link2, Calendar, CheckSquare, Mail, ChevronDown, ArrowRight, Check, Facebook, Linkedin, Instagram, ArrowUpRight, Zap, BarChart3, Shield, Award, Clock, ArrowLeft, Star, Calculator, TrendingUp, User, CheckCircle2, Lock, EyeOff, Eye } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { useTheme } from "next-themes";
import { Toaster as Toaster$2 } from "sonner";
import * as ToastPrimitives from "@radix-ui/react-toast";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
const SUPABASE_URL = "https://dwhlgnlpkrychygodwdw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aGxnbmxwa3J5Y2h5Z29kd2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODYyODAsImV4cCI6MjA4OTQ2MjI4MH0.qwY5RNkTsHZqwslAJPMEcAKwpZqmpe5dWVIgj6_I5TI";
const browserStorage = typeof window !== "undefined" && typeof window.localStorage !== "undefined" ? window.localStorage : void 0;
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: browserStorage,
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined"
  }
});
function useAuth() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    setProfile(data);
  }, []);
  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (!isMounted) return;
      setSession(existingSession);
      setUser((existingSession == null ? void 0 : existingSession.user) ?? null);
      if (existingSession == null ? void 0 : existingSession.user) {
        fetchProfile(existingSession.user.id);
      }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser((newSession == null ? void 0 : newSession.user) ?? null);
        if (newSession == null ? void 0 : newSession.user) {
          fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);
  const signOut = async () => {
    await supabase.auth.signOut();
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key == null ? void 0 : key.startsWith("uer_")) keysToRemove.push(key);
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setUser(null);
    setSession(null);
    setProfile(null);
  };
  const refreshProfile = useCallback(() => {
    if (user) return fetchProfile(user.id);
  }, [user, fetchProfile]);
  return { user, session, profile, loading, signOut, refreshProfile };
}
const AGREEMENT_ESIGN_CONSENT_TEXT = "I consent to receive, review, and sign these onboarding records electronically. I understand my typed name is intended to serve as my electronic signature, that the signed records will be retained by United Estates Realty, and that I may print or save a copy before signing.";
const AGREEMENT_DOCUMENT_KEYS = [
  "independent_contractor_agreement",
  "policy_acknowledgment"
];
const DOCUMENT_VERSION = "2026-05-02-v1";
function getIndependentContractorAgreementDocument() {
  return {
    key: "independent_contractor_agreement",
    title: "Independent Contractor Agreement",
    version: DOCUMENT_VERSION,
    preamble: [
      'This Independent Contractor Agreement ("Agreement") is entered into as of the date signed below, by and between United Estates Realty, a Florida licensed real estate brokerage ("Broker"), and the undersigned licensed real estate sales associate or broker associate ("Associate").'
    ],
    sections: [
      {
        title: "1. Relationship of the Parties",
        paragraphs: [
          "Associate is engaged as an independent contractor and not as an employee, partner, or joint venturer of Broker. Broker shall exercise no control over the manner or method by which Associate performs services, except as required by Florida real estate law.",
          "Associate shall have no authority to bind Broker in any contract or obligation and is solely responsible for all federal, state, and local taxes arising from compensation received under this Agreement."
        ]
      },
      {
        title: "2. Florida License Requirement",
        paragraphs: [
          "Associate represents and warrants that they hold a current, active Florida real estate license in good standing with the Florida Department of Business and Professional Regulation (DBPR), are not subject to pending disciplinary action, and will notify Broker immediately in writing of any change in license status."
        ]
      },
      {
        title: "3. Compensation",
        bullets: [
          "Associate retains one hundred percent (100%) of all gross commissions earned on transactions closed by Associate, subject only to deductions required by law or court order.",
          "Associate shall pay Broker a flat monthly fee of $98.00 due on the 1st day of each calendar month via ACH bank draft from the designated bank account on file, unless the fee is waived by an approved promo code or written brokerage authorization.",
          "Failure to maintain valid ACH information on file, or failure to cure a failed ACH draft within ten (10) calendar days, constitutes a material breach of this Agreement.",
          "Associate may earn a $20.00 monthly referral bonus for each qualifying active associate personally referred to Broker while both parties remain active and in good standing.",
          "Commissions shall be disbursed to Associate within five (5) business days of Broker receiving and clearing commission funds from the closing agent or title company."
        ]
      },
      {
        title: "4. Errors & Omissions Insurance",
        paragraphs: [
          "Broker shall provide group Errors and Omissions (E&O) insurance coverage for Associate activities conducted under Broker's license, subject to the terms, conditions, exclusions, and limits of the policy in effect at the time of any claim.",
          "Coverage does not extend to intentional misconduct, fraud, criminal acts, activities outside the scope of Associate's Florida license, or independent business activities unrelated to real estate transactions under Broker."
        ]
      },
      {
        title: "5. Associate Responsibilities",
        bullets: [
          "Maintain an active Florida real estate license at all times.",
          "Comply with all Florida real estate laws, DBPR rules, MLS rules, and the NAR Code of Ethics if REALTOR member status applies.",
          "Conduct all real estate activities exclusively under Broker's license as required by Florida Statute Section 475.",
          "Pay all personal business expenses, including MLS dues, board dues, marketing, and technology costs.",
          "Comply with all federal and state consumer protection, telemarketing, privacy, anti-money laundering, and communications laws referenced in this Agreement."
        ]
      },
      {
        title: "6. Broker Responsibilities",
        bullets: [
          "Maintain an active Florida real estate broker's license.",
          "Provide Associate use of the United Estates Realty trade name and broker's license for lawful real estate transactions.",
          "Provide reasonable supervision as required by Florida law.",
          "Remit commissions under the timing stated above and maintain E&O coverage as described in this Agreement."
        ]
      },
      {
        title: "7. Expenses",
        paragraphs: [
          "Associate is solely responsible for all personal business expenses unless reimbursement is expressly stated in a separate written addendum signed by both parties."
        ]
      },
      {
        title: "8. Advertising & Marketing Compliance",
        paragraphs: [
          "All advertising, signage, digital content, and marketing materials must clearly display the United Estates Realty name and Florida broker license number as required by Florida law and DBPR Rule 61J2-10.025.",
          "Associate may not advertise under any other brokerage name and is individually responsible for compliance with CAN-SPAM, TCPA, and all applicable state advertising laws."
        ]
      },
      {
        title: "9. Legal Compliance - Consumer Protection & Communications Laws",
        bullets: [
          "National Do Not Call Registry / TCPA: Associate shall scrub solicitation lists against the National Do Not Call Registry and any applicable state list, maintain an internal do-not-call list, honor opt-out requests within thirty (30) days, and bear all compliance costs.",
          "Telephone Consumer Protection Act: Associate shall not use auto-dialers, artificial voice, or prerecorded calls or texts where prior express written consent is required, and remains solely liable for TCPA claims and statutory damages.",
          "CAN-SPAM Act: All commercial email must include accurate routing information, a non-deceptive subject line, a valid physical mailing address, a clear opt-out mechanism, and timely processing of opt-out requests.",
          "Florida Telemarketing Act: Associate shall comply with registration, timing, disclosure, and other telemarketing rules applicable in Florida.",
          "Fair Housing: Associate shall not discriminate against any protected class and must report any Fair Housing allegation or complaint to Broker immediately in writing.",
          "FDUTPA: Associate shall not engage in any unfair, deceptive, or unconscionable trade practice and remains individually responsible for claims arising from their conduct.",
          "Privacy and Gramm-Leach-Bliley: Associate shall not misuse, disclose, or sell nonpublic personal information except as required to complete the transaction for which it was provided.",
          "AML / FinCEN: Associate shall report suspicious transaction activity, potential fraud, or money laundering concerns to Broker immediately.",
          "Social Media and Digital Marketing: Associate shall comply with FTC Endorsement Guides, DBPR rules, and all platform-specific advertising requirements."
        ]
      },
      {
        title: "10. Indemnification",
        paragraphs: [
          "Associate agrees to indemnify, defend, and hold harmless United Estates Realty, its broker, officers, agents, and assigns from any claim, demand, loss, damage, liability, cost, or expense, including reasonable attorney's fees, arising out of Associate's violation of law, negligent or intentional acts or omissions, breach of this Agreement, or individual real estate activities.",
          "This indemnification obligation expressly includes TCPA, CAN-SPAM, Do Not Call, Fair Housing, FDUTPA, and similar consumer-protection claims, and survives termination of this Agreement."
        ]
      },
      {
        title: "11. Limitation of Broker Liability",
        paragraphs: [
          "Broker's liability to Associate shall not exceed the total monthly fees paid by Associate to Broker during the three (3) calendar months immediately preceding the event giving rise to the claim. Broker shall not be liable for indirect, consequential, incidental, special, or punitive damages, nor for regulatory fines or judgments arising from Associate's individual conduct."
        ]
      },
      {
        title: "12. Commission Handling - Florida Law",
        paragraphs: [
          "All commissions and compensation related to real estate transactions must flow through Broker's escrow or operating account as required by Florida Statute Section 475. Associate may not receive commission payments directly from buyers, sellers, landlords, tenants, closing agents, or title companies."
        ]
      },
      {
        title: "13. Confidentiality",
        paragraphs: [
          "Associate shall maintain the confidentiality of client information, Broker's proprietary systems, agent referral data, and non-public business information obtained during affiliation. This obligation survives termination indefinitely."
        ]
      },
      {
        title: "14. Termination",
        bullets: [
          "Either party may terminate this Agreement upon fourteen (14) days prior written notice.",
          "Upon termination, Associate's right to use Broker's name and license number immediately ceases.",
          "Commissions on transactions under binding contract before termination remain payable upon closing under the commission section of this Agreement.",
          "Referral bonuses cease immediately upon termination.",
          "Associate shall promptly transfer active listings and pending transactions to Broker or Broker's designee.",
          "Broker-provided E&O coverage ceases on the effective termination date.",
          "Associate's ACH authorization is revoked once all outstanding monthly fees are paid in full."
        ]
      },
      {
        title: "15. Governing Law & Dispute Resolution",
        paragraphs: [
          "This Agreement shall be governed by the laws of the State of Florida. Any dispute shall first be submitted to non-binding mediation in the county where Broker's principal office is located. If mediation is unsuccessful, disputes shall be resolved by binding arbitration under American Arbitration Association rules, and the prevailing party shall be entitled to reasonable attorney's fees and costs."
        ]
      },
      {
        title: "16. Entire Agreement & Severability",
        paragraphs: [
          "This Agreement, together with any signed addenda, constitutes the entire agreement of the parties and supersedes prior discussions or agreements. If any provision is found unenforceable, the remaining provisions continue in full force. Modifications must be in writing and signed by both parties."
        ]
      }
    ],
    acknowledgment: "By signing below, each party acknowledges they have read, understand, and voluntarily agree to the terms of this Agreement, including the indemnification and legal compliance obligations in Sections 9 and 10."
  };
}
function getPolicyAcknowledgmentDocument() {
  return {
    key: "policy_acknowledgment",
    title: "Policy Acknowledgment & Code of Conduct",
    version: DOCUMENT_VERSION,
    preamble: [
      'All associates affiliated with United Estates Realty ("Broker") must read and comply with the following policies as a condition of affiliation. Violation of any policy may result in immediate termination of the Independent Contractor Agreement and may be reported to the DBPR.'
    ],
    sections: [
      {
        title: "1. License Compliance",
        paragraphs: [
          "Associates must maintain an active Florida real estate license at all times. Any lapse, suspension, revocation, or voluntary inactivation requires immediate written notice to Broker and automatically suspends authority to conduct real estate activities under Broker's license."
        ]
      },
      {
        title: "2. Compliance with Florida & Federal Law",
        bullets: [
          "Florida Statute Chapter 475 and Florida Administrative Code Chapter 61J2.",
          "NAR Code of Ethics, if REALTOR member status applies.",
          "Federal and Florida Fair Housing laws.",
          "Telephone Consumer Protection Act (TCPA) and National Do Not Call rules.",
          "Florida Telemarketing Act and CAN-SPAM Act.",
          "Florida Deceptive and Unfair Trade Practices Act (FDUTPA).",
          "Gramm-Leach-Bliley privacy requirements.",
          "FTC Endorsement Guides for social media and testimonials.",
          "Applicable anti-money laundering / FinCEN obligations and all MLS rules."
        ]
      },
      {
        title: "3. Do Not Call & Telemarketing Compliance",
        paragraphs: [
          "Associates are individually responsible for telemarketing compliance, including scrubbing calling lists against the National DNC Registry, maintaining an internal DNC list, honoring opt-out requests within 30 days, respecting legal calling hours, providing accurate caller ID information, and avoiding robocalls or auto-dialed calls where prior express written consent is required."
        ]
      },
      {
        title: "4. Email & CAN-SPAM Compliance",
        paragraphs: [
          "Every commercial email sent by Associate must accurately identify the sender, use a non-deceptive subject line, include a valid physical mailing address, include a clear unsubscribe mechanism, and process opt-out requests within 10 business days. Associate shall not email any person who has opted out."
        ]
      },
      {
        title: "5. Monthly Fee & ACH Payment Policy",
        paragraphs: [
          "The $98.00 monthly fee is due on the 1st of each calendar month via ACH bank draft unless waived by an approved promo code or written brokerage authorization. ACH is the sole accepted payment method when a monthly fee is owed. Associate must maintain current, valid banking information on file whenever ACH billing applies. A failed ACH draft not cured within ten (10) calendar days constitutes a material breach, and no proration is provided for partial months."
        ]
      },
      {
        title: "6. E&O Insurance",
        paragraphs: [
          "Broker provides group E&O insurance for Associate activities conducted under Broker's license. Coverage does not extend to intentional misconduct, fraud, criminal acts, or activities outside the scope of Associate's Florida license. Associate shall cooperate with claim investigations and immediately notify Broker in writing of any potential claim or complaint."
        ]
      },
      {
        title: "7. Commission Handling - Florida Law",
        paragraphs: [
          "All commissions must flow through Broker's account as required by Florida law. Associate may not receive commission payments directly from any party. Violation is grounds for immediate termination and DBPR reporting."
        ]
      },
      {
        title: "8. Advertising & Marketing",
        paragraphs: [
          "All advertising must display the United Estates Realty name and Florida broker license number as required by DBPR Rule 61J2-10.025. Associates may not advertise under any other broker's license. Digital advertising and social media content must also comply with TCPA, CAN-SPAM, FTC Endorsement Guides, and Florida advertising rules."
        ]
      },
      {
        title: "9. Fair Housing",
        paragraphs: [
          "Associates shall not discriminate on the basis of race, color, national origin, religion, sex, familial status, disability, or any other protected characteristic, and must report any Fair Housing complaint or allegation to Broker immediately in writing."
        ]
      },
      {
        title: "10. Client Privacy & Data Security",
        paragraphs: [
          "Associates shall protect client personal and financial information, avoid storage of client data on unsecured devices or platforms, avoid unauthorized disclosures, and report any data breach involving client information to Broker immediately."
        ]
      },
      {
        title: "11. Anti-Money Laundering",
        paragraphs: [
          "Associates must comply with AML and FinCEN rules and must not knowingly participate in a transaction involving criminal proceeds. Suspicious activity, fraud, or structuring concerns must be reported to Broker immediately in writing."
        ]
      },
      {
        title: "12. Indemnification of Broker",
        paragraphs: [
          "Associate agrees to indemnify, defend, and hold harmless United Estates Realty and its broker from claims, fines, penalties, damages, or costs, including attorney's fees, arising from Associate's individual conduct, including TCPA, CAN-SPAM, DNC, Fair Housing, FDUTPA, advertising, privacy, or regulatory violations. This obligation survives termination."
        ]
      },
      {
        title: "13. Post-Termination Obligations",
        bullets: [
          "Cease use of Broker's name, license number, and branding immediately.",
          "Transfer active listings and pending transactions.",
          "Return Broker-provided materials.",
          "Disclose pending disputes or potential claims.",
          "Commissions on contracts executed before termination remain governed by the Independent Contractor Agreement."
        ]
      },
      {
        title: "14. Social Media & Professional Conduct",
        paragraphs: [
          "Associates shall not make false, misleading, defamatory, or disparaging statements about United Estates Realty, other associates, clients, or competitors. Professional social media profiles must disclose affiliation with United Estates Realty and comply with Broker branding guidelines and Florida advertising rules."
        ]
      }
    ],
    acknowledgment: "I certify that I have received, read, and fully understand all policies set forth above. I voluntarily agree to comply with these policies as a condition of my affiliation with United Estates Realty. I understand that violation of any policy may result in immediate termination of my Independent Contractor Agreement, without prejudice to any other remedy available to Broker, and may be reported to applicable regulatory authorities."
  };
}
function getAgreementDocuments() {
  return [getIndependentContractorAgreementDocument(), getPolicyAcknowledgmentDocument()];
}
function buildDocumentBody(document2) {
  const sectionBlocks = document2.sections.map((section) => {
    var _a, _b;
    const lines = [section.title];
    if ((_a = section.paragraphs) == null ? void 0 : _a.length) {
      lines.push(...section.paragraphs);
    }
    if ((_b = section.bullets) == null ? void 0 : _b.length) {
      lines.push(...section.bullets.map((bullet) => `- ${bullet}`));
    }
    return lines.join("\n");
  });
  return [
    `${document2.title}`,
    `Version: ${document2.version}`,
    "",
    ...document2.preamble,
    "",
    ...sectionBlocks,
    "",
    "Acknowledgment",
    document2.acknowledgment
  ].join("\n\n");
}
const FREE_BILLING_PROMO_CODE = "UNITED100";
function normalizePromoCode(code) {
  return code.trim().toUpperCase().replace(/\s+/g, "");
}
function isFreeBillingPromoCode(code) {
  return normalizePromoCode(code) === FREE_BILLING_PROMO_CODE;
}
const getFallbackOnboardingStatus = ({
  user,
  profile
}) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const agreementSigned = Boolean(
    ((_a = user == null ? void 0 : user.user_metadata) == null ? void 0 : _a.brokerage_agreement_accepted) && ((_b = user == null ? void 0 : user.user_metadata) == null ? void 0 : _b.brokerage_agreement_signed_at) && ((_c = user == null ? void 0 : user.user_metadata) == null ? void 0 : _c.brokerage_agreement_signed_name)
  );
  const billingPromoCode = typeof ((_d = user == null ? void 0 : user.user_metadata) == null ? void 0 : _d.billing_promo_code) === "string" ? normalizePromoCode(user.user_metadata.billing_promo_code) : null;
  const billingWaived = Boolean((_e = user == null ? void 0 : user.user_metadata) == null ? void 0 : _e.billing_waived) || (billingPromoCode ? isFreeBillingPromoCode(billingPromoCode) : false);
  const billingMonthlyFeeAmount = typeof ((_f = user == null ? void 0 : user.user_metadata) == null ? void 0 : _f.billing_monthly_fee_amount) === "number" ? user.user_metadata.billing_monthly_fee_amount : billingWaived ? 0 : 98;
  return {
    subscriptionStatus: (profile == null ? void 0 : profile.subscription_status) ?? "pending",
    agreementSigned,
    agreementSignedAt: ((_g = user == null ? void 0 : user.user_metadata) == null ? void 0 : _g.brokerage_agreement_signed_at) ?? null,
    agreementSignedName: ((_h = user == null ? void 0 : user.user_metadata) == null ? void 0 : _h.brokerage_agreement_signed_name) ?? null,
    licenseNumber: (profile == null ? void 0 : profile.license_number) ?? ((_i = user == null ? void 0 : user.user_metadata) == null ? void 0 : _i.license_number) ?? null,
    hasBillingAccount: billingWaived,
    billingWaived,
    billingPromoCode,
    billingMonthlyFeeAmount,
    hasDepositAccount: false,
    latestBillingAccount: null,
    latestDepositAccount: null
  };
};
const getNextOnboardingPath = (status) => {
  if (!status) return "/onboarding/agreement";
  if (!status.agreementSigned) return "/onboarding/agreement";
  if (status.subscriptionStatus !== "active" && !status.billingWaived) return "/onboarding/billing";
  if (!status.hasDepositAccount) return "/onboarding/deposit";
  return "/transactions";
};
function useOnboardingStatus({
  user,
  profile,
  loading
}) {
  var _a, _b, _c, _d, _e;
  return useQuery({
    queryKey: [
      "onboarding_status",
      user == null ? void 0 : user.id,
      profile == null ? void 0 : profile.subscription_status,
      profile == null ? void 0 : profile.license_number,
      (_a = user == null ? void 0 : user.user_metadata) == null ? void 0 : _a.brokerage_agreement_signed_at,
      (_b = user == null ? void 0 : user.user_metadata) == null ? void 0 : _b.brokerage_agreement_signed_name,
      (_c = user == null ? void 0 : user.user_metadata) == null ? void 0 : _c.billing_promo_code,
      (_d = user == null ? void 0 : user.user_metadata) == null ? void 0 : _d.billing_waived,
      (_e = user == null ? void 0 : user.user_metadata) == null ? void 0 : _e.billing_monthly_fee_amount
    ],
    enabled: !!user && !loading,
    queryFn: async () => {
      var _a2, _b2, _c2, _d2, _e2, _f, _g, _h, _i, _j;
      const fallbackStatus = getFallbackOnboardingStatus({ user, profile });
      const { data: authResult, error: authError } = await supabase.auth.getUser();
      const liveUser = authResult.user ?? user;
      const liveBillingPromoCode = typeof ((_a2 = liveUser.user_metadata) == null ? void 0 : _a2.billing_promo_code) === "string" ? normalizePromoCode(liveUser.user_metadata.billing_promo_code) : fallbackStatus.billingPromoCode;
      const liveBillingWaived = Boolean((_b2 = liveUser.user_metadata) == null ? void 0 : _b2.billing_waived) || (liveBillingPromoCode ? isFreeBillingPromoCode(liveBillingPromoCode) : false) || fallbackStatus.billingWaived;
      const liveBillingMonthlyFeeAmount = typeof ((_c2 = liveUser.user_metadata) == null ? void 0 : _c2.billing_monthly_fee_amount) === "number" ? liveUser.user_metadata.billing_monthly_fee_amount : liveBillingWaived ? 0 : fallbackStatus.billingMonthlyFeeAmount;
      const [profileResult, billingResult, depositResult, agreementSignaturesResult] = await Promise.all([
        supabase.from("profiles").select("subscription_status, license_number").eq("id", user.id).maybeSingle(),
        supabase.from("bank_accounts").select("id, account_holder_name, routing_number, account_number_last4, account_type").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("direct_deposits").select("id, agent_name, bank_name, routing_number, account_number_last4, account_type").eq("owner_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("onboarding_signature_events").select("document_key, signed_at, signer_name").eq("user_id", user.id).in("document_key", AGREEMENT_DOCUMENT_KEYS).order("signed_at", { ascending: false })
      ]);
      if (authError) {
        console.warn("Unable to refresh auth user during onboarding status lookup.", authError);
      }
      if (profileResult.error) {
        console.warn("Unable to load live profile during onboarding status lookup.", profileResult.error);
      }
      if (billingResult.error) {
        console.warn("Unable to load billing account during onboarding status lookup.", billingResult.error);
      }
      if (depositResult.error) {
        console.warn("Unable to load deposit account during onboarding status lookup.", depositResult.error);
      }
      if (agreementSignaturesResult.error) {
        console.warn("Unable to load onboarding agreement signatures.", agreementSignaturesResult.error);
      }
      const liveProfile = profileResult.data;
      const legacyAgreementSigned = Boolean(
        ((_d2 = liveUser.user_metadata) == null ? void 0 : _d2.brokerage_agreement_accepted) && ((_e2 = liveUser.user_metadata) == null ? void 0 : _e2.brokerage_agreement_signed_at) && ((_f = liveUser.user_metadata) == null ? void 0 : _f.brokerage_agreement_signed_name)
      );
      const latestSignaturesByKey = /* @__PURE__ */ new Map();
      for (const row of agreementSignaturesResult.data ?? []) {
        if (!latestSignaturesByKey.has(row.document_key)) {
          latestSignaturesByKey.set(row.document_key, row);
        }
      }
      const agreementBundleSigned = AGREEMENT_DOCUMENT_KEYS.every((key) => latestSignaturesByKey.has(key));
      const agreementSignatureRows = Array.from(latestSignaturesByKey.values());
      const latestAgreementSignature = agreementSignatureRows.map((row) => row.signed_at).sort((left, right) => new Date(left).getTime() - new Date(right).getTime()).at(-1);
      const agreementSigned = agreementBundleSigned || legacyAgreementSigned;
      return {
        subscriptionStatus: (liveProfile == null ? void 0 : liveProfile.subscription_status) ?? fallbackStatus.subscriptionStatus,
        agreementSigned,
        agreementSignedAt: latestAgreementSignature ?? ((_g = liveUser.user_metadata) == null ? void 0 : _g.brokerage_agreement_signed_at) ?? null,
        agreementSignedName: ((_h = agreementSignatureRows[0]) == null ? void 0 : _h.signer_name) ?? ((_i = liveUser.user_metadata) == null ? void 0 : _i.brokerage_agreement_signed_name) ?? null,
        licenseNumber: (liveProfile == null ? void 0 : liveProfile.license_number) ?? fallbackStatus.licenseNumber ?? ((_j = liveUser.user_metadata) == null ? void 0 : _j.license_number) ?? null,
        hasBillingAccount: !!billingResult.data || liveBillingWaived,
        billingWaived: liveBillingWaived,
        billingPromoCode: liveBillingPromoCode ?? null,
        billingMonthlyFeeAmount: liveBillingMonthlyFeeAmount,
        hasDepositAccount: !!depositResult.data,
        latestBillingAccount: billingResult.data ?? null,
        latestDepositAccount: depositResult.data ?? null
      };
    }
  });
}
const ONBOARDING_PATHS = /* @__PURE__ */ new Set([
  "/onboarding/agreement",
  "/onboarding/billing",
  "/onboarding/deposit",
  "/onboarding/payment"
]);
function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const isAgreementRoute = location.pathname === "/onboarding/agreement";
  const {
    data: onboardingStatus,
    error: onboardingError,
    isLoading: onboardingLoading
  } = useOnboardingStatus({ user, profile, loading });
  const isOnboardingRoute = ONBOARDING_PATHS.has(location.pathname);
  if (loading || !isOnboardingRoute && onboardingLoading) {
    return /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "h-8 w-8 animate-spin rounded-full border-b-2 border-primary" }, void 0, false, {
      fileName: "/dev-server/src/components/auth/ProtectedRoute.tsx",
      lineNumber: 27,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/auth/ProtectedRoute.tsx",
      lineNumber: 26,
      columnNumber: 7
    }, this);
  }
  if (!user) {
    return /* @__PURE__ */ jsxDEV(Navigate, { to: "/auth", state: { from: location }, replace: true }, void 0, false, {
      fileName: "/dev-server/src/components/auth/ProtectedRoute.tsx",
      lineNumber: 33,
      columnNumber: 12
    }, this);
  }
  const effectiveStatus = onboardingError ? getFallbackOnboardingStatus({ user, profile }) : onboardingStatus ?? getFallbackOnboardingStatus({ user, profile });
  const nextPath = getNextOnboardingPath(effectiveStatus);
  const subscriptionStatus = effectiveStatus.subscriptionStatus;
  const billingComplete = subscriptionStatus === "active" || effectiveStatus.billingWaived;
  if (isAgreementRoute && subscriptionStatus !== "active") {
    return /* @__PURE__ */ jsxDEV(Fragment, { children }, void 0, false, {
      fileName: "/dev-server/src/components/auth/ProtectedRoute.tsx",
      lineNumber: 44,
      columnNumber: 12
    }, this);
  }
  if (!billingComplete || !effectiveStatus.hasDepositAccount) {
    if (!isOnboardingRoute || location.pathname !== nextPath) {
      return /* @__PURE__ */ jsxDEV(Navigate, { to: nextPath, replace: true }, void 0, false, {
        fileName: "/dev-server/src/components/auth/ProtectedRoute.tsx",
        lineNumber: 49,
        columnNumber: 14
      }, this);
    }
  }
  if (billingComplete && effectiveStatus.hasDepositAccount && isOnboardingRoute) {
    return /* @__PURE__ */ jsxDEV(Navigate, { to: "/transactions", replace: true }, void 0, false, {
      fileName: "/dev-server/src/components/auth/ProtectedRoute.tsx",
      lineNumber: 54,
      columnNumber: 12
    }, this);
  }
  return /* @__PURE__ */ jsxDEV(Fragment, { children }, void 0, false, {
    fileName: "/dev-server/src/components/auth/ProtectedRoute.tsx",
    lineNumber: 57,
    columnNumber: 10
  }, this);
}
function UERLogo({ width = 200, className = "" }) {
  return /* @__PURE__ */ jsxDEV(
    "img",
    {
      src: "/logo.png",
      alt: "United Estates Realty",
      style: { width, height: "auto", objectFit: "contain", display: "block" },
      className
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/components/UERLogo.tsx",
      lineNumber: 9,
      columnNumber: 5
    },
    this
  );
}
const version$3 = 1;
const asset_id$3 = "a2aad42d-fe85-4c0b-bf8e-1276c5bfd772";
const project_id$3 = "c987c87c-e16f-4694-9045-0ccdf362905d";
const url$3 = "/__l5e/assets-v1/a2aad42d-fe85-4c0b-bf8e-1276c5bfd772/uer-logo-white.png";
const r2_key$3 = "a/v1/c987c87c-e16f-4694-9045-0ccdf362905d/a2aad42d-fe85-4c0b-bf8e-1276c5bfd772/uer-logo-white.png";
const original_filename$3 = "uer-logo-white.png";
const size$3 = 238878;
const content_type$3 = "image/png";
const created_at$3 = "2026-06-21T21:32:49Z";
const uerLogoWhite = {
  version: version$3,
  asset_id: asset_id$3,
  project_id: project_id$3,
  url: url$3,
  r2_key: r2_key$3,
  original_filename: original_filename$3,
  size: size$3,
  content_type: content_type$3,
  created_at: created_at$3
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const CONTACT_SOURCES = [
  "Referral",
  "Open House",
  "Website",
  "Cold Call",
  "Social Media",
  "Walk-in",
  "Past Client",
  "Direct Mail",
  "Zillow",
  "Realtor.com",
  "Other"
];
function getContactSource(contact) {
  const tag = (contact.tags || []).find((t) => t.startsWith("source:"));
  if (!tag) return null;
  return tag.replace("source:", "");
}
function setContactSource(tags, source) {
  const withoutSource = tags.filter((t) => !t.startsWith("source:"));
  return source ? [...withoutSource, `source:${source}`] : withoutSource;
}
function calcLeadScore(contact, dealCount) {
  let score = 0;
  if (contact.email) score += 15;
  if (contact.phone) score += 15;
  if (contact.company) score += 5;
  if (contact.current_address) score += 5;
  if (dealCount > 0) score += 20;
  if (dealCount > 1) score += 10;
  if (contact.last_touch) {
    try {
      const days = Math.floor((Date.now() - new Date(contact.last_touch).getTime()) / 864e5);
      if (days <= 7) score += 15;
      else if (days <= 30) score += 10;
      else if (days <= 90) score += 5;
    } catch {
    }
  }
  if (contact.next_touch) score += 10;
  if ((contact.tags || []).includes("VIP")) score += 5;
  return Math.min(score, 100);
}
function useContacts() {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });
}
function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact) => {
      const { data, error } = await supabase.from("contacts").insert(contact).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] })
  });
}
function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase.from("contacts").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] })
  });
}
function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contacts"] })
  });
}
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  SheetPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/sheet.tsx",
    lineNumber: 20,
    columnNumber: 3
  },
  void 0
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right: "inset-y-0 right-0 h-full w-3/4  border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm"
      }
    },
    defaultVariants: {
      side: "right"
    }
  }
);
const SheetContent = React.forwardRef(
  ({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxDEV(SheetPortal, { children: [
    /* @__PURE__ */ jsxDEV(SheetOverlay, {}, void 0, false, {
      fileName: "/dev-server/src/components/ui/sheet.tsx",
      lineNumber: 57,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV(SheetPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
      children,
      /* @__PURE__ */ jsxDEV(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none", children: [
        /* @__PURE__ */ jsxDEV(X, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/dev-server/src/components/ui/sheet.tsx",
          lineNumber: 61,
          columnNumber: 11
        }, void 0),
        /* @__PURE__ */ jsxDEV("span", { className: "sr-only", children: "Close" }, void 0, false, {
          fileName: "/dev-server/src/components/ui/sheet.tsx",
          lineNumber: 62,
          columnNumber: 11
        }, void 0)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/ui/sheet.tsx",
        lineNumber: 60,
        columnNumber: 9
      }, void 0)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/ui/sheet.tsx",
      lineNumber: 58,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/ui/sheet.tsx",
    lineNumber: 56,
    columnNumber: 5
  }, void 0)
);
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsxDEV("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/sheet.tsx",
  lineNumber: 71,
  columnNumber: 3
}, void 0);
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(SheetPrimitive.Title, { ref, className: cn("text-lg font-semibold text-foreground", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/sheet.tsx",
  lineNumber: 84,
  columnNumber: 3
}, void 0));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(SheetPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/sheet.tsx",
  lineNumber: 92,
  columnNumber: 3
}, void 0));
SheetDescription.displayName = SheetPrimitive.Description.displayName;
const navItems = [
  { icon: Plus, label: "Create", path: "/transactions/new" },
  { icon: Users, label: "People", path: "/people", hasSubmenu: true },
  { icon: Home, label: "Deals", path: "/transactions" },
  { icon: DollarSign, label: "Finances", path: "/finances" },
  { icon: Gift, label: "Referral", path: "/referral" },
  { icon: Phone, label: "Brokerage", path: "/contact-brokerage" },
  { icon: Link2, label: "Affiliate", path: "/affiliate-links" }
];
const peopleSubmenu = [
  { icon: Users, label: "People", path: "/people" },
  { icon: Calendar, label: "Calendar", path: "/calendar" },
  { icon: CheckSquare, label: "Tasks", path: "/tasks" },
  { icon: Mail, label: "Inbox", path: "/inbox" }
];
function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const submenuRef = useRef(null);
  const buttonRef = useRef(null);
  const { profile, user } = useAuth();
  const initials = (() => {
    var _a, _b;
    const first = (_a = profile == null ? void 0 : profile.first_name) == null ? void 0 : _a.trim();
    const last = (_b = profile == null ? void 0 : profile.last_name) == null ? void 0 : _b.trim();
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (first) return first.slice(0, 2).toUpperCase();
    const email = (user == null ? void 0 : user.email) ?? "";
    return email.slice(0, 2).toUpperCase();
  })();
  const profileActive = location.pathname.startsWith("/profile");
  const { data: contacts = [] } = useContacts();
  const overdueCount = contacts.filter((c) => {
    if (!c.next_touch) return false;
    try {
      return new Date(c.next_touch) < /* @__PURE__ */ new Date();
    } catch {
      return false;
    }
  }).length;
  useEffect(() => {
    function handleClickOutside(e) {
      if (submenuRef.current && !submenuRef.current.contains(e.target) && buttonRef.current && !buttonRef.current.contains(e.target)) {
        setSubmenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const isPathActive = (path) => path === "/transactions/new" ? location.pathname === "/transactions/new" : location.pathname.startsWith(path);
  const navButtonBase = "group flex min-h-[4.5rem] w-[4.5rem] flex-col items-center justify-center gap-1.5 rounded-2xl border px-2 py-2 text-[11px] font-medium leading-tight transition-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--sidebar-ring))] focus-visible:ring-offset-0";
  const navButtonActive = "border-white/10 bg-white/[0.08] text-[hsl(var(--sidebar-primary-foreground))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]";
  const navButtonIdle = "border-transparent text-[hsl(var(--sidebar-foreground))] hover:border-white/5 hover:bg-white/[0.05] hover:text-white";
  const mobileNavItems = [
    { icon: Home, label: "Deals", path: "/transactions" },
    { icon: Users, label: "People", path: "/people", badge: overdueCount },
    { icon: Plus, label: "Create", path: "/transactions/new" },
    { icon: DollarSign, label: "Finances", path: "/finances" }
  ];
  const mobileListItemBase = "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-standard";
  const mobileListItemActive = "bg-primary/10 text-primary";
  const mobileListItemIdle = "text-foreground hover:bg-muted";
  const handleMobileNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between border-b bg-background px-4 py-3 lg:hidden", children: [
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          onClick: () => setMobileMenuOpen(true),
          className: "inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background text-foreground transition-standard hover:bg-muted",
          "aria-label": "Open navigation",
          children: /* @__PURE__ */ jsxDEV(Menu, { className: "h-5 w-5" }, void 0, false, {
            fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
            lineNumber: 101,
            columnNumber: 11
          }, this)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 95,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => navigate("/transactions"), className: "flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 132 }, void 0, false, {
        fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
        lineNumber: 105,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
        lineNumber: 104,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          onClick: () => navigate("/profile"),
          "aria-label": "Open profile",
          className: "inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-bold text-foreground transition-standard hover:bg-accent",
          children: (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsxDEV("img", { src: profile.avatar_url, alt: "Profile", className: "h-full w-full object-cover" }, void 0, false, {
            fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
            lineNumber: 115,
            columnNumber: 13
          }, this) : /* @__PURE__ */ jsxDEV("span", { children: initials }, void 0, false, {
            fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
            lineNumber: 117,
            columnNumber: 13
          }, this)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 108,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
      lineNumber: 94,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("aside", { className: "relative hidden min-h-screen w-24 shrink-0 flex-col items-center gap-2 border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] px-2 py-4 lg:flex", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "mb-4 flex w-full items-center justify-center", children: /* @__PURE__ */ jsxDEV(
        "img",
        {
          src: uerLogoWhite.url,
          alt: "United Estates Realty",
          style: { width: 84, height: "auto", objectFit: "contain", display: "block" }
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 124,
          columnNumber: 11
        },
        this
      ) }, void 0, false, {
        fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
        lineNumber: 123,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex w-full flex-1 flex-col items-center gap-2", children: navItems.map((item) => {
        const isActive = isPathActive(item.path);
        if (item.hasSubmenu) {
          return /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                ref: buttonRef,
                onClick: () => setSubmenuOpen(!submenuOpen),
                className: cn(
                  navButtonBase,
                  isActive || submenuOpen ? navButtonActive : navButtonIdle
                ),
                title: item.label,
                children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
                    /* @__PURE__ */ jsxDEV(
                      item.icon,
                      {
                        className: cn(
                          "h-5 w-5",
                          isActive || submenuOpen ? "text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground))] group-hover:text-white"
                        )
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                        lineNumber: 150,
                        columnNumber: 23
                      },
                      this
                    ),
                    overdueCount > 0 && /* @__PURE__ */ jsxDEV("span", { className: "absolute -top-1.5 -right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white", children: overdueCount > 99 ? "99+" : overdueCount }, void 0, false, {
                      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                      lineNumber: 159,
                      columnNumber: 25
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                    lineNumber: 149,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV(
                    "span",
                    {
                      className: cn(
                        "max-w-full text-center break-words",
                        isActive || submenuOpen ? "text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground))] group-hover:text-white"
                      ),
                      children: item.label
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                      lineNumber: 164,
                      columnNumber: 21
                    },
                    this
                  )
                ]
              },
              void 0,
              true,
              {
                fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                lineNumber: 138,
                columnNumber: 19
              },
              this
            ),
            submenuOpen && /* @__PURE__ */ jsxDEV(
              "div",
              {
                ref: submenuRef,
                className: "absolute left-full top-0 z-50 ml-3 w-44 rounded-lg border bg-popover py-1 shadow-floating",
                children: peopleSubmenu.map((sub) => {
                  const subActive = location.pathname.startsWith(sub.path);
                  return /* @__PURE__ */ jsxDEV(
                    "button",
                    {
                      onClick: () => {
                        navigate(sub.path);
                        setSubmenuOpen(false);
                      },
                      className: cn(
                        "flex w-full items-center gap-2 px-3 py-2.5 text-sm font-medium transition-standard",
                        subActive ? "bg-accent text-accent-foreground" : "text-foreground hover:bg-accent"
                      ),
                      children: [
                        /* @__PURE__ */ jsxDEV(sub.icon, { className: "h-4 w-4" }, void 0, false, {
                          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                          lineNumber: 192,
                          columnNumber: 29
                        }, this),
                        sub.label
                      ]
                    },
                    sub.path,
                    true,
                    {
                      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                      lineNumber: 184,
                      columnNumber: 27
                    },
                    this
                  );
                })
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                lineNumber: 177,
                columnNumber: 21
              },
              this
            )
          ] }, item.path, true, {
            fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
            lineNumber: 137,
            columnNumber: 17
          }, this);
        }
        return /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => navigate(item.path),
            className: cn(
              navButtonBase,
              isActive ? navButtonActive : navButtonIdle
            ),
            title: item.label,
            children: [
              /* @__PURE__ */ jsxDEV(
                item.icon,
                {
                  className: cn(
                    "h-5 w-5",
                    isActive ? "text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground))] group-hover:text-white"
                  )
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                  lineNumber: 215,
                  columnNumber: 17
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "span",
                {
                  className: cn(
                    "max-w-full text-center break-words",
                    isActive ? "text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground))] group-hover:text-white"
                  ),
                  children: item.label
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                  lineNumber: 223,
                  columnNumber: 17
                },
                this
              )
            ]
          },
          item.path,
          true,
          {
            fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
            lineNumber: 204,
            columnNumber: 15
          },
          this
        );
      }) }, void 0, false, {
        fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
        lineNumber: 131,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => navigate("/profile"),
          title: "My Profile",
          className: cn(
            "mt-2 flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 transition-standard",
            profileActive ? "ring-[hsl(var(--sidebar-active))] scale-105" : "ring-transparent hover:ring-white/30 hover:scale-105"
          ),
          style: {
            background: (profile == null ? void 0 : profile.avatar_url) ? void 0 : profileActive ? "hsl(var(--sidebar-active))" : "hsl(var(--sidebar-hover))"
          },
          children: (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsxDEV(
            "img",
            {
              src: profile.avatar_url,
              alt: "Profile",
              className: "h-full w-full object-cover"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
              lineNumber: 254,
              columnNumber: 13
            },
            this
          ) : /* @__PURE__ */ jsxDEV(
            "span",
            {
              className: "select-none text-[13px] font-bold leading-none",
              style: { color: profileActive ? "hsl(var(--sidebar-bg))" : "hsl(var(--sidebar-fg))" },
              children: initials
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
              lineNumber: 260,
              columnNumber: 13
            },
            this
          )
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 238,
          columnNumber: 9
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
      lineNumber: 122,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Sheet, { open: mobileMenuOpen, onOpenChange: setMobileMenuOpen, children: /* @__PURE__ */ jsxDEV(SheetContent, { side: "left", className: "w-[22rem] max-w-[88vw] p-0", children: [
      /* @__PURE__ */ jsxDEV(SheetHeader, { className: "border-b px-5 py-4 text-left", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "mb-3", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 154 }, void 0, false, {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 274,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 273,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(SheetTitle, { children: "Navigation" }, void 0, false, {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 276,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(SheetDescription, { children: "Move between brokerage workspaces and account settings." }, void 0, false, {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 277,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
        lineNumber: 272,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-5 overflow-y-auto px-4 py-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Core" }, void 0, false, {
            fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
            lineNumber: 282,
            columnNumber: 15
          }, this),
          navItems.filter((item) => !item.hasSubmenu).map((item) => {
            const isActive = isPathActive(item.path);
            return /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                onClick: () => handleMobileNavigate(item.path),
                className: cn(mobileListItemBase, isActive ? mobileListItemActive : mobileListItemIdle),
                children: [
                  /* @__PURE__ */ jsxDEV(item.icon, { className: "h-4 w-4 shrink-0" }, void 0, false, {
                    fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                    lineNumber: 292,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "min-w-0 flex-1 text-left", children: item.label }, void 0, false, {
                    fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                    lineNumber: 293,
                    columnNumber: 21
                  }, this)
                ]
              },
              item.path,
              true,
              {
                fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                lineNumber: 286,
                columnNumber: 19
              },
              this
            );
          })
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 281,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "People Workspace" }, void 0, false, {
            fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
            lineNumber: 300,
            columnNumber: 15
          }, this),
          peopleSubmenu.map((item) => {
            const isActive = isPathActive(item.path);
            const showBadge = item.path === "/people" && overdueCount > 0;
            return /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                onClick: () => handleMobileNavigate(item.path),
                className: cn(mobileListItemBase, isActive ? mobileListItemActive : mobileListItemIdle),
                children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "relative shrink-0", children: [
                    /* @__PURE__ */ jsxDEV(item.icon, { className: "h-4 w-4" }, void 0, false, {
                      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                      lineNumber: 312,
                      columnNumber: 23
                    }, this),
                    showBadge ? /* @__PURE__ */ jsxDEV("span", { className: "absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white", children: overdueCount > 99 ? "99+" : overdueCount }, void 0, false, {
                      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                      lineNumber: 314,
                      columnNumber: 25
                    }, this) : null
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                    lineNumber: 311,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "min-w-0 flex-1 text-left", children: item.label }, void 0, false, {
                    fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                    lineNumber: 319,
                    columnNumber: 21
                  }, this)
                ]
              },
              item.path,
              true,
              {
                fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                lineNumber: 305,
                columnNumber: 19
              },
              this
            );
          })
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 299,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Account" }, void 0, false, {
            fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
            lineNumber: 326,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              type: "button",
              onClick: () => handleMobileNavigate("/profile"),
              className: cn(mobileListItemBase, profileActive ? mobileListItemActive : mobileListItemIdle),
              children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-bold text-foreground", children: (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsxDEV("img", { src: profile.avatar_url, alt: "Profile", className: "h-full w-full object-cover" }, void 0, false, {
                  fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                  lineNumber: 334,
                  columnNumber: 21
                }, this) : /* @__PURE__ */ jsxDEV("span", { children: initials }, void 0, false, {
                  fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                  lineNumber: 336,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                  lineNumber: 332,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "min-w-0 flex-1 text-left", children: "My Profile" }, void 0, false, {
                  fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                  lineNumber: 339,
                  columnNumber: 17
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
              lineNumber: 327,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 325,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
        lineNumber: 280,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
      lineNumber: 271,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
      lineNumber: 270,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("nav", { className: "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:hidden", children: /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-5", children: [
      mobileNavItems.map((item) => {
        const isActive = isPathActive(item.path);
        return /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            onClick: () => navigate(item.path),
            className: cn(
              "flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-standard",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            ),
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
                /* @__PURE__ */ jsxDEV(item.icon, { className: "h-5 w-5" }, void 0, false, {
                  fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                  lineNumber: 361,
                  columnNumber: 19
                }, this),
                item.badge ? /* @__PURE__ */ jsxDEV("span", { className: "absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white", children: item.badge > 99 ? "99+" : item.badge }, void 0, false, {
                  fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                  lineNumber: 363,
                  columnNumber: 21
                }, this) : null
              ] }, void 0, true, {
                fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                lineNumber: 360,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("span", { children: item.label }, void 0, false, {
                fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
                lineNumber: 368,
                columnNumber: 17
              }, this)
            ]
          },
          item.path,
          true,
          {
            fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
            lineNumber: 351,
            columnNumber: 15
          },
          this
        );
      }),
      /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          onClick: () => setMobileMenuOpen(true),
          className: "flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-muted-foreground transition-standard hover:text-foreground",
          children: [
            /* @__PURE__ */ jsxDEV(MoreHorizontal, { className: "h-5 w-5" }, void 0, false, {
              fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
              lineNumber: 377,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: "More" }, void 0, false, {
              fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
              lineNumber: 378,
              columnNumber: 13
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
          lineNumber: 372,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
      lineNumber: 347,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
      lineNumber: 346,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/layout/AppSidebar.tsx",
    lineNumber: 93,
    columnNumber: 5
  }, this);
}
function AppLayout() {
  return /* @__PURE__ */ jsxDEV("div", { className: "app-shell flex min-h-screen w-full flex-col lg:flex-row", children: [
    /* @__PURE__ */ jsxDEV(AppSidebar, {}, void 0, false, {
      fileName: "/dev-server/src/components/layout/AppLayout.tsx",
      lineNumber: 7,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-16 lg:min-h-screen lg:pb-0", children: /* @__PURE__ */ jsxDEV(Outlet, {}, void 0, false, {
      fileName: "/dev-server/src/components/layout/AppLayout.tsx",
      lineNumber: 9,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/layout/AppLayout.tsx",
      lineNumber: 8,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/layout/AppLayout.tsx",
    lineNumber: 6,
    columnNumber: 5
  }, this);
}
class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: (error == null ? void 0 : error.message) ?? "An unexpected error occurred." };
  }
  componentDidCatch(error, info) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5", children: /* @__PURE__ */ jsxDEV(
          "svg",
          {
            className: "w-8 h-8 text-destructive",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              /* @__PURE__ */ jsxDEV("circle", { cx: "12", cy: "12", r: "10" }, void 0, false, {
                fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
                lineNumber: 37,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("line", { x1: "12", y1: "8", x2: "12", y2: "12" }, void 0, false, {
                fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
                lineNumber: 38,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" }, void 0, false, {
                fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
                lineNumber: 39,
                columnNumber: 15
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
            lineNumber: 28,
            columnNumber: 13
          },
          this
        ) }, void 0, false, {
          fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
          lineNumber: 27,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "text-xl font-semibold text-foreground mb-2", children: "Something went wrong" }, void 0, false, {
          fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
          lineNumber: 42,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground max-w-md mb-6", children: this.state.message }, void 0, false, {
          fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
          lineNumber: 43,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => this.setState({ hasError: false, message: "" }),
              className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors",
              children: "Try Again"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
              lineNumber: 45,
              columnNumber: 13
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => window.location.assign("/"),
              className: "px-4 py-2 rounded-lg border bg-background text-sm font-medium hover:bg-muted transition-colors",
              children: "Go to Home"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
              lineNumber: 51,
              columnNumber: 13
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
          lineNumber: 44,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/AppErrorBoundary.tsx",
        lineNumber: 26,
        columnNumber: 9
      }, this);
    }
    return this.props.children;
  }
}
const Toaster$1 = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsxDEV(
    Toaster$2,
    {
      theme,
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/components/ui/sonner.tsx",
      lineNumber: 10,
      columnNumber: 5
    },
    void 0
  );
};
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1e6;
let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}
const toastTimeouts = /* @__PURE__ */ new Map();
const addToRemoveQueue = (toastId) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }
  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId
    });
  }, TOAST_REMOVE_DELAY);
  toastTimeouts.set(toastId, timeout);
};
const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT)
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t)
      };
    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast2) => {
          addToRemoveQueue(toast2.id);
        });
      }
      return {
        ...state,
        toasts: state.toasts.map(
          (t) => t.id === toastId || toastId === void 0 ? {
            ...t,
            open: false
          } : t
        )
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === void 0) {
        return {
          ...state,
          toasts: []
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId)
      };
  }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}
function toast({ ...props }) {
  const id = genId();
  const update = (props2) => dispatch({
    type: "UPDATE_TOAST",
    toast: { ...props2, id }
  });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      }
    }
  });
  return {
    id,
    dismiss,
    update
  };
}
function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);
  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId })
  };
}
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/toast.tsx",
    lineNumber: 14,
    columnNumber: 3
  },
  void 0
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
const Toast = React.forwardRef(({ className, variant, ...props }, ref) => {
  return /* @__PURE__ */ jsxDEV(ToastPrimitives.Root, { ref, className: cn(toastVariants({ variant }), className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/toast.tsx",
    lineNumber: 44,
    columnNumber: 10
  }, void 0);
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  ToastPrimitives.Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/toast.tsx",
    lineNumber: 52,
    columnNumber: 3
  },
  void 0
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  ToastPrimitives.Close,
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsxDEV(X, { className: "h-4 w-4" }, void 0, false, {
      fileName: "/dev-server/src/components/ui/toast.tsx",
      lineNumber: 76,
      columnNumber: 5
    }, void 0)
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/toast.tsx",
    lineNumber: 67,
    columnNumber: 3
  },
  void 0
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(ToastPrimitives.Title, { ref, className: cn("text-sm font-semibold", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/toast.tsx",
  lineNumber: 85,
  columnNumber: 3
}, void 0));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(ToastPrimitives.Description, { ref, className: cn("text-sm opacity-90", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/toast.tsx",
  lineNumber: 93,
  columnNumber: 3
}, void 0));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxDEV(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxDEV(Toast, { ...props, children: [
        /* @__PURE__ */ jsxDEV("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsxDEV(ToastTitle, { children: title }, void 0, false, {
            fileName: "/dev-server/src/components/ui/toaster.tsx",
            lineNumber: 13,
            columnNumber: 25
          }, this),
          description && /* @__PURE__ */ jsxDEV(ToastDescription, { children: description }, void 0, false, {
            fileName: "/dev-server/src/components/ui/toaster.tsx",
            lineNumber: 14,
            columnNumber: 31
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/ui/toaster.tsx",
          lineNumber: 12,
          columnNumber: 13
        }, this),
        action,
        /* @__PURE__ */ jsxDEV(ToastClose, {}, void 0, false, {
          fileName: "/dev-server/src/components/ui/toaster.tsx",
          lineNumber: 17,
          columnNumber: 13
        }, this)
      ] }, id, true, {
        fileName: "/dev-server/src/components/ui/toaster.tsx",
        lineNumber: 11,
        columnNumber: 11
      }, this);
    }),
    /* @__PURE__ */ jsxDEV(ToastViewport, {}, void 0, false, {
      fileName: "/dev-server/src/components/ui/toaster.tsx",
      lineNumber: 21,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/ui/toaster.tsx",
    lineNumber: 8,
    columnNumber: 5
  }, this);
}
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/tooltip.tsx",
    lineNumber: 16,
    columnNumber: 3
  },
  void 0
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 3e4
    }
  }
});
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);
  return null;
}
function RootLayout() {
  return /* @__PURE__ */ jsxDEV(AppErrorBoundary, { children: /* @__PURE__ */ jsxDEV(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxDEV(TooltipProvider, { children: [
    /* @__PURE__ */ jsxDEV(Toaster, {}, void 0, false, {
      fileName: "/dev-server/src/RootLayout.tsx",
      lineNumber: 32,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV(Toaster$1, {}, void 0, false, {
      fileName: "/dev-server/src/RootLayout.tsx",
      lineNumber: 33,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV(ScrollToTop, {}, void 0, false, {
      fileName: "/dev-server/src/RootLayout.tsx",
      lineNumber: 34,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV(Outlet, {}, void 0, false, {
      fileName: "/dev-server/src/RootLayout.tsx",
      lineNumber: 35,
      columnNumber: 11
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/RootLayout.tsx",
    lineNumber: 31,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/RootLayout.tsx",
    lineNumber: 30,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/RootLayout.tsx",
    lineNumber: 29,
    columnNumber: 5
  }, this);
}
const caseStudies = [
  {
    slug: "marcus-reed-commission-fees",
    agentName: "Marcus Reed",
    city: "Orlando, Florida",
    headlineResult: "Stopped Losing 30% of His Commission to Fees and Finally Kept What He Earned",
    summary: "An Orlando solo agent eliminated unnecessary fee layers after switching to United Estates Realty, keeping significantly more of every deal he closed.",
    label: "Real Agent Story | Solo Agent | Orlando, Florida, USA",
    snapshot: {
      agent: "Marcus Reed",
      location: "Orlando, Florida",
      experience: "6 years as a solo real estate agent",
      situation: "Paying monthly fees, transaction fees, commission splits, and add-on charges across multiple platforms",
      result: "Switched to United Estates Realty and eliminated unnecessary fee layers, keeping significantly more of every deal he closed"
    },
    story: [
      "Marcus Reed had been a real estate agent in Orlando for six years. By any measure, he was good at his job. His clients trusted him. His referrals were growing. His pipeline was full.",
      "But every month when he sat down to review his earnings, the same sinking feeling came back.",
      "The numbers never added up the way they should.",
      "It started with the monthly subscription. One platform for listings. Another for client management. Another for communication. Each one billed separately. Each one justified with a free trial that quietly became a recurring charge.",
      "Then came the transaction fees. Every time Marcus closed a deal he sourced, negotiated, and delivered entirely on his own, a percentage was automatically deducted by the platform. No explanation. No negotiation. Just gone.",
      "Then the commission split. A cut taken by a company that had no involvement in the deal whatsoever. No calls made. No clients met. No work done. Just a hand waiting at the finish line.",
      '"I remember closing a strong deal one Friday and feeling excited," Marcus recalls. "Then I did the math on what I was actually taking home after all the fees. It was nowhere near what I had earned. I felt like I had worked the entire week for someone else."',
      "Marcus spent an entire weekend mapping out every fee he was paying across every platform. The total stopped him cold.",
      "He was handing over a significant portion of his annual income not to a business partner, not to a team member, but to platforms and tools that simply charged because they could.",
      "He started looking for an alternative. Not just a cheaper tool, but a fundamentally different approach. One built by someone who understood what it actually felt like to be on the other side of those fees.",
      "That is when Marcus found United Estates Realty."
    ],
    whatChanged: [
      "The difference was immediate, not just in cost, but in philosophy. United Estates Realty was not built by a tech company looking for multiple revenue streams from agents. It was built by an agent who had lived through the same frustration Marcus was feeling.",
      "No transaction fees eating into every closed deal.",
      "No commission splits taken by a platform that did none of the work.",
      "No surprise charges for features that should have been standard from day one.",
      "One straightforward system built around how agents actually work.",
      '"For the first time in years, I felt like my earnings were actually mine," Marcus says. "I closed the same number of deals the next month and kept noticeably more than I ever had before. That is not a small thing; that is the difference between a good year and a great one."'
    ],
    advice: '"Do the math. Seriously, sit down and add up every fee you are paying across every platform you use. Most agents I know have never done this because they are too busy working. When you finally see the full number, you will understand exactly why I made the switch."',
    disclaimer: "This case study is based on real experiences from within the real estate industry. The name and identifying details have been changed to protect the individual's privacy. The challenges, frustrations, and outcomes described reflect genuine experiences of real estate agents using United Estates Realty."
  }
];
function getCaseStudyBySlug(slug) {
  return caseStudies.find((c) => c.slug === slug);
}
const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(AccordionPrimitive.Item, { ref, className: cn("border-b", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/accordion.tsx",
  lineNumber: 13,
  columnNumber: 3
}, void 0));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxDEV(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxDEV(
  AccordionPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxDEV(ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" }, void 0, false, {
        fileName: "/dev-server/src/components/ui/accordion.tsx",
        lineNumber: 31,
        columnNumber: 7
      }, void 0)
    ]
  },
  void 0,
  true,
  {
    fileName: "/dev-server/src/components/ui/accordion.tsx",
    lineNumber: 22,
    columnNumber: 5
  },
  void 0
) }, void 0, false, {
  fileName: "/dev-server/src/components/ui/accordion.tsx",
  lineNumber: 21,
  columnNumber: 3
}, void 0));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  AccordionPrimitive.Content,
  {
    ref,
    className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsxDEV("div", { className: cn("pb-4 pt-0", className), children }, void 0, false, {
      fileName: "/dev-server/src/components/ui/accordion.tsx",
      lineNumber: 46,
      columnNumber: 5
    }, void 0)
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/accordion.tsx",
    lineNumber: 41,
    columnNumber: 3
  },
  void 0
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
function Faq({
  items,
  eyebrow,
  heading,
  description,
  includeSchema = true,
  className,
  accordionClassName
}) {
  if (!(items == null ? void 0 : items.length)) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
  return /* @__PURE__ */ jsxDEV("div", { className, children: [
    includeSchema && /* @__PURE__ */ jsxDEV(Head, { children: /* @__PURE__ */ jsxDEV("script", { type: "application/ld+json", children: JSON.stringify(schema) }, void 0, false, {
      fileName: "/dev-server/src/components/Faq.tsx",
      lineNumber: 66,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/Faq.tsx",
      lineNumber: 65,
      columnNumber: 9
    }, this),
    (eyebrow || heading || description) && /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
      eyebrow && /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: eyebrow }, void 0, false, {
        fileName: "/dev-server/src/components/Faq.tsx",
        lineNumber: 73,
        columnNumber: 13
      }, this),
      heading && /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: heading }, void 0, false, {
        fileName: "/dev-server/src/components/Faq.tsx",
        lineNumber: 78,
        columnNumber: 13
      }, this),
      description && /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: description }, void 0, false, {
        fileName: "/dev-server/src/components/Faq.tsx",
        lineNumber: 83,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/Faq.tsx",
      lineNumber: 71,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: cn("mt-10 max-w-3xl", accordionClassName), children: /* @__PURE__ */ jsxDEV(Accordion, { type: "single", collapsible: true, className: "w-full", children: items.map((item, i) => /* @__PURE__ */ jsxDEV(AccordionItem, { value: `item-${i + 1}`, children: [
      /* @__PURE__ */ jsxDEV(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: item.question }, void 0, false, {
        fileName: "/dev-server/src/components/Faq.tsx",
        lineNumber: 94,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: item.answer }, void 0, false, {
        fileName: "/dev-server/src/components/Faq.tsx",
        lineNumber: 97,
        columnNumber: 15
      }, this)
    ] }, `${i}-${item.question}`, true, {
      fileName: "/dev-server/src/components/Faq.tsx",
      lineNumber: 93,
      columnNumber: 13
    }, this)) }, void 0, false, {
      fileName: "/dev-server/src/components/Faq.tsx",
      lineNumber: 91,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/Faq.tsx",
      lineNumber: 90,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/Faq.tsx",
    lineNumber: 63,
    columnNumber: 5
  }, this);
}
const version$2 = 1;
const asset_id$2 = "2cc90155-0885-4f1f-966a-ad3bf4d4b22f";
const project_id$2 = "c987c87c-e16f-4694-9045-0ccdf362905d";
const url$2 = "/__l5e/assets-v1/2cc90155-0885-4f1f-966a-ad3bf4d4b22f/commission-vs-traditional-split-2026.webp";
const r2_key$2 = "a/v1/c987c87c-e16f-4694-9045-0ccdf362905d/2cc90155-0885-4f1f-966a-ad3bf4d4b22f/commission-vs-traditional-split-2026.webp";
const original_filename$2 = "commission-vs-traditional-split-2026.webp";
const size$2 = 78242;
const content_type$2 = "image/webp";
const created_at$2 = "2026-06-19T06:50:42Z";
const blogImage1 = {
  version: version$2,
  asset_id: asset_id$2,
  project_id: project_id$2,
  url: url$2,
  r2_key: r2_key$2,
  original_filename: original_filename$2,
  size: size$2,
  content_type: content_type$2,
  created_at: created_at$2
};
const version$1 = 1;
const asset_id$1 = "0af2743f-eb4f-4054-8d38-aba604fbc567";
const project_id$1 = "c987c87c-e16f-4694-9045-0ccdf362905d";
const url$1 = "/__l5e/assets-v1/0af2743f-eb4f-4054-8d38-aba604fbc567/real-estate-crm-software-dashboard-lead-management-agents.jpg";
const r2_key$1 = "a/v1/c987c87c-e16f-4694-9045-0ccdf362905d/0af2743f-eb4f-4054-8d38-aba604fbc567/real-estate-crm-software-dashboard-lead-management-agents.jpg";
const original_filename$1 = "real-estate-crm-software-dashboard-lead-management-agents.jpg";
const size$1 = 708367;
const content_type$1 = "image/jpeg";
const created_at$1 = "2026-06-20T13:16:42Z";
const blogImage2 = {
  version: version$1,
  asset_id: asset_id$1,
  project_id: project_id$1,
  url: url$1,
  r2_key: r2_key$1,
  original_filename: original_filename$1,
  size: size$1,
  content_type: content_type$1,
  created_at: created_at$1
};
const version = 1;
const asset_id = "2e181c03-7fb8-4779-aa9a-2e36979d63bd";
const project_id = "c987c87c-e16f-4694-9045-0ccdf362905d";
const url = "/__l5e/assets-v1/2e181c03-7fb8-4779-aa9a-2e36979d63bd/how-to-choose-real-estate-brokerage-2026-checklist-agents.jpg";
const r2_key = "a/v1/c987c87c-e16f-4694-9045-0ccdf362905d/2e181c03-7fb8-4779-aa9a-2e36979d63bd/how-to-choose-real-estate-brokerage-2026-checklist-agents.jpg";
const original_filename = "how-to-choose-real-estate-brokerage-2026-checklist-agents.jpg";
const size = 111392;
const content_type = "image/jpeg";
const created_at = "2026-06-22T12:34:39Z";
const blogImage3 = {
  version,
  asset_id,
  project_id,
  url,
  r2_key,
  original_filename,
  size,
  content_type,
  created_at
};
const Internal = ({ to, children }) => /* @__PURE__ */ jsxDEV(Link, { to, className: "text-primary underline-offset-4 hover:underline", children }, void 0, false, {
  fileName: "/dev-server/src/data/blogPosts.tsx",
  lineNumber: 24,
  columnNumber: 3
}, void 0);
const H2 = ({ children }) => /* @__PURE__ */ jsxDEV("h2", { className: "mt-12 text-2xl font-bold text-foreground sm:text-3xl", children }, void 0, false, {
  fileName: "/dev-server/src/data/blogPosts.tsx",
  lineNumber: 30,
  columnNumber: 3
}, void 0);
const H3 = ({ children }) => /* @__PURE__ */ jsxDEV("h3", { className: "mt-8 text-xl font-semibold text-foreground", children }, void 0, false, {
  fileName: "/dev-server/src/data/blogPosts.tsx",
  lineNumber: 33,
  columnNumber: 3
}, void 0);
const P = ({ children }) => /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children }, void 0, false, {
  fileName: "/dev-server/src/data/blogPosts.tsx",
  lineNumber: 36,
  columnNumber: 3
}, void 0);
const UL = ({ children }) => /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-muted-foreground", children }, void 0, false, {
  fileName: "/dev-server/src/data/blogPosts.tsx",
  lineNumber: 39,
  columnNumber: 3
}, void 0);
const COMMISSION_FAQ = [
  {
    question: "Which companies offer 100% commission brokerage services in the US?",
    answer: "The major national options include eXp Realty, Real Broker, Fathom Realty, HomeSmart, Realty ONE Group, and United Estates Realty. Each has a different fee structure, so the right choice depends on your production volume and support needs."
  },
  {
    question: "How to join a 100% commission brokerage firm?",
    answer: "Hold an active license, choose a brokerage, complete a license transfer, and pay the initial fee. Most flat-fee brokerages process transfers digitally within a few business days."
  },
  {
    question: "How does a 100% commission brokerage model work for real estate agents?",
    answer: "The agent keeps the full commission from every deal and pays the brokerage a flat monthly or per-transaction fee instead of a percentage split."
  },
  {
    question: "What are the typical fee structures at a full commission real estate brokerage?",
    answer: "Monthly fees range from $0 to $500, per-transaction fees from $0 to $600, and E&O fees from $30 to $50 per deal. United Estates Realty charges $98 per month with zero transaction fees and zero E&O add-ons."
  },
  {
    question: "What are the benefits of using a 100% commission brokerage?",
    answer: "Higher net income per deal, predictable fixed costs, full brand control, included CRM tools, and no income ceiling as production grows."
  }
];
const CRM_FAQ = [
  {
    question: "Where to buy a real estate CRM with mobile app support?",
    answer: "Follow Up Boss, Wise Agent and Sierra Interactive all offer strong mobile apps available through standard app stores. United Estates Realty agents access the included CRM through a mobile-ready platform without a separate purchase."
  },
  {
    question: "Top features to look for in a real estate CRM?",
    answer: "Lead management, automation, mobile access, MLS integration and customizable workflows. These five features directly affect how many leads you convert and how much time you spend on manual tasks."
  },
  {
    question: "Which CRM works best for independent real estate agents?",
    answer: "Wise Agent is widely recommended for solo agents due to its affordability and simple interface. Agents with United Estates Realty get a full CRM included in the monthly flat fee, which eliminates the need to evaluate standalone options entirely."
  },
  {
    question: "Do CRM platforms connect directly with MLS databases?",
    answer: "Yes. Several CRM platforms offer direct MLS integration that automatically populates property listing data and provides real-time alerts on property status updates without manual data entry. Top Producer and Sierra Interactive are among the strongest options for MLS connectivity."
  },
  {
    question: "Can you customize a CRM for workflows unique to your agency?",
    answer: "Most modern CRMs offer some level of customization. The degree varies significantly between platforms. Before committing request a live demo and specifically ask to see the workflow builder and pipeline customization tools rather than relying on what the feature list says."
  }
];
const BROKERAGE_FAQ = [
  {
    question: "What is the best real estate brokerage for new agents?",
    answer: "Keller Williams is the strongest pick for most new agents because the entire company is built around education and mentorship. Its KW University coursework, productivity coaching, and mentor pairing are designed for people closing their first deals. For agents who want maximum flexibility from day one, flat-fee brokerages like United Estates Realty offer full commission with an included CRM at a predictable monthly cost."
  },
  {
    question: "Which brokerage has the best commission split?",
    answer: "The best commission split is not the highest percentage; it is the structure that produces the highest net income after all fees for your specific production volume. An agent closing five deals per year and a top producer closing fifty deals need completely different models. Run the math on your actual numbers."
  },
  {
    question: "What is the best brokerage for part-time agents?",
    answer: "Virtual and low-fee brokerages fit part-time agents best because you are not paying for a desk you rarely use. Confirm that monthly fees will not consume commissions from occasional closings before signing."
  },
  {
    question: "What changed in 2026?",
    answer: "NAR settlement rules now require written buyer agreements before home tours. Major industry consolidation is underway, including the pending RE/MAX acquisition. Brand recognition matters less than local support and cost structure."
  },
  {
    question: "Do all brokerages charge desk fees?",
    answer: "No. In a flat-fee or 100% commission model, you typically pay a monthly membership fee and a flat transaction fee per closing rather than a desk fee. Cloud-based brokerages eliminate physical office costs and pass those savings to agents through lower monthly charges. United Estates Realty charges a flat $98 monthly fee with zero transaction fees and no desk fee structure."
  }
];
const BrokerageArticle = () => /* @__PURE__ */ jsxDEV(Fragment, { children: [
  /* @__PURE__ */ jsxDEV(P, { children: "Most agents choose their first brokerage within weeks of getting licensed. Many never revisit that decision for years." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 128,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "That single choice determines how much of every commission they keep, what tools they work with every day, how much support they get when a deal goes sideways, and whether their business survives a slow market." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 129,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Getting it wrong is expensive. Getting it right from the start is one of the most important business decisions a real estate agent will ever make." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 132,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "This is the checklist we wish every agent had before walking into their first brokerage interview." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 133,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV("figure", { className: "mt-8", children: /* @__PURE__ */ jsxDEV(
    "img",
    {
      src: blogImage3.url,
      alt: "Real estate agent reviewing brokerage options, commission structures, support resources, and training programs before choosing a real estate brokerage in 2026",
      className: "w-full rounded-lg",
      loading: "eager"
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 136,
      columnNumber: 7
    },
    void 0
  ) }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 135,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "What Changed in 2026" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 144,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Two significant shifts make brokerage selection more important than ever this year." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 145,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Since August 2024, NAR's settlement rules require written buyer agreements before touring homes. Every brokerage you interview should be able to explain clearly how they train agents on buyer presentations. The offices with a sharp answer are the ones taking training seriously." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 148,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "The Real Brokerage agreed to acquire RE/MAX Holdings in April 2026, with the deal expected to close in the second half of 2026. The practical takeaway is that brand names matter less than ever. Splits, fees, and mentorship are still set locally. Ask for everything in writing." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 151,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "The brokerage landscape in 2026 is consolidating fast. Agents who choose based on brand recognition alone may find themselves in a very different organization within twelve months." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 154,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Step 1: Understand the Four Brokerage Models" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 158,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Before evaluating any specific brokerage, understand which model they operate under." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 159,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Traditional franchise brokerages typically offer splits ranging from 60/40 to 70/30. Cloud and virtual brokerages operate without physical offices and generally offer higher splits to agents, such as 80/20 or 85/15. Flat fee or 100% commission brokerages let agents keep the full commission in exchange for a flat monthly fee and sometimes a per-transaction charge." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 160,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Each model suits a different type of agent. New agents who need daily mentorship and hands-on training benefit from traditional models. Experienced agents who generate their own leads and want maximum take-home pay benefit from flat-fee or virtual models." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 163,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Knowing which category you fall into before any interview saves time and prevents a mismatch that costs you money for years." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 166,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Step 2: Calculate Total Cost, Not Just the Split" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 168,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "The split number on a recruiting flyer is rarely the number that matters most. What matters is your effective take-home after all fees, caps, desk charges, franchise royalties, and transaction costs are factored in. A brokerage advertising a 90/10 split that also charges a monthly technology fee, a per-transaction fee, and an annual compliance fee might leave you with less than a brokerage offering 70/30 with no additional costs." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 169,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Ask every brokerage for a full written breakdown of:" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 172,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(UL, { children: [
    /* @__PURE__ */ jsxDEV("li", { children: "Monthly desk or technology fees" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 174,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Transaction fees per closing" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 175,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Franchise royalty charges" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 176,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "E&O insurance costs" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 177,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Any marketing or compliance fees" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 178,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 173,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Model your total take-home pay using your average sale price, expected commission percentage, and number of deals per year. Run this calculation for every brokerage you interview before making any decision." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 180,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: [
    "United Estates Realty operates on a flat",
    " ",
    /* @__PURE__ */ jsxDEV(Internal, { to: "/pricing", children: "$98 monthly fee" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 185,
      columnNumber: 7
    }, void 0),
    " with zero transaction fees and a full CRM included, meaning agents calculate their costs in seconds rather than deciphering a layered fee schedule."
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 183,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Step 3: Evaluate Support and Training Honestly" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 188,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Many brokerages focus heavily on onboarding and initial training, but offer little structure once agents are producing. Ask how support evolves as your business grows and whether the brokerage is built only for beginners or for long-term careers." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 189,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "The most important questions to ask:" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 192,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(UL, { children: [
    /* @__PURE__ */ jsxDEV("li", { children: "Who specifically reviews my first offer before it goes out?" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 194,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "How do you handle support requests after business hours?" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 195,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "What does your onboarding timeline actually look like day by day?" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 196,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 193,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Good brokerages explain their support process as if they have done it a thousand times. Weak ones start selling you confidence instead of infrastructure." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 198,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "New agents should prioritize mentorship and training over commission percentage in their first twelve to eighteen months. A 70/30 split with genuine daily support and structured training produces more income in year one than a 90/10 split with no guidance and no systems." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 201,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Step 4: Assess the Technology Stack" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 205,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Transaction software, e-signature portals, and CRM dashboards are no longer optional in 2026. Brokerages that offer comprehensive tools inside a single platform help agents streamline operations and free up time for client work rather than troubleshooting disconnected software." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 206,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Ask specifically:" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 209,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(UL, { children: [
    /* @__PURE__ */ jsxDEV("li", { children: "Is a CRM included or do you pay separately?" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 211,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "What transaction management system do we use?" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 212,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Is the technology mobile-friendly for agents working in the field?" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 213,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 210,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Find out which tools are included and which ones you will still need to pay for yourself. This clarifies your true cost of doing business and avoids tech-stack overwhelm where agents pay for multiple overlapping subscriptions." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 215,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Technology fees at traditional brokerages often run $100 to $300 per month on top of split and desk costs. A brokerage that includes CRM, transaction management, and agent tools in a single flat fee eliminates that variable entirely." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 218,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Step 5: Interview at Least Three Brokerages" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 222,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "It is recommended to start interviewing brokerages immediately during the licensing process. Interviewing a brokerage before you even finish your coursework gives you time to make a considered decision rather than signing with whoever calls first after you pass the exam." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 223,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Interview a minimum of three brokerages across different model types. Include at least one traditional franchise, one virtual or cloud-based brokerage, and one flat-fee model. Comparing all three gives you real data rather than one recruitment pitch with nothing to measure it against." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 226,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "The Complete Checklist Before You Sign" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 230,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Use this list in every brokerage interview:" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 231,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(UL, { children: [
    /* @__PURE__ */ jsxDEV("li", { children: [
      /* @__PURE__ */ jsxDEV("strong", { children: "Compensation:" }, void 0, false, {
        fileName: "/dev-server/src/data/blogPosts.tsx",
        lineNumber: 234,
        columnNumber: 9
      }, void 0),
      " Full written breakdown of all splits and fees. Annual cap amount if applicable. What happens to my split after the cap resets each January."
    ] }, void 0, true, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 233,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: [
      /* @__PURE__ */ jsxDEV("strong", { children: "Support:" }, void 0, false, {
        fileName: "/dev-server/src/data/blogPosts.tsx",
        lineNumber: 237,
        columnNumber: 9
      }, void 0),
      " Named person who reviews contracts. After-hours support process. Onboarding timeline in writing."
    ] }, void 0, true, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 236,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: [
      /* @__PURE__ */ jsxDEV("strong", { children: "Technology:" }, void 0, false, {
        fileName: "/dev-server/src/data/blogPosts.tsx",
        lineNumber: 240,
        columnNumber: 9
      }, void 0),
      " CRM included or separate cost. Transaction management system name and demo. Mobile access confirmed."
    ] }, void 0, true, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 239,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: [
      /* @__PURE__ */ jsxDEV("strong", { children: "Culture:" }, void 0, false, {
        fileName: "/dev-server/src/data/blogPosts.tsx",
        lineNumber: 243,
        columnNumber: 9
      }, void 0),
      " How agent disputes are handled. Whether the broker also personally sells and how that affects availability. Agent retention rate at this specific office."
    ] }, void 0, true, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 242,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: [
      /* @__PURE__ */ jsxDEV("strong", { children: "Exit terms:" }, void 0, false, {
        fileName: "/dev-server/src/data/blogPosts.tsx",
        lineNumber: 246,
        columnNumber: 9
      }, void 0),
      " How a license transfer works if the arrangement is not the right fit. What happens to active listings during a transition?"
    ] }, void 0, true, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 245,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 232,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV("section", { className: "mt-16", children: /* @__PURE__ */ jsxDEV(Faq, { eyebrow: "FAQ", heading: "Frequently Asked Questions", items: BROKERAGE_FAQ }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 251,
    columnNumber: 7
  }, void 0) }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 250,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: [
    "At ",
    /* @__PURE__ */ jsxDEV(Internal, { to: "/", children: "United Estates Realty" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 255,
      columnNumber: 10
    }, void 0),
    ", we built a straightforward model for agents who want full commission without the confusion of layered fees. If you are evaluating your options, the full breakdown is at",
    " ",
    /* @__PURE__ */ jsxDEV(Internal, { to: "/", children: "unitedestatesagent" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 256,
      columnNumber: 7
    }, void 0),
    "."
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 254,
    columnNumber: 5
  }, void 0)
] }, void 0, true, {
  fileName: "/dev-server/src/data/blogPosts.tsx",
  lineNumber: 127,
  columnNumber: 3
}, void 0);
const CommissionArticle = () => /* @__PURE__ */ jsxDEV(Fragment, { children: [
  /* @__PURE__ */ jsxDEV(P, { children: "Most real estate agents know their commission percentage. Very few know their actual take-home number." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 263,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "After brokerage fees, taxes, and expenses, agents typically take home just 35 to 55% of the original gross commission. That means on a $15,000 commission check, many agents pocket between $5,250 and $8,250. The rest disappears across splits, desk fees, transaction charges, and franchise royalties before a single dollar reaches a bank account." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 264,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "In 2026, more agents are questioning whether their brokerage model is working for them or against them. This guide gives you the real math on both options so you can decide with clear numbers instead of a recruiter's pitch." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 270,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV("figure", { className: "mt-8", children: /* @__PURE__ */ jsxDEV(
    "img",
    {
      src: blogImage1.url,
      alt: "Real estate agent comparing commission structures and brokerage splits to evaluate take-home income in a 100 percent commission brokerage versus a traditional split model",
      className: "w-full rounded-lg",
      loading: "eager"
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 276,
      columnNumber: 7
    },
    void 0
  ) }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 275,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "How the Traditional Split Model Works" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 284,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "In a traditional brokerage, the agent and brokerage divide every commission earned. Common split structures range from 50/50 for new agents up to 90/10 for top producers. As agents gain experience and increase their sales volume, splits can reach as high as 90/10." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 285,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Here is what the math actually looks like on a real deal." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 290,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "On a $400,000 home sale with a 6% total commission, the transaction generates $24,000 split equally between buyer and seller agents. A 70/30 split with the brokerage allows the agent to take home $8,400." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 291,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "That is before desk fees, technology fees, transaction charges, and E&O insurance are subtracted." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 295,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "An agent's net take-home pay is often less than 50% of their gross commission after accounting for splits, franchise fees, desk fees, and essential business expenses." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 296,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Traditional brokerages justify the split by offering training, transaction support, broker access, and marketing infrastructure. For newer agents, those resources have genuine value. For experienced agents who generate their own leads and run their own transactions, the split often becomes a cost with diminishing returns." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 300,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "How the 100% Commission Model Works" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 306,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "In a 100% commission brokerage, the agent keeps the full commission from every deal. The brokerage charges flat fees instead of a percentage." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 307,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "These typically include a monthly desk fee, usually $100 to $500 per month and a per-transaction fee of $200 to $600 per closing. The brokerage covers its costs through those charges rather than a split of your earnings." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 311,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "The brokerage runs lean through virtual offices and cloud-based transaction management, which keeps fixed costs low on both sides." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 315,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: [
    /* @__PURE__ */ jsxDEV(Internal, { to: "/", children: "United Estates Realty" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 320,
      columnNumber: 7
    }, void 0),
    " operates on this model. Agents pay a flat $98 per month with zero transaction fees on top. No percentage split. No hidden charges per closing. The CRM is included in that monthly fee, so agents are not paying separately for lead management tools on top of brokerage costs."
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 319,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Side by Side: The Real Numbers in 2026" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 325,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Here is a direct comparison for an agent closing 10 transactions per year at an average commission of $10,000 per deal." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 326,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H3, { children: "Traditional Split (70/30) with Fees" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 331,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(UL, { children: [
    /* @__PURE__ */ jsxDEV("li", { children: "Gross commissions: $100,000" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 333,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Brokerage split (30%): $30,000 gone" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 334,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Desk fee ($300/month): $3,600 gone" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 335,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Transaction fees ($300 per deal): $3,000 gone" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 336,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Technology fee ($100/month): $1,200 gone" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 337,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Agent net: $62,200" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 338,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 332,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H3, { children: "100% Commission with Flat Fee" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 341,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(UL, { children: [
    /* @__PURE__ */ jsxDEV("li", { children: "Gross commissions: $100,000" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 343,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Monthly flat fee ($98/month): $1,176 gone" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 344,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Transaction fees: $0" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 345,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Technology/CRM fee: $0 (included)" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 346,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Agent net: $98,824" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 347,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 342,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "The difference in identical production is $36,624 per year." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 350,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "That number scales with volume. An agent closing 20 deals keeps over $70,000 more annually under a flat-fee model compared to a traditional 70/30 split with standard layered fees." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 351,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Which Companies Offer 100% Commission in the US" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 356,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Several national brokerages operate on this model with different fee structures:" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 357,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "eXp Realty runs an 80/20 split until the agent hits a $16,000 annual cap, then pays 100% for the rest of the year. The monthly fee is $85 with a startup cost of $149." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 358,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Real Broker uses an 85/15 split capped at $12,000 annually, then 100%. No monthly fee but a $250 charge taken from each of the first three closings per year." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 362,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Fathom Realty offers a 7% split with a $9,000 cap on its core plan. Monthly fee of $75 with a $350 minimum transaction fee." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 366,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "HomeSmart and Realty ONE Group operate as true flat-fee brokerages with 100% of the first deal." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 370,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: [
    "United Estates Realty offers 100% commission from day one with a flat",
    " ",
    /* @__PURE__ */ jsxDEV(Internal, { to: "/pricing", children: "$98 monthly fee" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 373,
      columnNumber: 7
    }, void 0),
    " and zero transaction fees, making it one of the most straightforward cost structures available."
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 371,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "How to Join a 100% Commission Brokerage" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 377,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "The process is simpler than most agents expect. Steps typically include:" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 378,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(UL, { children: [
    /* @__PURE__ */ jsxDEV("li", { children: "Hold an active real estate license in your state" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 380,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Submit a license transfer request from your current brokerage" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 381,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Complete onboarding paperwork and pay any startup or first-month fee" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 382,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Access your CRM and transaction tools" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 383,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 379,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "At United Estates Realty, the process is fully digital. There are no in-person requirements, and license transfers are processed within a few business days." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 385,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "What Are the Benefits of a 100% Commission Brokerage" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 390,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Higher net income on every deal. The flat fee does not scale with your commission size. A $20,000 commission costs the same in brokerage fees as a $5,000 one, which means high-value deals stay high-value." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 391,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Predictable costs every month. A fixed monthly fee makes business planning straightforward. There are no surprise charges after closing and no variable costs tied to transaction volume." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 395,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Full control over your brand. Agents at flat-fee brokerages operate their own business under their own name without being tied to a corporate identity that benefits the brokerage more than the agent." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 399,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "CRM and tools included. At United Estates Realty, the monthly fee covers a full CRM, so agents are not assembling a separate technology stack on top of brokerage costs." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 403,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "No income cap. In a split model, earning more means giving more to the brokerage. In a flat-fee model, every additional dollar of production stays with the agent." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 407,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Who the Flat-Fee Model Is Best For" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 412,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "The 100% commission model delivers the most value for agents who are already generating their own leads and closing deals consistently. Agents consistently closing 15 or more transactions per year, who are entirely self-sufficient and have an established client base and referral network, get the clearest financial benefit." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 413,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "For agents in their first year who need hands-on mentorship and structured training, a traditional brokerage may provide more developmental support. The key question is whether the guidance offered is genuinely valuable enough to justify the split over time." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 418,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Once an agent has developed their systems and client base, the flat-fee model is the straightforward financial choice." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 423,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV("section", { className: "mt-16", children: /* @__PURE__ */ jsxDEV(Faq, { eyebrow: "FAQ", heading: "Frequently Asked Questions", items: COMMISSION_FAQ }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 426,
    columnNumber: 7
  }, void 0) }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 425,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: [
    "At United Estates Realty, we built the simplest flat-fee structure we could: $98 per month, zero transaction fees, and a full CRM included. If you are evaluating your options, the full details are at",
    " ",
    /* @__PURE__ */ jsxDEV(Internal, { to: "/", children: "unitedestatesagent" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 432,
      columnNumber: 7
    }, void 0),
    "."
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 429,
    columnNumber: 5
  }, void 0)
] }, void 0, true, {
  fileName: "/dev-server/src/data/blogPosts.tsx",
  lineNumber: 262,
  columnNumber: 3
}, void 0);
const CrmArticle = () => /* @__PURE__ */ jsxDEV(Fragment, { children: [
  /* @__PURE__ */ jsxDEV(P, { children: "Most real estate agents pick a CRM the wrong way." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 439,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "They scroll through a list of names. They pick the one with the most features. They pay for a subscription and spend three weeks trying to figure out how to use it. By month two, they are back to managing leads in a spreadsheet." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 442,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "The problem is not the CRM. The problem is that nobody told them what to actually look for before choosing one." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 445,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "This guide fixes that. We cover the features that separate useful CRMs from expensive ones and answer the questions agents ask most before making a decision." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 448,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV("figure", { className: "mt-8", children: /* @__PURE__ */ jsxDEV(
    "img",
    {
      src: blogImage2.url,
      alt: "Real estate CRM software dashboard for agents showing lead management, sales pipeline tracking, property listings, client follow-ups, and mobile real estate brokerage tools",
      className: "w-full rounded-lg",
      loading: "eager"
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 453,
      columnNumber: 7
    },
    void 0
  ) }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 452,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "What a Real Estate CRM Actually Does" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 461,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "A CRM is not a contact book. It is the operational center of your entire business." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 462,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "A real estate CRM helps you manage all the facets of a customer's buying journey. The right platform makes it easier to stay in touch with clients and automates tasks that free up valuable time." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 465,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Every lead you receive has a journey from first contact to closed deal. A CRM tracks that journey, reminds you when to follow up, automates routine outreach and keeps your pipeline organized without you manually managing every step." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 468,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "In 2026, the importance of a CRM extends well beyond simple organization. A powerful real estate CRM gives you ownership of your data. Unlike leads generated through third-party portals, where you compete with multiple agents for the same contact, the data in your CRM is exclusively yours. It allows you to build a sustainable business asset that you can nurture over the years, independent of any single platform." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 471,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "That distinction matters enormously for independent agents who cannot afford to lose leads to slow response times or disorganized pipelines." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 474,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Top Features to Look for in a Real Estate CRM" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 478,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Not every feature on a pricing page is worth paying for. These are the ones that actually affect how many deals you close." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 479,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H3, { children: "Lead Management" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 481,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "A great CRM should help you capture, organize and prioritize leads. Look for a tool that allows you to automatically import leads from multiple sources, including your website and social media. It should let you tag, categorize and filter leads by urgency or location and create follow-up reminders that keep nothing from slipping through the cracks." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 482,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H3, { children: "Automation" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 486,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Automation saves hours of repetitive work. The right CRM should offer drip campaigns to nurture leads over time, automated follow-up reminders and notifications, and the ability to send bulk emails and texts without manual effort each time." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 487,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H3, { children: "Mobile App Support" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 491,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "A full-featured mobile app is one of the most critical features for real estate agents in 2026. Agents work in the field. A CRM that only functions well on a desktop is not used consistently, and inconsistency is where deals get lost." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 492,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: [
    "Where to find CRMs with strong mobile app support: Follow Up Boss, Wise Agent and Sierra Interactive all offer dedicated mobile apps. ",
    /* @__PURE__ */ jsxDEV(Internal, { to: "/", children: "United Estates Realty" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 496,
      columnNumber: 141
    }, void 0),
    " includes CRM access built into its agent platform, so agents are not paying for a separate mobile subscription on top of brokerage costs."
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 495,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H3, { children: "MLS Integration" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 499,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "MLS integration means your CRM connects directly to your multiple listing service feed. Instead of manually importing property details, your CRM automatically pulls listing updates, property status and syncs listing data into your database. This saves time, reduces data entry errors and improves efficiency across your entire workflow." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 500,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Top Producer offers direct MLS integration with over 320 boards, a feature many CRMs do not include. It allows agents to create and send property alerts, including price changes and just-listed updates, right from within the platform." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 503,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H3, { children: "Custom Workflows" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 507,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Sales pipeline management is the process of managing the sequence of steps a prospect goes through until a deal is finalized. Your CRM should make it easy to build multiple pipelines with their own unique deal stages to match how your specific business operates, rather than forcing you into a rigid structure someone else designed." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 508,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Every agency runs differently. A CRM that cannot be customized forces you to change your process to match its limitations rather than the other way around. Look for platforms that allow you to build and modify workflows without needing a developer." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 511,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Which CRM Works Best for Independent Real Estate Agents" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 515,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Independent agents have different priorities from large teams. They need affordability, simplicity and tools that work from day one without a two-week onboarding process." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 516,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Wise Agent is an affordable and easy-to-use CRM with a strong focus on time management and productivity. Its automated workflows streamline daily tasks, drip campaigns keep agents top of mind with leads and transaction management tools track the progress of every deal. It is a no-frills CRM that gets the job done and its clean interface makes it a strong fit for solo agents who need functionality without complexity." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 519,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: [
    "For agents who want a CRM included as part of their brokerage rather than as a separate monthly expense, United Estates Realty bundles a full CRM into its ",
    /* @__PURE__ */ jsxDEV(Internal, { to: "/pricing", children: "$98 flat monthly fee" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 523,
      columnNumber: 162
    }, void 0),
    ". That means no separate subscription, no setup cost and no technology fee on top of brokerage costs. For independent agents watching their overhead, that structure removes one of the biggest recurring expenses from the equation entirely."
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 522,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(H2, { children: "Can You Customize a CRM for Your Agency's Unique Workflows" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 526,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Yes, but not every platform makes it easy." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 527,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "Modern CRM systems are specifically designed to address the unique needs of real estate professionals, offering features like lead management, automation, customization, integration and scalability. The baseline expectation for what a CRM should do has gone up significantly in 2026." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 530,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "When evaluating customization, ask three direct questions before signing up:" }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 533,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(UL, { children: [
    /* @__PURE__ */ jsxDEV("li", { children: "Can you build multiple pipelines with different stages?" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 537,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Can you create your own automated follow-up sequences without technical help?" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 538,
      columnNumber: 7
    }, void 0),
    /* @__PURE__ */ jsxDEV("li", { children: "Can you add custom fields to contact records to capture information specific to your market?" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 539,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 536,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: "If the answer to any of those is no or requires an upgrade to a higher-tier plan, that is a meaningful limitation for an agency with workflows that do not fit a generic template." }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 541,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV("section", { className: "mt-16", children: /* @__PURE__ */ jsxDEV(Faq, { eyebrow: "FAQ", heading: "Frequently Asked Questions", items: CRM_FAQ }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 546,
    columnNumber: 7
  }, void 0) }, void 0, false, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 545,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(P, { children: [
    "At United Estates Realty, we include a full ",
    /* @__PURE__ */ jsxDEV(Internal, { to: "/software", children: "CRM" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 550,
      columnNumber: 51
    }, void 0),
    " as part of the flat $98 monthly fee because we believe agents should not have to choose between a good brokerage and good tools. If you want to see how the platform works, visit ",
    /* @__PURE__ */ jsxDEV(Internal, { to: "/", children: "unitedestatesagent" }, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 550,
      columnNumber: 269
    }, void 0),
    "."
  ] }, void 0, true, {
    fileName: "/dev-server/src/data/blogPosts.tsx",
    lineNumber: 549,
    columnNumber: 5
  }, void 0)
] }, void 0, true, {
  fileName: "/dev-server/src/data/blogPosts.tsx",
  lineNumber: 438,
  columnNumber: 3
}, void 0);
const blogPosts = [
  {
    slug: "100-commission-vs-traditional-split-2026",
    title: "100% Commission vs Traditional Split: 2026 Guide",
    description: "See what agents actually take home in 2026 after splits and fees. We compare 100% commission vs traditional brokerage models with real numbers and clear math.",
    excerpt: "After splits, desk fees, and transaction charges, agents typically keep just 35–55% of gross commission. Here's the real math on both models in 2026.",
    date: "2026-06-19",
    readMinutes: 8,
    author: "United Estates Realty",
    image: blogImage1.url,
    content: /* @__PURE__ */ jsxDEV(CommissionArticle, {}, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 567,
      columnNumber: 14
    }, void 0),
    faq: COMMISSION_FAQ
  },
  {
    slug: "best-crm-for-real-estate-agents-2026",
    title: "Best CRM for Real Estate Agents in 2026",
    description: "Not all real estate CRMs are worth the price. We break down the top features agents need in 2026 so you can choose the right tool without wasting time or money.",
    excerpt: "Not every feature on a pricing page is worth paying for. Here are the CRM features that actually affect how many deals you close in 2026.",
    date: "2026-06-20",
    readMinutes: 8,
    author: "United Estates Realty",
    image: blogImage2.url,
    imageAlt: "Real estate CRM software dashboard for agents showing lead management, sales pipeline tracking, property listings, client follow-ups, and mobile real estate brokerage tools",
    content: /* @__PURE__ */ jsxDEV(CrmArticle, {}, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 582,
      columnNumber: 14
    }, void 0),
    faq: CRM_FAQ
  },
  {
    slug: "how-to-choose-real-estate-brokerage-2026",
    title: "How to Choose a Real Estate Brokerage in 2026: The Complete Checklist for Agents",
    description: "Use this checklist to compare real estate brokerages in 2026. Learn what fees to ask about, how to evaluate support, and what actually matters before signing.",
    excerpt: "Picking the right brokerage determines your income, tools, and support for years. Here is the complete checklist every agent should use in 2026.",
    date: "2026-06-22",
    readMinutes: 9,
    author: "United Estates Realty",
    image: blogImage3.url,
    imageAlt: "Real estate agent reviewing brokerage options, commission structures, support resources, and training programs before choosing a real estate brokerage in 2026",
    content: /* @__PURE__ */ jsxDEV(BrokerageArticle, {}, void 0, false, {
      fileName: "/dev-server/src/data/blogPosts.tsx",
      lineNumber: 598,
      columnNumber: 14
    }, void 0),
    faq: BROKERAGE_FAQ
  }
];
function getBlogPost(slug) {
  return blogPosts.find((p) => p.slug === slug);
}
const buttonVariants = cva(
  "inline-flex min-w-0 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-sm font-semibold leading-none tracking-[-0.01em] ring-offset-background transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-[busy=true]:cursor-wait active:translate-y-px [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-surface hover:bg-primary/92",
        destructive: "bg-destructive text-destructive-foreground shadow-surface hover:bg-destructive/92",
        outline: "border-input bg-background text-foreground shadow-surface hover:border-foreground/18 hover:bg-accent/65",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/88",
        ghost: "text-foreground hover:bg-accent/75 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3.5 text-[13px]",
        lg: "h-11 px-5 text-[15px]",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = React.forwardRef(
  ({ className, variant, size: size2, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxDEV(Comp, { className: cn(buttonVariants({ variant, size: size2, className })), ref, ...props }, void 0, false, {
      fileName: "/dev-server/src/components/ui/button.tsx",
      lineNumber: 42,
      columnNumber: 12
    }, void 0);
  }
);
Button.displayName = "Button";
const SITE_URL = "https://unitedestatesagent.com";
const DEFAULT_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ea1221eb-a238-4087-9d8a-e039199b22b7/id-preview-b44d7743--c987c87c-e16f-4694-9045-0ccdf362905d.lovable.app-1773887688710.png";
function SeoHead({ title, description, path, image = DEFAULT_IMAGE, structuredData }) {
  const url2 = `${SITE_URL}${path}`;
  return /* @__PURE__ */ jsxDEV(Head, { children: [
    /* @__PURE__ */ jsxDEV("title", { children: title }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 18,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("meta", { name: "description", content: description }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 19,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("link", { rel: "canonical", href: url2 }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 20,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("meta", { property: "og:title", content: title }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 21,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("meta", { property: "og:description", content: description }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 22,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("meta", { property: "og:url", content: url2 }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("meta", { property: "og:image", content: image }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 24,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("meta", { name: "twitter:title", content: title }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 25,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("meta", { name: "twitter:description", content: description }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 26,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("meta", { name: "twitter:image", content: image }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this),
    structuredData && /* @__PURE__ */ jsxDEV("script", { type: "application/ld+json", children: JSON.stringify(structuredData) }, void 0, false, {
      fileName: "/dev-server/src/components/SeoHead.tsx",
      lineNumber: 29,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/SeoHead.tsx",
    lineNumber: 17,
    columnNumber: 5
  }, this);
}
const HOME_FAQ_ITEMS = [
  {
    question: "What is a 100% commission brokerage, and how does it work?",
    answer: "A 100% commission brokerage lets licensed real estate agents keep every dollar they earn from every deal, no commission splits, no desk fees, no deductions. At United Estates Realty, you pay one simple monthly fee and walk away from every closing with your full commission. It is the most profitable way for real estate agents to do business."
  },
  {
    question: "How does United Estates Realty make money if agents keep 100%?",
    answer: "Simply, we charge a low flat monthly membership fee instead of taking a cut of your commissions. No splits, no transaction fees, no hidden charges. You keep 100% of every commission you earn, every single time."
  },
  {
    question: "Is United Estates Realty available in my state?",
    answer: "United Estates Realty is currently serving licensed real estate agents across Florida, from Miami, Orlando, Tampa, Jacksonville, and Fort Lauderdale. Nationwide expansion to Texas, Georgia, New York, and California is coming soon. Join today and start keeping 100% of your commissions."
  },
  {
    question: "Can a new real estate agent join United Estates Realty?",
    answer: "Yes, United Estates Realty welcomes both newly licensed agents looking to hang their license and experienced agents tired of losing thousands in commission splits. No experience minimum, no production requirements. Just a better, more profitable brokerage for every Florida real estate agent."
  },
  {
    question: "Does United Estates Realty charge any transaction fees?",
    answer: "Zero transaction fees guaranteed. No per-deal charges, no closing fees, no E&O fees per transaction. You close the deal, you keep the full commission. Combined with our 100% commission structure, Florida agents save thousands every year compared to a traditional brokerage."
  }
];
const whyUs = [
  {
    heading: "Keep 100% of your commission.",
    body: "Every dollar of your commission split stays with you. We don't touch it. No transaction fees, no royalty cuts, no per-deal charges - ever. Close a $10,000 commission, keep $10,000."
  },
  {
    heading: "$98 a month. Nothing else.",
    body: "One flat monthly fee is all you pay. No desk fees on top. No E&O add-ons. No hidden charges when you close a big deal. Just $98, every month, and that's the entire cost of your brokerage."
  },
  {
    heading: "Software built for agents.",
    body: "Manage your listings, contracts, contacts, tasks, and marketing from one place. Built for how agents actually work, not how a vendor imagined it."
  },
  {
    heading: "Earn from referrals.",
    body: "Refer a fellow agent and earn $20 every month they stay active. No cap, no expiration - it compounds as your network grows."
  }
];
const softwareFeatures$1 = [
  "Transaction management & checklists",
  "Contact and client CRM",
  "Listing pipeline and status tracking",
  "Marketing asset builder",
  "Task management and reminders",
  "Document storage and PDF access",
  "Calendar and deadline tracking",
  "Referral program with live earnings dashboard"
];
function Index() {
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";
  const [showProductHunt, setShowProductHunt] = useState(true);
  useEffect(() => {
    const dismissed = localStorage.getItem("productHuntDismissed");
    if (dismissed === "1") setShowProductHunt(false);
  }, []);
  const dismissProductHunt = () => {
    setShowProductHunt(false);
    localStorage.setItem("productHuntDismissed", "1");
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "United Estates Realty — Florida's 100% Commission Brokerage",
        description: "Join Florida's top flat-fee brokerage. Licensed agents keep 100% of every commission for just $98/month. No splits, no transaction fees, no desk fees.",
        path: "/"
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 86,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("header", { className: "sticky top-0 z-40 border-b bg-background", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "flex items-center", "aria-label": "United Estates Realty", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 188, className: "w-[65px] sm:w-[132px] lg:w-[168px]" }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 94,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 93,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "transition-colors hover:text-primary", children: "Home" }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 98,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "transition-colors hover:text-primary", children: "Why Us" }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 99,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "transition-colors hover:text-primary", children: "Case Studies" }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 100,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("a", { href: "/pricing", className: "transition-colors hover:text-primary", children: "Pricing" }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 101,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("a", { href: "/software", className: "transition-colors hover:text-primary", children: "Software" }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 102,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 97,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "hidden md:flex md:items-center md:gap-2", children: [
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", asChild: true, className: "px-2.5 sm:px-4", children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", children: "Agent Login" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 108,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 107,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 111,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 110,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 106,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { asChild: true, size: "sm", className: "md:hidden", children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 115,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 114,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Sheet, { children: [
          /* @__PURE__ */ jsxDEV(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "md:hidden", "aria-label": "Open menu", children: /* @__PURE__ */ jsxDEV(Menu, { className: "h-6 w-6" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 120,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 119,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 118,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(SheetContent, { side: "right", className: "w-72", children: /* @__PURE__ */ jsxDEV("nav", { className: "mt-8 flex flex-col gap-1 text-base", children: [
            /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 125,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 126,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 127,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "/pricing", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 128,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "/software", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Software" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 129,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 130,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, className: "mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: primaryLabel }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 131,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 124,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 123,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 117,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 105,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Index.tsx",
      lineNumber: 92,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Index.tsx",
      lineNumber: 91,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { children: [
      /* @__PURE__ */ jsxDEV("section", { className: "relative overflow-hidden", children: /* @__PURE__ */ jsxDEV("div", { className: "relative min-h-[60vh] sm:min-h-[78vh]", children: [
        /* @__PURE__ */ jsxDEV("picture", { children: [
          /* @__PURE__ */ jsxDEV(
            "source",
            {
              media: "(max-width: 767px)",
              srcSet: "/home-hero-mobile.webp",
              type: "image/webp"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 144,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV("source", { srcSet: "/home-hero.webp", type: "image/webp" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 149,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(
            "img",
            {
              src: "/home-hero-opt.jpg",
              alt: "United Estates Realty",
              width: 1600,
              height: 1067,
              fetchPriority: "high",
              decoding: "async",
              className: "absolute inset-0 h-full w-full object-cover"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 150,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 143,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: "absolute inset-0",
            style: {
              backgroundImage: "linear-gradient(180deg, rgba(8,15,29,0.52) 0%, rgba(8,15,29,0.68) 50%, rgba(8,15,29,0.82) 100%), linear-gradient(90deg, rgba(8,15,29,0.88) 0%, rgba(8,15,29,0.60) 45%, rgba(8,15,29,0.20) 100%)"
            }
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 160,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("div", { className: "relative mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-8 sm:min-h-[78vh] sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pb-24", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-white/70", children: "United Estates Realty - Licensed Brokerage" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 169,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("h1", { className: "mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[3.25rem]", children: "Stop Giving Away Your Commissions. Keep 100% and zero transaction fees." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 172,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg", children: "Get the best real estate CRM and brokerage platform for just $98/month. One flat fee, no per-seat pricing, no add-ons, no commission splits. Everything you need to close more deals in one place." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 175,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-8 flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsxDEV(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: [
              primaryLabel,
              /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
                fileName: "/dev-server/src/pages/Index.tsx",
                lineNumber: 183,
                columnNumber: 23
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 181,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 180,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(
              Button,
              {
                size: "lg",
                variant: "outline",
                asChild: true,
                className: "border-white/40 bg-white/10 text-white hover:bg-white/18 hover:text-white",
                children: /* @__PURE__ */ jsxDEV("a", { href: "/pricing", children: "See Pricing" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Index.tsx",
                  lineNumber: 192,
                  columnNumber: 21
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Index.tsx",
                lineNumber: 186,
                columnNumber: 19
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 179,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 168,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 167,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 142,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 141,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "border-b bg-muted/40", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto grid max-w-6xl divide-y px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8", children: [
        { stat: "100%", label: "Commission you keep" },
        { stat: "$98", label: "Flat monthly fee" },
        { stat: "$0", label: "Transaction fees" }
      ].map(({ stat, label }) => /* @__PURE__ */ jsxDEV("div", { className: "px-6 py-8 text-center", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-4xl font-bold text-primary", children: stat }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 209,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-sm font-medium text-muted-foreground", children: label }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 210,
          columnNumber: 17
        }, this)
      ] }, label, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 208,
        columnNumber: 15
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 202,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 201,
        columnNumber: 9
      }, this),
      showProductHunt && /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: "fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6",
          style: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
          },
          children: /* @__PURE__ */ jsxDEV(
            "div",
            {
              style: {
                position: "relative",
                border: "1px solid rgb(224, 224, 224)",
                borderRadius: 12,
                padding: 20,
                maxWidth: 340,
                width: "calc(100vw - 2rem)",
                background: "rgb(255, 255, 255)",
                boxShadow: "rgba(0, 0, 0, 0.08) 0px 4px 20px"
              },
              children: [
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    type: "button",
                    onClick: dismissProductHunt,
                    "aria-label": "Dismiss Product Hunt card",
                    className: "absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600",
                    children: /* @__PURE__ */ jsxDEV(X, { className: "h-4 w-4" }, void 0, false, {
                      fileName: "/dev-server/src/pages/Index.tsx",
                      lineNumber: 242,
                      columnNumber: 17
                    }, this)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Index.tsx",
                    lineNumber: 236,
                    columnNumber: 15
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12, paddingRight: 24 }, children: [
                  /* @__PURE__ */ jsxDEV(
                    "img",
                    {
                      alt: "United Estates Realty",
                      src: "https://ph-files.imgix.net/8cd75457-2c51-461c-ae53-11c822e655f4.png?auto=compress,format&codec=mozjpeg&cs=strip&fit=crop&h=80&w=80",
                      style: { width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/Index.tsx",
                      lineNumber: 246,
                      columnNumber: 17
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV("div", { style: { flex: "1 1 0%", minWidth: 0 }, children: [
                    /* @__PURE__ */ jsxDEV(
                      "h3",
                      {
                        style: {
                          margin: 0,
                          fontSize: 16,
                          fontWeight: 600,
                          color: "rgb(26, 26, 26)",
                          lineHeight: 1.3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        },
                        children: "United Estates Realty"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/Index.tsx",
                        lineNumber: 252,
                        columnNumber: 19
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV(
                      "p",
                      {
                        style: {
                          margin: "4px 0px 0px",
                          fontSize: 13,
                          color: "rgb(102, 102, 102)",
                          lineHeight: 1.4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical"
                        },
                        children: "Keep 100% of your real estate commission"
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/Index.tsx",
                        lineNumber: 266,
                        columnNumber: 19
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/Index.tsx",
                    lineNumber: 251,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Index.tsx",
                  lineNumber: 245,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV(
                  "a",
                  {
                    href: "https://www.producthunt.com/products/united-estates-realty?embed=true&utm_source=embed&utm_medium=post_embed",
                    target: "_blank",
                    rel: "noopener noreferrer",
                    style: {
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "8px 14px",
                      background: "rgb(255, 97, 84)",
                      color: "rgb(255, 255, 255)",
                      textDecoration: "none",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600
                    },
                    children: "Check it out on Product Hunt →"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Index.tsx",
                    lineNumber: 283,
                    columnNumber: 15
                  },
                  this
                )
              ]
            },
            void 0,
            true,
            {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 224,
              columnNumber: 13
            },
            this
          )
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 218,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Why Agents Join" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 310,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "A brokerage built around the agent, not around the office overhead." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 311,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Most brokerages charge you a monthly fee and then take a cut of every deal on top of it. We don't. One flat fee, real software, and you keep your commissions." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 314,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 309,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-12 grid gap-8 md:grid-cols-2", children: whyUs.map(({ heading, body }) => /* @__PURE__ */ jsxDEV("div", { className: "border-l-2 border-primary pl-6", children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-semibold text-foreground", children: heading }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 322,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-sm leading-6 text-muted-foreground", children: body }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 323,
            columnNumber: 19
          }, this)
        ] }, heading, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 321,
          columnNumber: 17
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 319,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 308,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 307,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { id: "pricing", className: "border-y bg-muted/30 py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Pricing" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 334,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Simple pricing. No surprises." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 335,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "One plan. Every agent pays the same flat monthly rate and gets full access to everything - software, support, and the brokerage." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 338,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 333,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-10 max-w-md", children: /* @__PURE__ */ jsxDEV("div", { className: "border-2 border-primary bg-background p-8", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: "Agent Membership" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 345,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex items-end gap-2", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-5xl font-bold text-foreground", children: "$98" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 347,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "mb-1 text-lg text-muted-foreground", children: "/ month" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 348,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 346,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-sm text-muted-foreground", children: "No transaction fees. No desk fees. No royalties." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 350,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-8 space-y-3", children: [
            "Keep 100% of your commission - every closing, no exceptions",
            "No transaction fees. Not $100. Not $50. Zero.",
            "Licensed brokerage - hang your license here",
            "Full transaction management software included",
            "CRM, listings, marketing, and calendar tools",
            "Referral program - earn $20/mo per active agent you refer",
            "Brokerage support and compliance"
          ].map((item) => /* @__PURE__ */ jsxDEV("li", { className: "flex items-start gap-3 text-sm", children: [
            /* @__PURE__ */ jsxDEV(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 363,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-foreground", children: item }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 364,
              columnNumber: 23
            }, this)
          ] }, item, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 362,
            columnNumber: 21
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 352,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: /* @__PURE__ */ jsxDEV(Button, { asChild: true, size: "lg", className: "w-full", children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", children: [
            "Join United Estates Realty",
            /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 373,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 371,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 370,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 369,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 344,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 343,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 332,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 331,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { id: "software", className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "grid gap-12 lg:grid-cols-2 lg:items-center", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "The Software" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 387,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Everything you need to run your business, built in." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 388,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Your membership includes full access to the United Estates Realty agent platform. Not a third-party tool - our own software, built specifically for how agents work." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 391,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: /* @__PURE__ */ jsxDEV(Button, { asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", children: [
            "Get Started",
            /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 398,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 396,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 395,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 394,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 386,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: softwareFeatures$1.map((feature) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-3 border bg-muted/30 px-4 py-3", children: [
          /* @__PURE__ */ jsxDEV(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 407,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-sm text-foreground", children: feature }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 408,
            columnNumber: 21
          }, this)
        ] }, feature, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 406,
          columnNumber: 19
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 404,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 385,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 384,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 383,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "border-y bg-muted/40 py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "grid gap-10 lg:grid-cols-2 lg:items-center", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Referral Program" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 421,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Refer an agent. Earn every month they stay." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 422,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Every agent you refer to United Estates Realty earns you $20 per month for as long as they keep their license here. Refer five agents and that's $100 a month - more than covering your own membership." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 425,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "There's no cap, no expiration, and no approval process. Share your referral link and the tracking is automatic." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 428,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 420,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
          { step: "01", text: "Get your unique referral link from your agent dashboard." },
          { step: "02", text: "Share it with any licensed agent looking for a better brokerage." },
          { step: "03", text: "Earn $20 every month they stay active - automatically." }
        ].map(({ step, text }) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-5 border bg-background px-5 py-4", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "mt-0.5 min-w-[2rem] text-sm font-bold text-primary", children: step }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 439,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm leading-6 text-foreground", children: text }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 440,
            columnNumber: 21
          }, this)
        ] }, step, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 438,
          columnNumber: 19
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 432,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 419,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 418,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 417,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-6 border-l-2 border-primary pl-6 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "max-w-xl", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Coming Soon" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 453,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-2 text-2xl font-bold text-foreground sm:text-3xl", children: "Agent training, built into the platform." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 454,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-base leading-7 text-muted-foreground", children: "We're building out a full training library for United Estates Realty agents — contracts, compliance, prospecting, and how to get the most out of the software. It'll be included with your membership, no extra cost." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 457,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 452,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "shrink-0", children: /* @__PURE__ */ jsxDEV("span", { className: "inline-block border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary", children: "Training Coming Soon" }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 462,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 461,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 451,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 450,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 449,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "border-b bg-muted/40 py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV(
        Faq,
        {
          eyebrow: "FAQ",
          heading: "Questions agents ask before they join.",
          items: HOME_FAQ_ITEMS
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 473,
          columnNumber: 13
        },
        this
      ) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 472,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 471,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "py-16 text-white sm:py-20", style: { backgroundColor: "hsl(var(--sidebar-bg))" }, children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-3xl font-bold sm:text-4xl", children: "Stop giving away your commission. Join a brokerage that lets you keep it." }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 485,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-white/80", children: "100% commission. $98 a month flat. No transaction fees. No surprises. Join United Estates Realty today." }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 488,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxDEV(Button, { asChild: true, size: "lg", className: "bg-background text-foreground hover:bg-background/90", children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", children: [
            "Join the Brokerage",
            /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 495,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 493,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 492,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              asChild: true,
              size: "lg",
              variant: "outline",
              className: "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", children: "Agent Login" }, void 0, false, {
                fileName: "/dev-server/src/pages/Index.tsx",
                lineNumber: 504,
                columnNumber: 19
              }, this)
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 498,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 491,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 484,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 483,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 482,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Index.tsx",
      lineNumber: 139,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("footer", { className: "border-t bg-background py-12", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-10 md:grid-cols-4 md:items-start", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV(UERLogo, { width: 160 }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 516,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "max-w-xs text-sm leading-6 text-muted-foreground", children: "A full-service licensed real estate brokerage. 100% commission, $98 a month, zero transaction fees." }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 517,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 515,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Explore" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 523,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "text-muted-foreground transition-colors hover:text-primary", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 525,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 525,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "text-muted-foreground transition-colors hover:text-primary", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 526,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 526,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "text-muted-foreground transition-colors hover:text-primary", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 527,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 527,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "/pricing", className: "text-muted-foreground transition-colors hover:text-primary", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 528,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 528,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/blog", className: "text-muted-foreground transition-colors hover:text-primary", children: "Blog" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 529,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 529,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 524,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 522,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Agents" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 534,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "/software", className: "text-muted-foreground transition-colors hover:text-primary", children: "Software" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 536,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 536,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "text-muted-foreground transition-colors hover:text-primary", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 537,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 537,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", className: "text-muted-foreground transition-colors hover:text-primary", children: "Sign Up" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 538,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 538,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 535,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 533,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Follow Us" }, void 0, false, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 543,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "#",
                "aria-label": "Facebook",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsxDEV(Facebook, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Index.tsx",
                  lineNumber: 550,
                  columnNumber: 19
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Index.tsx",
                lineNumber: 545,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "#",
                "aria-label": "LinkedIn",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsxDEV(Linkedin, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Index.tsx",
                  lineNumber: 557,
                  columnNumber: 19
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Index.tsx",
                lineNumber: 552,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "#",
                "aria-label": "Instagram",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsxDEV(Instagram, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Index.tsx",
                  lineNumber: 564,
                  columnNumber: 19
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Index.tsx",
                lineNumber: 559,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "#",
                "aria-label": "TikTok",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsxDEV("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: "h-4 w-4", "aria-hidden": "true", children: /* @__PURE__ */ jsxDEV("path", { d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52V7.08a4.85 4.85 0 0 1-1.84-.39z" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Index.tsx",
                  lineNumber: 572,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/Index.tsx",
                  lineNumber: 571,
                  columnNumber: 19
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Index.tsx",
                lineNumber: 566,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 544,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Email Us" }, void 0, false, {
              fileName: "/dev-server/src/pages/Index.tsx",
              lineNumber: 578,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "mailto:brokerage@unitedestatesagent.com",
                className: "mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary",
                children: "brokerage@unitedestatesagent.com"
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Index.tsx",
                lineNumber: 579,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Index.tsx",
            lineNumber: 577,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 542,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 514,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " United Estates Realty. Licensed Real Estate Brokerage."
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 590,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Equal Housing Opportunity" }, void 0, false, {
          fileName: "/dev-server/src/pages/Index.tsx",
          lineNumber: 593,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Index.tsx",
        lineNumber: 589,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Index.tsx",
      lineNumber: 513,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Index.tsx",
      lineNumber: 512,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Index.tsx",
    lineNumber: 85,
    columnNumber: 5
  }, this);
}
const tevelFounder = "/assets/tevel-founder-BenHEmtK.webp";
const WHY_US_FAQ_ITEMS = [
  {
    question: "What is a 100% commission brokerage, and how does it work?",
    answer: "A 100% commission brokerage lets licensed real estate agents keep every dollar they earn from every deal, no commission splits, no desk fees, no deductions. At United Estates Realty, you pay one simple monthly fee and walk away from every closing with your full commission. It is the most profitable way for real estate agents to do business."
  },
  {
    question: "How does United Estates Realty make money if agents keep 100%?",
    answer: "Simply, we charge a low flat monthly membership fee instead of taking a cut of your commissions. No splits, no transaction fees, no hidden charges. You keep 100% of every commission you earn, every single time."
  },
  {
    question: "Is United Estates Realty available in my state?",
    answer: "United Estates Realty is currently serving licensed real estate agents across Florida, from Miami, Orlando, Tampa, Jacksonville, and Fort Lauderdale. Nationwide expansion to Texas, Georgia, New York, and California is coming soon. Join today and start keeping 100% of your commissions."
  },
  {
    question: "Can a new real estate agent join United Estates Realty?",
    answer: "Yes, United Estates Realty welcomes both newly licensed agents looking to hang their license and experienced agents tired of losing thousands in commission splits. No experience minimum, no production requirements. Just a better, more profitable brokerage for every Florida real estate agent."
  },
  {
    question: "Does United Estates Realty charge any transaction fees?",
    answer: "Zero transaction fees guaranteed. No per-deal charges, no closing fees, no E&O fees per transaction. You close the deal, you keep the full commission. Combined with our 100% commission structure, Florida agents save thousands every year compared to a traditional brokerage."
  }
];
const differentiators = [
  {
    icon: Zap,
    heading: "100% Commission. Every Deal.",
    body: "Close a $10,000 commission, keep $10,000. No splits, no royalty cuts, no per-deal charges. Ever. We don't touch your money because we don't need to; our flat monthly fee covers everything."
  },
  {
    icon: BarChart3,
    heading: "$98/Month. Nothing Else.",
    body: "One flat fee. No E&O add-ons. No hidden charges when you close a big deal. No transaction fees of any kind. Just $98 every month and that's the entire cost of running your business under our license."
  },
  {
    icon: Users,
    heading: "Built by Agents, for Agents.",
    body: "Our platform wasn't designed by a software vendor who has never shown a house. It was built around how real estate agents actually work, from first contact to closing. Transaction management, CRM, listings, marketing, and calendar tools in one seamless system."
  },
  {
    icon: Shield,
    heading: "Licensed. Compliant. Protected.",
    body: "United Estates Realty is a fully licensed Florida brokerage. You get full brokerage support, compliance oversight, and the legal backing you need to operate with confidence. Your license hangs with a real brokerage, not a tech shell."
  },
  {
    icon: Award,
    heading: "Referral Earnings That Compound.",
    body: "Refer one agent, earn $20 every month they stay active. Refer five, that's $100/month, more than covering your own membership. No cap. No expiration. No approval gates. Your network becomes a real revenue stream."
  },
  {
    icon: Clock,
    heading: "No Long-Term Contracts.",
    body: "Stay because it works, not because you're trapped. Cancel anytime with no penalties, no clawbacks, no exit fees. We earn your business every single month by delivering real value."
  }
];
const comparisonRows = [
  { feature: "Commission split", uer: "100% — you keep it all", traditional: "50%–70% to brokerage" },
  { feature: "Monthly fee", uer: "$98 flat", traditional: "$0–$500+ desk fee" },
  { feature: "Transaction fees", uer: "$0", traditional: "$100–$500 per deal" },
  { feature: "CRM & software", uer: "Included", traditional: "$50–$200/month extra" },
  { feature: "Referral program", uer: "$20/mo per agent", traditional: "Rarely offered" },
  { feature: "Contract length", uer: "Cancel anytime", traditional: "6–12 month lock" }
];
function WhyUs() {
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "Why Florida Real Estate Agents Choose United Estates Realty",
        description: "Why Florida agents choose United Estates Realty. Keep 100% commissions, $98/month flat fee, zero transaction fees, full CRM + brokerage support. No contracts.",
        path: "/why-us"
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 93,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("header", { className: "sticky top-0 z-40 border-b bg-background", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "flex items-center", "aria-label": "United Estates Realty", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 188, className: "w-[65px] sm:w-[132px] lg:w-[168px]" }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 103,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 102,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "transition-colors hover:text-primary", children: "Home" }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 107,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "font-medium text-primary", children: "Why Us" }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 108,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "transition-colors hover:text-primary", children: "Case Studies" }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 109,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("a", { href: "/pricing", className: "transition-colors hover:text-primary", children: "Pricing" }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 110,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("a", { href: "/software", className: "transition-colors hover:text-primary", children: "Software" }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 111,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 106,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "hidden md:flex md:items-center md:gap-2", children: [
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", asChild: true, className: "px-2.5 sm:px-4", children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", children: "Agent Login" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 117,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 116,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 120,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 119,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 115,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { asChild: true, size: "sm", className: "md:hidden", children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 124,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 123,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Sheet, { children: [
          /* @__PURE__ */ jsxDEV(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "md:hidden", "aria-label": "Open menu", children: /* @__PURE__ */ jsxDEV(Menu, { className: "h-6 w-6" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 129,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 128,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 127,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(SheetContent, { side: "right", className: "w-72", children: /* @__PURE__ */ jsxDEV("nav", { className: "mt-8 flex flex-col gap-1 text-base", children: [
            /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 134,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "rounded-md px-3 py-2 font-medium text-primary transition-colors hover:bg-muted", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 135,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 136,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "/pricing", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 137,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "/software", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Software" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 138,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 139,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, className: "mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: primaryLabel }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 140,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 133,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 132,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 126,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 114,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/WhyUs.tsx",
      lineNumber: 101,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/WhyUs.tsx",
      lineNumber: 100,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { children: [
      /* @__PURE__ */ jsxDEV("section", { className: "border-b bg-muted/30 py-16 sm:py-24", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]", children: "Why Florida Real Estate Agents Choose United Estates Realty" }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 153,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg", children: "Most brokerages charge you a monthly fee and then take a cut of every deal on top of it. We don't. One flat fee, real software, and you keep every dollar you earn." }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 156,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: /* @__PURE__ */ jsxDEV(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: [
          "Join United Estates Realty",
          /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 163,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 161,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 160,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 159,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 152,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 151,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 150,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "The Difference" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 175,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Six reasons agents switch and never look back." }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 176,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 174,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3", children: differentiators.map(({ icon: Icon, heading, body }) => /* @__PURE__ */ jsxDEV("div", { className: "border bg-muted/20 p-6", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex h-10 w-10 items-center justify-center border bg-background", children: /* @__PURE__ */ jsxDEV(Icon, { className: "h-5 w-5 text-primary" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 185,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 184,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("h3", { className: "mt-4 text-lg font-semibold text-foreground", children: heading }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 187,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-sm leading-6 text-muted-foreground", children: body }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 188,
            columnNumber: 19
          }, this)
        ] }, heading, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 183,
          columnNumber: 17
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 181,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 173,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 172,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "border-y bg-muted/30 py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Comparison" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 199,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "United Estates Realty vs. traditional brokerages." }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 200,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 198,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-10 overflow-x-auto", children: /* @__PURE__ */ jsxDEV("table", { className: "w-full min-w-[520px] border-collapse text-left", children: [
          /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsxDEV("th", { className: "py-3 pr-4 text-sm font-semibold text-muted-foreground", children: "Feature" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 209,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "py-3 pr-4 text-sm font-semibold text-primary", children: "United Estates Realty" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 210,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "py-3 text-sm font-semibold text-muted-foreground", children: "Traditional Brokerage" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 211,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 208,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 207,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("tbody", { children: comparisonRows.map(({ feature, uer, traditional }) => /* @__PURE__ */ jsxDEV("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsxDEV("td", { className: "py-3 pr-4 text-sm font-medium text-foreground", children: feature }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 217,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("td", { className: "py-3 pr-4 text-sm text-foreground", children: /* @__PURE__ */ jsxDEV("span", { className: "inline-flex items-center gap-2", children: [
              /* @__PURE__ */ jsxDEV(Check, { className: "h-4 w-4 shrink-0 text-primary" }, void 0, false, {
                fileName: "/dev-server/src/pages/WhyUs.tsx",
                lineNumber: 220,
                columnNumber: 27
              }, this),
              uer
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 219,
              columnNumber: 25
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 218,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-sm text-muted-foreground", children: traditional }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 224,
              columnNumber: 23
            }, this)
          ] }, feature, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 216,
            columnNumber: 21
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 214,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 206,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 205,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 197,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 196,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Success Stories" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 237,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Real agents. Real results." }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 238,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-lg text-muted-foreground", children: "See how agents across the country are growing their business with United Estates Realty." }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 241,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 236,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-10 grid gap-6 md:grid-cols-3", children: caseStudies.map((study) => /* @__PURE__ */ jsxDEV("div", { className: "group border bg-muted/20 p-6 transition-colors hover:border-primary/50", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-muted-foreground", children: [
            study.agentName,
            ", ",
            study.city
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 249,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("h3", { className: "mt-2 text-xl font-semibold text-foreground", children: study.headlineResult }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 252,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-sm leading-6 text-muted-foreground", children: study.summary }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 255,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(
            Link,
            {
              to: `/case-studies/${study.slug}`,
              className: "mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline",
              children: [
                "Read full story",
                /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/WhyUs.tsx",
                  lineNumber: 263,
                  columnNumber: 21
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 258,
              columnNumber: 19
            },
            this
          )
        ] }, study.slug, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 248,
          columnNumber: 17
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 246,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-10", children: /* @__PURE__ */ jsxDEV(Button, { asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", children: [
          "View all case studies",
          /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 273,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 271,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 270,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 269,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 235,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 234,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "border-y bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Leadership" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 284,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Why Tevel Built This" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 285,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 283,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-10 grid items-start gap-8 md:grid-cols-[280px_1fr]", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center md:items-start", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "h-64 w-64 overflow-hidden border bg-muted/30 sm:h-72 sm:w-72", children: /* @__PURE__ */ jsxDEV(
              "img",
              {
                src: tevelFounder,
                alt: "Tevel Herbstman, Founder & Managing Broker of United Estates Realty",
                className: "h-full w-full object-cover",
                loading: "lazy"
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/WhyUs.tsx",
                lineNumber: 294,
                columnNumber: 19
              },
              this
            ) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 293,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "mt-4 text-center md:text-left", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-lg font-semibold text-foreground", children: "Tevel Herbstman" }, void 0, false, {
                fileName: "/dev-server/src/pages/WhyUs.tsx",
                lineNumber: 302,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Founder & Managing Broker" }, void 0, false, {
                fileName: "/dev-server/src/pages/WhyUs.tsx",
                lineNumber: 303,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 301,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 292,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-4 text-base leading-7 text-muted-foreground", children: [
            /* @__PURE__ */ jsxDEV("p", { children: "Tevel Herbstman was a real estate agent just like you." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 309,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: "He worked hard. He chased leads, managed clients and closed deals. And every single month, without fail, the bills came in." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 312,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: "First, the monthly subscription fees. Not cheap but fine, tools cost money. He paid." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 315,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: "Then came the transaction fees. Every deal he closed, a percentage disappeared before he even saw it. Not because he did anything wrong. Just because the platform decided it deserved a cut of his work." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 318,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: "Then came the commission split. A portion of every hard-earned commission is gone. To a company that never made a single phone call, never sat in a single meeting, never chased a single client." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 321,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: 'And if you wanted a basic feature that should have been included from day one? That was another charge. Another tier. Another "upgrade."' }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 324,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: "Tevel Herbstman looked at his earnings one evening and did the math. The subscriptions. The transaction fees. The commission cuts. The add-ons. The numbers were shocking, not because any single charge was outrageous, but because they never stopped. Every direction he turned, someone had their hand in his pocket." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 327,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: "He was not just paying to use a tool. He was paying a tax on his own success." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 330,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: "That was the moment everything changed." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 333,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { children: "Tevel Herbstman did not build United Estates Realty because he saw a market opportunity. He built it because he was furious — and he knew every agent reading this feels the same way." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 336,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "italic text-foreground", children: '"I was tired of working hard and watching my earnings disappear into fees I never agreed to. Every time I closed a deal, someone else was already waiting to take their cut. I built this because agents deserve to keep what they earn." — Tevel' }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 339,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-foreground", children: "United Estates Realty was built by an agent who got tired of paying for everything and keeping nothing. That is why we built something different — and that is why it will always stay that way." }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 342,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 308,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 290,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 282,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 281,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "border-y bg-muted/40 py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV(
        Faq,
        {
          eyebrow: "FAQ",
          heading: "Questions agents ask before they join.",
          items: WHY_US_FAQ_ITEMS
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 353,
          columnNumber: 13
        },
        this
      ) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 352,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 351,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "border-2 border-primary bg-muted/20 p-8 sm:p-12", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-3xl font-bold text-foreground sm:text-4xl", children: "Ready to keep 100% of your commissions?" }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 365,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Join the brokerage that puts agents first. No commission splits. No transaction fees. No hidden charges. Just $98 a month and a platform built to help you close more deals." }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 368,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxDEV(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: [
            primaryLabel,
            /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 375,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 373,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 372,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { size: "lg", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxDEV("a", { href: "/", children: "Back to Home" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 379,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 378,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 371,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 364,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 363,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 362,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 361,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/WhyUs.tsx",
      lineNumber: 148,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("footer", { className: "border-t bg-background py-12", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-10 md:grid-cols-4 md:items-start", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV(UERLogo, { width: 160 }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 392,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "max-w-xs text-sm leading-6 text-muted-foreground", children: "A full-service licensed real estate brokerage. 100% commission, $98 a month, zero transaction fees." }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 393,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 391,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Explore" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 399,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "text-muted-foreground transition-colors hover:text-primary", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 401,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 401,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "text-muted-foreground transition-colors hover:text-primary", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 402,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 402,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "text-muted-foreground transition-colors hover:text-primary", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 403,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 403,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "/pricing", className: "text-muted-foreground transition-colors hover:text-primary", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 404,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 404,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/blog", className: "text-muted-foreground transition-colors hover:text-primary", children: "Blog" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 405,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 405,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 400,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 398,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Agents" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 410,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "/software", className: "text-muted-foreground transition-colors hover:text-primary", children: "Software" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 412,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 412,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "text-muted-foreground transition-colors hover:text-primary", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 413,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 413,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", className: "text-muted-foreground transition-colors hover:text-primary", children: "Sign Up" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 414,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 414,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 411,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 409,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Follow Us" }, void 0, false, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 419,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "#",
                "aria-label": "Facebook",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsxDEV(Facebook, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/WhyUs.tsx",
                  lineNumber: 426,
                  columnNumber: 19
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/WhyUs.tsx",
                lineNumber: 421,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "#",
                "aria-label": "LinkedIn",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsxDEV(Linkedin, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/WhyUs.tsx",
                  lineNumber: 433,
                  columnNumber: 19
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/WhyUs.tsx",
                lineNumber: 428,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "#",
                "aria-label": "Instagram",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsxDEV(Instagram, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/WhyUs.tsx",
                  lineNumber: 440,
                  columnNumber: 19
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/WhyUs.tsx",
                lineNumber: 435,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "#",
                "aria-label": "TikTok",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsxDEV("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: "h-4 w-4", "aria-hidden": "true", children: /* @__PURE__ */ jsxDEV("path", { d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52V7.08a4.85 4.85 0 0 1-1.84-.39z" }, void 0, false, {
                  fileName: "/dev-server/src/pages/WhyUs.tsx",
                  lineNumber: 448,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/WhyUs.tsx",
                  lineNumber: 447,
                  columnNumber: 19
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/WhyUs.tsx",
                lineNumber: 442,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 420,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Email Us" }, void 0, false, {
              fileName: "/dev-server/src/pages/WhyUs.tsx",
              lineNumber: 454,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "mailto:brokerage@unitedestatesagent.com",
                className: "mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary",
                children: "brokerage@unitedestatesagent.com"
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/WhyUs.tsx",
                lineNumber: 455,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/WhyUs.tsx",
            lineNumber: 453,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 418,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 390,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " United Estates Realty. Licensed Real Estate Brokerage."
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 466,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Equal Housing Opportunity" }, void 0, false, {
          fileName: "/dev-server/src/pages/WhyUs.tsx",
          lineNumber: 469,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/WhyUs.tsx",
        lineNumber: 465,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/WhyUs.tsx",
      lineNumber: 389,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/WhyUs.tsx",
      lineNumber: 388,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/WhyUs.tsx",
    lineNumber: 92,
    columnNumber: 5
  }, this);
}
function MarketingShell({ children, activeNav }) {
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";
  const navItem = (key, base = "transition-colors hover:text-primary") => activeNav === key ? "font-medium text-primary" : base;
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxDEV("header", { className: "sticky top-0 z-40 border-b bg-background", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "flex items-center", "aria-label": "United Estates Realty", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 188, className: "w-[65px] sm:w-[132px] lg:w-[168px]" }, void 0, false, {
        fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
        lineNumber: 26,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
        lineNumber: 25,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsxDEV(Link, { to: "/", className: navItem("home"), children: "Home" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 30,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: navItem("why-us"), children: "Why Us" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 31,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: navItem("case-studies"), children: "Case Studies" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 32,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/pricing", className: navItem("pricing"), children: "Pricing" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 33,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/software", className: navItem("software"), children: "Software" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 34,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
        lineNumber: 29,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "hidden md:flex md:items-center md:gap-2", children: [
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", asChild: true, className: "px-2.5 sm:px-4", children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", children: "Agent Login" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 40,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 39,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 43,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 42,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 38,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { asChild: true, size: "sm", className: "md:hidden", children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 47,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 46,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Sheet, { children: [
          /* @__PURE__ */ jsxDEV(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "md:hidden", "aria-label": "Open menu", children: /* @__PURE__ */ jsxDEV(Menu, { className: "h-6 w-6" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 52,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 51,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 50,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(SheetContent, { side: "right", className: "w-72", children: /* @__PURE__ */ jsxDEV("nav", { className: "mt-8 flex flex-col gap-1 text-base", children: [
            /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 57,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 58,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 59,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/pricing", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 60,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/software", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Software" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 61,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 62,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, className: "mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: primaryLabel }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 63,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 56,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 55,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 49,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
        lineNumber: 37,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
      lineNumber: 24,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { children }, void 0, false, {
      fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
      lineNumber: 71,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("footer", { className: "border-t bg-background py-12", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-10 md:grid-cols-4 md:items-start", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV(UERLogo, { width: 160 }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 77,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "max-w-xs text-sm leading-6 text-muted-foreground", children: "A full-service licensed real estate brokerage. 100% commission, $98 a month, zero transaction fees." }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 78,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 76,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Explore" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 84,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "text-muted-foreground transition-colors hover:text-primary", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 86,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 86,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "text-muted-foreground transition-colors hover:text-primary", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 87,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 87,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "text-muted-foreground transition-colors hover:text-primary", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 88,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 88,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/pricing", className: "text-muted-foreground transition-colors hover:text-primary", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 89,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 89,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/blog", className: "text-muted-foreground transition-colors hover:text-primary", children: "Blog" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 90,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 90,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 85,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 83,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Agents" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 95,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/software", className: "text-muted-foreground transition-colors hover:text-primary", children: "Software" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 97,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 97,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "text-muted-foreground transition-colors hover:text-primary", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 98,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 98,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", className: "text-muted-foreground transition-colors hover:text-primary", children: "Sign Up" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 99,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 99,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 96,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 94,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Follow Us" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 104,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "Facebook", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsxDEV(Facebook, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 107,
              columnNumber: 19
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 106,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "LinkedIn", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsxDEV(Linkedin, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 110,
              columnNumber: 19
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 109,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "Instagram", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsxDEV(Instagram, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 113,
              columnNumber: 19
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 112,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 105,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Email Us" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 118,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "mailto:brokerage@unitedestatesagent.com", className: "mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary", children: "brokerage@unitedestatesagent.com" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
              lineNumber: 119,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
            lineNumber: 117,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 103,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
        lineNumber: 75,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " United Estates Realty. Licensed Real Estate Brokerage."
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 127,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Equal Housing Opportunity" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
          lineNumber: 130,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
        lineNumber: 126,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
      lineNumber: 74,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
      lineNumber: 73,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/marketing/MarketingShell.tsx",
    lineNumber: 22,
    columnNumber: 5
  }, this);
}
function CaseStudies() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return /* @__PURE__ */ jsxDEV(MarketingShell, { activeNav: "case-studies", children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "Case Studies — Real Agents, Real Results | United Estates Realty",
        description: "See how real estate agents use United Estates Realty to eliminate unnecessary fees and keep more of every commission they earn.",
        path: "/case-studies"
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/CaseStudies.tsx",
        lineNumber: 16,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("section", { className: "border-b bg-muted/30 py-16 sm:py-24", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Case Studies" }, void 0, false, {
        fileName: "/dev-server/src/pages/CaseStudies.tsx",
        lineNumber: 26,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("h1", { className: "mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]", children: "Real Agents. Real Results." }, void 0, false, {
        fileName: "/dev-server/src/pages/CaseStudies.tsx",
        lineNumber: 27,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg", children: "See how real estate agents use United Estates Realty to manage more client queries and close more deals." }, void 0, false, {
        fileName: "/dev-server/src/pages/CaseStudies.tsx",
        lineNumber: 30,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/CaseStudies.tsx",
      lineNumber: 25,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/CaseStudies.tsx",
      lineNumber: 24,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/CaseStudies.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-3", children: caseStudies.map((study) => /* @__PURE__ */ jsxDEV(
      "article",
      {
        className: "flex flex-col border bg-muted/20 p-6",
        children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: [
            study.agentName,
            ", ",
            study.city
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CaseStudies.tsx",
            lineNumber: 46,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-xl font-semibold leading-tight text-foreground", children: study.headlineResult }, void 0, false, {
            fileName: "/dev-server/src/pages/CaseStudies.tsx",
            lineNumber: 49,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-sm leading-6 text-muted-foreground", children: study.summary }, void 0, false, {
            fileName: "/dev-server/src/pages/CaseStudies.tsx",
            lineNumber: 52,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-6 flex-1" }, void 0, false, {
            fileName: "/dev-server/src/pages/CaseStudies.tsx",
            lineNumber: 55,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            Link,
            {
              to: `/case-studies/${study.slug}`,
              className: "inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80",
              children: [
                "Read full story",
                /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/CaseStudies.tsx",
                  lineNumber: 61,
                  columnNumber: 19
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/dev-server/src/pages/CaseStudies.tsx",
              lineNumber: 56,
              columnNumber: 17
            },
            this
          )
        ]
      },
      study.slug,
      true,
      {
        fileName: "/dev-server/src/pages/CaseStudies.tsx",
        lineNumber: 42,
        columnNumber: 15
      },
      this
    )) }, void 0, false, {
      fileName: "/dev-server/src/pages/CaseStudies.tsx",
      lineNumber: 40,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/CaseStudies.tsx",
      lineNumber: 39,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/CaseStudies.tsx",
      lineNumber: 38,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/CaseStudies.tsx",
    lineNumber: 15,
    columnNumber: 5
  }, this);
}
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "Page Not Found | United Estates Realty",
        description: "The page you are looking for does not exist. Return to United Estates Realty homepage.",
        path: location.pathname
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/NotFound.tsx",
        lineNumber: 14,
        columnNumber: 7
      },
      void 0
    ),
    /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-screen items-center justify-center bg-muted", children: /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "mb-4 text-4xl font-bold", children: "404" }, void 0, false, {
        fileName: "/dev-server/src/pages/NotFound.tsx",
        lineNumber: 21,
        columnNumber: 11
      }, void 0),
      /* @__PURE__ */ jsxDEV("p", { className: "mb-4 text-xl text-muted-foreground", children: "Oops! Page not found" }, void 0, false, {
        fileName: "/dev-server/src/pages/NotFound.tsx",
        lineNumber: 22,
        columnNumber: 11
      }, void 0),
      /* @__PURE__ */ jsxDEV("a", { href: "/", className: "text-primary underline hover:text-primary/90", children: "Return to Home" }, void 0, false, {
        fileName: "/dev-server/src/pages/NotFound.tsx",
        lineNumber: 23,
        columnNumber: 11
      }, void 0)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/NotFound.tsx",
      lineNumber: 20,
      columnNumber: 9
    }, void 0) }, void 0, false, {
      fileName: "/dev-server/src/pages/NotFound.tsx",
      lineNumber: 19,
      columnNumber: 7
    }, void 0)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/NotFound.tsx",
    lineNumber: 13,
    columnNumber: 5
  }, void 0);
};
function CaseStudyDetail() {
  const { slug } = useParams();
  const study = slug ? getCaseStudyBySlug(slug) : void 0;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  if (!study) {
    return /* @__PURE__ */ jsxDEV(NotFound, {}, void 0, false, {
      fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
      lineNumber: 20,
      columnNumber: 12
    }, this);
  }
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: study.headlineResult,
    description: study.summary,
    image: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ea1221eb-a238-4087-9d8a-e039199b22b7/id-preview-b44d7743--c987c87c-e16f-4694-9045-0ccdf362905d.lovable.app-1773887688710.png",
    author: {
      "@type": "Organization",
      name: "United Estates Realty"
    },
    publisher: {
      "@type": "Organization",
      name: "United Estates Realty",
      logo: {
        "@type": "ImageObject",
        url: "https://unitedestatesagent.com/logo.png"
      }
    }
  };
  return /* @__PURE__ */ jsxDEV(MarketingShell, { activeNav: "case-studies", children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: `${study.headlineResult} — ${study.agentName}, ${study.city} | United Estates Realty`,
        description: study.summary.slice(0, 160),
        path: `/case-studies/${study.slug}`,
        structuredData: articleSchema
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 46,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("section", { className: "border-b bg-muted/30 py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV(
        Link,
        {
          to: "/case-studies",
          className: "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          children: [
            /* @__PURE__ */ jsxDEV(ArrowLeft, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 59,
              columnNumber: 13
            }, this),
            "All case studies"
          ]
        },
        void 0,
        true,
        {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 55,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: [
        /* @__PURE__ */ jsxDEV(Star, { className: "h-4 w-4 fill-primary text-primary" }, void 0, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 64,
          columnNumber: 13
        }, this),
        study.label
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 63,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("h1", { className: "mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl", children: study.headlineResult }, void 0, false, {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 68,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-5 text-base leading-7 text-muted-foreground sm:text-lg", children: study.summary }, void 0, false, {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 71,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
      lineNumber: 54,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
      lineNumber: 53,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-3xl space-y-12 px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "border bg-muted/20 p-6 sm:p-8", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "The Snapshot" }, void 0, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 81,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("dl", { className: "mt-5 space-y-4", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Agent" }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 86,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.agent }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 89,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
            lineNumber: 85,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Location" }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 92,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.location }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 95,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
            lineNumber: 91,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Experience" }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 98,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.experience }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 101,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
            lineNumber: 97,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Situation" }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 104,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.situation }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 107,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
            lineNumber: 103,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Result" }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 110,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.result }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 113,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
            lineNumber: 109,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 84,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 80,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-2xl font-bold text-foreground", children: "The Story" }, void 0, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 120,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-4 space-y-4 text-base leading-7 text-muted-foreground", children: study.story.map((paragraph, i) => /* @__PURE__ */ jsxDEV("p", { children: paragraph }, i, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 123,
          columnNumber: 17
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 121,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 119,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-2xl font-bold text-foreground", children: "What Changed" }, void 0, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 130,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-4 space-y-4 text-base leading-7 text-muted-foreground", children: study.whatChanged.map((paragraph, i) => /* @__PURE__ */ jsxDEV("p", { children: paragraph }, i, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 133,
          columnNumber: 17
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 131,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 129,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("blockquote", { className: "border-l-2 border-primary pl-6 text-lg italic leading-8 text-foreground", children: [
        study.advice,
        /* @__PURE__ */ jsxDEV("footer", { className: "mt-3 text-sm not-italic text-muted-foreground", children: [
          "— ",
          study.agentName,
          ", ",
          study.city
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 141,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 139,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "border-t pt-10", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-2xl font-bold text-foreground", children: "Ready to write your own story?" }, void 0, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 148,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-base leading-7 text-muted-foreground", children: "Join United Estates Realty and keep 100% of every commission for a flat $98/month." }, void 0, false, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 151,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-6 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxDEV(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", children: [
            "Sign Up",
            /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
              lineNumber: 158,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
            lineNumber: 156,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
            lineNumber: 155,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { size: "lg", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", children: "More case studies" }, void 0, false, {
            fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
            lineNumber: 162,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
            lineNumber: 161,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
          lineNumber: 154,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 147,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-xs leading-5 text-muted-foreground", children: study.disclaimer }, void 0, false, {
        fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
        lineNumber: 168,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
      lineNumber: 78,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
      lineNumber: 77,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/CaseStudyDetail.tsx",
    lineNumber: 45,
    columnNumber: 5
  }, this);
}
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxDEV(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none ring-offset-background transition-[border-color,box-shadow,background-color] duration-150 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/90 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20 disabled:cursor-not-allowed disabled:bg-muted/35 disabled:text-muted-foreground",
          className
        ),
        ref,
        ...props
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/components/ui/input.tsx",
        lineNumber: 8,
        columnNumber: 7
      },
      void 0
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva("text-[13px] font-medium leading-5 text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(LabelPrimitive.Root, { ref, className: cn(labelVariants(), className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/label.tsx",
  lineNumber: 13,
  columnNumber: 3
}, void 0));
Label.displayName = LabelPrimitive.Root.displayName;
const UER_MONTHLY_FEE = 98;
function formatCurrency(value) {
  if (!Number.isFinite(value)) return "$0";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}
function CommissionCalculator() {
  const [avgDealPrice, setAvgDealPrice] = useState(45e4);
  const [annualDeals, setAnnualDeals] = useState(12);
  const [commissionPct, setCommissionPct] = useState(3);
  const [splitPct, setSplitPct] = useState(30);
  const [perDealFee, setPerDealFee] = useState(295);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const results = useMemo(() => {
    const grossCommissionPerDeal = avgDealPrice * commissionPct / 100;
    const grossAnnual = grossCommissionPerDeal * annualDeals;
    const traditionalSplitCost = grossAnnual * (splitPct / 100);
    const traditionalFeeCost = perDealFee * annualDeals;
    const traditionalTotalCost = traditionalSplitCost + traditionalFeeCost;
    const traditionalNet = grossAnnual - traditionalTotalCost;
    const uerAnnualCost = UER_MONTHLY_FEE * 12;
    const uerNet = grossAnnual - uerAnnualCost;
    const savings = uerNet - traditionalNet;
    return {
      grossAnnual,
      traditionalTotalCost,
      traditionalNet,
      uerAnnualCost,
      uerNet,
      savings
    };
  }, [avgDealPrice, annualDeals, commissionPct, splitPct, perDealFee]);
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";
  const calculatorSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Florida 100% Commission vs Split Calculator",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description: "Free calculator for Florida real estate agents to compare 100% commission flat-fee brokerages like United Estates Realty against traditional percentage-split brokerages."
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "100% Commission vs Split Calculator for Florida Agents",
        description: "Compare 100% commission flat-fee brokerages to traditional splits. Enter your average deal size and annual volume to see how much Florida agents save with United Estates Realty.",
        path: "/commission-calculator",
        structuredData: calculatorSchema
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 76,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("header", { className: "sticky top-0 z-40 border-b bg-background", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "flex items-center", "aria-label": "United Estates Realty", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 188, className: "w-[65px] sm:w-[132px] lg:w-[168px]" }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 86,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 85,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "transition-colors hover:text-primary", children: "Home" }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 90,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "transition-colors hover:text-primary", children: "Why Us" }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 91,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "transition-colors hover:text-primary", children: "Case Studies" }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 92,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/commission-calculator", className: "font-medium text-primary", children: "Calculator" }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 93,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("a", { href: "/pricing", className: "transition-colors hover:text-primary", children: "Pricing" }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 94,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 89,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "hidden md:flex md:items-center md:gap-2", children: [
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", asChild: true, className: "px-2.5 sm:px-4", children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", children: "Agent Login" }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 100,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 99,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 103,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 102,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 98,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { asChild: true, size: "sm", className: "md:hidden", children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 107,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 106,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Sheet, { children: [
          /* @__PURE__ */ jsxDEV(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "md:hidden", "aria-label": "Open menu", children: /* @__PURE__ */ jsxDEV(Menu, { className: "h-6 w-6" }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 112,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 111,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 110,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(SheetContent, { side: "right", className: "w-72", children: /* @__PURE__ */ jsxDEV("nav", { className: "mt-8 flex flex-col gap-1 text-base", children: [
            /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 117,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 118,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 119,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/commission-calculator", className: "rounded-md px-3 py-2 font-medium text-primary transition-colors hover:bg-muted", children: "Calculator" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 120,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "/pricing", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 121,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 122,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, className: "mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: primaryLabel }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 123,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 116,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 115,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 109,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 97,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
      lineNumber: 84,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
      lineNumber: 83,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { children: [
      /* @__PURE__ */ jsxDEV("section", { className: "border-b bg-muted/30 py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "For Florida Real Estate Agents" }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 136,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]", children: "100% Commission vs Split Calculator" }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 137,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg", children: "See exactly how much your Florida brokerage's commission split is costing you every year. Enter your average sale price and annual deal volume, then compare a traditional split against United Estates Realty's flat $98/month, 100% commission model." }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 140,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 135,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 134,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 133,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-12 sm:py-16", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "grid gap-8 lg:grid-cols-5", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxDEV("div", { className: "border bg-muted/20 p-6 sm:p-8", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxDEV(Calculator, { className: "h-5 w-5 text-primary" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 155,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-semibold text-foreground", children: "Your numbers" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 156,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 154,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-6 space-y-5", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "avgDealPrice", children: "Average sale price" }, void 0, false, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 161,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "avgDealPrice",
                  type: "number",
                  min: 0,
                  step: 1e4,
                  value: avgDealPrice,
                  onChange: (e) => setAvgDealPrice(Number(e.target.value) || 0)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 162,
                  columnNumber: 23
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 160,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "annualDeals", children: "Closed deals per year" }, void 0, false, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 173,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "annualDeals",
                  type: "number",
                  min: 0,
                  step: 1,
                  value: annualDeals,
                  onChange: (e) => setAnnualDeals(Number(e.target.value) || 0)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 174,
                  columnNumber: 23
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 172,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "commissionPct", children: "Your commission per side (%)" }, void 0, false, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 185,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "commissionPct",
                  type: "number",
                  min: 0,
                  max: 10,
                  step: 0.25,
                  value: commissionPct,
                  onChange: (e) => setCommissionPct(Number(e.target.value) || 0)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 186,
                  columnNumber: 23
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 184,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "splitPct", children: "Traditional broker split to brokerage (%)" }, void 0, false, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 198,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "splitPct",
                  type: "number",
                  min: 0,
                  max: 100,
                  step: 1,
                  value: splitPct,
                  onChange: (e) => setSplitPct(Number(e.target.value) || 0)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 199,
                  columnNumber: 23
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 197,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "perDealFee", children: "Traditional per-transaction fee ($)" }, void 0, false, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 211,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "perDealFee",
                  type: "number",
                  min: 0,
                  step: 25,
                  value: perDealFee,
                  onChange: (e) => setPerDealFee(Number(e.target.value) || 0)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 212,
                  columnNumber: 23
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 210,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 159,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 153,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 152,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "lg:col-span-3", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "border-2 border-primary bg-background p-6 sm:p-8", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxDEV(TrendingUp, { className: "h-5 w-5 text-primary" }, void 0, false, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 229,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-semibold text-foreground", children: "Your annual savings" }, void 0, false, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 230,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 228,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "mt-6 grid gap-4 sm:grid-cols-2", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "border bg-muted/30 p-5", children: [
                /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Traditional Brokerage" }, void 0, false, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 235,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-3xl font-bold text-foreground", children: formatCurrency(results.traditionalNet) }, void 0, false, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 236,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "mt-1 text-xs text-muted-foreground", children: "Take-home after split + fees" }, void 0, false, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 237,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "mt-4 space-y-1 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxDEV("span", { children: "Gross commission" }, void 0, false, {
                      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                      lineNumber: 239,
                      columnNumber: 63
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { children: formatCurrency(results.grossAnnual) }, void 0, false, {
                      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                      lineNumber: 239,
                      columnNumber: 92
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                    lineNumber: 239,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxDEV("span", { children: "Brokerage cost" }, void 0, false, {
                      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                      lineNumber: 240,
                      columnNumber: 63
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { className: "text-destructive", children: [
                      "−",
                      formatCurrency(results.traditionalTotalCost)
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                      lineNumber: 240,
                      columnNumber: 90
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                    lineNumber: 240,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 238,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 234,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "border-2 border-primary bg-primary/5 p-5", children: [
                /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-semibold uppercase tracking-wider text-primary", children: "United Estates Realty" }, void 0, false, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 245,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-3xl font-bold text-foreground", children: formatCurrency(results.uerNet) }, void 0, false, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 246,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "mt-1 text-xs text-muted-foreground", children: "Take-home after flat fee" }, void 0, false, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 247,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "mt-4 space-y-1 text-xs text-muted-foreground", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxDEV("span", { children: "Gross commission" }, void 0, false, {
                      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                      lineNumber: 249,
                      columnNumber: 63
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { children: formatCurrency(results.grossAnnual) }, void 0, false, {
                      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                      lineNumber: 249,
                      columnNumber: 92
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                    lineNumber: 249,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between", children: [
                    /* @__PURE__ */ jsxDEV("span", { children: "Brokerage cost" }, void 0, false, {
                      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                      lineNumber: 250,
                      columnNumber: 63
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { className: "text-destructive", children: [
                      "−",
                      formatCurrency(results.uerAnnualCost)
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                      lineNumber: 250,
                      columnNumber: 90
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                    lineNumber: 250,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 248,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 244,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 233,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "mt-6 flex items-center justify-between gap-4 border-t pt-6", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex h-10 w-10 items-center justify-center border bg-muted", children: /* @__PURE__ */ jsxDEV(DollarSign, { className: "h-5 w-5 text-primary" }, void 0, false, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 258,
                  columnNumber: 25
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 257,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "You keep an extra" }, void 0, false, {
                    fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                    lineNumber: 261,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("p", { className: "text-2xl font-bold text-primary sm:text-3xl", children: [
                    formatCurrency(Math.max(0, results.savings)),
                    " / year"
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                    lineNumber: 262,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 260,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 256,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(Button, { asChild: true, className: "hidden sm:inline-flex", children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: [
                "Claim Your Commissions",
                /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                  lineNumber: 268,
                  columnNumber: 25
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 266,
                columnNumber: 23
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 265,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 255,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Button, { asChild: true, className: "mt-4 w-full sm:hidden", children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: [
              "Claim Your Commissions",
              /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
                fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
                lineNumber: 275,
                columnNumber: 23
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 273,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 272,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 227,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-xs text-muted-foreground", children: "Estimates only. Actual brokerage costs vary based on cap structures, desk fees, technology fees, and E&O. United Estates Realty charges a flat $98/month with no commission splits, transaction fees, or hidden charges." }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 280,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 226,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 150,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 149,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 148,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "border-y bg-muted/30 py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Florida Brokerage Savings" }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 292,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Why Florida agents are switching from split brokerages." }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 293,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Florida agents in Miami, Orlando, Tampa, Jacksonville, and Fort Lauderdale routinely give away 20%–50% of every commission check to a traditional brokerage, on top of per-transaction fees, monthly desk fees, and technology charges. At Florida's median sale price, that's tens of thousands of dollars a year, money that should be funding your business, not your broker's." }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 296,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "United Estates Realty is a fully licensed Florida brokerage built around a single idea: agents earn the commission, agents should keep the commission. Flat $98/month membership, 100% commission, zero transaction fees, and a complete platform for transactions, CRM, listings, marketing, and signatures." }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 299,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 291,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 290,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 289,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "border-2 border-primary bg-muted/20 p-8 sm:p-12", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsxDEV("h2", { className: "text-3xl font-bold text-foreground sm:text-4xl", children: "Stop paying for a commission split you don't need." }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 311,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Join United Estates Realty today. Keep 100% of every commission. $98 a month. Cancel anytime." }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 314,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxDEV(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: [
            primaryLabel,
            /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 321,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 319,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 318,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { size: "lg", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", children: "See Why Us" }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 325,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 324,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 317,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 310,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 309,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 308,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 307,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
      lineNumber: 131,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("footer", { className: "border-t bg-background py-12", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-10 md:grid-cols-4 md:items-start", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV(UERLogo, { width: 160 }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 338,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "max-w-xs text-sm leading-6 text-muted-foreground", children: "A full-service licensed Florida real estate brokerage. 100% commission, $98 a month, zero transaction fees." }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 339,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 337,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Explore" }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 345,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "text-muted-foreground transition-colors hover:text-primary", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 347,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 347,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "text-muted-foreground transition-colors hover:text-primary", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 348,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 348,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "text-muted-foreground transition-colors hover:text-primary", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 349,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 349,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/commission-calculator", className: "text-muted-foreground transition-colors hover:text-primary", children: "Commission Calculator" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 350,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 350,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "/pricing", className: "text-muted-foreground transition-colors hover:text-primary", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 351,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 351,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/blog", className: "text-muted-foreground transition-colors hover:text-primary", children: "Blog" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 352,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 352,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 346,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 344,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Agents" }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 357,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV("a", { href: "/software", className: "text-muted-foreground transition-colors hover:text-primary", children: "Software" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 359,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 359,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "text-muted-foreground transition-colors hover:text-primary", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 360,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 360,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", className: "text-muted-foreground transition-colors hover:text-primary", children: "Sign Up" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 361,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 361,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 358,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 356,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Follow Us" }, void 0, false, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 366,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "Facebook", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsxDEV(Facebook, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 368,
              columnNumber: 220
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 368,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "LinkedIn", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsxDEV(Linkedin, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 369,
              columnNumber: 220
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 369,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "Instagram", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsxDEV(Instagram, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 370,
              columnNumber: 221
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 370,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 367,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Email Us" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 373,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "mailto:brokerage@unitedestatesagent.com", className: "mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary", children: "brokerage@unitedestatesagent.com" }, void 0, false, {
              fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
              lineNumber: 374,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
            lineNumber: 372,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 365,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 336,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " United Estates Realty. Licensed Real Estate Brokerage."
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 380,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Equal Housing Opportunity" }, void 0, false, {
          fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
          lineNumber: 381,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
        lineNumber: 379,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
      lineNumber: 335,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
      lineNumber: 334,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/CommissionCalculator.tsx",
    lineNumber: 75,
    columnNumber: 5
  }, this);
}
const includedFeatures = [
  "Keep 100% of your commission - every closing, no exceptions",
  "No transaction fees. Not $100. Not $50. Zero.",
  "Licensed Florida brokerage - hang your license here",
  "Full transaction management software included",
  "CRM, listings, marketing, and calendar tools",
  "Referral program - earn $20/mo per active agent you refer",
  "Brokerage support and compliance"
];
function Pricing() {
  return /* @__PURE__ */ jsxDEV(MarketingShell, { activeNav: "pricing", children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "100% Commission Real Estate Brokerage Pricing — $98/Month Flat Fee",
        description: "One flat $98/month fee. Keep 100% of every commission with zero transaction fees, desk fees, or hidden charges at United Estates Realty.",
        path: "/pricing"
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Pricing.tsx",
        lineNumber: 21,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("section", { className: "border-b bg-muted/30 py-16 sm:py-24", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Pricing" }, void 0, false, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 30,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl", children: "100% Commission Real Estate Brokerage Pricing — $98/Month Flat Fee" }, void 0, false, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 31,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-5 text-base leading-7 text-muted-foreground sm:text-lg", children: "One simple plan. Every Florida agent pays the same flat monthly rate and gets full access to the brokerage, the software, and the support. No splits, no transaction fees, no surprises." }, void 0, false, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 34,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Pricing.tsx",
        lineNumber: 29,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-12 max-w-md", children: /* @__PURE__ */ jsxDEV("div", { className: "border-2 border-primary bg-background p-8", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: "Agent Membership" }, void 0, false, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 41,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex items-end gap-2", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-5xl font-bold text-foreground", children: "$98" }, void 0, false, {
            fileName: "/dev-server/src/pages/Pricing.tsx",
            lineNumber: 43,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "mb-1 text-lg text-muted-foreground", children: "/ month" }, void 0, false, {
            fileName: "/dev-server/src/pages/Pricing.tsx",
            lineNumber: 44,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 42,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-sm text-muted-foreground", children: "No transaction fees. No desk fees. No royalties." }, void 0, false, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 46,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("ul", { className: "mt-8 space-y-3", children: includedFeatures.map((item) => /* @__PURE__ */ jsxDEV("li", { className: "flex items-start gap-3 text-sm", children: [
          /* @__PURE__ */ jsxDEV(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }, void 0, false, {
            fileName: "/dev-server/src/pages/Pricing.tsx",
            lineNumber: 51,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-foreground", children: item }, void 0, false, {
            fileName: "/dev-server/src/pages/Pricing.tsx",
            lineNumber: 52,
            columnNumber: 21
          }, this)
        ] }, item, true, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 50,
          columnNumber: 19
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 48,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: /* @__PURE__ */ jsxDEV(Button, { asChild: true, size: "lg", className: "w-full", children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", children: [
          "Join United Estates Realty",
          /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/Pricing.tsx",
            lineNumber: 61,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 59,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 58,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Pricing.tsx",
          lineNumber: 57,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Pricing.tsx",
        lineNumber: 40,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Pricing.tsx",
        lineNumber: 39,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Pricing.tsx",
      lineNumber: 28,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Pricing.tsx",
      lineNumber: 27,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "grid gap-10 md:grid-cols-3", children: [
      { stat: "100%", label: "Commission you keep" },
      { stat: "$98", label: "Flat monthly fee" },
      { stat: "$0", label: "Transaction fees" }
    ].map(({ stat, label }) => /* @__PURE__ */ jsxDEV("div", { className: "border bg-muted/30 px-6 py-8 text-center", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-4xl font-bold text-primary", children: stat }, void 0, false, {
        fileName: "/dev-server/src/pages/Pricing.tsx",
        lineNumber: 79,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-2 text-sm font-medium text-muted-foreground", children: label }, void 0, false, {
        fileName: "/dev-server/src/pages/Pricing.tsx",
        lineNumber: 80,
        columnNumber: 17
      }, this)
    ] }, label, true, {
      fileName: "/dev-server/src/pages/Pricing.tsx",
      lineNumber: 78,
      columnNumber: 15
    }, this)) }, void 0, false, {
      fileName: "/dev-server/src/pages/Pricing.tsx",
      lineNumber: 72,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Pricing.tsx",
      lineNumber: 71,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Pricing.tsx",
      lineNumber: 70,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Pricing.tsx",
    lineNumber: 20,
    columnNumber: 5
  }, this);
}
const softwareFeatures = [
  "Transaction management & checklists",
  "Contact and client CRM",
  "Listing pipeline and status tracking",
  "Marketing asset builder",
  "Task management and reminders",
  "Document storage and PDF access",
  "Calendar and deadline tracking",
  "Referral program with live earnings dashboard"
];
function Software() {
  return /* @__PURE__ */ jsxDEV(MarketingShell, { activeNav: "software", children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "Real Estate Agent Software — CRM, Transactions & Marketing in One",
        description: "The United Estates Realty agent platform includes a full CRM, transaction management, listings, marketing tools, and calendar — built for how Florida agents actually work.",
        path: "/software"
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Software.tsx",
        lineNumber: 22,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("section", { className: "border-b bg-muted/30 py-16 sm:py-24", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "The Software" }, void 0, false, {
        fileName: "/dev-server/src/pages/Software.tsx",
        lineNumber: 31,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("h1", { className: "mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl", children: "Real Estate Agent Software — CRM, Transactions & Marketing in One Platform" }, void 0, false, {
        fileName: "/dev-server/src/pages/Software.tsx",
        lineNumber: 32,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-5 text-base leading-7 text-muted-foreground sm:text-lg", children: "Every United Estates Realty membership includes full access to our agent platform. Not a third-party tool — our own software, built specifically for how real estate agents work day to day." }, void 0, false, {
        fileName: "/dev-server/src/pages/Software.tsx",
        lineNumber: 35,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: /* @__PURE__ */ jsxDEV(Button, { asChild: true, size: "lg", children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", children: [
        "Get Started",
        /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/Software.tsx",
          lineNumber: 42,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Software.tsx",
        lineNumber: 40,
        columnNumber: 17
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Software.tsx",
        lineNumber: 39,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Software.tsx",
        lineNumber: 38,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Software.tsx",
      lineNumber: 30,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Software.tsx",
      lineNumber: 29,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Software.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: softwareFeatures.map((feature) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-3 border bg-muted/30 px-4 py-3", children: [
      /* @__PURE__ */ jsxDEV(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }, void 0, false, {
        fileName: "/dev-server/src/pages/Software.tsx",
        lineNumber: 55,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "text-sm text-foreground", children: feature }, void 0, false, {
        fileName: "/dev-server/src/pages/Software.tsx",
        lineNumber: 56,
        columnNumber: 17
      }, this)
    ] }, feature, true, {
      fileName: "/dev-server/src/pages/Software.tsx",
      lineNumber: 54,
      columnNumber: 15
    }, this)) }, void 0, false, {
      fileName: "/dev-server/src/pages/Software.tsx",
      lineNumber: 52,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Software.tsx",
      lineNumber: 51,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Software.tsx",
      lineNumber: 50,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Software.tsx",
    lineNumber: 21,
    columnNumber: 5
  }, this);
}
function BlogShell({ children }) {
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxDEV("header", { className: "sticky top-0 z-40 border-b bg-background", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "flex items-center", "aria-label": "United Estates Realty", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 188, className: "w-[65px] sm:w-[132px] lg:w-[168px]" }, void 0, false, {
        fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
        lineNumber: 22,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
        lineNumber: 21,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "transition-colors hover:text-primary", children: "Home" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 26,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "transition-colors hover:text-primary", children: "Why Us" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 27,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "transition-colors hover:text-primary", children: "Case Studies" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 28,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/pricing", className: "transition-colors hover:text-primary", children: "Pricing" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 29,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Link, { to: "/software", className: "transition-colors hover:text-primary", children: "Software" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 30,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
        lineNumber: 25,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "hidden md:flex md:items-center md:gap-2", children: [
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", asChild: true, className: "px-2.5 sm:px-4", children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", children: "Agent Login" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 36,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 35,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { asChild: true, children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 39,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 38,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 34,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { asChild: true, size: "sm", className: "md:hidden", children: /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, children: primaryLabel }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 43,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 42,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Sheet, { children: [
          /* @__PURE__ */ jsxDEV(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "icon", className: "md:hidden", "aria-label": "Open menu", children: /* @__PURE__ */ jsxDEV(Menu, { className: "h-6 w-6" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 48,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 47,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 46,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(SheetContent, { side: "right", className: "w-72", children: /* @__PURE__ */ jsxDEV("nav", { className: "mt-8 flex flex-col gap-1 text-base", children: [
            /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 53,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 54,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 55,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/pricing", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 56,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/software", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Software" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 57,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 58,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: primaryHref, className: "mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: primaryLabel }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 59,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 52,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 51,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 45,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
        lineNumber: 33,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
      lineNumber: 20,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
      lineNumber: 19,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("main", { children }, void 0, false, {
      fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
      lineNumber: 67,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("footer", { className: "border-t bg-background py-12", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-10 md:grid-cols-4 md:items-start", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV(UERLogo, { width: 160 }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 73,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "max-w-xs text-sm leading-6 text-muted-foreground", children: "A full-service licensed real estate brokerage. 100% commission, $98 a month, zero transaction fees." }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 74,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 72,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Explore" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 80,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/", className: "text-muted-foreground transition-colors hover:text-primary", children: "Home" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 82,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 82,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/why-us", className: "text-muted-foreground transition-colors hover:text-primary", children: "Why Us" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 83,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 83,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/case-studies", className: "text-muted-foreground transition-colors hover:text-primary", children: "Case Studies" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 84,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 84,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/pricing", className: "text-muted-foreground transition-colors hover:text-primary", children: "Pricing" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 85,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 85,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/blog", className: "text-muted-foreground transition-colors hover:text-primary", children: "Blog" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 86,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 86,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 81,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 79,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Agents" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 91,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/software", className: "text-muted-foreground transition-colors hover:text-primary", children: "Software" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 93,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 93,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "text-muted-foreground transition-colors hover:text-primary", children: "Agent Login" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 94,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 94,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("li", { children: /* @__PURE__ */ jsxDEV(Link, { to: "/signup", className: "text-muted-foreground transition-colors hover:text-primary", children: "Sign Up" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 95,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 95,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 92,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 90,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Follow Us" }, void 0, false, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 100,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "Facebook", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsxDEV(Facebook, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 103,
              columnNumber: 19
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 102,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "LinkedIn", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsxDEV(Linkedin, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 106,
              columnNumber: 19
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 105,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "#", "aria-label": "Instagram", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsxDEV(Instagram, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 109,
              columnNumber: 19
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 108,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 101,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Email Us" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 114,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("a", { href: "mailto:brokerage@unitedestatesagent.com", className: "mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary", children: "brokerage@unitedestatesagent.com" }, void 0, false, {
              fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
              lineNumber: 115,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
            lineNumber: 113,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 99,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
        lineNumber: 71,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " United Estates Realty. Licensed Real Estate Brokerage."
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 123,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Equal Housing Opportunity" }, void 0, false, {
          fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
          lineNumber: 126,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
        lineNumber: 122,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
      lineNumber: 70,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
      lineNumber: 69,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/marketing/BlogShell.tsx",
    lineNumber: 18,
    columnNumber: 5
  }, this);
}
function Blog() {
  return /* @__PURE__ */ jsxDEV(BlogShell, { children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "Real Estate Agent Resources: Tips on Commissions, Leads, and Growing Your Business",
        description: "Straight talk on commission splits, client management, and what actually works for agents, written by agents, not marketers.",
        path: "/blog"
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Blog.tsx",
        lineNumber: 10,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("section", { className: "border-b bg-muted/30 py-10 sm:py-14", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Blog" }, void 0, false, {
        fileName: "/dev-server/src/pages/Blog.tsx",
        lineNumber: 18,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("h1", { className: "mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl", children: "Real Estate Agent Resources" }, void 0, false, {
        fileName: "/dev-server/src/pages/Blog.tsx",
        lineNumber: 19,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("h2", { className: "mt-4 text-lg leading-7 text-muted-foreground sm:text-xl", children: "Straight talk on commission splits, client management, and what actually works for agents, written by agents, not marketers." }, void 0, false, {
        fileName: "/dev-server/src/pages/Blog.tsx",
        lineNumber: 22,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Blog.tsx",
      lineNumber: 17,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Blog.tsx",
      lineNumber: 16,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("section", { className: "py-12", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-4xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("ul", { className: "space-y-8", children: blogPosts.map((post) => /* @__PURE__ */ jsxDEV("li", { className: "border-b pb-8 last:border-b-0", children: [
      post.image && /* @__PURE__ */ jsxDEV(Link, { to: `/blog/${post.slug}`, className: "block", children: /* @__PURE__ */ jsxDEV(
        "img",
        {
          src: post.image,
          alt: post.imageAlt || post.title,
          className: "mb-5 w-full rounded-lg object-cover",
          loading: "lazy"
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Blog.tsx",
          lineNumber: 35,
          columnNumber: 21
        },
        this
      ) }, void 0, false, {
        fileName: "/dev-server/src/pages/Blog.tsx",
        lineNumber: 34,
        columnNumber: 19
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-medium uppercase tracking-wider text-muted-foreground", children: [
        new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        " · ",
        post.readMinutes,
        " min read"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Blog.tsx",
        lineNumber: 43,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("h3", { className: "mt-2 text-2xl font-bold text-foreground sm:text-3xl", children: /* @__PURE__ */ jsxDEV(Link, { to: `/blog/${post.slug}`, className: "hover:text-primary", children: post.title }, void 0, false, {
        fileName: "/dev-server/src/pages/Blog.tsx",
        lineNumber: 53,
        columnNumber: 19
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Blog.tsx",
        lineNumber: 52,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-base leading-7 text-muted-foreground", children: post.excerpt }, void 0, false, {
        fileName: "/dev-server/src/pages/Blog.tsx",
        lineNumber: 57,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV(
        Link,
        {
          to: `/blog/${post.slug}`,
          className: "mt-4 inline-block text-sm font-semibold text-primary hover:underline",
          children: "Read article →"
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Blog.tsx",
          lineNumber: 58,
          columnNumber: 17
        },
        this
      )
    ] }, post.slug, true, {
      fileName: "/dev-server/src/pages/Blog.tsx",
      lineNumber: 32,
      columnNumber: 15
    }, this)) }, void 0, false, {
      fileName: "/dev-server/src/pages/Blog.tsx",
      lineNumber: 30,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Blog.tsx",
      lineNumber: 29,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Blog.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Blog.tsx",
    lineNumber: 9,
    columnNumber: 5
  }, this);
}
function BlogArticle() {
  const { slug = "" } = useParams();
  const post = getBlogPost(slug);
  if (!post) {
    return /* @__PURE__ */ jsxDEV(BlogShell, { children: [
      /* @__PURE__ */ jsxDEV(
        SeoHead,
        {
          title: "Article not found | United Estates Realty Blog",
          description: "The article you're looking for isn't available.",
          path: `/blog/${slug}`
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/BlogArticle.tsx",
          lineNumber: 14,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("article", { className: "py-16 sm:py-24", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxDEV(Link, { to: "/blog", className: "text-sm font-medium text-primary hover:underline", children: "← Back to blog" }, void 0, false, {
          fileName: "/dev-server/src/pages/BlogArticle.tsx",
          lineNumber: 21,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "mt-6 text-3xl font-bold text-foreground sm:text-4xl", children: "Article not found" }, void 0, false, {
          fileName: "/dev-server/src/pages/BlogArticle.tsx",
          lineNumber: 24,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-6 text-base leading-7 text-muted-foreground", children: "The article you're looking for isn't available. Browse the latest posts on the blog index." }, void 0, false, {
          fileName: "/dev-server/src/pages/BlogArticle.tsx",
          lineNumber: 25,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/BlogArticle.tsx",
        lineNumber: 20,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/BlogArticle.tsx",
        lineNumber: 19,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/BlogArticle.tsx",
      lineNumber: 13,
      columnNumber: 7
    }, this);
  }
  const url2 = `https://unitedestatesagent.com/blog/${post.slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    image: post.image,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "United Estates Realty",
      url: "https://unitedestatesagent.com"
    },
    mainEntityOfPage: url2
  };
  return /* @__PURE__ */ jsxDEV(BlogShell, { children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: `${post.title} | United Estates Realty Blog`,
        description: post.description,
        path: `/blog/${post.slug}`,
        image: post.image,
        structuredData: articleSchema
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/BlogArticle.tsx",
        lineNumber: 53,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("article", { className: "py-16 sm:py-24", children: /* @__PURE__ */ jsxDEV("div", { className: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxDEV(Link, { to: "/blog", className: "text-sm font-medium text-primary hover:underline", children: "← Back to blog" }, void 0, false, {
        fileName: "/dev-server/src/pages/BlogArticle.tsx",
        lineNumber: 63,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "mt-6 text-xs font-medium uppercase tracking-wider text-muted-foreground", children: [
        new Date(post.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        }),
        " · ",
        post.readMinutes,
        " min read"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/BlogArticle.tsx",
        lineNumber: 66,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("h1", { className: "mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-5xl", children: post.title }, void 0, false, {
        fileName: "/dev-server/src/pages/BlogArticle.tsx",
        lineNumber: 75,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "mt-8", children: post.content }, void 0, false, {
        fileName: "/dev-server/src/pages/BlogArticle.tsx",
        lineNumber: 78,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/BlogArticle.tsx",
      lineNumber: 62,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/BlogArticle.tsx",
      lineNumber: 61,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/BlogArticle.tsx",
    lineNumber: 52,
    columnNumber: 5
  }, this);
}
function AuthBrandPanel({ title, description, items }) {
  return /* @__PURE__ */ jsxDEV("div", { className: "relative hidden overflow-hidden border-r bg-white p-10 xl:flex xl:w-[46%] xl:flex-col xl:justify-between 2xl:p-12", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "relative z-10", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 220 }, void 0, false, {
      fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
      lineNumber: 20,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
      lineNumber: 19,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "relative z-10 space-y-8", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "max-w-lg whitespace-pre-line text-3xl font-bold leading-tight text-[hsl(var(--sidebar-bg))]", children: title }, void 0, false, {
          fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
          lineNumber: 25,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "mt-3 max-w-sm text-sm leading-relaxed text-slate-600", children: description }, void 0, false, {
          fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
          lineNumber: 28,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
        lineNumber: 24,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: items.map((item) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--sidebar-bg)/0.08)] text-[hsl(var(--sidebar-bg))]", children: /* @__PURE__ */ jsxDEV(item.icon, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
          lineNumber: 37,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
          lineNumber: 36,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("span", { className: "text-sm text-slate-700", children: item.text }, void 0, false, {
          fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
          lineNumber: 39,
          columnNumber: 15
        }, this)
      ] }, item.text, true, {
        fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
        lineNumber: 35,
        columnNumber: 13
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
        lineNumber: 33,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
      lineNumber: 23,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("p", { className: "relative z-10 text-xs text-slate-400", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " United Estates Realty"
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
      lineNumber: 45,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/auth/AuthBrandPanel.tsx",
    lineNumber: 18,
    columnNumber: 5
  }, this);
}
function Auth() {
  const [loading, setLoading] = useState(false);
  const { toast: toast2 } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast2({ title: "Sign in failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/transactions");
    }
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    setLoading(false);
    if (error) {
      toast2({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast2({ title: "Check your email", description: "A password reset link has been sent." });
      setShowForgotPassword(false);
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen flex flex-col xl:flex-row", children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "Agent Login | United Estates Realty",
        description: "Sign in to your United Estates Realty agent account to manage listings, transactions, contacts, and brokerage workflows.",
        path: "/auth"
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Auth.tsx",
        lineNumber: 54,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(
      AuthBrandPanel,
      {
        title: "Welcome back.\nPick up where you left off.",
        description: "Your listings, transactions, contacts, and office workflows are waiting.",
        items: [
          { icon: Home, text: "All active deals and listings in one place" },
          { icon: User, text: "Your contacts, tasks, and office activity" },
          { icon: CheckCircle2, text: "Forms, signing, and brokerage workflows" }
        ]
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Auth.tsx",
        lineNumber: 59,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto bg-background px-4 py-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-full items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "w-full max-w-md space-y-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "text-center xl:hidden", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 160 }, void 0, false, {
        fileName: "/dev-server/src/pages/Auth.tsx",
        lineNumber: 76,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Auth.tsx",
        lineNumber: 75,
        columnNumber: 11
      }, this),
      showForgotPassword ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-bold text-foreground", children: "Reset your password" }, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 82,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Enter your email and we'll send a reset link." }, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 83,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Auth.tsx",
          lineNumber: 81,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("form", { onSubmit: handleForgotPassword, className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxDEV(Label, { htmlFor: "reset-email", children: "Email Address" }, void 0, false, {
              fileName: "/dev-server/src/pages/Auth.tsx",
              lineNumber: 90,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
              /* @__PURE__ */ jsxDEV(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }, void 0, false, {
                fileName: "/dev-server/src/pages/Auth.tsx",
                lineNumber: 92,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "reset-email",
                  type: "email",
                  placeholder: "you@example.com",
                  className: "pl-9",
                  value: resetEmail,
                  onChange: (e) => setResetEmail(e.target.value),
                  required: true
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Auth.tsx",
                  lineNumber: 93,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Auth.tsx",
              lineNumber: 91,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 89,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Sending…" : "Send Reset Link" }, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 104,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            Button,
            {
              type: "button",
              variant: "ghost",
              className: "w-full",
              onClick: () => setShowForgotPassword(false),
              children: "Back to sign in"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/Auth.tsx",
              lineNumber: 107,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Auth.tsx",
          lineNumber: 88,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Auth.tsx",
        lineNumber: 80,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-bold text-foreground", children: "Sign in to your account" }, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 120,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Access your United Estates Realty account." }, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 121,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: /* @__PURE__ */ jsxDEV(
            Link,
            {
              to: "/signup",
              className: "inline-flex text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline",
              children: "Create an account"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/Auth.tsx",
              lineNumber: 123,
              columnNumber: 19
            },
            this
          ) }, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 122,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Auth.tsx",
          lineNumber: 119,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("form", { onSubmit: handleSignIn, className: "space-y-4", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxDEV(Label, { htmlFor: "email", children: "Email Address" }, void 0, false, {
              fileName: "/dev-server/src/pages/Auth.tsx",
              lineNumber: 134,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
              /* @__PURE__ */ jsxDEV(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }, void 0, false, {
                fileName: "/dev-server/src/pages/Auth.tsx",
                lineNumber: 136,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "email",
                  type: "email",
                  placeholder: "you@example.com",
                  className: "pl-9",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  required: true
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Auth.tsx",
                  lineNumber: 137,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Auth.tsx",
              lineNumber: 135,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 133,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "password", children: "Password" }, void 0, false, {
                fileName: "/dev-server/src/pages/Auth.tsx",
                lineNumber: 151,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  onClick: () => setShowForgotPassword(true),
                  className: "text-xs text-muted-foreground hover:text-primary",
                  children: "Forgot password?"
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Auth.tsx",
                  lineNumber: 152,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Auth.tsx",
              lineNumber: 150,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
              /* @__PURE__ */ jsxDEV(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }, void 0, false, {
                fileName: "/dev-server/src/pages/Auth.tsx",
                lineNumber: 161,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "password",
                  type: showPassword ? "text" : "password",
                  placeholder: "••••••••",
                  className: "pl-9 pr-9",
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  required: true
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Auth.tsx",
                  lineNumber: 162,
                  columnNumber: 21
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  type: "button",
                  onClick: () => setShowPassword((v) => !v),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  tabIndex: -1,
                  children: showPassword ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Auth.tsx",
                    lineNumber: 177,
                    columnNumber: 39
                  }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Auth.tsx",
                    lineNumber: 177,
                    columnNumber: 72
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Auth.tsx",
                  lineNumber: 171,
                  columnNumber: 21
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Auth.tsx",
              lineNumber: 160,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 149,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { type: "submit", className: "w-full mt-2", disabled: loading, children: loading ? "Signing in…" : "Sign In" }, void 0, false, {
            fileName: "/dev-server/src/pages/Auth.tsx",
            lineNumber: 182,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Auth.tsx",
          lineNumber: 132,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Auth.tsx",
        lineNumber: 118,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Auth.tsx",
      lineNumber: 72,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Auth.tsx",
      lineNumber: 71,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Auth.tsx",
      lineNumber: 70,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Auth.tsx",
    lineNumber: 53,
    columnNumber: 5
  }, this);
}
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: "At least 6 characters", pass: password.length >= 6 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "One lowercase letter", pass: /[a-z]/.test(password) },
    { label: "One number", pass: /[0-9]/.test(password) }
  ];
  const passed = checks.filter((c) => c.pass).length;
  const strengthColor = passed <= 1 ? "bg-red-500" : passed <= 2 ? "bg-orange-400" : passed === 3 ? "bg-yellow-400" : "bg-emerald-500";
  const strengthLabel = passed <= 1 ? "Weak" : passed <= 2 ? "Fair" : passed === 3 ? "Good" : "Strong";
  return /* @__PURE__ */ jsxDEV("div", { className: "mt-2 space-y-2", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-0.5", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: cn("flex-1 rounded-full transition-all", i <= passed ? strengthColor : "bg-muted")
        },
        i,
        false,
        {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 31,
          columnNumber: 13
        },
        this
      )) }, void 0, false, {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 29,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: cn("text-xs font-medium", passed === 4 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"), children: strengthLabel }, void 0, false, {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 37,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Signup.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-1", children: checks.map((c) => /* @__PURE__ */ jsxDEV("p", { className: cn("flex items-center gap-1 text-[11px]", c.pass ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"), children: [
      /* @__PURE__ */ jsxDEV(CheckCircle2, { className: cn("w-3 h-3 shrink-0", c.pass ? "opacity-100" : "opacity-30") }, void 0, false, {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 44,
        columnNumber: 13
      }, this),
      c.label
    ] }, c.label, true, {
      fileName: "/dev-server/src/pages/Signup.tsx",
      lineNumber: 43,
      columnNumber: 11
    }, this)) }, void 0, false, {
      fileName: "/dev-server/src/pages/Signup.tsx",
      lineNumber: 41,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Signup.tsx",
    lineNumber: 27,
    columnNumber: 5
  }, this);
}
function Signup() {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";
  const navigate = useNavigate();
  const { toast: toast2 } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [licensePrefix, setLicensePrefix] = useState("SL");
  const [licenseDigits, setLicenseDigits] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const passwordReady = password.length >= 6 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  const licenseReady = /^\d{7}$/.test(licenseDigits);
  const fullLicense = `${licensePrefix}-${licenseDigits}`;
  const handleSignUp = async (e) => {
    var _a;
    e.preventDefault();
    if (!passwordReady) {
      toast2({ title: "Password too weak", description: "Must be 6+ characters with uppercase, lowercase, and a number.", variant: "destructive" });
      return;
    }
    if (!licenseReady) {
      toast2({ title: "License number required", description: "Enter a valid 7-digit license number.", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast2({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          license_number: fullLicense,
          referral_code: refCode || void 0
        },
        emailRedirectTo: window.location.origin
      }
    });
    if (signUpError) {
      setLoading(false);
      toast2({ title: "Sign up failed", description: signUpError.message, variant: "destructive" });
      return;
    }
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setLoading(false);
      toast2({ title: "Account created!", description: "Please sign in with your new credentials." });
      navigate("/auth");
      return;
    }
    if (signInData.user) {
      await supabase.from("profiles").update({
        license_number: fullLicense,
        brokerage_name: "United Estates Realty"
      }).eq("id", signInData.user.id);
    }
    if ((_a = signInData.session) == null ? void 0 : _a.access_token) {
      supabase.functions.invoke("notify-signup", {
        headers: { Authorization: `Bearer ${signInData.session.access_token}` },
        body: { firstName, lastName, email, licenseNumber: fullLicense, referredByCode: refCode || void 0 }
      }).catch(() => {
      });
    }
    setLoading(false);
    navigate("/onboarding/agreement");
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "min-h-screen flex flex-col xl:flex-row", children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "Join United Estates Realty — $98/mo, 100% Commission",
        description: "Create your United Estates Realty agent account. Keep 100% of your commission for a flat $98/month — no desk fees, no transaction fees.",
        path: "/signup"
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 145,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV(
      AuthBrandPanel,
      {
        title: "Keep 100% of your commission.\n$98 a month, nothing else.",
        description: "United Estates Realty is a full-service licensed brokerage. One flat fee. No transaction fees. No desk fees. Everything you close stays with you.",
        items: [
          { icon: CheckCircle2, text: "100% commission - no per-deal charges, ever" },
          { icon: Home, text: "Full agent software included with membership" },
          { icon: User, text: "Earn $20/mo for every agent you refer" }
        ]
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 150,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto bg-background px-4 py-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-full items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "w-full max-w-md space-y-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-1 text-center xl:hidden", children: /* @__PURE__ */ jsxDEV(UERLogo, { width: 160 }, void 0, false, {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 167,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 166,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-bold text-foreground", children: "Create your account" }, void 0, false, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 170,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsxDEV(Link, { to: "/auth", className: "text-primary font-medium hover:underline", children: "Sign in" }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 173,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 171,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 169,
        columnNumber: 11
      }, this),
      refCode && /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2.5", children: [
        /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" }, void 0, false, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 180,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-semibold text-emerald-700 dark:text-emerald-300", children: "Referral applied" }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 182,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-[11px] text-emerald-600/70 dark:text-emerald-400/70", children: [
            "Code: ",
            refCode
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 183,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 181,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 179,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("form", { onSubmit: handleSignUp, className: "space-y-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxDEV(Label, { htmlFor: "first-name", children: "First Name" }, void 0, false, {
              fileName: "/dev-server/src/pages/Signup.tsx",
              lineNumber: 194,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
              /* @__PURE__ */ jsxDEV(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }, void 0, false, {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 196,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(
                Input,
                {
                  id: "first-name",
                  placeholder: "John",
                  className: "pl-9",
                  value: firstName,
                  onChange: (e) => setFirstName(e.target.value),
                  required: true
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Signup.tsx",
                  lineNumber: 197,
                  columnNumber: 19
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Signup.tsx",
              lineNumber: 195,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 193,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxDEV(Label, { htmlFor: "last-name", children: "Last Name" }, void 0, false, {
              fileName: "/dev-server/src/pages/Signup.tsx",
              lineNumber: 208,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                id: "last-name",
                placeholder: "Doe",
                value: lastName,
                onChange: (e) => setLastName(e.target.value),
                required: true
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 209,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 207,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 192,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "email", children: "Email Address" }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 220,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }, void 0, false, {
              fileName: "/dev-server/src/pages/Signup.tsx",
              lineNumber: 222,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                id: "email",
                type: "email",
                placeholder: "you@example.com",
                className: "pl-9",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 223,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 221,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 219,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "license-digits", children: "Real Estate License Number" }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 236,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxDEV(
              "select",
              {
                value: licensePrefix,
                onChange: (e) => setLicensePrefix(e.target.value),
                className: "h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
                "aria-label": "License type",
                children: [
                  /* @__PURE__ */ jsxDEV("option", { value: "SL", children: "SL" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Signup.tsx",
                    lineNumber: 244,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("option", { value: "BK", children: "BK" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Signup.tsx",
                    lineNumber: 245,
                    columnNumber: 19
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 238,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("span", { className: "self-center text-muted-foreground", children: "-" }, void 0, false, {
              fileName: "/dev-server/src/pages/Signup.tsx",
              lineNumber: 247,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                id: "license-digits",
                inputMode: "numeric",
                placeholder: "1234567",
                maxLength: 7,
                value: licenseDigits,
                onChange: (e) => setLicenseDigits(e.target.value.replace(/\D/g, "").slice(0, 7)),
                required: true
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 248,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 237,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 235,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "password", children: "Password" }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 261,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }, void 0, false, {
              fileName: "/dev-server/src/pages/Signup.tsx",
              lineNumber: 263,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                id: "password",
                type: showPassword ? "text" : "password",
                placeholder: "••••••••",
                className: "pl-9 pr-9",
                value: password,
                onChange: (e) => setPassword(e.target.value),
                autoComplete: "new-password",
                required: true
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 264,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword((v) => !v),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                tabIndex: -1,
                children: showPassword ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Signup.tsx",
                  lineNumber: 280,
                  columnNumber: 35
                }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Signup.tsx",
                  lineNumber: 280,
                  columnNumber: 68
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 274,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 262,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(PasswordStrength, { password }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 283,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 260,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "confirm-password", children: "Confirm Password" }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 287,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }, void 0, false, {
              fileName: "/dev-server/src/pages/Signup.tsx",
              lineNumber: 289,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                id: "confirm-password",
                type: showConfirm ? "text" : "password",
                placeholder: "••••••••",
                className: cn(
                  "pl-9 pr-9",
                  confirmPassword && (passwordsMatch ? "border-emerald-500" : "border-destructive")
                ),
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                autoComplete: "new-password",
                required: true
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 290,
                columnNumber: 17
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                onClick: () => setShowConfirm((v) => !v),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                tabIndex: -1,
                children: showConfirm ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Signup.tsx",
                  lineNumber: 309,
                  columnNumber: 34
                }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Signup.tsx",
                  lineNumber: 309,
                  columnNumber: 67
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 303,
                columnNumber: 17
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 288,
            columnNumber: 15
          }, this),
          passwordMismatch && /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-destructive", children: "Passwords do not match" }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 313,
            columnNumber: 17
          }, this),
          passwordsMatch && /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "w-3 h-3" }, void 0, false, {
              fileName: "/dev-server/src/pages/Signup.tsx",
              lineNumber: 317,
              columnNumber: 19
            }, this),
            " Passwords match"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 316,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 286,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          Button,
          {
            type: "submit",
            className: "w-full gap-2 mt-2",
            disabled: loading || !passwordReady || !passwordsMatch,
            children: loading ? "Creating account…" : /* @__PURE__ */ jsxDEV(Fragment, { children: [
              "Create Account ",
              /* @__PURE__ */ jsxDEV(ArrowRight, { className: "w-4 h-4" }, void 0, false, {
                fileName: "/dev-server/src/pages/Signup.tsx",
                lineNumber: 328,
                columnNumber: 34
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Signup.tsx",
              lineNumber: 328,
              columnNumber: 17
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 322,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV("p", { className: "text-center text-[11px] text-muted-foreground leading-relaxed", children: [
          "By creating an account you agree to our",
          " ",
          /* @__PURE__ */ jsxDEV("span", { className: "underline cursor-pointer", children: "Terms of Service" }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 334,
            columnNumber: 15
          }, this),
          " ",
          "and",
          " ",
          /* @__PURE__ */ jsxDEV("span", { className: "underline cursor-pointer", children: "Privacy Policy" }, void 0, false, {
            fileName: "/dev-server/src/pages/Signup.tsx",
            lineNumber: 336,
            columnNumber: 15
          }, this),
          "."
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Signup.tsx",
          lineNumber: 332,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Signup.tsx",
        lineNumber: 191,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Signup.tsx",
      lineNumber: 163,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Signup.tsx",
      lineNumber: 162,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Signup.tsx",
      lineNumber: 161,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Signup.tsx",
    lineNumber: 144,
    columnNumber: 5
  }, this);
}
const lazyDefault = (loader) => async () => ({ Component: (await loader()).default });
const protectedLazy = (loader) => async () => {
  const Page = (await loader()).default;
  const Wrapped = () => /* @__PURE__ */ jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDEV(Page, {}, void 0, false, {
    fileName: "/dev-server/src/App.tsx",
    lineNumber: 37,
    columnNumber: 9
  }, void 0) }, void 0, false, {
    fileName: "/dev-server/src/App.tsx",
    lineNumber: 36,
    columnNumber: 7
  }, void 0);
  return { Component: Wrapped };
};
const caseStudyStaticPaths = () => caseStudies.map((c) => `/case-studies/${c.slug}`);
const blogStaticPaths = () => blogPosts.map((p) => `/blog/${p.slug}`);
const routes = [
  {
    path: "/",
    element: /* @__PURE__ */ jsxDEV(RootLayout, {}, void 0, false, {
      fileName: "/dev-server/src/App.tsx",
      lineNumber: 51,
      columnNumber: 14
    }, void 0),
    children: [
      // ---------- Public, pre-rendered for SEO ----------
      { index: true, element: /* @__PURE__ */ jsxDEV(Index, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 54,
        columnNumber: 31
      }, void 0), entry: "src/pages/Index.tsx" },
      { path: "why-us", element: /* @__PURE__ */ jsxDEV(WhyUs, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 55,
        columnNumber: 34
      }, void 0), entry: "src/pages/WhyUs.tsx" },
      {
        path: "case-studies",
        element: /* @__PURE__ */ jsxDEV(CaseStudies, {}, void 0, false, {
          fileName: "/dev-server/src/App.tsx",
          lineNumber: 58,
          columnNumber: 18
        }, void 0),
        entry: "src/pages/CaseStudies.tsx"
      },
      {
        path: "case-studies/:slug",
        element: /* @__PURE__ */ jsxDEV(CaseStudyDetail, {}, void 0, false, {
          fileName: "/dev-server/src/App.tsx",
          lineNumber: 63,
          columnNumber: 18
        }, void 0),
        entry: "src/pages/CaseStudyDetail.tsx",
        getStaticPaths: caseStudyStaticPaths
      },
      { path: "auth", element: /* @__PURE__ */ jsxDEV(Auth, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 67,
        columnNumber: 32
      }, void 0), entry: "src/pages/Auth.tsx" },
      { path: "signup", element: /* @__PURE__ */ jsxDEV(Signup, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 68,
        columnNumber: 34
      }, void 0), entry: "src/pages/Signup.tsx" },
      {
        path: "commission-calculator",
        element: /* @__PURE__ */ jsxDEV(CommissionCalculator, {}, void 0, false, {
          fileName: "/dev-server/src/App.tsx",
          lineNumber: 71,
          columnNumber: 18
        }, void 0),
        entry: "src/pages/CommissionCalculator.tsx"
      },
      { path: "pricing", element: /* @__PURE__ */ jsxDEV(Pricing, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 74,
        columnNumber: 35
      }, void 0), entry: "src/pages/Pricing.tsx" },
      { path: "software", element: /* @__PURE__ */ jsxDEV(Software, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 75,
        columnNumber: 36
      }, void 0), entry: "src/pages/Software.tsx" },
      { path: "blog", element: /* @__PURE__ */ jsxDEV(Blog, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 76,
        columnNumber: 32
      }, void 0), entry: "src/pages/Blog.tsx" },
      {
        path: "blog/:slug",
        element: /* @__PURE__ */ jsxDEV(BlogArticle, {}, void 0, false, {
          fileName: "/dev-server/src/App.tsx",
          lineNumber: 79,
          columnNumber: 18
        }, void 0),
        entry: "src/pages/BlogArticle.tsx",
        getStaticPaths: blogStaticPaths
      },
      // ---------- Public but client-only (dynamic tokens / session) ----------
      {
        path: "reset-password",
        lazy: lazyDefault(() => import("./assets/ResetPassword-B-cj3B1S.js"))
      },
      {
        path: "sign/:token",
        lazy: lazyDefault(() => import("./assets/SignDocument-BiSh_3-w.js"))
      },
      // ---------- Onboarding (auth required) ----------
      {
        path: "onboarding/agreement",
        lazy: protectedLazy(() => import("./assets/OnboardingAgreement-CflM3oJS.js"))
      },
      {
        path: "onboarding/billing",
        lazy: protectedLazy(() => import("./assets/OnboardingBilling-D4ocouP6.js"))
      },
      {
        path: "onboarding/deposit",
        lazy: protectedLazy(() => import("./assets/OnboardingDeposit-ChzZEx9-.js"))
      },
      {
        path: "onboarding/payment",
        lazy: protectedLazy(() => import("./assets/OnboardingPayment-D1V7xez4.js"))
      },
      // ---------- Protected app shell ----------
      {
        element: /* @__PURE__ */ jsxDEV(ProtectedRoute, { children: /* @__PURE__ */ jsxDEV(AppLayout, {}, void 0, false, {
          fileName: "/dev-server/src/App.tsx",
          lineNumber: 116,
          columnNumber: 13
        }, void 0) }, void 0, false, {
          fileName: "/dev-server/src/App.tsx",
          lineNumber: 115,
          columnNumber: 11
        }, void 0),
        children: [
          { path: "transactions", lazy: lazyDefault(() => import("./assets/Transactions-DTcZha6z.js")) },
          { path: "transactions/new", lazy: lazyDefault(() => import("./assets/NewDeal-9Sfw-lm8.js")) },
          { path: "transactions/:id", lazy: lazyDefault(() => import("./assets/DealDetail-lld8Obwg.js")) },
          { path: "transactions/:id/marketing", lazy: lazyDefault(() => import("./assets/MarketingEditor-CuD8s9n8.js")) },
          { path: "people", lazy: lazyDefault(() => import("./assets/People-DVFV48Sj.js")) },
          { path: "tasks", lazy: lazyDefault(() => import("./assets/Tasks-D-9gNuBM.js")) },
          { path: "inbox", lazy: lazyDefault(() => import("./assets/Inbox-n1DM3aEe.js")) },
          { path: "listings", lazy: lazyDefault(() => import("./assets/Listings-B8N2Lv0p.js")) },
          { path: "calendar", lazy: lazyDefault(() => import("./assets/Calendar-uMS36qtF.js")) },
          { path: "finances", lazy: lazyDefault(() => import("./assets/Finances-C1jEA_2v.js")) },
          { path: "referral", lazy: lazyDefault(() => import("./assets/Referral-CMqGC2xe.js")) },
          { path: "contact-brokerage", lazy: lazyDefault(() => import("./assets/ContactBrokerage-QQQFMp90.js")) },
          { path: "admin/pdf-editor", lazy: lazyDefault(() => import("./assets/AdminPdfEditor-L1Na9ghO.js")) },
          { path: "admin/pdf-editor/:documentId", lazy: lazyDefault(() => import("./assets/AdminPdfEditor-L1Na9ghO.js")) },
          { path: "affiliate-links", lazy: lazyDefault(() => import("./assets/AffiliateLinks-D-Fypndn.js")) },
          { path: "profile", lazy: lazyDefault(() => import("./assets/Profile-DauRYSeo.js")) }
        ]
      },
      // ---------- 404 ----------
      { path: "*", element: /* @__PURE__ */ jsxDEV(NotFound, {}, void 0, false, {
        fileName: "/dev-server/src/App.tsx",
        lineNumber: 140,
        columnNumber: 29
      }, void 0) }
    ]
  }
];
const createRoot = ViteReactSSG({ routes });
export {
  AGREEMENT_ESIGN_CONSENT_TEXT as A,
  Button as B,
  CONTACT_SOURCES as C,
  Input as I,
  Label as L,
  SeoHead as S,
  UERLogo as U,
  useAuth as a,
  useOnboardingStatus as b,
  cn as c,
  createRoot,
  getFallbackOnboardingStatus as d,
  buildDocumentBody as e,
  AGREEMENT_DOCUMENT_KEYS as f,
  getAgreementDocuments as g,
  getNextOnboardingPath as h,
  useContacts as i,
  useCreateContact as j,
  useUpdateContact as k,
  useDeleteContact as l,
  getContactSource as m,
  calcLeadScore as n,
  setContactSource as o,
  buttonVariants as p,
  Accordion as q,
  AccordionItem as r,
  supabase as s,
  AccordionTrigger as t,
  useToast as u,
  AccordionContent as v
};
