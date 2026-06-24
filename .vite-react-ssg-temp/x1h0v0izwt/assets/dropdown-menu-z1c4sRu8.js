import { jsxDEV } from "react/jsx-dev-runtime";
import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRight, Check, Circle } from "lucide-react";
import { c as cn } from "../main.mjs";
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-accent focus:bg-accent",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxDEV(ChevronRight, { className: "ml-auto h-4 w-4" }, void 0, false, {
        fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
        lineNumber: 35,
        columnNumber: 5
      }, void 0)
    ]
  },
  void 0,
  true,
  {
    fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
    lineNumber: 25,
    columnNumber: 3
  },
  void 0
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
    lineNumber: 44,
    columnNumber: 3
  },
  void 0
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxDEV(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsxDEV(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
    lineNumber: 60,
    columnNumber: 5
  },
  void 0
) }, void 0, false, {
  fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
  lineNumber: 59,
  columnNumber: 3
}, void 0));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      inset && "pl-8",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
    lineNumber: 79,
    columnNumber: 3
  },
  void 0
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxDEV("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxDEV(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsxDEV(Check, { className: "h-4 w-4" }, void 0, false, {
        fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
        lineNumber: 106,
        columnNumber: 9
      }, void 0) }, void 0, false, {
        fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
        lineNumber: 105,
        columnNumber: 7
      }, void 0) }, void 0, false, {
        fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
        lineNumber: 104,
        columnNumber: 5
      }, void 0),
      children
    ]
  },
  void 0,
  true,
  {
    fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
    lineNumber: 95,
    columnNumber: 3
  },
  void 0
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxDEV("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxDEV(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsxDEV(Circle, { className: "h-2 w-2 fill-current" }, void 0, false, {
        fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
        lineNumber: 128,
        columnNumber: 9
      }, void 0) }, void 0, false, {
        fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
        lineNumber: 127,
        columnNumber: 7
      }, void 0) }, void 0, false, {
        fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
        lineNumber: 126,
        columnNumber: 5
      }, void 0),
      children
    ]
  },
  void 0,
  true,
  {
    fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
    lineNumber: 118,
    columnNumber: 3
  },
  void 0
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxDEV(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
    lineNumber: 142,
    columnNumber: 3
  },
  void 0
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(DropdownMenuPrimitive.Separator, { ref, className: cn("-mx-1 my-1 h-px bg-muted", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/dropdown-menu.tsx",
  lineNumber: 154,
  columnNumber: 3
}, void 0));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
export {
  DropdownMenu as D,
  DropdownMenuTrigger as a,
  DropdownMenuContent as b,
  DropdownMenuItem as c,
  DropdownMenuSeparator as d
};
