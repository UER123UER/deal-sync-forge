import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Users,
  CheckSquare,
  Calendar,
  Inbox,
  DollarSign,
  Building2,
  Plus,
  UserPlus,
  FileText,
} from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { useDeals } from '@/hooks/useDeals';
import { useTasks } from '@/hooks/useTasks';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { data: contacts = [] } = useContacts();
  const { data: deals = [] } = useDeals();
  const { data: tasks = [] } = useTasks();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search contacts, deals, tasks, or jump to a page..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go('/transactions/new')}>
            <Plus className="mr-2 h-4 w-4" /> New deal
          </CommandItem>
          <CommandItem onSelect={() => go('/people')}>
            <UserPlus className="mr-2 h-4 w-4" /> New contact
          </CommandItem>
          <CommandItem onSelect={() => go('/tasks')}>
            <CheckSquare className="mr-2 h-4 w-4" /> New task
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go('/transactions')}>
            <Home className="mr-2 h-4 w-4" /> Transactions
          </CommandItem>
          <CommandItem onSelect={() => go('/people')}>
            <Users className="mr-2 h-4 w-4" /> People (CRM)
          </CommandItem>
          <CommandItem onSelect={() => go('/tasks')}>
            <CheckSquare className="mr-2 h-4 w-4" /> Tasks
          </CommandItem>
          <CommandItem onSelect={() => go('/calendar')}>
            <Calendar className="mr-2 h-4 w-4" /> Calendar
          </CommandItem>
          <CommandItem onSelect={() => go('/inbox')}>
            <Inbox className="mr-2 h-4 w-4" /> Inbox
          </CommandItem>
          <CommandItem onSelect={() => go('/finances')}>
            <DollarSign className="mr-2 h-4 w-4" /> Finances
          </CommandItem>
          <CommandItem onSelect={() => go('/listings')}>
            <Building2 className="mr-2 h-4 w-4" /> Listings
          </CommandItem>
        </CommandGroup>

        {contacts.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Contacts">
              {contacts.slice(0, 8).map((c) => (
                <CommandItem
                  key={c.id}
                  value={`contact ${c.first_name} ${c.last_name} ${c.email ?? ''} ${c.phone ?? ''}`}
                  onSelect={() => go('/people')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <span>{c.first_name} {c.last_name}</span>
                  {c.email && <span className="ml-2 text-xs text-muted-foreground">{c.email}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {deals.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Deals">
              {deals.slice(0, 8).map((d) => (
                <CommandItem
                  key={d.id}
                  value={`deal ${d.address} ${d.city} ${d.mls_number ?? ''}`}
                  onSelect={() => go(`/transactions/${d.id}`)}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>{d.address}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{d.city}, {d.state}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {tasks.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Tasks">
              {tasks.slice(0, 6).map((t) => (
                <CommandItem
                  key={t.id}
                  value={`task ${t.title} ${t.description ?? ''}`}
                  onSelect={() => go('/tasks')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{t.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}