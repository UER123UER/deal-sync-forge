import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import * as React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Plus, StickyNote, CheckSquare, Edit, Trash2, X, Calendar as Calendar$1, Phone, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { c as cn, p as buttonVariants, I as Input, B as Button, L as Label } from "../main.mjs";
import { DayPicker } from "react-day-picker";
import { C as Checkbox } from "./checkbox-B7kHRerZ.js";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BADoDizA.js";
import { T as Textarea } from "./textarea-D3hFjulo.js";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, c as PageHeaderActions, d as PageToolbar, e as PageToolbarGroup, f as PageContent, g as PageStack, E as EmptyState } from "./page-shell-BTk8AANV.js";
import { u as useTasks, a as useCreateTask, c as useUpdateTask, b as useDeleteTask } from "./useTasks-B-9jj9rB.js";
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
import "@radix-ui/react-checkbox";
function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return /* @__PURE__ */ jsxDEV(
    DayPicker,
    {
      showOutsideDays,
      className: cn("p-3", className),
      classNames: {
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames
      },
      components: {
        IconLeft: ({ ..._props }) => /* @__PURE__ */ jsxDEV(ChevronLeft, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/dev-server/src/components/ui/calendar.tsx",
          lineNumber: 45,
          columnNumber: 38
        }, this),
        IconRight: ({ ..._props }) => /* @__PURE__ */ jsxDEV(ChevronRight, { className: "h-4 w-4" }, void 0, false, {
          fileName: "/dev-server/src/components/ui/calendar.tsx",
          lineNumber: 46,
          columnNumber: 39
        }, this)
      },
      ...props
    },
    void 0,
    false,
    {
      fileName: "/dev-server/src/components/ui/calendar.tsx",
      lineNumber: 12,
      columnNumber: 5
    },
    this
  );
}
Calendar.displayName = "Calendar";
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxDEV(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsxDEV(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    ),
    ...props
  },
  void 0,
  false,
  {
    fileName: "/dev-server/src/components/ui/popover.tsx",
    lineNumber: 15,
    columnNumber: 5
  },
  void 0
) }, void 0, false, {
  fileName: "/dev-server/src/components/ui/popover.tsx",
  lineNumber: 14,
  columnNumber: 3
}, void 0));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
const TASK_TYPES = [
  { key: "todo", label: "Todo", icon: CheckSquare },
  { key: "call", label: "Call", icon: Phone },
  { key: "meeting", label: "In-Person Meeting", icon: Users },
  { key: "note", label: "Note", icon: StickyNote }
];
const typeBadgeClasses = {
  todo: "border-primary/15 bg-primary/10 text-primary",
  call: "border-warning/15 bg-warning/10 text-warning",
  meeting: "border-success/15 bg-success/10 text-success",
  note: "border-border bg-muted text-muted-foreground"
};
function Tasks() {
  const { data: tasks = [], isLoading, isError } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [newTaskType, setNewTaskType] = useState("todo");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState();
  const [optimisticCompleted, setOptimisticCompleted] = useState({});
  const [filterType, setFilterType] = useState("all");
  const filtered = tasks.filter((task) => {
    if (filterType !== "all" && task.type !== filterType) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return task.title.toLowerCase().includes(term) || (task.description || "").toLowerCase().includes(term) || (task.assignee || "").toLowerCase().includes(term);
  });
  const openCreate = () => {
    setEditingTask(null);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskType("todo");
    setNewTaskDueDate(void 0);
    setPanelOpen(true);
  };
  const openEdit = (task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || "");
    setNewTaskType(task.type);
    setNewTaskDueDate(task.due_date ? new Date(task.due_date) : void 0);
    setPanelOpen(true);
  };
  const handleSave = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || void 0,
          type: newTaskType,
          due_date: newTaskDueDate ? newTaskDueDate.toISOString() : null
        });
        toast.success("Task updated");
      } else {
        await createTask.mutateAsync({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || void 0,
          type: newTaskType,
          due_date: newTaskDueDate ? newTaskDueDate.toISOString() : void 0
        });
        toast.success("Task created");
      }
      setPanelOpen(false);
    } catch {
      toast.error("Failed to save task");
    }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };
  const toggleComplete = async (task) => {
    const nextCompleted = !task.completed;
    setOptimisticCompleted((previous) => ({ ...previous, [task.id]: nextCompleted }));
    try {
      await updateTask.mutateAsync({ id: task.id, completed: nextCompleted });
    } catch {
      setOptimisticCompleted((previous) => ({ ...previous, [task.id]: task.completed }));
      toast.error("Failed to update task");
    }
  };
  const isSaving = createTask.isPending || updateTask.isPending;
  return /* @__PURE__ */ jsxDEV(PageShell, { children: [
    /* @__PURE__ */ jsxDEV(PageHeader, { children: [
      /* @__PURE__ */ jsxDEV(
        PageHeaderHeading,
        {
          title: "Tasks",
          meta: `${filtered.length} visible • ${tasks.length} total tasks`
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 155,
          columnNumber: 9
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(PageHeaderActions, { children: /* @__PURE__ */ jsxDEV("div", { className: "relative w-full max-w-80", children: [
        /* @__PURE__ */ jsxDEV(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }, void 0, false, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 161,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV(
          Input,
          {
            placeholder: "Search tasks, descriptions, or assignees",
            className: "pl-9",
            value: search,
            onChange: (event) => setSearch(event.target.value)
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 162,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 160,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 159,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 154,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(PageToolbar, { children: [
      /* @__PURE__ */ jsxDEV(PageToolbarGroup, { className: "app-segmented", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            "data-state": filterType === "all" ? "active" : "inactive",
            className: "app-segmented-item",
            onClick: () => setFilterType("all"),
            children: "All"
          },
          void 0,
          false,
          {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 174,
            columnNumber: 11
          },
          this
        ),
        TASK_TYPES.map((taskType) => /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            "data-state": filterType === taskType.key ? "active" : "inactive",
            className: "app-segmented-item inline-flex items-center gap-1.5",
            onClick: () => setFilterType(taskType.key),
            children: [
              /* @__PURE__ */ jsxDEV(taskType.icon, { className: "h-3.5 w-3.5" }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 190,
                columnNumber: 15
              }, this),
              taskType.label
            ]
          },
          taskType.key,
          true,
          {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 183,
            columnNumber: 13
          },
          this
        ))
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 173,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(PageToolbarGroup, { className: "ml-auto", children: /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "gap-1.5", onClick: openCreate, children: [
        /* @__PURE__ */ jsxDEV(Plus, { className: "h-3.5 w-3.5" }, void 0, false, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 198,
          columnNumber: 13
        }, this),
        "New Task"
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 197,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 196,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 172,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(PageContent, { className: "py-4", children: /* @__PURE__ */ jsxDEV(PageStack, { className: "max-w-none gap-4", children: /* @__PURE__ */ jsxDEV("section", { className: "app-surface overflow-hidden", children: isLoading ? /* @__PURE__ */ jsxDEV("div", { className: "divide-y", children: [0, 1, 2, 3, 4].map((row) => /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4 px-6 py-4 animate-pulse", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "h-4 w-4 rounded bg-muted" }, void 0, false, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 211,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "min-w-0 flex-1 space-y-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "h-3.5 w-52 rounded bg-muted" }, void 0, false, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 213,
          columnNumber: 23
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "h-3 w-32 rounded bg-muted/70" }, void 0, false, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 214,
          columnNumber: 23
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 212,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "h-3.5 w-20 rounded bg-muted" }, void 0, false, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 216,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "h-3.5 w-24 rounded bg-muted" }, void 0, false, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 217,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "h-6 w-16 rounded-full bg-muted" }, void 0, false, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 218,
        columnNumber: 21
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "h-8 w-8 rounded bg-muted" }, void 0, false, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 220,
          columnNumber: 23
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "h-8 w-8 rounded bg-muted" }, void 0, false, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 221,
          columnNumber: 23
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 219,
        columnNumber: 21
      }, this)
    ] }, row, true, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 210,
      columnNumber: 19
    }, this)) }, void 0, false, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 208,
      columnNumber: 15
    }, this) : isError ? /* @__PURE__ */ jsxDEV(
      EmptyState,
      {
        icon: StickyNote,
        title: "Tasks could not be loaded",
        description: "Check the network or Supabase connection, then reload this page."
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 227,
        columnNumber: 15
      },
      this
    ) : filtered.length === 0 ? /* @__PURE__ */ jsxDEV(
      EmptyState,
      {
        icon: CheckSquare,
        title: search || filterType !== "all" ? "No tasks match the current filters" : "No tasks yet",
        description: search || filterType !== "all" ? "Clear the search or filter state to see more results." : "Create your first task to keep brokerage follow-up standardized.",
        action: !search && filterType === "all" ? /* @__PURE__ */ jsxDEV(Button, { size: "sm", className: "gap-1.5", onClick: openCreate, children: [
          /* @__PURE__ */ jsxDEV(Plus, { className: "h-3.5 w-3.5" }, void 0, false, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 244,
            columnNumber: 23
          }, this),
          "Create Task"
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 243,
          columnNumber: 21
        }, this) : void 0
      },
      void 0,
      false,
      {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 233,
        columnNumber: 15
      },
      this
    ) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV("div", { className: "divide-y md:hidden", children: filtered.map((task) => {
        const isCompleted = task.id in optimisticCompleted ? optimisticCompleted[task.id] : task.completed;
        const taskType = TASK_TYPES.find((candidate) => candidate.key === task.type);
        return /* @__PURE__ */ jsxDEV("div", { className: "space-y-3 px-4 py-4", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsxDEV(
              Checkbox,
              {
                checked: isCompleted,
                onCheckedChange: () => toggleComplete(task),
                "aria-label": `Mark ${task.title} as ${isCompleted ? "incomplete" : "complete"}`,
                className: "mt-0.5"
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 261,
                columnNumber: 27
              },
              this
            ),
            /* @__PURE__ */ jsxDEV("div", { className: "min-w-0 flex-1 space-y-1", children: [
              /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: cn(
                    "text-sm font-semibold text-foreground",
                    isCompleted && "line-through text-muted-foreground"
                  ),
                  children: task.title
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 268,
                  columnNumber: 29
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("div", { className: "text-sm leading-6 text-muted-foreground", children: task.description || "No description" }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 276,
                columnNumber: 29
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 267,
              columnNumber: 27
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 260,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-3 pl-7 text-sm", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Due Date" }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 284,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "text-muted-foreground", children: task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-" }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 285,
                columnNumber: 29
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 283,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Assignee" }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 288,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "text-muted-foreground", children: task.assignee || "Unassigned" }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 289,
                columnNumber: 29
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 287,
              columnNumber: 27
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Type" }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 292,
                columnNumber: 29
              }, this),
              /* @__PURE__ */ jsxDEV(
                "span",
                {
                  className: cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
                    typeBadgeClasses[task.type] || typeBadgeClasses.note
                  ),
                  children: [
                    taskType ? /* @__PURE__ */ jsxDEV(taskType.icon, { className: "h-3 w-3" }, void 0, false, {
                      fileName: "/dev-server/src/pages/Tasks.tsx",
                      lineNumber: 299,
                      columnNumber: 43
                    }, this) : null,
                    (taskType == null ? void 0 : taskType.label) || task.type
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 293,
                  columnNumber: 29
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 291,
              columnNumber: 27
            }, this)
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 282,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex justify-end gap-1.5 pl-7", children: [
            /* @__PURE__ */ jsxDEV(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "gap-1.5",
                onClick: () => openEdit(task),
                "aria-label": `Edit ${task.title}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Edit, { className: "h-3.5 w-3.5" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 313,
                    columnNumber: 29
                  }, this),
                  "Edit"
                ]
              },
              void 0,
              true,
              {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 306,
                columnNumber: 27
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "gap-1.5 text-destructive hover:text-destructive",
                onClick: () => handleDelete(task.id),
                "aria-label": `Delete ${task.title}`,
                children: [
                  /* @__PURE__ */ jsxDEV(Trash2, { className: "h-3.5 w-3.5" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 323,
                    columnNumber: 29
                  }, this),
                  "Delete"
                ]
              },
              void 0,
              true,
              {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 316,
                columnNumber: 27
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 305,
            columnNumber: 25
          }, this)
        ] }, task.id, true, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 259,
          columnNumber: 23
        }, this);
      }) }, void 0, false, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 252,
        columnNumber: 17
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxDEV(Table, { children: [
        /* @__PURE__ */ jsxDEV(TableHeader, { children: /* @__PURE__ */ jsxDEV(TableRow, { children: [
          /* @__PURE__ */ jsxDEV(TableHead, { className: "w-10" }, void 0, false, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 336,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(TableHead, { children: "Task" }, void 0, false, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 337,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(TableHead, { children: "Due Date" }, void 0, false, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 338,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(TableHead, { children: "Assignee" }, void 0, false, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 339,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(TableHead, { children: "Type" }, void 0, false, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 340,
            columnNumber: 25
          }, this),
          /* @__PURE__ */ jsxDEV(TableHead, { className: "w-28 text-right", children: "Actions" }, void 0, false, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 341,
            columnNumber: 25
          }, this)
        ] }, void 0, true, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 335,
          columnNumber: 23
        }, this) }, void 0, false, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 334,
          columnNumber: 21
        }, this),
        /* @__PURE__ */ jsxDEV(TableBody, { children: filtered.map((task) => {
          const isCompleted = task.id in optimisticCompleted ? optimisticCompleted[task.id] : task.completed;
          const taskType = TASK_TYPES.find((candidate) => candidate.key === task.type);
          return /* @__PURE__ */ jsxDEV(TableRow, { "data-state": isCompleted ? "selected" : void 0, children: [
            /* @__PURE__ */ jsxDEV(TableCell, { className: "w-10 align-top", children: /* @__PURE__ */ jsxDEV(
              Checkbox,
              {
                checked: isCompleted,
                onCheckedChange: () => toggleComplete(task),
                "aria-label": `Mark ${task.title} as ${isCompleted ? "incomplete" : "complete"}`
              },
              void 0,
              false,
              {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 353,
                columnNumber: 31
              },
              this
            ) }, void 0, false, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 352,
              columnNumber: 29
            }, this),
            /* @__PURE__ */ jsxDEV(TableCell, { className: "align-top", children: /* @__PURE__ */ jsxDEV("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: cn(
                    "text-sm font-semibold text-foreground",
                    isCompleted && "line-through text-muted-foreground"
                  ),
                  children: task.title
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 361,
                  columnNumber: 33
                },
                this
              ),
              task.description ? /* @__PURE__ */ jsxDEV("div", { className: "max-w-xl text-sm leading-6 text-muted-foreground", children: task.description }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 370,
                columnNumber: 35
              }, this) : /* @__PURE__ */ jsxDEV("div", { className: "text-sm text-muted-foreground", children: "No description" }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 374,
                columnNumber: 35
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 360,
              columnNumber: 31
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 359,
              columnNumber: 29
            }, this),
            /* @__PURE__ */ jsxDEV(TableCell, { className: "align-top text-sm text-muted-foreground", children: task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-" }, void 0, false, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 378,
              columnNumber: 29
            }, this),
            /* @__PURE__ */ jsxDEV(TableCell, { className: "align-top text-sm text-muted-foreground", children: task.assignee || "Unassigned" }, void 0, false, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 381,
              columnNumber: 29
            }, this),
            /* @__PURE__ */ jsxDEV(TableCell, { className: "align-top", children: /* @__PURE__ */ jsxDEV(
              "span",
              {
                className: cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
                  typeBadgeClasses[task.type] || typeBadgeClasses.note
                ),
                children: [
                  taskType ? /* @__PURE__ */ jsxDEV(taskType.icon, { className: "h-3 w-3" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 391,
                    columnNumber: 45
                  }, this) : null,
                  (taskType == null ? void 0 : taskType.label) || task.type
                ]
              },
              void 0,
              true,
              {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 385,
                columnNumber: 31
              },
              this
            ) }, void 0, false, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 384,
              columnNumber: 29
            }, this),
            /* @__PURE__ */ jsxDEV(TableCell, { className: "align-top", children: /* @__PURE__ */ jsxDEV("div", { className: "flex justify-end gap-1", children: [
              /* @__PURE__ */ jsxDEV(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8",
                  onClick: () => openEdit(task),
                  "aria-label": `Edit ${task.title}`,
                  children: /* @__PURE__ */ jsxDEV(Edit, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 404,
                    columnNumber: 35
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 397,
                  columnNumber: 33
                },
                this
              ),
              /* @__PURE__ */ jsxDEV(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8 text-destructive hover:text-destructive",
                  onClick: () => handleDelete(task.id),
                  "aria-label": `Delete ${task.title}`,
                  children: /* @__PURE__ */ jsxDEV(Trash2, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 413,
                    columnNumber: 35
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 406,
                  columnNumber: 33
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 396,
              columnNumber: 31
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 395,
              columnNumber: 29
            }, this)
          ] }, task.id, true, {
            fileName: "/dev-server/src/pages/Tasks.tsx",
            lineNumber: 351,
            columnNumber: 27
          }, this);
        }) }, void 0, false, {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 344,
          columnNumber: 21
        }, this)
      ] }, void 0, true, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 333,
        columnNumber: 19
      }, this) }, void 0, false, {
        fileName: "/dev-server/src/pages/Tasks.tsx",
        lineNumber: 332,
        columnNumber: 17
      }, this)
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 251,
      columnNumber: 15
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 206,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 205,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 204,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV(AnimatePresence, { children: panelOpen ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
      /* @__PURE__ */ jsxDEV(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "fixed inset-0 z-40 bg-black/40",
          onClick: () => setPanelOpen(false)
        },
        void 0,
        false,
        {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 432,
          columnNumber: 13
        },
        this
      ),
      /* @__PURE__ */ jsxDEV(
        motion.aside,
        {
          initial: { x: "100%" },
          animate: { x: 0 },
          exit: { x: "100%" },
          transition: { duration: 0.18, ease: "easeOut" },
          className: "fixed top-0 bottom-16 lg:bottom-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-background shadow-floating",
          children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between border-b px-5 py-4", children: [
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("h2", { className: "text-base font-semibold text-foreground", children: editingTask ? "Edit Task" : "New Task" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 448,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-sm text-muted-foreground", children: "Define the task type, core details, and due date in one place." }, void 0, false, {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 451,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 447,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-9 w-9",
                  onClick: () => setPanelOpen(false),
                  "aria-label": "Close task panel",
                  children: /* @__PURE__ */ jsxDEV(X, { className: "h-4 w-4" }, void 0, false, {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 462,
                    columnNumber: 19
                  }, this)
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 455,
                  columnNumber: 17
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 446,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex-1 overflow-auto p-5", children: /* @__PURE__ */ jsxDEV("div", { className: "app-form-grid", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "app-form-field", children: [
                /* @__PURE__ */ jsxDEV(Label, { children: "Task Type" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 469,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-2 gap-2", children: TASK_TYPES.map((taskType) => /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    type: "button",
                    onClick: () => setNewTaskType(taskType.key),
                    className: cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-standard",
                      newTaskType === taskType.key ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-foreground hover:bg-muted/50"
                    ),
                    children: [
                      /* @__PURE__ */ jsxDEV(taskType.icon, { className: "h-4 w-4" }, void 0, false, {
                        fileName: "/dev-server/src/pages/Tasks.tsx",
                        lineNumber: 483,
                        columnNumber: 27
                      }, this),
                      taskType.label
                    ]
                  },
                  taskType.key,
                  true,
                  {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 472,
                    columnNumber: 25
                  },
                  this
                )) }, void 0, false, {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 470,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 468,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "app-form-field", children: [
                /* @__PURE__ */ jsxDEV(Label, { children: "Title" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 491,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Input,
                  {
                    placeholder: "Task title",
                    value: newTaskTitle,
                    onChange: (event) => setNewTaskTitle(event.target.value)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 492,
                    columnNumber: 21
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 490,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "app-form-field", children: [
                /* @__PURE__ */ jsxDEV(Label, { children: "Description" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 500,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Textarea,
                  {
                    placeholder: "Add context, next steps, or handoff details",
                    value: newTaskDescription,
                    onChange: (event) => setNewTaskDescription(event.target.value)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 501,
                    columnNumber: 21
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 499,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "app-form-field", children: [
                /* @__PURE__ */ jsxDEV(Label, { children: "Due Date" }, void 0, false, {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 509,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(Popover, { children: [
                  /* @__PURE__ */ jsxDEV(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxDEV(
                    "button",
                    {
                      type: "button",
                      className: "flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-left transition-standard hover:bg-muted/40",
                      children: [
                        /* @__PURE__ */ jsxDEV(Calendar$1, { className: "h-4 w-4 text-muted-foreground" }, void 0, false, {
                          fileName: "/dev-server/src/pages/Tasks.tsx",
                          lineNumber: 516,
                          columnNumber: 27
                        }, this),
                        /* @__PURE__ */ jsxDEV("span", { className: newTaskDueDate ? "text-foreground" : "text-muted-foreground", children: newTaskDueDate ? format(newTaskDueDate, "MMM d, yyyy") : "Select date" }, void 0, false, {
                          fileName: "/dev-server/src/pages/Tasks.tsx",
                          lineNumber: 517,
                          columnNumber: 27
                        }, this)
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "/dev-server/src/pages/Tasks.tsx",
                      lineNumber: 512,
                      columnNumber: 25
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 511,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsxDEV(
                    Calendar,
                    {
                      mode: "single",
                      selected: newTaskDueDate,
                      onSelect: setNewTaskDueDate,
                      initialFocus: true
                    },
                    void 0,
                    false,
                    {
                      fileName: "/dev-server/src/pages/Tasks.tsx",
                      lineNumber: 523,
                      columnNumber: 25
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/dev-server/src/pages/Tasks.tsx",
                    lineNumber: 522,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 510,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 508,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 467,
              columnNumber: 17
            }, this) }, void 0, false, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 466,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-end gap-2 border-t px-5 py-4", children: [
              /* @__PURE__ */ jsxDEV(Button, { variant: "outline", size: "sm", onClick: () => setPanelOpen(false), children: "Cancel" }, void 0, false, {
                fileName: "/dev-server/src/pages/Tasks.tsx",
                lineNumber: 536,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV(
                Button,
                {
                  size: "sm",
                  onClick: handleSave,
                  disabled: !newTaskTitle.trim() || isSaving,
                  children: isSaving ? "Saving..." : "Save Task"
                },
                void 0,
                false,
                {
                  fileName: "/dev-server/src/pages/Tasks.tsx",
                  lineNumber: 539,
                  columnNumber: 17
                },
                this
              )
            ] }, void 0, true, {
              fileName: "/dev-server/src/pages/Tasks.tsx",
              lineNumber: 535,
              columnNumber: 15
            }, this)
          ]
        },
        void 0,
        true,
        {
          fileName: "/dev-server/src/pages/Tasks.tsx",
          lineNumber: 439,
          columnNumber: 13
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 431,
      columnNumber: 11
    }, this) : null }, void 0, false, {
      fileName: "/dev-server/src/pages/Tasks.tsx",
      lineNumber: 429,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "/dev-server/src/pages/Tasks.tsx",
    lineNumber: 153,
    columnNumber: 5
  }, this);
}
export {
  Tasks as default
};
