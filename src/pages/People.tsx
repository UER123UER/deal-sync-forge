import { useState } from 'react';
import { Search, Plus, ChevronDown, Upload, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useContacts, ContactRow } from '@/hooks/useContacts';
import { format } from 'date-fns';

const FILTERS = ['All Contacts', 'Leads', 'Tags', 'Parked Contacts', 'Assignee', 'Flow', 'More'] as const;

function formatDate(date: string | null): string {
  if (!date) return '—';
  try {
    return format(new Date(date), 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export default function People() {
  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const { data: contacts = [], isLoading } = useContacts();

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.first_name.toLowerCase().includes(term) ||
      c.last_name.toLowerCase().includes(term) ||
      (c.email || '').toLowerCase().includes(term) ||
      (c.phone || '').includes(term)
    );
  });

  const toggleSelect = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedContacts.length === filtered.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filtered.map((c) => c.id));
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold text-foreground">People</h1>
        <span className="text-sm text-muted-foreground">{contacts.length.toLocaleString()} Contacts</span>
        <div className="flex-1" />
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="px-6 pt-4 pb-2 flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <Button key={f} variant="outline" size="sm" className="text-xs gap-1">
            {f} {f !== 'More' && <ChevronDown className="w-3 h-3" />}
          </Button>
        ))}
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="text-xs gap-1.5">
          Lead Routing
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Contact <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Plus className="w-3.5 h-3.5 mr-2" /> Add contact manually
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Upload className="w-3.5 h-3.5 mr-2" /> Import CSV Spreadsheet
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Globe className="w-3.5 h-3.5 mr-2" /> Google <span className="text-xs text-muted-foreground ml-1">Connect</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Globe className="w-3.5 h-3.5 mr-2" /> Microsoft <span className="text-xs text-muted-foreground ml-1">Connect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground text-sm">Loading contacts...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3 w-8">
                  <input
                    type="checkbox"
                    checked={selectedContacts.length === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-input"
                  />
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Contact</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Phone</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tags</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Last Touch</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Next Touch</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr key={contact.id} className="border-b hover:bg-muted/50 cursor-pointer transition-colors">
                  <td className="px-6 py-3">
                    <input
                      type="checkbox"
                      checked={selectedContacts.includes(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="rounded border-input"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {contact.first_name[0]}{contact.last_name[0]}
                      </div>
                      <span className="text-sm font-medium text-foreground">{contact.first_name} {contact.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{contact.email || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{contact.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {(contact.tags || []).map((tag) => (
                        <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(contact.last_touch)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(contact.next_touch)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
