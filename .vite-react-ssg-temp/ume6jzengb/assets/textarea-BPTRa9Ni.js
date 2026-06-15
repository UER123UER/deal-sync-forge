import { jsx } from "react/jsx-runtime";
import * as React from "react";
import { c as cn } from "../main.mjs";
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "textarea",
    {
      className: cn(
        "flex min-h-[6.5rem] w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-none ring-offset-background transition-[border-color,box-shadow,background-color] duration-150 ease-out placeholder:text-muted-foreground/90 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/20 disabled:cursor-not-allowed disabled:bg-muted/35 disabled:text-muted-foreground",
        className
      ),
      ref,
      ...props
    }
  );
});
Textarea.displayName = "Textarea";
export {
  Textarea as T
};
