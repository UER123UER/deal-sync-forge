import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Search, Plus, StickyNote, CheckSquare, Edit, Trash2, X, Calendar as Calendar$1, Phone, Users } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { c as cn, p as buttonVariants, I as Input, B as Button, L as Label } from "../main.mjs";
import { DayPicker } from "react-day-picker";
import { C as Checkbox } from "./checkbox-D50hG86N.js";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-BMLOidPK.js";
import { T as Textarea } from "./textarea-BPTRa9Ni.js";
import { P as PageShell, a as PageHeader, b as PageHeaderHeading, c as PageHeaderActions, d as PageToolbar, e as PageToolbarGroup, f as PageContent, g as PageStack, E as EmptyState } from "./page-shell-DKoO3rjg.js";
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
import "@radix-ui/react-slot";
import "@radix-ui/react-accordion";
import "@radix-ui/react-label";
import "@radix-ui/react-checkbox";
function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  return /* @__PURE__ */ jsx(
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
        IconLeft: ({ ..._props }) => /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }),
        IconRight: ({ ..._props }) => /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
      },
      ...props
    }
  );
}
Calendar.displayName = "Calendar";
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverContent = React.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx(
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
  }
) }));
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
  return /* @__PURE__ */ jsxs(PageShell, { children: [
    /* @__PURE__ */ jsxs(PageHeader, { children: [
      /* @__PURE__ */ jsx(
        PageHeaderHeading,
        {
          title: "Tasks",
          meta: `${filtered.length} visible • ${tasks.length} total tasks`
        }
      ),
      /* @__PURE__ */ jsx(PageHeaderActions, { children: /* @__PURE__ */ jsxs("div", { className: "relative w-full max-w-80", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Search tasks, descriptions, or assignees",
            className: "pl-9",
            value: search,
            onChange: (event) => setSearch(event.target.value)
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(PageToolbar, { children: [
      /* @__PURE__ */ jsxs(PageToolbarGroup, { className: "app-segmented", children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            "data-state": filterType === "all" ? "active" : "inactive",
            className: "app-segmented-item",
            onClick: () => setFilterType("all"),
            children: "All"
          }
        ),
        TASK_TYPES.map((taskType) => /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            "data-state": filterType === taskType.key ? "active" : "inactive",
            className: "app-segmented-item inline-flex items-center gap-1.5",
            onClick: () => setFilterType(taskType.key),
            children: [
              /* @__PURE__ */ jsx(taskType.icon, { className: "h-3.5 w-3.5" }),
              taskType.label
            ]
          },
          taskType.key
        ))
      ] }),
      /* @__PURE__ */ jsx(PageToolbarGroup, { className: "ml-auto", children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: openCreate, children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
        "New Task"
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(PageContent, { className: "py-4", children: /* @__PURE__ */ jsx(PageStack, { className: "max-w-none gap-4", children: /* @__PURE__ */ jsx("section", { className: "app-surface overflow-hidden", children: isLoading ? /* @__PURE__ */ jsx("div", { className: "divide-y", children: [0, 1, 2, 3, 4].map((row) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 px-6 py-4 animate-pulse", children: [
      /* @__PURE__ */ jsx("div", { className: "h-4 w-4 rounded bg-muted" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-3.5 w-52 rounded bg-muted" }),
        /* @__PURE__ */ jsx("div", { className: "h-3 w-32 rounded bg-muted/70" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-3.5 w-20 rounded bg-muted" }),
      /* @__PURE__ */ jsx("div", { className: "h-3.5 w-24 rounded bg-muted" }),
      /* @__PURE__ */ jsx("div", { className: "h-6 w-16 rounded-full bg-muted" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded bg-muted" }),
        /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded bg-muted" })
      ] })
    ] }, row)) }) : isError ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: StickyNote,
        title: "Tasks could not be loaded",
        description: "Check the network or Supabase connection, then reload this page."
      }
    ) : filtered.length === 0 ? /* @__PURE__ */ jsx(
      EmptyState,
      {
        icon: CheckSquare,
        title: search || filterType !== "all" ? "No tasks match the current filters" : "No tasks yet",
        description: search || filterType !== "all" ? "Clear the search or filter state to see more results." : "Create your first task to keep brokerage follow-up standardized.",
        action: !search && filterType === "all" ? /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gap-1.5", onClick: openCreate, children: [
          /* @__PURE__ */ jsx(Plus, { className: "h-3.5 w-3.5" }),
          "Create Task"
        ] }) : void 0
      }
    ) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "divide-y md:hidden", children: filtered.map((task) => {
        const isCompleted = task.id in optimisticCompleted ? optimisticCompleted[task.id] : task.completed;
        const taskType = TASK_TYPES.find((candidate) => candidate.key === task.type);
        return /* @__PURE__ */ jsxs("div", { className: "space-y-3 px-4 py-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: isCompleted,
                onCheckedChange: () => toggleComplete(task),
                "aria-label": `Mark ${task.title} as ${isCompleted ? "incomplete" : "complete"}`,
                className: "mt-0.5"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1 space-y-1", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: cn(
                    "text-sm font-semibold text-foreground",
                    isCompleted && "line-through text-muted-foreground"
                  ),
                  children: task.title
                }
              ),
              /* @__PURE__ */ jsx("div", { className: "text-sm leading-6 text-muted-foreground", children: task.description || "No description" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-3 pl-7 text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Due Date" }),
              /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Assignee" }),
              /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: task.assignee || "Unassigned" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx("div", { className: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground", children: "Type" }),
              /* @__PURE__ */ jsxs(
                "span",
                {
                  className: cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
                    typeBadgeClasses[task.type] || typeBadgeClasses.note
                  ),
                  children: [
                    taskType ? /* @__PURE__ */ jsx(taskType.icon, { className: "h-3 w-3" }) : null,
                    (taskType == null ? void 0 : taskType.label) || task.type
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1.5 pl-7", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "gap-1.5",
                onClick: () => openEdit(task),
                "aria-label": `Edit ${task.title}`,
                children: [
                  /* @__PURE__ */ jsx(Edit, { className: "h-3.5 w-3.5" }),
                  "Edit"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "outline",
                size: "sm",
                className: "gap-1.5 text-destructive hover:text-destructive",
                onClick: () => handleDelete(task.id),
                "aria-label": `Delete ${task.title}`,
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }),
                  "Delete"
                ]
              }
            )
          ] })
        ] }, task.id);
      }) }),
      /* @__PURE__ */ jsx("div", { className: "hidden md:block", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-10" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Task" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Due Date" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Assignee" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Type" }),
          /* @__PURE__ */ jsx(TableHead, { className: "w-28 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filtered.map((task) => {
          const isCompleted = task.id in optimisticCompleted ? optimisticCompleted[task.id] : task.completed;
          const taskType = TASK_TYPES.find((candidate) => candidate.key === task.type);
          return /* @__PURE__ */ jsxs(TableRow, { "data-state": isCompleted ? "selected" : void 0, children: [
            /* @__PURE__ */ jsx(TableCell, { className: "w-10 align-top", children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                checked: isCompleted,
                onCheckedChange: () => toggleComplete(task),
                "aria-label": `Mark ${task.title} as ${isCompleted ? "incomplete" : "complete"}`
              }
            ) }),
            /* @__PURE__ */ jsx(TableCell, { className: "align-top", children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: cn(
                    "text-sm font-semibold text-foreground",
                    isCompleted && "line-through text-muted-foreground"
                  ),
                  children: task.title
                }
              ),
              task.description ? /* @__PURE__ */ jsx("div", { className: "max-w-xl text-sm leading-6 text-muted-foreground", children: task.description }) : /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "No description" })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "align-top text-sm text-muted-foreground", children: task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-" }),
            /* @__PURE__ */ jsx(TableCell, { className: "align-top text-sm text-muted-foreground", children: task.assignee || "Unassigned" }),
            /* @__PURE__ */ jsx(TableCell, { className: "align-top", children: /* @__PURE__ */ jsxs(
              "span",
              {
                className: cn(
                  "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none",
                  typeBadgeClasses[task.type] || typeBadgeClasses.note
                ),
                children: [
                  taskType ? /* @__PURE__ */ jsx(taskType.icon, { className: "h-3 w-3" }) : null,
                  (taskType == null ? void 0 : taskType.label) || task.type
                ]
              }
            ) }),
            /* @__PURE__ */ jsx(TableCell, { className: "align-top", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-1", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8",
                  onClick: () => openEdit(task),
                  "aria-label": `Edit ${task.title}`,
                  children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8 text-destructive hover:text-destructive",
                  onClick: () => handleDelete(task.id),
                  "aria-label": `Delete ${task.title}`,
                  children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                }
              )
            ] }) })
          ] }, task.id);
        }) })
      ] }) })
    ] }) }) }) }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: panelOpen ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        motion.div,
        {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "fixed inset-0 z-40 bg-black/40",
          onClick: () => setPanelOpen(false)
        }
      ),
      /* @__PURE__ */ jsxs(
        motion.aside,
        {
          initial: { x: "100%" },
          animate: { x: 0 },
          exit: { x: "100%" },
          transition: { duration: 0.18, ease: "easeOut" },
          className: "fixed top-0 bottom-16 lg:bottom-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-background shadow-floating",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b px-5 py-4", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold text-foreground", children: editingTask ? "Edit Task" : "New Task" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Define the task type, core details, and due date in one place." })
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-9 w-9",
                  onClick: () => setPanelOpen(false),
                  "aria-label": "Close task panel",
                  children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto p-5", children: /* @__PURE__ */ jsxs("div", { className: "app-form-grid", children: [
              /* @__PURE__ */ jsxs("div", { className: "app-form-field", children: [
                /* @__PURE__ */ jsx(Label, { children: "Task Type" }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: TASK_TYPES.map((taskType) => /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => setNewTaskType(taskType.key),
                    className: cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-standard",
                      newTaskType === taskType.key ? "border-primary bg-primary/5 text-primary" : "border-border bg-background text-foreground hover:bg-muted/50"
                    ),
                    children: [
                      /* @__PURE__ */ jsx(taskType.icon, { className: "h-4 w-4" }),
                      taskType.label
                    ]
                  },
                  taskType.key
                )) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "app-form-field", children: [
                /* @__PURE__ */ jsx(Label, { children: "Title" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    placeholder: "Task title",
                    value: newTaskTitle,
                    onChange: (event) => setNewTaskTitle(event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "app-form-field", children: [
                /* @__PURE__ */ jsx(Label, { children: "Description" }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    placeholder: "Add context, next steps, or handoff details",
                    value: newTaskDescription,
                    onChange: (event) => setNewTaskDescription(event.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "app-form-field", children: [
                /* @__PURE__ */ jsx(Label, { children: "Due Date" }),
                /* @__PURE__ */ jsxs(Popover, { children: [
                  /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-left transition-standard hover:bg-muted/40",
                      children: [
                        /* @__PURE__ */ jsx(Calendar$1, { className: "h-4 w-4 text-muted-foreground" }),
                        /* @__PURE__ */ jsx("span", { className: newTaskDueDate ? "text-foreground" : "text-muted-foreground", children: newTaskDueDate ? format(newTaskDueDate, "MMM d, yyyy") : "Select date" })
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(
                    Calendar,
                    {
                      mode: "single",
                      selected: newTaskDueDate,
                      onSelect: setNewTaskDueDate,
                      initialFocus: true
                    }
                  ) })
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-2 border-t px-5 py-4", children: [
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", onClick: () => setPanelOpen(false), children: "Cancel" }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  onClick: handleSave,
                  disabled: !newTaskTitle.trim() || isSaving,
                  children: isSaving ? "Saving..." : "Save Task"
                }
              )
            ] })
          ]
        }
      )
    ] }) : null })
  ] });
}
export {
  Tasks as default
};
