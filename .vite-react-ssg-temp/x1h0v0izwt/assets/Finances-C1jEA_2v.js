import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import { u as useDeals } from "./useDeals-CMdNuTy4.js";
import { DollarSign, TrendingUp, Home } from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import { format, parseISO } from "date-fns";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, f as PageContent, g as PageStack, h as PageSection, E as EmptyState } from "./page-shell-BTk8AANV.js";
import { M as MetricCard } from "./metric-card-C-Gx_Bk9.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BADoDizA.js";
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
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
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
  return /* @__PURE__ */ jsxDEV(PageShell, { children: [
    /* @__PURE__ */ jsxDEV(PageHeader, { children: /* @__PURE__ */ jsxDEV(
      PageHeaderHeading,
      {
        title: "Finances",
        meta: `${activeDeals.length} active deals contributing to brokerage totals`
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Finances.tsx",
        lineNumber: 68,
        columnNumber: 9
      },
      this
    ) }, void 0, false, {
      fileName: "/dev-server/src/pages/Finances.tsx",
      lineNumber: 67,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(PageContent, { children: /* @__PURE__ */ jsxDEV(PageStack, { className: "max-w-none gap-6", children: isLoading ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-4 md:grid-cols-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxDEV("section", { className: "app-surface animate-pulse p-5", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "mb-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "h-10 w-10 rounded-lg bg-muted" }, void 0, false, {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 82,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "h-3 w-28 rounded bg-muted" }, void 0, false, {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 83,
            columnNumber: 23
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 81,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "h-8 w-28 rounded bg-muted" }, void 0, false, {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 85,
          columnNumber: 21
        }, this)
      ] }, i, true, {
        fileName: "/dev-server/src/pages/Finances.tsx",
        lineNumber: 80,
        columnNumber: 19
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/pages/Finances.tsx",
        lineNumber: 78,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "app-surface animate-pulse p-6", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "mb-4 h-4 w-40 rounded bg-muted" }, void 0, false, {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 90,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "h-80 rounded-lg bg-muted/60" }, void 0, false, {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 91,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Finances.tsx",
        lineNumber: 89,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "app-surface overflow-hidden animate-pulse", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "border-b px-6 py-4", children: /* @__PURE__ */ jsxDEV("div", { className: "h-4 w-32 rounded bg-muted" }, void 0, false, {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 95,
          columnNumber: 19
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 94,
          columnNumber: 17
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "divide-y", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between px-6 py-4", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "h-3.5 w-56 rounded bg-muted" }, void 0, false, {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 101,
              columnNumber: 25
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "h-3 w-32 rounded bg-muted/70" }, void 0, false, {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 102,
              columnNumber: 25
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 100,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "h-3.5 w-20 rounded bg-muted" }, void 0, false, {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 104,
            columnNumber: 23
          }, this)
        ] }, i, true, {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 99,
          columnNumber: 21
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 97,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Finances.tsx",
        lineNumber: 93,
        columnNumber: 15
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Finances.tsx",
      lineNumber: 77,
      columnNumber: 13
    }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("div", { className: "grid gap-4 md:grid-cols-3", children: [
        /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            icon: DollarSign,
            label: "Total Volume",
            value: fmt(totalVolume),
            description: "Combined list price across all non-archived deals.",
            tone: "primary"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 113,
            columnNumber: 17
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            icon: TrendingUp,
            label: "Expected Commissions",
            value: fmt(totalCommission),
            description: "Derived from active deal pricing and assigned commission rules.",
            tone: "success"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 120,
            columnNumber: 17
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          MetricCard,
          {
            icon: Home,
            label: "Active Deals",
            value: activeDeals.length,
            description: "Deals still in play and contributing to financial reporting."
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 127,
            columnNumber: 17
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Finances.tsx",
        lineNumber: 112,
        columnNumber: 15
      }, this),
      /* @__PURE__ */ jsxDEV(
        PageSection,
        {
          title: "Monthly Deal Volume",
          description: "Tracks rolling deal volume for the most recent 12 creation months.",
          bodyClassName: "p-6",
          children: chartData.length > 0 ? /* @__PURE__ */ jsxDEV(ResponsiveContainer, { width: "100%", height: 320, children: /* @__PURE__ */ jsxDEV(BarChart, { data: chartData, children: [
            /* @__PURE__ */ jsxDEV(CartesianGrid, { strokeDasharray: "3 3", className: "stroke-border" }, void 0, false, {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 143,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV(
              XAxis,
              {
                dataKey: "month",
                className: "fill-muted-foreground text-xs",
                tick: { fontSize: 11 },
                tickLine: false,
                axisLine: false
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Finances.tsx",
                lineNumber: 144,
                columnNumber: 23
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              YAxis,
              {
                tickFormatter: (v) => `$${(v / 1e3).toFixed(0)}k`,
                className: "fill-muted-foreground text-xs",
                tick: { fontSize: 11 },
                tickLine: false,
                axisLine: false
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Finances.tsx",
                lineNumber: 151,
                columnNumber: 23
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(Tooltip, { formatter: (v) => fmt(v) }, void 0, false, {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 158,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV(Bar, { dataKey: "volume", className: "fill-primary" }, void 0, false, {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 159,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 142,
            columnNumber: 21
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 141,
            columnNumber: 19
          }, this) : /* @__PURE__ */ jsxDEV(
            EmptyState,
            {
              icon: TrendingUp,
              title: "No volume data yet",
              description: "Once deals are created, monthly volume will appear here automatically."
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 163,
              columnNumber: 19
            },
            this
          )
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 135,
          columnNumber: 15
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        PageSection,
        {
          title: "Deal Breakdown",
          description: "Every active deal listed with its location, current status, and recorded price.",
          bodyClassName: "p-0",
          children: activeDeals.length > 0 ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
            /* @__PURE__ */ jsxDEV("div", { className: "divide-y md:hidden", children: activeDeals.map((deal) => /* @__PURE__ */ jsxDEV("div", { className: "space-y-3 px-4 py-4", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "text-sm font-semibold text-foreground", children: deal.address }, void 0, false, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 182,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-muted-foreground", children: [
                  deal.city,
                  ", ",
                  deal.state,
                  " ",
                  deal.zip
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 183,
                  columnNumber: 29
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Finances.tsx",
                lineNumber: 181,
                columnNumber: 27
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-3 text-sm", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Status" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Finances.tsx",
                    lineNumber: 189,
                    columnNumber: 31
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "capitalize text-muted-foreground", children: deal.status }, void 0, false, {
                    fileName: "/dev-server/src/pages/Finances.tsx",
                    lineNumber: 190,
                    columnNumber: 31
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 188,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Created" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Finances.tsx",
                    lineNumber: 193,
                    columnNumber: 31
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "text-muted-foreground", children: deal.created_at ? format(parseISO(deal.created_at), "MMM d, yyyy") : "-" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Finances.tsx",
                    lineNumber: 194,
                    columnNumber: 31
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 192,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Price" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Finances.tsx",
                    lineNumber: 199,
                    columnNumber: 31
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "font-medium text-foreground", children: deal.price || "$0" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Finances.tsx",
                    lineNumber: 200,
                    columnNumber: 31
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 198,
                  columnNumber: 29
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Finances.tsx",
                lineNumber: 187,
                columnNumber: 27
              }, this)
            ] }, deal.id, true, {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 180,
              columnNumber: 25
            }, this)) }, void 0, false, {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 178,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxDEV(Table, { children: [
              /* @__PURE__ */ jsxDEV(TableHeader, { children: /* @__PURE__ */ jsxDEV(TableRow, { children: [
                /* @__PURE__ */ jsxDEV(TableHead, { children: "Address" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 211,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV(TableHead, { children: "Status" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 212,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV(TableHead, { children: "Created" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 213,
                  columnNumber: 29
                }, this),
                /* @__PURE__ */ jsxDEV(TableHead, { className: "text-right", children: "Price" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 214,
                  columnNumber: 29
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Finances.tsx",
                lineNumber: 210,
                columnNumber: 27
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/Finances.tsx",
                lineNumber: 209,
                columnNumber: 25
              }, this),
              /* @__PURE__ */ jsxDEV(TableBody, { children: activeDeals.map((deal) => /* @__PURE__ */ jsxDEV(TableRow, { children: [
                /* @__PURE__ */ jsxDEV(TableCell, { children: /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-sm font-semibold text-foreground", children: deal.address }, void 0, false, {
                    fileName: "/dev-server/src/pages/Finances.tsx",
                    lineNumber: 222,
                    columnNumber: 35
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-muted-foreground", children: [
                    deal.city,
                    ", ",
                    deal.state,
                    " ",
                    deal.zip
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/Finances.tsx",
                    lineNumber: 223,
                    columnNumber: 35
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 221,
                  columnNumber: 33
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 220,
                  columnNumber: 31
                }, this),
                /* @__PURE__ */ jsxDEV(TableCell, { className: "capitalize text-muted-foreground", children: deal.status }, void 0, false, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 228,
                  columnNumber: 31
                }, this),
                /* @__PURE__ */ jsxDEV(TableCell, { className: "text-muted-foreground", children: deal.created_at ? format(parseISO(deal.created_at), "MMM d, yyyy") : "-" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 229,
                  columnNumber: 31
                }, this),
                /* @__PURE__ */ jsxDEV(TableCell, { className: "text-right font-medium text-foreground", children: deal.price || "$0" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Finances.tsx",
                  lineNumber: 232,
                  columnNumber: 31
                }, this)
              ] }, deal.id, true, {
                fileName: "/dev-server/src/pages/Finances.tsx",
                lineNumber: 219,
                columnNumber: 29
              }, this)) }, void 0, false, {
                fileName: "/dev-server/src/pages/Finances.tsx",
                lineNumber: 217,
                columnNumber: 25
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 208,
              columnNumber: 23
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 207,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Finances.tsx",
            lineNumber: 177,
            columnNumber: 19
          }, this) : /* @__PURE__ */ jsxDEV(
            EmptyState,
            {
              icon: Home,
              title: "No active deals to report",
              description: "Financial breakdown appears once the brokerage has active or pending business."
            },
            void 0,
            false,
            {
              fileName: "/dev-server/src/pages/Finances.tsx",
              lineNumber: 242,
              columnNumber: 19
            },
            this
          )
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Finances.tsx",
          lineNumber: 171,
          columnNumber: 15
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Finances.tsx",
      lineNumber: 111,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Finances.tsx",
      lineNumber: 75,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Finances.tsx",
      lineNumber: 74,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Finances.tsx",
    lineNumber: 66,
    columnNumber: 5
  }, this);
}
export {
  Finances as default
};
