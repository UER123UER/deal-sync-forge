import { jsxDEV } from "react/jsx-dev-runtime";
import { useState, useEffect, useMemo } from "react";
import { Link2, Plus, ExternalLink, Check, Copy, Pencil, Trash2 } from "lucide-react";
import { a as useAuth, B as Button, L as Label, I as Input, s as supabase } from "../main.mjs";
import { T as Textarea } from "./textarea-D3hFjulo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-y5osgoaS.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogFooter } from "./dialog-BhAZyUdo.js";
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
  return /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "h-14 border-b flex items-center justify-between px-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxDEV(Link2, { className: "w-5 h-5 text-primary" }, void 0, false, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 132,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("h1", { className: "text-lg font-semibold text-foreground", children: "Affiliate Links" }, void 0, false, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 133,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 131,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Button, { size: "sm", onClick: openCreate, className: "gap-1.5", children: [
        /* @__PURE__ */ jsxDEV(Plus, { className: "w-4 h-4" }, void 0, false, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 136,
          columnNumber: 11
        }, this),
        " Add Link"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 135,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
      lineNumber: 130,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-6", children: /* @__PURE__ */ jsxDEV("div", { className: "max-w-4xl mx-auto space-y-6", children: [
      /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Save and share referral links for your trusted partners - mortgage brokers, inspectors, title companies, and more. Copy a link any time to share it with a client." }, void 0, false, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 142,
        columnNumber: 11
      }, this),
      categories.length > 1 && /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap gap-2", children: categories.map((c) => /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => setFilter(c),
          className: `px-3 py-1 text-xs rounded-full border transition-colors ${filter === c ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground hover:bg-muted"}`,
          children: c
        },
        c,
        false,
        {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 150,
          columnNumber: 17
        },
        this
      )) }, void 0, false, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 148,
        columnNumber: 13
      }, this),
      loading ? /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-muted-foreground", children: "Loading…" }, void 0, false, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 166,
        columnNumber: 13
      }, this) : visible.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "border border-dashed rounded-lg p-12 text-center", children: [
        /* @__PURE__ */ jsxDEV(Link2, { className: "w-8 h-8 text-muted-foreground mx-auto mb-3" }, void 0, false, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 169,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground mb-4", children: "No affiliate links yet." }, void 0, false, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 170,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", variant: "outline", onClick: openCreate, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxDEV(Plus, { className: "w-4 h-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 172,
            columnNumber: 17
          }, this),
          " Add your first link"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 171,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 168,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDEV("div", { className: "grid gap-3", children: visible.map((link) => /* @__PURE__ */ jsxDEV("div", { className: "border rounded-lg p-4 bg-background flex items-start gap-3", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxDEV(Link2, { className: "w-5 h-5 text-primary" }, void 0, false, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 180,
          columnNumber: 21
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 179,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "font-semibold text-foreground", children: link.name }, void 0, false, {
              fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
              lineNumber: 184,
              columnNumber: 23
            }, this),
            /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] uppercase tracking-wide bg-muted text-muted-foreground px-2 py-0.5 rounded-full", children: link.category }, void 0, false, {
              fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
              lineNumber: 185,
              columnNumber: 23
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 183,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV(
            "a",
            {
              href: link.url,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "text-xs text-primary hover:underline break-all inline-flex items-center gap-1 mt-1",
              children: [
                link.url,
                /* @__PURE__ */ jsxDEV(ExternalLink, { className: "w-3 h-3" }, void 0, false, {
                  fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
                  lineNumber: 196,
                  columnNumber: 23
                }, this)
              ]
            },
            void 0,
            true,
            {
              fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
              lineNumber: 189,
              columnNumber: 21
            },
            this
          ),
          link.notes && /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground mt-1.5", children: link.notes }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 199,
            columnNumber: 23
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 182,
          columnNumber: 19
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1 shrink-0", children: [
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", onClick: () => handleCopy(link), className: "gap-1.5", children: copiedId === link.id ? /* @__PURE__ */ jsxDEV(Check, { className: "w-4 h-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 204,
            columnNumber: 47
          }, this) : /* @__PURE__ */ jsxDEV(Copy, { className: "w-4 h-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 204,
            columnNumber: 79
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 203,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", onClick: () => openEdit(link), children: /* @__PURE__ */ jsxDEV(Pencil, { className: "w-4 h-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 207,
            columnNumber: 23
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 206,
            columnNumber: 21
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { variant: "ghost", size: "sm", onClick: () => handleDelete(link.id), className: "text-destructive hover:text-destructive", children: /* @__PURE__ */ jsxDEV(Trash2, { className: "w-4 h-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 210,
            columnNumber: 23
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 209,
            columnNumber: 21
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 202,
          columnNumber: 19
        }, this)
      ] }, link.id, true, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 178,
        columnNumber: 17
      }, this)) }, void 0, false, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 176,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
      lineNumber: 141,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
      lineNumber: 140,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open, onOpenChange: (o) => {
      setOpen(o);
      if (!o) resetForm();
    }, children: /* @__PURE__ */ jsxDEV(DialogContent, { className: "max-w-md", children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: editing ? "Edit Affiliate Link" : "Add Affiliate Link" }, void 0, false, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 223,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 222,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "space-y-4 py-2", children: [
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "aff-name", children: "Partner Name" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 227,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { id: "aff-name", value: name, onChange: (e) => setName(e.target.value), placeholder: "e.g. John Smith - ABC Mortgage" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 228,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 226,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "aff-category", children: "Category" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 231,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Select, { value: category, onValueChange: setCategory, children: [
            /* @__PURE__ */ jsxDEV(SelectTrigger, { id: "aff-category", children: /* @__PURE__ */ jsxDEV(SelectValue, {}, void 0, false, {
              fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
              lineNumber: 233,
              columnNumber: 50
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
              lineNumber: 233,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(SelectContent, { children: CATEGORIES.map((c) => /* @__PURE__ */ jsxDEV(SelectItem, { value: c, children: c }, c, false, {
              fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
              lineNumber: 235,
              columnNumber: 42
            }, this)) }, void 0, false, {
              fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
              lineNumber: 234,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 232,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 230,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "aff-url", children: "Referral Link" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 240,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { id: "aff-url", value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://…" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 241,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 239,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { children: [
          /* @__PURE__ */ jsxDEV(Label, { htmlFor: "aff-notes", children: "Notes (optional)" }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 244,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Textarea, { id: "aff-notes", value: notes, onChange: (e) => setNotes(e.target.value), placeholder: "Anything to remember about this partner…", rows: 3 }, void 0, false, {
            fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
            lineNumber: 245,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 243,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 225,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(DialogFooter, { children: [
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", onClick: () => setOpen(false), children: "Cancel" }, void 0, false, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 249,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { onClick: handleSave, children: editing ? "Save" : "Add Link" }, void 0, false, {
          fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
          lineNumber: 250,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
        lineNumber: 248,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
      lineNumber: 221,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
      lineNumber: 220,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/AffiliateLinks.tsx",
    lineNumber: 129,
    columnNumber: 5
  }, this);
}
export {
  AffiliateLinks as default
};
