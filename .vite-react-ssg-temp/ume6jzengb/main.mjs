import { Head, ViteReactSSG } from "vite-react-ssg";
import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import { useLocation, Navigate, useNavigate, Outlet, Link, useParams, useSearchParams } from "react-router-dom";
import * as React from "react";
import { useState, useCallback, useEffect, useRef, Component } from "react";
import { createClient } from "@supabase/supabase-js";
import { useQuery, useQueryClient, useMutation, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { X, Menu, MoreHorizontal, Plus, Users, Home, DollarSign, Gift, Phone, Link2, Calendar, CheckSquare, Mail, ChevronDown, ArrowRight, Check, Facebook, Linkedin, Instagram, ArrowUpRight, Zap, BarChart3, Shield, Award, Clock, ArrowLeft, Star, User, CheckCircle2, Lock, EyeOff, Eye } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { useTheme } from "next-themes";
import { Toaster as Toaster$2 } from "sonner";
import * as ToastPrimitives from "@radix-ui/react-toast";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { Slot } from "@radix-ui/react-slot";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
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
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-b-2 border-primary" }) });
  }
  if (!user) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/auth", state: { from: location }, replace: true });
  }
  const effectiveStatus = onboardingError ? getFallbackOnboardingStatus({ user, profile }) : onboardingStatus ?? getFallbackOnboardingStatus({ user, profile });
  const nextPath = getNextOnboardingPath(effectiveStatus);
  const subscriptionStatus = effectiveStatus.subscriptionStatus;
  const billingComplete = subscriptionStatus === "active" || effectiveStatus.billingWaived;
  if (isAgreementRoute && subscriptionStatus !== "active") {
    return /* @__PURE__ */ jsx(Fragment, { children });
  }
  if (!billingComplete || !effectiveStatus.hasDepositAccount) {
    if (!isOnboardingRoute || location.pathname !== nextPath) {
      return /* @__PURE__ */ jsx(Navigate, { to: nextPath, replace: true });
    }
  }
  if (billingComplete && effectiveStatus.hasDepositAccount && isOnboardingRoute) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/transactions", replace: true });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function UERLogo({ width = 200, className = "" }) {
  return /* @__PURE__ */ jsx(
    "img",
    {
      src: "/logo.png",
      alt: "United Estates Realty",
      style: { width, height: "auto", objectFit: "contain", display: "block" },
      className
    }
  );
}
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
const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SheetPrimitive.Overlay,
  {
    className: cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props,
    ref
  }
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
  ({ side = "right", className, children, ...props }, ref) => /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(SheetPrimitive.Content, { ref, className: cn(sheetVariants({ side }), className), ...props, children: [
      children,
      /* @__PURE__ */ jsxs(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-secondary hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none", children: [
        /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
        /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
      ] })
    ] })
  ] })
);
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-2 text-center sm:text-left", className), ...props });
SheetHeader.displayName = "SheetHeader";
const SheetTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Title, { ref, className: cn("text-lg font-semibold text-foreground", className), ...props }));
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(SheetPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }));
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b bg-background px-4 py-3 lg:hidden", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setMobileMenuOpen(true),
          className: "inline-flex h-11 w-11 items-center justify-center rounded-xl border bg-background text-foreground transition-standard hover:bg-muted",
          "aria-label": "Open navigation",
          children: /* @__PURE__ */ jsx(Menu, { className: "h-5 w-5" })
        }
      ),
      /* @__PURE__ */ jsx("button", { type: "button", onClick: () => navigate("/transactions"), className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(UERLogo, { width: 132 }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => navigate("/profile"),
          "aria-label": "Open profile",
          className: "inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border bg-muted text-sm font-bold text-foreground transition-standard hover:bg-accent",
          children: (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsx("img", { src: profile.avatar_url, alt: "Profile", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("span", { children: initials })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "relative hidden min-h-screen w-24 shrink-0 flex-col items-center gap-2 border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] px-2 py-4 lg:flex", children: [
      /* @__PURE__ */ jsx("div", { className: "mb-4 flex w-full items-center justify-center", children: /* @__PURE__ */ jsx(UERLogo, { width: 84 }) }),
      /* @__PURE__ */ jsx("div", { className: "flex w-full flex-1 flex-col items-center gap-2", children: navItems.map((item) => {
        const isActive = isPathActive(item.path);
        if (item.hasSubmenu) {
          return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxs(
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
                  /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsx(
                      item.icon,
                      {
                        className: cn(
                          "h-5 w-5",
                          isActive || submenuOpen ? "text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground))] group-hover:text-white"
                        )
                      }
                    ),
                    overdueCount > 0 && /* @__PURE__ */ jsx("span", { className: "absolute -top-1.5 -right-1.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold leading-none text-white", children: overdueCount > 99 ? "99+" : overdueCount })
                  ] }),
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: cn(
                        "max-w-full text-center break-words",
                        isActive || submenuOpen ? "text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground))] group-hover:text-white"
                      ),
                      children: item.label
                    }
                  )
                ]
              }
            ),
            submenuOpen && /* @__PURE__ */ jsx(
              "div",
              {
                ref: submenuRef,
                className: "absolute left-full top-0 z-50 ml-3 w-44 rounded-lg border bg-popover py-1 shadow-floating",
                children: peopleSubmenu.map((sub) => {
                  const subActive = location.pathname.startsWith(sub.path);
                  return /* @__PURE__ */ jsxs(
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
                        /* @__PURE__ */ jsx(sub.icon, { className: "h-4 w-4" }),
                        sub.label
                      ]
                    },
                    sub.path
                  );
                })
              }
            )
          ] }, item.path);
        }
        return /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => navigate(item.path),
            className: cn(
              navButtonBase,
              isActive ? navButtonActive : navButtonIdle
            ),
            title: item.label,
            children: [
              /* @__PURE__ */ jsx(
                item.icon,
                {
                  className: cn(
                    "h-5 w-5",
                    isActive ? "text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground))] group-hover:text-white"
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                "span",
                {
                  className: cn(
                    "max-w-full text-center break-words",
                    isActive ? "text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground))] group-hover:text-white"
                  ),
                  children: item.label
                }
              )
            ]
          },
          item.path
        );
      }) }),
      /* @__PURE__ */ jsx(
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
          children: (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsx(
            "img",
            {
              src: profile.avatar_url,
              alt: "Profile",
              className: "h-full w-full object-cover"
            }
          ) : /* @__PURE__ */ jsx(
            "span",
            {
              className: "select-none text-[13px] font-bold leading-none",
              style: { color: profileActive ? "hsl(var(--sidebar-bg))" : "hsl(var(--sidebar-fg))" },
              children: initials
            }
          )
        }
      )
    ] }),
    /* @__PURE__ */ jsx(Sheet, { open: mobileMenuOpen, onOpenChange: setMobileMenuOpen, children: /* @__PURE__ */ jsxs(SheetContent, { side: "left", className: "w-[22rem] max-w-[88vw] p-0", children: [
      /* @__PURE__ */ jsxs(SheetHeader, { className: "border-b px-5 py-4 text-left", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx(UERLogo, { width: 154 }) }),
        /* @__PURE__ */ jsx(SheetTitle, { children: "Navigation" }),
        /* @__PURE__ */ jsx(SheetDescription, { children: "Move between brokerage workspaces and account settings." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-5 overflow-y-auto px-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("div", { className: "px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Core" }),
          navItems.filter((item) => !item.hasSubmenu).map((item) => {
            const isActive = isPathActive(item.path);
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleMobileNavigate(item.path),
                className: cn(mobileListItemBase, isActive ? mobileListItemActive : mobileListItemIdle),
                children: [
                  /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4 shrink-0" }),
                  /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 text-left", children: item.label })
                ]
              },
              item.path
            );
          })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("div", { className: "px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "People Workspace" }),
          peopleSubmenu.map((item) => {
            const isActive = isPathActive(item.path);
            const showBadge = item.path === "/people" && overdueCount > 0;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => handleMobileNavigate(item.path),
                className: cn(mobileListItemBase, isActive ? mobileListItemActive : mobileListItemIdle),
                children: [
                  /* @__PURE__ */ jsxs("div", { className: "relative shrink-0", children: [
                    /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4" }),
                    showBadge ? /* @__PURE__ */ jsx("span", { className: "absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white", children: overdueCount > 99 ? "99+" : overdueCount }) : null
                  ] }),
                  /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 text-left", children: item.label })
                ]
              },
              item.path
            );
          })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx("div", { className: "px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Account" }),
          /* @__PURE__ */ jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleMobileNavigate("/profile"),
              className: cn(mobileListItemBase, profileActive ? mobileListItemActive : mobileListItemIdle),
              children: [
                /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-bold text-foreground", children: (profile == null ? void 0 : profile.avatar_url) ? /* @__PURE__ */ jsx("img", { src: profile.avatar_url, alt: "Profile", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsx("span", { children: initials }) }),
                /* @__PURE__ */ jsx("span", { className: "min-w-0 flex-1 text-left", children: "My Profile" })
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("nav", { className: "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85 lg:hidden", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-5", children: [
      mobileNavItems.map((item) => {
        const isActive = isPathActive(item.path);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => navigate(item.path),
            className: cn(
              "flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium transition-standard",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            ),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(item.icon, { className: "h-5 w-5" }),
                item.badge ? /* @__PURE__ */ jsx("span", { className: "absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-none text-white", children: item.badge > 99 ? "99+" : item.badge }) : null
              ] }),
              /* @__PURE__ */ jsx("span", { children: item.label })
            ]
          },
          item.path
        );
      }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => setMobileMenuOpen(true),
          className: "flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-2 text-[11px] font-medium text-muted-foreground transition-standard hover:text-foreground",
          children: [
            /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsx("span", { children: "More" })
          ]
        }
      )
    ] }) })
  ] });
}
function AppLayout() {
  return /* @__PURE__ */ jsxs("div", { className: "app-shell flex min-h-screen w-full flex-col lg:flex-row", children: [
    /* @__PURE__ */ jsx(AppSidebar, {}),
    /* @__PURE__ */ jsx("div", { className: "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-16 lg:min-h-screen lg:pb-0", children: /* @__PURE__ */ jsx(Outlet, {}) })
  ] });
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
      return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center", children: [
        /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5", children: /* @__PURE__ */ jsxs(
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
              /* @__PURE__ */ jsx("circle", { cx: "12", cy: "12", r: "10" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
              /* @__PURE__ */ jsx("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold text-foreground mb-2", children: "Something went wrong" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground max-w-md mb-6", children: this.state.message }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => this.setState({ hasError: false, message: "" }),
              className: "px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors",
              children: "Try Again"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => window.location.assign("/"),
              className: "px-4 py-2 rounded-lg border bg-background text-sm font-medium hover:bg-muted transition-colors",
              children: "Go to Home"
            }
          )
        ] })
      ] });
    }
    return this.props.children;
  }
}
const Toaster$1 = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
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
    }
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
const ToastViewport = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Viewport,
  {
    ref,
    className: cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    ),
    ...props
  }
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
  return /* @__PURE__ */ jsx(ToastPrimitives.Root, { ref, className: cn(toastVariants({ variant }), className), ...props });
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Action,
  {
    ref,
    className: cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors group-[.destructive]:border-muted/40 hover:bg-secondary group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 group-[.destructive]:focus:ring-destructive disabled:pointer-events-none disabled:opacity-50",
      className
    ),
    ...props
  }
));
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  ToastPrimitives.Close,
  {
    ref,
    className: cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 group-[.destructive]:text-red-300 hover:text-foreground group-[.destructive]:hover:text-red-50 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    ),
    "toast-close": "",
    ...props,
    children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
  }
));
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Title, { ref, className: cn("text-sm font-semibold", className), ...props }));
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(ToastPrimitives.Description, { ref, className: cn("text-sm opacity-90", className), ...props }));
ToastDescription.displayName = ToastPrimitives.Description.displayName;
function Toaster() {
  const { toasts } = useToast();
  return /* @__PURE__ */ jsxs(ToastProvider, { children: [
    toasts.map(function({ id, title, description, action, ...props }) {
      return /* @__PURE__ */ jsxs(Toast, { ...props, children: [
        /* @__PURE__ */ jsxs("div", { className: "grid gap-1", children: [
          title && /* @__PURE__ */ jsx(ToastTitle, { children: title }),
          description && /* @__PURE__ */ jsx(ToastDescription, { children: description })
        ] }),
        action,
        /* @__PURE__ */ jsx(ToastClose, {})
      ] }, id);
    }),
    /* @__PURE__ */ jsx(ToastViewport, {})
  ] });
}
const TooltipProvider = TooltipPrimitive.Provider;
const TooltipContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(
  TooltipPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  }
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
function RootLayout() {
  return /* @__PURE__ */ jsx(AppErrorBoundary, { children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
    /* @__PURE__ */ jsx(Toaster, {}),
    /* @__PURE__ */ jsx(Toaster$1, {}),
    /* @__PURE__ */ jsx(Outlet, {})
  ] }) }) });
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
const SITE_URL = "https://unitedestatesagent.com";
const DEFAULT_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ea1221eb-a238-4087-9d8a-e039199b22b7/id-preview-b44d7743--c987c87c-e16f-4694-9045-0ccdf362905d.lovable.app-1773887688710.png";
function SeoHead({ title, description, path, image = DEFAULT_IMAGE, structuredData }) {
  const url = `${SITE_URL}${path}`;
  return /* @__PURE__ */ jsxs(Head, { children: [
    /* @__PURE__ */ jsx("title", { children: title }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: description }),
    /* @__PURE__ */ jsx("link", { rel: "canonical", href: url }),
    /* @__PURE__ */ jsx("meta", { property: "og:title", content: title }),
    /* @__PURE__ */ jsx("meta", { property: "og:description", content: description }),
    /* @__PURE__ */ jsx("meta", { property: "og:url", content: url }),
    /* @__PURE__ */ jsx("meta", { property: "og:image", content: image }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:title", content: title }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:description", content: description }),
    /* @__PURE__ */ jsx("meta", { name: "twitter:image", content: image }),
    structuredData && /* @__PURE__ */ jsx("script", { type: "application/ld+json", children: JSON.stringify(structuredData) })
  ] });
}
const Accordion = AccordionPrimitive.Root;
const AccordionItem = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Item, { ref, className: cn("border-b", className), ...props }));
AccordionItem.displayName = "AccordionItem";
const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(AccordionPrimitive.Header, { className: "flex", children: /* @__PURE__ */ jsxs(
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
      /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 shrink-0 transition-transform duration-200" })
    ]
  }
) }));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;
const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsx(
  AccordionPrimitive.Content,
  {
    ref,
    className: "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
    ...props,
    children: /* @__PURE__ */ jsx("div", { className: cn("pb-4 pt-0", className), children })
  }
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;
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
function Index() {
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is a 100% commission brokerage, and how does it work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A 100% commission brokerage lets licensed real estate agents keep every dollar they earn from every deal, no commission splits, no desk fees, no deductions. At United Estates Realty, you pay one simple monthly fee and walk away from every closing with your full commission. It is the most profitable way for real estate agents to do business."
        }
      },
      {
        "@type": "Question",
        name: "How does United Estates Realty make money if agents keep 100%?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Simply, we charge a low flat monthly membership fee instead of taking a cut of your commissions. No splits, no transaction fees, no hidden charges. You keep 100% of every commission you earn, every single time."
        }
      },
      {
        "@type": "Question",
        name: "Is United Estates Realty available in my state?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "United Estates Realty is currently serving licensed real estate agents across Florida, from Miami, Orlando, Tampa, Jacksonville, and Fort Lauderdale. Nationwide expansion to Texas, Georgia, New York, and California is coming soon. Join today and start keeping 100% of your commissions."
        }
      },
      {
        "@type": "Question",
        name: "Can a new real estate agent join United Estates Realty?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, United Estates Realty welcomes both newly licensed agents looking to hang their license and experienced agents tired of losing thousands in commission splits. No experience minimum, no production requirements. Just a better, more profitable brokerage for every Florida real estate agent."
        }
      },
      {
        "@type": "Question",
        name: "Does United Estates Realty charge any transaction fees?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Zero transaction fees guaranteed. No per-deal charges, no closing fees, no E&O fees per transaction. You close the deal, you keep the full commission. Combined with our 100% commission structure, Florida agents save thousands every year compared to a traditional brokerage."
        }
      }
    ]
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "United Estates Realty — Florida's 100% Commission Brokerage",
        description: "Join Florida's top flat-fee brokerage. Licensed agents keep 100% of every commission for just $98/month. No splits, no transaction fees, no desk fees.",
        path: "/",
        structuredData: faqSchema
      }
    ),
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 border-b bg-background", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", className: "flex items-center", "aria-label": "United Estates Realty", children: /* @__PURE__ */ jsx(UERLogo, { width: 188, className: "w-[65px] sm:w-[132px] lg:w-[168px]" }) }),
      /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", className: "transition-colors hover:text-primary", children: "Home" }),
        /* @__PURE__ */ jsx(Link, { to: "/why-us", className: "transition-colors hover:text-primary", children: "Why Us" }),
        /* @__PURE__ */ jsx(Link, { to: "/case-studies", className: "transition-colors hover:text-primary", children: "Case Studies" }),
        /* @__PURE__ */ jsx("a", { href: "#pricing", className: "transition-colors hover:text-primary", children: "Pricing" }),
        /* @__PURE__ */ jsx("a", { href: "#software", className: "transition-colors hover:text-primary", children: "Software" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex md:items-center md:gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", asChild: true, className: "px-2.5 sm:px-4", children: /* @__PURE__ */ jsx(Link, { to: "/auth", children: "Agent Login" }) }),
          /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: primaryHref, children: primaryLabel }) })
        ] }),
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", className: "md:hidden", children: /* @__PURE__ */ jsx(Link, { to: primaryHref, children: primaryLabel }) }),
        /* @__PURE__ */ jsxs(Sheet, { children: [
          /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", "aria-label": "Open menu", children: /* @__PURE__ */ jsx(Menu, { className: "h-6 w-6" }) }) }),
          /* @__PURE__ */ jsx(SheetContent, { side: "right", className: "w-72", children: /* @__PURE__ */ jsxs("nav", { className: "mt-8 flex flex-col gap-1 text-base", children: [
            /* @__PURE__ */ jsx(Link, { to: "/", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Home" }),
            /* @__PURE__ */ jsx(Link, { to: "/why-us", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Why Us" }),
            /* @__PURE__ */ jsx(Link, { to: "/case-studies", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Case Studies" }),
            /* @__PURE__ */ jsx("a", { href: "/#pricing", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Pricing" }),
            /* @__PURE__ */ jsx("a", { href: "/#software", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Software" }),
            /* @__PURE__ */ jsx(Link, { to: "/auth", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Agent Login" }),
            /* @__PURE__ */ jsx(Link, { to: primaryHref, className: "mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: primaryLabel })
          ] }) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx("section", { className: "relative overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "relative min-h-[60vh] sm:min-h-[78vh]", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/home-hero.jpg",
            alt: "United Estates Realty",
            width: 1600,
            height: 1067,
            fetchPriority: "high",
            className: "absolute inset-0 h-full w-full object-cover"
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "absolute inset-0",
            style: {
              backgroundImage: "linear-gradient(180deg, rgba(8,15,29,0.52) 0%, rgba(8,15,29,0.68) 50%, rgba(8,15,29,0.82) 100%), linear-gradient(90deg, rgba(8,15,29,0.88) 0%, rgba(8,15,29,0.60) 45%, rgba(8,15,29,0.20) 100%)"
            }
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "relative mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-8 sm:min-h-[78vh] sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pb-24", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.2em] text-white/70", children: "United Estates Realty - Licensed Brokerage" }),
          /* @__PURE__ */ jsx("h1", { className: "mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-[3.25rem]", children: "Stop Giving Away Your Commissions. Keep 100% and zero transaction fees." }),
          /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg", children: "Get the best real estate CRM and brokerage platform for just $98/month. One flat fee, no per-seat pricing, no add-ons, no commission splits. Everything you need to close more deals in one place." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsx(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: primaryHref, children: [
              primaryLabel,
              /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
            ] }) }),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "lg",
                variant: "outline",
                asChild: true,
                className: "border-white/40 bg-white/10 text-white hover:bg-white/18 hover:text-white",
                children: /* @__PURE__ */ jsx("a", { href: "#pricing", children: "See Pricing" })
              }
            )
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "border-b bg-muted/40", children: /* @__PURE__ */ jsx("div", { className: "mx-auto grid max-w-6xl divide-y px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8", children: [
        { stat: "100%", label: "Commission you keep" },
        { stat: "$98", label: "Flat monthly fee" },
        { stat: "$0", label: "Transaction fees" }
      ].map(({ stat, label }) => /* @__PURE__ */ jsxs("div", { className: "px-6 py-8 text-center", children: [
        /* @__PURE__ */ jsx("p", { className: "text-4xl font-bold text-primary", children: stat }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm font-medium text-muted-foreground", children: label })
      ] }, label)) }) }),
      /* @__PURE__ */ jsx("section", { id: "why-us", className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Why Agents Join" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "A brokerage built around the agent, not around the office overhead." }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Most brokerages charge you a monthly fee and then take a cut of every deal on top of it. We don't. One flat fee, real software, and you keep your commissions." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-8 md:grid-cols-2", children: whyUs.map(({ heading, body }) => /* @__PURE__ */ jsxs("div", { className: "border-l-2 border-primary pl-6", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold text-foreground", children: heading }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-muted-foreground", children: body })
        ] }, heading)) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { id: "pricing", className: "border-y bg-muted/30 py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Pricing" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Simple pricing. No surprises." }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "One plan. Every agent pays the same flat monthly rate and gets full access to everything - software, support, and the brokerage." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-10 max-w-md", children: /* @__PURE__ */ jsxs("div", { className: "border-2 border-primary bg-background p-8", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground", children: "Agent Membership" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-end gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-5xl font-bold text-foreground", children: "$98" }),
            /* @__PURE__ */ jsx("span", { className: "mb-1 text-lg text-muted-foreground", children: "/ month" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-muted-foreground", children: "No transaction fees. No desk fees. No royalties." }),
          /* @__PURE__ */ jsx("ul", { className: "mt-8 space-y-3", children: [
            "Keep 100% of your commission - every closing, no exceptions",
            "No transaction fees. Not $100. Not $50. Zero.",
            "Licensed brokerage - hang your license here",
            "Full transaction management software included",
            "CRM, listings, marketing, and calendar tools",
            "Referral program - earn $20/mo per active agent you refer",
            "Brokerage support and compliance"
          ].map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-3 text-sm", children: [
            /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }),
            /* @__PURE__ */ jsx("span", { className: "text-foreground", children: item })
          ] }, item)) }),
          /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", className: "w-full", children: /* @__PURE__ */ jsxs(Link, { to: "/signup", children: [
            "Join United Estates Realty",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) }) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { id: "software", className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-12 lg:grid-cols-2 lg:items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "The Software" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Everything you need to run your business, built in." }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Your membership includes full access to the United Estates Realty agent platform. Not a third-party tool - our own software, built specifically for how agents work." }),
          /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/signup", children: [
            "Get Started",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) }) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: softwareFeatures.map((feature) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 border bg-muted/30 px-4 py-3", children: [
          /* @__PURE__ */ jsx(Check, { className: "mt-0.5 h-4 w-4 shrink-0 text-primary" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground", children: feature })
        ] }, feature)) })
      ] }) }) }),
      /* @__PURE__ */ jsx("section", { className: "border-y bg-muted/40 py-16 sm:py-20", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-10 lg:grid-cols-2 lg:items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Referral Program" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Refer an agent. Earn every month they stay." }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Every agent you refer to United Estates Realty earns you $20 per month for as long as they keep their license here. Refer five agents and that's $100 a month - more than covering your own membership." }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "There's no cap, no expiration, and no approval process. Share your referral link and the tracking is automatic." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: [
          { step: "01", text: "Get your unique referral link from your agent dashboard." },
          { step: "02", text: "Share it with any licensed agent looking for a better brokerage." },
          { step: "03", text: "Earn $20 every month they stay active - automatically." }
        ].map(({ step, text }) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-5 border bg-background px-5 py-4", children: [
          /* @__PURE__ */ jsx("span", { className: "mt-0.5 min-w-[2rem] text-sm font-bold text-primary", children: step }),
          /* @__PURE__ */ jsx("p", { className: "text-sm leading-6 text-foreground", children: text })
        ] }, step)) })
      ] }) }) }),
      /* @__PURE__ */ jsx("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 border-l-2 border-primary pl-6 md:flex-row md:items-center md:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Coming Soon" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-2 text-2xl font-bold text-foreground sm:text-3xl", children: "Agent training, built into the platform." }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-base leading-7 text-muted-foreground", children: "We're building out a full training library for United Estates Realty agents — contracts, compliance, prospecting, and how to get the most out of the software. It'll be included with your membership, no extra cost." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-block border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary", children: "Training Coming Soon" }) })
      ] }) }) }),
      /* @__PURE__ */ jsx("section", { className: "border-b bg-muted/40 py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "FAQ" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Questions agents ask before they join." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-10 max-w-3xl", children: /* @__PURE__ */ jsxs(Accordion, { type: "single", collapsible: true, className: "w-full", children: [
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-1", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "What is a 100% commission brokerage, and how does it work?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "A 100% commission brokerage lets licensed real estate agents keep every dollar they earn from every deal, no commission splits, no desk fees, no deductions. At United Estates Realty, you pay one simple monthly fee and walk away from every closing with your full commission. It is the most profitable way for real estate agents to do business." })
          ] }),
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-2", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "How does United Estates Realty make money if agents keep 100%?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "Simply, we charge a low flat monthly membership fee instead of taking a cut of your commissions. No splits, no transaction fees, no hidden charges. You keep 100% of every commission you earn, every single time." })
          ] }),
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-3", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "Is United Estates Realty available in my state?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "United Estates Realty is currently serving licensed real estate agents across Florida, from Miami, Orlando, Tampa, Jacksonville, and Fort Lauderdale. Nationwide expansion to Texas, Georgia, New York, and California is coming soon. Join today and start keeping 100% of your commissions." })
          ] }),
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-4", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "Can a new real estate agent join United Estates Realty?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "Yes, United Estates Realty welcomes both newly licensed agents looking to hang their license and experienced agents tired of losing thousands in commission splits. No experience minimum, no production requirements. Just a better, more profitable brokerage for every Florida real estate agent." })
          ] }),
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-5", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "Does United Estates Realty charge any transaction fees?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "Zero transaction fees guaranteed. No per-deal charges, no closing fees, no E&O fees per transaction. You close the deal, you keep the full commission. Combined with our 100% commission structure, Florida agents save thousands every year compared to a traditional brokerage." })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "py-16 text-white sm:py-20", style: { backgroundColor: "hsl(var(--sidebar-bg))" }, children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold sm:text-4xl", children: "Stop giving away your commission. Join a brokerage that lets you keep it." }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-white/80", children: "100% commission. $98 a month flat. No transaction fees. No surprises. Join United Estates Realty today." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Button, { asChild: true, size: "lg", className: "bg-background text-foreground hover:bg-background/90", children: /* @__PURE__ */ jsxs(Link, { to: "/signup", children: [
            "Join the Brokerage",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsx(
            Button,
            {
              asChild: true,
              size: "lg",
              variant: "outline",
              className: "border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white",
              children: /* @__PURE__ */ jsx(Link, { to: "/auth", children: "Agent Login" })
            }
          )
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "border-t bg-background py-12", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-10 md:grid-cols-3 md:items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(UERLogo, { width: 160 }),
          /* @__PURE__ */ jsx("p", { className: "max-w-xs text-sm leading-6 text-muted-foreground", children: "A full-service licensed real estate brokerage. 100% commission, $98 a month, zero transaction fees." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Explore" }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/", className: "text-muted-foreground transition-colors hover:text-primary", children: "Home" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/why-us", className: "text-muted-foreground transition-colors hover:text-primary", children: "Why Us" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/case-studies", className: "text-muted-foreground transition-colors hover:text-primary", children: "Case Studies" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#pricing", className: "text-muted-foreground transition-colors hover:text-primary", children: "Pricing" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "#software", className: "text-muted-foreground transition-colors hover:text-primary", children: "Software" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/auth", className: "text-muted-foreground transition-colors hover:text-primary", children: "Agent Login" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/signup", className: "text-muted-foreground transition-colors hover:text-primary", children: "Sign Up" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Follow Us" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#",
                "aria-label": "Facebook",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsx(Facebook, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#",
                "aria-label": "LinkedIn",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsx(Linkedin, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#",
                "aria-label": "Instagram",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsx(Instagram, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#",
                "aria-label": "TikTok",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: "h-4 w-4", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52V7.08a4.85 4.85 0 0 1-1.84-.39z" }) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Email Us" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "mailto:brokerage@unitedestatesagent.com",
                className: "mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary",
                children: "brokerage@unitedestatesagent.com"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " United Estates Realty. Licensed Real Estate Brokerage."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Equal Housing Opportunity" })
      ] })
    ] }) })
  ] });
}
const tevelFounder = "/assets/tevel-founder-BenHEmtK.webp";
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Why Florida Real Estate Agents Choose United Estates Realty",
        description: "Why Florida agents choose United Estates Realty. Keep 100% commissions, $98/month flat fee, zero transaction fees, full CRM + brokerage support. No contracts.",
        path: "/why-us"
      }
    ),
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 border-b bg-background", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", className: "flex items-center", "aria-label": "United Estates Realty", children: /* @__PURE__ */ jsx(UERLogo, { width: 188, className: "w-[65px] sm:w-[132px] lg:w-[168px]" }) }),
      /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", className: "transition-colors hover:text-primary", children: "Home" }),
        /* @__PURE__ */ jsx(Link, { to: "/why-us", className: "font-medium text-primary", children: "Why Us" }),
        /* @__PURE__ */ jsx(Link, { to: "/case-studies", className: "transition-colors hover:text-primary", children: "Case Studies" }),
        /* @__PURE__ */ jsx("a", { href: "/#pricing", className: "transition-colors hover:text-primary", children: "Pricing" }),
        /* @__PURE__ */ jsx("a", { href: "/#software", className: "transition-colors hover:text-primary", children: "Software" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex md:items-center md:gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", asChild: true, className: "px-2.5 sm:px-4", children: /* @__PURE__ */ jsx(Link, { to: "/auth", children: "Agent Login" }) }),
          /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: primaryHref, children: primaryLabel }) })
        ] }),
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", className: "md:hidden", children: /* @__PURE__ */ jsx(Link, { to: primaryHref, children: primaryLabel }) }),
        /* @__PURE__ */ jsxs(Sheet, { children: [
          /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", "aria-label": "Open menu", children: /* @__PURE__ */ jsx(Menu, { className: "h-6 w-6" }) }) }),
          /* @__PURE__ */ jsx(SheetContent, { side: "right", className: "w-72", children: /* @__PURE__ */ jsxs("nav", { className: "mt-8 flex flex-col gap-1 text-base", children: [
            /* @__PURE__ */ jsx(Link, { to: "/", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Home" }),
            /* @__PURE__ */ jsx(Link, { to: "/why-us", className: "rounded-md px-3 py-2 font-medium text-primary transition-colors hover:bg-muted", children: "Why Us" }),
            /* @__PURE__ */ jsx(Link, { to: "/case-studies", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Case Studies" }),
            /* @__PURE__ */ jsx("a", { href: "/#pricing", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Pricing" }),
            /* @__PURE__ */ jsx("a", { href: "/#software", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Software" }),
            /* @__PURE__ */ jsx(Link, { to: "/auth", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Agent Login" }),
            /* @__PURE__ */ jsx(Link, { to: primaryHref, className: "mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: primaryLabel })
          ] }) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("main", { children: [
      /* @__PURE__ */ jsx("section", { className: "border-b bg-muted/30 py-16 sm:py-24", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]", children: "Why Florida Real Estate Agents Choose United Estates Realty" }),
        /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg", children: "Most brokerages charge you a monthly fee and then take a cut of every deal on top of it. We don't. One flat fee, real software, and you keep every dollar you earn." }),
        /* @__PURE__ */ jsx("div", { className: "mt-8", children: /* @__PURE__ */ jsx(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: primaryHref, children: [
          "Join United Estates Realty",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
        ] }) }) })
      ] }) }) }),
      /* @__PURE__ */ jsx("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "The Difference" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Six reasons agents switch and never look back." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3", children: differentiators.map(({ icon: Icon, heading, body }) => /* @__PURE__ */ jsxs("div", { className: "border bg-muted/20 p-6", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center border bg-background", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5 text-primary" }) }),
          /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold text-foreground", children: heading }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm leading-6 text-muted-foreground", children: body })
        ] }, heading)) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "border-y bg-muted/30 py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Comparison" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "United Estates Realty vs. traditional brokerages." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-10 overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[520px] border-collapse text-left", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 text-sm font-semibold text-muted-foreground", children: "Feature" }),
            /* @__PURE__ */ jsx("th", { className: "py-3 pr-4 text-sm font-semibold text-primary", children: "United Estates Realty" }),
            /* @__PURE__ */ jsx("th", { className: "py-3 text-sm font-semibold text-muted-foreground", children: "Traditional Brokerage" })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: comparisonRows.map(({ feature, uer, traditional }) => /* @__PURE__ */ jsxs("tr", { className: "border-b", children: [
            /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-sm font-medium text-foreground", children: feature }),
            /* @__PURE__ */ jsx("td", { className: "py-3 pr-4 text-sm text-foreground", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Check, { className: "h-4 w-4 shrink-0 text-primary" }),
              uer
            ] }) }),
            /* @__PURE__ */ jsx("td", { className: "py-3 text-sm text-muted-foreground", children: traditional })
          ] }, feature)) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Success Stories" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Real agents. Real results." }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-lg text-muted-foreground", children: "See how agents across the country are growing their business with United Estates Realty." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-10 grid gap-6 md:grid-cols-3", children: caseStudies.map((study) => /* @__PURE__ */ jsxs("div", { className: "group border bg-muted/20 p-6 transition-colors hover:border-primary/50", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium text-muted-foreground", children: [
            study.agentName,
            ", ",
            study.city
          ] }),
          /* @__PURE__ */ jsx("h3", { className: "mt-2 text-xl font-semibold text-foreground", children: study.headlineResult }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-muted-foreground", children: study.summary }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/case-studies/${study.slug}`,
              className: "mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline",
              children: [
                "Read full story",
                /* @__PURE__ */ jsx(ArrowUpRight, { className: "h-4 w-4" })
              ]
            }
          )
        ] }, study.slug)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-10", children: /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/case-studies", children: [
          "View all case studies",
          /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
        ] }) }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "border-y bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Leadership" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Why Tevel Built This" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-10 grid items-start gap-8 md:grid-cols-[280px_1fr]", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center md:items-start", children: [
            /* @__PURE__ */ jsx("div", { className: "h-64 w-64 overflow-hidden border bg-muted/30 sm:h-72 sm:w-72", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: tevelFounder,
                alt: "Tevel Herbstman, Founder & Managing Broker of United Estates Realty",
                className: "h-full w-full object-cover",
                loading: "lazy"
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "mt-4 text-center md:text-left", children: [
              /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold text-foreground", children: "Tevel Herbstman" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Founder & Managing Broker" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-base leading-7 text-muted-foreground", children: [
            /* @__PURE__ */ jsx("p", { children: "Tevel Herbstman was a real estate agent just like you." }),
            /* @__PURE__ */ jsx("p", { children: "He worked hard. He chased leads, managed clients and closed deals. And every single month, without fail, the bills came in." }),
            /* @__PURE__ */ jsx("p", { children: "First, the monthly subscription fees. Not cheap but fine, tools cost money. He paid." }),
            /* @__PURE__ */ jsx("p", { children: "Then came the transaction fees. Every deal he closed, a percentage disappeared before he even saw it. Not because he did anything wrong. Just because the platform decided it deserved a cut of his work." }),
            /* @__PURE__ */ jsx("p", { children: "Then came the commission split. A portion of every hard-earned commission is gone. To a company that never made a single phone call, never sat in a single meeting, never chased a single client." }),
            /* @__PURE__ */ jsx("p", { children: 'And if you wanted a basic feature that should have been included from day one? That was another charge. Another tier. Another "upgrade."' }),
            /* @__PURE__ */ jsx("p", { children: "Tevel Herbstman looked at his earnings one evening and did the math. The subscriptions. The transaction fees. The commission cuts. The add-ons. The numbers were shocking, not because any single charge was outrageous, but because they never stopped. Every direction he turned, someone had their hand in his pocket." }),
            /* @__PURE__ */ jsx("p", { children: "He was not just paying to use a tool. He was paying a tax on his own success." }),
            /* @__PURE__ */ jsx("p", { children: "That was the moment everything changed." }),
            /* @__PURE__ */ jsx("p", { children: "Tevel Herbstman did not build United Estates Realty because he saw a market opportunity. He built it because he was furious — and he knew every agent reading this feels the same way." }),
            /* @__PURE__ */ jsx("p", { className: "italic text-foreground", children: '"I was tired of working hard and watching my earnings disappear into fees I never agreed to. Every time I closed a deal, someone else was already waiting to take their cut. I built this because agents deserve to keep what they earn." — Tevel' }),
            /* @__PURE__ */ jsx("p", { className: "text-foreground", children: "United Estates Realty was built by an agent who got tired of paying for everything and keeping nothing. That is why we built something different — and that is why it will always stay that way." })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "border-y bg-muted/40 py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
        /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "FAQ" }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-3xl font-bold text-foreground sm:text-4xl", children: "Questions agents ask before they join." })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-10 max-w-3xl", children: /* @__PURE__ */ jsxs(Accordion, { type: "single", collapsible: true, className: "w-full", children: [
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-1", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "What is a 100% commission brokerage, and how does it work?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "A 100% commission brokerage lets licensed real estate agents keep every dollar they earn from every deal, no commission splits, no desk fees, no deductions. At United Estates Realty, you pay one simple monthly fee and walk away from every closing with your full commission. It is the most profitable way for real estate agents to do business." })
          ] }),
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-2", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "How does United Estates Realty make money if agents keep 100%?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "Simply, we charge a low flat monthly membership fee instead of taking a cut of your commissions. No splits, no transaction fees, no hidden charges. You keep 100% of every commission you earn, every single time." })
          ] }),
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-3", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "Is United Estates Realty available in my state?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "United Estates Realty is currently serving licensed real estate agents across Florida, from Miami, Orlando, Tampa, Jacksonville, and Fort Lauderdale. Nationwide expansion to Texas, Georgia, New York, and California is coming soon. Join today and start keeping 100% of your commissions." })
          ] }),
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-4", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "Can a new real estate agent join United Estates Realty?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "Yes, United Estates Realty welcomes both newly licensed agents looking to hang their license and experienced agents tired of losing thousands in commission splits. No experience minimum, no production requirements. Just a better, more profitable brokerage for every Florida real estate agent." })
          ] }),
          /* @__PURE__ */ jsxs(AccordionItem, { value: "item-5", children: [
            /* @__PURE__ */ jsx(AccordionTrigger, { className: "text-left text-base font-semibold text-foreground", children: "Does United Estates Realty charge any transaction fees?" }),
            /* @__PURE__ */ jsx(AccordionContent, { className: "text-sm leading-6 text-muted-foreground", children: "Zero transaction fees guaranteed. No per-deal charges, no closing fees, no E&O fees per transaction. You close the deal, you keep the full commission. Combined with our 100% commission structure, Florida agents save thousands every year compared to a traditional brokerage." })
          ] })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsx("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "border-2 border-primary bg-muted/20 p-8 sm:p-12", children: /* @__PURE__ */ jsxs("div", { className: "max-w-2xl", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-3xl font-bold text-foreground sm:text-4xl", children: "Ready to keep 100% of your commissions?" }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-base leading-7 text-muted-foreground", children: "Join the brokerage that puts agents first. No commission splits. No transaction fees. No hidden charges. Just $98 a month and a platform built to help you close more deals." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: primaryHref, children: [
            primaryLabel,
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsx(Button, { size: "lg", variant: "outline", asChild: true, children: /* @__PURE__ */ jsx("a", { href: "/", children: "Back to Home" }) })
        ] })
      ] }) }) }) })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "border-t bg-background py-12", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-10 md:grid-cols-3 md:items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(UERLogo, { width: 160 }),
          /* @__PURE__ */ jsx("p", { className: "max-w-xs text-sm leading-6 text-muted-foreground", children: "A full-service licensed real estate brokerage. 100% commission, $98 a month, zero transaction fees." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Explore" }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/", className: "text-muted-foreground transition-colors hover:text-primary", children: "Home" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/why-us", className: "text-muted-foreground transition-colors hover:text-primary", children: "Why Us" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/case-studies", className: "text-muted-foreground transition-colors hover:text-primary", children: "Case Studies" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/#pricing", className: "text-muted-foreground transition-colors hover:text-primary", children: "Pricing" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/#software", className: "text-muted-foreground transition-colors hover:text-primary", children: "Software" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/auth", className: "text-muted-foreground transition-colors hover:text-primary", children: "Agent Login" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/signup", className: "text-muted-foreground transition-colors hover:text-primary", children: "Sign Up" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Follow Us" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#",
                "aria-label": "Facebook",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsx(Facebook, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#",
                "aria-label": "LinkedIn",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsx(Linkedin, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#",
                "aria-label": "Instagram",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsx(Instagram, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "#",
                "aria-label": "TikTok",
                className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary",
                children: /* @__PURE__ */ jsx("svg", { viewBox: "0 0 24 24", fill: "currentColor", className: "h-4 w-4", "aria-hidden": "true", children: /* @__PURE__ */ jsx("path", { d: "M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V9.01a8.16 8.16 0 0 0 4.77 1.52V7.08a4.85 4.85 0 0 1-1.84-.39z" }) })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Email Us" }),
            /* @__PURE__ */ jsx(
              "a",
              {
                href: "mailto:brokerage@unitedestatesagent.com",
                className: "mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary",
                children: "brokerage@unitedestatesagent.com"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " United Estates Realty. Licensed Real Estate Brokerage."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Equal Housing Opportunity" })
      ] })
    ] }) })
  ] });
}
function MarketingShell({ children, activeNav }) {
  const primaryHref = "/signup";
  const primaryLabel = "Sign Up";
  const navItem = (key, base = "transition-colors hover:text-primary") => activeNav === key ? "font-medium text-primary" : base;
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsx("header", { className: "sticky top-0 z-40 border-b bg-background", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsx(Link, { to: "/", className: "flex items-center", "aria-label": "United Estates Realty", children: /* @__PURE__ */ jsx(UERLogo, { width: 188, className: "w-[65px] sm:w-[132px] lg:w-[168px]" }) }),
      /* @__PURE__ */ jsxs("nav", { className: "hidden items-center gap-6 text-sm text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsx(Link, { to: "/", className: navItem("home"), children: "Home" }),
        /* @__PURE__ */ jsx(Link, { to: "/why-us", className: navItem("why-us"), children: "Why Us" }),
        /* @__PURE__ */ jsx(Link, { to: "/case-studies", className: navItem("case-studies"), children: "Case Studies" }),
        /* @__PURE__ */ jsx("a", { href: "/#pricing", className: navItem("pricing"), children: "Pricing" }),
        /* @__PURE__ */ jsx("a", { href: "/#software", className: navItem("software"), children: "Software" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "hidden md:flex md:items-center md:gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", asChild: true, className: "px-2.5 sm:px-4", children: /* @__PURE__ */ jsx(Link, { to: "/auth", children: "Agent Login" }) }),
          /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsx(Link, { to: primaryHref, children: primaryLabel }) })
        ] }),
        /* @__PURE__ */ jsx(Button, { asChild: true, size: "sm", className: "md:hidden", children: /* @__PURE__ */ jsx(Link, { to: primaryHref, children: primaryLabel }) }),
        /* @__PURE__ */ jsxs(Sheet, { children: [
          /* @__PURE__ */ jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", "aria-label": "Open menu", children: /* @__PURE__ */ jsx(Menu, { className: "h-6 w-6" }) }) }),
          /* @__PURE__ */ jsx(SheetContent, { side: "right", className: "w-72", children: /* @__PURE__ */ jsxs("nav", { className: "mt-8 flex flex-col gap-1 text-base", children: [
            /* @__PURE__ */ jsx(Link, { to: "/", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Home" }),
            /* @__PURE__ */ jsx(Link, { to: "/why-us", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Why Us" }),
            /* @__PURE__ */ jsx(Link, { to: "/case-studies", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Case Studies" }),
            /* @__PURE__ */ jsx("a", { href: "/#pricing", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Pricing" }),
            /* @__PURE__ */ jsx("a", { href: "/#software", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Software" }),
            /* @__PURE__ */ jsx(Link, { to: "/auth", className: "rounded-md px-3 py-2 transition-colors hover:bg-muted", children: "Agent Login" }),
            /* @__PURE__ */ jsx(Link, { to: primaryHref, className: "mt-2 rounded-md bg-primary px-3 py-2 text-center font-medium text-primary-foreground transition-colors hover:bg-primary/90", children: primaryLabel })
          ] }) })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("main", { children }),
    /* @__PURE__ */ jsx("footer", { className: "border-t bg-background py-12", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-10 md:grid-cols-3 md:items-start", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx(UERLogo, { width: 160 }),
          /* @__PURE__ */ jsx("p", { className: "max-w-xs text-sm leading-6 text-muted-foreground", children: "A full-service licensed real estate brokerage. 100% commission, $98 a month, zero transaction fees." })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Explore" }),
          /* @__PURE__ */ jsxs("ul", { className: "mt-4 space-y-2 text-sm", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/", className: "text-muted-foreground transition-colors hover:text-primary", children: "Home" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/why-us", className: "text-muted-foreground transition-colors hover:text-primary", children: "Why Us" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/case-studies", className: "text-muted-foreground transition-colors hover:text-primary", children: "Case Studies" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/#pricing", className: "text-muted-foreground transition-colors hover:text-primary", children: "Pricing" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", { href: "/#software", className: "text-muted-foreground transition-colors hover:text-primary", children: "Software" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/auth", className: "text-muted-foreground transition-colors hover:text-primary", children: "Agent Login" }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { to: "/signup", className: "text-muted-foreground transition-colors hover:text-primary", children: "Sign Up" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Follow Us" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("a", { href: "#", "aria-label": "Facebook", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsx(Facebook, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("a", { href: "#", "aria-label": "LinkedIn", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsx(Linkedin, { className: "h-4 w-4" }) }),
            /* @__PURE__ */ jsx("a", { href: "#", "aria-label": "Instagram", className: "flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary", children: /* @__PURE__ */ jsx(Instagram, { className: "h-4 w-4" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-8", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-foreground", children: "Email Us" }),
            /* @__PURE__ */ jsx("a", { href: "mailto:brokerage@unitedestatesagent.com", className: "mt-3 inline-block text-sm text-muted-foreground transition-colors hover:text-primary", children: "brokerage@unitedestatesagent.com" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "mt-10 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between", children: [
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " United Estates Realty. Licensed Real Estate Brokerage."
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Equal Housing Opportunity" })
      ] })
    ] }) })
  ] });
}
function CaseStudies() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return /* @__PURE__ */ jsxs(MarketingShell, { activeNav: "case-studies", children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Case Studies — Real Agents, Real Results | United Estates Realty",
        description: "See how real estate agents use United Estates Realty to eliminate unnecessary fees and keep more of every commission they earn.",
        path: "/case-studies"
      }
    ),
    /* @__PURE__ */ jsx("section", { className: "border-b bg-muted/30 py-16 sm:py-24", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-3xl", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "Case Studies" }),
      /* @__PURE__ */ jsx("h1", { className: "mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-[3.25rem]", children: "Real Agents. Real Results." }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg", children: "See how real estate agents use United Estates Realty to manage more client queries and close more deals." })
    ] }) }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "grid gap-8 md:grid-cols-2 lg:grid-cols-3", children: caseStudies.map((study) => /* @__PURE__ */ jsxs(
      "article",
      {
        className: "flex flex-col border bg-muted/20 p-6",
        children: [
          /* @__PURE__ */ jsxs("p", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: [
            study.agentName,
            ", ",
            study.city
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "mt-3 text-xl font-semibold leading-tight text-foreground", children: study.headlineResult }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm leading-6 text-muted-foreground", children: study.summary }),
          /* @__PURE__ */ jsx("div", { className: "mt-6 flex-1" }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/case-studies/${study.slug}`,
              className: "inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80",
              children: [
                "Read full story",
                /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
              ]
            }
          )
        ]
      },
      study.slug
    )) }) }) })
  ] });
}
const NotFound = () => {
  const location = useLocation();
  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Page Not Found | United Estates Realty",
        description: "The page you are looking for does not exist. Return to United Estates Realty homepage.",
        path: location.pathname
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-muted", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "mb-4 text-4xl font-bold", children: "404" }),
      /* @__PURE__ */ jsx("p", { className: "mb-4 text-xl text-muted-foreground", children: "Oops! Page not found" }),
      /* @__PURE__ */ jsx("a", { href: "/", className: "text-primary underline hover:text-primary/90", children: "Return to Home" })
    ] }) })
  ] });
};
function CaseStudyDetail() {
  const { slug } = useParams();
  const study = slug ? getCaseStudyBySlug(slug) : void 0;
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  if (!study) {
    return /* @__PURE__ */ jsx(NotFound, {});
  }
  return /* @__PURE__ */ jsxs(MarketingShell, { activeNav: "case-studies", children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: `${study.headlineResult} — ${study.agentName}, ${study.city} | United Estates Realty`,
        description: study.summary.slice(0, 160),
        path: `/case-studies/${study.slug}`
      }
    ),
    /* @__PURE__ */ jsx("section", { className: "border-b bg-muted/30 py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: "/case-studies",
          className: "inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary",
          children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
            "All case studies"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: [
        /* @__PURE__ */ jsx(Star, { className: "h-4 w-4 fill-primary text-primary" }),
        study.label
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "mt-4 text-3xl font-bold leading-tight text-foreground sm:text-4xl", children: study.headlineResult }),
      /* @__PURE__ */ jsx("p", { className: "mt-5 text-base leading-7 text-muted-foreground sm:text-lg", children: study.summary })
    ] }) }),
    /* @__PURE__ */ jsx("section", { className: "bg-background py-16 sm:py-20", children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-3xl space-y-12 px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "border bg-muted/20 p-6 sm:p-8", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.18em] text-primary", children: "The Snapshot" }),
        /* @__PURE__ */ jsxs("dl", { className: "mt-5 space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Agent" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.agent })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Location" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.location })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Experience" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.experience })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Situation" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.situation })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("dt", { className: "text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: "Result" }),
            /* @__PURE__ */ jsx("dd", { className: "mt-1 text-base text-foreground", children: study.snapshot.result })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground", children: "The Story" }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-4 text-base leading-7 text-muted-foreground", children: study.story.map((paragraph, i) => /* @__PURE__ */ jsx("p", { children: paragraph }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground", children: "What Changed" }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 space-y-4 text-base leading-7 text-muted-foreground", children: study.whatChanged.map((paragraph, i) => /* @__PURE__ */ jsx("p", { children: paragraph }, i)) })
      ] }),
      /* @__PURE__ */ jsxs("blockquote", { className: "border-l-2 border-primary pl-6 text-lg italic leading-8 text-foreground", children: [
        study.advice,
        /* @__PURE__ */ jsxs("footer", { className: "mt-3 text-sm not-italic text-muted-foreground", children: [
          "— ",
          study.agentName,
          ", ",
          study.city
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "border-t pt-10", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground", children: "Ready to write your own story?" }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 text-base leading-7 text-muted-foreground", children: "Join United Estates Realty and keep 100% of every commission for a flat $98/month." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsx(Button, { size: "lg", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/signup", children: [
            "Sign Up",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsx(Button, { size: "lg", variant: "outline", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/case-studies", children: "More case studies" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs leading-5 text-muted-foreground", children: study.disclaimer })
    ] }) })
  ] });
}
const Input = React.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-none ring-offset-background transition-[border-color,box-shadow,background-color] duration-150 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/90 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20 disabled:cursor-not-allowed disabled:bg-muted/35 disabled:text-muted-foreground",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const labelVariants = cva("text-[13px] font-medium leading-5 text-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(LabelPrimitive.Root, { ref, className: cn(labelVariants(), className), ...props }));
Label.displayName = LabelPrimitive.Root.displayName;
function AuthBrandPanel({ title, description, items }) {
  return /* @__PURE__ */ jsxs("div", { className: "relative hidden overflow-hidden border-r bg-white p-10 xl:flex xl:w-[46%] xl:flex-col xl:justify-between 2xl:p-12", children: [
    /* @__PURE__ */ jsx("div", { className: "relative z-10", children: /* @__PURE__ */ jsx(UERLogo, { width: 220 }) }),
    /* @__PURE__ */ jsxs("div", { className: "relative z-10 space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "max-w-lg whitespace-pre-line text-3xl font-bold leading-tight text-[hsl(var(--sidebar-bg))]", children: title }),
        /* @__PURE__ */ jsx("p", { className: "mt-3 max-w-sm text-sm leading-relaxed text-slate-600", children: description })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3", children: items.map((item) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--sidebar-bg)/0.08)] text-[hsl(var(--sidebar-bg))]", children: /* @__PURE__ */ jsx(item.icon, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-slate-700", children: item.text })
      ] }, item.text)) })
    ] }),
    /* @__PURE__ */ jsxs("p", { className: "relative z-10 text-xs text-slate-400", children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " United Estates Realty"
    ] })
  ] });
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col xl:flex-row", children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Agent Login | United Estates Realty",
        description: "Sign in to your United Estates Realty agent account to manage listings, transactions, contacts, and brokerage workflows.",
        path: "/auth"
      }
    ),
    /* @__PURE__ */ jsx(
      AuthBrandPanel,
      {
        title: "Welcome back.\nPick up where you left off.",
        description: "Your listings, transactions, contacts, and office workflows are waiting.",
        items: [
          { icon: Home, text: "All active deals and listings in one place" },
          { icon: User, text: "Your contacts, tasks, and office activity" },
          { icon: CheckCircle2, text: "Forms, signing, and brokerage workflows" }
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto bg-background px-4 py-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "text-center xl:hidden", children: /* @__PURE__ */ jsx(UERLogo, { width: 160 }) }),
      showForgotPassword ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground", children: "Reset your password" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Enter your email and we'll send a reset link." })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleForgotPassword, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "reset-email", children: "Email Address" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "reset-email",
                  type: "email",
                  placeholder: "you@example.com",
                  className: "pl-9",
                  value: resetEmail,
                  onChange: (e) => setResetEmail(e.target.value),
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Sending…" : "Send Reset Link" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              className: "w-full",
              onClick: () => setShowForgotPassword(false),
              children: "Back to sign in"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground", children: "Sign in to your account" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Access your United Estates Realty account." }),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
            Link,
            {
              to: "/signup",
              className: "inline-flex text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline",
              children: "Create an account"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleSignIn, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email Address" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "email",
                  type: "email",
                  placeholder: "you@example.com",
                  className: "pl-9",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowForgotPassword(true),
                  className: "text-xs text-muted-foreground hover:text-primary",
                  children: "Forgot password?"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "password",
                  type: showPassword ? "text" : "password",
                  placeholder: "••••••••",
                  className: "pl-9 pr-9",
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: () => setShowPassword((v) => !v),
                  className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                  tabIndex: -1,
                  children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full mt-2", disabled: loading, children: loading ? "Signing in…" : "Sign In" })
        ] })
      ] })
    ] }) }) })
  ] });
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
  return /* @__PURE__ */ jsxs("div", { className: "mt-2 space-y-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden flex gap-0.5", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsx(
        "div",
        {
          className: cn("flex-1 rounded-full transition-all", i <= passed ? strengthColor : "bg-muted")
        },
        i
      )) }),
      /* @__PURE__ */ jsx("span", { className: cn("text-xs font-medium", passed === 4 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"), children: strengthLabel })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-1", children: checks.map((c) => /* @__PURE__ */ jsxs("p", { className: cn("flex items-center gap-1 text-[11px]", c.pass ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"), children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: cn("w-3 h-3 shrink-0", c.pass ? "opacity-100" : "opacity-30") }),
      c.label
    ] }, c.label)) })
  ] });
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
    if (refCode && signInData.user) {
      await supabase.from("profiles").update({ referred_by_code: refCode }).eq("id", signInData.user.id);
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
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen flex flex-col xl:flex-row", children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Join United Estates Realty — $98/mo, 100% Commission",
        description: "Create your United Estates Realty agent account. Keep 100% of your commission for a flat $98/month — no desk fees, no transaction fees.",
        path: "/signup"
      }
    ),
    /* @__PURE__ */ jsx(
      AuthBrandPanel,
      {
        title: "Keep 100% of your commission.\n$98 a month, nothing else.",
        description: "United Estates Realty is a full-service licensed brokerage. One flat fee. No transaction fees. No desk fees. Everything you close stays with you.",
        items: [
          { icon: CheckCircle2, text: "100% commission - no per-deal charges, ever" },
          { icon: Home, text: "Full agent software included with membership" },
          { icon: User, text: "Earn $20/mo for every agent you refer" }
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto bg-background px-4 py-6 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsx("div", { className: "flex min-h-full items-center justify-center", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-6", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-1 text-center xl:hidden", children: /* @__PURE__ */ jsx(UERLogo, { width: 160 }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-foreground", children: "Create your account" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/auth", className: "text-primary font-medium hover:underline", children: "Sign in" })
        ] })
      ] }),
      refCode && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 px-3 py-2.5", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-emerald-700 dark:text-emerald-300", children: "Referral applied" }),
          /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-emerald-600/70 dark:text-emerald-400/70", children: [
            "Code: ",
            refCode
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSignUp, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "first-name", children: "First Name" }),
            /* @__PURE__ */ jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsx(User, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "first-name",
                  placeholder: "John",
                  className: "pl-9",
                  value: firstName,
                  onChange: (e) => setFirstName(e.target.value),
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "last-name", children: "Last Name" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "last-name",
                placeholder: "Doe",
                value: lastName,
                onChange: (e) => setLastName(e.target.value),
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email Address" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Mail, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "email",
                type: "email",
                placeholder: "you@example.com",
                className: "pl-9",
                value: email,
                onChange: (e) => setEmail(e.target.value),
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "license-digits", children: "Real Estate License Number" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              "select",
              {
                value: licensePrefix,
                onChange: (e) => setLicensePrefix(e.target.value),
                className: "h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20",
                "aria-label": "License type",
                children: [
                  /* @__PURE__ */ jsx("option", { value: "SL", children: "SL" }),
                  /* @__PURE__ */ jsx("option", { value: "BK", children: "BK" })
                ]
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "self-center text-muted-foreground", children: "-" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "license-digits",
                inputMode: "numeric",
                placeholder: "1234567",
                maxLength: 7,
                value: licenseDigits,
                onChange: (e) => setLicenseDigits(e.target.value.replace(/\D/g, "").slice(0, 7)),
                required: true
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
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
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword((v) => !v),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                tabIndex: -1,
                children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsx(PasswordStrength, { password })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "confirm-password", children: "Confirm Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
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
                onPaste: (e) => {
                  e.stopPropagation();
                  const text = e.clipboardData.getData("text");
                  if (text) {
                    e.preventDefault();
                    setConfirmPassword(text);
                  }
                },
                required: true
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowConfirm((v) => !v),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground",
                tabIndex: -1,
                children: showConfirm ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" })
              }
            )
          ] }),
          passwordMismatch && /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: "Passwords do not match" }),
          passwordsMatch && /* @__PURE__ */ jsxs("p", { className: "text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "w-3 h-3" }),
            " Passwords match"
          ] })
        ] }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            className: "w-full gap-2 mt-2",
            disabled: loading || !passwordReady || !passwordsMatch,
            children: loading ? "Creating account…" : /* @__PURE__ */ jsxs(Fragment, { children: [
              "Create Account ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxs("p", { className: "text-center text-[11px] text-muted-foreground leading-relaxed", children: [
          "By creating an account you agree to our",
          " ",
          /* @__PURE__ */ jsx("span", { className: "underline cursor-pointer", children: "Terms of Service" }),
          " ",
          "and",
          " ",
          /* @__PURE__ */ jsx("span", { className: "underline cursor-pointer", children: "Privacy Policy" }),
          "."
        ] })
      ] })
    ] }) }) })
  ] });
}
const lazyDefault = (loader) => async () => ({ Component: (await loader()).default });
const protectedLazy = (loader) => async () => {
  const Page = (await loader()).default;
  const Wrapped = () => /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(Page, {}) });
  return { Component: Wrapped };
};
const caseStudyStaticPaths = () => caseStudies.map((c) => `/case-studies/${c.slug}`);
const routes = [
  {
    path: "/",
    element: /* @__PURE__ */ jsx(RootLayout, {}),
    children: [
      // ---------- Public, pre-rendered for SEO ----------
      { index: true, element: /* @__PURE__ */ jsx(Index, {}), entry: "src/pages/Index.tsx" },
      { path: "why-us", element: /* @__PURE__ */ jsx(WhyUs, {}), entry: "src/pages/WhyUs.tsx" },
      {
        path: "case-studies",
        element: /* @__PURE__ */ jsx(CaseStudies, {}),
        entry: "src/pages/CaseStudies.tsx"
      },
      {
        path: "case-studies/:slug",
        element: /* @__PURE__ */ jsx(CaseStudyDetail, {}),
        entry: "src/pages/CaseStudyDetail.tsx",
        getStaticPaths: caseStudyStaticPaths
      },
      { path: "auth", element: /* @__PURE__ */ jsx(Auth, {}), entry: "src/pages/Auth.tsx" },
      { path: "signup", element: /* @__PURE__ */ jsx(Signup, {}), entry: "src/pages/Signup.tsx" },
      // ---------- Public but client-only (dynamic tokens / session) ----------
      {
        path: "reset-password",
        lazy: lazyDefault(() => import("./assets/ResetPassword-ZDFU7F6D.js"))
      },
      {
        path: "sign/:token",
        lazy: lazyDefault(() => import("./assets/SignDocument-wuJljrmz.js"))
      },
      // ---------- Onboarding (auth required) ----------
      {
        path: "onboarding/agreement",
        lazy: protectedLazy(() => import("./assets/OnboardingAgreement-BXHFbmhH.js"))
      },
      {
        path: "onboarding/billing",
        lazy: protectedLazy(() => import("./assets/OnboardingBilling-CXsujFEY.js"))
      },
      {
        path: "onboarding/deposit",
        lazy: protectedLazy(() => import("./assets/OnboardingDeposit-BGBPo-ow.js"))
      },
      {
        path: "onboarding/payment",
        lazy: protectedLazy(() => import("./assets/OnboardingPayment-Bd6f1p-H.js"))
      },
      // ---------- Protected app shell ----------
      {
        element: /* @__PURE__ */ jsx(ProtectedRoute, { children: /* @__PURE__ */ jsx(AppLayout, {}) }),
        children: [
          { path: "transactions", lazy: lazyDefault(() => import("./assets/Transactions-C3DCiSHU.js")) },
          { path: "transactions/new", lazy: lazyDefault(() => import("./assets/NewDeal-B6k1XlIF.js")) },
          { path: "transactions/:id", lazy: lazyDefault(() => import("./assets/DealDetail-m5V7Jklp.js")) },
          { path: "transactions/:id/marketing", lazy: lazyDefault(() => import("./assets/MarketingEditor-BCUX8dY0.js")) },
          { path: "people", lazy: lazyDefault(() => import("./assets/People-CEXA9FzL.js")) },
          { path: "tasks", lazy: lazyDefault(() => import("./assets/Tasks-DvYbJ20u.js")) },
          { path: "inbox", lazy: lazyDefault(() => import("./assets/Inbox-DXLJWPA0.js")) },
          { path: "listings", lazy: lazyDefault(() => import("./assets/Listings-DVcdnD5A.js")) },
          { path: "calendar", lazy: lazyDefault(() => import("./assets/Calendar-C5w-2mRR.js")) },
          { path: "finances", lazy: lazyDefault(() => import("./assets/Finances-DgDx3jAL.js")) },
          { path: "referral", lazy: lazyDefault(() => import("./assets/Referral-DjbQnc1m.js")) },
          { path: "contact-brokerage", lazy: lazyDefault(() => import("./assets/ContactBrokerage-BQ1ETZQN.js")) },
          { path: "admin/pdf-editor", lazy: lazyDefault(() => import("./assets/AdminPdfEditor-DsdR3eq8.js")) },
          { path: "admin/pdf-editor/:documentId", lazy: lazyDefault(() => import("./assets/AdminPdfEditor-DsdR3eq8.js")) },
          { path: "affiliate-links", lazy: lazyDefault(() => import("./assets/AffiliateLinks-mFSgAvhM.js")) },
          { path: "profile", lazy: lazyDefault(() => import("./assets/Profile-Br8laZQX.js")) }
        ]
      },
      // ---------- 404 ----------
      { path: "*", element: /* @__PURE__ */ jsx(NotFound, {}) }
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
