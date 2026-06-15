import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Circle, Landmark, Building2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { c as cn, a as useAuth, b as useOnboardingStatus, u as useToast, d as getFallbackOnboardingStatus, L as Label, I as Input, B as Button, s as supabase } from "../main.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-D3uDNDlq.js";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { v as validateRoutingNumber, a as validateAccountNumber, b as validateAccountConfirm } from "./bankingValidation-z--2UZA-.js";
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
const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(RadioGroupPrimitive.Root, { className: cn("grid gap-2", className), ...props, ref });
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Item,
    {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx(Circle, { className: "h-2.5 w-2.5 fill-current text-current" }) })
    }
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
function FieldHint({ value, result }) {
  if (!value) return null;
  return /* @__PURE__ */ jsxs("p", { className: cn("mt-1 flex items-center gap-1 text-xs", result.valid ? "text-emerald-600" : "text-destructive"), children: [
    result.valid ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 shrink-0" }) : /* @__PURE__ */ jsx(XCircle, { className: "h-3 w-3 shrink-0" }),
    result.message
  ] });
}
function OnboardingDeposit() {
  var _a;
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const { data: onboardingStatus, isLoading } = useOnboardingStatus({ user, profile, loading: authLoading });
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useBillingAccount, setUseBillingAccount] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [bankName, setBankName] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("checking");
  const [saving, setSaving] = useState(false);
  const currentStatus = onboardingStatus ?? getFallbackOnboardingStatus({
    user,
    profile
  });
  const defaultAgentName = useMemo(
    () => {
      var _a2;
      return ((_a2 = currentStatus.latestDepositAccount) == null ? void 0 : _a2.agent_name) || [profile == null ? void 0 : profile.first_name, profile == null ? void 0 : profile.last_name].filter(Boolean).join(" ").trim();
    },
    [(_a = currentStatus.latestDepositAccount) == null ? void 0 : _a.agent_name, profile == null ? void 0 : profile.first_name, profile == null ? void 0 : profile.last_name]
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
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-b-2 border-primary" }) });
  }
  const routingResult = validateRoutingNumber(routingNumber);
  const accountResult = validateAccountNumber(accountNumber);
  const confirmResult = validateAccountConfirm(accountNumber, confirmAccountNumber);
  const canSubmitDifferentAccount = agentName.trim().length > 0 && routingResult.valid && accountResult.valid && confirmResult.valid;
  const handleSubmit = async (event) => {
    var _a2;
    event.preventDefault();
    if (!agentName.trim()) return;
    if (useBillingAccount && !currentStatus.latestBillingAccount) {
      toast({ title: "Billing account missing", description: "Please finish billing first.", variant: "destructive" });
      return;
    }
    if (!useBillingAccount && !canSubmitDifferentAccount) return;
    setSaving(true);
    const depositPayload = useBillingAccount ? {
      owner_id: user.id,
      agent_name: agentName.trim(),
      bank_name: bankName.trim() || null,
      routing_number: currentStatus.latestBillingAccount.routing_number,
      account_number_last4: currentStatus.latestBillingAccount.account_number_last4,
      account_type: currentStatus.latestBillingAccount.account_type
    } : {
      owner_id: user.id,
      agent_name: agentName.trim(),
      bank_name: bankName.trim() || null,
      routing_number: routingNumber,
      account_number_last4: accountNumber.slice(-4),
      account_type: accountType
    };
    const existingDepositId = (_a2 = currentStatus.latestDepositAccount) == null ? void 0 : _a2.id;
    const depositResponse = existingDepositId ? await supabase.from("direct_deposits").update(depositPayload).eq("id", existingDepositId) : await supabase.from("direct_deposits").insert(depositPayload);
    if (depositResponse.error) {
      setSaving(false);
      toast({ title: "Could not save deposit account", description: depositResponse.error.message, variant: "destructive" });
      return;
    }
    const { error: profileError } = await supabase.from("profiles").update({
      subscription_status: "active",
      subscription_activated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", user.id);
    if (profileError) {
      setSaving(false);
      toast({ title: "Could not activate account", description: profileError.message, variant: "destructive" });
      return;
    }
    queryClient.setQueriesData({ queryKey: ["onboarding_status"] }, (existing) => ({
      ...existing && typeof existing === "object" ? existing : {},
      ...currentStatus,
      subscriptionStatus: "active",
      hasDepositAccount: true,
      latestDepositAccount: {
        id: existingDepositId ?? "pending-deposit-account",
        agent_name: depositPayload.agent_name,
        bank_name: depositPayload.bank_name,
        routing_number: depositPayload.routing_number,
        account_number_last4: depositPayload.account_number_last4,
        account_type: depositPayload.account_type
      }
    }));
    await (refreshProfile == null ? void 0 : refreshProfile());
    void queryClient.invalidateQueries({ queryKey: ["onboarding_status"] });
    toast({ title: "Welcome aboard", description: "Your brokerage account is active." });
    navigate("/transactions", { replace: true });
    setSaving(false);
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-xl", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary", children: /* @__PURE__ */ jsx(Landmark, { className: "h-7 w-7 text-primary-foreground" }) }),
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Step 3 of 3" }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: "Set Up Direct Deposit" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Choose where United Estates Realty should send your commission payouts." })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "agent-name", children: "Payee Name" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "agent-name",
            placeholder: "Name on the deposit account",
            value: agentName,
            onChange: (event) => setAgentName(event.target.value),
            required: true
          }
        )
      ] }),
      currentStatus.billingWaived && !currentStatus.latestBillingAccount ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900", children: [
        "Monthly billing is waived with promo code ",
        currentStatus.billingPromoCode ?? "on file",
        ". Enter the account where commissions should be deposited."
      ] }) : null,
      /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "deposit-bank-name", children: "Bank Name" }),
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(Building2, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "deposit-bank-name",
              placeholder: "Optional",
              value: bankName,
              onChange: (event) => setBankName(event.target.value),
              className: "pl-9"
            }
          )
        ] })
      ] }),
      useBillingAccount ? /* @__PURE__ */ jsxs("div", { className: "rounded-xl border bg-muted/20 px-4 py-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm font-medium text-foreground", children: [
          /* @__PURE__ */ jsx(ShieldCheck, { className: "h-4 w-4 text-emerald-500" }),
          "Billing account will also be used for deposits"
        ] }),
        currentStatus.latestBillingAccount ? /* @__PURE__ */ jsxs("div", { className: "mt-3 space-y-1 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx("p", { children: currentStatus.latestBillingAccount.account_holder_name }),
          /* @__PURE__ */ jsxs("p", { className: "capitalize", children: [
            currentStatus.latestBillingAccount.account_type,
            " - ending in ",
            currentStatus.latestBillingAccount.account_number_last4
          ] })
        ] }) : /* @__PURE__ */ jsx("p", { className: "mt-3 text-sm text-destructive", children: "No billing account is available yet." })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "deposit-routing", children: "Routing Number" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "deposit-routing",
              placeholder: "9-digit ABA routing number",
              maxLength: 9,
              value: routingNumber,
              onChange: (event) => setRoutingNumber(event.target.value.replace(/\D/g, "")),
              className: cn(
                routingNumber && (routingResult.valid ? "border-emerald-500 focus-visible:ring-emerald-500/30" : "border-destructive focus-visible:ring-destructive/30")
              ),
              required: !useBillingAccount
            }
          ),
          /* @__PURE__ */ jsx(FieldHint, { value: routingNumber, result: routingResult })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "deposit-account", children: "Account Number" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "deposit-account",
              placeholder: "Enter your account number",
              type: "password",
              value: accountNumber,
              onChange: (event) => setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 17)),
              className: cn(
                accountNumber && (accountResult.valid ? "border-emerald-500 focus-visible:ring-emerald-500/30" : "border-destructive focus-visible:ring-destructive/30")
              ),
              required: !useBillingAccount
            }
          ),
          /* @__PURE__ */ jsx(FieldHint, { value: accountNumber, result: accountResult })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "deposit-confirm-account", children: "Confirm Account Number" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "deposit-confirm-account",
              placeholder: "Re-enter account number",
              type: "password",
              value: confirmAccountNumber,
              onChange: (event) => setConfirmAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 17)),
              className: cn(
                confirmAccountNumber && (confirmResult.valid ? "border-emerald-500 focus-visible:ring-emerald-500/30" : "border-destructive focus-visible:ring-destructive/30")
              ),
              required: !useBillingAccount
            }
          ),
          /* @__PURE__ */ jsx(FieldHint, { value: confirmAccountNumber, result: confirmResult })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsx(Label, { children: "Account Type" }),
          /* @__PURE__ */ jsxs(RadioGroup, { value: accountType, onValueChange: setAccountType, className: "flex gap-6", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx(RadioGroupItem, { value: "checking", id: "deposit-checking" }),
              /* @__PURE__ */ jsx(Label, { htmlFor: "deposit-checking", className: "cursor-pointer font-normal", children: "Checking" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsx(RadioGroupItem, { value: "savings", id: "deposit-savings" }),
              /* @__PURE__ */ jsx(Label, { htmlFor: "deposit-savings", className: "cursor-pointer font-normal", children: "Savings" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "submit",
          className: "w-full",
          disabled: saving || !useBillingAccount && !canSubmitDifferentAccount || useBillingAccount && !currentStatus.latestBillingAccount,
          children: saving ? "Finishing setup..." : "Finish Setup"
        }
      )
    ] }) })
  ] }) });
}
export {
  OnboardingDeposit as default
};
