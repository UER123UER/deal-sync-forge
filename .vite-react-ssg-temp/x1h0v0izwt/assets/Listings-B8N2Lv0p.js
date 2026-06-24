import { jsxDEV } from "react/jsx-dev-runtime";
import { useNavigate } from "react-router-dom";
import { u as useDeals } from "./useDeals-CMdNuTy4.js";
import "@tanstack/react-query";
import "../main.mjs";
import "vite-react-ssg";
import "react";
import "@supabase/supabase-js";
import "lucide-react";
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
function Listings() {
  const { data: deals = [], isLoading } = useDeals();
  const navigate = useNavigate();
  const listings = deals.filter((d) => d.status === "active");
  return /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "h-14 border-b flex items-center px-6", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-lg font-semibold text-foreground", children: "Listings" }, void 0, false, {
        fileName: "/dev-server/src/pages/Listings.tsx",
        lineNumber: 13,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "ml-3 text-sm text-muted-foreground", children: [
        listings.length,
        " active"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Listings.tsx",
        lineNumber: 14,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Listings.tsx",
      lineNumber: 12,
      columnNumber: 7
    }, this),
    isLoading ? /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Loading..." }, void 0, false, {
      fileName: "/dev-server/src/pages/Listings.tsx",
      lineNumber: 18,
      columnNumber: 66
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Listings.tsx",
      lineNumber: 18,
      columnNumber: 9
    }, this) : listings.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "No active listings. Create a deal and set its status to Active." }, void 0, false, {
      fileName: "/dev-server/src/pages/Listings.tsx",
      lineNumber: 20,
      columnNumber: 66
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Listings.tsx",
      lineNumber: 20,
      columnNumber: 9
    }, this) : /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-6", children: /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: listings.map((deal) => /* @__PURE__ */ jsxDEV(
      "div",
      {
        className: "border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-card",
        onClick: () => navigate(`/transactions/${deal.id}`),
        children: [
          /* @__PURE__ */ jsxDEV("div", { className: "h-36 bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxDEV("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", className: "text-muted-foreground", children: [
            /* @__PURE__ */ jsxDEV("rect", { x: "4", y: "2", width: "16", height: "20", rx: "2" }, void 0, false, {
              fileName: "/dev-server/src/pages/Listings.tsx",
              lineNumber: 32,
              columnNumber: 21
            }, this),
            /* @__PURE__ */ jsxDEV("path", { d: "M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" }, void 0, false, {
              fileName: "/dev-server/src/pages/Listings.tsx",
              lineNumber: 33,
              columnNumber: 21
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Listings.tsx",
            lineNumber: 31,
            columnNumber: 19
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Listings.tsx",
            lineNumber: 30,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "p-4", children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-semibold text-foreground truncate", children: deal.address }, void 0, false, {
              fileName: "/dev-server/src/pages/Listings.tsx",
              lineNumber: 37,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: [
              deal.city,
              ", ",
              deal.state,
              " ",
              deal.zip
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Listings.tsx",
              lineNumber: 38,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mt-3", children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-medium text-foreground", children: deal.price || "$0" }, void 0, false, {
                fileName: "/dev-server/src/pages/Listings.tsx",
                lineNumber: 40,
                columnNumber: 21
              }, this),
              deal.mls_number && /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
                "MLS# ",
                deal.mls_number
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Listings.tsx",
                lineNumber: 41,
                columnNumber: 41
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Listings.tsx",
              lineNumber: 39,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Listings.tsx",
            lineNumber: 36,
            columnNumber: 17
          }, this)
        ]
      },
      deal.id,
      true,
      {
        fileName: "/dev-server/src/pages/Listings.tsx",
        lineNumber: 25,
        columnNumber: 15
      },
      this
    )) }, void 0, false, {
      fileName: "/dev-server/src/pages/Listings.tsx",
      lineNumber: 23,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Listings.tsx",
      lineNumber: 22,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Listings.tsx",
    lineNumber: 11,
    columnNumber: 5
  }, this);
}
export {
  Listings as default
};
