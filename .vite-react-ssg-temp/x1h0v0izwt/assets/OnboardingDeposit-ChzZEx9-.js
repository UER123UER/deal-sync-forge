import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Circle, Landmark, Building2, ShieldCheck, EyeOff, Eye, CheckCircle2, XCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { c as cn, a as useAuth, b as useOnboardingStatus, u as useToast, d as getFallbackOnboardingStatus, L as Label, I as Input, B as Button, s as supabase } from "../main.mjs";
import { C as Card, a as CardHeader, d as CardTitle, b as CardDescription, c as CardContent } from "./card-DhvFoEG1.js";
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
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxDEV(RadioGroupPrimitive.Root, { className: cn("grid gap-2", className), ...props, ref }, void 0, false, {
    fileName: "/dev-server/src/components/ui/radio-group.tsx",
    lineNumber: 11,
    columnNumber: 10
  }, void 0);
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxDEV(
    RadioGroupPrimitive.Item,
    {
      ref,
      className: cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsxDEV(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(Circle, { className: "h-2.5 w-2.5 fill-current text-current" }, void 0, false, {
        fileName: "/dev-server/src/components/ui/radio-group.tsx",
        lineNumber: 29,
        columnNumber: 9
      }, void 0) }, void 0, false, {
        fileName: "/dev-server/src/components/ui/radio-group.tsx",
        lineNumber: 28,
        columnNumber: 7
      }, void 0)
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/components/ui/radio-group.tsx",
      lineNumber: 20,
      columnNumber: 5
    },
    void 0
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
function FieldHint({ value, result }) {
  if (!value) return null;
  return /* @__PURE__ */ jsxDEV("p", { className: cn("mt-1 flex items-center gap-1 text-xs", result.valid ? "text-emerald-600" : "text-destructive"), children: [
    result.valid ? /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "h-3 w-3 shrink-0" }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
      lineNumber: 24,
      columnNumber: 23
    }, this) : /* @__PURE__ */ jsxDEV(XCircle, { className: "h-3 w-3 shrink-0" }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
      lineNumber: 24,
      columnNumber: 71
    }, this),
    result.message
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
    lineNumber: 23,
    columnNumber: 5
  }, this);
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
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [showConfirmAccountNumber, setShowConfirmAccountNumber] = useState(false);
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
    return /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "h-8 w-8 animate-spin rounded-full border-b-2 border-primary" }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
      lineNumber: 77,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
      lineNumber: 76,
      columnNumber: 7
    }, this);
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
  return /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-screen items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxDEV(Card, { className: "w-full max-w-xl", children: [
    /* @__PURE__ */ jsxDEV(CardHeader, { className: "text-center", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary", children: /* @__PURE__ */ jsxDEV(Landmark, { className: "h-7 w-7 text-primary-foreground" }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 171,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 170,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Step 3 of 3" }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 173,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(CardTitle, { className: "text-2xl", children: "Set Up Direct Deposit" }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 174,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(CardDescription, { children: "Choose where United Estates Realty should send your commission payouts." }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 175,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
      lineNumber: 169,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDEV("form", { onSubmit: handleSubmit, className: "space-y-5", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxDEV(Label, { htmlFor: "agent-name", children: "Payee Name" }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 180,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(
          Input,
          {
            id: "agent-name",
            placeholder: "Name on the deposit account",
            value: agentName,
            onChange: (event) => setAgentName(event.target.value),
            required: true
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 181,
            columnNumber: 15
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 179,
        columnNumber: 13
      }, this),
      currentStatus.billingWaived && !currentStatus.latestBillingAccount ? /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900", children: [
        "Monthly billing is waived with promo code ",
        currentStatus.billingPromoCode ?? "on file",
        ". Enter the account where commissions should be deposited."
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 191,
        columnNumber: 15
      }, this) : null,
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxDEV(Label, { htmlFor: "deposit-bank-name", children: "Bank Name" }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 197,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
          /* @__PURE__ */ jsxDEV(Building2, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 199,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(
            Input,
            {
              id: "deposit-bank-name",
              placeholder: "Optional",
              value: bankName,
              onChange: (event) => setBankName(event.target.value),
              className: "pl-9"
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
              lineNumber: 200,
              columnNumber: 17
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 198,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 196,
        columnNumber: 13
      }, this),
      useBillingAccount ? /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border bg-muted/20 px-4 py-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 text-sm font-medium text-foreground", children: [
          /* @__PURE__ */ jsxDEV(ShieldCheck, { className: "h-4 w-4 text-emerald-500" }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 213,
            columnNumber: 19
          }, this),
          "Billing account will also be used for deposits"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 212,
          columnNumber: 17
        }, this),
        currentStatus.latestBillingAccount ? /* @__PURE__ */ jsxDEV("div", { className: "mt-3 space-y-1 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxDEV("p", { children: currentStatus.latestBillingAccount.account_holder_name }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 218,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "capitalize", children: [
            currentStatus.latestBillingAccount.account_type,
            " - ending in ",
            currentStatus.latestBillingAccount.account_number_last4
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 219,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 217,
          columnNumber: 19
        }, this) : /* @__PURE__ */ jsxDEV("p", { className: "mt-3 text-sm text-destructive", children: "No billing account is available yet." }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 224,
          columnNumber: 19
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 211,
        columnNumber: 15
      }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "deposit-routing", children: "Routing Number" }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 230,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(
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
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
              lineNumber: 231,
              columnNumber: 19
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(FieldHint, { value: routingNumber, result: routingResult }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 245,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 229,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "deposit-account", children: "Account Number" }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 249,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                id: "deposit-account",
                placeholder: "Enter your account number",
                type: showAccountNumber ? "text" : "password",
                value: accountNumber,
                onChange: (event) => setAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 17)),
                className: cn(
                  "pr-10",
                  accountNumber && (accountResult.valid ? "border-emerald-500 focus-visible:ring-emerald-500/30" : "border-destructive focus-visible:ring-destructive/30")
                ),
                required: !useBillingAccount
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                lineNumber: 251,
                columnNumber: 21
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                tabIndex: -1,
                onClick: () => setShowAccountNumber((prev) => !prev),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none",
                children: showAccountNumber ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                  lineNumber: 272,
                  columnNumber: 44
                }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                  lineNumber: 272,
                  columnNumber: 77
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                lineNumber: 266,
                columnNumber: 21
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 250,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(FieldHint, { value: accountNumber, result: accountResult }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 275,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 248,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "deposit-confirm-account", children: "Confirm Account Number" }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 279,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(
              Input,
              {
                id: "deposit-confirm-account",
                placeholder: "Re-enter account number",
                type: showConfirmAccountNumber ? "text" : "password",
                value: confirmAccountNumber,
                onChange: (event) => setConfirmAccountNumber(event.target.value.replace(/\D/g, "").slice(0, 17)),
                className: cn(
                  "pr-10",
                  confirmAccountNumber && (confirmResult.valid ? "border-emerald-500 focus-visible:ring-emerald-500/30" : "border-destructive focus-visible:ring-destructive/30")
                ),
                required: !useBillingAccount
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                lineNumber: 281,
                columnNumber: 21
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                type: "button",
                tabIndex: -1,
                onClick: () => setShowConfirmAccountNumber((prev) => !prev),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none",
                children: showConfirmAccountNumber ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                  lineNumber: 302,
                  columnNumber: 51
                }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
                  fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                  lineNumber: 302,
                  columnNumber: 84
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                lineNumber: 296,
                columnNumber: 21
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 280,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(FieldHint, { value: confirmAccountNumber, result: confirmResult }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 305,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 278,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxDEV(Label, { children: "Account Type" }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 309,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV(RadioGroup, { value: accountType, onValueChange: setAccountType, className: "flex gap-6", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxDEV(RadioGroupItem, { value: "checking", id: "deposit-checking" }, void 0, false, {
                fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                lineNumber: 312,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "deposit-checking", className: "cursor-pointer font-normal", children: "Checking" }, void 0, false, {
                fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                lineNumber: 313,
                columnNumber: 23
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
              lineNumber: 311,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxDEV(RadioGroupItem, { value: "savings", id: "deposit-savings" }, void 0, false, {
                fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                lineNumber: 316,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV(Label, { htmlFor: "deposit-savings", className: "cursor-pointer font-normal", children: "Savings" }, void 0, false, {
                fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
                lineNumber: 317,
                columnNumber: 23
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
              lineNumber: 315,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
            lineNumber: 310,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 308,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
        lineNumber: 228,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV(
        Button,
        {
          type: "submit",
          className: "w-full",
          disabled: saving || !useBillingAccount && !canSubmitDifferentAccount || useBillingAccount && !currentStatus.latestBillingAccount,
          children: saving ? "Finishing setup..." : "Finish Setup"
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
          lineNumber: 324,
          columnNumber: 13
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
      lineNumber: 178,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
      lineNumber: 177,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
    lineNumber: 168,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/pages/OnboardingDeposit.tsx",
    lineNumber: 167,
    columnNumber: 5
  }, this);
}
export {
  OnboardingDeposit as default
};
