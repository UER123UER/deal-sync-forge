import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Building2, CheckSquare, X, Command as CommandIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function QuickAddFab() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const items = [
    { label: 'New deal', icon: Building2, action: () => go('/transactions/new') },
    { label: 'New contact', icon: UserPlus, action: () => go('/people') },
    { label: 'New task', icon: CheckSquare, action: () => go('/tasks') },
    {
      label: 'Search (⌘K)',
      icon: CommandIcon,
      action: () => {
        setOpen(false);
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      },
    },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:bg-transparent"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end gap-2">
        {open &&
          items.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="flex items-center gap-2 rounded-full bg-background border shadow-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-all animate-in fade-in slide-in-from-bottom-2"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close quick add' : 'Open quick add'}
          className={cn(
            'h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95',
            open && 'rotate-45',
          )}
        >
          {open ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>
    </>
  );
}