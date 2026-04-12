import { useRef, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronDown,
  ImagePlus,
  X,
  LayoutTemplate,
  Pencil,
  Undo2,
  Redo2,
  Clock,
} from 'lucide-react';
import { useDeal } from '@/hooks/useDeals';
import { useDealPhotos } from '@/hooks/useDealPhotos';
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  getDefaultTemplateData,
  type TemplateData,
  type TemplateCategory,
} from '@/data/marketingTemplates';
import { cn } from '@/lib/utils';

// ── Recents persistence (localStorage, keyed per deal) ──────────────────────

export interface RecentEntry {
  templateId: string;
  data: TemplateData;
  lastEdited: number; // ms timestamp
}

const RECENTS_LIMIT = 20;

function recentsKey(dealId: string) {
  return `uer_marketing_recents_${dealId}`;
}

function loadRecents(dealId: string): RecentEntry[] {
  try {
    const raw = localStorage.getItem(recentsKey(dealId));
    return raw ? (JSON.parse(raw) as RecentEntry[]) : [];
  } catch {
    return [];
  }
}

function saveRecents(dealId: string, entries: RecentEntry[]) {
  try {
    localStorage.setItem(recentsKey(dealId), JSON.stringify(entries.slice(0, RECENTS_LIMIT)));
  } catch {
    // storage full — ignore
  }
}

/** Upsert a recent entry for a given deal+template, then sort by lastEdited desc */
function upsertRecent(dealId: string, templateId: string, data: TemplateData) {
  const entries = loadRecents(dealId).filter((e) => e.templateId !== templateId);
  const updated: RecentEntry[] = [
    { templateId, data, lastEdited: Date.now() },
    ...entries,
  ];
  saveRecents(dealId, updated);
  return updated;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<TemplateCategory, string> = {
  'Just Listed':    'bg-emerald-100 text-emerald-800',
  'Open House':     'bg-green-100 text-green-800',
  'Coming Soon':    'bg-amber-100 text-amber-800',
  'Just Sold':      'bg-rose-100 text-rose-800',
  'Price Cut':      'bg-red-100 text-red-800',
  'Under Contract': 'bg-blue-100 text-blue-800',
};

const TYPE_LABELS: Record<string, string> = {
  flyer: 'Flyer',
  post: 'Social Post',
  story: 'Story',
};

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MarketingEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateId = searchParams.get('template') || TEMPLATES[0].id;
  const navigate = useNavigate();
  const { data: deal } = useDeal(id);
  const { data: dealPhotos = [] } = useDealPhotos(id);
  const canvasRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  // ── History (undo / redo) ─────────────────────────────────────────────────
  const [history, setHistory] = useState<TemplateData[]>([getDefaultTemplateData()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const data = history[historyIndex];

  const setData = useCallback((updater: TemplateData | ((prev: TemplateData) => TemplateData)) => {
    setHistory((prev) => {
      const current = prev[historyIndex];
      const next = typeof updater === 'function' ? updater(current) : updater;
      return [...prev.slice(0, historyIndex + 1), next];
    });
    setHistoryIndex((i) => i + 1);
  }, [historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) setHistoryIndex((i) => i - 1);
  }, [canUndo]);

  const handleRedo = useCallback(() => {
    if (canRedo) setHistoryIndex((i) => i + 1);
  }, [canRedo]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); handleRedo(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleUndo, handleRedo]);

  // ── Recents state ─────────────────────────────────────────────────────────
  const [recents, setRecents] = useState<RecentEntry[]>(() =>
    id ? loadRecents(id) : []
  );

  // Auto-save: debounce 600ms after any data change
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!id) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const updated = upsertRecent(id, templateId, data);
      setRecents(updated);
    }, 600);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, id, templateId]);

  // ── Other UI state ────────────────────────────────────────────────────────
  const [photosInitialized, setPhotosInitialized] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [basicsOpen, setBasicsOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(true);
  const [ohOpen, setOhOpen] = useState(true);
  const [leftTab, setLeftTab] = useState<'templates' | 'edit' | 'recent'>('templates');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'All'>('All');
  const [exporting, setExporting] = useState(false);

  // Auto-fill from deal data (preserve existing photos)
  useEffect(() => {
    if (deal) {
      // Check if there's a saved session for the current template first
      const saved = id ? loadRecents(id).find((r) => r.templateId === templateId) : null;
      if (saved) {
        setHistory([saved.data]);
        setHistoryIndex(0);
      } else {
        setData((prev) => ({ ...getDefaultTemplateData(deal), photos: prev.photos }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal, templateId]);

  // Auto-populate deal photos on first load (only if no saved session)
  useEffect(() => {
    if (!photosInitialized && dealPhotos.length > 0) {
      const saved = id ? loadRecents(id).find((r) => r.templateId === templateId) : null;
      if (!saved) {
        setData((prev) => ({ ...prev, photos: dealPhotos.map((p) => p.url) }));
      }
      setPhotosInitialized(true);
    }
  }, [dealPhotos, photosInitialized, id, templateId]);

  const updateField = useCallback((field: keyof TemplateData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  }, [setData]);

  // Photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setData((prev) => ({ ...prev, photos: [url, ...prev.photos] }));
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setData((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const selectTemplate = (tid: string) => {
    setSearchParams({ template: tid });
    setLeftTab('edit');
  };

  /** Resume a recent entry: load its saved data and switch to edit tab */
  const resumeRecent = (entry: RecentEntry) => {
    setSearchParams({ template: entry.templateId });
    setHistory([entry.data]);
    setHistoryIndex(0);
    setLeftTab('edit');
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(canvasRef.current, {
        width: template.width,
        height: template.height,
        pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-${data.address.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  }, [template, data.address]);

  // Scale canvas to viewport
  const maxCanvasWidth = typeof window !== 'undefined' ? window.innerWidth - 680 : 600;
  const maxCanvasHeight = typeof window !== 'undefined' ? window.innerHeight - 120 : 600;
  const naturalScale = Math.min(maxCanvasWidth / template.width, maxCanvasHeight / template.height, 1);
  const scale = naturalScale * zoom;

  const filteredTemplates =
    categoryFilter === 'All' ? TEMPLATES : TEMPLATES.filter((t) => t.category === categoryFilter);

  return (
    <div className="h-screen flex flex-col bg-muted/20">
      {/* ── Top Toolbar ── */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{template.name}</span>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', CATEGORY_COLORS[template.category])}>
              {template.category}
            </span>
            <span className="text-xs text-muted-foreground">
              {TYPE_LABELS[template.type]} · {template.width}×{template.height}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border rounded-md px-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-1 border rounded-md px-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.max(0.15, +(z - 0.1).toFixed(2)))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Button onClick={handleExport} size="sm" disabled={exporting} className="gap-2">
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting…' : 'Download PNG'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        <div className="w-[260px] border-r bg-background shrink-0 flex flex-col">
          {/* Tab bar: Templates | Edit | Recent */}
          <div className="flex border-b shrink-0">
            <button
              onClick={() => setLeftTab('templates')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
                leftTab === 'templates'
                  ? 'text-foreground border-b-2 border-primary -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <LayoutTemplate className="h-3 w-3" />
              Templates
            </button>
            <button
              onClick={() => setLeftTab('edit')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors',
                leftTab === 'edit'
                  ? 'text-foreground border-b-2 border-primary -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
            <button
              onClick={() => setLeftTab('recent')}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-2.5 text-[11px] font-semibold transition-colors relative',
                leftTab === 'recent'
                  ? 'text-foreground border-b-2 border-primary -mb-px'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Clock className="h-3 w-3" />
              Recent
              {recents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-primary text-primary-foreground rounded-full text-[8px] flex items-center justify-center font-bold">
                  {recents.length > 9 ? '9+' : recents.length}
                </span>
              )}
            </button>
          </div>

          {/* ── Templates tab ── */}
          {leftTab === 'templates' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-2 border-b flex flex-wrap gap-1 shrink-0">
                <button
                  onClick={() => setCategoryFilter('All')}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors',
                    categoryFilter === 'All'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  All
                </button>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors',
                      categoryFilter === cat
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2 grid grid-cols-2 gap-2">
                  {filteredTemplates.map((t) => {
                    const thumbScale = 110 / t.width;
                    const thumbH = t.height * thumbScale;
                    const isSelected = t.id === templateId;
                    return (
                      <button
                        key={t.id}
                        onClick={() => selectTemplate(t.id)}
                        className={cn(
                          'group flex flex-col rounded-lg overflow-hidden border-2 transition-all text-left',
                          isSelected ? 'border-primary shadow-md' : 'border-transparent hover:border-muted-foreground/30'
                        )}
                      >
                        <div className="overflow-hidden bg-muted relative" style={{ height: Math.min(thumbH, 160), width: '100%' }}>
                          <div
                            style={{
                              transform: `scale(${thumbScale})`,
                              transformOrigin: 'top left',
                              width: t.width,
                              height: t.height,
                              pointerEvents: 'none',
                              userSelect: 'none',
                            }}
                          >
                            {t.render({ ...getDefaultTemplateData(deal), photos: data.photos }, false)}
                          </div>
                        </div>
                        <div className="px-2 py-1.5 bg-background">
                          <div className="text-[10px] font-semibold text-foreground truncate">{t.name}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5">{TYPE_LABELS[t.type]}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* ── Edit tab ── */}
          {leftTab === 'edit' && (
            <ScrollArea className="flex-1">
              <div className="p-3 space-y-1">
                {/* Photo Upload */}
                <div className="pb-4 border-b mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-foreground">Property Photos</div>
                    {dealPhotos.length > 0 && (
                      <span className="text-[9px] text-muted-foreground">{dealPhotos.length} from deal</span>
                    )}
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {data.photos.length === 0 ? (
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs"
                    >
                      <ImagePlus className="h-5 w-5" />
                      <span>Click to add photo</span>
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {data.photos.map((src, i) => (
                        <div key={i} className="relative group">
                          <img src={src} alt="" className="w-16 h-16 object-cover rounded border" />
                          <button
                            onClick={() => removePhoto(i)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                          {i === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 text-[8px] bg-black/60 text-white text-center py-0.5 rounded-b">
                              Main
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Property Details */}
                <Collapsible open={basicsOpen} onOpenChange={setBasicsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80">
                    Property Details
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${basicsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2.5 pb-4">
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Headline</Label>
                      <Input value={data.headline} onChange={(e) => updateField('headline', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Address</Label>
                      <Input value={data.address} onChange={(e) => updateField('address', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">City</Label>
                        <Input value={data.city} onChange={(e) => updateField('city', e.target.value)} className="mt-1 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">State</Label>
                        <Input value={data.state} onChange={(e) => updateField('state', e.target.value)} className="mt-1 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Zip</Label>
                        <Input value={data.zip} onChange={(e) => updateField('zip', e.target.value)} className="mt-1 h-7 text-xs" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Price</Label>
                      <Input value={data.price} onChange={(e) => updateField('price', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Beds</Label>
                        <Input value={data.beds} onChange={(e) => updateField('beds', e.target.value)} className="mt-1 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Baths</Label>
                        <Input value={data.baths} onChange={(e) => updateField('baths', e.target.value)} className="mt-1 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Sq Ft</Label>
                        <Input value={data.sqft} onChange={(e) => updateField('sqft', e.target.value)} className="mt-1 h-7 text-xs" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Description</Label>
                      <Textarea value={data.description} onChange={(e) => updateField('description', e.target.value)} className="mt-1 text-xs" rows={3} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Agent Info */}
                <Collapsible open={agentOpen} onOpenChange={setAgentOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t">
                    Agent Info
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${agentOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2.5 pb-4">
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Name</Label>
                      <Input value={data.agentName} onChange={(e) => updateField('agentName', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Title</Label>
                      <Input value={data.agentTitle} onChange={(e) => updateField('agentTitle', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Phone</Label>
                      <Input value={data.agentPhone} onChange={(e) => updateField('agentPhone', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Email</Label>
                      <Input value={data.agentEmail} onChange={(e) => updateField('agentEmail', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Open House */}
                {template.category === 'Open House' && (
                  <Collapsible open={ohOpen} onOpenChange={setOhOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t">
                      Open House Details
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${ohOpen ? 'rotate-180' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2.5 pb-4">
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Date</Label>
                        <Input value={data.openHouseDate} onChange={(e) => updateField('openHouseDate', e.target.value)} className="mt-1 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Time</Label>
                        <Input value={data.openHouseTime} onChange={(e) => updateField('openHouseTime', e.target.value)} className="mt-1 h-7 text-xs" />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </ScrollArea>
          )}

          {/* ── Recent tab ── */}
          {leftTab === 'recent' && (
            <ScrollArea className="flex-1">
              <div className="p-3">
                {recents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
                    <Clock className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-xs font-medium text-muted-foreground">No recent sessions yet</p>
                    <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
                      Your edits save automatically.<br />Come back here to pick up where you left off.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-semibold mb-3">
                      {recents.length} saved session{recents.length !== 1 ? 's' : ''}
                    </p>
                    {recents.map((entry) => {
                      const t = TEMPLATES.find((t) => t.id === entry.templateId);
                      if (!t) return null;
                      const thumbScale = 80 / t.width;
                      const thumbH = Math.round(t.height * thumbScale);
                      const isActive = entry.templateId === templateId;
                      return (
                        <button
                          key={entry.templateId}
                          onClick={() => resumeRecent(entry)}
                          className={cn(
                            'w-full flex items-start gap-2.5 p-2 rounded-lg border-2 text-left transition-all hover:bg-muted/60',
                            isActive ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted-foreground/20'
                          )}
                        >
                          {/* Mini preview */}
                          <div
                            className="rounded overflow-hidden bg-muted shrink-0 border"
                            style={{ width: 80, height: thumbH }}
                          >
                            <div
                              style={{
                                transform: `scale(${thumbScale})`,
                                transformOrigin: 'top left',
                                width: t.width,
                                height: t.height,
                                pointerEvents: 'none',
                                userSelect: 'none',
                              }}
                            >
                              {t.render(entry.data, false)}
                            </div>
                          </div>
                          {/* Info */}
                          <div className="flex flex-col gap-0.5 min-w-0 flex-1 pt-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-semibold text-foreground truncate">{t.name}</span>
                              {isActive && (
                                <span className="text-[8px] font-bold px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full shrink-0">
                                  Active
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground truncate">{entry.data.address}</span>
                            <span className={cn(
                              'text-[10px] font-semibold px-1.5 py-0.5 rounded-full self-start mt-0.5',
                              CATEGORY_COLORS[t.category]
                            )}>
                              {t.category}
                            </span>
                            <span className="text-[9px] text-muted-foreground/70 mt-1">
                              {timeAgo(entry.lastEdited)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* ── Canvas Area ── */}
        <div className="flex-1 overflow-auto flex items-start justify-center p-8 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] [background-size:20px_20px]">
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
              marginTop: 0,
            }}
          >
            <div
              ref={canvasRef}
              className="shadow-2xl"
              style={{ width: template.width, height: template.height }}
            >
              {template.render(data, true)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
