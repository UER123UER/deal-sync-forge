import { useState, useRef } from 'react';
import { Search, Plus, ChevronDown, Upload, Globe, X, Trash2, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact, ContactRow } from '@/hooks/useContacts';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Papa from 'papaparse';

function formatDate(date: string | null): string {
  if (!date) return '—';
  try { return format(new Date(date), 'MMM d, yyyy'); }
  catch { return '—'; }
}

const CONTACT_ROLES = [
  'Buyer', 'Buyer Agent', 'Seller', 'Seller Broker', 'Title',
  'Buyer Broker', 'Co Buyer Agent', 'Buyer Power Of Attorney',
  'Buyer Lawyer', 'Buyer Referral', 'Co Seller Agent',
  'Seller Power Of Attorney', 'Seller Lawyer', 'Seller Referral', 'Lender',
  'Agent', 'Broker', 'Other',
];

export default function People() {
  const [search, setSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const { data: contacts = [], isLoading } = useContacts();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactRow | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', company: '', role: '' });
  const [detailContact, setDetailContact] = useState<ContactRow | null>(null);

  // CSV import
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);

  // Setup dialogs
  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [microsoftDialogOpen, setMicrosoftDialogOpen] = useState(false);

  const filtered = contacts.filter((c) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return c.first_name.toLowerCase().includes(term) || c.last_name.toLowerCase().includes(term) || (c.email || '').toLowerCase().includes(term) || (c.phone || '').includes(term);
  });

  const toggleSelect = (id: string) => setSelectedContacts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => { if (selectedContacts.length === filtered.length) setSelectedContacts([]); else setSelectedContacts(filtered.map((c) => c.id)); };

  const openCreatePanel = () => { setEditingContact(null); setForm({ first_name: '', last_name: '', email: '', phone: '', company: '', role: '' }); setPanelOpen(true); };
  const openEditPanel = (contact: ContactRow) => { setEditingContact(contact); setForm({ first_name: contact.first_name, last_name: contact.last_name, email: contact.email || '', phone: contact.phone || '', company: contact.company || '', role: contact.role || '' }); setPanelOpen(true); setDetailContact(null); };

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) { toast.error('First and last name are required'); return; }
    try {
      if (editingContact) {
        await updateContact.mutateAsync({ id: editingContact.id, first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, company: form.company.trim() || null, role: form.role.trim() || null });
        toast.success('Contact updated');
      } else {
        await createContact.mutateAsync({ first_name: form.first_name.trim(), last_name: form.last_name.trim(), email: form.email.trim() || null, phone: form.phone.trim() || null, company: form.company.trim() || null, role: form.role.trim() || null });
        toast.success('Contact created');
      }
      setPanelOpen(false);
    } catch { toast.error('Failed to save contact'); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteContact.mutateAsync(id); setDetailContact(null); setSelectedContacts((prev) => prev.filter((x) => x !== id)); toast.success('Contact deleted'); }
    catch { toast.error('Failed to delete contact'); }
  };

  const handleBulkDelete = async () => {
    const count = selectedContacts.length;
    try { for (const id of selectedContacts) await deleteContact.mutateAsync(id); setSelectedContacts([]); toast.success(`${count} contact(s) deleted`); }
    catch { toast.error('Failed to delete contacts'); }
  };

  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvPreview(results.data as Record<string, string>[]);
        setCsvDialogOpen(true);
      },
      error: () => toast.error('Failed to parse CSV'),
    });
    if (csvInputRef.current) csvInputRef.current.value = '';
  };

  const handleCsvImport = async () => {
    let imported = 0;
    for (const row of csvPreview) {
      const firstName = row['first_name'] || row['First Name'] || row['firstName'] || '';
      const lastName = row['last_name'] || row['Last Name'] || row['lastName'] || '';
      if (!firstName.trim() || !lastName.trim()) continue;
      try {
        await createContact.mutateAsync({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: (row['email'] || row['Email'] || '').trim() || null,
          phone: (row['phone'] || row['Phone'] || '').trim() || null,
          company: (row['company'] || row['Company'] || '').trim() || null,
          role: (row['role'] || row['Role'] || '').trim() || null,
        });
        imported++;
      } catch { /* skip failed rows */ }
    }
    toast.success(`${imported} contact(s) imported`);
    setCsvDialogOpen(false);
    setCsvPreview([]);
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-14 border-b flex items-center px-6 gap-4">
        <h1 className="text-lg font-semibold text-foreground">People</h1>
        <span className="text-sm text-muted-foreground">{contacts.length.toLocaleString()} Contacts</span>
        <div className="flex-1" />
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="px-6 pt-4 pb-2 flex items-center gap-2 flex-wrap">
        {selectedContacts.length > 0 && (
          <Button variant="outline" size="sm" className="text-xs gap-1.5 text-destructive" onClick={handleBulkDelete}><Trash2 className="w-3.5 h-3.5" /> Delete ({selectedContacts.length})</Button>
        )}
        <div className="flex-1" />
        <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvFile} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="text-xs gap-1.5"><Plus className="w-3.5 h-3.5" /> New Contact <ChevronDown className="w-3 h-3" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openCreatePanel}><Plus className="w-3.5 h-3.5 mr-2" /> Add contact manually</DropdownMenuItem>
            <DropdownMenuItem onClick={() => csvInputRef.current?.click()}><Upload className="w-3.5 h-3.5 mr-2" /> Import CSV Spreadsheet</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setGoogleDialogOpen(true)}><Globe className="w-3.5 h-3.5 mr-2" /> Google <span className="text-xs text-muted-foreground ml-1">Connect</span></DropdownMenuItem>
            <DropdownMenuItem onClick={() => setMicrosoftDialogOpen(true)}><Globe className="w-3.5 h-3.5 mr-2" /> Microsoft <span className="text-xs text-muted-foreground ml-1">Connect</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12"><p className="text-muted-foreground text-sm">Loading contacts...</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3 w-8"><input type="checkbox" checked={selectedContacts.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded border-input" /></th>
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
                  <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedContacts.includes(contact.id)} onChange={() => toggleSelect(contact.id)} className="rounded border-input" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">{contact.first_name[0]}{contact.last_name[0]}</div>
                      <span className="text-sm font-medium text-foreground">{contact.first_name} {contact.last_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{contact.email || '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{contact.phone || '—'}</td>
                  <td className="px-4 py-3"><div className="flex gap-1 flex-wrap">{(contact.tags || []).map((tag) => <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tag}</span>)}</div></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(contact.last_touch)}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditPanel(contact)} className="p-1 hover:bg-muted rounded" title="Edit"><Edit className="w-3.5 h-3.5 text-muted-foreground" /></button>
                      <button onClick={() => handleDelete(contact.id)} className="p-1 hover:bg-muted rounded" title="Delete"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
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
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-medium">{detailContact.first_name[0]}{detailContact.last_name[0]}</div>
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
                    <div><div className="text-xs text-muted-foreground mb-1">Tags</div><div className="flex gap-1 flex-wrap">{detailContact.tags.map((t) => <span key={t} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>)}</div></div>
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
                <Button size="sm" onClick={handleSave} disabled={createContact.isPending || updateContact.isPending}>{createContact.isPending || updateContact.isPending ? 'Saving...' : 'Save'}</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CSV Import Preview Dialog */}
      <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Import CSV — Preview ({csvPreview.length} rows)</DialogTitle></DialogHeader>
          <div className="max-h-64 overflow-auto border rounded-md">
            <table className="w-full text-xs">
              <thead><tr className="border-b bg-muted">{csvPreview[0] && Object.keys(csvPreview[0]).slice(0, 6).map((k) => <th key={k} className="px-2 py-1.5 text-left font-medium text-muted-foreground">{k}</th>)}</tr></thead>
              <tbody>{csvPreview.slice(0, 10).map((row, i) => <tr key={i} className="border-b">{Object.values(row).slice(0, 6).map((v, j) => <td key={j} className="px-2 py-1.5 text-foreground">{v}</td>)}</tr>)}</tbody>
            </table>
          </div>
          {csvPreview.length > 10 && <p className="text-xs text-muted-foreground">Showing first 10 of {csvPreview.length} rows.</p>}
          <p className="text-xs text-muted-foreground">Expected columns: first_name, last_name, email, phone, company, role</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCsvDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCsvImport} disabled={createContact.isPending}>Import {csvPreview.length} Contacts</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Google Setup Dialog */}
      <Dialog open={googleDialogOpen} onOpenChange={setGoogleDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Google Contacts Integration</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>To sync contacts from Google, you need to set up Google OAuth in your Supabase project:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener" className="text-primary underline">Google Cloud Console</a></li>
              <li>Create OAuth 2.0 credentials</li>
              <li>Enable the People API</li>
              <li>Add the credentials to your <a href="https://supabase.com/dashboard/project/dwhlgnlpkrychygodwdw/auth/providers" target="_blank" rel="noopener" className="text-primary underline">Supabase Auth Providers</a></li>
            </ol>
          </div>
          <Button variant="outline" onClick={() => setGoogleDialogOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>

      {/* Microsoft Setup Dialog */}
      <Dialog open={microsoftDialogOpen} onOpenChange={setMicrosoftDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Microsoft Contacts Integration</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>To sync contacts from Microsoft, you need to set up Azure AD OAuth:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Go to <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps" target="_blank" rel="noopener" className="text-primary underline">Azure App Registrations</a></li>
              <li>Register a new application</li>
              <li>Add Microsoft Graph Contacts.Read permission</li>
              <li>Add the credentials to your <a href="https://supabase.com/dashboard/project/dwhlgnlpkrychygodwdw/auth/providers" target="_blank" rel="noopener" className="text-primary underline">Supabase Auth Providers</a></li>
            </ol>
          </div>
          <Button variant="outline" onClick={() => setMicrosoftDialogOpen(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
