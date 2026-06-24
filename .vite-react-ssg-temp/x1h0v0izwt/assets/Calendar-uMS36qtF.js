import { jsxDEV } from "react/jsx-dev-runtime";
import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { B as Button, c as cn, L as Label, I as Input } from "../main.mjs";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle } from "./dialog-BhAZyUdo.js";
import { u as useTasks, a as useCreateTask } from "./useTasks-B-9jj9rB.js";
import { u as useOpenHouses } from "./useOpenHouses-C0QWM_XJ.js";
import { startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, format, addMonths, isSameDay } from "date-fns";
import { toast } from "sonner";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, c as PageHeaderActions, f as PageContent, g as PageStack, h as PageSection } from "./page-shell-BTk8AANV.js";
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
  return /* @__PURE__ */ jsxDEV(PageShell, { children: [
    /* @__PURE__ */ jsxDEV(PageHeader, { children: [
      /* @__PURE__ */ jsxDEV(PageHeaderHeading, { title: "Calendar", meta: "Tasks, open houses, and federal holidays in one view" }, void 0, false, {
        fileName: "/dev-server/src/pages/Calendar.tsx",
        lineNumber: 106,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(PageHeaderActions, { children: [
        /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "gap-1.5", onClick: () => openNewEvent(), children: [
          /* @__PURE__ */ jsxDEV(Plus, { className: "w-3.5 h-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 109,
            columnNumber: 13
          }, this),
          " New Event"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Calendar.tsx",
          lineNumber: 108,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "app-surface-subtle flex items-center gap-2 px-2 py-1.5", children: [
          /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "icon", className: "h-8 w-8", onClick: () => setCurrentMonth(subMonths(currentMonth, 1)), children: /* @__PURE__ */ jsxDEV(ChevronLeft, { className: "w-4 h-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 112,
            columnNumber: 131
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 112,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("span", { className: "w-40 text-center text-sm font-semibold text-foreground", children: format(currentMonth, "MMMM yyyy") }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 113,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "icon", className: "h-8 w-8", onClick: () => setCurrentMonth(addMonths(currentMonth, 1)), children: /* @__PURE__ */ jsxDEV(ChevronRight, { className: "w-4 h-4" }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 114,
            columnNumber: 131
          }, this) }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 114,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Calendar.tsx",
          lineNumber: 111,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Calendar.tsx",
        lineNumber: 107,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Calendar.tsx",
      lineNumber: 105,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(PageContent, { children: /* @__PURE__ */ jsxDEV(PageStack, { className: "max-w-none", children: /* @__PURE__ */ jsxDEV(PageSection, { title: "Month View", description: "Select any day to add a new calendar event.", bodyClassName: "p-4", children: /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV("div", { className: "grid min-w-[44rem] grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border", children: [
      ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => /* @__PURE__ */ jsxDEV("div", { className: "bg-muted px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground", children: d }, d, false, {
        fileName: "/dev-server/src/pages/Calendar.tsx",
        lineNumber: 125,
        columnNumber: 19
      }, this)),
      Array.from({ length: startPad }).map((_, i) => /* @__PURE__ */ jsxDEV("div", { className: "min-h-[100px] bg-background" }, `pad-${i}`, false, {
        fileName: "/dev-server/src/pages/Calendar.tsx",
        lineNumber: 128,
        columnNumber: 19
      }, this)),
      days.map((day) => {
        const events = getEventsForDay(day);
        const isToday = isSameDay(day, today);
        const dateStr = format(day, "yyyy-MM-dd");
        return /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: cn("min-h-[100px] cursor-pointer border-t bg-background p-1.5 transition-standard hover:bg-muted/30", isToday && "bg-primary/5"),
            onClick: () => openNewEvent(dateStr),
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: cn("mb-1 text-xs font-semibold", isToday ? "text-primary" : "text-foreground"), children: format(day, "d") }, void 0, false, {
                fileName: "/dev-server/src/pages/Calendar.tsx",
                lineNumber: 140,
                columnNumber: 23
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-0.5", children: [
                events.slice(0, 3).map((ev, i) => /* @__PURE__ */ jsxDEV("div", { className: cn(
                  "truncate rounded px-1 py-0.5 text-[10px] leading-tight",
                  ev.type === "holiday" ? "bg-destructive/10 text-destructive" : ev.type === "task" ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
                ), children: ev.label }, i, false, {
                  fileName: "/dev-server/src/pages/Calendar.tsx",
                  lineNumber: 143,
                  columnNumber: 27
                }, this)),
                events.length > 3 && /* @__PURE__ */ jsxDEV("div", { className: "px-1 text-[10px] text-muted-foreground", children: [
                  "+",
                  events.length - 3,
                  " more"
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Calendar.tsx",
                  lineNumber: 151,
                  columnNumber: 47
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Calendar.tsx",
                lineNumber: 141,
                columnNumber: 23
              }, this)
            ]
          },
          day.toISOString(),
          true,
          {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 135,
            columnNumber: 21
          },
          this
        );
      })
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Calendar.tsx",
      lineNumber: 123,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Calendar.tsx",
      lineNumber: 122,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Calendar.tsx",
      lineNumber: 121,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Calendar.tsx",
      lineNumber: 120,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Calendar.tsx",
      lineNumber: 119,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(Dialog, { open: dialogOpen, onOpenChange: setDialogOpen, children: /* @__PURE__ */ jsxDEV(DialogContent, { className: "max-w-sm", children: [
      /* @__PURE__ */ jsxDEV(DialogHeader, { children: /* @__PURE__ */ jsxDEV(DialogTitle, { children: "New Event" }, void 0, false, {
        fileName: "/dev-server/src/pages/Calendar.tsx",
        lineNumber: 165,
        columnNumber: 25
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Calendar.tsx",
        lineNumber: 165,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "app-form-grid", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "app-form-field", children: [
          /* @__PURE__ */ jsxDEV(Label, { children: "Title" }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 168,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { value: eventTitle, onChange: (e) => setEventTitle(e.target.value), placeholder: "Event title" }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 169,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Calendar.tsx",
          lineNumber: 167,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "app-form-field", children: [
          /* @__PURE__ */ jsxDEV(Label, { children: "Date" }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 172,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Input, { type: "date", value: eventDate, onChange: (e) => setEventDate(e.target.value) }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 173,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Calendar.tsx",
          lineNumber: 171,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", onClick: () => setDialogOpen(false), children: "Cancel" }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 176,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV(Button, { size: "sm", onClick: handleCreateEvent, disabled: createTask.isPending, children: createTask.isPending ? "Creating..." : "Create" }, void 0, false, {
            fileName: "/dev-server/src/pages/Calendar.tsx",
            lineNumber: 177,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Calendar.tsx",
          lineNumber: 175,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Calendar.tsx",
        lineNumber: 166,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Calendar.tsx",
      lineNumber: 164,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Calendar.tsx",
      lineNumber: 163,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Calendar.tsx",
    lineNumber: 104,
    columnNumber: 5
  }, this);
}
export {
  CalendarPage as default
};
