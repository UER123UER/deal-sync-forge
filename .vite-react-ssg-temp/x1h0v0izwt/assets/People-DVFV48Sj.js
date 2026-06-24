import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import { useState, useRef, useEffect, useMemo } from "react";
import { AlertCircle, Search, List, LayoutGrid, Plus, ChevronDown, Upload, Download, Users, TrendingUp, Star, Filter, Mail, Phone, MoreHorizontal, Edit, CheckCircle2, Trash2, X, Building2, MapPin, Clock, Calendar, Tag, Check, Copy, Send, FileText, PhoneCall, AtSign, MessageSquare, Handshake, Zap } from "lucide-react";
import { s as supabase, i as useContacts, j as useCreateContact, k as useUpdateContact, l as useDeleteContact, m as getContactSource, n as calcLeadScore, I as Input, c as cn, B as Button, C as CONTACT_SOURCES, L as Label, o as setContactSource } from "../main.mjs";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, c as DropdownMenuItem, d as DropdownMenuSeparator } from "./dropdown-menu-z1c4sRu8.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-y5osgoaS.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-BhAZyUdo.js";
import { S as ScrollArea } from "./scroll-area-aYSY-tkZ.js";
import { u as useDeals } from "./useDeals-CMdNuTy4.js";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { isPast, parseISO, format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import Papa from "papaparse";
import "vite-react-ssg";
import "react-router-dom";
import "@supabase/supabase-js";
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
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-select";
import "@radix-ui/react-scroll-area";
const ACTIVITY_KEY = (contactId) => ["contact_activities", contactId];
function useContactActivities(contactId) {
  return useQuery({
    queryKey: ACTIVITY_KEY(contactId ?? ""),
    enabled: !!contactId,
    queryFn: async () => {
      if (!contactId) return [];
      const { data, error } = await supabase.from("deal_notes").select("*").eq("deal_id", contactId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((row) => {
        try {
          const parsed = JSON.parse(row.content);
          if (!parsed._crmActivity) return null;
          return {
            id: row.id,
            contact_id: contactId,
            type: parsed.type,
            content: parsed.content,
            created_at: row.created_at
          };
        } catch {
          return null;
        }
      }).filter(Boolean);
    }
  });
}
function useCreateContactActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contactId,
      type,
      content
    }) => {
      const payload = JSON.stringify({ _crmActivity: true, type, content });
      const { data, error } = await supabase.from("deal_notes").insert({ deal_id: contactId, content: payload }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ACTIVITY_KEY(variables.contactId) });
    }
  });
}
function useDeleteContactActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, contactId }) => {
      const { error } = await supabase.from("deal_notes").delete().eq("id", id);
      if (error) throw error;
      return contactId;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ACTIVITY_KEY(variables.contactId) });
    }
  });
}
const CONTACT_ROLES = [
  "Buyer",
  "Buyer Agent",
  "Seller",
  "Seller Broker",
  "Title",
  "Buyer Broker",
  "Co Buyer Agent",
  "Buyer Power Of Attorney",
  "Buyer Lawyer",
  "Buyer Referral",
  "Co Seller Agent",
  "Seller Power Of Attorney",
  "Seller Lawyer",
  "Seller Referral",
  "Lender",
  "Agent",
  "Broker",
  "Lead",
  "Past Client",
  "Other"
];
const PIPELINE_STAGES = [
  { id: "lead", label: "Lead", color: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-400" },
  { id: "prospect", label: "Prospect", color: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-400" },
  { id: "active", label: "Active", color: "bg-emerald-100 text-emerald-800 border-emerald-200", dot: "bg-emerald-400" },
  { id: "closing", label: "Closing", color: "bg-purple-100 text-purple-800 border-purple-200", dot: "bg-purple-400" },
  { id: "closed", label: "Closed", color: "bg-slate-100 text-slate-600 border-slate-200", dot: "bg-slate-400" },
  { id: "nurture", label: "Nurture", color: "bg-rose-100 text-rose-800 border-rose-200", dot: "bg-rose-400" }
];
const PRIORITY_TAGS = ["Extra Hot", "Hot", "Warm", "Cold"];
function getContactPriority(contact) {
  const tags = contact.tags || [];
  for (const p of PRIORITY_TAGS) {
    if (tags.includes(p)) return p;
  }
  return null;
}
const PRIORITY_CONFIG = {
  "Extra Hot": { label: "Extra Hot", emoji: "🔥🔥", color: "bg-red-100 text-red-700 border-red-200" },
  "Hot": { label: "Hot", emoji: "🔥", color: "bg-orange-100 text-orange-700 border-orange-200" },
  "Warm": { label: "Warm", emoji: "☀️", color: "bg-amber-100 text-amber-700 border-amber-200" },
  "Cold": { label: "Cold", emoji: "❄️", color: "bg-sky-100 text-sky-700 border-sky-200" }
};
const PRIORITY_COLUMNS = [
  { id: "Extra Hot", label: "Extra Hot", dot: "bg-red-400" },
  { id: "Hot", label: "Hot", dot: "bg-orange-400" },
  { id: "Warm", label: "Warm", dot: "bg-amber-400" },
  { id: "Cold", label: "Cold", dot: "bg-sky-400" },
  { id: "unranked", label: "No Priority", dot: "bg-slate-300" }
];
function getPriorityColumnId(contact) {
  return getContactPriority(contact) ?? "unranked";
}
const ACTIVITY_ICONS = {
  note: FileText,
  call: PhoneCall,
  email: AtSign,
  text: MessageSquare,
  meeting: Handshake,
  stage_change: Zap,
  touch_logged: CheckCircle2,
  deal_linked: Building2
};
const ACTIVITY_COLORS = {
  note: "bg-slate-100 text-slate-600",
  call: "bg-emerald-100 text-emerald-600",
  email: "bg-blue-100 text-blue-600",
  text: "bg-violet-100 text-violet-600",
  meeting: "bg-amber-100 text-amber-600",
  stage_change: "bg-purple-100 text-purple-600",
  touch_logged: "bg-teal-100 text-teal-600",
  deal_linked: "bg-rose-100 text-rose-600"
};
const EMAIL_TEMPLATES = [
  { label: "Follow-up check-in", body: `Hi {name},

Just wanted to check in and see how things are going. Are you still looking for a property, or is there anything I can help with?

Best,` },
  { label: "New listing alert", body: `Hi {name},

I just came across a listing I think you'd love! Let me know if you'd like more details or want to schedule a showing.

Best,` },
  { label: "Market update", body: `Hi {name},

I wanted to share a quick market update for your area. Values have been moving - would love to chat about what it means for you.

Best,` },
  { label: "Thank you after meeting", body: `Hi {name},

Thank you so much for your time today. It was great connecting! I'll follow up with the details we discussed.

Best,` }
];
const SMS_TEMPLATES = [
  { label: "Quick check-in", body: `Hey {name}! Just checking in - anything I can help with on your real estate journey?` },
  { label: "New listing", body: `Hi {name}! I found a listing that matches what you're looking for. Want me to send the details?` },
  { label: "Reminder", body: `Hi {name}, just a friendly reminder about our appointment. Looking forward to connecting!` }
];
function getStage(contact) {
  const tags = contact.tags || [];
  for (const s of PIPELINE_STAGES) {
    if (tags.some((t) => t.toLowerCase() === s.id)) return s.id;
  }
  return null;
}
function getInitials(c) {
  var _a, _b;
  return `${((_a = c.first_name) == null ? void 0 : _a.charAt(0)) ?? ""}${((_b = c.last_name) == null ? void 0 : _b.charAt(0)) ?? ""}`.toUpperCase();
}
function formatDate(date) {
  if (!date) return "-";
  try {
    return format(parseISO(date), "MMM d, yyyy");
  } catch {
    return "-";
  }
}
function nextTouchStatus(date) {
  if (!date) return null;
  try {
    const d = parseISO(date);
    if (isToday(d)) return { label: "Today", color: "text-emerald-600 font-semibold" };
    if (isTomorrow(d)) return { label: "Tomorrow", color: "text-blue-600 font-semibold" };
    if (isPast(d)) return { label: `${Math.abs(differenceInDays(d, /* @__PURE__ */ new Date()))}d overdue`, color: "text-destructive font-semibold" };
    const days = differenceInDays(d, /* @__PURE__ */ new Date());
    if (days <= 7) return { label: `In ${days}d`, color: "text-amber-600 font-semibold" };
    return { label: format(d, "MMM d"), color: "text-muted-foreground" };
  } catch {
    return null;
  }
}
const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500"
];
function avatarColor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = h * 31 + id.charCodeAt(i) & 4294967295;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function Avatar({ contact, size = "md" }) {
  const sz = size === "sm" ? "w-7 h-7 text-[10px]" : size === "lg" ? "w-14 h-14 text-xl" : "w-9 h-9 text-xs";
  return /* @__PURE__ */ jsxDEV("div", { className: cn("rounded-full flex items-center justify-center font-semibold text-white shrink-0", sz, avatarColor(contact.id)), children: getInitials(contact) }, void 0, false, {
    fileName: "/dev-server/src/pages/People.tsx",
    lineNumber: 168,
    columnNumber: 5
  }, this);
}
function StageBadge({ stageId }) {
  if (!stageId) return null;
  const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
  if (!stage) return null;
  return /* @__PURE__ */ jsxDEV("span", { className: cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border", stage.color), children: [
    /* @__PURE__ */ jsxDEV("span", { className: cn("w-1.5 h-1.5 rounded-full", stage.dot) }, void 0, false, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 180,
      columnNumber: 7
    }, this),
    stage.label
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/People.tsx",
    lineNumber: 179,
    columnNumber: 5
  }, this);
}
function PriorityBadge({ contact }) {
  const priority = getContactPriority(contact);
  if (!priority) return null;
  const cfg = PRIORITY_CONFIG[priority];
  return /* @__PURE__ */ jsxDEV("span", { className: cn("inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full border", cfg.color), children: [
    /* @__PURE__ */ jsxDEV("span", { children: cfg.emoji }, void 0, false, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 192,
      columnNumber: 7
    }, this),
    " ",
    cfg.label
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/People.tsx",
    lineNumber: 191,
    columnNumber: 5
  }, this);
}
function CopyInfoRow({
  icon: Icon,
  label,
  value,
  copied,
  onCopy
}) {
  return /* @__PURE__ */ jsxDEV(
    "button",
    {
      type: "button",
      onClick: onCopy,
      className: "group flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/50 active:bg-muted",
      children: [
        /* @__PURE__ */ jsxDEV(Icon, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 216,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold uppercase tracking-wide text-muted-foreground", children: label }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 218,
            columnNumber: 9
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-foreground break-words", children: value }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 219,
            columnNumber: 9
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 217,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV(
          "span",
          {
            className: cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold transition-colors",
              copied ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-background text-muted-foreground group-hover:text-foreground"
            ),
            children: [
              copied ? /* @__PURE__ */ jsxDEV(Check, { className: "w-3 h-3" }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 229,
                columnNumber: 19
              }, this) : /* @__PURE__ */ jsxDEV(Copy, { className: "w-3 h-3" }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 229,
                columnNumber: 51
              }, this),
              copied ? "Copied" : "Copy"
            ]
          },
          void 0,
          true,
          {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 221,
            columnNumber: 7
          },
          this
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 211,
      columnNumber: 5
    },
    this
  );
}
function ActivityTimeline({ contact }) {
  const { data: activities = [], isLoading } = useContactActivities(contact.id);
  const createActivity = useCreateContactActivity();
  const deleteActivity = useDeleteContactActivity();
  const [actType, setActType] = useState("note");
  const [actNote, setActNote] = useState("");
  const logActivity = async () => {
    if (!actNote.trim()) return;
    await createActivity.mutateAsync({ contactId: contact.id, type: actType, content: actNote.trim() });
    setActNote("");
    toast.success("Activity logged");
  };
  const ACTIVITY_TYPES = [
    { id: "note", label: "Note" },
    { id: "call", label: "Call" },
    { id: "email", label: "Email" },
    { id: "text", label: "Text" },
    { id: "meeting", label: "Meeting" }
  ];
  return /* @__PURE__ */ jsxDEV("div", { className: "border rounded-xl overflow-hidden", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "px-4 py-3 border-b bg-muted/30", children: /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Activity Timeline" }, void 0, false, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 262,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 261,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "p-3 border-b space-y-2", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "flex gap-1 flex-wrap", children: ACTIVITY_TYPES.map((t) => {
        const Icon = ACTIVITY_ICONS[t.id];
        return /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setActType(t.id),
            className: cn(
              "flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border transition-colors",
              actType === t.id ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-foreground/20"
            ),
            children: [
              /* @__PURE__ */ jsxDEV(Icon, { className: "w-2.5 h-2.5" }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 279,
                columnNumber: 17
              }, this),
              t.label
            ]
          },
          t.id,
          true,
          {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 271,
            columnNumber: 15
          },
          this
        );
      }) }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 267,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxDEV(
          Input,
          {
            placeholder: `Log a ${actType}...`,
            value: actNote,
            onChange: (e) => setActNote(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && logActivity(),
            className: "h-7 text-xs flex-1"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 286,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "h-7 px-2", onClick: logActivity, disabled: createActivity.isPending || !actNote.trim(), children: /* @__PURE__ */ jsxDEV(Send, { className: "w-3 h-3" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 294,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 293,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 285,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 266,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "divide-y max-h-64 overflow-y-auto", children: [
      isLoading && /* @__PURE__ */ jsxDEV("div", { className: "py-4 text-center text-xs text-muted-foreground", children: "Loading..." }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 302,
        columnNumber: 11
      }, this),
      !isLoading && activities.length === 0 && /* @__PURE__ */ jsxDEV("div", { className: "py-6 text-center text-xs text-muted-foreground", children: "No activities yet. Log the first one above." }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 305,
        columnNumber: 11
      }, this),
      activities.map((act) => {
        const Icon = ACTIVITY_ICONS[act.type];
        const iconColor = ACTIVITY_COLORS[act.type];
        return /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-2.5 px-3 py-2.5 group hover:bg-muted/30 transition-colors", children: [
          /* @__PURE__ */ jsxDEV("div", { className: cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5", iconColor), children: /* @__PURE__ */ jsxDEV(Icon, { className: "w-3 h-3" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 313,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 312,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-foreground leading-relaxed", children: act.content }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 317,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(
                "button",
                {
                  onClick: () => deleteActivity.mutateAsync({ id: act.id, contactId: contact.id }),
                  className: "opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all shrink-0",
                  children: /* @__PURE__ */ jsxDEV(X, { className: "w-3 h-3" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 322,
                    columnNumber: 21
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 318,
                  columnNumber: 19
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 316,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-[9px] text-muted-foreground mt-0.5 capitalize", children: [
              act.type.replace("_", " "),
              " · ",
              formatDate(act.created_at)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 325,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 315,
            columnNumber: 15
          }, this)
        ] }, act.id, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 311,
          columnNumber: 13
        }, this);
      })
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 300,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/People.tsx",
    lineNumber: 260,
    columnNumber: 5
  }, this);
}
function MessageTemplates({ contact }) {
  const [mode, setMode] = useState("email");
  useState(null);
  const createActivity = useCreateContactActivity();
  const templates = mode === "email" ? EMAIL_TEMPLATES : SMS_TEMPLATES;
  const name = contact.first_name;
  const handleOpen = async (template) => {
    const body = template.body.replace(/\{name\}/g, name);
    if (mode === "email" && contact.email) {
      window.open(`mailto:${contact.email}?subject=${encodeURIComponent(template.label)}&body=${encodeURIComponent(body)}`);
      await createActivity.mutateAsync({ contactId: contact.id, type: "email", content: `Sent email: "${template.label}"` });
      toast.success("Email client opened");
    } else if (mode === "sms" && contact.phone) {
      window.open(`sms:${contact.phone}?body=${encodeURIComponent(body)}`);
      await createActivity.mutateAsync({ contactId: contact.id, type: "text", content: `Sent text: "${template.label}"` });
      toast.success("SMS opened");
    } else {
      toast.error(`No ${mode === "email" ? "email" : "phone"} on file`);
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "border rounded-xl overflow-hidden", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "px-4 py-3 border-b bg-muted/30 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Quick Messages" }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 364,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex gap-1", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setMode("email"),
            className: cn("text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors", mode === "email" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
            children: "Email"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 366,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => setMode("sms"),
            className: cn("text-[10px] px-2 py-0.5 rounded-full font-semibold transition-colors", mode === "sms" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"),
            children: "SMS"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 372,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 365,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 363,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "divide-y", children: templates.map((t) => /* @__PURE__ */ jsxDEV(
      "button",
      {
        onClick: () => handleOpen(t),
        className: "w-full flex items-center justify-between px-3 py-2 text-left hover:bg-muted/40 transition-colors group",
        children: [
          /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-foreground", children: t.label }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 387,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(Send, { className: "w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 388,
            columnNumber: 13
          }, this)
        ]
      },
      t.label,
      true,
      {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 382,
        columnNumber: 11
      },
      this
    )) }, void 0, false, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 380,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/People.tsx",
    lineNumber: 362,
    columnNumber: 5
  }, this);
}
function People() {
  const { data: contacts = [], isLoading } = useContacts();
  const { data: deals = [] } = useDeals();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortBy, setSortBy] = useState("created");
  const [boardGroupBy, setBoardGroupBy] = useState("stage");
  const [draggedContactId, setDraggedContactId] = useState(null);
  const [dragOverColumnId, setDragOverColumnId] = useState(null);
  const [detailTab, setDetailTab] = useState("overview");
  const [panelContact, setPanelContact] = useState(null);
  const [panelMode, setPanelMode] = useState("detail");
  const [copiedField, setCopiedField] = useState(null);
  const emptyForm = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    role: "",
    current_address: "",
    tags: [],
    last_touch: "",
    next_touch: "",
    source: ""
  };
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const csvInputRef = useRef(null);
  const copyResetRef = useRef(null);
  useEffect(() => () => {
    if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
  }, []);
  const [csvPreview, setCsvPreview] = useState([]);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const dealsByContact = useMemo(() => {
    const map = {};
    for (const deal of deals) {
      for (const dc of deal.deal_contacts || []) {
        map[dc.contact_id] = (map[dc.contact_id] || 0) + 1;
      }
    }
    return map;
  }, [deals]);
  const PRIORITY_ORDER = { "Extra Hot": 0, "Hot": 1, "Warm": 2, "Cold": 3 };
  const filtered = useMemo(() => {
    let list = contacts;
    if (search) {
      const t = search.toLowerCase();
      list = list.filter(
        (c) => c.first_name.toLowerCase().includes(t) || c.last_name.toLowerCase().includes(t) || (c.email || "").toLowerCase().includes(t) || (c.phone || "").includes(t) || (c.company || "").toLowerCase().includes(t)
      );
    }
    if (roleFilter !== "all") list = list.filter((c) => c.role === roleFilter);
    if (stageFilter !== "all") list = list.filter((c) => getStage(c) === stageFilter);
    if (sourceFilter !== "all") list = list.filter((c) => getContactSource(c) === sourceFilter);
    if (priorityFilter !== "all") list = list.filter((c) => getContactPriority(c) === priorityFilter);
    if (overdueOnly) list = list.filter((c) => {
      if (!c.next_touch) return false;
      try {
        return isPast(parseISO(c.next_touch));
      } catch {
        return false;
      }
    });
    list = [...list].sort((a, b) => {
      if (sortBy === "name") return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      if (sortBy === "last_touch") return (b.last_touch || "").localeCompare(a.last_touch || "");
      if (sortBy === "next_touch") return (a.next_touch || "9999").localeCompare(b.next_touch || "9999");
      if (sortBy === "priority") {
        const pa = PRIORITY_ORDER[getContactPriority(a) ?? ""] ?? 99;
        const pb = PRIORITY_ORDER[getContactPriority(b) ?? ""] ?? 99;
        if (pa !== pb) return pa - pb;
        return calcLeadScore(b, dealsByContact[b.id] || 0) - calcLeadScore(a, dealsByContact[a.id] || 0);
      }
      return b.created_at.localeCompare(a.created_at);
    });
    return list;
  }, [contacts, search, roleFilter, stageFilter, sourceFilter, priorityFilter, overdueOnly, sortBy, dealsByContact]);
  const stats = useMemo(() => ({
    total: contacts.length,
    leads: contacts.filter((c) => getStage(c) === "lead").length,
    active: contacts.filter((c) => getStage(c) === "active").length,
    overdue: contacts.filter((c) => {
      if (!c.next_touch) return false;
      try {
        return isPast(parseISO(c.next_touch));
      } catch {
        return false;
      }
    }).length
  }), [contacts]);
  const boardColumns = useMemo(() => {
    if (boardGroupBy === "priority") {
      return PRIORITY_COLUMNS.map((priority) => ({
        id: priority.id,
        label: priority.label,
        dot: priority.dot,
        contacts: filtered.filter((contact) => getPriorityColumnId(contact) === priority.id)
      }));
    }
    return PIPELINE_STAGES.map((stage) => ({
      ...stage,
      contacts: filtered.filter((contact) => getStage(contact) === stage.id)
    }));
  }, [boardGroupBy, filtered]);
  const openNew = () => {
    setForm(emptyForm);
    setTagInput("");
    setPanelMode("new");
    setPanelContact(null);
  };
  const openEdit = (c) => {
    setForm({
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email || "",
      phone: c.phone || "",
      company: c.company || "",
      role: c.role || "",
      current_address: c.current_address || "",
      tags: (c.tags || []).filter((t) => !t.startsWith("source:")),
      last_touch: c.last_touch ? c.last_touch.split("T")[0] : "",
      next_touch: c.next_touch ? c.next_touch.split("T")[0] : "",
      source: getContactSource(c) || ""
    });
    setTagInput("");
    setCopiedField(null);
    setPanelMode("edit");
    setPanelContact(c);
  };
  const openDetail = (c) => {
    setCopiedField(null);
    setPanelContact(c);
    setPanelMode("detail");
    setDetailTab("overview");
  };
  const closePanel = () => {
    setCopiedField(null);
    setPanelContact(null);
    setPanelMode("detail");
  };
  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error("First and last name are required");
      return;
    }
    const allTags = setContactSource(form.tags, form.source);
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      role: form.role.trim() || null,
      current_address: form.current_address.trim() || null,
      tags: allTags,
      last_touch: form.last_touch || null,
      next_touch: form.next_touch || null
    };
    try {
      if (panelMode === "edit" && panelContact) {
        await updateContact.mutateAsync({ id: panelContact.id, ...payload });
        toast.success("Contact updated");
        setPanelMode("detail");
      } else {
        await createContact.mutateAsync(payload);
        toast.success("Contact added");
        closePanel();
      }
    } catch {
      toast.error("Failed to save contact");
    }
  };
  const handleDelete = async (id) => {
    try {
      await deleteContact.mutateAsync(id);
      closePanel();
      toast.success("Contact deleted");
    } catch {
      toast.error("Failed to delete contact");
    }
  };
  const handleSetStage = async (contact, stageId) => {
    const tags = (contact.tags || []).filter((t) => !PIPELINE_STAGES.some((s) => s.id === t.toLowerCase()));
    await updateContact.mutateAsync({ id: contact.id, tags: [...tags, stageId] });
    if ((panelContact == null ? void 0 : panelContact.id) === contact.id) setPanelContact({ ...contact, tags: [...tags, stageId] });
  };
  const handleSetPriority = async (contact, priorityId) => {
    const withoutPriority = (contact.tags || []).filter((tag) => !PRIORITY_TAGS.includes(tag));
    const nextTags = priorityId === "unranked" ? withoutPriority : [...withoutPriority, priorityId];
    await updateContact.mutateAsync({ id: contact.id, tags: nextTags });
    if ((panelContact == null ? void 0 : panelContact.id) === contact.id) setPanelContact({ ...contact, tags: nextTags });
  };
  const handleDropToBoardColumn = async (columnId) => {
    if (!draggedContactId) return;
    const contact = contacts.find((item) => item.id === draggedContactId);
    if (!contact) return;
    try {
      if (boardGroupBy === "stage") {
        const stageId = columnId;
        if (getStage(contact) !== stageId) {
          await handleSetStage(contact, stageId);
        }
      } else {
        const priorityId = columnId;
        if (getPriorityColumnId(contact) !== priorityId) {
          await handleSetPriority(contact, priorityId);
        }
      }
    } catch {
      toast.error("Failed to move contact");
    } finally {
      setDraggedContactId(null);
      setDragOverColumnId(null);
    }
  };
  const handleLogTouch = async (contact) => {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    await updateContact.mutateAsync({ id: contact.id, last_touch: today });
    toast.success("Touch logged");
    if ((panelContact == null ? void 0 : panelContact.id) === contact.id) setPanelContact({ ...contact, last_touch: today });
  };
  const copyValue = async (field, value, label) => {
    var _a;
    try {
      if ((_a = navigator.clipboard) == null ? void 0 : _a.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      if (copyResetRef.current) {
        window.clearTimeout(copyResetRef.current);
      }
      setCopiedField(field);
      copyResetRef.current = window.setTimeout(() => {
        setCopiedField((current) => current === field ? null : current);
      }, 1600);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Couldn't copy ${label.toLowerCase()}`);
    }
  };
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };
  const handleCsvFile = (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (r) => {
        setCsvPreview(r.data);
        setCsvDialogOpen(true);
      },
      error: () => toast.error("Failed to parse CSV")
    });
    if (csvInputRef.current) csvInputRef.current.value = "";
  };
  const handleCsvImport = async () => {
    let imported = 0;
    let skippedMissingName = 0;
    let skippedErrors = 0;
    for (const row of csvPreview) {
      const firstName = row["first_name"] || row["First Name"] || row["firstName"] || "";
      const lastName = row["last_name"] || row["Last Name"] || row["lastName"] || "";
      if (!firstName.trim() || !lastName.trim()) {
        skippedMissingName++;
        continue;
      }
      try {
        await createContact.mutateAsync({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: (row["email"] || row["Email"] || "").trim() || null,
          phone: (row["phone"] || row["Phone"] || "").trim() || null,
          company: (row["company"] || row["Company"] || "").trim() || null,
          role: (row["role"] || row["Role"] || "").trim() || null
        });
        imported++;
      } catch {
        skippedErrors++;
      }
    }
    const skipped = skippedMissingName + skippedErrors;
    if (skipped === 0) {
      toast.success(`${imported} contact(s) imported`);
    } else {
      toast.success(
        `${imported} imported` + (skippedMissingName > 0 ? `, ${skippedMissingName} skipped (missing name)` : "") + (skippedErrors > 0 ? `, ${skippedErrors} failed` : "")
      );
    }
    setCsvDialogOpen(false);
  };
  const handleExport = () => {
    const headers = ["First Name", "Last Name", "Email", "Phone", "Company", "Role", "Stage", "Source", "Tags", "Last Touch", "Next Touch"];
    const rows = contacts.map((c) => [
      c.first_name,
      c.last_name,
      c.email || "",
      c.phone || "",
      c.company || "",
      c.role || "",
      getStage(c) || "",
      getContactSource(c) || "",
      (c.tags || []).filter((t) => !t.startsWith("source:")).join(";"),
      c.last_touch || "",
      c.next_touch || ""
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "contacts-export.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };
  const panelOpen = panelContact !== null || panelMode === "new";
  return /* @__PURE__ */ jsxDEV("div", { className: "flex-1 flex flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxDEV("div", { className: "border-b shrink-0 bg-background px-3 md:px-6 py-2.5 md:py-0 md:h-14 flex flex-wrap items-center gap-2 md:gap-3", children: [
      /* @__PURE__ */ jsxDEV("h1", { className: "text-base font-semibold text-foreground", children: "CRM" }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 713,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full", children: contacts.length.toLocaleString() }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 714,
        columnNumber: 9
      }, this),
      stats.overdue > 0 && /* @__PURE__ */ jsxDEV("span", { className: "flex items-center gap-1 text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full", children: [
        /* @__PURE__ */ jsxDEV(AlertCircle, { className: "w-3 h-3" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 717,
          columnNumber: 13
        }, this),
        stats.overdue,
        " overdue"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 716,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "hidden md:block flex-1" }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 720,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "relative w-full md:w-64 order-last md:order-none", children: [
        /* @__PURE__ */ jsxDEV(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 722,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(Input, { placeholder: "Search...", className: "pl-9 h-9 md:h-8 text-xs", value: search, onChange: (e) => setSearch(e.target.value) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 723,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 721,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "hidden md:flex items-center border rounded-md overflow-hidden", children: [
        /* @__PURE__ */ jsxDEV("button", { onClick: () => setView("list"), className: cn("px-2.5 py-1.5", view === "list" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), children: /* @__PURE__ */ jsxDEV(List, { className: "w-3.5 h-3.5" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 726,
          columnNumber: 158
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 726,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("button", { onClick: () => setView("board"), className: cn("px-2.5 py-1.5", view === "board" ? "bg-primary text-primary-foreground" : "hover:bg-muted"), children: /* @__PURE__ */ jsxDEV(LayoutGrid, { className: "w-3.5 h-3.5" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 727,
          columnNumber: 160
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 727,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 725,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("input", { ref: csvInputRef, type: "file", accept: ".csv", className: "hidden", onChange: handleCsvFile }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 729,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(DropdownMenu, { children: [
        /* @__PURE__ */ jsxDEV(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "h-9 md:h-8 text-xs gap-1.5 ml-auto md:ml-0", children: [
          /* @__PURE__ */ jsxDEV(Plus, { className: "w-3.5 h-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 732,
            columnNumber: 86
          }, this),
          " Add Contact ",
          /* @__PURE__ */ jsxDEV(ChevronDown, { className: "w-3 h-3" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 732,
            columnNumber: 131
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 732,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 731,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(DropdownMenuContent, { align: "end", children: [
          /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: openNew, children: [
            /* @__PURE__ */ jsxDEV(Plus, { className: "w-3.5 h-3.5 mr-2" }, void 0, false, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 735,
              columnNumber: 49
            }, this),
            " Add manually"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 735,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => {
            var _a;
            return (_a = csvInputRef.current) == null ? void 0 : _a.click();
          }, children: [
            /* @__PURE__ */ jsxDEV(Upload, { className: "w-3.5 h-3.5 mr-2" }, void 0, false, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 736,
              columnNumber: 76
            }, this),
            " Import CSV"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 736,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(DropdownMenuSeparator, {}, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 737,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: handleExport, children: [
            /* @__PURE__ */ jsxDEV(Download, { className: "w-3.5 h-3.5 mr-2" }, void 0, false, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 738,
              columnNumber: 54
            }, this),
            " Export CSV"
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 738,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 734,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 730,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 712,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-px bg-border border-b shrink-0", children: [
      {
        label: "Total Contacts",
        value: stats.total,
        icon: Users,
        color: "text-foreground",
        active: stageFilter === "all" && !overdueOnly,
        onClick: () => {
          setStageFilter("all");
          setOverdueOnly(false);
        }
      },
      {
        label: "Leads",
        value: stats.leads,
        icon: TrendingUp,
        color: "text-amber-600",
        active: stageFilter === "lead" && !overdueOnly,
        onClick: () => {
          setStageFilter("lead");
          setOverdueOnly(false);
        }
      },
      {
        label: "Active Clients",
        value: stats.active,
        icon: Star,
        color: "text-emerald-600",
        active: stageFilter === "active" && !overdueOnly,
        onClick: () => {
          setStageFilter("active");
          setOverdueOnly(false);
        }
      },
      {
        label: "Follow-up Overdue",
        value: stats.overdue,
        icon: AlertCircle,
        color: "text-destructive",
        active: overdueOnly,
        onClick: () => {
          setOverdueOnly((v) => !v);
          setStageFilter("all");
        }
      }
    ].map((s) => /* @__PURE__ */ jsxDEV(
      "button",
      {
        type: "button",
        onClick: s.onClick,
        className: cn(
          "bg-background px-6 py-3 flex items-center gap-3 text-left transition-colors hover:bg-muted/50 border-b-2",
          s.active ? "border-primary bg-primary/5" : "border-transparent"
        ),
        children: [
          /* @__PURE__ */ jsxDEV(s.icon, { className: cn("w-4 h-4 shrink-0", s.color) }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 776,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("div", { className: "text-xl font-bold text-foreground leading-none", children: s.value }, void 0, false, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 778,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: s.label }, void 0, false, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 779,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 777,
            columnNumber: 13
          }, this)
        ]
      },
      s.label,
      true,
      {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 767,
        columnNumber: 11
      },
      this
    )) }, void 0, false, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 744,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 px-3 md:px-6 py-2 border-b bg-background shrink-0 flex-wrap", children: [
      /* @__PURE__ */ jsxDEV(Filter, { className: "w-3.5 h-3.5 text-muted-foreground shrink-0" }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 787,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Select, { value: stageFilter, onValueChange: (v) => {
        setStageFilter(v);
        setOverdueOnly(false);
      }, children: [
        /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-9 md:h-7 text-xs flex-1 min-w-[8rem] md:flex-none md:w-32", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "Stage" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 789,
          columnNumber: 98
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 789,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(SelectContent, { children: [
          /* @__PURE__ */ jsxDEV(SelectItem, { value: "all", children: "All Stages" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 791,
            columnNumber: 13
          }, this),
          PIPELINE_STAGES.map((s) => /* @__PURE__ */ jsxDEV(SelectItem, { value: s.id, children: s.label }, s.id, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 792,
            columnNumber: 41
          }, this))
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 790,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 788,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Select, { value: priorityFilter, onValueChange: setPriorityFilter, children: [
        /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-9 md:h-7 text-xs flex-1 min-w-[8rem] md:flex-none md:w-32", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "Priority" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 796,
          columnNumber: 98
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 796,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(SelectContent, { children: [
          /* @__PURE__ */ jsxDEV(SelectItem, { value: "all", children: "All Priorities" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 798,
            columnNumber: 13
          }, this),
          PRIORITY_TAGS.map((p) => /* @__PURE__ */ jsxDEV(SelectItem, { value: p, children: [
            PRIORITY_CONFIG[p].emoji,
            " ",
            p
          ] }, p, true, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 800,
            columnNumber: 15
          }, this))
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 797,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 795,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Select, { value: roleFilter, onValueChange: setRoleFilter, children: [
        /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-9 md:h-7 text-xs flex-1 min-w-[8rem] md:flex-none md:w-32", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "Role" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 807,
          columnNumber: 98
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 807,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(SelectContent, { children: [
          /* @__PURE__ */ jsxDEV(SelectItem, { value: "all", children: "All Roles" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 809,
            columnNumber: 13
          }, this),
          CONTACT_ROLES.map((r) => /* @__PURE__ */ jsxDEV(SelectItem, { value: r, children: r }, r, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 810,
            columnNumber: 39
          }, this))
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 808,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 806,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Select, { value: sourceFilter, onValueChange: setSourceFilter, children: [
        /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-9 md:h-7 text-xs flex-1 min-w-[8rem] md:flex-none md:w-32", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "Source" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 814,
          columnNumber: 98
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 814,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(SelectContent, { children: [
          /* @__PURE__ */ jsxDEV(SelectItem, { value: "all", children: "All Sources" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 816,
            columnNumber: 13
          }, this),
          CONTACT_SOURCES.map((s) => /* @__PURE__ */ jsxDEV(SelectItem, { value: s, children: s }, s, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 817,
            columnNumber: 41
          }, this))
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 815,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 813,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(Select, { value: sortBy, onValueChange: (v) => setSortBy(v), children: [
        /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "h-9 md:h-7 text-xs flex-1 min-w-[9rem] md:flex-none md:w-36", children: /* @__PURE__ */ jsxDEV(SelectValue, {}, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 821,
          columnNumber: 98
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 821,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV(SelectContent, { children: [
          /* @__PURE__ */ jsxDEV(SelectItem, { value: "created", children: "Newest First" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 823,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(SelectItem, { value: "name", children: "Name A→Z" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 824,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(SelectItem, { value: "priority", children: "Priority ↓" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 825,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(SelectItem, { value: "last_touch", children: "Last Touch" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 826,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(SelectItem, { value: "next_touch", children: "Next Touch" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 827,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 822,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 820,
        columnNumber: 9
      }, this),
      view === "board" && /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-1 rounded-md border bg-background p-0.5", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            onClick: () => setBoardGroupBy("stage"),
            className: cn(
              "rounded px-2.5 py-1 text-[10px] font-semibold transition-colors",
              boardGroupBy === "stage" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            ),
            children: "By Stage"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 832,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            onClick: () => setBoardGroupBy("priority"),
            className: cn(
              "rounded px-2.5 py-1 text-[10px] font-semibold transition-colors",
              boardGroupBy === "priority" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            ),
            children: "By Lead Heat"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 842,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 831,
        columnNumber: 11
      }, this),
      (stageFilter !== "all" || roleFilter !== "all" || sourceFilter !== "all" || priorityFilter !== "all" || overdueOnly || search) && /* @__PURE__ */ jsxDEV(
        "button",
        {
          onClick: () => {
            setStageFilter("all");
            setRoleFilter("all");
            setSourceFilter("all");
            setPriorityFilter("all");
            setOverdueOnly(false);
            setSearch("");
          },
          className: "text-[10px] text-muted-foreground hover:text-foreground underline",
          children: "Clear"
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 855,
          columnNumber: 11
        },
        this
      ),
      /* @__PURE__ */ jsxDEV("span", { className: "ml-auto text-[10px] text-muted-foreground", children: [
        filtered.length,
        " of ",
        contacts.length
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 862,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 786,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { className: "flex flex-1 overflow-hidden", children: [
      /* @__PURE__ */ jsxDEV("div", { className: cn("flex-1 overflow-auto", panelOpen ? "md:mr-[440px]" : ""), children: isLoading ? /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-center py-20 text-sm text-muted-foreground", children: "Loading contacts..." }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 869,
        columnNumber: 13
      }, this) : filtered.length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center justify-center py-24 text-center gap-3", children: [
        /* @__PURE__ */ jsxDEV(Users, { className: "w-10 h-10 text-muted-foreground/40" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 872,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-muted-foreground", children: "No contacts found" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 873,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", onClick: openNew, className: "gap-1.5", children: [
          /* @__PURE__ */ jsxDEV(Plus, { className: "w-3.5 h-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 874,
            columnNumber: 71
          }, this),
          " Add Contact"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 874,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 871,
        columnNumber: 13
      }, this) : view === "list" ? /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV("table", { className: "w-full min-w-[900px]", children: [
        /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { className: "border-b bg-muted/30", children: [
          /* @__PURE__ */ jsxDEV("th", { className: "text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-6 py-2.5", children: "Contact" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 881,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { className: "text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5", children: "Stage" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 882,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { className: "text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5", children: "Priority" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 883,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { className: "text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5", children: "Source" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 884,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { className: "text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5", children: "Contact Info" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 885,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { className: "text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5", children: "Next Touch" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 886,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { className: "text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5", children: "Deals" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 887,
            columnNumber: 19
          }, this),
          /* @__PURE__ */ jsxDEV("th", { className: "px-4 py-2.5 w-10" }, void 0, false, {
            fileName: "/dev-server/src/pages/People.tsx",
            lineNumber: 888,
            columnNumber: 19
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 880,
          columnNumber: 17
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 879,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("tbody", { children: filtered.map((contact) => {
          const stage = getStage(contact);
          const touch = nextTouchStatus(contact.next_touch);
          const dealCount = dealsByContact[contact.id] || 0;
          const source = getContactSource(contact);
          return /* @__PURE__ */ jsxDEV(
            "tr",
            {
              className: cn("border-b hover:bg-muted/40 cursor-pointer transition-colors", (panelContact == null ? void 0 : panelContact.id) === contact.id && "bg-primary/5"),
              onClick: () => openDetail(contact),
              children: [
                /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-3", children: /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxDEV(Avatar, { contact }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 905,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "text-sm font-medium text-foreground", children: [
                      contact.first_name,
                      " ",
                      contact.last_name
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 907,
                      columnNumber: 29
                    }, this),
                    contact.company && /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] text-muted-foreground", children: contact.company }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 908,
                      columnNumber: 49
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 906,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 904,
                  columnNumber: 25
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 903,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxDEV(StageBadge, { stageId: stage }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 912,
                  columnNumber: 49
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 912,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxDEV(PriorityBadge, { contact }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 913,
                  columnNumber: 49
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 913,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: source || "-" }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 914,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-0.5", children: [
                  contact.email && /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxDEV(Mail, { className: "w-3 h-3" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 917,
                      columnNumber: 117
                    }, this),
                    contact.email
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 917,
                    columnNumber: 45
                  }, this),
                  contact.phone && /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxDEV(Phone, { className: "w-3 h-3" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 918,
                      columnNumber: 117
                    }, this),
                    contact.phone
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 918,
                    columnNumber: 45
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 916,
                  columnNumber: 25
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 915,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: touch ? /* @__PURE__ */ jsxDEV("span", { className: cn("text-xs", touch.color), children: touch.label }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 922,
                  columnNumber: 34
                }, this) : /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: "-" }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 922,
                  columnNumber: 102
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 921,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", children: dealCount > 0 ? /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full", children: dealCount }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 925,
                  columnNumber: 42
                }, this) : /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: "-" }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 925,
                  columnNumber: 153
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 924,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "px-4 py-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxDEV(DropdownMenu, { children: [
                  /* @__PURE__ */ jsxDEV(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV("button", { className: "p-1 rounded hover:bg-muted", children: /* @__PURE__ */ jsxDEV(MoreHorizontal, { className: "w-4 h-4 text-muted-foreground" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 930,
                    columnNumber: 76
                  }, this) }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 930,
                    columnNumber: 29
                  }, this) }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 929,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV(DropdownMenuContent, { align: "end", className: "text-xs", children: [
                    /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => openEdit(contact), children: [
                      /* @__PURE__ */ jsxDEV(Edit, { className: "w-3.5 h-3.5 mr-2" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 933,
                        columnNumber: 81
                      }, this),
                      " Edit"
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 933,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => handleLogTouch(contact), children: [
                      /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "w-3.5 h-3.5 mr-2" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 934,
                        columnNumber: 87
                      }, this),
                      " Log Touch Today"
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 934,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV(DropdownMenuSeparator, {}, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 935,
                      columnNumber: 29
                    }, this),
                    PIPELINE_STAGES.map((s) => /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => handleSetStage(contact, s.id), children: [
                      /* @__PURE__ */ jsxDEV("span", { className: cn("w-2 h-2 rounded-full mr-2", s.dot) }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 938,
                        columnNumber: 33
                      }, this),
                      " Move to ",
                      s.label
                    ] }, s.id, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 937,
                      columnNumber: 31
                    }, this)),
                    /* @__PURE__ */ jsxDEV(DropdownMenuSeparator, {}, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 941,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV(DropdownMenuItem, { onClick: () => handleDelete(contact.id), className: "text-destructive focus:text-destructive", children: [
                      /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3.5 h-3.5 mr-2" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 942,
                        columnNumber: 140
                      }, this),
                      " Delete"
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 942,
                      columnNumber: 29
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 932,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 928,
                  columnNumber: 25
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 927,
                  columnNumber: 23
                }, this)
              ]
            },
            contact.id,
            true,
            {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 898,
              columnNumber: 21
            },
            this
          );
        }) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 891,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 878,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 877,
        columnNumber: 13
      }, this) : /* @__PURE__ */ jsxDEV("div", { className: "flex gap-4 p-5 h-full overflow-x-auto items-start", children: boardColumns.map((col) => /* @__PURE__ */ jsxDEV(
        "div",
        {
          className: cn(
            "flex flex-col gap-2 w-64 shrink-0 rounded-2xl p-2 transition-colors",
            dragOverColumnId === col.id ? "bg-primary/5 ring-1 ring-primary/20" : ""
          ),
          onDragOver: (event) => {
            event.preventDefault();
            if (dragOverColumnId !== col.id) {
              setDragOverColumnId(col.id);
            }
          },
          onDragLeave: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setDragOverColumnId((current) => current === col.id ? null : current);
            }
          },
          onDrop: (event) => {
            event.preventDefault();
            void handleDropToBoardColumn(col.id);
          },
          children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsxDEV("span", { className: cn("w-2.5 h-2.5 rounded-full", col.dot) }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 978,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-semibold text-foreground", children: col.label }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 979,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("span", { className: "ml-auto text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5", children: col.contacts.length }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 980,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 977,
              columnNumber: 19
            }, this),
            col.contacts.map((contact) => {
              const touch = nextTouchStatus(contact.next_touch);
              const stage = getStage(contact);
              return /* @__PURE__ */ jsxDEV(
                "div",
                {
                  draggable: true,
                  onDragStart: (event) => {
                    setDraggedContactId(contact.id);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", contact.id);
                  },
                  onDragEnd: () => {
                    setDraggedContactId(null);
                    setDragOverColumnId(null);
                  },
                  onClick: () => openDetail(contact),
                  className: cn(
                    "bg-background border rounded-xl p-3 cursor-grab hover:shadow-md hover:border-primary/40 transition-all active:cursor-grabbing",
                    (panelContact == null ? void 0 : panelContact.id) === contact.id && "border-primary shadow-md",
                    draggedContactId === contact.id && "opacity-60"
                  ),
                  children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-2.5 mb-2", children: [
                      /* @__PURE__ */ jsxDEV(Avatar, { contact, size: "sm" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1006,
                        columnNumber: 27
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "min-w-0 flex-1", children: [
                        /* @__PURE__ */ jsxDEV("div", { className: "text-xs font-semibold text-foreground truncate", children: [
                          contact.first_name,
                          " ",
                          contact.last_name
                        ] }, void 0, true, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1008,
                          columnNumber: 29
                        }, this),
                        contact.company && /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] text-muted-foreground truncate", children: contact.company }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1009,
                          columnNumber: 49
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1007,
                        columnNumber: 27
                      }, this),
                      boardGroupBy === "stage" ? /* @__PURE__ */ jsxDEV(PriorityBadge, { contact }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1011,
                        columnNumber: 55
                      }, this) : /* @__PURE__ */ jsxDEV(StageBadge, { stageId: stage }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1011,
                        columnNumber: 93
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1005,
                      columnNumber: 25
                    }, this),
                    contact.role && /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] text-muted-foreground", children: contact.role }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1013,
                      columnNumber: 42
                    }, this),
                    touch && /* @__PURE__ */ jsxDEV("div", { className: cn("mt-1.5 text-[10px]", touch.color), children: [
                      "📅 ",
                      touch.label
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1014,
                      columnNumber: 35
                    }, this)
                  ]
                },
                contact.id,
                true,
                {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 986,
                  columnNumber: 23
                },
                this
              );
            }),
            col.contacts.length === 0 && /* @__PURE__ */ jsxDEV("div", { className: "border-2 border-dashed rounded-xl p-4 text-center text-[10px] text-muted-foreground/50", children: boardGroupBy === "priority" ? "No leads" : "No contacts" }, void 0, false, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 1019,
              columnNumber: 21
            }, this)
          ]
        },
        col.id,
        true,
        {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 955,
          columnNumber: 17
        },
        this
      )) }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 953,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 867,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(AnimatePresence, { children: panelOpen && /* @__PURE__ */ jsxDEV(
        motion.div,
        {
          initial: { x: "100%" },
          animate: { x: 0 },
          exit: { x: "100%" },
          transition: { type: "spring", damping: 30, stiffness: 300 },
          className: "fixed right-0 top-0 bottom-16 lg:bottom-0 w-full md:w-[440px] max-w-full bg-background border-l shadow-xl z-50 flex flex-col",
          children: [
            /* @__PURE__ */ jsxDEV("div", { className: "border-b flex items-center px-4 gap-2 shrink-0 py-3", children: [
              panelMode === "detail" && panelContact && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-semibold text-foreground flex-1 truncate", children: [
                  panelContact.first_name,
                  " ",
                  panelContact.last_name
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1041,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(PriorityBadge, { contact: panelContact }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1042,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("button", { onClick: () => openEdit(panelContact), className: "p-1.5 rounded hover:bg-muted", children: /* @__PURE__ */ jsxDEV(Edit, { className: "w-4 h-4 text-muted-foreground" }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1043,
                  columnNumber: 109
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1043,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("button", { onClick: closePanel, className: "p-1.5 rounded hover:bg-muted", children: /* @__PURE__ */ jsxDEV(X, { className: "w-4 h-4 text-muted-foreground" }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1044,
                  columnNumber: 91
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1044,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 1040,
                columnNumber: 19
              }, this),
              (panelMode === "edit" || panelMode === "new") && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                /* @__PURE__ */ jsxDEV("span", { className: "text-sm font-semibold text-foreground flex-1", children: panelMode === "new" ? "New Contact" : "Edit Contact" }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1049,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("button", { onClick: () => panelContact ? setPanelMode("detail") : closePanel(), className: "p-1.5 rounded hover:bg-muted", children: /* @__PURE__ */ jsxDEV(X, { className: "w-4 h-4 text-muted-foreground" }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1050,
                  columnNumber: 139
                }, this) }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1050,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 1048,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 1038,
              columnNumber: 15
            }, this),
            panelMode === "detail" && panelContact && /* @__PURE__ */ jsxDEV(Fragment, { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex border-b shrink-0", children: ["overview", "activity", "messages"].map((tab) => /* @__PURE__ */ jsxDEV(
                "button",
                {
                  onClick: () => setDetailTab(tab),
                  className: cn(
                    "flex-1 py-2 text-[11px] font-semibold capitalize transition-colors",
                    detailTab === tab ? "text-foreground border-b-2 border-primary -mb-px" : "text-muted-foreground hover:text-foreground"
                  ),
                  children: tab === "activity" ? "Timeline" : tab === "messages" ? "Messages" : "Overview"
                },
                tab,
                false,
                {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1061,
                  columnNumber: 23
                },
                this
              )) }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 1059,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxDEV("div", { className: "p-5 space-y-4", children: [
                detailTab === "overview" && /* @__PURE__ */ jsxDEV(Fragment, { children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4", children: [
                    /* @__PURE__ */ jsxDEV(Avatar, { contact: panelContact, size: "lg" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1080,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "text-lg font-bold text-foreground", children: [
                        panelContact.first_name,
                        " ",
                        panelContact.last_name
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1082,
                        columnNumber: 31
                      }, this),
                      panelContact.role && /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-muted-foreground", children: panelContact.role }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1083,
                        columnNumber: 53
                      }, this),
                      panelContact.company && /* @__PURE__ */ jsxDEV("div", { className: "text-xs text-muted-foreground flex items-center gap-1 mt-0.5", children: [
                        /* @__PURE__ */ jsxDEV(Building2, { className: "w-3 h-3" }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1084,
                          columnNumber: 134
                        }, this),
                        panelContact.company
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1084,
                        columnNumber: 56
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 mt-2 flex-wrap", children: [
                        /* @__PURE__ */ jsxDEV(StageBadge, { stageId: getStage(panelContact) }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1086,
                          columnNumber: 33
                        }, this),
                        getContactSource(panelContact) && /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full border", children: [
                          "via ",
                          getContactSource(panelContact)
                        ] }, void 0, true, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1088,
                          columnNumber: 35
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1085,
                        columnNumber: 31
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1081,
                      columnNumber: 29
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1079,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", children: [
                    panelContact.phone && /* @__PURE__ */ jsxDEV("a", { href: `tel:${panelContact.phone}`, className: "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 border rounded-lg hover:bg-muted transition-colors", children: [
                      /* @__PURE__ */ jsxDEV(Phone, { className: "w-3.5 h-3.5" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1100,
                        columnNumber: 33
                      }, this),
                      " Call"
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1099,
                      columnNumber: 31
                    }, this),
                    panelContact.email && /* @__PURE__ */ jsxDEV("a", { href: `mailto:${panelContact.email}`, className: "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 border rounded-lg hover:bg-muted transition-colors", children: [
                      /* @__PURE__ */ jsxDEV(Mail, { className: "w-3.5 h-3.5" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1105,
                        columnNumber: 33
                      }, this),
                      " Email"
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1104,
                      columnNumber: 31
                    }, this),
                    /* @__PURE__ */ jsxDEV(
                      "button",
                      {
                        onClick: () => handleLogTouch(panelContact),
                        className: "flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 border rounded-lg hover:bg-muted transition-colors",
                        children: [
                          /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-600" }, void 0, false, {
                            fileName: "/dev-server/src/pages/People.tsx",
                            lineNumber: 1112,
                            columnNumber: 31
                          }, this),
                          " Log Touch"
                        ]
                      },
                      void 0,
                      true,
                      {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1108,
                        columnNumber: 29
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1097,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "space-y-2.5 border rounded-xl p-4", children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between gap-3 mb-1", children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Contact Info" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1119,
                        columnNumber: 31
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] text-muted-foreground", children: "Tap to copy" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1120,
                        columnNumber: 31
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1118,
                      columnNumber: 29
                    }, this),
                    panelContact.email && /* @__PURE__ */ jsxDEV(
                      CopyInfoRow,
                      {
                        icon: Mail,
                        label: "Email",
                        value: panelContact.email,
                        copied: copiedField === "email",
                        onCopy: () => copyValue("email", panelContact.email, "Email")
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1123,
                        columnNumber: 31
                      },
                      this
                    ),
                    panelContact.phone && /* @__PURE__ */ jsxDEV(
                      CopyInfoRow,
                      {
                        icon: Phone,
                        label: "Phone",
                        value: panelContact.phone,
                        copied: copiedField === "phone",
                        onCopy: () => copyValue("phone", panelContact.phone, "Phone number")
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1132,
                        columnNumber: 31
                      },
                      this
                    ),
                    panelContact.current_address && /* @__PURE__ */ jsxDEV(
                      CopyInfoRow,
                      {
                        icon: MapPin,
                        label: "Address",
                        value: panelContact.current_address,
                        copied: copiedField === "address",
                        onCopy: () => copyValue("address", panelContact.current_address, "Address")
                      },
                      void 0,
                      false,
                      {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1141,
                        columnNumber: 31
                      },
                      this
                    )
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1117,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "border rounded-xl p-4", children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3", children: "Pipeline Stage" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1153,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-1.5", children: PIPELINE_STAGES.map((s) => {
                      const active = getStage(panelContact) === s.id;
                      return /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          onClick: () => handleSetStage(panelContact, s.id),
                          className: cn("text-[10px] font-semibold px-2 py-1.5 rounded-lg border transition-all", active ? s.color : "bg-background text-muted-foreground border-border hover:border-foreground/20"),
                          children: s.label
                        },
                        s.id,
                        false,
                        {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1158,
                          columnNumber: 35
                        },
                        this
                      );
                    }) }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1154,
                      columnNumber: 29
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1152,
                    columnNumber: 27
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "border rounded-xl p-4 space-y-3", children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide", children: "Follow-up" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1172,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center", children: [
                      /* @__PURE__ */ jsxDEV("span", { className: "flex items-center gap-1.5 text-muted-foreground text-xs", children: [
                        /* @__PURE__ */ jsxDEV(Clock, { className: "w-3.5 h-3.5" }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1174,
                          columnNumber: 105
                        }, this),
                        " Last Touch"
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1174,
                        columnNumber: 31
                      }, this),
                      /* @__PURE__ */ jsxDEV("span", { className: "font-medium text-foreground text-xs", children: formatDate(panelContact.last_touch) }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1175,
                        columnNumber: 31
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1173,
                      columnNumber: 29
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center", children: [
                      /* @__PURE__ */ jsxDEV("span", { className: "flex items-center gap-1.5 text-muted-foreground text-xs", children: [
                        /* @__PURE__ */ jsxDEV(Calendar, { className: "w-3.5 h-3.5" }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1178,
                          columnNumber: 105
                        }, this),
                        " Next Touch"
                      ] }, void 0, true, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1178,
                        columnNumber: 31
                      }, this),
                      (() => {
                        const s = nextTouchStatus(panelContact.next_touch);
                        return s ? /* @__PURE__ */ jsxDEV("span", { className: cn("text-xs", s.color), children: s.label }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1181,
                          columnNumber: 44
                        }, this) : /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-muted-foreground", children: "Not set" }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1181,
                          columnNumber: 104
                        }, this);
                      })()
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1177,
                      columnNumber: 29
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1171,
                    columnNumber: 27
                  }, this),
                  (panelContact.tags || []).filter((t) => !t.startsWith("source:") && !PRIORITY_TAGS.includes(t)).length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "border rounded-xl p-4", children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5", children: [
                      /* @__PURE__ */ jsxDEV(Tag, { className: "w-3 h-3 inline mr-1" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1189,
                        columnNumber: 127
                      }, this),
                      "Tags"
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1189,
                      columnNumber: 31
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap gap-1.5", children: panelContact.tags.filter((t) => !t.startsWith("source:") && !PRIORITY_TAGS.includes(t)).map((t) => /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full", children: t }, t, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1192,
                      columnNumber: 35
                    }, this)) }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1190,
                      columnNumber: 31
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1188,
                    columnNumber: 29
                  }, this),
                  (dealsByContact[panelContact.id] || 0) > 0 && /* @__PURE__ */ jsxDEV("div", { className: "border rounded-xl p-4", children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5", children: [
                      /* @__PURE__ */ jsxDEV(Building2, { className: "w-3 h-3 inline mr-1" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1201,
                        columnNumber: 127
                      }, this),
                      "Linked Deals"
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1201,
                      columnNumber: 31
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "space-y-1.5", children: deals.filter((d) => (d.deal_contacts || []).some((dc) => dc.contact_id === panelContact.id)).map((d) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between text-xs", children: [
                      /* @__PURE__ */ jsxDEV("span", { className: "text-foreground truncate", children: d.address || "Unnamed Deal" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1205,
                        columnNumber: 37
                      }, this),
                      /* @__PURE__ */ jsxDEV("span", { className: "text-muted-foreground shrink-0 ml-2", children: d.status }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1206,
                        columnNumber: 37
                      }, this)
                    ] }, d.id, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1204,
                      columnNumber: 35
                    }, this)) }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1202,
                      columnNumber: 31
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1200,
                    columnNumber: 29
                  }, this),
                  /* @__PURE__ */ jsxDEV(
                    "button",
                    {
                      onClick: () => handleDelete(panelContact.id),
                      className: "w-full text-xs text-destructive border border-destructive/30 rounded-lg py-2 hover:bg-destructive/5 transition-colors flex items-center justify-center gap-1.5",
                      children: [
                        /* @__PURE__ */ jsxDEV(Trash2, { className: "w-3.5 h-3.5" }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1218,
                          columnNumber: 29
                        }, this),
                        " Delete Contact"
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1214,
                      columnNumber: 27
                    },
                    this
                  )
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1077,
                  columnNumber: 25
                }, this),
                detailTab === "activity" && /* @__PURE__ */ jsxDEV(ActivityTimeline, { contact: panelContact }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1224,
                  columnNumber: 25
                }, this),
                detailTab === "messages" && /* @__PURE__ */ jsxDEV(MessageTemplates, { contact: panelContact }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1228,
                  columnNumber: 25
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 1075,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 1074,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 1057,
              columnNumber: 17
            }, this),
            (panelMode === "edit" || panelMode === "new") && /* @__PURE__ */ jsxDEV(Fragment, { children: [
              /* @__PURE__ */ jsxDEV(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxDEV("div", { className: "p-5 space-y-4", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "First Name *" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1241,
                      columnNumber: 30
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: form.first_name, onChange: (e) => setForm((f) => ({ ...f, first_name: e.target.value })), className: "mt-1 h-8 text-sm" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1241,
                      columnNumber: 99
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1241,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Last Name *" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1242,
                      columnNumber: 30
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { value: form.last_name, onChange: (e) => setForm((f) => ({ ...f, last_name: e.target.value })), className: "mt-1 h-8 text-sm" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1242,
                      columnNumber: 98
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1242,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1240,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Email" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1244,
                    columnNumber: 28
                  }, this),
                  /* @__PURE__ */ jsxDEV(Input, { type: "email", value: form.email, onChange: (e) => setForm((f) => ({ ...f, email: e.target.value })), className: "mt-1 h-8 text-sm" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1244,
                    columnNumber: 90
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1244,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Phone" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1245,
                    columnNumber: 28
                  }, this),
                  /* @__PURE__ */ jsxDEV(Input, { value: form.phone, onChange: (e) => setForm((f) => ({ ...f, phone: e.target.value })), className: "mt-1 h-8 text-sm" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1245,
                    columnNumber: 90
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1245,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Company" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1246,
                    columnNumber: 28
                  }, this),
                  /* @__PURE__ */ jsxDEV(Input, { value: form.company, onChange: (e) => setForm((f) => ({ ...f, company: e.target.value })), className: "mt-1 h-8 text-sm" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1246,
                    columnNumber: 92
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1246,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Address" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1247,
                    columnNumber: 28
                  }, this),
                  /* @__PURE__ */ jsxDEV(Input, { value: form.current_address, onChange: (e) => setForm((f) => ({ ...f, current_address: e.target.value })), className: "mt-1 h-8 text-sm" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1247,
                    columnNumber: 92
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1247,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Role" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1249,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV(Select, { value: form.role, onValueChange: (v) => setForm((f) => ({ ...f, role: v })), children: [
                    /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "mt-1 h-8 text-sm", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "Select role" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1251,
                      columnNumber: 71
                    }, this) }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1251,
                      columnNumber: 27
                    }, this),
                    /* @__PURE__ */ jsxDEV(SelectContent, { children: CONTACT_ROLES.map((r) => /* @__PURE__ */ jsxDEV(SelectItem, { value: r, children: r }, r, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1252,
                      columnNumber: 68
                    }, this)) }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1252,
                      columnNumber: 27
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1250,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1248,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Lead Source" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1256,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV(Select, { value: form.source, onValueChange: (v) => setForm((f) => ({ ...f, source: v })), children: [
                    /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "mt-1 h-8 text-sm", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "Where did they come from?" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1258,
                      columnNumber: 71
                    }, this) }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1258,
                      columnNumber: 27
                    }, this),
                    /* @__PURE__ */ jsxDEV(SelectContent, { children: [
                      /* @__PURE__ */ jsxDEV(SelectItem, { value: "none", children: "No source" }, void 0, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1260,
                        columnNumber: 29
                      }, this),
                      CONTACT_SOURCES.map((s) => /* @__PURE__ */ jsxDEV(SelectItem, { value: s, children: s }, s, false, {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1261,
                        columnNumber: 57
                      }, this))
                    ] }, void 0, true, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1259,
                      columnNumber: 27
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1257,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1255,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Pipeline Stage" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1266,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV(
                    Select,
                    {
                      value: form.tags.find((t) => PIPELINE_STAGES.some((s) => s.id === t)) || "",
                      onValueChange: (v) => {
                        const withoutStage = form.tags.filter((t) => !PIPELINE_STAGES.some((s) => s.id === t));
                        setForm((f) => ({ ...f, tags: v ? [...withoutStage, v] : withoutStage }));
                      },
                      children: [
                        /* @__PURE__ */ jsxDEV(SelectTrigger, { className: "mt-1 h-8 text-sm", children: /* @__PURE__ */ jsxDEV(SelectValue, { placeholder: "No stage" }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1274,
                          columnNumber: 71
                        }, this) }, void 0, false, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1274,
                          columnNumber: 27
                        }, this),
                        /* @__PURE__ */ jsxDEV(SelectContent, { children: [
                          /* @__PURE__ */ jsxDEV(SelectItem, { value: "none", children: "No stage" }, void 0, false, {
                            fileName: "/dev-server/src/pages/People.tsx",
                            lineNumber: 1276,
                            columnNumber: 29
                          }, this),
                          PIPELINE_STAGES.map((s) => /* @__PURE__ */ jsxDEV(SelectItem, { value: s.id, children: s.label }, s.id, false, {
                            fileName: "/dev-server/src/pages/People.tsx",
                            lineNumber: 1277,
                            columnNumber: 57
                          }, this))
                        ] }, void 0, true, {
                          fileName: "/dev-server/src/pages/People.tsx",
                          lineNumber: 1275,
                          columnNumber: 27
                        }, this)
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1267,
                      columnNumber: 25
                    },
                    this
                  )
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1265,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Priority" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1283,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "mt-1.5 grid grid-cols-4 gap-1.5", children: PRIORITY_TAGS.map((p) => {
                    const cfg = PRIORITY_CONFIG[p];
                    const active = form.tags.includes(p);
                    return /* @__PURE__ */ jsxDEV(
                      "button",
                      {
                        type: "button",
                        onClick: () => setForm((f) => {
                          const withoutPriority = f.tags.filter((t) => !PRIORITY_TAGS.includes(t));
                          return { ...f, tags: active ? withoutPriority : [...withoutPriority, p] };
                        }),
                        className: cn(
                          "text-[10px] font-semibold px-1.5 py-1.5 rounded-lg border transition-all text-center",
                          active ? cfg.color : "bg-background text-muted-foreground border-border hover:border-foreground/20"
                        ),
                        children: [
                          cfg.emoji,
                          " ",
                          p
                        ]
                      },
                      p,
                      true,
                      {
                        fileName: "/dev-server/src/pages/People.tsx",
                        lineNumber: 1289,
                        columnNumber: 31
                      },
                      this
                    );
                  }) }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1284,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1282,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Last Touch" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1309,
                      columnNumber: 30
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { type: "date", value: form.last_touch, onChange: (e) => setForm((f) => ({ ...f, last_touch: e.target.value })), className: "mt-1 h-8 text-sm" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1309,
                      columnNumber: 97
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1309,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Next Touch" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1310,
                      columnNumber: 30
                    }, this),
                    /* @__PURE__ */ jsxDEV(Input, { type: "date", value: form.next_touch, onChange: (e) => setForm((f) => ({ ...f, next_touch: e.target.value })), className: "mt-1 h-8 text-sm" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1310,
                      columnNumber: 97
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1310,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1308,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV(Label, { className: "text-xs text-muted-foreground", children: "Tags" }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1313,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "mt-1 flex gap-1.5", children: [
                    /* @__PURE__ */ jsxDEV(Input, { placeholder: "Add tag…", value: tagInput, onChange: (e) => setTagInput(e.target.value), onKeyDown: (e) => e.key === "Enter" && (e.preventDefault(), addTag()), className: "h-8 text-sm flex-1" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1315,
                      columnNumber: 27
                    }, this),
                    /* @__PURE__ */ jsxDEV(Button, { size: "sm", variant: "outline", className: "h-8", onClick: addTag, children: "Add" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1316,
                      columnNumber: 27
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1314,
                    columnNumber: 25
                  }, this),
                  form.tags.filter((t) => !PRIORITY_TAGS.includes(t)).length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "flex flex-wrap gap-1.5 mt-2", children: form.tags.filter((t) => !PRIORITY_TAGS.includes(t)).map((t) => /* @__PURE__ */ jsxDEV("span", { className: "inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full", children: [
                    t,
                    /* @__PURE__ */ jsxDEV("button", { onClick: () => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) })), children: /* @__PURE__ */ jsxDEV(X, { className: "w-2.5 h-2.5" }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1322,
                      columnNumber: 124
                    }, this) }, void 0, false, {
                      fileName: "/dev-server/src/pages/People.tsx",
                      lineNumber: 1322,
                      columnNumber: 36
                    }, this)
                  ] }, t, true, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1321,
                    columnNumber: 31
                  }, this)) }, void 0, false, {
                    fileName: "/dev-server/src/pages/People.tsx",
                    lineNumber: 1319,
                    columnNumber: 27
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1312,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 1239,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 1238,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "border-t p-4 flex gap-2 pb-[max(1rem,env(safe-area-inset-bottom))]", children: [
                /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", className: "flex-1", onClick: () => panelContact ? setPanelMode("detail") : closePanel(), children: "Cancel" }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1331,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "flex-1", onClick: handleSave, disabled: createContact.isPending || updateContact.isPending, children: createContact.isPending || updateContact.isPending ? "Saving…" : "Save Contact" }, void 0, false, {
                  fileName: "/dev-server/src/pages/People.tsx",
                  lineNumber: 1332,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/People.tsx",
                lineNumber: 1330,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/People.tsx",
              lineNumber: 1237,
              columnNumber: 17
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 1032,
          columnNumber: 13
        },
        this
      ) }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 1030,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 866,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: csvDialogOpen, onOpenChange: setCsvDialogOpen, children: /* @__PURE__ */ jsxDEV(DialogContent, { className: "max-w-2xl", children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: [
        "Import CSV - ",
        csvPreview.length,
        " rows"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 1346,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 1346,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "max-h-60 overflow-auto border rounded-lg", children: /* @__PURE__ */ jsxDEV("table", { className: "w-full text-xs", children: [
        /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { className: "border-b bg-muted", children: csvPreview[0] && Object.keys(csvPreview[0]).slice(0, 6).map((k) => /* @__PURE__ */ jsxDEV("th", { className: "px-3 py-1.5 text-left font-medium text-muted-foreground", children: k }, k, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 1349,
          columnNumber: 124
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 1349,
          columnNumber: 22
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 1349,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("tbody", { children: csvPreview.slice(0, 10).map((row, i) => /* @__PURE__ */ jsxDEV("tr", { className: "border-b", children: Object.values(row).slice(0, 6).map((v, j) => /* @__PURE__ */ jsxDEV("td", { className: "px-3 py-1.5", children: v }, j, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 1350,
          columnNumber: 142
        }, this)) }, i, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 1350,
          columnNumber: 63
        }, this)) }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 1350,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 1348,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 1347,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-muted-foreground", children: "Columns: first_name, last_name, email, phone, company, role" }, void 0, false, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 1353,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex justify-end gap-2", children: [
        /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", onClick: () => setCsvDialogOpen(false), children: "Cancel" }, void 0, false, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 1355,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", onClick: handleCsvImport, disabled: createContact.isPending, children: [
          "Import ",
          csvPreview.length,
          " Contacts"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/People.tsx",
          lineNumber: 1356,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/People.tsx",
        lineNumber: 1354,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 1345,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/People.tsx",
      lineNumber: 1344,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/People.tsx",
    lineNumber: 709,
    columnNumber: 5
  }, this);
}
export {
  People as default
};
