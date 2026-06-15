import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { B as Button, c as cn, L as Label, I as Input } from "../main.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-Gt8dxHPr.js";
import { u as useTasks, a as useCreateTask } from "./useTasks-B-9jj9rB.js";
import { u as useOpenHouses } from "./useOpenHouses-C0QWM_XJ.js";
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, format, addMonths, isSameDay } from "date-fns";
import { toast } from "sonner";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, c as PageHeaderActions, f as PageContent, g as PageStack, h as PageSection } from "./page-shell-DKoO3rjg.js";
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
function getHolidays(year) {
  return [
    { date: new Date(year, 0, 1), name: "New Year's Day" },
    { date: getNthWeekday(year, 0, 1, 3), name: "MLK Jr. Day" },
    { date: getNthWeekday(year, 1, 1, 3), name: "Presidents' Day" },
    { date: getLastWeekday(year, 4, 1), name: "Memorial Day" },
    { date: new Date(year, 5, 19), name: "Juneteenth" },
    { date: new Date(year, 6, 4), name: "Independence Day" },
    { date: getNthWeekday(year, 8, 1, 1), name: "Labor Day" },
    { date: getNthWeekday(year, 9, 1, 2), name: "Columbus Day" },
    { date: new Date(year, 10, 11), name: "Veterans Day" },
    { date: getNthWeekday(year, 10, 4, 4), name: "Thanksgiving" },
    { date: new Date(year, 11, 25), name: "Christmas" }
  ];
}
function getNthWeekday(year, month, weekday, n) {
  const first = new Date(year, month, 1);
  let day = 1 + (weekday - first.getDay() + 7) % 7;
  day += (n - 1) * 7;
  return new Date(year, month, day);
}
function getLastWeekday(year, month, weekday) {
  const last = new Date(year, month + 1, 0);
  const diff = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - diff);
}
function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(/* @__PURE__ */ new Date());
  const { data: tasks = [] } = useTasks();
  const { data: openHouses = [] } = useOpenHouses();
  const createTask = useCreateTask();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const year = currentMonth.getFullYear();
  const holidays = getHolidays(year);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);
  const getEventsForDay = (day) => {
    const items = [];
    holidays.forEach((h) => {
      if (isSameDay(h.date, day)) items.push({ label: h.name, type: "holiday" });
    });
    tasks.forEach((t) => {
      if (t.due_date && isSameDay(new Date(t.due_date), day)) items.push({ label: t.title, type: "task" });
    });
    openHouses.forEach((oh) => {
      if (isSameDay(/* @__PURE__ */ new Date(oh.scheduled_date + "T00:00:00"), day)) items.push({ label: `Open House ${oh.start_time}`, type: "openhouse" });
    });
    return items;
  };
  const today = /* @__PURE__ */ new Date();
  const handleCreateEvent = async () => {
    if (!eventTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!eventDate) {
      toast.error("Date is required");
      return;
    }
    try {
      await createTask.mutateAsync({ title: eventTitle.trim(), type: "todo", due_date: (/* @__PURE__ */ new Date(eventDate + "T00:00:00")).toISOString() });
      toast.success("Event added to calendar");
      setDialogOpen(false);
      setEventTitle("");
      setEventDate("");
    } catch {
      toast.error("Failed to create event");
    }
  };
  const openNewEvent = (dateStr) => {
    setEventDate(dateStr || format(/* @__PURE__ */ new Date(), "yyyy-MM-dd"));
    setEventTitle("");
    setDialogOpen(true);
  };
  return /* @__PURE__ */ jsxs(PageShell, { children: [
    /* @__PURE__ */ jsxs(PageHeader, { children: [
      /* @__PURE__ */ jsx(PageHeaderHeading, { title: "Calendar", meta: "Tasks, open houses, and federal holidays in one view" }),
      /* @__PURE__ */ jsxs(PageHeaderActions, { children: [
        /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: () => openNewEvent(), children: [
          /* @__PURE__ */ jsx(Plus, { className: "w-3.5 h-3.5" }),
          " New Event"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "app-surface-subtle flex items-center gap-2 px-2 py-1.5", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-8 w-8", onClick: () => setCurrentMonth(subMonths(currentMonth, 1)), children: /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx("span", { className: "w-40 text-center text-sm font-semibold text-foreground", children: format(currentMonth, "MMMM yyyy") }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "icon", className: "h-8 w-8", onClick: () => setCurrentMonth(addMonths(currentMonth, 1)), children: /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(PageContent, { children: /* @__PURE__ */ jsx(PageStack, { className: "max-w-none", children: /* @__PURE__ */ jsx(PageSection, { title: "Month View", description: "Select any day to add a new calendar event.", bodyClassName: "p-4", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("div", { className: "grid min-w-[44rem] grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border", children: [
      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => /* @__PURE__ */ jsx("div", { className: "bg-muted px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: d }, d)),
      Array.from({ length: startPad }).map((_, i) => /* @__PURE__ */ jsx("div", { className: "min-h-[100px] bg-background" }, `pad-${i}`)),
      days.map((day) => {
        const events = getEventsForDay(day);
        const isToday = isSameDay(day, today);
        const dateStr = format(day, "yyyy-MM-dd");
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: cn("min-h-[100px] cursor-pointer border-t bg-background p-1.5 transition-standard hover:bg-muted/30", isToday && "bg-primary/5"),
            onClick: () => openNewEvent(dateStr),
            children: [
              /* @__PURE__ */ jsx("div", { className: cn("mb-1 text-xs font-semibold", isToday ? "text-primary" : "text-foreground"), children: format(day, "d") }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-0.5", children: [
                events.slice(0, 3).map((ev, i) => /* @__PURE__ */ jsx("div", { className: cn(
                  "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                  ev.type === "holiday" ? "bg-destructive/10 text-destructive" : ev.type === "task" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
                ), children: ev.label }, i)),
                events.length > 3 && /* @__PURE__ */ jsxs("div", { className: "px-1 text-[10px] text-muted-foreground", children: [
                  "+",
                  events.length - 3,
                  " more"
                ] })
              ] })
            ]
          },
          day.toISOString()
        );
      })
    ] }) }) }) }) }),
    /* @__PURE__ */ jsx(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "New Event" }) }),
      /* @__PURE__ */ jsxs("div", { className: "app-form-grid", children: [
        /* @__PURE__ */ jsxs("div", { className: "app-form-field", children: [
          /* @__PURE__ */ jsx(Label, { children: "Title" }),
          /* @__PURE__ */ jsx(Input, { value: eventTitle, onChange: (e) => setEventTitle(e.target.value), placeholder: "Event title" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "app-form-field", children: [
          /* @__PURE__ */ jsx(Label, { children: "Date" }),
          /* @__PURE__ */ jsx(Input, { type: "date", value: eventDate, onChange: (e) => setEventDate(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setDialogOpen(false), children: "Cancel" }),
          /* @__PURE__ */ jsx(Button, { size: "sm", onClick: handleCreateEvent, disabled: createTask.isPending, children: createTask.isPending ? "Creating..." : "Create" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  CalendarPage as default
};
