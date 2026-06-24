import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { u as useToast, S as SeoHead, B as Button, L as Label, I as Input, s as supabase } from "../main.mjs";
import { C as Card, a as CardHeader, b as CardDescription, c as CardContent } from "./card-DhvFoEG1.js";
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
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
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
    return /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(
        SeoHead,
        {
          title: "Reset Password | United Estates Realty",
          description: "Reset your United Estates Realty agent account password. Secure link validation.",
          path: "/reset-password"
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/ResetPassword.tsx",
          lineNumber: 54,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-center min-h-screen bg-muted/30 p-4", children: /* @__PURE__ */ jsxDEV(Card, { className: "w-full max-w-md text-center", children: [
        /* @__PURE__ */ jsxDEV(CardHeader, { children: [
          /* @__PURE__ */ jsxDEV("h1", { className: "text-lg font-semibold leading-tight tracking-[-0.015em]", children: "Invalid Reset Link" }, void 0, false, {
            fileName: "/dev-server/src/pages/ResetPassword.tsx",
            lineNumber: 62,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(CardDescription, { children: "This link is invalid or has expired." }, void 0, false, {
            fileName: "/dev-server/src/pages/ResetPassword.tsx",
            lineNumber: 63,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/ResetPassword.tsx",
          lineNumber: 61,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDEV(Button, { onClick: () => navigate("/auth"), children: "Go to Sign In" }, void 0, false, {
          fileName: "/dev-server/src/pages/ResetPassword.tsx",
          lineNumber: 66,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/ResetPassword.tsx",
          lineNumber: 65,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/ResetPassword.tsx",
        lineNumber: 60,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/ResetPassword.tsx",
        lineNumber: 59,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/ResetPassword.tsx",
      lineNumber: 53,
      columnNumber: 7
    }, this);
  }
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(
      SeoHead,
      {
        title: "Set New Password | United Estates Realty",
        description: "Create a new password for your United Estates Realty agent account.",
        path: "/reset-password"
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/ResetPassword.tsx",
        lineNumber: 76,
        columnNumber: 7
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-center min-h-screen bg-muted/30 p-4", children: /* @__PURE__ */ jsxDEV(Card, { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxDEV(CardHeader, { className: "text-center", children: [
        /* @__PURE__ */ jsxDEV("h1", { className: "text-2xl font-semibold leading-tight tracking-[-0.015em]", children: "Set New Password" }, void 0, false, {
          fileName: "/dev-server/src/pages/ResetPassword.tsx",
          lineNumber: 84,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(CardDescription, { children: "Enter your new password below" }, void 0, false, {
          fileName: "/dev-server/src/pages/ResetPassword.tsx",
          lineNumber: 85,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/ResetPassword.tsx",
        lineNumber: 83,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(CardContent, { children: /* @__PURE__ */ jsxDEV("form", { onSubmit: handleReset, className: "space-y-4", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "new-password", children: "New Password" }, void 0, false, {
            fileName: "/dev-server/src/pages/ResetPassword.tsx",
            lineNumber: 90,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 92,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(Input, { id: "new-password", type: showPassword ? "text" : "password", placeholder: "••••••••", className: "pl-9 pr-9", value: password, onChange: (e) => setPassword(e.target.value), required: true }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 93,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setShowPassword((v) => !v), className: "absolute right-3 top-3 text-muted-foreground hover:text-foreground", tabIndex: -1, children: showPassword ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 95,
              columnNumber: 35
            }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 95,
              columnNumber: 68
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 94,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/ResetPassword.tsx",
            lineNumber: 91,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/ResetPassword.tsx",
          lineNumber: 89,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "confirm-new-password", children: "Confirm Password" }, void 0, false, {
            fileName: "/dev-server/src/pages/ResetPassword.tsx",
            lineNumber: 100,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "relative", children: [
            /* @__PURE__ */ jsxDEV(Lock, { className: "absolute left-3 top-3 h-4 w-4 text-muted-foreground" }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 102,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(Input, { id: "confirm-new-password", type: showConfirmPassword ? "text" : "password", placeholder: "••••••••", className: "pl-9 pr-9", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 103,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("button", { type: "button", onClick: () => setShowConfirmPassword((v) => !v), className: "absolute right-3 top-3 text-muted-foreground hover:text-foreground", tabIndex: -1, children: showConfirmPassword ? /* @__PURE__ */ jsxDEV(EyeOff, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 105,
              columnNumber: 42
            }, this) : /* @__PURE__ */ jsxDEV(Eye, { className: "h-4 w-4" }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 105,
              columnNumber: 75
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/ResetPassword.tsx",
              lineNumber: 104,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/ResetPassword.tsx",
            lineNumber: 101,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/ResetPassword.tsx",
          lineNumber: 99,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { type: "submit", className: "w-full", disabled: loading, children: loading ? "Updating…" : "Update Password" }, void 0, false, {
          fileName: "/dev-server/src/pages/ResetPassword.tsx",
          lineNumber: 109,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/ResetPassword.tsx",
        lineNumber: 88,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/ResetPassword.tsx",
        lineNumber: 87,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/ResetPassword.tsx",
      lineNumber: 82,
      columnNumber: 7
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/ResetPassword.tsx",
      lineNumber: 81,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/ResetPassword.tsx",
    lineNumber: 75,
    columnNumber: 5
  }, this);
}
export {
  ResetPassword as default
};
