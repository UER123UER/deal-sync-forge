import { jsxDEV } from "react/jsx-dev-runtime";
import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { CreditCard, CheckCircle2, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { a as useAuth, b as useOnboardingStatus, u as useToast, d as getFallbackOnboardingStatus, B as Button, s as supabase } from "../main.mjs";
import { C as Card, a as CardHeader, d as CardTitle, b as CardDescription, c as CardContent } from "./card-DhvFoEG1.js";
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
function OnboardingBilling() {
  const { user, profile, loading: authLoading } = useAuth();
  const { data: onboardingStatus } = useOnboardingStatus({ user, profile, loading: authLoading });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [launching, setLaunching] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const status = params.get("status");
  const currentStatus = onboardingStatus ?? getFallbackOnboardingStatus({
    user,
    profile
  });
  useEffect(() => {
    if (status !== "success" || !user) return;
    let cancelled = false;
    const verify = async () => {
      setVerifying(true);
      for (let i = 0; i < 5; i++) {
        const { data, error } = await supabase.functions.invoke("check-subscription");
        if (!cancelled && !error && (data == null ? void 0 : data.subscribed)) {
          toast({ title: "Subscription active", description: "Welcome aboard!" });
          await queryClient.invalidateQueries({ queryKey: ["onboarding_status"] });
          await queryClient.invalidateQueries({ queryKey: ["profile"] });
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      if (!cancelled) {
        setVerifying(false);
        setParams({}, { replace: true });
      }
    };
    void verify();
    return () => {
      cancelled = true;
    };
  }, [status, user, queryClient, setParams, toast]);
  if (authLoading || !user) {
    return /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "h-8 w-8 animate-spin rounded-full border-b-2 border-primary" }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
      lineNumber: 65,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
      lineNumber: 64,
      columnNumber: 7
    }, this);
  }
  if (currentStatus.subscriptionStatus === "active" || currentStatus.billingWaived) {
    return /* @__PURE__ */ jsxDEV(Navigate, { to: "/onboarding/deposit", replace: true }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
      lineNumber: 71,
      columnNumber: 12
    }, this);
  }
  const handleCheckout = async () => {
    setLaunching(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data == null ? void 0 : data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      toast({
        title: "Could not start checkout",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
      setLaunching(false);
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-screen items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxDEV(Card, { className: "w-full max-w-2xl", children: [
    /* @__PURE__ */ jsxDEV(CardHeader, { className: "text-center", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary", children: /* @__PURE__ */ jsxDEV(CreditCard, { className: "h-7 w-7 text-primary-foreground" }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
        lineNumber: 99,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
        lineNumber: 98,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Step 2 of 3" }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
        lineNumber: 101,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(CardTitle, { className: "text-2xl", children: "Activate Your Membership" }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
        lineNumber: 102,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(CardDescription, { children: "Complete your brokerage membership through Stripe ACH bank debit. Promo codes can be entered at checkout." }, void 0, false, {
        fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
        lineNumber: 103,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
      lineNumber: 97,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "rounded-2xl border bg-background p-6", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "United Estates Realty" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 111,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-lg font-semibold", children: "Agent Membership" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 112,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
            lineNumber: 110,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxDEV("p", { className: "text-3xl font-bold", children: "$98" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 115,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "per month" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 116,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
            lineNumber: 114,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
          lineNumber: 109,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("ul", { className: "mt-5 space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-500" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 121,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: "Recurring monthly billing on the same day each month" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 122,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
            lineNumber: 120,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-500" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 125,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: "Cancel anytime by contacting the brokerage" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 126,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
            lineNumber: 124,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-500" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 129,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("span", { children: "Apply a promo code on the Stripe checkout page" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 130,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
            lineNumber: 128,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
          lineNumber: 119,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
        lineNumber: 108,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3", children: [
        /* @__PURE__ */ jsxDEV(Building2, { className: "mt-0.5 h-5 w-5 shrink-0 text-blue-600" }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
          lineNumber: 136,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "text-sm leading-relaxed text-blue-800", children: [
          /* @__PURE__ */ jsxDEV("p", { className: "font-medium", children: "ACH bank debit only" }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
            lineNumber: 138,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-blue-700/90", children: "Credit and debit cards are not accepted. You'll connect your bank through Stripe's secure checkout to authorize the recurring monthly ACH debit. Have a promo code? Enter it on the Stripe checkout page." }, void 0, false, {
            fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
            lineNumber: 139,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
          lineNumber: 137,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
        lineNumber: 135,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(
        Button,
        {
          type: "button",
          className: "w-full",
          size: "lg",
          onClick: handleCheckout,
          disabled: launching || verifying,
          children: verifying ? "Verifying subscription..." : launching ? "Redirecting to Stripe..." : /* @__PURE__ */ jsxDEV("span", { className: "inline-flex items-center gap-2", children: [
            "Continue to Stripe Checkout",
            /* @__PURE__ */ jsxDEV(ArrowRight, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
              lineNumber: 160,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
            lineNumber: 158,
            columnNumber: 15
          }, this)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
          lineNumber: 146,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxDEV(ShieldCheck, { className: "h-3.5 w-3.5" }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
          lineNumber: 166,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("span", { children: "Bank credentials are handled by Stripe and never stored on our servers." }, void 0, false, {
          fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
          lineNumber: 167,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
        lineNumber: 165,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
      lineNumber: 107,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
    lineNumber: 96,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/pages/OnboardingBilling.tsx",
    lineNumber: 95,
    columnNumber: 5
  }, this);
}
export {
  OnboardingBilling as default
};
