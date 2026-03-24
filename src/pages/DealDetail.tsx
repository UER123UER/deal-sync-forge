import { useState, useRef, useCallback } from 'react';
import { TEMPLATES, TEMPLATE_CATEGORIES, type TemplateCategory } from '@/data/marketingTemplates';
import { useSignatureRequests } from '@/hooks/useSignatureRequests';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Edit, Eye, Mail, Plus, FileText, GripVertical, Download, Printer, Send, Trash2, MessageSquare, Bell, UserPlus, Check, X, Upload, Image, StickyNote, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useDeal, useUpdateDeal, useToggleChecklistItem, useDeleteChecklistItem, useAddDealContact } from '@/hooks/useDeals';
import { useDealNotes, useCreateDealNote, useDeleteDealNote } from '@/hooks/useDealNotes';
import { useOffers, useCreateOffer, useDeleteOffer } from '@/hooks/useOffers';
import { useDealPhotos, useUploadDealPhoto, useDeleteDealPhoto } from '@/hooks/useDealPhotos';
import { useOpenHouses, useCreateOpenHouse } from '@/hooks/useOpenHouses';
import { useTasks, useCreateTask, useDeleteTask } from '@/hooks/useTasks';
import { useContacts } from '@/hooks/useContacts';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SignaturePanel } from '@/components/deal/SignaturePanel';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import JSZip from 'jszip';

const TABS = ['Checklists', 'Photos', 'Tasks', 'Notes', 'Marketing'] as const;

const CONTACT_ROLES = [
  'Buyer', 'Buyer Agent', 'Seller', 'Seller Broker', 'Title',
  'Buyer Broker', 'Co Buyer Agent', 'Buyer Power Of Attorney',
  'Buyer Lawyer', 'Buyer Referral', 'Co Seller Agent',
  'Seller Power Of Attorney', 'Seller Lawyer', 'Seller Referral', 'Lender',
];

const formatPriceWithCommas = (value: string): string => {
  const num = value.replace(/[^0-9.]/g, '');
  if (!num) return '';
  const parts = num.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + parts.join('.');
};

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deal, isLoading } = useDeal(id);
  const updateDeal = useUpdateDeal();
  const toggleChecklist = useToggleChecklistItem();
  const deleteChecklist = useDeleteChecklistItem();
  const addDealContact = useAddDealContact();
  const { data: allContacts = [] } = useContacts();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Checklists');
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureDocName, setSignatureDocName] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Inline editing states
  const [editingMls, setEditingMls] = useState(false);
  const [mlsValue, setMlsValue] = useState('');
  const [editingPrice, setEditingPrice] = useState(false);
  const [priceValue, setPriceValue] = useState('');

  // Dialogs
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({ amount: '', buyer_name: '', notes: '' });
  const [openHouseDialogOpen, setOpenHouseDialogOpen] = useState(false);
  const [ohForm, setOhForm] = useState({ scheduled_date: '', start_time: '10:00 AM', end_time: '12:00 PM', notes: '' });
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);

  // Marketing local state
  const [marketingChecked, setMarketingChecked] = useState<Set<string>>(new Set());
  const [marketingCategory, setMarketingCategory] = useState<TemplateCategory | null>(null);

  // Hooks for tabs
  const { data: dealNotes = [] } = useDealNotes(id);
  const createNote = useCreateDealNote();
  const deleteNote = useDeleteDealNote();
  const [newNote, setNewNote] = useState('');

  const { data: dealPhotos = [] } = useDealPhotos(id);
  const uploadPhoto = useUploadDealPhoto();
  const deletePhoto = useDeleteDealPhoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: allTasks = [] } = useTasks();
  const dealTasks = allTasks.filter((t) => (t as any).deal_id === id);
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: dealOffers = [] } = useOffers(id);
  const createOffer = useCreateOffer();
  const deleteOffer = useDeleteOffer();

  const { data: dealOpenHouses = [] } = useOpenHouses(id);
  const createOH = useCreateOpenHouse();

  const { data: signatureRequests = [] } = useSignatureRequests(id);

  // Helper to get signature status for a checklist item
  const getSignatureStatus = (checklistItemId: string) => {
    const req = signatureRequests.find((r) => r.checklist_item_id === checklistItemId);
    if (!req) return null;
    const recipients = req.signature_recipients || [];
    const allSigned = recipients.length > 0 && recipients.every((r) => r.status === 'signed');
    const anySigned = recipients.some((r) => r.status === 'signed');
    if (allSigned) return 'signed';
    if (anySigned) return 'partially_signed';
    return 'sent';
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleChangeStatus = async (status: string) => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({ id: deal.id, status });
      toast.success(`Status changed to ${status}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleSaveMls = async () => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({ id: deal.id, mls_number: mlsValue });
      setEditingMls(false);
      toast.success('MLS# updated');
    } catch { toast.error('Failed to update MLS#'); }
  };

  const handleSavePrice = async () => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({ id: deal.id, price: priceValue });
      setEditingPrice(false);
      toast.success('Price updated');
    } catch { toast.error('Failed to update price'); }
  };

  const handleToggleChecklist = async (itemId: string, currentCompleted: boolean) => {
    try { await toggleChecklist.mutateAsync({ itemId, completed: !currentCompleted }); }
    catch { toast.error('Failed to update checklist item'); }
  };

  const handleDeleteChecklist = async (itemId: string) => {
    try { await deleteChecklist.mutateAsync(itemId); toast.success('Checklist item deleted'); }
    catch { toast.error('Failed to delete checklist item'); }
  };

  const handleToggleVisibility = async () => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({ id: deal.id, visible_to_office: !(deal as any).visible_to_office });
      toast.success((deal as any).visible_to_office ? 'Hidden from office' : 'Visible to office');
    } catch { toast.error('Failed to update visibility'); }
  };

  const handleEmail = () => {
    if (!deal) return;
    const contacts = (deal.deal_contacts || []).map((dc) => dc.contact?.email).filter(Boolean);
    const mailto = `mailto:${contacts.join(',')}?subject=${encodeURIComponent(deal.address)}`;
    window.open(mailto, '_blank');
  };

  const handleDownloadArchive = async () => {
    if (!deal) return;
    const zip = new JSZip();
    zip.file('deal.json', JSON.stringify(deal, null, 2));
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deal.address.replace(/\s+/g, '-')}-archive.zip`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Archive downloaded');
  };

  const handleCreateOffer = async () => {
    if (!id || !offerForm.amount || !offerForm.buyer_name) { toast.error('Amount and buyer name required'); return; }
    try {
      await createOffer.mutateAsync({ deal_id: id, amount: offerForm.amount, buyer_name: offerForm.buyer_name, notes: offerForm.notes || undefined });
      toast.success('Offer added');
      setOfferDialogOpen(false);
      setOfferForm({ amount: '', buyer_name: '', notes: '' });
    } catch { toast.error('Failed to add offer'); }
  };

  const handleScheduleOH = async () => {
    if (!id || !ohForm.scheduled_date) { toast.error('Date is required'); return; }
    try {
      await createOH.mutateAsync({ deal_id: id, scheduled_date: ohForm.scheduled_date, start_time: ohForm.start_time, end_time: ohForm.end_time, notes: ohForm.notes || undefined });
      toast.success('Open house scheduled');
      setOpenHouseDialogOpen(false);
      setOhForm({ scheduled_date: '', start_time: '10:00 AM', end_time: '12:00 PM', notes: '' });
    } catch { toast.error('Failed to schedule'); }
  };

  const handleAddContact = async () => {
    if (!id || !selectedContactId) { toast.error('Select a contact'); return; }
    try {
      await addDealContact.mutateAsync({ dealId: id, contactId: selectedContactId, role: contactRole || 'Other' });
      toast.success('Contact added to deal');
      setAddContactDialogOpen(false);
      setSelectedContactId('');
      setContactRole('');
    } catch { toast.error('Failed to add contact'); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!id || !e.target.files?.length) return;
    let uploaded = 0;
    for (const file of Array.from(e.target.files)) {
      try {
        await uploadPhoto.mutateAsync({ dealId: id, file });
        uploaded++;
      } catch (err: any) {
        const msg = err?.message || 'Unknown error';
        toast.error(`Failed to upload ${file.name}: ${msg}`);
      }
    }
    if (uploaded > 0) toast.success(`${uploaded} photo(s) uploaded`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddNote = async () => {
    if (!id || !newNote.trim()) return;
    try {
      await createNote.mutateAsync({ deal_id: id, content: newNote.trim() });
      setNewNote('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
  };

  const handleAddDealTask = async () => {
    if (!id || !newTaskTitle.trim()) return;
    try {
      await createTask.mutateAsync({ title: newTaskTitle.trim(), type: 'todo', deal_id: id });
      setNewTaskTitle('');
      toast.success('Task added');
    } catch { toast.error('Failed to add task'); }
  };

  const handleChecklistEmail = (itemName: string) => {
    if (!deal) return;
    const contacts = (deal.deal_contacts || []).map((dc) => dc.contact?.email).filter(Boolean);
    window.open(`mailto:${contacts.join(',')}?subject=${encodeURIComponent(itemName)}`, '_blank');
  };

  const handleChecklistUpload = (itemId: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file || !id) return;
      try {
        await uploadPhoto.mutateAsync({ dealId: id, file });
        toast.success('File uploaded');
      } catch { toast.error('Upload failed'); }
    };
    input.click();
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Loading deal...</p></div>;
  }
  if (!deal) {
    return <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Deal not found</p></div>;
  }

  const contacts = (deal.deal_contacts || []).map((dc) => ({
    id: dc.contact?.id || dc.contact_id,
    firstName: dc.contact?.first_name || '',
    lastName: dc.contact?.last_name || '',
    email: dc.contact?.email || '',
    phone: dc.contact?.phone || '',
    company: dc.contact?.company || '',
    role: dc.role || '',
    mlsId: dc.contact?.mls_id || '',
    mls: dc.contact?.mls || '',
    commission: dc.contact?.commission || '',
    commissionType: (dc.contact?.commission_type as 'percentage' | 'dollars') || 'percentage',
  }));

  const checklistItems = (deal.checklist_items || []).sort((a, b) => a.sort_order - b.sort_order);
  const isVisibleToOffice = (deal as any).visible_to_office;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{deal.address}</h1>
              <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize',
                deal.status === 'active' ? 'bg-success/10 text-success' :
                deal.status === 'pending' ? 'bg-warning/10 text-warning' :
                'bg-muted text-muted-foreground'
              )}>{deal.status}</span>
              {isVisibleToOffice && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">Office Visible</span>}
            </div>
            <p className="text-sm text-muted-foreground">{deal.city}, {deal.state} {deal.zip}</p>
          </div>
          <div className="flex items-center gap-2">
            {contacts.slice(0, 3).map((c) => (
              <div key={c.id} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium" title={`${c.firstName} ${c.lastName}`}>
                {c.firstName[0]}{c.lastName[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleToggleVisibility}>
            <Eye className="w-3.5 h-3.5" /> {isVisibleToOffice ? 'Sent to Office' : 'Send to Office'}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">Open House <ChevronDown className="w-3 h-3" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setOpenHouseDialogOpen(true)}>Schedule Open House</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/open-house?deal=${deal.id}`)}>View Open Houses ({dealOpenHouses.length})</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setOfferDialogOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Offer {dealOffers.length > 0 && `(${dealOffers.length})`}
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleEmail}>
            <Mail className="w-3.5 h-3.5" /> Email
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">Change Status <ChevronDown className="w-3 h-3" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {['draft', 'active', 'pending', 'archive'].map((s) => (
                <DropdownMenuItem key={s} onClick={() => handleChangeStatus(s)} className="capitalize">
                  {deal.status === s && <Check className="w-3.5 h-3.5 mr-1.5" />}{s}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-4 -mb-4">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Checklists Tab */}
      {activeTab === 'Checklists' && (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div className="w-80 border-r overflow-auto p-4 space-y-6 flex-shrink-0">
            {/* Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Timeline</h3>
                <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="space-y-3 relative">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                <div className="flex items-start gap-3 relative">
                  <div className="w-[11px] h-[11px] rounded-full border-2 border-muted-foreground bg-background flex-shrink-0 mt-0.5 z-10" />
                  <div className="flex justify-between flex-1 text-sm">
                    <span className="text-muted-foreground">Listing Expiration</span>
                    <span className="text-foreground">{deal.listing_expiration || '—'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 relative">
                  <div className="w-[11px] h-[11px] rounded-full border-2 border-muted-foreground bg-background flex-shrink-0 mt-0.5 z-10" />
                  <div className="flex justify-between flex-1 text-sm">
                    <span className="text-muted-foreground">Listing Start Date</span>
                    <span className="text-foreground">{deal.listing_start_date || '—'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">MLS#</span>
                  {editingMls ? (
                    <div className="flex items-center gap-1">
                      <Input value={mlsValue} onChange={(e) => setMlsValue(e.target.value)} className="h-7 w-28 text-xs" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSaveMls()} />
                      <button onClick={handleSaveMls} className="text-success"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setEditingMls(false)} className="text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : deal.mls_number ? (
                    <button onClick={() => { setMlsValue(deal.mls_number || ''); setEditingMls(true); }} className="text-foreground hover:text-primary">{deal.mls_number}</button>
                  ) : (
                    <button onClick={() => { setMlsValue(''); setEditingMls(true); }} className="text-primary text-sm hover:underline">Add MLS# Number</button>
                  )}
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Side</span>
                  <span className="text-foreground capitalize">{deal.representation_side}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type</span>
                  <span className="text-foreground">{deal.property_type}</span>
                </div>
              </div>
            </div>

            {/* Contacts */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Contacts</h3>
              <div className="space-y-3">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">{c.firstName[0]}{c.lastName[0]}</div>
                    <div className="flex-1 min-w-0"><div className="text-sm text-foreground">{c.firstName} {c.lastName}</div></div>
                    <span className="text-xs text-muted-foreground">{c.role}</span>
                  </div>
                ))}
                <button onClick={() => setAddContactDialogOpen(true)} className="text-sm text-primary hover:underline flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Add a New Contact
                </button>
              </div>
            </div>

            {/* Offers */}
            {dealOffers.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Offers ({dealOffers.length})</h3>
                <div className="space-y-2">
                  {dealOffers.map((o) => (
                    <div key={o.id} className="flex items-center justify-between text-sm border rounded-md px-3 py-2">
                      <div>
                        <span className="text-foreground font-medium">{o.amount}</span>
                        <span className="text-muted-foreground ml-2">— {o.buyer_name}</span>
                      </div>
                      <button onClick={() => deleteOffer.mutateAsync({ id: o.id, dealId: id! })} className="text-destructive hover:bg-muted rounded p-0.5"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CDA */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">CDA Information</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deal #</span>
                <span className="text-foreground">{deal.id.slice(0, 8)}</span>
              </div>
            </div>

            {/* Listing Info */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Listing Information</h3>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">List Price</span>
                {editingPrice ? (
                  <div className="flex items-center gap-1">
                    <Input value={priceValue} onChange={(e) => setPriceValue(e.target.value)} className="h-7 w-28 text-xs" autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSavePrice()} />
                    <button onClick={handleSavePrice} className="text-success"><Check className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setEditingPrice(false)} className="text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                  </div>
                ) : (
                  <button onClick={() => { setPriceValue(deal.price || ''); setEditingPrice(true); }} className="text-foreground hover:text-primary">{formatPriceWithCommas(deal.price || '')}</button>
                )}
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5" onClick={handleDownloadArchive}>
              <Download className="w-3.5 h-3.5" /> Download Archive
            </Button>
          </div>

          {/* Right Panel - Checklists */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Listing</h3>
            </div>
            <div className="border rounded-md overflow-hidden">
              {checklistItems.map((item) => {
                const isExpanded = expandedItems.has(item.id);
                return (
                  <div key={item.id}>
                    <div className={cn('flex items-center px-3 py-3 border-b last:border-b-0 group transition-colors', isExpanded && 'bg-info-light', item.completed && 'opacity-60')}>
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 mr-2 flex-shrink-0 cursor-grab" />
                      <Checkbox checked={!!item.completed} onCheckedChange={() => handleToggleChecklist(item.id, !!item.completed)} className="mr-2 flex-shrink-0" />
                      <button onClick={() => toggleExpand(item.id)} className="mr-2 flex-shrink-0">
                        {item.has_digital_form ? (isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />) : <div className="w-4 h-4" />}
                      </button>
                      <span className={cn('text-sm text-foreground flex-1', item.completed && 'line-through')}>{item.name}</span>
                      {(() => {
                        const sigStatus = getSignatureStatus(item.id);
                        if (!sigStatus) return null;
                        return (
                          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full mr-2',
                            sigStatus === 'signed' ? 'bg-success/10 text-success' :
                            sigStatus === 'partially_signed' ? 'bg-warning/10 text-warning' :
                            'bg-primary/10 text-primary'
                          )}>
                            {sigStatus === 'signed' ? 'Signed' : sigStatus === 'partially_signed' ? 'Partially Signed' : 'Sent for Signature'}
                          </span>
                        );
                      })()}
                      <div className="flex items-center">
                        {item.has_digital_form && (
                          <Button variant="outline" size="sm" className="h-7 text-xs rounded-r-none border-r-0" onClick={() => navigate(`/transactions/${deal.id}/form/${item.id}`)}>Edit Form</Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className={cn("h-7 w-7", item.has_digital_form ? "rounded-l-none" : "")}><ChevronDown className="w-3.5 h-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/transactions/${deal.id}/form/${item.id}`)}><Printer className="w-3.5 h-3.5 mr-2" /> View/Print</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSignatureDocName(item.name); setSignatureOpen(true); }}><Send className="w-3.5 h-3.5 mr-2" /> Docusign</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChecklistEmail(item.name)}><Mail className="w-3.5 h-3.5 mr-2" /> Email</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleChecklistUpload(item.id)}><FileText className="w-3.5 h-3.5 mr-2" /> Upload</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success('Message sent to office')}><MessageSquare className="w-3.5 h-3.5 mr-2" /> Message Office</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success('Office notified to review')}><Bell className="w-3.5 h-3.5 mr-2" /> Notify Office to Review</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteChecklist(item.id)}><Trash2 className="w-3.5 h-3.5 mr-2" /> Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    {isExpanded && item.has_digital_form && (
                      <div className="flex items-center px-3 py-2.5 pl-14 border-b bg-info-light/50">
                        <FileText className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                        <span className="text-sm text-foreground flex-1">Digital Form</span>
                        <div className="flex items-center">
                          <Button variant="outline" size="sm" className="h-7 text-xs rounded-r-none border-r-0" onClick={() => navigate(`/transactions/${deal.id}/form/${item.id}`)}>Edit Form</Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="outline" size="icon" className="h-7 w-7 rounded-l-none"><ChevronDown className="w-3.5 h-3.5" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSignatureDocName(item.name); setSignatureOpen(true); }}><Send className="w-3.5 h-3.5 mr-2" /> Docusign</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/transactions/${deal.id}/form/${item.id}`)}><Printer className="w-3.5 h-3.5 mr-2" /> View/Print</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleChecklistEmail(item.name)}><Mail className="w-3.5 h-3.5 mr-2" /> Email</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === 'Photos' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Photos ({dealPhotos.length})</h3>
            <div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              <Button size="sm" className="text-xs gap-1.5" onClick={() => fileInputRef.current?.click()} disabled={uploadPhoto.isPending}>
                <Upload className="w-3.5 h-3.5" /> {uploadPhoto.isPending ? 'Uploading...' : 'Upload Photos'}
              </Button>
            </div>
          </div>
          {dealPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-lg">
              <Image className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No photos yet. Upload photos of this property.</p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Choose Files</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dealPhotos.map((photo) => (
                <div key={photo.name} className="relative group rounded-lg overflow-hidden border bg-muted">
                  <img src={photo.url} alt={photo.name} className="w-full h-40 object-cover" />
                  <button onClick={() => deletePhoto.mutateAsync({ dealId: id!, name: photo.name })} className="absolute top-2 right-2 p-1 bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'Tasks' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center gap-2 mb-4">
            <Input placeholder="Add a task for this deal..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddDealTask()} className="text-sm" />
            <Button size="sm" onClick={handleAddDealTask} disabled={!newTaskTitle.trim()}>Add</Button>
          </div>
          {dealTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No tasks for this deal yet.</p>
          ) : (
            <div className="space-y-2">
              {dealTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 border rounded-md px-3 py-2">
                  <span className="text-sm text-foreground flex-1">{task.title}</span>
                  {task.due_date && <span className="text-xs text-muted-foreground">{format(new Date(task.due_date), 'MMM d')}</span>}
                  <button onClick={() => deleteTask.mutateAsync(task.id)} className="text-destructive hover:bg-muted rounded p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'Notes' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-start gap-2 mb-4">
            <Textarea placeholder="Write a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} className="text-sm min-h-[80px]" />
            <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() || createNote.isPending}>Add</Button>
          </div>
          {dealNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notes yet.</p>
          ) : (
            <div className="space-y-3">
              {dealNotes.map((note) => (
                <div key={note.id} className="border rounded-md px-4 py-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{note.created_at ? format(new Date(note.created_at), 'MMM d, yyyy h:mm a') : ''}</span>
                    <button onClick={() => deleteNote.mutateAsync({ id: note.id, dealId: id! })} className="text-destructive hover:bg-muted rounded p-1"><Trash2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Marketing Tab — Template Gallery */}
      {activeTab === 'Marketing' && (
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Marketing Studio</h3>
          </div>
          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setMarketingCategory(null)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', !marketingCategory ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-foreground/30')}
            >
              All Templates
            </button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setMarketingCategory(marketingCategory === cat ? null : cat)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', marketingCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-foreground/30')}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Template grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {TEMPLATES.filter((t) => !marketingCategory || t.category === marketingCategory).map((template) => (
              <button
                key={template.id}
                onClick={() => navigate(`/transactions/${id}/marketing?template=${template.id}`)}
                className="group border rounded-lg overflow-hidden bg-background hover:shadow-lg transition-all hover:border-primary/50 text-left"
              >
                <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                  <div style={{ transform: 'scale(0.15)', transformOrigin: 'top left', width: template.width, height: template.height, pointerEvents: 'none' }}>
                    {template.render({
                      address: deal?.address || '123 Main St',
                      city: deal?.city || 'City',
                      state: deal?.state || 'ST',
                      zip: deal?.zip || '00000',
                      price: deal?.price || '$0',
                      beds: '4', baths: '3', sqft: '2,500', lotSize: '',
                      photos: [], agentName: deal?.primary_agent || 'Agent', agentTitle: 'Real Estate Agent',
                      agentPhone: '(555) 123-4567', agentEmail: 'agent@email.com',
                      headline: template.category, subheadline: '', description: 'Beautiful property with modern finishes.',
                      openHouseDate: 'Saturday, March 22', openHouseTime: '1:00 PM - 4:00 PM',
                    }, false)}
                  </div>
                </div>
                <div className="p-3">
                  <div className="text-sm font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{template.category} • {template.type}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Offer</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label className="text-xs">Buyer Name *</Label><Input value={offerForm.buyer_name} onChange={(e) => setOfferForm((f) => ({ ...f, buyer_name: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">Amount *</Label><Input value={offerForm.amount} onChange={(e) => setOfferForm((f) => ({ ...f, amount: e.target.value }))} placeholder="$500,000" className="mt-1" /></div>
            <div><Label className="text-xs">Notes</Label><Input value={offerForm.notes} onChange={(e) => setOfferForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1" /></div>
            <Button className="w-full" onClick={handleCreateOffer} disabled={createOffer.isPending}>Add Offer</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openHouseDialogOpen} onOpenChange={setOpenHouseDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Schedule Open House</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label className="text-xs">Date *</Label><Input type="date" value={ohForm.scheduled_date} onChange={(e) => setOhForm((f) => ({ ...f, scheduled_date: e.target.value }))} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">Start Time</Label><Input value={ohForm.start_time} onChange={(e) => setOhForm((f) => ({ ...f, start_time: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">End Time</Label><Input value={ohForm.end_time} onChange={(e) => setOhForm((f) => ({ ...f, end_time: e.target.value }))} className="mt-1" /></div>
            </div>
            <div><Label className="text-xs">Notes</Label><Input value={ohForm.notes} onChange={(e) => setOhForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1" /></div>
            <Button className="w-full" onClick={handleScheduleOH} disabled={createOH.isPending}>Schedule</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={addContactDialogOpen} onOpenChange={(open) => { setAddContactDialogOpen(open); if (!open) { setContactSearch(''); setContactDropdownOpen(false); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Contact to Deal</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="relative">
              <Label className="text-xs">Contact</Label>
              <Input
                value={contactSearch}
                onChange={(e) => {
                  setContactSearch(e.target.value);
                  setContactDropdownOpen(true);
                  setSelectedContactId('');
                }}
                onFocus={() => setContactDropdownOpen(true)}
                placeholder="Search contacts..."
                className="mt-1"
                autoComplete="off"
              />
              {contactDropdownOpen && contactSearch.length > 0 && (() => {
                const filtered = allContacts.filter((c) =>
                  `${c.first_name} ${c.last_name}`.toLowerCase().includes(contactSearch.toLowerCase()) ||
                  (c.email && c.email.toLowerCase().includes(contactSearch.toLowerCase()))
                );
                return filtered.length > 0 ? (
                  <div className="absolute z-50 mt-1 w-full max-h-48 overflow-auto rounded-md border bg-popover shadow-md">
                    {filtered.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setSelectedContactId(c.id);
                          setContactSearch(`${c.first_name} ${c.last_name}`);
                          setContactDropdownOpen(false);
                        }}
                      >
                        {c.first_name} {c.last_name}{c.email ? ` — ${c.email}` : ''}
                      </button>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Select value={contactRole} onValueChange={setContactRole}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Buyer, Seller, Agent..." /></SelectTrigger>
                <SelectContent>
                  {CONTACT_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleAddContact} disabled={addDealContact.isPending}>Add to Deal</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Signature Panel */}
      <SignaturePanel
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        documentName={signatureDocName}
        contacts={contacts.map((c) => ({ id: c.id, role: c.role, firstName: c.firstName, lastName: c.lastName, email: c.email || '', phone: c.phone || '', company: c.company || '' }))}
        dealId={id}
      />
    </div>
  );
}
