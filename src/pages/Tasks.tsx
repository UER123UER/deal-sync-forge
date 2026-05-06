import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CheckSquare,
  Edit,
  Phone,
  Plus,
  Search,
  StickyNote,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  EmptyState,
  PageContent,
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
  PageShell,
  PageStack,
  PageToolbar,
  PageToolbarGroup,
} from '@/components/system/page-shell';
import { useCreateTask, useDeleteTask, useTasks, TaskRow, useUpdateTask } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

const TASK_TYPES = [
  { key: 'todo' as const, label: 'Todo', icon: CheckSquare },
  { key: 'call' as const, label: 'Call', icon: Phone },
  { key: 'meeting' as const, label: 'In-Person Meeting', icon: Users },
  { key: 'note' as const, label: 'Note', icon: StickyNote },
];

const typeBadgeClasses: Record<string, string> = {
  todo: 'border-primary/15 bg-primary/10 text-primary',
  call: 'border-warning/15 bg-warning/10 text-warning',
  meeting: 'border-success/15 bg-success/10 text-success',
  note: 'border-border bg-muted text-muted-foreground',
};

export default function Tasks() {
  const { data: tasks = [], isLoading, isError } = useTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskRow | null>(null);
  const [newTaskType, setNewTaskType] = useState<string>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date | undefined>();
  const [optimisticCompleted, setOptimisticCompleted] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = tasks.filter((task) => {
    if (filterType !== 'all' && task.type !== filterType) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(term) ||
      (task.description || '').toLowerCase().includes(term) ||
      (task.assignee || '').toLowerCase().includes(term)
    );
  });

  const openCreate = () => {
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskType('todo');
    setNewTaskDueDate(undefined);
    setPanelOpen(true);
  };

  const openEdit = (task: TaskRow) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description || '');
    setNewTaskType(task.type);
    setNewTaskDueDate(task.due_date ? new Date(task.due_date) : undefined);
    setPanelOpen(true);
  };

  const handleSave = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || undefined,
          type: newTaskType,
          due_date: newTaskDueDate ? newTaskDueDate.toISOString() : null,
        });
        toast.success('Task updated');
      } else {
        await createTask.mutateAsync({
          title: newTaskTitle.trim(),
          description: newTaskDescription.trim() || undefined,
          type: newTaskType,
          due_date: newTaskDueDate ? newTaskDueDate.toISOString() : undefined,
        });
        toast.success('Task created');
      }
      setPanelOpen(false);
    } catch {
      toast.error('Failed to save task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;

    try {
      await deleteTask.mutateAsync(id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const toggleComplete = async (task: TaskRow) => {
    const nextCompleted = !task.completed;
    setOptimisticCompleted((previous) => ({ ...previous, [task.id]: nextCompleted }));

    try {
      await updateTask.mutateAsync({ id: task.id, completed: nextCompleted });
    } catch {
      setOptimisticCompleted((previous) => ({ ...previous, [task.id]: task.completed }));
      toast.error('Failed to update task');
    }
  };

  const isSaving = createTask.isPending || updateTask.isPending;

  return (
    <PageShell>
      <PageHeader>
        <PageHeaderHeading
          title="Tasks"
          meta={`${filtered.length} visible • ${tasks.length} total tasks`}
        />
        <PageHeaderActions>
          <div className="relative w-full max-w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks, descriptions, or assignees"
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </PageHeaderActions>
      </PageHeader>

      <PageToolbar>
        <PageToolbarGroup className="app-segmented">
          <button
            type="button"
            data-state={filterType === 'all' ? 'active' : 'inactive'}
            className="app-segmented-item"
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          {TASK_TYPES.map((taskType) => (
            <button
              key={taskType.key}
              type="button"
              data-state={filterType === taskType.key ? 'active' : 'inactive'}
              className="app-segmented-item inline-flex items-center gap-1.5"
              onClick={() => setFilterType(taskType.key)}
            >
              <taskType.icon className="h-3.5 w-3.5" />
              {taskType.label}
            </button>
          ))}
        </PageToolbarGroup>

        <PageToolbarGroup className="ml-auto">
          <Button size="sm" className="gap-1.5" onClick={openCreate}>
            <Plus className="h-3.5 w-3.5" />
            New Task
          </Button>
        </PageToolbarGroup>
      </PageToolbar>

      <PageContent className="py-4">
        <PageStack className="max-w-none gap-4">
          <section className="app-surface overflow-hidden">
            {isLoading ? (
              <div className="divide-y">
                {[0, 1, 2, 3, 4].map((row) => (
                  <div key={row} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                    <div className="h-4 w-4 rounded bg-muted" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-3.5 w-52 rounded bg-muted" />
                      <div className="h-3 w-32 rounded bg-muted/70" />
                    </div>
                    <div className="h-3.5 w-20 rounded bg-muted" />
                    <div className="h-3.5 w-24 rounded bg-muted" />
                    <div className="h-6 w-16 rounded-full bg-muted" />
                    <div className="flex gap-2">
                      <div className="h-8 w-8 rounded bg-muted" />
                      <div className="h-8 w-8 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isError ? (
              <EmptyState
                icon={StickyNote}
                title="Tasks could not be loaded"
                description="Check the network or Supabase connection, then reload this page."
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={CheckSquare}
                title={search || filterType !== 'all' ? 'No tasks match the current filters' : 'No tasks yet'}
                description={
                  search || filterType !== 'all'
                    ? 'Clear the search or filter state to see more results.'
                    : 'Create your first task to keep brokerage follow-up standardized.'
                }
                action={
                  !search && filterType === 'all' ? (
                    <Button size="sm" className="gap-1.5" onClick={openCreate}>
                      <Plus className="h-3.5 w-3.5" />
                      Create Task
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <div className="divide-y md:hidden">
                  {filtered.map((task) => {
                    const isCompleted =
                      task.id in optimisticCompleted ? optimisticCompleted[task.id] : task.completed;
                    const taskType = TASK_TYPES.find((candidate) => candidate.key === task.type);

                    return (
                      <div key={task.id} className="space-y-3 px-4 py-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={() => toggleComplete(task)}
                            aria-label={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                            className="mt-0.5"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div
                              className={cn(
                                'text-sm font-semibold text-foreground',
                                isCompleted && 'line-through text-muted-foreground',
                              )}
                            >
                              {task.title}
                            </div>
                            <div className="text-sm leading-6 text-muted-foreground">
                              {task.description || 'No description'}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pl-7 text-sm">
                          <div className="space-y-1">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Due Date</div>
                            <div className="text-muted-foreground">{task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '-'}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Assignee</div>
                            <div className="text-muted-foreground">{task.assignee || 'Unassigned'}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Type</div>
                            <span
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
                                typeBadgeClasses[task.type] || typeBadgeClasses.note,
                              )}
                            >
                              {taskType ? <taskType.icon className="h-3 w-3" /> : null}
                              {taskType?.label || task.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-end gap-1.5 pl-7">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => openEdit(task)}
                            aria-label={`Edit ${task.title}`}
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(task.id)}
                            aria-label={`Delete ${task.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10" />
                        <TableHead>Task</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Assignee</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="w-28 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((task) => {
                        const isCompleted =
                          task.id in optimisticCompleted ? optimisticCompleted[task.id] : task.completed;
                        const taskType = TASK_TYPES.find((candidate) => candidate.key === task.type);

                        return (
                          <TableRow key={task.id} data-state={isCompleted ? 'selected' : undefined}>
                            <TableCell className="w-10 align-top">
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => toggleComplete(task)}
                                aria-label={`Mark ${task.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
                              />
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="space-y-1">
                                <div
                                  className={cn(
                                    'text-sm font-semibold text-foreground',
                                    isCompleted && 'line-through text-muted-foreground',
                                  )}
                                >
                                  {task.title}
                                </div>
                                {task.description ? (
                                  <div className="max-w-xl text-sm leading-6 text-muted-foreground">
                                    {task.description}
                                  </div>
                                ) : (
                                  <div className="text-sm text-muted-foreground">No description</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="align-top text-sm text-muted-foreground">
                              {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell className="align-top text-sm text-muted-foreground">
                              {task.assignee || 'Unassigned'}
                            </TableCell>
                            <TableCell className="align-top">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold leading-none',
                                  typeBadgeClasses[task.type] || typeBadgeClasses.note,
                                )}
                              >
                                {taskType ? <taskType.icon className="h-3 w-3" /> : null}
                                {taskType?.label || task.type}
                              </span>
                            </TableCell>
                            <TableCell className="align-top">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEdit(task)}
                                  aria-label={`Edit ${task.title}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => handleDelete(task.id)}
                                  aria-label={`Delete ${task.title}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </section>
        </PageStack>
      </PageContent>

      <AnimatePresence>
        {panelOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40"
              onClick={() => setPanelOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="fixed top-0 bottom-16 lg:bottom-0 right-0 z-50 flex w-full max-w-xl flex-col border-l bg-background shadow-floating"
            >
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="text-base font-semibold text-foreground">
                    {editingTask ? 'Edit Task' : 'New Task'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Define the task type, core details, and due date in one place.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Close task panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-5">
                <div className="app-form-grid">
                  <div className="app-form-field">
                    <Label>Task Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {TASK_TYPES.map((taskType) => (
                        <button
                          key={taskType.key}
                          type="button"
                          onClick={() => setNewTaskType(taskType.key)}
                          className={cn(
                            'flex items-center gap-2 rounded-lg border px-3 py-3 text-left text-sm font-medium transition-standard',
                            newTaskType === taskType.key
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-border bg-background text-foreground hover:bg-muted/50',
                          )}
                        >
                          <taskType.icon className="h-4 w-4" />
                          {taskType.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="app-form-field">
                    <Label>Title</Label>
                    <Input
                      placeholder="Task title"
                      value={newTaskTitle}
                      onChange={(event) => setNewTaskTitle(event.target.value)}
                    />
                  </div>

                  <div className="app-form-field">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Add context, next steps, or handoff details"
                      value={newTaskDescription}
                      onChange={(event) => setNewTaskDescription(event.target.value)}
                    />
                  </div>

                  <div className="app-form-field">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm text-left transition-standard hover:bg-muted/40"
                        >
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className={newTaskDueDate ? 'text-foreground' : 'text-muted-foreground'}>
                            {newTaskDueDate ? format(newTaskDueDate, 'MMM d, yyyy') : 'Select date'}
                          </span>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={newTaskDueDate}
                          onSelect={setNewTaskDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t px-5 py-4">
                <Button variant="outline" size="sm" onClick={() => setPanelOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!newTaskTitle.trim() || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Task'}
                </Button>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </PageShell>
  );
}
