import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { u as useToast, S as SeoHead, B as Button, L as Label, I as Input, s as supabase } from "../main.mjs";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-D3uDNDlq.js";
import { Lock, EyeOff, Eye } from "lucide-react";
import "vite-react-ssg";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "next-themes";
import "sonner";
import "@radix-ui/react-toast";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
import "@radix-ui/react-label";
function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
  }, []);
  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated", description: "You can now sign in with your new password." });
      navigate("/auth");
    }
  };
  if (!isRecovery) {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        SeoHead,
        {
          title: "Reset Password | United Estates Realty",
          description: "Reset your United Estates Realty agent account password. Secure link validation.",
          path: "/reset-password"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen bg-muted/30 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md text-center", children: [
        /* @__PURE__ */ jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsx(CardTitle, { children: "Invalid Reset Link" }),
          /* @__PURE__ */ jsx(CardDescription, { children: "This link is invalid or has expired." })
        ] }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Button, { onClick: () => navigate("/auth"), children: "Go to Sign In" }) })
      ] }) })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      SeoHead,
      {
        title: "Set New Password | United Estates Realty",
        description: "Create a new password for your United Estates Realty agent account.",
        path: "/reset-password"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-screen bg-muted/30 p-4", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: "Set New Password" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Enter your new password below" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleReset, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "new-password", children: "New Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(Input, { id: "new-password", type: showPassword ? "text" : "password", placeholder: "••••••••", className: "pl-9 pr-9", value: password, onChange: (e) => setPassword(e.target.value), required: true }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowPassword((v) => !v), className: "absolute right-3 top-3 text-muted-foreground hover:text-foreground", tabIndex: -1, children: showPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "confirm-new-password", children: "Confirm Password" }),
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(Input, { id: "confirm-new-password", type: showConfirmPassword ? "text" : "password", placeholder: "••••••••", className: "pl-9 pr-9", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setShowConfirmPassword((v) => !v), className: "absolute right-3 top-3 text-muted-foreground hover:text-foreground", tabIndex: -1, children: showConfirmPassword ? /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Updating…" : "Update Password" })
      ] }) })
    ] }) })
  ] });
}
export {
  ResetPassword as default
};
