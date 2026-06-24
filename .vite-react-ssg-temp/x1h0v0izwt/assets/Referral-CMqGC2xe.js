import { jsxDEV } from "react/jsx-dev-runtime";
import { useState, useCallback, useEffect, useRef } from "react";
import { DollarSign, Users, RefreshCw, Gift, Check, Copy } from "lucide-react";
import { a as useAuth, s as supabase, B as Button, I as Input } from "../main.mjs";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, f as PageContent, g as PageStack, h as PageSection } from "./page-shell-BTk8AANV.js";
import { M as MetricCard } from "./metric-card-C-Gx_Bk9.js";
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
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
function Referral() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState(0);
  const [activeReferrals, setActiveReferrals] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const earningsPerMonth = 20;
  const loadStats = useCallback(async () => {
    if (!(profile == null ? void 0 : profile.referral_code)) {
      setTotalReferrals(0);
      setActiveReferrals(0);
      setTotalEarnings(0);
      setLoadingCount(false);
      return;
    }
    const { data, error } = await supabase.rpc("get_my_referral_stats");
    if (error) {
      console.error("get_my_referral_stats error", error);
      setLoadingCount(false);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    setTotalReferrals((row == null ? void 0 : row.total_referrals) ?? 0);
    setActiveReferrals((row == null ? void 0 : row.active_referrals) ?? 0);
    setTotalEarnings((row == null ? void 0 : row.total_earnings) ?? 0);
    setLoadingCount(false);
  }, [profile == null ? void 0 : profile.referral_code]);
  useEffect(() => {
    loadStats();
  }, [loadStats]);
  useEffect(() => {
    const onFocus = () => {
      loadStats();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [loadStats]);
  useEffect(() => {
    if (!(profile == null ? void 0 : profile.referral_code)) return;
    const channel = supabase.channel(`referrals-${profile.referral_code}`).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profiles", filter: `referred_by_code=eq.${profile.referral_code}` },
      () => {
        loadStats();
      }
    ).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile == null ? void 0 : profile.referral_code, loadStats]);
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
    toast.success("Referral stats refreshed");
  };
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
  return /* @__PURE__ */ jsxDEV(PageShell, { children: [
    /* @__PURE__ */ jsxDEV(PageHeader, { children: /* @__PURE__ */ jsxDEV(
      PageHeaderHeading,
      {
        title: "Referral Program",
        meta: "Invite agents with one permanent code and track monthly recurring rewards."
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Referral.tsx",
        lineNumber: 108,
        columnNumber: 9
      },
      this
    ) }, void 0, false, {
      fileName: "/dev-server/src/pages/Referral.tsx",
      lineNumber: 107,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(PageContent, { children: /* @__PURE__ */ jsxDEV(PageStack, { className: "max-w-5xl gap-6", children: [
      /* @__PURE__ */ jsxDEV(
        PageSection,
        {
          title: "Referral Identity",
          description: "This code is tied to your profile and powers every referral link you share.",
          bodyClassName: "p-6",
          children: /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Your Referral Code" }, void 0, false, {
                fileName: "/dev-server/src/pages/Referral.tsx",
                lineNumber: 123,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "font-mono text-3xl font-semibold tracking-widest text-primary", children: referralCode }, void 0, false, {
                fileName: "/dev-server/src/pages/Referral.tsx",
                lineNumber: 126,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 122,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "grid gap-2 text-sm text-muted-foreground lg:text-right", children: [
              /* @__PURE__ */ jsxDEV("p", { children: "Tied directly to your brokerage account." }, void 0, false, {
                fileName: "/dev-server/src/pages/Referral.tsx",
                lineNumber: 131,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { children: "Permanent, unique, and reusable across every signup flow." }, void 0, false, {
                fileName: "/dev-server/src/pages/Referral.tsx",
                lineNumber: 132,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 130,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Referral.tsx",
            lineNumber: 121,
            columnNumber: 13
          }, this)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Referral.tsx",
          lineNumber: 116,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            icon: DollarSign,
            label: "Total Earned",
            value: loadingCount ? "-" : `$${totalEarnings}`,
            description: "Accrued recurring rewards from active referred subscriptions.",
            tone: "primary"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Referral.tsx",
            lineNumber: 138,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            icon: Users,
            label: "Total Referrals",
            value: loadingCount ? /* @__PURE__ */ jsxDEV("span", { className: "inline-flex items-center gap-2", children: [
              /* @__PURE__ */ jsxDEV(RefreshCw, { className: "h-4 w-4 animate-spin text-muted-foreground" }, void 0, false, {
                fileName: "/dev-server/src/pages/Referral.tsx",
                lineNumber: 151,
                columnNumber: 21
              }, this),
              "Loading"
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 150,
              columnNumber: 19
            }, this) : totalReferrals,
            description: loadingCount ? "Loading referral performance." : `${activeReferrals} currently active and contributing monthly rewards.`
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Referral.tsx",
            lineNumber: 145,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            icon: Gift,
            label: "Per Active Referral",
            value: `$${earningsPerMonth}`,
            description: "Recurring monthly reward for each active paying subscription.",
            tone: "success"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Referral.tsx",
            lineNumber: 164,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Referral.tsx",
        lineNumber: 137,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: handleRefresh, disabled: refreshing, children: [
        /* @__PURE__ */ jsxDEV(RefreshCw, { className: `h-4 w-4 ${refreshing ? "animate-spin" : ""}` }, void 0, false, {
          fileName: "/dev-server/src/pages/Referral.tsx",
          lineNumber: 175,
          columnNumber: 15
        }, this),
        refreshing ? "Refreshing…" : "Refresh"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Referral.tsx",
        lineNumber: 174,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Referral.tsx",
        lineNumber: 173,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(
        PageSection,
        {
          title: "Share Your Referral",
          description: "Use the QR code or direct link. Both resolve to the same tracked signup path.",
          bodyClassName: "p-6",
          children: /* @__PURE__ */ jsxDEV("div", { className: "grid gap-8 lg:grid-cols-2 lg:items-center", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex justify-center lg:justify-start", children: referralLink ? /* @__PURE__ */ jsxDEV("div", { className: "rounded-xl border bg-white p-4 shadow-surface", children: /* @__PURE__ */ jsxDEV(QRCodeSVG, { value: referralLink, size: 180, level: "M" }, void 0, false, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 189,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 188,
              columnNumber: 19
            }, this) : /* @__PURE__ */ jsxDEV("div", { className: "flex h-52 w-52 items-center justify-center rounded-xl border bg-muted/30", children: /* @__PURE__ */ jsxDEV(RefreshCw, { className: "h-6 w-6 animate-spin text-muted-foreground" }, void 0, false, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 193,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 192,
              columnNumber: 19
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 186,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-5", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "max-w-xl text-sm leading-6 text-muted-foreground", children: [
                "Earn ",
                /* @__PURE__ */ jsxDEV("span", { className: "font-semibold text-foreground", children: [
                  "$",
                  earningsPerMonth
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Referral.tsx",
                  lineNumber: 200,
                  columnNumber: 24
                }, this),
                " every month for each referred agent who stays on an active subscription."
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Referral.tsx",
                lineNumber: 199,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-3 sm:flex-row", children: [
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    value: referralLink,
                    readOnly: true,
                    className: "font-mono text-sm",
                    placeholder: "Loading your referral link..."
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Referral.tsx",
                    lineNumber: 204,
                    columnNumber: 19
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  Button,
                  {
                    variant: "outline",
                    size: "sm",
                    className: "gap-1.5 sm:min-w-28",
                    onClick: handleCopy,
                    disabled: !referralLink,
                    children: [
                      copied ? /* @__PURE__ */ jsxDEV(Check, { className: "h-4 w-4" }, void 0, false, {
                        fileName: "/dev-server/src/pages/Referral.tsx",
                        lineNumber: 217,
                        columnNumber: 31
                      }, this) : /* @__PURE__ */ jsxDEV(Copy, { className: "h-4 w-4" }, void 0, false, {
                        fileName: "/dev-server/src/pages/Referral.tsx",
                        lineNumber: 217,
                        columnNumber: 63
                      }, this),
                      copied ? "Copied" : "Copy Link"
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/dev-server/src/pages/Referral.tsx",
                    lineNumber: 210,
                    columnNumber: 19
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Referral.tsx",
                lineNumber: 203,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 198,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Referral.tsx",
            lineNumber: 185,
            columnNumber: 13
          }, this)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Referral.tsx",
          lineNumber: 180,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        PageSection,
        {
          title: "How It Works",
          description: "The referral flow stays simple: share the link, let the agent sign up, and recurring rewards post automatically.",
          bodyClassName: "p-6",
          children: /* @__PURE__ */ jsxDEV("div", { className: "grid gap-3", children: [
            "Share your referral link with fellow agents.",
            "They sign up using your unique code or referral URL.",
            "You earn $20 each month while their subscription stays active."
          ].map((step, index) => /* @__PURE__ */ jsxDEV("div", { className: "app-surface-subtle flex items-start gap-4 px-4 py-4", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary", children: index + 1 }, void 0, false, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 237,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm leading-6 text-foreground", children: step }, void 0, false, {
              fileName: "/dev-server/src/pages/Referral.tsx",
              lineNumber: 240,
              columnNumber: 19
            }, this)
          ] }, step, true, {
            fileName: "/dev-server/src/pages/Referral.tsx",
            lineNumber: 236,
            columnNumber: 17
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/pages/Referral.tsx",
            lineNumber: 230,
            columnNumber: 13
          }, this)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Referral.tsx",
          lineNumber: 225,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Referral.tsx",
      lineNumber: 115,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Referral.tsx",
      lineNumber: 114,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Referral.tsx",
    lineNumber: 106,
    columnNumber: 5
  }, this);
}
export {
  Referral as default
};
