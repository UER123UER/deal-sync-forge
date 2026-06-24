import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Trash2, Plus, Home, ArrowUpDown } from "lucide-react";
import { I as Input, B as Button, c as cn } from "../main.mjs";
import { u as useDeals, a as useDeleteDeal } from "./useDeals-CMdNuTy4.js";
import { C as Checkbox } from "./checkbox-B7kHRerZ.js";
import { toast } from "sonner";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, c as PageHeaderActions, d as PageToolbar, e as PageToolbarGroup, f as PageContent, g as PageStack, E as EmptyState } from "./page-shell-BTk8AANV.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BADoDizA.js";
import "vite-react-ssg";
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
import "@radix-ui/react-checkbox";
const TABS = ["All Deals", "Draft", "Active", "Pending", "Archive"];
const statusMap = {
  "All Deals": "all",
  Draft: "draft",
  Active: "active",
  Pending: "pending",
  Archive: "archive"
};
const statusColors = {
  draft: "border-border bg-muted text-muted-foreground",
  active: "border-success/15 bg-success/10 text-success",
  pending: "border-warning/15 bg-warning/10 text-warning",
  archive: "border-border bg-muted text-muted-foreground"
};
function Transactions() {
  const [activeTab, setActiveTab] = useState("All Deals");
  const [search, setSearch] = useState("");
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [sortKey, setSortKey] = useState("address");
  const [sortAsc, setSortAsc] = useState(true);
  const navigate = useNavigate();
  const { data: deals = [], isLoading } = useDeals();
  const deleteDeal = useDeleteDeal();
  const filtered = deals.filter((d) => {
    const matchesTab = statusMap[activeTab] === "all" || d.status === statusMap[activeTab];
    const matchesSearch = !search || d.address.toLowerCase().includes(search.toLowerCase()) || (d.mls_number || "").toLowerCase().includes(search.toLowerCase()) || (d.primary_agent || "").toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  }).sort((a, b) => {
    const valA = (a[sortKey] || "").toLowerCase();
    const valB = (b[sortKey] || "").toLowerCase();
    return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
  });
  const toggleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };
  const toggleSelect = (id) => {
    setSelectedDeals((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (selectedDeals.length === filtered.length) setSelectedDeals([]);
    else setSelectedDeals(filtered.map((d) => d.id));
  };
  const handleExport = () => {
    const headers = ["Address", "City", "State", "Zip", "Status", "Price", "MLS#", "Primary Agent", "Created"];
    const rows = filtered.map((d) => [d.address, d.city, d.state, d.zip, d.status, d.price || "", d.mls_number || "", d.primary_agent || "", d.created_at || ""]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deals-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Deals exported as CSV");
  };
  const handleBulkDelete = async () => {
    if (!selectedDeals.length) return;
    const count = selectedDeals.length;
    try {
      for (const id of selectedDeals) {
        await deleteDeal.mutateAsync(id);
      }
      setSelectedDeals([]);
      toast.success(`${count} deal(s) deleted`);
    } catch {
      toast.error("Failed to delete deals");
    }
  };
  const SortHeader = ({ label, sortKeyName }) => /* @__PURE__ */ jsxDEV(TableHead, { className: "cursor-pointer select-none hover:text-foreground", onClick: () => toggleSort(sortKeyName), children: /* @__PURE__ */ jsxDEV("span", { className: "flex items-center gap-1", children: [
    label,
    /* @__PURE__ */ jsxDEV(ArrowUpDown, { className: cn("w-3 h-3", sortKey === sortKeyName ? "text-foreground" : "text-muted-foreground/50") }, void 0, false, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 108,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Transactions.tsx",
    lineNumber: 106,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/pages/Transactions.tsx",
    lineNumber: 105,
    columnNumber: 5
  }, this);
  return /* @__PURE__ */ jsxDEV(PageShell, { children: [
    /* @__PURE__ */ jsxDEV(PageHeader, { children: [
      /* @__PURE__ */ jsxDEV(PageHeaderHeading, { title: "Transactions", meta: `${filtered.length} visible • ${deals.length} total` }, void 0, false, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 116,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(PageHeaderActions, { children: /* @__PURE__ */ jsxDEV("div", { className: "relative w-full max-w-80", children: [
        /* @__PURE__ */ jsxDEV(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }, void 0, false, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 119,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Input, { placeholder: "Search by address, MLS, or agent", className: "pl-9", value: search, onChange: (e) => setSearch(e.target.value) }, void 0, false, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 120,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 118,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 117,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 115,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(PageToolbar, { children: [
      /* @__PURE__ */ jsxDEV(PageToolbarGroup, { className: "app-segmented", children: TABS.map((tab) => /* @__PURE__ */ jsxDEV(
        "button",
        {
          type: "button",
          "data-state": activeTab === tab ? "active" : "inactive",
          onClick: () => setActiveTab(tab),
          className: "app-segmented-item",
          children: tab
        },
        tab,
        false,
        {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 128,
          columnNumber: 13
        },
        this
      )) }, void 0, false, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 126,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(PageToolbarGroup, { className: "ml-auto", children: [
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: handleExport, children: [
          /* @__PURE__ */ jsxDEV(Download, { className: "h-3.5 w-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 142,
            columnNumber: 13
          }, this),
          "Export"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 141,
          columnNumber: 11
        }, this),
        selectedDeals.length > 0 ? /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "gap-1.5 text-destructive hover:text-destructive", onClick: handleBulkDelete, children: [
          /* @__PURE__ */ jsxDEV(Trash2, { className: "h-3.5 w-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 147,
            columnNumber: 15
          }, this),
          "Delete (",
          selectedDeals.length,
          ")"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 146,
          columnNumber: 13
        }, this) : null,
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "gap-1.5", onClick: () => navigate("/transactions/new"), children: [
          /* @__PURE__ */ jsxDEV(Plus, { className: "h-3.5 w-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 152,
            columnNumber: 13
          }, this),
          "New Deal"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 151,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 140,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 125,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(PageContent, { className: "py-4", children: /* @__PURE__ */ jsxDEV(PageStack, { className: "max-w-none gap-4", children: /* @__PURE__ */ jsxDEV("section", { className: "app-surface overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxDEV("div", { className: "divide-y", children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4 px-6 py-4 animate-pulse", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "h-4 w-4 rounded bg-muted" }, void 0, false, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 165,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex min-w-0 flex-1 items-center gap-3", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "h-10 w-10 rounded-lg bg-muted" }, void 0, false, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 167,
          columnNumber: 23
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "h-3.5 w-48 rounded bg-muted" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 169,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "h-3 w-28 rounded bg-muted/70" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 170,
            columnNumber: 25
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 168,
          columnNumber: 23
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 166,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "h-6 w-20 rounded-full bg-muted" }, void 0, false, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 173,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "h-3.5 w-20 rounded bg-muted" }, void 0, false, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 174,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "h-3.5 w-24 rounded bg-muted" }, void 0, false, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 175,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "h-3.5 w-24 rounded bg-muted" }, void 0, false, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 176,
        columnNumber: 21
      }, this)
    ] }, i, true, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 164,
      columnNumber: 19
    }, this)) }, void 0, false, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 162,
      columnNumber: 15
    }, this) : filtered.length === 0 ? /* @__PURE__ */ jsxDEV(
      EmptyState,
      {
        icon: Home,
        title: "No transactions found",
        description: search ? "Clear the current filters or search term to see more transactions." : "Create your first deal to start tracking listings, contracts, and office follow-up in one system.",
        action: /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "gap-1.5", onClick: () => navigate("/transactions/new"), children: [
          /* @__PURE__ */ jsxDEV(Plus, { className: "h-3.5 w-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 187,
            columnNumber: 21
          }, this),
          "Create Deal"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 186,
          columnNumber: 19
        }, this)
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 181,
        columnNumber: 15
      },
      this
    ) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("div", { className: "divide-y md:hidden", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between gap-3 px-4 py-3", children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Select visible deals" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 196,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV(Checkbox, { checked: selectedDeals.length === filtered.length && filtered.length > 0, onCheckedChange: toggleAll }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 197,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 195,
          columnNumber: 19
        }, this),
        filtered.map((deal) => /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            className: "flex w-full flex-col gap-3 px-4 py-4 text-left transition-standard hover:bg-muted/20",
            onClick: () => navigate(`/transactions/${deal.id}`),
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "pt-0.5", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxDEV(Checkbox, { checked: selectedDeals.includes(deal.id), onCheckedChange: () => toggleSelect(deal.id) }, void 0, false, {
                  fileName: "/dev-server/src/pages/Transactions.tsx",
                  lineNumber: 208,
                  columnNumber: 27
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/Transactions.tsx",
                  lineNumber: 207,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex min-w-0 flex-1 items-start gap-3", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted", children: /* @__PURE__ */ jsxDEV(Building2Icon, {}, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 212,
                    columnNumber: 29
                  }, this) }, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 211,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "truncate text-sm font-semibold text-foreground", children: deal.address }, void 0, false, {
                      fileName: "/dev-server/src/pages/Transactions.tsx",
                      lineNumber: 215,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "truncate text-sm text-muted-foreground", children: [
                      deal.city,
                      ", ",
                      deal.state,
                      " ",
                      deal.zip
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/Transactions.tsx",
                      lineNumber: 216,
                      columnNumber: 29
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 214,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Transactions.tsx",
                  lineNumber: 210,
                  columnNumber: 25
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Transactions.tsx",
                lineNumber: 206,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-3 pl-7 text-sm", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Status" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 222,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize leading-none", statusColors[deal.status] || "border-border bg-muted text-muted-foreground"), children: deal.status }, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 223,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Transactions.tsx",
                  lineNumber: 221,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Price" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 228,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "font-medium text-foreground", children: deal.price || "-" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 229,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Transactions.tsx",
                  lineNumber: 227,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Critical Date" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 232,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "text-muted-foreground", children: deal.listing_expiration || "-" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 233,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Transactions.tsx",
                  lineNumber: 231,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Primary Agent" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 236,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "text-muted-foreground", children: deal.primary_agent || "-" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Transactions.tsx",
                    lineNumber: 237,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Transactions.tsx",
                  lineNumber: 235,
                  columnNumber: 25
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Transactions.tsx",
                lineNumber: 220,
                columnNumber: 23
              }, this)
            ]
          },
          deal.id,
          true,
          {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 200,
            columnNumber: 21
          },
          this
        ))
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 194,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxDEV(Table, { children: [
        /* @__PURE__ */ jsxDEV(TableHeader, { children: /* @__PURE__ */ jsxDEV(TableRow, { children: [
          /* @__PURE__ */ jsxDEV(TableHead, { className: "w-10", children: /* @__PURE__ */ jsxDEV(Checkbox, { checked: selectedDeals.length === filtered.length && filtered.length > 0, onCheckedChange: toggleAll }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 249,
            columnNumber: 27
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 248,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(SortHeader, { label: "Address", sortKeyName: "address" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 251,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(SortHeader, { label: "Status", sortKeyName: "status" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 252,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(SortHeader, { label: "Price", sortKeyName: "price" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 253,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(SortHeader, { label: "Critical Dates", sortKeyName: "listing_expiration" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 254,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(SortHeader, { label: "Primary Agent", sortKeyName: "primary_agent" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 255,
            columnNumber: 25
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 247,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 246,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV(TableBody, { children: filtered.map((deal) => /* @__PURE__ */ jsxDEV(TableRow, { className: "cursor-pointer", onClick: () => navigate(`/transactions/${deal.id}`), children: [
          /* @__PURE__ */ jsxDEV(TableCell, { className: "w-10", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxDEV(Checkbox, { checked: selectedDeals.includes(deal.id), onCheckedChange: () => toggleSelect(deal.id) }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 262,
            columnNumber: 29
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 261,
            columnNumber: 27
          }, this),
          /* @__PURE__ */ jsxDEV(TableCell, { children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted", children: /* @__PURE__ */ jsxDEV(Building2Icon, {}, void 0, false, {
              fileName: "/dev-server/src/pages/Transactions.tsx",
              lineNumber: 267,
              columnNumber: 33
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Transactions.tsx",
              lineNumber: 266,
              columnNumber: 31
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "truncate text-sm font-semibold text-foreground", children: deal.address }, void 0, false, {
                fileName: "/dev-server/src/pages/Transactions.tsx",
                lineNumber: 270,
                columnNumber: 33
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "truncate text-sm text-muted-foreground", children: [
                deal.city,
                ", ",
                deal.state,
                " ",
                deal.zip
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Transactions.tsx",
                lineNumber: 271,
                columnNumber: 33
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Transactions.tsx",
              lineNumber: 269,
              columnNumber: 31
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 265,
            columnNumber: 29
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 264,
            columnNumber: 27
          }, this),
          /* @__PURE__ */ jsxDEV(TableCell, { children: /* @__PURE__ */ jsxDEV("span", { className: cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize leading-none", statusColors[deal.status] || "border-border bg-muted text-muted-foreground"), children: deal.status }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 276,
            columnNumber: 29
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 275,
            columnNumber: 27
          }, this),
          /* @__PURE__ */ jsxDEV(TableCell, { className: "font-medium text-foreground", children: deal.price || "-" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 280,
            columnNumber: 27
          }, this),
          /* @__PURE__ */ jsxDEV(TableCell, { className: "text-muted-foreground", children: deal.listing_expiration || "-" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 281,
            columnNumber: 27
          }, this),
          /* @__PURE__ */ jsxDEV(TableCell, { children: deal.primary_agent || "-" }, void 0, false, {
            fileName: "/dev-server/src/pages/Transactions.tsx",
            lineNumber: 282,
            columnNumber: 27
          }, this)
        ] }, deal.id, true, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 260,
          columnNumber: 25
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/Transactions.tsx",
          lineNumber: 258,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 245,
        columnNumber: 19
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Transactions.tsx",
        lineNumber: 244,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 193,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 160,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 159,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 158,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Transactions.tsx",
    lineNumber: 114,
    columnNumber: 5
  }, this);
}
function Building2Icon() {
  return /* @__PURE__ */ jsxDEV("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", className: "text-muted-foreground", children: [
    /* @__PURE__ */ jsxDEV("rect", { x: "4", y: "2", width: "16", height: "20", rx: "2" }, void 0, false, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 300,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("path", { d: "M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" }, void 0, false, {
      fileName: "/dev-server/src/pages/Transactions.tsx",
      lineNumber: 301,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Transactions.tsx",
    lineNumber: 299,
    columnNumber: 5
  }, this);
}
export {
  Transactions as default
};
