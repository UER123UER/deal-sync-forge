import { useState } from 'react';
import { Search, Plus, ChevronDown, Upload, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ContactRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tags: string[];
  lastTouch: string;
  nextTouch: string;
}

const MOCK_CONTACTS: ContactRow[] = [
  { id: '1', firstName: 'John', lastName: 'Smith', email: 'john.smith@email.com', phone: '(555) 123-4567', tags: ['Buyer', 'VIP'], lastTouch: 'Mar 15, 2026', nextTouch: 'Mar 22, 2026' },
  { id: '2', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@email.com', phone: '(555) 234-5678', tags: ['Seller'], lastTouch: 'Mar 14, 2026', nextTouch: 'Mar 20, 2026' },
  { id: '3', firstName: 'Michael', lastName: 'Williams', email: 'mwilliams@email.com', phone: '(555) 345-6789', tags: ['Lead'], lastTouch: 'Mar 12, 2026', nextTouch: '—' },
  { id: '4', firstName: 'Emily', lastName: 'Brown', email: 'emily.brown@email.com', phone: '(555) 456-7890', tags: ['Buyer', 'Referral'], lastTouch: 'Mar 10, 2026', nextTouch: 'Mar 25, 2026' },
  { id: '5', firstName: 'David', lastName: 'Garcia', email: 'dgarcia@email.com', phone: '(555) 567-8901', tags: ['Investor'], lastTouch: 'Mar 8, 2026', nextTouch: 'Apr 1, 2026' },
  { id: '6', firstName: 'Jennifer', lastName: 'Martinez', email: 'jen.martinez@email.com', phone: '(555) 678-9012', tags: ['Seller', 'Past Client'], lastTouch: 'Mar 5, 2026', nextTouch: '—' },
  { id: '7', firstName: 'Robert', lastName: 'Anderson', email: 'randerson@email.com', phone: '(555) 789-0123', tags: ['Lead'], lastTouch: 'Mar 3, 2026', nextTouch: 'Mar 19, 2026' },
  { id: '8', firstName: 'Lisa', lastName: 'Thomas', email: 'lisa.t@email.com', phone: '(555) 890-1234', tags: ['Buyer'], lastTouch: 'Feb 28, 2026', nextTouch: '—' },
  { id: '9', firstName: 'James', lastName: 'Jackson', email: 'jjackson@email.com', phone: '(555) 901-2345', tags: ['Investor', 'VIP'], lastTouch: 'Feb 25, 2026', nextTouch: 'Mar 28, 2026' },
  { id: '10', firstName: 'Maria', lastName: 'White', email: 'mwhite@email.com', phone: '(555) 012-3456', tags: ['Referral'], lastTouch: 'Feb 20, 2026', nextTouch: '—' },
  { id: '11', firstName: 'William', lastName: 'Harris', email: 'wharris@email.com', phone: '(555) 111-2222', tags: ['Lead', 'Buyer'], lastTouch: 'Feb 18, 2026', nextTouch: 'Mar 30, 2026' },
  { id: '12', firstName: 'Patricia', lastName: 'Clark', email: 'pclark@email.com', phone: '(555) 333-4444', tags: ['Seller'], lastTouch: 'Feb 15, 2026', nextTouch: '—' },
  { id: '13', firstName: 'Richard', lastName: 'Lewis', email: 'rlewis@email.com', phone: '(555) 555-6666', tags: ['Past Client'], lastTouch: 'Feb 10, 2026', nextTouch: '—' },
  { id: '14', firstName: 'Susan', lastName: 'Robinson', email: 'srobinson@email.com', phone: '(555) 777-8888', tags: ['Buyer', 'Lead'], lastTouch: 'Feb 5, 2026', nextTouch: 'Apr 5, 2026' },
  { id: '15', firstName: 'Charles', lastName: 'Walker', email: 'cwalker@email.com', phone: '(555) 999-0000', tags: ['Investor'], lastTouch: 'Jan 30, 2026', nextTouch: '—' },
];

const FILTERS = ['All Contacts', 'Leads', 'Tags', 'Parked Contacts', 'Assignee', 'Flow', 'More'] as const;

export default function People() {
  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const filtered = MOCK_CONTACTS.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.phone.includes(term)
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
        <span className="text-sm text-muted-foreground">{MOCK_CONTACTS.length.toLocaleString()} Contacts</span>
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
                      {contact.firstName[0]}{contact.lastName[0]}
                    </div>
                    <span className="text-sm font-medium text-foreground">{contact.firstName} {contact.lastName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{contact.email}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{contact.phone}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {contact.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{contact.lastTouch}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{contact.nextTouch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
