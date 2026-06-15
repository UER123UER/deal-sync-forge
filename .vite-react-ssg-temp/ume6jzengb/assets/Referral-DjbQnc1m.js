import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { DollarSign, Users, RefreshCw, Gift, Check, Copy } from "lucide-react";
import { a as useAuth, s as supabase, I as Input, B as Button } from "../main.mjs";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, f as PageContent, g as PageStack, h as PageSection } from "./page-shell-DKoO3rjg.js";
import { M as MetricCard } from "./metric-card-CHaNCXgL.js";
import "vite-react-ssg";
import "react-router-dom";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "next-themes";
import "@radix-ui/react-toast";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
import "@radix-ui/react-label";
function Referral() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const earningsPerMonth = 20;
  useEffect(() => {
    if (!(profile == null ? void 0 : profile.referral_code)) {
      setTotalReferrals(0);
      setActiveReferrals(0);
      setTotalEarnings(0);
      setLoadingCount(false);
      return;
    }
    (async () => {
      const { data } = await supabase.from("profiles").select("id, subscription_status, subscription_activated_at").eq("referred_by_code", profile.referral_code);
      const rows = data ?? [];
      let earnings = 0;
      let active = 0;
      const now = Date.now();
      for (const r of rows) {
        if (r.subscription_status === "active" && r.subscription_activated_at) {
          active += 1;
          const start = new Date(r.subscription_activated_at).getTime();
          const months = Math.max(1, Math.floor((now - start) / (1e3 * 60 * 60 * 24 * 30)) + 1);
          earnings += months * earningsPerMonth;
        }
      }
      setTotalReferrals(rows.length);
      setActiveReferrals(active);
      setTotalEarnings(earnings);
      setLoadingCount(false);
    })();
  }, [profile == null ? void 0 : profile.referral_code]);
  const referralCode = (profile == null ? void 0 : profile.referral_code) ?? "-";
  const referralLink = (profile == null ? void 0 : profile.referral_code) ? `${window.location.origin}/signup?ref=${profile.referral_code}` : "";
  const copyTimerRef = useRef(null);
  useEffect(() => () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
  }, []);
  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).catch(() => {
    });
    setCopied(true);
    toast.success("Referral link copied!");
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopied(false), 2e3);
  };
  return /* @__PURE__ */ jsxs(PageShell, { children: [
    /* @__PURE__ */ jsx(PageHeader, { children: /* @__PURE__ */ jsx(
      PageHeaderHeading,
      {
        title: "Referral Program",
        meta: "Invite agents with one permanent code and track monthly recurring rewards."
      }
    ) }),
    /* @__PURE__ */ jsx(PageContent, { children: /* @__PURE__ */ jsxs(PageStack, { className: "max-w-5xl gap-6", children: [
      /* @__PURE__ */ jsx(
        PageSection,
        {
          title: "Referral Identity",
          description: "This code is tied to your profile and powers every referral link you share.",
          bodyClassName: "p-6",
          children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Your Referral Code" }),
              /* @__PURE__ */ jsx("p", { className: "font-mono text-3xl font-semibold tracking-widest text-primary", children: referralCode })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid gap-2 text-sm text-muted-foreground lg:text-right", children: [
              /* @__PURE__ */ jsx("p", { children: "Tied directly to your brokerage account." }),
              /* @__PURE__ */ jsx("p", { children: "Permanent, unique, and reusable across every signup flow." })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: DollarSign,
            label: "Total Earned",
            value: loadingCount ? "-" : `$${totalEarnings}`,
            description: "Accrued recurring rewards from active referred subscriptions.",
            tone: "primary"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: Users,
            label: "Total Referrals",
            value: loadingCount ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4 animate-spin text-muted-foreground" }),
              "Loading"
            ] }) : totalReferrals,
            description: loadingCount ? "Loading referral performance." : `${activeReferrals} currently active and contributing monthly rewards.`
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: Gift,
            label: "Per Active Referral",
            value: `$${earningsPerMonth}`,
            description: "Recurring monthly reward for each active paying subscription.",
            tone: "success"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        PageSection,
        {
          title: "Share Your Referral",
          description: "Use the QR code or direct link. Both resolve to the same tracked signup path.",
          bodyClassName: "p-6",
          children: /* @__PURE__ */ jsxs("div", { className: "grid gap-8 lg:grid-cols-2 lg:items-center", children: [
            /* @__PURE__ */ jsx("div", { className: "flex justify-center lg:justify-start", children: referralLink ? /* @__PURE__ */ jsx("div", { className: "rounded-xl border bg-white p-4 shadow-surface", children: /* @__PURE__ */ jsx(QRCodeSVG, { value: referralLink, size: 180, level: "M" }) }) : /* @__PURE__ */ jsx("div", { className: "flex h-52 w-52 items-center justify-center rounded-xl border bg-muted/30", children: /* @__PURE__ */ jsx(RefreshCw, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
              /* @__PURE__ */ jsxs("p", { className: "max-w-xl text-sm leading-6 text-muted-foreground", children: [
                "Earn ",
                /* @__PURE__ */ jsxs("span", { className: "font-semibold text-foreground", children: [
                  "$",
                  earningsPerMonth
                ] }),
                " every month for each referred agent who stays on an active subscription."
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    value: referralLink,
                    readOnly: true,
                    className: "font-mono text-sm",
                    placeholder: "Loading your referral link..."
                  }
                ),
                /* @__PURE__ */ jsxs(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    className: "gap-1.5 sm:min-w-28",
                    onClick: handleCopy,
                    disabled: !referralLink,
                    children: [
                      copied ? /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Copy, { className: "h-4 w-4" }),
                      copied ? "Copied" : "Copy Link"
                    ]
                  }
                )
              ] })
            ] })
          ] })
        }
      ),
      /* @__PURE__ */ jsx(
        PageSection,
        {
          title: "How It Works",
          description: "The referral flow stays simple: share the link, let the agent sign up, and recurring rewards post automatically.",
          bodyClassName: "p-6",
          children: /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: [
            "Share your referral link with fellow agents.",
            "They sign up using your unique code or referral URL.",
            "You earn $20 each month while their subscription stays active."
          ].map((step, index) => /* @__PURE__ */ jsxs("div", { className: "app-surface-subtle flex items-start gap-4 px-4 py-4", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary", children: index + 1 }),
            /* @__PURE__ */ jsx("p", { className: "text-sm leading-6 text-foreground", children: step })
          ] }, step)) })
        }
      )
    ] }) })
  ] });
}
export {
  Referral as default
};
