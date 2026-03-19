import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, Edit, Eye, Mail, Plus, FileText, GripVertical, Download, Printer, Send, Trash2, MessageSquare, Bell, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeal } from '@/hooks/useDeals';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SignaturePanel } from '@/components/deal/SignaturePanel';

const TABS = ['Checklists', 'Photos', 'Tasks', 'Notes', 'Marketing'] as const;

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: deal, isLoading } = useDeal(id);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Checklists');
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureDocName, setSignatureDocName] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading deal...</p>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Deal not found</p>
      </div>
    );
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

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">{deal.address}</h1>
              <button className="text-primary text-sm hover:underline flex items-center gap-1">
                <Edit className="w-3 h-3" /> Edit
              </button>
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
        <div className="flex items-center gap-2 mt-4">
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Make Visible To Office
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                Open House <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Schedule Open House</DropdownMenuItem>
              <DropdownMenuItem>View Open Houses</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Offer
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Email
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs gap-1.5">
                Change Status <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Draft</DropdownMenuItem>
              <DropdownMenuItem>Active</DropdownMenuItem>
              <DropdownMenuItem>Pending</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-4 -mb-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
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
                  {deal.mls_number ? (
                    <span className="text-foreground">{deal.mls_number}</span>
                  ) : (
                    <button className="text-primary text-sm hover:underline">Add MLS# Number</button>
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
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {c.firstName[0]}{c.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground">{c.firstName} {c.lastName}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{c.role}</span>
                  </div>
                ))}
                <button className="text-sm text-primary hover:underline flex items-center gap-1">
                  <UserPlus className="w-3 h-3" /> Add a New Contact
                </button>
              </div>
            </div>

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
                <span className="text-foreground">{deal.price}</span>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
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
                    <div
                      className={cn(
                        'flex items-center px-3 py-3 border-b last:border-b-0 group transition-colors',
                        isExpanded && 'bg-info-light'
                      )}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 mr-2 flex-shrink-0 cursor-grab" />
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="mr-2 flex-shrink-0"
                      >
                        {item.has_digital_form ? (
                          isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </button>
                      <span className="text-sm text-foreground flex-1">{item.name}</span>

                      {/* Always-visible split button */}
                      <div className="flex items-center">
                        {item.has_digital_form && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs rounded-r-none border-r-0"
                            onClick={() => navigate(`/transactions/${deal.id}/form/${item.id}`)}
                          >
                            Edit Form
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className={cn("h-7 w-7", item.has_digital_form ? "rounded-l-none" : "")}
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/transactions/${deal.id}/form/${item.id}`)}>
                              <Printer className="w-3.5 h-3.5 mr-2" /> View/Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSignatureDocName(item.name); setSignatureOpen(true); }}>
                              <Send className="w-3.5 h-3.5 mr-2" /> Docusign
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-3.5 h-3.5 mr-2" /> Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="w-3.5 h-3.5 mr-2" /> Upload
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-3.5 h-3.5 mr-2" /> Message Office
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Bell className="w-3.5 h-3.5 mr-2" /> Notify Office to Review
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Nested Digital Form */}
                    {isExpanded && item.has_digital_form && (
                      <div className="flex items-center px-3 py-2.5 pl-14 border-b bg-info-light/50">
                        <FileText className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                        <span className="text-sm text-foreground flex-1">Digital Form</span>
                        <div className="flex items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs rounded-r-none border-r-0"
                            onClick={() => navigate(`/transactions/${deal.id}/form/${item.id}`)}
                          >
                            Edit Form
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon" className="h-7 w-7 rounded-l-none">
                                <ChevronDown className="w-3.5 h-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSignatureDocName(item.name); setSignatureOpen(true); }}>
                                <Send className="w-3.5 h-3.5 mr-2" /> Docusign
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/transactions/${deal.id}/form/${item.id}`)}>
                                <Printer className="w-3.5 h-3.5 mr-2" /> View/Print
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-3.5 h-3.5 mr-2" /> Email
                              </DropdownMenuItem>
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

      {activeTab !== 'Checklists' && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">{activeTab} — Coming soon</p>
        </div>
      )}

      {/* Signature Panel */}
      <SignaturePanel
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        documentName={signatureDocName}
        contacts={contacts.map((c) => ({ id: c.id, role: c.role, firstName: c.firstName, lastName: c.lastName, email: c.email || '', phone: c.phone || '', company: c.company || '' }))}
      />
    </div>
  );
}
