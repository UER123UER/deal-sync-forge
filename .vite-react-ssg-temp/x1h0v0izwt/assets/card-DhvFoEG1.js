import { jsxDEV } from "react/jsx-dev-runtime";
import * as React from "react";
import { c as cn } from "../main.mjs";
const Card = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("div", { ref, className: cn("rounded-lg border bg-card text-card-foreground shadow-surface", className), ...props }, void 0, false, {
  fileName: "/dev-server/src/components/ui/card.tsx",
  lineNumber: 6,
  columnNumber: 3
}, void 0));
Card.displayName = "Card";
const CardHeader = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("div", { ref, className: cn("flex flex-col gap-1.5 p-6", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/card.tsx",
    lineNumber: 12,
    columnNumber: 5
  }, void 0)
);
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("h3", { ref, className: cn("text-lg font-semibold leading-tight tracking-[-0.015em]", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/card.tsx",
    lineNumber: 19,
    columnNumber: 5
  }, void 0)
);
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("p", { ref, className: cn("text-sm leading-6 text-muted-foreground", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/card.tsx",
    lineNumber: 26,
    columnNumber: 5
  }, void 0)
);
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("div", { ref, className: cn("p-6 pt-0", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/card.tsx",
    lineNumber: 32,
    columnNumber: 37
  }, void 0)
);
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("div", { ref, className: cn("flex items-center p-6 pt-0", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/card.tsx",
    lineNumber: 38,
    columnNumber: 5
  }, void 0)
);
CardFooter.displayName = "CardFooter";
export {
  Card as C,
  CardHeader as a,
  CardDescription as b,
  CardContent as c,
  CardTitle as d
};
