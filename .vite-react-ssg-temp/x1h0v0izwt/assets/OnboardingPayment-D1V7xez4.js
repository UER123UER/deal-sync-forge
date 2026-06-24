import { jsxDEV } from "react/jsx-dev-runtime";
import { Navigate } from "react-router-dom";
import { a as useAuth, b as useOnboardingStatus, h as getNextOnboardingPath } from "../main.mjs";
import "vite-react-ssg";
import "react";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "lucide-react";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "next-themes";
import "sonner";
import "@radix-ui/react-toast";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
import "@radix-ui/react-label";
function OnboardingPayment() {
  const { user, profile, loading: authLoading } = useAuth();
  const { data: onboardingStatus, isLoading } = useOnboardingStatus({ user, profile, loading: authLoading });
  if (isLoading) {
    return /* @__PURE__ */ jsxDEV("div", { className: "flex min-h-screen items-center justify-center", children: /* @__PURE__ */ jsxDEV("div", { className: "h-8 w-8 animate-spin rounded-full border-b-2 border-primary" }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingPayment.tsx",
      lineNumber: 13,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/OnboardingPayment.tsx",
      lineNumber: 12,
      columnNumber: 7
    }, this);
  }
  return /* @__PURE__ */ jsxDEV(Navigate, { to: getNextOnboardingPath(onboardingStatus), replace: true }, void 0, false, {
    fileName: "/dev-server/src/pages/OnboardingPayment.tsx",
    lineNumber: 18,
    columnNumber: 10
  }, this);
}
export {
  OnboardingPayment as default
};
