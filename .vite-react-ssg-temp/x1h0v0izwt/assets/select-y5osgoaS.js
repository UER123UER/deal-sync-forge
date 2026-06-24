import { jsxDEV } from "react/jsx-dev-runtime";
import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import { c as cn } from "../main.mjs";
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm text-foreground ring-offset-background transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-muted-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-0 focus:border-ring disabled:cursor-not-allowed disabled:bg-muted/35 disabled:text-muted-foreground [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxDEV(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsxDEV(ChevronDown, { className: "h-4 w-4 opacity-50" }, void 0, false, {
        fileName: "/dev-server/src/components/ui/select.tsx",
        lineNumber: 27,
        columnNumber: 7
      }, void 0) }, void 0, false, {
        fileName: "/dev-server/src/components/ui/select.tsx",
        lineNumber: 26,
        columnNumber: 5
      }, void 0)
    ]
  },
  void 0,
  true,
  {
    fileName: "/dev-server/src/components/ui/select.tsx",
    lineNumber: 17,
    columnNumber: 3
  },
  void 0
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxDEV(ChevronUp, { className: "h-4 w-4" }, void 0, false, {
      fileName: "/dev-server/src/components/ui/select.tsx",
      lineNumber: 42,
      columnNumber: 5
    }, void 0)
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/select.tsx",
    lineNumber: 37,
    columnNumber: 3
  },
  void 0
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsxDEV(ChevronDown, { className: "h-4 w-4" }, void 0, false, {
      fileName: "/dev-server/src/components/ui/select.tsx",
      lineNumber: 56,
      columnNumber: 5
    }, void 0)
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/select.tsx",
    lineNumber: 51,
    columnNumber: 3
  },
  void 0
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsxDEV(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxDEV(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-96 min-w-[10rem] overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-floating data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsxDEV(SelectScrollUpButton, {}, void 0, false, {
        fileName: "/dev-server/src/components/ui/select.tsx",
        lineNumber: 77,
        columnNumber: 7
      }, void 0),
      /* @__PURE__ */ jsxDEV(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/components/ui/select.tsx",
          lineNumber: 78,
          columnNumber: 7
        },
        void 0
      ),
      /* @__PURE__ */ jsxDEV(SelectScrollDownButton, {}, void 0, false, {
        fileName: "/dev-server/src/components/ui/select.tsx",
        lineNumber: 87,
        columnNumber: 7
      }, void 0)
    ]
  },
  void 0,
  true,
  {
    fileName: "/dev-server/src/components/ui/select.tsx",
    lineNumber: 66,
    columnNumber: 5
  },
  void 0
) }, void 0, false, {
  fileName: "/dev-server/src/components/ui/select.tsx",
  lineNumber: 65,
  columnNumber: 3
}, void 0));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(SelectPrimitive.Label, { ref, className: cn("py-2 pl-8 pr-3 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/select.tsx",
  lineNumber: 97,
  columnNumber: 3
}, void 0));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-md py-2.5 pl-8 pr-3 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxDEV("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxDEV(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsxDEV(Check, { className: "h-4 w-4" }, void 0, false, {
        fileName: "/dev-server/src/components/ui/select.tsx",
        lineNumber: 115,
        columnNumber: 9
      }, void 0) }, void 0, false, {
        fileName: "/dev-server/src/components/ui/select.tsx",
        lineNumber: 114,
        columnNumber: 7
      }, void 0) }, void 0, false, {
        fileName: "/dev-server/src/components/ui/select.tsx",
        lineNumber: 113,
        columnNumber: 5
      }, void 0),
      /* @__PURE__ */ jsxDEV(SelectPrimitive.ItemText, { children }, void 0, false, {
        fileName: "/dev-server/src/components/ui/select.tsx",
        lineNumber: 119,
        columnNumber: 5
      }, void 0)
    ]
  },
  void 0,
  true,
  {
    fileName: "/dev-server/src/components/ui/select.tsx",
    lineNumber: 105,
    columnNumber: 3
  },
  void 0
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(SelectPrimitive.Separator, { ref, className: cn("-mx-1 my-1 h-px bg-muted", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/select.tsx",
  lineNumber: 128,
  columnNumber: 3
}, void 0));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
export {
  Select as S,
  SelectTrigger as a,
  SelectValue as b,
  SelectContent as c,
  SelectItem as d
};
