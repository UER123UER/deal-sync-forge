import { useState } from 'react';
import { Search, Plus, ChevronDown, Upload, Globe, X, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact, ContactRow } from '@/hooks/useContacts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  // Panel state
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactRow | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', company: '', role: '' });

  // Detail panel
  const [detailContact, setDetailContact] = useState<ContactRow | null>(null);

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

  const openCreatePanel = () => {
    setEditingContact(null);
    setForm({ first_name: '', last_name: '', email: '', phone: '', company: '', role: '' });
    setPanelOpen(true);
  };

  const openEditPanel = (contact: ContactRow) => {
    setEditingContact(contact);
    setForm({
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || '',
      phone: contact.phone || '',
      company: contact.company || '',
      role: contact.role || '',
    });
    setPanelOpen(true);
    setDetailContact(null);
  };

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      toast.error('First and last name are required');
      return;
    }
    try {
      if (editingContact) {
        await updateContact.mutateAsync({
          id: editingContact.id,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          role: form.role.trim() || null,
        });
        toast.success('Contact updated');
      } else {
        await createContact.mutateAsync({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim() || null,
          phone: form.phone.trim() || null,
          company: form.company.trim() || null,
          role: form.role.trim() || null,
        });
        toast.success('Contact created');
      }
      setPanelOpen(false);
    } catch {
      toast.error('Failed to save contact');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteContact.mutateAsync(id);
      setDetailContact(null);
      setSelectedContacts((prev) => prev.filter((x) => x !== id));
      toast.success('Contact deleted');
    } catch {
      toast.error('Failed to delete contact');
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedContacts.length;
    try {
      for (const id of selectedContacts) {
        await deleteContact.mutateAsync(id);
      }
      setSelectedContacts([]);
      toast.success(`${count} contact(s) deleted`);
    } catch {
      toast.error('Failed to delete contacts');
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
        {selectedContacts.length > 0 && (
          <Button variant="outline" size="sm" className="text-xs gap-1.5 text-destructive" onClick={handleBulkDelete}>
            <Trash2 className="w-3.5 h-3.5" /> Delete ({selectedContacts.length})
          </Button>
        )}
        <div className="flex-1" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="text-xs gap-1.5">
              <Plus className="w-3.5 h-3.5" /> New Contact <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openCreatePanel}>
              <Plus className="w-3.5 h-3.5 mr-2" /> Add contact manually
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('CSV import coming soon')}>
              <Upload className="w-3.5 h-3.5 mr-2" /> Import CSV Spreadsheet
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Google integration coming soon')}>
              <Globe className="w-3.5 h-3.5 mr-2" /> Google <span className="text-xs text-muted-foreground ml-1">Connect</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info('Microsoft integration coming soon')}>
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
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((contact) => (
                <tr key={contact.id} className="border-b hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setDetailContact(contact)}>
                  <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
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
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditPanel(contact)} className="p-1 hover:bg-muted rounded" title="Edit">
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={() => handleDelete(contact.id)} className="p-1 hover:bg-muted rounded" title="Delete">
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Contact Detail Panel */}
      <AnimatePresence>
        {detailContact && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 z-40" onClick={() => setDetailContact(null)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-[400px] bg-background border-l shadow-xl z-50 flex flex-col">
              <div className="h-14 border-b flex items-center px-4 justify-between flex-shrink-0">
                <h2 className="text-sm font-semibold text-foreground">Contact Details</h2>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEditPanel(detailContact)} className="p-1.5 rounded-md hover:bg-muted"><Edit className="w-4 h-4 text-muted-foreground" /></button>
                  <button onClick={() => setDetailContact(null)} className="p-1.5 rounded-md hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-medium">
                    {detailContact.first_name[0]}{detailContact.last_name[0]}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground">{detailContact.first_name} {detailContact.last_name}</div>
                    {detailContact.role && <div className="text-sm text-muted-foreground">{detailContact.role}</div>}
                  </div>
                </div>
                <div className="space-y-3 pt-2">
                  {detailContact.email && <div><div className="text-xs text-muted-foreground">Email</div><div className="text-sm text-foreground">{detailContact.email}</div></div>}
                  {detailContact.phone && <div><div className="text-xs text-muted-foreground">Phone</div><div className="text-sm text-foreground">{detailContact.phone}</div></div>}
                  {detailContact.company && <div><div className="text-xs text-muted-foreground">Company</div><div className="text-sm text-foreground">{detailContact.company}</div></div>}
                  {detailContact.current_address && <div><div className="text-xs text-muted-foreground">Address</div><div className="text-sm text-foreground">{detailContact.current_address}</div></div>}
                  {(detailContact.tags || []).length > 0 && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Tags</div>
                      <div className="flex gap-1 flex-wrap">{detailContact.tags.map((t) => <span key={t} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>)}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t p-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditPanel(detailContact)}>Edit</Button>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDelete(detailContact.id)}>Delete</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Create/Edit Panel */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 z-40" onClick={() => setPanelOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed right-0 top-0 bottom-0 w-[400px] bg-background border-l shadow-xl z-50 flex flex-col">
              <div className="h-14 border-b flex items-center px-4 justify-between flex-shrink-0">
                <h2 className="text-sm font-semibold text-foreground">{editingContact ? 'Edit Contact' : 'New Contact'}</h2>
                <button onClick={() => setPanelOpen(false)} className="p-1.5 rounded-md hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">First Name *</Label><Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className="mt-1" /></div>
                  <div><Label className="text-xs">Last Name *</Label><Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className="mt-1" /></div>
                </div>
                <div><Label className="text-xs">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">Company</Label><Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="mt-1" /></div>
                <div><Label className="text-xs">Role</Label><Input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="mt-1" /></div>
              </div>
              <div className="border-t p-4 flex justify-end">
                <Button size="sm" onClick={handleSave} disabled={createContact.isPending || updateContact.isPending}>
                  {createContact.isPending || updateContact.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
