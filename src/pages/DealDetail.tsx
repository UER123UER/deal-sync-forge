import { useMemo, useRef, useState } from 'react';
import { TEMPLATES, TEMPLATE_CATEGORIES, getDefaultTemplateData, type TemplateCategory } from '@/data/marketingTemplates';
import { loadMarketingRecents, type RecentEntry } from '@/lib/marketingRecents';
// import { useSignatureRequests } from '@/hooks/useSignatureRequests';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Eye, Mail, Plus, GripVertical, Download, Trash2, Bell, UserPlus, Check, X, Upload, Image, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useQuery } from '@tanstack/react-query';
import { useDeal, useUpdateDeal, useDeleteChecklistItem, useAddDealContact, useAddChecklistItems, useToggleChecklistItem } from '@/hooks/useDeals';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
// import { SigningSessionsPanel } from '@/components/deal/SigningSessionsPanel';
import { supabase } from '@/integrations/supabase/client';
import { buildAddableFormOptions, getChecklistSectionId, getChecklistSectionTitle, resolveChecklistAdminDocument } from '@/lib/checklistCatalog';
import { ChecklistDocumentPanel } from '@/components/deal/ChecklistDocumentPanel';
import { toast } from 'sonner';
import { format } from 'date-fns';
import JSZip from 'jszip';

const TABS = [
  'Checklists',
  // 'Signing Sessions', // Disabled while the checklist stays manual-only.
  'Photos',
  'Tasks',
  'Notes',
  'Marketing',
] as const;

const CONTACT_ROLES = [
  'Buyer', 'Buyer Agent', 'Seller', 'Seller Broker', 'Title',
  'Buyer Broker', 'Co Buyer Agent', 'Buyer Power Of Attorney',
  'Buyer Lawyer', 'Buyer Referral', 'Co Seller Agent',
  'Seller Power Of Attorney', 'Seller Lawyer', 'Seller Referral', 'Lender',
];

const formatPriceWithCommas = (value: string): string => {
  // Strip everything except digits and the first decimal point
  const stripped = value.replace(/[^0-9.]/g, '');
  if (!stripped) return '';
  // Keep only the first decimal point
  const firstDot = stripped.indexOf('.');
  const intPart = firstDot === -1 ? stripped : stripped.slice(0, firstDot);
  const decPart = firstDot === -1 ? '' : stripped.slice(firstDot + 1).replace(/\./g, '');
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + (decPart ? `${formatted}.${decPart}` : formatted);
};

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: deal, isLoading } = useDeal(id);
  const updateDeal = useUpdateDeal();
  const deleteChecklist = useDeleteChecklistItem();
  const addDealContact = useAddDealContact();
  const addChecklistItems = useAddChecklistItems();
  const toggleChecklistItem = useToggleChecklistItem();
  const { data: allContacts = [] } = useContacts();
  const initialTab = (TABS as readonly string[]).includes(searchParams.get('tab') ?? '')
    ? (searchParams.get('tab') as typeof TABS[number])
    : 'Checklists';
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>(initialTab);
  const [addFormsOpen, setAddFormsOpen] = useState(false);
  const [hiddenFormSearch, setHiddenFormSearch] = useState('');
  const [selectedHiddenForms, setSelectedHiddenForms] = useState<Set<string>>(new Set());
  const [expandedChecklistItems, setExpandedChecklistItems] = useState<Set<string>>(new Set());

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
  const [showRecentOnly, setShowRecentOnly] = useState(false);

  // Load saved marketing sessions for this deal from localStorage
  const dealRecents: RecentEntry[] = (() => {
    try {
      return id ? loadMarketingRecents(id) : [];
    } catch { return []; }
  })();

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
  const dealTasks = allTasks.filter((t) => t.deal_id === id);
  const createTask = useCreateTask();
  const deleteTask = useDeleteTask();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const { data: dealOffers = [] } = useOffers(id);
  const createOffer = useCreateOffer();
  const deleteOffer = useDeleteOffer();

  const { data: dealOpenHouses = [] } = useOpenHouses(id);
  const createOH = useCreateOpenHouse();

  const { data: adminDocuments = [] } = useQuery({
    queryKey: ['admin_documents', 'catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_documents')
        .select('file_name, storage_path')
        .order('file_name', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

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

  const handleToggleChecklistCompleted = async (itemId: string, completed: boolean) => {
    try {
      await toggleChecklistItem.mutateAsync({ itemId, completed });
    } catch {
      toast.error('Failed to update checklist item');
    }
  };

  const handleDeleteChecklist = async (itemId: string) => {
    try { await deleteChecklist.mutateAsync(itemId); toast.success('Checklist item deleted'); }
    catch { toast.error('Failed to delete checklist item'); }
  };

  const handleToggleHiddenForm = (fileName: string) => {
    setSelectedHiddenForms((currentSelection) => {
      const nextSelection = new Set(currentSelection);
      if (nextSelection.has(fileName)) nextSelection.delete(fileName);
      else nextSelection.add(fileName);
      return nextSelection;
    });
  };

  const handleToggleVisibility = async () => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({ id: deal.id, visible_to_office: !deal.visible_to_office });
      toast.success(deal.visible_to_office ? 'Hidden from office' : 'Visible to office');
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
  // Signing sessions, form editing, and row-level document actions are paused for now.
  // We are using the checklist as a simple manual completion tracker.

  const checklistItems = useMemo(
    () => [...(deal?.checklist_items || [])].sort((a, b) => a.sort_order - b.sort_order),
    [deal?.checklist_items]
  );
  const completedChecklistCount = checklistItems.filter((item) => item.completed).length;
  const checklistDocumentsByItemId = useMemo(
    () =>
      new Map(
        checklistItems.map((item) => [
          item.id,
          resolveChecklistAdminDocument(item.name, adminDocuments, {
            propertyType: deal?.property_type,
            representationSide: deal?.representation_side,
          }),
        ])
      ),
    [adminDocuments, checklistItems, deal?.property_type, deal?.representation_side]
  );

  const addableForms = useMemo(
    () =>
      buildAddableFormOptions({
        adminDocuments,
        checklistItems,
        propertyType: deal?.property_type,
        representationSide: deal?.representation_side,
      }),
    [adminDocuments, checklistItems, deal?.property_type, deal?.representation_side]
  );

  const filteredAddableForms = useMemo(() => {
    const normalizedSearch = hiddenFormSearch.trim().toLowerCase();

    if (!normalizedSearch) return addableForms;

    return addableForms.filter((form) =>
      form.checklistName.toLowerCase().includes(normalizedSearch) ||
      form.file_name.toLowerCase().includes(normalizedSearch)
    );
  }, [addableForms, hiddenFormSearch]);

  const groupedChecklistSections = useMemo(() => {
    const sectionMap = new Map<string, typeof checklistItems>();

    for (const checklistItem of checklistItems) {
      const sectionId = getChecklistSectionId(checklistItem.name, {
        propertyType: deal?.property_type,
        representationSide: deal?.representation_side,
      });
      const collection = sectionMap.get(sectionId) || [];
      collection.push(checklistItem);
      sectionMap.set(sectionId, collection);
    }

    return ['listing', 'contract', 'company', 'additional']
      .map((sectionId) => ({
        id: sectionId,
        title: getChecklistSectionTitle(sectionId),
        items: sectionMap.get(sectionId) || [],
      }))
      .filter((section) => section.items.length > 0);
  }, [checklistItems, deal?.property_type, deal?.representation_side]);

  const handleAddHiddenForms = async () => {
    if (!deal || selectedHiddenForms.size === 0) return;

    const selectedForms = addableForms.filter((form) => selectedHiddenForms.has(form.file_name));
    if (!selectedForms.length) {
      toast.error('Select at least one hidden form to add');
      return;
    }

    const nextSortOrderStart =
      checklistItems.reduce((highestSortOrder, item) => Math.max(highestSortOrder, item.sort_order), -1) + 1;

    try {
      await addChecklistItems.mutateAsync({
        dealId: deal.id,
        items: selectedForms.map((form, index) => ({
          name: form.checklistName,
          has_digital_form: true,
          sort_order: nextSortOrderStart + index,
        })),
      });

      toast.success(
        selectedForms.length === 1
          ? `Added "${selectedForms[0].checklistName}"`
          : `Added ${selectedForms.length} forms`
      );
      setSelectedHiddenForms(new Set());
      setHiddenFormSearch('');
      setAddFormsOpen(false);
    } catch {
      toast.error('Failed to add selected forms');
    }
  };

  const handleToggleChecklistPdfRow = (itemId: string) => {
    setExpandedChecklistItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
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

  const isVisibleToOffice = deal.visible_to_office;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
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
          <div className="flex items-center gap-2 self-start lg:self-auto">
            {contacts.slice(0, 3).map((c) => (
              <div key={c.id} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium" title={`${c.firstName} ${c.lastName}`}>
                {c.firstName[0]}{c.lastName[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Action Bar */}
        <div className="mt-4 flex flex-wrap items-stretch gap-2">
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
        <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
          <div className="flex w-max min-w-full gap-1 sm:gap-0">
          {TABS.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={cn(
              'whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            )}>{tab}</button>
          ))}
          </div>
        </div>
      </div>

      {/* Checklists Tab */}
      {activeTab === 'Checklists' && (
        <div className="flex flex-1 flex-col overflow-hidden xl:flex-row">
          {/* Left Panel */}
          <div className="w-full overflow-auto border-b p-4 space-y-6 xl:w-80 xl:flex-shrink-0 xl:border-b-0 xl:border-r">
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
                  <div className="flex flex-1 flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between">
                    <span className="text-muted-foreground">Listing Expiration</span>
                    <span className="text-foreground">{deal.listing_expiration || '-'}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 relative">
                  <div className="w-[11px] h-[11px] rounded-full border-2 border-muted-foreground bg-background flex-shrink-0 mt-0.5 z-10" />
                  <div className="flex flex-1 flex-col gap-1 text-sm sm:flex-row sm:items-start sm:justify-between">
                    <span className="text-muted-foreground">Listing Start Date</span>
                    <span className="text-foreground">{deal.listing_start_date || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Details */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Details</h3>
              <div className="space-y-2">
                <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-start sm:justify-between">
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
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
                  <span className="text-muted-foreground">Side</span>
                  <span className="text-foreground capitalize">{deal.representation_side}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
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
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-foreground">{c.firstName} {c.lastName}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{c.role}</div>
                    </div>
                    <span className="hidden text-xs text-muted-foreground sm:inline">{c.role}</span>
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
                    <div key={o.id} className="flex flex-col gap-2 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-foreground font-medium">{o.amount}</span>
                        <span className="text-muted-foreground ml-2">- {o.buyer_name}</span>
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
              <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
                <span className="text-muted-foreground">Deal #</span>
                <span className="text-foreground">{deal.id.slice(0, 8)}</span>
              </div>
            </div>

            {/* Listing Info */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Listing Information</h3>
              <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-start sm:justify-between">
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
          <div className="flex-1 overflow-auto p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-foreground">Checklist</h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  {completedChecklistCount} of {checklistItems.length} completed
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setAddFormsOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Hidden Forms
                  {addableForms.length > 0 ? ` (${addableForms.length})` : ''}
                </Button>
              </div>
            </div>
            <div className="border rounded-md overflow-hidden">
              {groupedChecklistSections.map((section, sectionIndex) => (
                <div key={section.id}>
                  <div className={cn(
                    'px-3 py-2 bg-muted/50 border-b',
                    sectionIndex > 0 && 'border-t'
                  )}>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {section.title}
                    </div>
                  </div>
                  {section.items.map((item) => {
                    const isCompleted = !!item.completed;
                    const linkedDocument = checklistDocumentsByItemId.get(item.id);
                    const isPdfRowOpen = expandedChecklistItems.has(item.id);
                    return (
                      <div key={item.id}>
                        <div className={cn(
                          'flex items-center px-3 py-3 border-b last:border-b-0 group transition-colors',
                          isCompleted && 'bg-success/5'
                        )}>
                          <GripVertical className="w-4 h-4 text-muted-foreground/40 mr-2 flex-shrink-0 cursor-grab" />
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={(checked) => handleToggleChecklistCompleted(item.id, checked === true)}
                            className="mr-2 flex-shrink-0"
                          />
                          <div className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className={cn(
                            'text-sm flex-1',
                            isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
                          )}>
                            {item.name}
                          </span>
                          {isCompleted && (
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full mr-2 bg-success/10 text-success">
                              Complete
                            </span>
                          )}
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 mr-1"
                            aria-label={`${isPdfRowOpen ? 'Hide' : 'Show'} PDF row for ${item.name}`}
                            onClick={() => handleToggleChecklistPdfRow(item.id)}
                          >
                            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', isPdfRowOpen && 'rotate-180')} />
                          </Button>
                          {/* Form editing and signing actions are intentionally disabled for the manual checklist flow. */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteChecklist(item.id)}
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                        {isPdfRowOpen && (
                          <ChecklistDocumentPanel
                            dealId={deal.id}
                            itemId={item.id}
                            itemName={item.name}
                            defaultDocument={linkedDocument}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Signing sessions are intentionally hidden while checklist work stays manual-only. */}

      {/* Photos Tab */}
      {activeTab === 'Photos' && (
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <div className="flex-1 overflow-auto p-4 sm:p-6">
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
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start">
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

      {/* Marketing Tab - Template Gallery */}
      {activeTab === 'Marketing' && (
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-foreground">Marketing Studio</h3>
          </div>
          {/* Category filter chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            {/* Recent pill - shown only when there are saved sessions */}
            {dealRecents.length > 0 && (
              <button
                onClick={() => { setShowRecentOnly(!showRecentOnly); setMarketingCategory(null); }}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5', showRecentOnly ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-foreground/30')}
              >
                <Clock className="h-3 w-3" />
                Recent
                <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', showRecentOnly ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                  {dealRecents.length}
                </span>
              </button>
            )}
            <button
              onClick={() => { setMarketingCategory(null); setShowRecentOnly(false); }}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', !marketingCategory && !showRecentOnly ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-foreground/30')}
            >
              All Templates
            </button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setMarketingCategory(marketingCategory === cat ? null : cat); setShowRecentOnly(false); }}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors', marketingCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:border-foreground/30')}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Template grid */}
          {TEMPLATES.filter((t) => {
            if (showRecentOnly) return dealRecents.some((r) => r.templateId === t.id);
            return !marketingCategory || t.category === marketingCategory;
          }).length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-5xl mb-4">🎨</div>
              <h4 className="text-base font-semibold text-foreground mb-1">Templates coming soon</h4>
              <p className="text-sm text-muted-foreground">New designs are being built to order.</p>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {TEMPLATES.filter((t) => {
              if (showRecentOnly) return dealRecents.some((r) => r.templateId === t.id);
              return !marketingCategory || t.category === marketingCategory;
            }).map((template) => {
              // Render at a fixed 200px preview width, cap height so stories aren't enormous
              const PREVIEW_W = 200;
              const naturalH = Math.round(template.height * (PREVIEW_W / template.width));
              const THUMB_H = Math.min(naturalH, 260); // cap stories at 260px
              const thumbScale = PREVIEW_W / template.width;
              const typeLabel = template.type === 'flyer' ? 'Flyer' : template.type === 'post' ? 'Post' : 'Story';
              return (
                <button
                  key={template.id}
                  onClick={() => navigate(`/transactions/${id}/marketing?template=${template.id}`)}
                  className="group border-2 border-transparent rounded-xl overflow-hidden bg-background hover:shadow-xl hover:border-primary transition-all hover:-translate-y-0.5 text-left flex flex-col w-full"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative overflow-hidden bg-muted shrink-0"
                    style={{ height: THUMB_H, width: '100%' }}
                  >
                    <div
                      style={{
                        transform: `scale(${thumbScale})`,
                        transformOrigin: 'top left',
                        width: template.width,
                        height: template.height,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      }}
                    >
                      {template.render({
                        ...getDefaultTemplateData(deal, template.category),
                        photos: dealPhotos.map((p) => p.url),
                      }, false)}
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                        Open in Editor
                      </span>
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="px-3 py-2.5 border-t flex flex-col gap-1">
                    <div className="text-xs font-bold text-foreground leading-tight">{template.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{template.category}</span>
                      <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{typeLabel}</span>
                    </div>
                    <div className="text-[9px] text-muted-foreground/50 tabular-nums">{template.width}×{template.height}px</div>
                  </div>
                </button>
              );
            })}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        {c.first_name} {c.last_name}{c.email ? ` - ${c.email}` : ''}
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

      <Dialog open={addFormsOpen} onOpenChange={(open) => {
        setAddFormsOpen(open);
        if (!open) {
          setHiddenFormSearch('');
          setSelectedHiddenForms(new Set());
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Hidden Forms</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>{addableForms.length} hidden forms available</span>
              <span>{selectedHiddenForms.size} selected</span>
            </div>
            <Input
              value={hiddenFormSearch}
              onChange={(event) => setHiddenFormSearch(event.target.value)}
              placeholder="Search hidden forms..."
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedHiddenForms(new Set(filteredAddableForms.map((form) => form.file_name)))}
                disabled={filteredAddableForms.length === 0}
              >
                Select Filtered
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => setSelectedHiddenForms(new Set())}
                disabled={selectedHiddenForms.size === 0}
              >
                Clear
              </Button>
            </div>
            <div className="max-h-[420px] overflow-auto border rounded-md">
              {filteredAddableForms.length === 0 ? (
                <div className="px-4 py-8 text-sm text-center text-muted-foreground">
                  No hidden forms match your search.
                </div>
              ) : (
                filteredAddableForms.map((form) => (
                  <label
                    key={form.file_name}
                    className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={selectedHiddenForms.has(form.file_name)}
                      onCheckedChange={() => handleToggleHiddenForm(form.file_name)}
                    />
                    <div className="min-w-0">
                      <div className="text-sm text-foreground">{form.checklistName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{form.file_name}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setAddFormsOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddHiddenForms}
                disabled={selectedHiddenForms.size === 0 || addChecklistItems.isPending}
              >
                {addChecklistItems.isPending ? 'Adding...' : `Add ${selectedHiddenForms.size || ''}`.trim()}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
