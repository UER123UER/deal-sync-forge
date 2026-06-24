import { jsxDEV } from "react/jsx-dev-runtime";
import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { c as cn } from "../main.mjs";
const Dialog = SheetPrimitive.Root;
const DialogPortal = SheetPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  SheetPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/dialog.tsx",
    lineNumber: 19,
    columnNumber: 3
  },
  void 0
));
DialogOverlay.displayName = SheetPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxDEV(DialogPortal, { children: [
  /* @__PURE__ */ jsxDEV(DialogOverlay, {}, void 0, false, {
    fileName: "/dev-server/src/components/ui/dialog.tsx",
    lineNumber: 35,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(
    SheetPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-xl border bg-background p-6 shadow-floating duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxDEV(SheetPrimitive.Close, { className: "absolute right-4 top-4 rounded-md border border-transparent p-1.5 text-muted-foreground transition-standard hover:border-border hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 disabled:pointer-events-none", children: [
          /* @__PURE__ */ jsxDEV(X, { className: "h-4 w-4" }, void 0, false, {
            fileName: "/dev-server/src/components/ui/dialog.tsx",
            lineNumber: 46,
            columnNumber: 9
          }, void 0),
          /* @__PURE__ */ jsxDEV("span", { className: "sr-only", children: "Close" }, void 0, false, {
            fileName: "/dev-server/src/components/ui/dialog.tsx",
            lineNumber: 47,
            columnNumber: 9
          }, void 0)
        ] }, void 0, true, {
          fileName: "/dev-server/src/components/ui/dialog.tsx",
          lineNumber: 45,
          columnNumber: 7
        }, void 0)
      ]
    },
    void 0,
    true,
    {
      fileName: "/dev-server/src/components/ui/dialog.tsx",
      lineNumber: 36,
      columnNumber: 5
    },
    void 0
  )
] }, void 0, true, {
  fileName: "/dev-server/src/components/ui/dialog.tsx",
  lineNumber: 34,
  columnNumber: 3
}, void 0));
DialogContent.displayName = SheetPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxDEV("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/dialog.tsx",
  lineNumber: 55,
  columnNumber: 3
}, void 0);
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxDEV("div", { className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/dialog.tsx",
  lineNumber: 60,
  columnNumber: 3
}, void 0);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  SheetPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/dialog.tsx",
    lineNumber: 68,
    columnNumber: 3
  },
  void 0
));
DialogTitle.displayName = SheetPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(SheetPrimitive.Description, { ref, className: cn("text-sm text-muted-foreground", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/dialog.tsx",
  lineNumber: 80,
  columnNumber: 3
}, void 0));
DialogDescription.displayName = SheetPrimitive.Description.displayName;
export {
  Dialog as D,
  DialogContent as a,
  DialogHeader as b,
  DialogTitle as c,
  DialogFooter as d
};
