import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Paperclip, X, Send } from "lucide-react";
import { L as Label, B as Button } from "../main.mjs";
import { T as Textarea } from "./textarea-BPTRa9Ni.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-9L1xmEk2.js";
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
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "h-14 border-b flex items-center px-6", children: /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-foreground", children: "Contact Brokerage" }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto p-6", children: /* @__PURE__ */ jsx("div", { className: "max-w-xl mx-auto space-y-6", children: /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-6 bg-background space-y-5", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Category" }),
        /* @__PURE__ */ jsxs(Select, { value: category, onValueChange: setCategory, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "mt-1.5", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a category" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c.value, children: c.label }, c.value)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Message" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            value: message,
            onChange: (e) => setMessage(e.target.value),
            placeholder: "Describe your question or issue...",
            className: "mt-1.5 min-h-[120px]"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "text-sm font-medium", children: "Attachments" }),
        /* @__PURE__ */ jsx("input", { ref: fileRef, type: "file", multiple: true, accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx", className: "hidden", onChange: handleFileChange }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "mt-1.5 gap-1.5 text-xs", onClick: () => {
          var _a;
          return (_a = fileRef.current) == null ? void 0 : _a.click();
        }, children: [
          /* @__PURE__ */ jsx(Paperclip, { className: "w-3.5 h-3.5" }),
          " Attach Files"
        ] }),
        files.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 space-y-2", children: files.map((file, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm border rounded-md px-3 py-2 bg-muted/30", children: [
          /* @__PURE__ */ jsx(Paperclip, { className: "w-3.5 h-3.5 text-muted-foreground flex-shrink-0" }),
          /* @__PURE__ */ jsx("span", { className: "text-foreground truncate flex-1", children: file.name }),
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
            (file.size / 1024).toFixed(0),
            " KB"
          ] }),
          /* @__PURE__ */ jsx("button", { onClick: () => removeFile(i), className: "p-0.5 hover:bg-muted rounded", children: /* @__PURE__ */ jsx(X, { className: "w-3.5 h-3.5 text-muted-foreground" }) })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxs(Button, { className: "w-full gap-1.5", onClick: handleSubmit, children: [
        /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }),
        " Send Message"
      ] })
    ] }) }) })
  ] });
}
export {
  ContactBrokerage as default
};
