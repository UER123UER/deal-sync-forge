import { useState, useRef, useMemo } from 'react';
import {
  Search, Plus, ChevronDown, Upload, X, Trash2, Edit, Download,
  Phone, Mail, MapPin, Tag, Calendar, Clock, Users, TrendingUp,
  Star, MoreHorizontal, StickyNote, Building2, Filter, LayoutGrid, List,
  CheckCircle2, Circle, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useContacts, useCreateContact, useUpdateContact, useDeleteContact, ContactRow } from '@/hooks/useContacts';
import { useDeals } from '@/hooks/useDeals';
import { format, isToday, isTomorrow, isPast, parseISO, differenceInDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { ScrollArea } from '@/components/ui/scroll-area';

// ── Constants ────────────────────────────────────────────────────────────────

const CONTACT_ROLES = [
  'Buyer', 'Buyer Agent', 'Seller', 'Seller Broker', 'Title',
  'Buyer Broker', 'Co Buyer Agent', 'Buyer Power Of Attorney',
  'Buyer Lawyer', 'Buyer Referral', 'Co Seller Agent',
  'Seller Power Of Attorney', 'Seller Lawyer', 'Seller Referral', 'Lender',
  'Agent', 'Broker', 'Lead', 'Past Client', 'Other',
];

// CRM pipeline stages — stored as tags
const PIPELINE_STAGES = [
  { id: 'lead',       label: 'Lead',        color: 'bg-amber-100 text-amber-800 border-amber-200',    dot: 'bg-amber-400' },
  { id: 'prospect',  label: 'Prospect',    color: 'bg-blue-100 text-blue-800 border-blue-200',       dot: 'bg-blue-400' },
  { id: 'active',    label: 'Active',      color: 'bg-emerald-100 text-emerald-800 border-emerald-200', dot: 'bg-emerald-400' },
  { id: 'closing',   label: 'Closing',     color: 'bg-purple-100 text-purple-800 border-purple-200', dot: 'bg-purple-400' },
  { id: 'closed',    label: 'Closed',      color: 'bg-slate-100 text-slate-600 border-slate-200',    dot: 'bg-slate-400' },
  { id: 'nurture',   label: 'Nurture',     color: 'bg-rose-100 text-rose-800 border-rose-200',       dot: 'bg-rose-400' },
] as const;

type StageId = (typeof PIPELINE_STAGES)[number]['id'];

const PRIORITY_TAGS = ['Hot', 'Warm', 'Cold', 'VIP'];

function getStage(contact: ContactRow): StageId | null {
  const tags = contact.tags || [];
  for (const s of PIPELINE_STAGES) {
    if (tags.some((t) => t.toLowerCase() === s.id)) return s.id;
  }
  return null;
}

function getInitials(c: ContactRow) {
  return `${c.first_name[0] ?? ''}${c.last_name[0] ?? ''}`.toUpperCase();
}

function formatDate(date: string | null): string {
  if (!date) return '—';
  try { return format(parseISO(date), 'MMM d, yyyy'); }
  catch { return '—'; }
}

function nextTouchStatus(date: string | null): { label: string; color: string } | null {
  if (!date) return null;
  try {
    const d = parseISO(date);
    if (isToday(d)) return { label: 'Today', color: 'text-emerald-600 font-semibold' };
    if (isTomorrow(d)) return { label: 'Tomorrow', color: 'text-blue-600 font-semibold' };
    if (isPast(d)) return { label: `${Math.abs(differenceInDays(d, new Date()))}d overdue`, color: 'text-destructive font-semibold' };
    const days = differenceInDays(d, new Date());
    if (days <= 7) return { label: `In ${days}d`, color: 'text-amber-600 font-semibold' };
    return { label: format(d, 'MMM d'), color: 'text-muted-foreground' };
  } catch { return null; }
}

// Avatar color palette (deterministic by id)
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-cyan-500', 'bg-pink-500', 'bg-indigo-500',
];
function avatarColor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ contact, size = 'md' }: { contact: ContactRow; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-[10px]' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-9 h-9 text-xs';
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white shrink-0', sz, avatarColor(contact.id))}>
      {getInitials(contact)}
    </div>
  );
}

function StageBadge({ stageId }: { stageId: StageId | null }) {
  if (!stageId) return null;
  const stage = PIPELINE_STAGES.find((s) => s.id === stageId);
  if (!stage) return null;
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', stage.color)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', stage.dot)} />
      {stage.label}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function People() {
  const { data: contacts = [], isLoading } = useContacts();
  const { data: deals = [] } = useDeals();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  // View state
  const [view, setView] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'last_touch' | 'next_touch' | 'created'>('created');

  // Panel state
  const [panelContact, setPanelContact] = useState<ContactRow | null>(null);
  const [panelMode, setPanelMode] = useState<'detail' | 'edit' | 'new'>('detail');
  const [noteInput, setNoteInput] = useState('');

  // Form state
  const emptyForm = { first_name: '', last_name: '', email: '', phone: '', company: '', role: '', current_address: '', tags: [] as string[], last_touch: '', next_touch: '' };
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState('');

  // CSV
  const csvInputRef = useRef<HTMLInputElement>(null);
  const [csvPreview, setCsvPreview] = useState<Record<string, string>[]>([]);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);

  // ── Derived data ────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = contacts;
    if (search) {
      const t = search.toLowerCase();
      list = list.filter((c) =>
        c.first_name.toLowerCase().includes(t) ||
        c.last_name.toLowerCase().includes(t) ||
        (c.email || '').toLowerCase().includes(t) ||
        (c.phone || '').includes(t) ||
        (c.company || '').toLowerCase().includes(t)
      );
    }
    if (roleFilter !== 'all') list = list.filter((c) => c.role === roleFilter);
    if (stageFilter !== 'all') list = list.filter((c) => getStage(c) === stageFilter);
    list = [...list].sort((a, b) => {
      if (sortBy === 'name') return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      if (sortBy === 'last_touch') return (b.last_touch || '').localeCompare(a.last_touch || '');
      if (sortBy === 'next_touch') return (a.next_touch || '9999').localeCompare(b.next_touch || '9999');
      return b.created_at.localeCompare(a.created_at);
    });
    return list;
  }, [contacts, search, roleFilter, stageFilter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: contacts.length,
    leads: contacts.filter((c) => getStage(c) === 'lead').length,
    active: contacts.filter((c) => getStage(c) === 'active').length,
    overdue: contacts.filter((c) => {
      if (!c.next_touch) return false;
      try { return isPast(parseISO(c.next_touch)); } catch { return false; }
    }).length,
  }), [contacts]);

  // Deals per contact
  const dealsByContact = useMemo(() => {
    const map: Record<string, number> = {};
    for (const deal of deals) {
      for (const dc of (deal.deal_contacts || [])) {
        map[dc.contact_id] = (map[dc.contact_id] || 0) + 1;
      }
    }
    return map;
  }, [deals]);

  // Board columns
  const boardColumns = useMemo(() =>
    PIPELINE_STAGES.map((stage) => ({
      ...stage,
      contacts: filtered.filter((c) => getStage(c) === stage.id),
    })),
    [filtered]
  );

  // ── Handlers ────────────────────────────────────────────────────────────

  const openNew = () => {
    setForm(emptyForm);
    setTagInput('');
    setPanelMode('new');
    setPanelContact(null);
  };

  const openEdit = (c: ContactRow) => {
    setForm({
      first_name: c.first_name,
      last_name: c.last_name,
      email: c.email || '',
      phone: c.phone || '',
      company: c.company || '',
      role: c.role || '',
      current_address: c.current_address || '',
      tags: c.tags || [],
      last_touch: c.last_touch ? c.last_touch.split('T')[0] : '',
      next_touch: c.next_touch ? c.next_touch.split('T')[0] : '',
    });
    setTagInput('');
    setPanelMode('edit');
    setPanelContact(c);
  };

  const openDetail = (c: ContactRow) => { setPanelContact(c); setPanelMode('detail'); };
  const closePanel = () => { setPanelContact(null); setPanelMode('detail'); };

  const handleSave = async () => {
    if (!form.first_name.trim() || !form.last_name.trim()) { toast.error('First and last name are required'); return; }
    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
      role: form.role.trim() || null,
      current_address: form.current_address.trim() || null,
      tags: form.tags,
      last_touch: form.last_touch || null,
      next_touch: form.next_touch || null,
    };
    try {
      if (panelMode === 'edit' && panelContact) {
        await updateContact.mutateAsync({ id: panelContact.id, ...payload });
        toast.success('Contact updated');
        // Refresh detail view
        setPanelMode('detail');
      } else {
        await createContact.mutateAsync(payload);
        toast.success('Contact added');
        closePanel();
      }
    } catch { toast.error('Failed to save contact'); }
  };

  const handleDelete = async (id: string) => {
    try { await deleteContact.mutateAsync(id); closePanel(); toast.success('Contact deleted'); }
    catch { toast.error('Failed to delete contact'); }
  };

  const handleSetStage = async (contact: ContactRow, stageId: StageId) => {
    const tags = (contact.tags || []).filter((t) => !PIPELINE_STAGES.some((s) => s.id === t.toLowerCase()));
    await updateContact.mutateAsync({ id: contact.id, tags: [...tags, stageId] });
    if (panelContact?.id === contact.id) {
      setPanelContact({ ...contact, tags: [...tags, stageId] });
    }
  };

  const handleLogTouch = async (contact: ContactRow) => {
    const today = new Date().toISOString().split('T')[0];
    await updateContact.mutateAsync({ id: contact.id, last_touch: today });
    toast.success('Touch logged');
    if (panelContact?.id === contact.id) setPanelContact({ ...contact, last_touch: today });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    setTagInput('');
  };

  const removeTag = (tag: string) => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));

  // CSV
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true, skipEmptyLines: true,
      complete: (r) => { setCsvPreview(r.data as Record<string, string>[]); setCsvDialogOpen(true); },
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
          first_name: firstName.trim(), last_name: lastName.trim(),
          email: (row['email'] || row['Email'] || '').trim() || null,
          phone: (row['phone'] || row['Phone'] || '').trim() || null,
          company: (row['company'] || row['Company'] || '').trim() || null,
          role: (row['role'] || row['Role'] || '').trim() || null,
        });
        imported++;
      } catch { /* skip */ }
    }
    toast.success(`${imported} contact(s) imported`);
    setCsvDialogOpen(false);
  };

  const handleExport = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Company', 'Role', 'Stage', 'Tags', 'Last Touch', 'Next Touch'];
    const rows = contacts.map((c) => [
      c.first_name, c.last_name, c.email || '', c.phone || '', c.company || '',
      c.role || '', getStage(c) || '', (c.tags || []).join(';'), c.last_touch || '', c.next_touch || '',
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'contacts-export.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported');
  };

  // ── Render ──────────────────────────────────────────────────────────────

  const panelOpen = panelContact !== null || panelMode === 'new';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="h-14 border-b flex items-center px-6 gap-3 shrink-0 bg-background">
        <h1 className="text-base font-semibold text-foreground">CRM</h1>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{contacts.length.toLocaleString()}</span>
        <div className="flex-1" />
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-9 h-8 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center border rounded-md overflow-hidden">
          <button onClick={() => setView('list')} className={cn('px-2.5 py-1.5', view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><List className="w-3.5 h-3.5" /></button>
          <button onClick={() => setView('board')} className={cn('px-2.5 py-1.5', view === 'board' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}><LayoutGrid className="w-3.5 h-3.5" /></button>
        </div>
        <input ref={csvInputRef} type="file" accept=".csv" className="hidden" onChange={handleCsvFile} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 text-xs gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Contact <ChevronDown className="w-3 h-3" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openNew}><Plus className="w-3.5 h-3.5 mr-2" /> Add manually</DropdownMenuItem>
            <DropdownMenuItem onClick={() => csvInputRef.current?.click()}><Upload className="w-3.5 h-3.5 mr-2" /> Import CSV</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExport}><Download className="w-3.5 h-3.5 mr-2" /> Export CSV</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Stats Bar ── */}
      <div className="grid grid-cols-4 gap-px bg-border border-b shrink-0">
        {[
          { label: 'Total Contacts', value: stats.total, icon: Users, color: 'text-foreground' },
          { label: 'Leads', value: stats.leads, icon: TrendingUp, color: 'text-amber-600' },
          { label: 'Active Clients', value: stats.active, icon: Star, color: 'text-emerald-600' },
          { label: 'Follow-up Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-destructive' },
        ].map((s) => (
          <div key={s.label} className="bg-background px-6 py-3 flex items-center gap-3">
            <s.icon className={cn('w-4 h-4', s.color)} />
            <div>
              <div className="text-xl font-bold text-foreground leading-none">{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex items-center gap-2 px-6 py-2 border-b bg-background shrink-0 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="h-7 text-xs w-36"><SelectValue placeholder="Pipeline Stage" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            {PIPELINE_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="h-7 text-xs w-36"><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {CONTACT_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="h-7 text-xs w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Newest First</SelectItem>
            <SelectItem value="name">Name A→Z</SelectItem>
            <SelectItem value="last_touch">Last Touch</SelectItem>
            <SelectItem value="next_touch">Next Touch</SelectItem>
          </SelectContent>
        </Select>
        {(stageFilter !== 'all' || roleFilter !== 'all' || search) && (
          <button onClick={() => { setStageFilter('all'); setRoleFilter('all'); setSearch(''); }} className="text-[10px] text-muted-foreground hover:text-foreground underline">Clear filters</button>
        )}
        <span className="ml-auto text-[10px] text-muted-foreground">{filtered.length} of {contacts.length}</span>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className={cn('flex-1 overflow-auto', panelOpen ? 'mr-[420px]' : '')}>

          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">Loading contacts...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
              <Users className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">No contacts found</p>
              <Button size="sm" onClick={openNew} className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Contact</Button>
            </div>
          ) : view === 'list' ? (
            /* ── List View ── */
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-6 py-2.5">Contact</th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5">Stage</th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5">Role</th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5">Contact Info</th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5">Next Touch</th>
                  <th className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5">Deals</th>
                  <th className="px-4 py-2.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => {
                  const stage = getStage(contact);
                  const touch = nextTouchStatus(contact.next_touch);
                  const dealCount = dealsByContact[contact.id] || 0;
                  return (
                    <tr
                      key={contact.id}
                      className={cn('border-b hover:bg-muted/40 cursor-pointer transition-colors', panelContact?.id === contact.id && 'bg-primary/5')}
                      onClick={() => openDetail(contact)}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar contact={contact} />
                          <div>
                            <div className="text-sm font-medium text-foreground">{contact.first_name} {contact.last_name}</div>
                            {contact.company && <div className="text-[11px] text-muted-foreground">{contact.company}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StageBadge stageId={stage} /></td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{contact.role || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {contact.email && <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" />{contact.email}</span>}
                          {contact.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{contact.phone}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {touch ? <span className={cn('text-xs', touch.color)}>{touch.label}</span> : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {dealCount > 0 ? (
                          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{dealCount}</span>
                        ) : <span className="text-xs text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded hover:bg-muted"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onClick={() => openEdit(contact)}><Edit className="w-3.5 h-3.5 mr-2" /> Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleLogTouch(contact)}><CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Log Touch Today</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {PIPELINE_STAGES.map((s) => (
                              <DropdownMenuItem key={s.id} onClick={() => handleSetStage(contact, s.id)}>
                                <span className={cn('w-2 h-2 rounded-full mr-2', s.dot)} />
                                Move to {s.label}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDelete(contact.id)} className="text-destructive focus:text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* ── Board View ── */
            <div className="flex gap-4 p-5 h-full overflow-x-auto items-start">
              {boardColumns.map((col) => (
                <div key={col.id} className="flex flex-col gap-2 w-64 shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('w-2.5 h-2.5 rounded-full', col.dot)} />
                    <span className="text-xs font-semibold text-foreground">{col.label}</span>
                    <span className="ml-auto text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">{col.contacts.length}</span>
                  </div>
                  {col.contacts.map((contact) => {
                    const touch = nextTouchStatus(contact.next_touch);
                    return (
                      <div
                        key={contact.id}
                        onClick={() => openDetail(contact)}
                        className={cn('bg-background border rounded-xl p-3 cursor-pointer hover:shadow-md hover:border-primary/40 transition-all', panelContact?.id === contact.id && 'border-primary shadow-md')}
                      >
                        <div className="flex items-start gap-2.5">
                          <Avatar contact={contact} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-foreground truncate">{contact.first_name} {contact.last_name}</div>
                            {contact.company && <div className="text-[10px] text-muted-foreground truncate">{contact.company}</div>}
                          </div>
                        </div>
                        {contact.role && <div className="mt-2 text-[10px] text-muted-foreground">{contact.role}</div>}
                        {touch && <div className={cn('mt-1.5 text-[10px]', touch.color)}>📅 {touch.label}</div>}
                        {contact.tags && contact.tags.filter((t) => PRIORITY_TAGS.includes(t)).map((t) => (
                          <span key={t} className="inline-block mt-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 mr-1">{t}</span>
                        ))}
                      </div>
                    );
                  })}
                  {col.contacts.length === 0 && (
                    <div className="border-2 border-dashed rounded-xl p-4 text-center text-[10px] text-muted-foreground/50">No contacts</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Side Panel ── */}
        <AnimatePresence>
          {panelOpen && (
            <motion.div
              initial={{ x: 420 }} animate={{ x: 0 }} exit={{ x: 420 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-[420px] bg-background border-l shadow-xl z-50 flex flex-col"
            >
              {/* Panel header */}
              <div className="h-13 border-b flex items-center px-4 gap-2 shrink-0 py-3">
                {panelMode === 'detail' && panelContact && (
                  <>
                    <span className="text-sm font-semibold text-foreground flex-1 truncate">{panelContact.first_name} {panelContact.last_name}</span>
                    <button onClick={() => openEdit(panelContact)} className="p-1.5 rounded hover:bg-muted"><Edit className="w-4 h-4 text-muted-foreground" /></button>
                    <button onClick={closePanel} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
                  </>
                )}
                {(panelMode === 'edit' || panelMode === 'new') && (
                  <>
                    <span className="text-sm font-semibold text-foreground flex-1">{panelMode === 'new' ? 'New Contact' : 'Edit Contact'}</span>
                    <button onClick={() => panelContact ? setPanelMode('detail') : closePanel()} className="p-1.5 rounded hover:bg-muted"><X className="w-4 h-4 text-muted-foreground" /></button>
                  </>
                )}
              </div>

              {/* Detail mode */}
              {panelMode === 'detail' && panelContact && (
                <ScrollArea className="flex-1">
                  <div className="p-5 space-y-5">
                    {/* Avatar + name + stage */}
                    <div className="flex items-center gap-4">
                      <Avatar contact={panelContact} size="lg" />
                      <div className="flex-1 min-w-0">
                        <div className="text-lg font-bold text-foreground">{panelContact.first_name} {panelContact.last_name}</div>
                        {panelContact.role && <div className="text-sm text-muted-foreground">{panelContact.role}</div>}
                        {panelContact.company && <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Building2 className="w-3 h-3" />{panelContact.company}</div>}
                        <div className="mt-2"><StageBadge stageId={getStage(panelContact)} /></div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex gap-2">
                      {panelContact.phone && (
                        <a href={`tel:${panelContact.phone}`} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 border rounded-lg hover:bg-muted transition-colors">
                          <Phone className="w-3.5 h-3.5" /> Call
                        </a>
                      )}
                      {panelContact.email && (
                        <a href={`mailto:${panelContact.email}`} className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 border rounded-lg hover:bg-muted transition-colors">
                          <Mail className="w-3.5 h-3.5" /> Email
                        </a>
                      )}
                      <button
                        onClick={() => handleLogTouch(panelContact)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium py-2 border rounded-lg hover:bg-muted transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Log Touch
                      </button>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-2.5 border rounded-xl p-4">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Contact Info</div>
                      {panelContact.email && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-foreground">{panelContact.email}</span>
                        </div>
                      )}
                      {panelContact.phone && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-foreground">{panelContact.phone}</span>
                        </div>
                      )}
                      {panelContact.current_address && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="text-foreground">{panelContact.current_address}</span>
                        </div>
                      )}
                    </div>

                    {/* Pipeline stage selector */}
                    <div className="border rounded-xl p-4">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">Pipeline Stage</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {PIPELINE_STAGES.map((s) => {
                          const active = getStage(panelContact) === s.id;
                          return (
                            <button
                              key={s.id}
                              onClick={() => handleSetStage(panelContact, s.id)}
                              className={cn('text-[10px] font-semibold px-2 py-1.5 rounded-lg border transition-all', active ? s.color : 'bg-background text-muted-foreground border-border hover:border-foreground/20')}
                            >
                              {s.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Touch dates */}
                    <div className="border rounded-xl p-4 space-y-3">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Follow-up</div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground text-xs"><Clock className="w-3.5 h-3.5" /> Last Touch</span>
                        <span className="font-medium text-foreground text-xs">{formatDate(panelContact.last_touch)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground text-xs"><Calendar className="w-3.5 h-3.5" /> Next Touch</span>
                        {(() => {
                          const s = nextTouchStatus(panelContact.next_touch);
                          return s
                            ? <span className={cn('text-xs font-semibold', s.color)}>{s.label}</span>
                            : <span className="text-xs text-muted-foreground">Not set</span>;
                        })()}
                      </div>
                    </div>

                    {/* Tags */}
                    {(panelContact.tags || []).length > 0 && (
                      <div className="border rounded-xl p-4">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5"><Tag className="w-3 h-3 inline mr-1" />Tags</div>
                        <div className="flex flex-wrap gap-1.5">
                          {panelContact.tags.map((t) => (
                            <span key={t} className="text-[10px] font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Linked deals */}
                    {(dealsByContact[panelContact.id] || 0) > 0 && (
                      <div className="border rounded-xl p-4">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5"><Building2 className="w-3 h-3 inline mr-1" />Linked Deals</div>
                        <div className="space-y-1.5">
                          {deals
                            .filter((d) => (d.deal_contacts || []).some((dc) => dc.contact_id === panelContact.id))
                            .map((d) => (
                              <div key={d.id} className="flex items-center justify-between text-xs">
                                <span className="text-foreground truncate">{d.address || 'Unnamed Deal'}</span>
                                <span className="text-muted-foreground shrink-0 ml-2">{d.status}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(panelContact.id)}
                      className="w-full text-xs text-destructive border border-destructive/30 rounded-lg py-2 hover:bg-destructive/5 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Contact
                    </button>
                  </div>
                </ScrollArea>
              )}

              {/* Edit / New mode */}
              {(panelMode === 'edit' || panelMode === 'new') && (
                <>
                  <ScrollArea className="flex-1">
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-xs text-muted-foreground">First Name *</Label><Input value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} className="mt-1 h-8 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Last Name *</Label><Input value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} className="mt-1 h-8 text-sm" /></div>
                      </div>
                      <div><Label className="text-xs text-muted-foreground">Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="mt-1 h-8 text-sm" /></div>
                      <div><Label className="text-xs text-muted-foreground">Phone</Label><Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1 h-8 text-sm" /></div>
                      <div><Label className="text-xs text-muted-foreground">Company</Label><Input value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} className="mt-1 h-8 text-sm" /></div>
                      <div><Label className="text-xs text-muted-foreground">Address</Label><Input value={form.current_address} onChange={(e) => setForm((f) => ({ ...f, current_address: e.target.value }))} className="mt-1 h-8 text-sm" /></div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Role</Label>
                        <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}>
                          <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="Select role" /></SelectTrigger>
                          <SelectContent>{CONTACT_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Pipeline Stage</Label>
                        <Select
                          value={form.tags.find((t) => PIPELINE_STAGES.some((s) => s.id === t)) || ''}
                          onValueChange={(v) => {
                            const withoutStage = form.tags.filter((t) => !PIPELINE_STAGES.some((s) => s.id === t));
                            setForm((f) => ({ ...f, tags: v ? [...withoutStage, v] : withoutStage }));
                          }}
                        >
                          <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue placeholder="No stage" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No stage</SelectItem>
                            {PIPELINE_STAGES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label className="text-xs text-muted-foreground">Last Touch</Label><Input type="date" value={form.last_touch} onChange={(e) => setForm((f) => ({ ...f, last_touch: e.target.value }))} className="mt-1 h-8 text-sm" /></div>
                        <div><Label className="text-xs text-muted-foreground">Next Touch</Label><Input type="date" value={form.next_touch} onChange={(e) => setForm((f) => ({ ...f, next_touch: e.target.value }))} className="mt-1 h-8 text-sm" /></div>
                      </div>
                      {/* Tags */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Tags</Label>
                        <div className="mt-1 flex gap-1.5">
                          <Input placeholder="Add tag…" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="h-8 text-sm flex-1" />
                          <Button size="sm" variant="outline" className="h-8" onClick={addTag}>Add</Button>
                        </div>
                        {form.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {form.tags.map((t) => (
                              <span key={t} className="inline-flex items-center gap-1 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                                {t}
                                <button onClick={() => removeTag(t)} className="hover:text-foreground"><X className="w-2.5 h-2.5" /></button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="border-t p-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => panelContact ? setPanelMode('detail') : closePanel()}>Cancel</Button>
                    <Button size="sm" className="flex-1" onClick={handleSave} disabled={createContact.isPending || updateContact.isPending}>
                      {createContact.isPending || updateContact.isPending ? 'Saving…' : 'Save Contact'}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── CSV Import Dialog ── */}
      <Dialog open={csvDialogOpen} onOpenChange={setCsvDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Import CSV — {csvPreview.length} rows</DialogTitle></DialogHeader>
          <div className="max-h-60 overflow-auto border rounded-lg">
            <table className="w-full text-xs">
              <thead><tr className="border-b bg-muted">{csvPreview[0] && Object.keys(csvPreview[0]).slice(0, 6).map((k) => <th key={k} className="px-3 py-1.5 text-left font-medium text-muted-foreground">{k}</th>)}</tr></thead>
              <tbody>{csvPreview.slice(0, 10).map((row, i) => <tr key={i} className="border-b">{Object.values(row).slice(0, 6).map((v, j) => <td key={j} className="px-3 py-1.5">{v}</td>)}</tr>)}</tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">Columns: first_name, last_name, email, phone, company, role</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCsvDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCsvImport} disabled={createContact.isPending}>Import {csvPreview.length} Contacts</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
