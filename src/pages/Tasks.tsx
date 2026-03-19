import { useState } from 'react';
import { Search, Plus, ChevronDown, X, CheckSquare, Phone, Users, StickyNote, MoreHorizontal, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'todo' | 'call' | 'meeting' | 'note';
  contacts: string[];
  dueDate: string;
  endDate: string;
  assignee: string;
}

const TASK_TYPES = [
  { key: 'todo' as const, label: 'Todo', icon: CheckSquare },
  { key: 'call' as const, label: 'Call', icon: Phone },
  { key: 'meeting' as const, label: 'In-Person Meeting', icon: Users },
  { key: 'note' as const, label: 'Note', icon: StickyNote },
];

export default function Tasks() {
  const [tasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [newTaskType, setNewTaskType] = useState<Task['type']>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');

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
        <Button variant="outline" size="sm" className="text-xs gap-1">
          Assignee <ChevronDown className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          Status <ChevronDown className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          Type <ChevronDown className="w-3 h-3" />
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1">
          Date Range <ChevronDown className="w-3 h-3" />
        </Button>
        <div className="flex-1" />
        <Button size="sm" className="text-xs gap-1.5" onClick={() => setPanelOpen(true)}>
          <Plus className="w-3.5 h-3.5" /> New Task
        </Button>
      </div>

      {/* Table header */}
      <div className="border-b">
        <div className="flex px-6 py-3">
          <span className="text-xs font-medium text-muted-foreground flex-1">Task</span>
          <span className="text-xs font-medium text-muted-foreground w-48">Contacts</span>
          <span className="text-xs font-medium text-muted-foreground w-32">Due Date</span>
          <span className="text-xs font-medium text-muted-foreground w-32">End Date</span>
        </div>
      </div>

      {/* Content */}
      {tasks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <CheckSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Click the Add Task button to create a new task.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center px-6 py-3 border-b hover:bg-muted/50">
              <div className="flex-1">
                <p className="text-sm text-foreground">{task.title}</p>
                {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
              </div>
              <div className="w-48 text-sm text-muted-foreground">{task.contacts.join(', ')}</div>
              <div className="w-32 text-sm text-muted-foreground">{task.dueDate}</div>
              <div className="w-32 text-sm text-muted-foreground">{task.endDate}</div>
            </div>
          ))}
        </div>
      )}

      {/* New Task Slide-over */}
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
              {/* Header */}
              <div className="h-14 border-b flex items-center px-4 justify-between flex-shrink-0">
                <h2 className="text-sm font-semibold text-foreground">New Task</h2>
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
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border text-muted-foreground hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                  More
                </button>
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

                <button className="text-sm text-primary hover:underline">+ Add Description</button>

                <div>
                  <Label className="text-xs">Due Date</Label>
                  <div className="mt-1 flex items-center gap-2 border rounded-md px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50">
                    <Calendar className="w-4 h-4" />
                    Select date
                  </div>
                </div>

                <div className="space-y-2">
                  <button className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Attach Client
                  </button>
                  <button className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Attach Property
                  </button>
                  <button className="text-sm text-primary hover:underline flex items-center gap-1">
                    <Plus className="w-3 h-3" /> Attach Deal
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-4 flex items-center justify-between flex-shrink-0">
                <button className="text-sm text-primary hover:underline flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                    KB
                  </div>
                  Add Assignee
                </button>
                <Button size="sm" disabled={!newTaskTitle.trim()}>Save</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
