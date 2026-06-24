import { jsxDEV } from "react/jsx-dev-runtime";
import { c as cn } from "../main.mjs";
const toneClasses = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning"
};
function MetricCard({
  icon: Icon,
  label,
  value,
  description,
  tone = "default",
  className
}) {
  return /* @__PURE__ */ jsxDEV("section", { className: cn("app-surface p-5", className), children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-start justify-between gap-4", children: /* @__PURE__ */ jsxDEV("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            toneClasses[tone]
          ),
          children: /* @__PURE__ */ jsxDEV(Icon, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/dev-server/src/components/system/metric-card.tsx",
            lineNumber: 43,
            columnNumber: 15
          }, this)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/system/metric-card.tsx",
          lineNumber: 37,
          columnNumber: 13
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: label }, void 0, false, {
        fileName: "/dev-server/src/components/system/metric-card.tsx",
        lineNumber: 45,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/system/metric-card.tsx",
      lineNumber: 36,
      columnNumber: 11
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "text-2xl font-semibold leading-tight tracking-tight text-foreground", children: value }, void 0, false, {
        fileName: "/dev-server/src/components/system/metric-card.tsx",
        lineNumber: 50,
        columnNumber: 13
      }, this),
      description ? /* @__PURE__ */ jsxDEV("p", { className: "text-sm leading-6 text-muted-foreground", children: description }, void 0, false, {
        fileName: "/dev-server/src/components/system/metric-card.tsx",
        lineNumber: 54,
        columnNumber: 15
      }, this) : null
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/system/metric-card.tsx",
      lineNumber: 49,
      columnNumber: 11
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/system/metric-card.tsx",
    lineNumber: 35,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/components/system/metric-card.tsx",
    lineNumber: 34,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "/dev-server/src/components/system/metric-card.tsx",
    lineNumber: 33,
    columnNumber: 5
  }, this);
}
export {
  MetricCard as M
};
