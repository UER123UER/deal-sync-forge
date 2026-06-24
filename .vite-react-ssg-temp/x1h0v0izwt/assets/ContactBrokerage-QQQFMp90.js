import { jsxDEV } from "react/jsx-dev-runtime";
import { useState, useRef } from "react";
import { Paperclip, X, Send } from "lucide-react";
import { L as Label, B as Button } from "../main.mjs";
import { T as Textarea } from "./textarea-D3hFjulo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-y5osgoaS.js";
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
import "@radix-ui/react-select";
const CATEGORIES = [
  { value: "compliance", label: "Compliance Question" },
  { value: "it", label: "IT Question" },
  { value: "general", label: "General Question" }
];
function ContactBrokerage() {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files)]);
    }
    if (fileRef.current) fileRef.current.value = "";
  };
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmit = () => {
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    toast.success("Message sent to brokerage!");
    setCategory("");
    setMessage("");
    setFiles([]);
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "h-14 border-b flex items-center px-6", children: /* @__PURE__ */ jsxDEV("h1", { className: "text-lg font-semibold text-foreground", children: "Contact Brokerage" }, void 0, false, {
      fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
      lineNumber: 45,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
      lineNumber: 44,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-6", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-xl mx-auto space-y-6", children: /* @__PURE__ */ jsxDEV("div", { className: "border rounded-lg p-6 bg-background space-y-5", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV(Label, { className: "text-sm font-medium", children: "Category" }, void 0, false, {
          fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
          lineNumber: 52,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(Select, { value: category, onValueChange: setCategory, children: [
          /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "mt-1.5", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "Select a category" }, void 0, false, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 54,
            columnNumber: 51
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 54,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsxDEV(SelectItem, { value: c.value, children: c.label }, c.value, false, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 56,
            columnNumber: 42
          }, this)) }, void 0, false, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 55,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
          lineNumber: 53,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
        lineNumber: 51,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV(Label, { className: "text-sm font-medium", children: "Message" }, void 0, false, {
          fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
          lineNumber: 62,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(
          Textarea,
          {
            value: message,
            onChange: (e) => setMessage(e.target.value),
            placeholder: "Describe your question or issue...",
            className: "mt-1.5 min-h-[120px]"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 63,
            columnNumber: 15
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
        lineNumber: 61,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV(Label, { className: "text-sm font-medium", children: "Attachments" }, void 0, false, {
          fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
          lineNumber: 72,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("input", { ref: fileRef, type: "file", multiple: true, accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx", className: "hidden", onChange: handleFileChange }, void 0, false, {
          fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
          lineNumber: 73,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "mt-1.5 gap-1.5 text-xs", onClick: () => {
          var _a;
          return (_a = fileRef.current) == null ? void 0 : _a.click();
        }, children: [
          /* @__PURE__ */ jsxDEV(Paperclip, { className: "w-3.5 h-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 75,
            columnNumber: 17
          }, this),
          " Attach Files"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
          lineNumber: 74,
          columnNumber: 15
        }, this),
        files.length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "mt-3 space-y-2", children: files.map((file, i) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 text-sm border rounded-md px-3 py-2 bg-muted/30", children: [
          /* @__PURE__ */ jsxDEV(Paperclip, { className: "w-3.5 h-3.5 text-muted-foreground flex-shrink-0" }, void 0, false, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 81,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-foreground truncate flex-1", children: file.name }, void 0, false, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 82,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: [
            (file.size / 1024).toFixed(0),
            " KB"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 83,
            columnNumber: 23
          }, this),
          /* @__PURE__ */ jsxDEV("button", { onClick: () => removeFile(i), className: "p-0.5 hover:bg-muted rounded", children: /* @__PURE__ */ jsxDEV(X, { className: "w-3.5 h-3.5 text-muted-foreground" }, void 0, false, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 85,
            columnNumber: 25
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
            lineNumber: 84,
            columnNumber: 23
          }, this)
        ] }, i, true, {
          fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
          lineNumber: 80,
          columnNumber: 21
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
          lineNumber: 78,
          columnNumber: 17
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
        lineNumber: 71,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(Button, { className: "w-full gap-1.5", onClick: handleSubmit, children: [
        /* @__PURE__ */ jsxDEV(Send, { className: "w-4 h-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
          lineNumber: 94,
          columnNumber: 15
        }, this),
        " Send Message"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
        lineNumber: 93,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
      lineNumber: 50,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
      lineNumber: 49,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
      lineNumber: 48,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/ContactBrokerage.tsx",
    lineNumber: 43,
    columnNumber: 5
  }, this);
}
export {
  ContactBrokerage as default
};
