import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { u as useDeals } from "./useDeals-CMdNuTy4.js";
import { DollarSign, TrendingUp, Home } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { format, parseISO } from "date-fns";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, f as PageContent, g as PageStack, h as PageSection, E as EmptyState } from "./page-shell-DKoO3rjg.js";
import { M as MetricCard } from "./metric-card-CHaNCXgL.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BMLOidPK.js";
import "@tanstack/react-query";
import "../main.mjs";
import "vite-react-ssg";
import "react-router-dom";
import "react";
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
function parseDollar(s) {
  if (!s) return 0;
  const stripped = s.replace(/[^0-9.]/g, "");
  const firstDot = stripped.indexOf(".");
  const clean = firstDot === -1 ? stripped : stripped.slice(0, firstDot + 1) + stripped.slice(firstDot + 1).replace(/\./g, "");
  return parseFloat(clean) || 0;
}
function Finances() {
  const { data: deals = [], isLoading } = useDeals();
  const activeDeals = deals.filter((d) => d.status !== "archive");
  const totalVolume = activeDeals.reduce((sum, d) => sum + parseDollar(d.price), 0);
  let totalCommission = 0;
  activeDeals.forEach((d) => {
    (d.deal_contacts || []).forEach((dc) => {
      const c = dc.contact;
      if (c == null ? void 0 : c.commission) {
        const val = parseFloat(c.commission.replace(/[^0-9.]/g, "")) || 0;
        if (c.commission_type === "percentage") {
          totalCommission += parseDollar(d.price) * val / 100;
        } else {
          totalCommission += val;
        }
      }
    });
  });
  const monthlyMap = {};
  deals.forEach((d) => {
    if (d.created_at) {
      const key = format(parseISO(d.created_at), "yyyy-MM");
      monthlyMap[key] = (monthlyMap[key] || 0) + parseDollar(d.price);
    }
  });
  const chartData = Object.entries(monthlyMap).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([month, volume]) => ({ month: format(parseISO(month + "-01"), "MMM yy"), volume }));
  const fmt = (n) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return /* @__PURE__ */ jsxs(PageShell, { children: [
    /* @__PURE__ */ jsx(PageHeader, { children: /* @__PURE__ */ jsx(
      PageHeaderHeading,
      {
        title: "Finances",
        meta: `${activeDeals.length} active deals contributing to brokerage totals`
      }
    ) }),
    /* @__PURE__ */ jsx(PageContent, { children: /* @__PURE__ */ jsx(PageStack, { className: "max-w-none gap-6", children: isLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "grid gap-4 md:grid-cols-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxs("section", { className: "app-surface animate-pulse p-5", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-muted" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 w-28 rounded bg-muted" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "h-8 w-28 rounded bg-muted" })
      ] }, i)) }),
      /* @__PURE__ */ jsxs("section", { className: "app-surface animate-pulse p-6", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-4 h-4 w-40 rounded bg-muted" }),
        /* @__PURE__ */ jsx("div", { className: "h-80 rounded-lg bg-muted/60" })
      ] }),
      /* @__PURE__ */ jsxs("section", { className: "app-surface overflow-hidden animate-pulse", children: [
        /* @__PURE__ */ jsx("div", { className: "border-b px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "h-4 w-32 rounded bg-muted" }) }),
        /* @__PURE__ */ jsx("div", { className: "divide-y", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx("div", { className: "h-3.5 w-56 rounded bg-muted" }),
            /* @__PURE__ */ jsx("div", { className: "h-3 w-32 rounded bg-muted/70" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "h-3.5 w-20 rounded bg-muted" })
        ] }, i)) })
      ] })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: DollarSign,
            label: "Total Volume",
            value: fmt(totalVolume),
            description: "Combined list price across all non-archived deals.",
            tone: "primary"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: TrendingUp,
            label: "Expected Commissions",
            value: fmt(totalCommission),
            description: "Derived from active deal pricing and assigned commission rules.",
            tone: "success"
          }
        ),
        /* @__PURE__ */ jsx(
          MetricCard,
          {
            icon: Home,
            label: "Active Deals",
            value: activeDeals.length,
            description: "Deals still in play and contributing to financial reporting."
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        PageSection,
        {
          title: "Monthly Deal Volume",
          description: "Tracks rolling deal volume for the most recent 12 creation months.",
          bodyClassName: "p-6",
          children: chartData.length > 0 ? /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: 320, children: /* @__PURE__ */ jsxs(BarChart, { data: chartData, children: [
            /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-border" }),
            /* @__PURE__ */ jsx(
              XAxis,
              {
                dataKey: "month",
                className: "fill-muted-foreground text-xs",
                tick: { fontSize: 11 },
                tickLine: false,
                axisLine: false
              }
            ),
            /* @__PURE__ */ jsx(
              YAxis,
              {
                tickFormatter: (v) => `$${(v / 1e3).toFixed(0)}k`,
                className: "fill-muted-foreground text-xs",
                tick: { fontSize: 11 },
                tickLine: false,
                axisLine: false
              }
            ),
            /* @__PURE__ */ jsx(Tooltip, { formatter: (v) => fmt(v) }),
            /* @__PURE__ */ jsx(Bar, { dataKey: "volume", className: "fill-primary" })
          ] }) }) : /* @__PURE__ */ jsx(
            EmptyState,
            {
              icon: TrendingUp,
              title: "No volume data yet",
              description: "Once deals are created, monthly volume will appear here automatically."
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(
        PageSection,
        {
          title: "Deal Breakdown",
          description: "Every active deal listed with its location, current status, and recorded price.",
          bodyClassName: "p-0",
          children: activeDeals.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("div", { className: "divide-y md:hidden", children: activeDeals.map((deal) => /* @__PURE__ */ jsxs("div", { className: "space-y-3 px-4 py-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-foreground", children: deal.address }),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
                  deal.city,
                  ", ",
                  deal.state,
                  " ",
                  deal.zip
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Status" }),
                  /* @__PURE__ */ jsx("div", { className: "capitalize text-muted-foreground", children: deal.status })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Created" }),
                  /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: deal.created_at ? format(parseISO(deal.created_at), "MMM d, yyyy") : "-" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Price" }),
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-foreground", children: deal.price || "$0" })
                ] })
              ] })
            ] }, deal.id)) }),
            /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxs(Table, { children: [
              /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableHead, { children: "Address" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
                /* @__PURE__ */ jsx(TableHead, { children: "Created" }),
                /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Price" })
              ] }) }),
              /* @__PURE__ */ jsx(TableBody, { children: activeDeals.map((deal) => /* @__PURE__ */ jsxs(TableRow, { children: [
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold text-foreground", children: deal.address }),
                  /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
                    deal.city,
                    ", ",
                    deal.state,
                    " ",
                    deal.zip
                  ] })
                ] }) }),
                /* @__PURE__ */ jsx(TableCell, { className: "capitalize text-muted-foreground", children: deal.status }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: deal.created_at ? format(parseISO(deal.created_at), "MMM d, yyyy") : "-" }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-right font-medium text-foreground", children: deal.price || "$0" })
              ] }, deal.id)) })
            ] }) })
          ] }) : /* @__PURE__ */ jsx(
            EmptyState,
            {
              icon: Home,
              title: "No active deals to report",
              description: "Financial breakdown appears once the brokerage has active or pending business."
            }
          )
        }
      )
    ] }) }) })
  ] });
}
export {
  Finances as default
};
