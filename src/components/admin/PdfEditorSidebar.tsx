import { useState } from 'react';
import {
  Users, FileText, List, LayoutGrid, Settings, HelpCircle,
  PenTool, Hash, User, Mail, CalendarDays, Clock,
  Type, Highlighter, Minus, Pencil, Strikethrough, Circle,
  Plus, ChevronDown, GripVertical, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ToolMode } from './PdfToolbar';

export type SidebarTab = 'signers' | 'docs' | 'tools' | 'layouts' | 'options' | 'feedback';

export interface Signer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  type: string;
}

export interface SavedDocument {
  id: string;
  file_name: string;
  updated_at: string | null;
}

interface PdfEditorSidebarProps {
  activeTab: SidebarTab | null;
  onTabChange: (tab: SidebarTab | null) => void;
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  signers: Signer[];
  onAddSigner: (signer: Omit<Signer, 'id'>) => void;
  onRemoveSigner: (id: string) => void;
  selectedSignerId: string | null;
  onSelectSigner: (id: string | null) => void;
  documents: { name: string }[];
  savedDocuments?: SavedDocument[];
  onOpenDocument?: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
  mode?: 'admin' | 'agent';
}

const allTabs: { id: SidebarTab; icon: React.ElementType; label: string }[] = [
  { id: 'signers', icon: Users, label: 'Signers' },
  { id: 'docs', icon: FileText, label: 'Docs' },
  { id: 'tools', icon: List, label: 'Tools' },
  { id: 'layouts', icon: LayoutGrid, label: 'Layouts' },
  { id: 'options', icon: Settings, label: 'Options' },
  { id: 'feedback', icon: HelpCircle, label: 'Feedback' },
];

const agentTabs: SidebarTab[] = ['signers', 'tools'];

const ROLES = ['Seller', 'Buyer', 'Agent', 'Broker', 'Attorney', 'Other'];

export function PdfEditorSidebar({
  activeTab,
  onTabChange,
  activeTool,
  onToolChange,
  signers,
  onAddSigner,
  onRemoveSigner,
  selectedSignerId,
  onSelectSigner,
  documents,
  savedDocuments = [],
  onOpenDocument,
  onDeleteDocument,
  mode = 'admin',
}: PdfEditorSidebarProps) {
  const tabs = mode === 'agent' ? allTabs.filter(t => agentTabs.includes(t.id)) : allTabs;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSigner, setNewSigner] = useState({ firstName: '', lastName: '', email: '', role: 'Seller', type: 'Remote Signer' });
  const [signingOrder, setSigningOrder] = useState(false);

  const handleToggleTab = (tab: SidebarTab) => {
    onTabChange(activeTab === tab ? null : tab);
  };

  const handleAddSigner = () => {
    if (!newSigner.firstName || !newSigner.email) return;
    onAddSigner(newSigner);
    setNewSigner({ firstName: '', lastName: '', email: '', role: 'Seller', type: 'Remote Signer' });
    setShowAddForm(false);
  };

  return (
    <div className="flex h-full">
      {/* Panel content */}
      {activeTab && (
        <div className="w-[350px] border-l bg-card flex flex-col overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4">
              {activeTab === 'signers' && (
                <SignersPanel
                  signers={signers}
                  signingOrder={signingOrder}
                  onSigningOrderChange={setSigningOrder}
                  selectedSignerId={selectedSignerId}
                  onSelectSigner={onSelectSigner}
                  onRemoveSigner={onRemoveSigner}
                  showAddForm={showAddForm}
                  setShowAddForm={setShowAddForm}
                  newSigner={newSigner}
                  setNewSigner={setNewSigner}
                  onAddSigner={handleAddSigner}
                />
              )}
              {activeTab === 'docs' && (
                <DocsPanel
                  documents={documents}
                  savedDocuments={savedDocuments}
                  onOpenDocument={onOpenDocument}
                  onDeleteDocument={onDeleteDocument}
                />
              )}
              {activeTab === 'tools' && (
                <ToolsPanel
                  activeTool={activeTool}
                  onToolChange={onToolChange}
                  signers={signers}
                  selectedSignerId={selectedSignerId}
                  onSelectSigner={onSelectSigner}
                />
              )}
              {activeTab === 'layouts' && <LayoutsPanel />}
              {activeTab === 'options' && <OptionsPanel />}
              {activeTab === 'feedback' && <FeedbackPanel />}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Tab icon strip */}
      <div className="w-[60px] bg-muted/50 border-l flex flex-col items-center py-2 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleToggleTab(tab.id)}
            className={cn(
              'w-12 h-12 rounded-md flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-[#2D5F2B] text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={tab.label}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Panel components ─── */

function SignersPanel({
  signers, signingOrder, onSigningOrderChange,
  selectedSignerId, onSelectSigner, onRemoveSigner,
  showAddForm, setShowAddForm, newSigner, setNewSigner, onAddSigner,
}: {
  signers: Signer[];
  signingOrder: boolean;
  onSigningOrderChange: (v: boolean) => void;
  selectedSignerId: string | null;
  onSelectSigner: (id: string | null) => void;
  onRemoveSigner: (id: string) => void;
  showAddForm: boolean;
  setShowAddForm: (v: boolean) => void;
  newSigner: { firstName: string; lastName: string; email: string; role: string; type: string };
  setNewSigner: (v: any) => void;
  onAddSigner: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Signers</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Set signing order</span>
          <Switch checked={signingOrder} onCheckedChange={onSigningOrderChange} />
        </div>
      </div>

      <div className="space-y-2">
        {signers.map((s, idx) => (
          <div
            key={s.id}
            onClick={() => onSelectSigner(s.id === selectedSignerId ? null : s.id)}
            className={cn(
              'flex items-center gap-3 p-2 rounded-md cursor-pointer border transition-colors',
              s.id === selectedSignerId ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'
            )}
          >
            {signingOrder && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                {idx + 1}
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
              {s.firstName[0]}{s.lastName?.[0] || ''}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{s.firstName} {s.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{s.role} • {s.email}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemoveSigner(s.id); }}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {showAddForm ? (
        <div className="space-y-3 p-3 border rounded-md bg-muted/30">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">First Name</Label>
              <Input
                value={newSigner.firstName}
                onChange={(e) => setNewSigner({ ...newSigner, firstName: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Last Name</Label>
              <Input
                value={newSigner.lastName}
                onChange={(e) => setNewSigner({ ...newSigner, lastName: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={newSigner.email}
              onChange={(e) => setNewSigner({ ...newSigner, email: e.target.value })}
              className="h-8 text-sm"
            />
          </div>
          <div>
            <Label className="text-xs">Role</Label>
            <Select value={newSigner.role} onValueChange={(v) => setNewSigner({ ...newSigner, role: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Signer Type</Label>
            <Select value={newSigner.type} onValueChange={(v) => setNewSigner({ ...newSigner, type: v })}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Remote Signer">Remote Signer</SelectItem>
                <SelectItem value="In-Person Signer">In-Person Signer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={onAddSigner} className="flex-1">Save</Button>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="w-4 h-4" /> Add Participants <ChevronDown className="w-3 h-3 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setShowAddForm(true)}>Add New</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShowAddForm(true)}>Add from Contacts</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Button variant="outline" size="sm" className="w-full">Map Signers</Button>
    </div>
  );
}

function DocsPanel({
  documents,
  savedDocuments = [],
  onOpenDocument,
  onDeleteDocument,
}: {
  documents: { name: string }[];
  savedDocuments?: SavedDocument[];
  onOpenDocument?: (id: string) => void;
  onDeleteDocument?: (id: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Current Document</h3>
      <div className="space-y-2">
        {documents.map((doc, idx) => (
          <div key={idx} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
            <span className="w-5 h-5 rounded bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{idx + 1}</span>
            <span className="text-sm truncate flex-1">{doc.name}</span>
          </div>
        ))}
      </div>

      {savedDocuments.length > 0 && (
        <>
          <Separator />
          <h3 className="text-sm font-semibold text-foreground">Saved Documents</h3>
          <div className="space-y-2">
            {savedDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{doc.file_name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : ''}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onOpenDocument?.(doc.id)}>
                  <FileText className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-destructive" onClick={() => onDeleteDocument?.(doc.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </>
      )}

      <Button variant="outline" size="sm" className="w-full gap-2">
        <Plus className="w-4 h-4" /> Add a Document or Form
      </Button>
    </div>
  );
}

function ToolsPanel({
  activeTool, onToolChange, signers, selectedSignerId, onSelectSigner,
}: {
  activeTool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  signers: Signer[];
  selectedSignerId: string | null;
  onSelectSigner: (id: string | null) => void;
}) {
  const signerActions: { mode: ToolMode; icon: React.ElementType; label: string }[] = [
    { mode: 'designate-signature', icon: PenTool, label: 'Sign Here' },
    { mode: 'designate-initials', icon: Hash, label: 'Initials' },
  ];

  const signerFields: { mode: ToolMode; icon: React.ElementType; label: string }[] = [
    { mode: 'text', icon: User, label: 'Full Name' },
    { mode: 'text', icon: Mail, label: 'Email Address' },
    { mode: 'designate-date', icon: CalendarDays, label: 'Auto Date' },
    { mode: 'designate-date', icon: Clock, label: 'Auto Time' },
  ];

  const markupTools: { mode: ToolMode; icon: React.ElementType; label: string }[] = [
    { mode: 'text', icon: Type, label: 'Text Box' },
    { mode: 'highlight', icon: Highlighter, label: 'Highlight' },
    { mode: 'line', icon: Minus, label: 'Line' },
    { mode: 'draw', icon: Pencil, label: 'Freehand' },
    { mode: 'strikethrough', icon: Strikethrough, label: 'Strikethrough' },
    { mode: 'ellipse', icon: Circle, label: 'Ellipse' },
  ];

  return (
    <div className="space-y-5">
      {/* Signer selector */}
      {signers.length > 0 && (
        <div>
          <Label className="text-xs mb-1.5 block">Assign to Signer</Label>
          <Select
            value={selectedSignerId || ''}
            onValueChange={(v) => onSelectSigner(v || null)}
          >
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select signer..." /></SelectTrigger>
            <SelectContent>
              {signers.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Signer Actions */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Signer Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {signerActions.map((t) => (
            <ToolButton key={t.label} {...t} active={activeTool === t.mode} onClick={() => onToolChange(t.mode)} />
          ))}
        </div>
      </div>

      {/* Signer Fields */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Signer Fields</h4>
        <div className="grid grid-cols-2 gap-2">
          {signerFields.map((t) => (
            <ToolButton key={t.label} {...t} active={false} onClick={() => onToolChange(t.mode)} />
          ))}
        </div>
      </div>

      <Separator />

      {/* Markup */}
      <div>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Markup</h4>
        <div className="grid grid-cols-2 gap-2">
          {markupTools.map((t) => (
            <ToolButton key={t.label} {...t} active={activeTool === t.mode} onClick={() => onToolChange(t.mode)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ToolButton({ icon: Icon, label, active, onClick }: { icon: React.ElementType; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-colors text-left',
        active
          ? 'bg-[#2D5F2B] text-white border-[#2D5F2B]'
          : 'bg-card text-foreground border-border hover:bg-muted/50'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function LayoutsPanel() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Layouts</h3>
      <p className="text-sm text-muted-foreground">Predefined field layouts coming soon.</p>
    </div>
  );
}

function OptionsPanel() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Options</h3>
      <Accordion type="multiple" className="w-full">
        <AccordionItem value="signature">
          <AccordionTrigger className="text-sm">Change Signature</AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground">Update your signature or initials style.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="signing-details">
          <AccordionTrigger className="text-sm">Signing Details</AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground">Configure signing PINs and authentication.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="expiration">
          <AccordionTrigger className="text-sm">Expiration Dates</AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground">Set document expiration date and time.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="reminders">
          <AccordionTrigger className="text-sm">Reminders</AccordionTrigger>
          <AccordionContent>
            <p className="text-xs text-muted-foreground">Configure automatic reminder emails.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="clear">
          <AccordionTrigger className="text-sm">Clear Signing Fields</AccordionTrigger>
          <AccordionContent>
            <Button variant="destructive" size="sm">Clear All Fields</Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function FeedbackPanel() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground">Feedback</h3>
      <p className="text-sm text-muted-foreground">Have questions or feedback? Let us know.</p>
      <Button variant="outline" size="sm" className="w-full">Send Feedback</Button>
    </div>
  );
}
