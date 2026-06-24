import { jsxDEV } from "react/jsx-dev-runtime";
import * as React from "react";
import { c as cn } from "../main.mjs";
const Table = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("div", { className: "relative w-full overflow-auto rounded-lg", children: /* @__PURE__ */ jsxDEV("table", { ref, className: cn("w-full caption-bottom text-sm", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/table.tsx",
    lineNumber: 8,
    columnNumber: 7
  }, void 0) }, void 0, false, {
    fileName: "/dev-server/src/components/ui/table.tsx",
    lineNumber: 7,
    columnNumber: 5
  }, void 0)
);
Table.displayName = "Table";
const TableHeader = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("thead", { ref, className: cn("[&_tr]:border-b", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/table.tsx",
    lineNumber: 15,
    columnNumber: 37
  }, void 0)
);
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("tbody", { ref, className: cn("[&_tr:last-child]:border-0", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/table.tsx",
    lineNumber: 21,
    columnNumber: 5
  }, void 0)
);
TableBody.displayName = "TableBody";
const TableFooter = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("tfoot", { ref, className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/table.tsx",
    lineNumber: 28,
    columnNumber: 5
  }, void 0)
);
TableFooter.displayName = "TableFooter";
const TableRow = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
    "tr",
    {
      ref,
      className: cn("border-b transition-colors data-[state=selected]:bg-muted/60 hover:bg-muted/35", className),
      ...props
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/components/ui/table.tsx",
      lineNumber: 35,
      columnNumber: 5
    },
    void 0
  )
);
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV(
    "th",
    {
      ref,
      className: cn(
        "h-12 px-4 text-left align-middle text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground [&:has([role=checkbox])]:pr-0",
        className
      ),
      ...props
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/components/ui/table.tsx",
      lineNumber: 46,
      columnNumber: 5
    },
    void 0
  )
);
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("td", { ref, className: cn("px-4 py-3.5 align-middle [&:has([role=checkbox])]:pr-0", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/table.tsx",
    lineNumber: 60,
    columnNumber: 5
  }, void 0)
);
TableCell.displayName = "TableCell";
const TableCaption = React.forwardRef(
  ({ className, ...props }, ref) => /* @__PURE__ */ jsxDEV("caption", { ref, className: cn("mt-4 text-sm text-muted-foreground", className), ...props }, void 0, false, {
    fileName: "/dev-server/src/components/ui/table.tsx",
    lineNumber: 67,
    columnNumber: 5
  }, void 0)
);
TableCaption.displayName = "TableCaption";
export {
  Table as T,
  TableHeader as a,
  TableRow as b,
  TableHead as c,
  TableBody as d,
  TableCell as e
};
