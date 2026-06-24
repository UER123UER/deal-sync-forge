import { jsxDEV } from "react/jsx-dev-runtime";
import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { c as cn } from "../main.mjs";
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxDEV(ScrollAreaPrimitive.Root, { ref, className: cn("relative overflow-hidden", className), ...props, children: [
  /* @__PURE__ */ jsxDEV(ScrollAreaPrimitive.Viewport, { className: "h-full w-full rounded-[inherit]", children }, void 0, false, {
    fileName: "/dev-server/src/components/ui/scroll-area.tsx",
    lineNumber: 11,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(ScrollBar, {}, void 0, false, {
    fileName: "/dev-server/src/components/ui/scroll-area.tsx",
    lineNumber: 12,
    columnNumber: 5
  }, void 0),
  /* @__PURE__ */ jsxDEV(ScrollAreaPrimitive.Corner, {}, void 0, false, {
    fileName: "/dev-server/src/components/ui/scroll-area.tsx",
    lineNumber: 13,
    columnNumber: 5
  }, void 0)
] }, void 0, true, {
  fileName: "/dev-server/src/components/ui/scroll-area.tsx",
  lineNumber: 10,
  columnNumber: 3
}, void 0));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef(({ className, orientation = "vertical", ...props }, ref) => /* @__PURE__ */ jsxDEV(
  ScrollAreaPrimitive.ScrollAreaScrollbar,
  {
    ref,
    orientation,
    className: cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    ),
    ...props,
    children: /* @__PURE__ */ jsxDEV(ScrollAreaPrimitive.ScrollAreaThumb, { className: "relative flex-1 rounded-full bg-border" }, void 0, false, {
      fileName: "/dev-server/src/components/ui/scroll-area.tsx",
      lineNumber: 33,
      columnNumber: 5
    }, void 0)
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/scroll-area.tsx",
    lineNumber: 22,
    columnNumber: 3
  },
  void 0
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
export {
  ScrollArea as S
};
