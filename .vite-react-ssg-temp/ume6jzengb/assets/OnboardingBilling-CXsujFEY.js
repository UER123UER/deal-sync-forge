import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { CreditCard, CheckCircle2, Building2, ArrowRight, ShieldCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { a as useAuth, b as useOnboardingStatus, u as useToast, d as getFallbackOnboardingStatus, B as Button, s as supabase } from "../main.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-D3uDNDlq.js";
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
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "h-8 w-8 animate-spin rounded-full border-b-2 border-primary" }) });
  }
  if (currentStatus.subscriptionStatus === "active" || currentStatus.billingWaived) {
    return /* @__PURE__ */ jsx(Navigate, { to: "/onboarding/deposit", replace: true });
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
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-muted/30 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-2xl", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary", children: /* @__PURE__ */ jsx(CreditCard, { className: "h-7 w-7 text-primary-foreground" }) }),
      /* @__PURE__ */ jsx("div", { className: "text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground", children: "Step 2 of 3" }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: "Activate Your Membership" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Complete your brokerage membership through Stripe ACH bank debit. Promo codes can be entered at checkout." })
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border bg-background p-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "United Estates Realty" }),
            /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Agent Membership" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("p", { className: "text-3xl font-bold", children: "$98" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "per month" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("ul", { className: "mt-5 space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-500" }),
            /* @__PURE__ */ jsx("span", { children: "Recurring monthly billing on the same day each month" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-500" }),
            /* @__PURE__ */ jsx("span", { children: "Cancel anytime by contacting the brokerage" })
          ] }),
          /* @__PURE__ */ jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(CheckCircle2, { className: "mt-0.5 h-4 w-4 shrink-0 text-emerald-500" }),
            /* @__PURE__ */ jsx("span", { children: "Apply a promo code on the Stripe checkout page" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3", children: [
        /* @__PURE__ */ jsx(Building2, { className: "mt-0.5 h-5 w-5 shrink-0 text-blue-600" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm leading-relaxed text-blue-800", children: [
          /* @__PURE__ */ jsx("p", { className: "font-medium", children: "ACH bank debit only" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-blue-700/90", children: "Credit and debit cards are not accepted. You'll connect your bank through Stripe's secure checkout to authorize the recurring monthly ACH debit. Have a promo code? Enter it on the Stripe checkout page." })
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          className: "w-full",
          size: "lg",
          onClick: handleCheckout,
          disabled: launching || verifying,
          children: verifying ? "Verifying subscription..." : launching ? "Redirecting to Stripe..." : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
            "Continue to Stripe Checkout",
            /* @__PURE__ */ jsx(ArrowRight, { className: "h-4 w-4" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx(ShieldCheck, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsx("span", { children: "Bank credentials are handled by Stripe and never stored on our servers." })
      ] })
    ] })
  ] }) });
}
export {
  OnboardingBilling as default
};
