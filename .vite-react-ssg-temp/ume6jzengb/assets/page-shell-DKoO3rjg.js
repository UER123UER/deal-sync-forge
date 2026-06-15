import { jsx, jsxs } from "react/jsx-runtime";
import { c as cn } from "../main.mjs";
function PageShell({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("app-page", className), ...props });
}
function PageHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx("header", { className: cn("app-page-header", className), ...props });
}
function PageHeaderHeading({
  title,
  meta,
  className,
  children
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("app-page-heading", className), children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("h1", { className: "app-page-title", children: title }),
      meta ? /* @__PURE__ */ jsx("p", { className: "app-page-meta", children: meta }) : null
    ] }),
    children
  ] });
}
function PageHeaderActions({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("app-page-actions", className), ...props });
}
function PageToolbar({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("app-page-toolbar", className), ...props });
}
function PageToolbarGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("app-page-toolbar-group", className), ...props });
}
function PageContent({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("app-page-content", className), ...props });
}
function PageStack({ className, ...props }) {
  return /* @__PURE__ */ jsx("div", { className: cn("app-page-stack", className), ...props });
}
function PageSection({
  title,
  description,
  actions,
  className,
  headerClassName,
  bodyClassName,
  children
}) {
  const hasHeader = title || description || actions;
  return /* @__PURE__ */ jsxs("section", { className: cn("app-surface", className), children: [
    hasHeader ? /* @__PURE__ */ jsxs("div", { className: cn("app-section-header", headerClassName), children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
        title ? /* @__PURE__ */ jsx("h2", { className: "app-section-title", children: title }) : null,
        description ? /* @__PURE__ */ jsx("p", { className: "app-section-description", children: description }) : null
      ] }),
      actions ? /* @__PURE__ */ jsx("div", { className: "shrink-0", children: actions }) : null
    ] }) : null,
    /* @__PURE__ */ jsx("div", { className: cn("app-section-body", bodyClassName), children })
  ] });
}
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("app-empty-state", className), children: [
    Icon ? /* @__PURE__ */ jsx("div", { className: "app-empty-icon", children: /* @__PURE__ */ jsx(Icon, { className: "h-7 w-7" }) }) : null,
    /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsx("h2", { className: "app-empty-title", children: title }),
      description ? /* @__PURE__ */ jsx("p", { className: "app-empty-copy", children: description }) : null
    ] }),
    action ? /* @__PURE__ */ jsx("div", { children: action }) : null
  ] });
}
export {
  EmptyState as E,
  PageShell as P,
  PageHeader as a,
  PageHeaderHeading as b,
  PageHeaderActions as c,
  PageToolbar as d,
  PageToolbarGroup as e,
  PageContent as f,
  PageStack as g,
  PageSection as h
};
