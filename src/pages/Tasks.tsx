import { useState } from 'react';
import { Search, Plus, ChevronDown, X, CheckSquare, Phone, Users, StickyNote, MoreHorizontal, Calendar, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, TaskRow } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { toast } from 'sonner';

const TASK_TYPES = [
  { key: 'todo' as const, label: 'Todo', icon: CheckSquare },
  { key: 'call' as const, label: 'Call', icon: Phone },
  { key: 'meeting' as const, label: 'In-Person Meeting', icon: Users },
  { key: 'note' as const, label: 'Note', icon: StickyNote },
];

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
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
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  // Filters
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = tasks.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (!search) return true;
    const term = search.toLowerCase();
    return t.title.toLowerCase().includes(term) || (t.description || '').toLowerCase().includes(term);
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
    try {
      await deleteTask.mutateAsync(id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const toggleComplete = (taskId: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold text-foreground">Tasks</h1>
        <div className="flex-1" />
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-2">
        <Button variant={filterType === 'all' ? 'default' : 'outline'} size="sm" className="text-xs" onClick={() => setFilterType('all')}>
          All
        </Button>
        {TASK_TYPES.map((t) => (
          <Button key={t.key} variant={filterType === t.key ? 'default' : 'outline'} size="sm" className="text-xs gap-1" onClick={() => setFilterType(t.key)}>
            <t.icon className="w-3 h-3" /> {t.label}
          </Button>
        ))}
        <div className="flex-1" />
        <Button size="sm" className="text-xs gap-1.5" onClick={openCreate}>
          <Plus className="w-3.5 h-3.5" /> New Task
        </Button>
      </div>

      {/* Table header */}
      <div className="border-b">
        <div className="flex px-6 py-3">
          <span className="w-8" />
          <span className="text-xs font-medium text-muted-foreground flex-1">Task</span>
          <span className="text-xs font-medium text-muted-foreground w-48">Assignee</span>
          <span className="text-xs font-medium text-muted-foreground w-32">Due Date</span>
          <span className="text-xs font-medium text-muted-foreground w-32">Type</span>
          <span className="text-xs font-medium text-muted-foreground w-20">Actions</span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CheckSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Click the Add Task button to create a new task.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {filtered.map((task) => {
            const isComplete = completedTasks.has(task.id);
            return (
              <div key={task.id} className={cn('flex items-center px-6 py-3 border-b hover:bg-muted/50', isComplete && 'opacity-50')}>
                <div className="w-8">
                  <Checkbox checked={isComplete} onCheckedChange={() => toggleComplete(task.id)} />
                </div>
                <div className="flex-1">
                  <p className={cn('text-sm text-foreground', isComplete && 'line-through')}>{task.title}</p>
                  {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                </div>
                <div className="w-48 text-sm text-muted-foreground">{task.assignee || '—'}</div>
                <div className="w-32 text-sm text-muted-foreground">
                  {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '—'}
                </div>
                <div className="w-32">
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">{task.type}</span>
                </div>
                <div className="w-20 flex items-center gap-1">
                  <button onClick={() => openEdit(task)} className="p-1 hover:bg-muted rounded"><Edit className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => handleDelete(task.id)} className="p-1 hover:bg-muted rounded"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New/Edit Task Slide-over */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 z-40"
              onClick={() => setPanelOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[420px] bg-background border-l shadow-xl z-50 flex flex-col"
            >
              <div className="h-14 border-b flex items-center px-4 justify-between flex-shrink-0">
                <h2 className="text-sm font-semibold text-foreground">{editingTask ? 'Edit Task' : 'New Task'}</h2>
                <button onClick={() => setPanelOpen(false)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Type Tabs */}
              <div className="px-4 pt-4 pb-2 flex gap-1 flex-wrap">
                {TASK_TYPES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setNewTaskType(t.key)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
                      newTaskType === t.key
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:bg-muted'
                    )}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Body */}
              <div className="flex-1 overflow-auto p-4 space-y-4">
                <div>
                  <Input
                    placeholder="Task title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <Input
                    placeholder="Add description (optional)"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="text-sm"
                  />
                </div>

                <div>
                  <Label className="text-xs">Due Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2 text-sm cursor-pointer hover:bg-muted/50">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className={newTaskDueDate ? 'text-foreground' : 'text-muted-foreground'}>
                          {newTaskDueDate ? format(newTaskDueDate, 'MMM d, yyyy') : 'Select date'}
                        </span>
                      </div>
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

              {/* Footer */}
              <div className="border-t p-4 flex items-center justify-end flex-shrink-0">
                <Button size="sm" disabled={!newTaskTitle.trim() || createTask.isPending || updateTask.isPending} onClick={handleSave}>
                  {createTask.isPending || updateTask.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
