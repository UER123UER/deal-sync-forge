import { jsxDEV } from "react/jsx-dev-runtime";
import { c as cn } from "../main.mjs";
function PageShell({ className, ...props }) {
  return /* @__PURE__ */ jsxDEV("div", { className: cn("app-page", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 6,
    columnNumber: 10
  }, this);
}
function PageHeader({ className, ...props }) {
  return /* @__PURE__ */ jsxDEV("header", { className: cn("app-page-header", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 10,
    columnNumber: 10
  }, this);
}
function PageHeaderHeading({
  title,
  meta,
  className,
  children
}) {
  return /* @__PURE__ */ jsxDEV("div", { className: cn("app-page-heading", className), children: [
    /* @__PURE__ */ jsxDEV("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "app-page-title", children: title }, void 0, false, {
        fileName: "/dev-server/src/components/system/page-shell.tsx",
        lineNumber: 27,
        columnNumber: 9
      }, this),
      meta ? /* @__PURE__ */ jsxDEV("p", { className: "app-page-meta", children: meta }, void 0, false, {
        fileName: "/dev-server/src/components/system/page-shell.tsx",
        lineNumber: 28,
        columnNumber: 17
      }, this) : null
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/system/page-shell.tsx",
      lineNumber: 26,
      columnNumber: 7
    }, this),
    children
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 25,
    columnNumber: 5
  }, this);
}
function PageHeaderActions({ className, ...props }) {
  return /* @__PURE__ */ jsxDEV("div", { className: cn("app-page-actions", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 36,
    columnNumber: 10
  }, this);
}
function PageToolbar({ className, ...props }) {
  return /* @__PURE__ */ jsxDEV("div", { className: cn("app-page-toolbar", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 40,
    columnNumber: 10
  }, this);
}
function PageToolbarGroup({ className, ...props }) {
  return /* @__PURE__ */ jsxDEV("div", { className: cn("app-page-toolbar-group", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 44,
    columnNumber: 10
  }, this);
}
function PageContent({ className, ...props }) {
  return /* @__PURE__ */ jsxDEV("div", { className: cn("app-page-content", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 48,
    columnNumber: 10
  }, this);
}
function PageStack({ className, ...props }) {
  return /* @__PURE__ */ jsxDEV("div", { className: cn("app-page-stack", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 52,
    columnNumber: 10
  }, this);
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
  return /* @__PURE__ */ jsxDEV("section", { className: cn("app-surface", className), children: [
    hasHeader ? /* @__PURE__ */ jsxDEV("div", { className: cn("app-section-header", headerClassName), children: [
      /* @__PURE__ */ jsxDEV("div", { className: "min-w-0", children: [
        title ? /* @__PURE__ */ jsxDEV("h2", { className: "app-section-title", children: title }, void 0, false, {
          fileName: "/dev-server/src/components/system/page-shell.tsx",
          lineNumber: 79,
          columnNumber: 22
        }, this) : null,
        description ? /* @__PURE__ */ jsxDEV("p", { className: "app-section-description", children: description }, void 0, false, {
          fileName: "/dev-server/src/components/system/page-shell.tsx",
          lineNumber: 80,
          columnNumber: 28
        }, this) : null
      ] }, void 0, true, {
        fileName: "/dev-server/src/components/system/page-shell.tsx",
        lineNumber: 78,
        columnNumber: 11
      }, this),
      actions ? /* @__PURE__ */ jsxDEV("div", { className: "shrink-0", children: actions }, void 0, false, {
        fileName: "/dev-server/src/components/system/page-shell.tsx",
        lineNumber: 82,
        columnNumber: 22
      }, this) : null
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/system/page-shell.tsx",
      lineNumber: 77,
      columnNumber: 9
    }, this) : null,
    /* @__PURE__ */ jsxDEV("div", { className: cn("app-section-body", bodyClassName), children }, void 0, false, {
      fileName: "/dev-server/src/components/system/page-shell.tsx",
      lineNumber: 85,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 75,
    columnNumber: 5
  }, this);
}
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}) {
  return /* @__PURE__ */ jsxDEV("div", { className: cn("app-empty-state", className), children: [
    Icon ? /* @__PURE__ */ jsxDEV("div", { className: "app-empty-icon", children: /* @__PURE__ */ jsxDEV(Icon, { className: "h-7 w-7" }, void 0, false, {
      fileName: "/dev-server/src/components/system/page-shell.tsx",
      lineNumber: 107,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/components/system/page-shell.tsx",
      lineNumber: 106,
      columnNumber: 9
    }, this) : null,
    /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxDEV("h2", { className: "app-empty-title", children: title }, void 0, false, {
        fileName: "/dev-server/src/components/system/page-shell.tsx",
        lineNumber: 111,
        columnNumber: 9
      }, this),
      description ? /* @__PURE__ */ jsxDEV("p", { className: "app-empty-copy", children: description }, void 0, false, {
        fileName: "/dev-server/src/components/system/page-shell.tsx",
        lineNumber: 112,
        columnNumber: 24
      }, this) : null
    ] }, void 0, true, {
      fileName: "/dev-server/src/components/system/page-shell.tsx",
      lineNumber: 110,
      columnNumber: 7
    }, this),
    action ? /* @__PURE__ */ jsxDEV("div", { children: action }, void 0, false, {
      fileName: "/dev-server/src/components/system/page-shell.tsx",
      lineNumber: 114,
      columnNumber: 17
    }, this) : null
  ] }, void 0, true, {
    fileName: "/dev-server/src/components/system/page-shell.tsx",
    lineNumber: 104,
    columnNumber: 5
  }, this);
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
