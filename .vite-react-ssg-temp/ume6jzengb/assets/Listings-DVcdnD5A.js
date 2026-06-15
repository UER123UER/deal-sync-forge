import { jsxs, jsx } from "react/jsx-runtime";
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
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
import "@radix-ui/react-label";
function Listings() {
  const { data: deals = [], isLoading } = useDeals();
  const navigate = useNavigate();
  const listings = deals.filter((d) => d.status === "active");
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "h-14 border-b flex items-center px-6", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-foreground", children: "Listings" }),
      /* @__PURE__ */ jsxs("span", { className: "ml-3 text-sm text-muted-foreground", children: [
        listings.length,
        " active"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading..." }) }) : listings.length === 0 ? /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No active listings. Create a deal and set its status to Active." }) }) : /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto p-6", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: listings.map((deal) => /* @__PURE__ */ jsxs(
      "div",
      {
        className: "border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-card",
        onClick: () => navigate(`/transactions/${deal.id}`),
        children: [
          /* @__PURE__ */ jsx("div", { className: "h-36 bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsxs("svg", { width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "1.5", className: "text-muted-foreground", children: [
            /* @__PURE__ */ jsx("rect", { x: "4", y: "2", width: "16", height: "20", rx: "2" }),
            /* @__PURE__ */ jsx("path", { d: "M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01" })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-4", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-semibold text-foreground truncate", children: deal.address }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              deal.city,
              ", ",
              deal.state,
              " ",
              deal.zip
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-3", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-foreground", children: deal.price || "$0" }),
              deal.mls_number && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                "MLS# ",
                deal.mls_number
              ] })
            ] })
          ] })
        ]
      },
      deal.id
    )) }) })
  ] });
}
export {
  Listings as default
};
