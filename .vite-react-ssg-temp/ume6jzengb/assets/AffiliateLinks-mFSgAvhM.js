import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { Link2, Plus, ExternalLink, Check, Copy, Pencil, Trash2 } from "lucide-react";
import { a as useAuth, B as Button, L as Label, I as Input, s as supabase } from "../main.mjs";
import { T as Textarea } from "./textarea-BPTRa9Ni.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-9L1xmEk2.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-Gt8dxHPr.js";
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
  "Mortgage Broker",
  "Home Inspector",
  "Title Company",
  "Insurance",
  "Attorney",
  "Contractor",
  "Photographer",
  "Stager",
  "Other"
];
function AffiliateLinks() {
  const { user } = useAuth();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Mortgage Broker");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const resetForm = () => {
    setName("");
    setCategory("Mortgage Broker");
    setUrl("");
    setNotes("");
    setEditing(null);
  };
  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("affiliate_links").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) toast.error("Failed to load affiliate links");
    setLinks(data ?? []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, [user == null ? void 0 : user.id]);
  const openCreate = () => {
    resetForm();
    setOpen(true);
  };
  const openEdit = (link) => {
    setEditing(link);
    setName(link.name);
    setCategory(link.category);
    setUrl(link.url);
    setNotes(link.notes ?? "");
    setOpen(true);
  };
  const handleSave = async () => {
    if (!user) return;
    if (!name.trim() || !url.trim()) {
      toast.error("Name and URL are required");
      return;
    }
    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    if (editing) {
      const { error } = await supabase.from("affiliate_links").update({ name, category, url: normalizedUrl, notes }).eq("id", editing.id);
      if (error) {
        toast.error("Failed to update");
        return;
      }
      toast.success("Affiliate link updated");
    } else {
      const { error } = await supabase.from("affiliate_links").insert({ user_id: user.id, name, category, url: normalizedUrl, notes });
      if (error) {
        toast.error("Failed to add");
        return;
      }
      toast.success("Affiliate link added");
    }
    setOpen(false);
    resetForm();
    load();
  };
  const handleDelete = async (id) => {
    if (!confirm("Delete this affiliate link?")) return;
    const { error } = await supabase.from("affiliate_links").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Deleted");
    setLinks((prev) => prev.filter((l) => l.id !== id));
  };
  const handleCopy = (link) => {
    navigator.clipboard.writeText(link.url).catch(() => {
    });
    setCopiedId(link.id);
    toast.success("Link copied");
    setTimeout(() => setCopiedId((c) => c === link.id ? null : c), 1800);
  };
  const categories = useMemo(() => ["All", ...Array.from(new Set(links.map((l) => l.category)))], [links]);
  const visible = filter === "All" ? links : links.filter((l) => l.category === filter);
  return /* @__PURE__ */ jsxs("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "h-14 border-b flex items-center justify-between px-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Link2, { className: "w-5 h-5 text-primary" }),
        /* @__PURE__ */ jsx("h1", { className: "text-lg font-semibold text-foreground", children: "Affiliate Links" })
      ] }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: openCreate, className: "gap-1.5", children: [
        /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
        " Add Link"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto p-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Save and share referral links for your trusted partners - mortgage brokers, inspectors, title companies, and more. Copy a link any time to share it with a client." }),
      categories.length > 1 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: categories.map((c) => /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setFilter(c),
          className: `px-3 py-1 text-xs rounded-full border transition-colors ${filter === c ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:bg-muted"}`,
          children: c
        },
        c
      )) }),
      loading ? /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Loading…" }) : visible.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "border border-dashed rounded-lg p-12 text-center", children: [
        /* @__PURE__ */ jsx(Link2, { className: "w-8 h-8 text-muted-foreground mx-auto mb-3" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "No affiliate links yet." }),
        /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: openCreate, className: "gap-1.5", children: [
          /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4" }),
          " Add your first link"
        ] })
      ] }) : /* @__PURE__ */ jsx("div", { className: "grid gap-3", children: visible.map((link) => /* @__PURE__ */ jsxs("div", { className: "border rounded-lg p-4 bg-background flex items-start gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Link2, { className: "w-5 h-5 text-primary" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-foreground", children: link.name }),
            /* @__PURE__ */ jsx("span", { className: "text-[10px] uppercase tracking-wide bg-muted text-muted-foreground px-2 py-0.5 rounded-full", children: link.category })
          ] }),
          /* @__PURE__ */ jsxs(
            "a",
            {
              href: link.url,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-xs text-primary hover:underline break-all inline-flex items-center gap-1 mt-1",
              children: [
                link.url,
                /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" })
              ]
            }
          ),
          link.notes && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1.5", children: link.notes })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleCopy(link), className: "gap-1.5", children: copiedId === link.id ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(Copy, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(link), children: /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDelete(link.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4" }) })
        ] })
      ] }, link.id)) })
    ] }) }),
    /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) resetForm();
    }, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: editing ? "Edit Affiliate Link" : "Add Affiliate Link" }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "aff-name", children: "Partner Name" }),
          /* @__PURE__ */ jsx(Input, { id: "aff-name", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. John Smith - ABC Mortgage" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "aff-category", children: "Category" }),
          /* @__PURE__ */ jsxs(Select, { value: category, onValueChange: setCategory, children: [
            /* @__PURE__ */ jsx(SelectTrigger, { id: "aff-category", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsx(SelectItem, { value: c, children: c }, c)) })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "aff-url", children: "Referral Link" }),
          /* @__PURE__ */ jsx(Input, { id: "aff-url", value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://…" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "aff-notes", children: "Notes (optional)" }),
          /* @__PURE__ */ jsx(Textarea, { id: "aff-notes", value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Anything to remember about this partner…", rows: 3 })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { onClick: handleSave, children: editing ? "Save" : "Add Link" })
      ] })
    ] }) })
  ] });
}
export {
  AffiliateLinks as default
};
