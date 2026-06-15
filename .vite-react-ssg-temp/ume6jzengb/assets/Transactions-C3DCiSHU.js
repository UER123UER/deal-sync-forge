import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Trash2, Plus, Home, ArrowUpDown } from "lucide-react";
import { I as Input, B as Button, c as cn } from "../main.mjs";
import { u as useDeals, a as useDeleteDeal } from "./useDeals-CMdNuTy4.js";
import { C as Checkbox } from "./checkbox-D50hG86N.js";
import { toast } from "sonner";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, c as PageHeaderActions, d as PageToolbar, e as PageToolbarGroup, f as PageContent, g as PageStack, E as EmptyState } from "./page-shell-DKoO3rjg.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BMLOidPK.js";
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
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
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
  const SortHeader = ({ label, sortKeyName }) => /* @__PURE__ */ jsx(TableHead, { className: "cursor-pointer select-none hover:text-foreground", onClick: () => toggleSort(sortKeyName), children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
    label,
    /* @__PURE__ */ jsx(ArrowUpDown, { className: cn("w-3 h-3", sortKey === sortKeyName ? "text-foreground" : "text-muted-foreground/50") })
  ] }) });
  return /* @__PURE__ */ jsxs(PageShell, { children: [
    /* @__PURE__ */ jsxs(PageHeader, { children: [
      /* @__PURE__ */ jsx(PageHeaderHeading, { title: "Transactions", meta: `${filtered.length} visible • ${deals.length} total` }),
      /* @__PURE__ */ jsx(PageHeaderActions, { children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-80", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search by address, MLS, or agent", className: "pl-9", value: search, onChange: (e) => setSearch(e.target.value) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(PageToolbar, { children: [
      /* @__PURE__ */ jsx(PageToolbarGroup, { className: "app-segmented", children: TABS.map((tab) => /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          "data-state": activeTab === tab ? "active" : "inactive",
          onClick: () => setActiveTab(tab),
          className: "app-segmented-item",
          children: tab
        },
        tab
      )) }),
      /* @__PURE__ */ jsxs(PageToolbarGroup, { className: "ml-auto", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5", onClick: handleExport, children: [
          /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
          "Export"
        ] }),
        selectedDeals.length > 0 ? /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-1.5 text-destructive hover:text-destructive", onClick: handleBulkDelete, children: [
          /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
          "Delete (",
          selectedDeals.length,
          ")"
        ] }) : null,
        /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => navigate("/transactions/new"), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
          "New Deal"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(PageContent, { className: "py-4", children: /* @__PURE__ */ jsx(PageStack, { className: "max-w-none gap-4", children: /* @__PURE__ */ jsx("section", { className: "app-surface overflow-hidden", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "divide-y", children: [0, 1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 px-6 py-4 animate-pulse", children: [
      /* @__PURE__ */ jsx("div", { className: "h-4 w-4 rounded bg-muted" }),
      /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-lg bg-muted" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("div", { className: "h-3.5 w-48 rounded bg-muted" }),
          /* @__PURE__ */ jsx("div", { className: "h-3 w-28 rounded bg-muted/70" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-6 w-20 rounded-full bg-muted" }),
      /* @__PURE__ */ jsx("div", { className: "h-3.5 w-20 rounded bg-muted" }),
      /* @__PURE__ */ jsx("div", { className: "h-3.5 w-24 rounded bg-muted" }),
      /* @__PURE__ */ jsx("div", { className: "h-3.5 w-24 rounded bg-muted" })
    ] }, i)) }) : filtered.length === 0 ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: Home,
        title: "No transactions found",
        description: search ? "Clear the current filters or search term to see more transactions." : "Create your first deal to start tracking listings, contracts, and office follow-up in one system.",
        action: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => navigate("/transactions/new"), children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
          "Create Deal"
        ] })
      }
    ) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { className: "divide-y md:hidden", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 px-4 py-3", children: [
          /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Select visible deals" }),
          /* @__PURE__ */ jsx(Checkbox, { checked: selectedDeals.length === filtered.length && filtered.length > 0, onCheckedChange: toggleAll })
        ] }),
        filtered.map((deal) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "flex w-full flex-col gap-3 px-4 py-4 text-left transition-standard hover:bg-muted/20",
            onClick: () => navigate(`/transactions/${deal.id}`),
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "pt-0.5", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Checkbox, { checked: selectedDeals.includes(deal.id), onCheckedChange: () => toggleSelect(deal.id) }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex min-w-0 flex-1 items-start gap-3", children: [
                  /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted", children: /* @__PURE__ */ jsx(Building2Icon, {}) }),
                  /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-semibold text-foreground", children: deal.address }),
                    /* @__PURE__ */ jsxs("div", { className: "truncate text-sm text-muted-foreground", children: [
                      deal.city,
                      ", ",
                      deal.state,
                      " ",
                      deal.zip
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 pl-7 text-sm", children: [
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Status" }),
                  /* @__PURE__ */ jsx("span", { className: cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize leading-none", statusColors[deal.status] || "border-border bg-muted text-muted-foreground"), children: deal.status })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Price" }),
                  /* @__PURE__ */ jsx("div", { className: "font-medium text-foreground", children: deal.price || "-" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Critical Date" }),
                  /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: deal.listing_expiration || "-" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                  /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Primary Agent" }),
                  /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: deal.primary_agent || "-" })
                ] })
              ] })
            ]
          },
          deal.id
        ))
      ] }),
      /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-10", children: /* @__PURE__ */ jsx(Checkbox, { checked: selectedDeals.length === filtered.length && filtered.length > 0, onCheckedChange: toggleAll }) }),
          /* @__PURE__ */ jsx(SortHeader, { label: "Address", sortKeyName: "address" }),
          /* @__PURE__ */ jsx(SortHeader, { label: "Status", sortKeyName: "status" }),
          /* @__PURE__ */ jsx(SortHeader, { label: "Price", sortKeyName: "price" }),
          /* @__PURE__ */ jsx(SortHeader, { label: "Critical Dates", sortKeyName: "listing_expiration" }),
          /* @__PURE__ */ jsx(SortHeader, { label: "Primary Agent", sortKeyName: "primary_agent" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filtered.map((deal) => /* @__PURE__ */ jsxs(TableRow, { className: "cursor-pointer", onClick: () => navigate(`/transactions/${deal.id}`), children: [
          /* @__PURE__ */ jsx(TableCell, { className: "w-10", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Checkbox, { checked: selectedDeals.includes(deal.id), onCheckedChange: () => toggleSelect(deal.id) }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted", children: /* @__PURE__ */ jsx(Building2Icon, {}) }),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-semibold text-foreground", children: deal.address }),
              /* @__PURE__ */ jsxs("div", { className: "truncate text-sm text-muted-foreground", children: [
                deal.city,
                ", ",
                deal.state,
                " ",
                deal.zip
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: cn("inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize leading-none", statusColors[deal.status] || "border-border bg-muted text-muted-foreground"), children: deal.status }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium text-foreground", children: deal.price || "-" }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-muted-foreground", children: deal.listing_expiration || "-" }),
          /* @__PURE__ */ jsx(TableCell, { children: deal.primary_agent || "-" })
        ] }, deal.id)) })
      ] }) })
    ] }) }) }) })
  ] });
}
function Building2Icon() {
  return /* @__PURE__ */ jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", className: "text-muted-foreground", children: [
    /* @__PURE__ */ jsx("rect", { x: "4", y: "2", width: "16", height: "20", rx: "2" }),
    /* @__PURE__ */ jsx("path", { d: "M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" })
  ] });
}
export {
  Transactions as default
};
