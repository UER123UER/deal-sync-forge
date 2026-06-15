import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Plus, Mail, Send } from "lucide-react";
import { B as Button, L as Label, I as Input } from "../main.mjs";
import { T as Textarea } from "./textarea-BPTRa9Ni.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-Gt8dxHPr.js";
import { toast } from "sonner";
import "vite-react-ssg";
import "react-router-dom";
import "@supabase/supabase-js";
import "@tanstack/react-query";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-dialog";
import "class-variance-authority";
import "next-themes";
import "@radix-ui/react-toast";
import "@radix-ui/react-tooltip";
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
import "@radix-ui/react-label";
function Inbox() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeForm, setComposeForm] = useState({ to: "", subject: "", body: "" });
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [outlookDialogOpen, setOutlookDialogOpen] = useState(false);
  const handleSendEmail = () => {
    if (!composeForm.to.trim()) {
      toast.error("Recipient is required");
      return;
    }
    const mailto = `mailto:${encodeURIComponent(composeForm.to)}?subject=${encodeURIComponent(composeForm.subject)}&body=${encodeURIComponent(composeForm.body)}`;
    window.open(mailto, "_blank");
    toast.success("Opening email client...");
    setComposeOpen(false);
    setComposeForm({ to: "", subject: "", body: "" });
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "h-14 border-b flex items-center px-6 gap-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-foreground", children: "Inbox" }),
      /* @__PURE__ */ jsx("div", { className: "flex-1" }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", className: "text-xs gap-1.5", onClick: () => setComposeOpen(true), children: [
        /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
        " New Email"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsx("div", { className: "w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6", children: /* @__PURE__ */ jsx(Mail, { className: "w-10 h-10 text-muted-foreground" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-foreground mb-2", children: "See your emails here!" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground text-center max-w-md mb-8", children: "Connect your Google or Outlook account to see your emails, send messages, and stay on top of your communication - all in one place." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2", onClick: () => setGoogleDialogOpen(true), children: [
          /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z", fill: "#4285F4" }),
            /* @__PURE__ */ jsx("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }),
            /* @__PURE__ */ jsx("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }),
            /* @__PURE__ */ jsx("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" })
          ] }),
          "Sign in with Google"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "gap-2", onClick: () => setOutlookDialogOpen(true), children: [
          /* @__PURE__ */ jsxs("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsx("path", { fill: "#F25022", d: "M1 1h10v10H1z" }),
            /* @__PURE__ */ jsx("path", { fill: "#00A4EF", d: "M1 13h10v10H1z" }),
            /* @__PURE__ */ jsx("path", { fill: "#7FBA00", d: "M13 1h10v10H13z" }),
            /* @__PURE__ */ jsx("path", { fill: "#FFB900", d: "M13 13h10v10H13z" })
          ] }),
          "Sign in with Outlook"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Dialog, { open: composeOpen, onOpenChange: setComposeOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Compose Email" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "To *" }),
          /* @__PURE__ */ jsx(Input, { value: composeForm.to, onChange: (e) => setComposeForm((f) => ({ ...f, to: e.target.value })), placeholder: "recipient@email.com", className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Subject" }),
          /* @__PURE__ */ jsx(Input, { value: composeForm.subject, onChange: (e) => setComposeForm((f) => ({ ...f, subject: e.target.value })), className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Message" }),
          /* @__PURE__ */ jsx(Textarea, { value: composeForm.body, onChange: (e) => setComposeForm((f) => ({ ...f, body: e.target.value })), className: "mt-1 min-h-[120px]" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { className: "w-full gap-2", onClick: handleSendEmail, children: [
          /* @__PURE__ */ jsx(Send, { className: "w-3.5 h-3.5" }),
          " Send via Email Client"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: googleDialogOpen, onOpenChange: setGoogleDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Google Email Integration" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("p", { children: "To connect your Gmail account, you need to configure Google OAuth in Supabase:" }),
        /* @__PURE__ */ jsxs("ol", { className: "list-decimal pl-5 space-y-1", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "Go to ",
            /* @__PURE__ */ jsx("a", { href: "https://console.cloud.google.com/apis/credentials", target: "_blank", rel: "noopener", className: "text-primary underline", children: "Google Cloud Console" })
          ] }),
          /* @__PURE__ */ jsx("li", { children: "Create OAuth 2.0 credentials" }),
          /* @__PURE__ */ jsx("li", { children: "Enable the Gmail API" }),
          /* @__PURE__ */ jsxs("li", { children: [
            "Add credentials to ",
            /* @__PURE__ */ jsx("a", { href: "https://supabase.com/dashboard/project/dwhlgnlpkrychygodwdw/auth/providers", target: "_blank", rel: "noopener", className: "text-primary underline", children: "Supabase Auth Providers" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setGoogleDialogOpen(false), children: "Close" })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open: outlookDialogOpen, onOpenChange: setOutlookDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Microsoft Outlook Integration" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-3 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("p", { children: "To connect your Outlook account, configure Azure AD OAuth:" }),
        /* @__PURE__ */ jsxs("ol", { className: "list-decimal pl-5 space-y-1", children: [
          /* @__PURE__ */ jsxs("li", { children: [
            "Go to ",
            /* @__PURE__ */ jsx("a", { href: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", target: "_blank", rel: "noopener", className: "text-primary underline", children: "Azure App Registrations" })
          ] }),
          /* @__PURE__ */ jsx("li", { children: "Register a new application" }),
          /* @__PURE__ */ jsx("li", { children: "Add Mail.Read and Mail.Send permissions" }),
          /* @__PURE__ */ jsxs("li", { children: [
            "Add credentials to ",
            /* @__PURE__ */ jsx("a", { href: "https://supabase.com/dashboard/project/dwhlgnlpkrychygodwdw/auth/providers", target: "_blank", rel: "noopener", className: "text-primary underline", children: "Supabase Auth Providers" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOutlookDialogOpen(false), children: "Close" })
    ] }) })
  ] });
}
export {
  Inbox as default
};
