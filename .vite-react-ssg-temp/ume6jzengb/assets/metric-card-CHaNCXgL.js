import { jsx, jsxs } from "react/jsx-runtime";
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
  return /* @__PURE__ */ jsx("section", { className: cn("app-surface p-5", className), children: /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between gap-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            toneClasses[tone]
          ),
          children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" })
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: label })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("div", { className: "text-2xl font-semibold leading-tight tracking-tight text-foreground", children: value }),
      description ? /* @__PURE__ */ jsx("p", { className: "text-sm leading-6 text-muted-foreground", children: description }) : null
    ] })
  ] }) }) });
}
export {
  MetricCard as M
};
