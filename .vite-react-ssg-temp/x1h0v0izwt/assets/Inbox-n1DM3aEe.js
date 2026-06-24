import { jsxDEV } from "react/jsx-dev-runtime";
import { useState } from "react";
import { Plus, Mail, Send } from "lucide-react";
import { B as Button, L as Label, I as Input } from "../main.mjs";
import { T as Textarea } from "./textarea-D3hFjulo.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-BhAZyUdo.js";
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
import "@radix-ui/react-accordion";
import "@radix-ui/react-slot";
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
  return /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "h-14 border-b flex items-center px-6 gap-4", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-lg font-semibold text-foreground", children: "Inbox" }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 29,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex-1" }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 30,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "text-xs gap-1.5", onClick: () => setComposeOpen(true), children: [
        /* @__PURE__ */ jsxDEV(Plus, { className: "w-3.5 h-3.5" }, void 0, false, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 32,
          columnNumber: 11
        }, this),
        " New Email"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 31,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Inbox.tsx",
      lineNumber: 28,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col items-center justify-center", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6", children: /* @__PURE__ */ jsxDEV(Mail, { className: "w-10 h-10 text-muted-foreground" }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 38,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 37,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("h2", { className: "text-lg font-semibold text-foreground mb-2", children: "See your emails here!" }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 40,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground text-center max-w-md mb-8", children: "Connect your Google or Outlook account to see your emails, send messages, and stay on top of your communication - all in one place." }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 41,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", className: "gap-2", onClick: () => setGoogleDialogOpen(true), children: [
          /* @__PURE__ */ jsxDEV("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsxDEV("path", { d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z", fill: "#4285F4" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 46,
              columnNumber: 58
            }, this),
            /* @__PURE__ */ jsxDEV("path", { d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z", fill: "#34A853" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 46,
              columnNumber: 198
            }, this),
            /* @__PURE__ */ jsxDEV("path", { d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z", fill: "#FBBC05" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 46,
              columnNumber: 358
            }, this),
            /* @__PURE__ */ jsxDEV("path", { d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z", fill: "#EA4335" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 46,
              columnNumber: 510
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 46,
            columnNumber: 13
          }, this),
          "Sign in with Google"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 45,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", className: "gap-2", onClick: () => setOutlookDialogOpen(true), children: [
          /* @__PURE__ */ jsxDEV("svg", { className: "w-4 h-4", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsxDEV("path", { fill: "#F25022", d: "M1 1h10v10H1z" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 50,
              columnNumber: 58
            }, this),
            /* @__PURE__ */ jsxDEV("path", { fill: "#00A4EF", d: "M1 13h10v10H1z" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 50,
              columnNumber: 98
            }, this),
            /* @__PURE__ */ jsxDEV("path", { fill: "#7FBA00", d: "M13 1h10v10H13z" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 50,
              columnNumber: 139
            }, this),
            /* @__PURE__ */ jsxDEV("path", { fill: "#FFB900", d: "M13 13h10v10H13z" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 50,
              columnNumber: 181
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 50,
            columnNumber: 13
          }, this),
          "Sign in with Outlook"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 49,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 44,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Inbox.tsx",
      lineNumber: 36,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: composeOpen, onOpenChange: setComposeOpen, children: /* @__PURE__ */ jsxDEV(DialogContent, { children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: "Compose Email" }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 59,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 59,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "To *" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 61,
            columnNumber: 18
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { value: composeForm.to, onChange: (e) => setComposeForm((f) => ({ ...f, to: e.target.value })), placeholder: "recipient@email.com", className: "mt-1" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 61,
            columnNumber: 57
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 61,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Subject" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 62,
            columnNumber: 18
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { value: composeForm.subject, onChange: (e) => setComposeForm((f) => ({ ...f, subject: e.target.value })), className: "mt-1" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 62,
            columnNumber: 60
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 62,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { className: "text-xs", children: "Message" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 63,
            columnNumber: 18
          }, this),
          /* @__PURE__ */ jsxDEV(Textarea, { value: composeForm.body, onChange: (e) => setComposeForm((f) => ({ ...f, body: e.target.value })), className: "mt-1 min-h-[120px]" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 63,
            columnNumber: 60
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 63,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { className: "w-full gap-2", onClick: handleSendEmail, children: [
          /* @__PURE__ */ jsxDEV(Send, { className: "w-3.5 h-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 64,
            columnNumber: 72
          }, this),
          " Send via Email Client"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 64,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 60,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Inbox.tsx",
      lineNumber: 58,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Inbox.tsx",
      lineNumber: 57,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: googleDialogOpen, onOpenChange: setGoogleDialogOpen, children: /* @__PURE__ */ jsxDEV(DialogContent, { children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: "Google Email Integration" }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 72,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 72,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-3 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxDEV("p", { children: "To connect your Gmail account, you need to configure Google OAuth in Supabase:" }, void 0, false, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 74,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("ol", { className: "list-decimal pl-5 space-y-1", children: [
          /* @__PURE__ */ jsxDEV("li", { children: [
            "Go to ",
            /* @__PURE__ */ jsxDEV("a", { href: "https://console.cloud.google.com/apis/credentials", target: "_blank", rel: "noopener", className: "text-primary underline", children: "Google Cloud Console" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 76,
              columnNumber: 25
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 76,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("li", { children: "Create OAuth 2.0 credentials" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 77,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("li", { children: "Enable the Gmail API" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 78,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("li", { children: [
            "Add credentials to ",
            /* @__PURE__ */ jsxDEV("a", { href: "https://supabase.com/dashboard/project/dwhlgnlpkrychygodwdw/auth/providers", target: "_blank", rel: "noopener", className: "text-primary underline", children: "Supabase Auth Providers" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 79,
              columnNumber: 38
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 79,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 75,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 73,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Button, { variant: "outline", onClick: () => setGoogleDialogOpen(false), children: "Close" }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 82,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Inbox.tsx",
      lineNumber: 71,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Inbox.tsx",
      lineNumber: 70,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: outlookDialogOpen, onOpenChange: setOutlookDialogOpen, children: /* @__PURE__ */ jsxDEV(DialogContent, { children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: "Microsoft Outlook Integration" }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 89,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 89,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-3 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxDEV("p", { children: "To connect your Outlook account, configure Azure AD OAuth:" }, void 0, false, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 91,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("ol", { className: "list-decimal pl-5 space-y-1", children: [
          /* @__PURE__ */ jsxDEV("li", { children: [
            "Go to ",
            /* @__PURE__ */ jsxDEV("a", { href: "https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps", target: "_blank", rel: "noopener", className: "text-primary underline", children: "Azure App Registrations" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 93,
              columnNumber: 25
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 93,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("li", { children: "Register a new application" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 94,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("li", { children: "Add Mail.Read and Mail.Send permissions" }, void 0, false, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 95,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("li", { children: [
            "Add credentials to ",
            /* @__PURE__ */ jsxDEV("a", { href: "https://supabase.com/dashboard/project/dwhlgnlpkrychygodwdw/auth/providers", target: "_blank", rel: "noopener", className: "text-primary underline", children: "Supabase Auth Providers" }, void 0, false, {
              fileName: "/dev-server/src/pages/Inbox.tsx",
              lineNumber: 96,
              columnNumber: 38
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Inbox.tsx",
            lineNumber: 96,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Inbox.tsx",
          lineNumber: 92,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 90,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Button, { variant: "outline", onClick: () => setOutlookDialogOpen(false), children: "Close" }, void 0, false, {
        fileName: "/dev-server/src/pages/Inbox.tsx",
        lineNumber: 99,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Inbox.tsx",
      lineNumber: 88,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Inbox.tsx",
      lineNumber: 87,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Inbox.tsx",
    lineNumber: 27,
    columnNumber: 5
  }, this);
}
export {
  Inbox as default
};
