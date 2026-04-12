import { useRef, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  MoreVertical,
  ExternalLink,
  Copy,
  Trash2,
  PencilLine,
  LayoutGrid,
  User,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeal } from '@/hooks/useDeals';
import { useDealPhotos } from '@/hooks/useDealPhotos';
import {
  TEMPLATES,
  TEMPLATE_CATEGORIES,
  DEFAULT_TEMPLATE_VISIBILITY,
  getDefaultTemplateData,
  mergeMarketingBlockTransforms,
  type AgentLayout,
  type HeadlineStyle,
  type MarketingBlockKey,
  type PhotoLayout,
  type TemplateData,
  type TemplateCategory,
  type TemplateVisibility,
} from '@/data/marketingTemplates';
import { cn } from '@/lib/utils';

// ── Recents persistence (localStorage, keyed per deal) ──────────────────────

export interface RecentEntry {
  templateId: string;
  data: TemplateData;
  lastEdited: number; // ms timestamp
  customName?: string; // user-defined name
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

type EditableTextField =
  | 'headline'
  | 'address'
  | 'city'
  | 'state'
  | 'zip'
  | 'price'
  | 'beds'
  | 'baths'
  | 'sqft'
  | 'description'
  | 'agentName'
  | 'agentTitle'
  | 'agentPhone'
  | 'agentEmail'
  | 'openHouseDate'
  | 'openHouseTime';

type MarketingBlockRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type MarketingBlockInteraction = {
  block: MarketingBlockKey;
  mode: 'move' | 'resize';
  startClientX: number;
  startClientY: number;
  startTransform: {
    x: number;
    y: number;
    scale: number;
  };
  baseRect: MarketingBlockRect;
  committed: boolean;
};

const MARKETING_BLOCK_LABELS: Record<MarketingBlockKey, string> = {
  logo: 'Logo',
  photo: 'Photo',
  headline: 'Headline',
  address: 'Address',
  price: 'Price',
  stats: 'Beds / Baths / Sq Ft',
  description: 'Description',
  agent: 'Agent info',
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

function VisibilityLabel({
  htmlFor,
  label,
  checked,
  onCheckedChange,
}: {
  htmlFor: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label htmlFor={htmlFor} className="text-[10px] text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      <label htmlFor={htmlFor} className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground cursor-pointer">
        <Checkbox
          id={htmlFor}
          checked={checked}
          onCheckedChange={(next) => onCheckedChange(next === true)}
        />
        Show
      </label>
    </div>
  );
}

function OptionCard({
  label,
  description,
  active,
  icon: Icon,
  preview,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  icon?: React.ElementType;
  preview?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-2xl border p-4 text-left transition-all hover:border-foreground/25 hover:bg-muted/40',
        active ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-background'
      )}
    >
      <div className="mb-4 flex h-12 items-center justify-center rounded-xl bg-muted/40">
        {preview ?? (Icon ? <Icon className={cn('h-6 w-6', active ? 'text-primary' : 'text-foreground')} /> : null)}
      </div>
      <div className="text-sm font-semibold text-foreground">{label}</div>
      <div className="mt-1 text-[11px] leading-4 text-muted-foreground">{description}</div>
    </button>
  );
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
  const previewShellRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const scaleRef = useRef(1);
  const interactionRef = useRef<MarketingBlockInteraction | null>(null);

  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  // ── History (undo / redo) ─────────────────────────────────────────────────
  // Use a single state object so index + history update atomically (no stale closure crash)
  const [hist, setHist] = useState<{ stack: TemplateData[]; index: number }>({
    stack: [getDefaultTemplateData(undefined, template.category)],
    index: 0,
  });
  const data = hist.stack[hist.index] ?? getDefaultTemplateData(undefined, template.category);

  const setData = useCallback((updater: TemplateData | ((prev: TemplateData) => TemplateData)) => {
    setHist((h) => {
      const current = h.stack[h.index];
      const next = typeof updater === 'function' ? updater(current) : updater;
      const newStack = [...h.stack.slice(0, h.index + 1), next];
      return { stack: newStack, index: newStack.length - 1 };
    });
  }, []);

  const replaceCurrentData = useCallback((updater: TemplateData | ((prev: TemplateData) => TemplateData)) => {
    setHist((h) => {
      const current = h.stack[h.index];
      const next = typeof updater === 'function' ? updater(current) : updater;
      const stack = [...h.stack];
      stack[h.index] = next;
      return { stack, index: h.index };
    });
  }, []);

  const hydrateTemplateData = useCallback((base: TemplateData, incoming?: Partial<TemplateData> | null): TemplateData => {
    const merged = {
      ...base,
      ...(incoming ?? {}),
    } as TemplateData;

    return {
      ...merged,
      visibility: {
        ...DEFAULT_TEMPLATE_VISIBILITY,
        ...(incoming?.visibility ?? {}),
      },
      blockTransforms: mergeMarketingBlockTransforms(incoming?.blockTransforms),
      agents: incoming?.agents?.length
        ? incoming.agents
        : [{
            name: incoming?.agentName ?? base.agentName,
            title: incoming?.agentTitle ?? base.agentTitle,
            phone: incoming?.agentPhone ?? base.agentPhone,
            email: incoming?.agentEmail ?? base.agentEmail,
          }],
    };
  }, []);

  const canUndo = hist.index > 0;
  const canRedo = hist.index < hist.stack.length - 1;

  const handleUndo = useCallback(() => {
    setHist((h) => h.index > 0 ? { ...h, index: h.index - 1 } : h);
  }, []);

  const handleRedo = useCallback(() => {
    setHist((h) => h.index < h.stack.length - 1 ? { ...h, index: h.index + 1 } : h);
  }, []);

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
  const [studioBasicsOpen, setStudioBasicsOpen] = useState(true);
  const [studioAgentsOpen, setStudioAgentsOpen] = useState(true);
  const [basicsOpen, setBasicsOpen] = useState(true);
  const [agentOpen, setAgentOpen] = useState(true);
  const [ohOpen, setOhOpen] = useState(true);
  const [leftTab, setLeftTab] = useState<'templates' | 'edit'>('templates');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'All'>('All');
  const [exporting, setExporting] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<MarketingBlockKey | null>(null);
  const [blockRects, setBlockRects] = useState<Partial<Record<MarketingBlockKey, MarketingBlockRect>>>({});

  // ── Recent item actions ───────────────────────────────────────────────────
  const deleteRecent = useCallback((entryTemplateId: string) => {
    if (!id) return;
    const updated = recents.filter((e) => e.templateId !== entryTemplateId);
    saveRecents(id, updated);
    setRecents(updated);
  }, [id, recents]);

  const duplicateRecent = useCallback((entry: RecentEntry) => {
    if (!id) return;
    const copyId = `${entry.templateId}-copy-${Date.now()}`;
    const copy: RecentEntry = {
      ...entry,
      templateId: copyId,
      customName: `${entry.customName || TEMPLATES.find(t => t.id === entry.templateId)?.name || 'Design'} (Copy)`,
      lastEdited: Date.now(),
    };
    const updated = [copy, ...recents];
    saveRecents(id, updated);
    setRecents(updated);
  }, [id, recents]);

  const renameRecent = useCallback((entryTemplateId: string, newName: string) => {
    if (!id) return;
    const updated = recents.map((e) =>
      e.templateId === entryTemplateId ? { ...e, customName: newName } : e
    );
    saveRecents(id, updated);
    setRecents(updated);
    setRenamingId(null);
  }, [id, recents]);

  const downloadRecent = useCallback(async (entry: RecentEntry) => {
    const t = TEMPLATES.find((t) => t.id === entry.templateId);
    if (!t) return;
    // Temporarily render, export, then clean up
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    document.body.appendChild(container);
    const { createRoot } = await import('react-dom/client');
    const root = createRoot(container);
    root.render(t.render(entry.data, false) as any);
    await new Promise(r => setTimeout(r, 200));
    try {
      const dataUrl = await toPng(container.firstElementChild as HTMLElement, {
        width: t.width, height: t.height, pixelRatio: 2,
      });
      const link = document.createElement('a');
      link.download = `${(entry.customName || t.name).replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      root.unmount();
      document.body.removeChild(container);
    }
  }, []);

  const openRecentInNewTab = useCallback((entry: RecentEntry) => {
    if (!id) return;
    const url = `${window.location.origin}/transactions/${id}/marketing?template=${entry.templateId}`;
    window.open(url, '_blank');
  }, [id]);

  // Auto-fill from deal data (preserve existing photos)
  useEffect(() => {
    if (deal) {
      // Check if there's a saved session for the current template first
      const saved = id ? loadRecents(id).find((r) => r.templateId === templateId) : null;
      if (saved) {
        setHist({
          stack: [hydrateTemplateData(getDefaultTemplateData(deal, template.category), saved.data)],
          index: 0,
        });
      } else {
        setData((prev) => ({ ...getDefaultTemplateData(deal, template.category), photos: prev.photos }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deal, templateId, template.category, hydrateTemplateData]);

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

  const updateField = useCallback((field: EditableTextField, value: string) => {
    setData((prev) => {
      if (!field.startsWith('agent')) {
        return { ...prev, [field]: value };
      }

      const agents = prev.agents?.length
        ? [...prev.agents]
        : [{
            name: prev.agentName,
            title: prev.agentTitle,
            phone: prev.agentPhone,
            email: prev.agentEmail,
          }];

      const firstAgent = { ...agents[0] };
      if (field === 'agentName') firstAgent.name = value;
      if (field === 'agentTitle') firstAgent.title = value;
      if (field === 'agentPhone') firstAgent.phone = value;
      if (field === 'agentEmail') firstAgent.email = value;
      agents[0] = firstAgent;

      return {
        ...prev,
        [field]: value,
        agents,
      };
    });
  }, [setData]);

  const visibility = {
    ...DEFAULT_TEMPLATE_VISIBILITY,
    ...(data.visibility ?? {}),
  };

  const updateVisibility = useCallback((field: keyof TemplateVisibility, checked: boolean) => {
    setData((prev) => ({
      ...prev,
      visibility: {
        ...DEFAULT_TEMPLATE_VISIBILITY,
        ...(prev.visibility ?? {}),
        [field]: checked,
      },
    }));
  }, [setData]);

  const setHeadlineStyle = useCallback((headlineStyle: HeadlineStyle) => {
    setData((prev) => ({ ...prev, headlineStyle }));
  }, [setData]);

  const setPhotoLayout = useCallback((photoLayout: PhotoLayout) => {
    setData((prev) => ({ ...prev, photoLayout }));
  }, [setData]);

  const setAgentLayout = useCallback((agentLayout: AgentLayout) => {
    setData((prev) => ({ ...prev, agentLayout }));
  }, [setData]);

  const updateBlockTransform = useCallback((
    block: MarketingBlockKey,
    nextTransform: { x: number; y: number; scale: number },
    replace = false,
  ) => {
    const applyUpdate = replace ? replaceCurrentData : setData;
    applyUpdate((prev) => ({
      ...prev,
      blockTransforms: {
        ...(prev.blockTransforms ?? {}),
        [block]: nextTransform,
      },
    }));
  }, [replaceCurrentData, setData]);

  const resetSelectedBlock = useCallback(() => {
    if (!selectedBlock) return;

    setData((prev) => {
      const nextTransforms = { ...(prev.blockTransforms ?? {}) };
      delete nextTransforms[selectedBlock];
      return {
        ...prev,
        blockTransforms: nextTransforms,
      };
    });
  }, [selectedBlock, setData]);

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
    const recentTemplate = TEMPLATES.find((t) => t.id === entry.templateId);
    setHist({
      stack: [hydrateTemplateData(getDefaultTemplateData(deal, recentTemplate?.category ?? template.category), entry.data)],
      index: 0,
    });
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
  scaleRef.current = scale;

  const measureBlocks = useCallback(() => {
    if (!canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const divisor = scaleRef.current || 1;
    const nextRects: Partial<Record<MarketingBlockKey, MarketingBlockRect>> = {};

    canvasRef.current.querySelectorAll<HTMLElement>('[data-marketing-block]').forEach((element) => {
      const block = element.dataset.marketingBlock as MarketingBlockKey | undefined;
      if (!block) return;

      const rect = element.getBoundingClientRect();
      nextRects[block] = {
        left: (rect.left - canvasRect.left) / divisor,
        top: (rect.top - canvasRect.top) / divisor,
        width: rect.width / divisor,
        height: rect.height / divisor,
      };
    });

    setBlockRects(nextRects);
    setSelectedBlock((current) => (current && !nextRects[current] ? null : current));
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(measureBlocks);
    return () => window.cancelAnimationFrame(frame);
  }, [measureBlocks, data, templateId, scale]);

  useEffect(() => {
    const handleResize = () => measureBlocks();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureBlocks]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const images = Array.from(canvasRef.current.querySelectorAll('img'));
    const handleLoad = () => measureBlocks();

    images.forEach((image) => {
      if (!image.complete) {
        image.addEventListener('load', handleLoad);
      }
    });

    return () => {
      images.forEach((image) => image.removeEventListener('load', handleLoad));
    };
  }, [measureBlocks, data.photos, templateId]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      event.preventDefault();

      const divisor = scaleRef.current || 1;
      const dx = (event.clientX - interaction.startClientX) / divisor;
      const dy = (event.clientY - interaction.startClientY) / divisor;

      if (interaction.mode === 'move') {
        updateBlockTransform(
          interaction.block,
          {
            ...interaction.startTransform,
            x: interaction.startTransform.x + dx,
            y: interaction.startTransform.y + dy,
          },
          interaction.committed,
        );
        interaction.committed = true;
        return;
      }

      const baseSize = Math.max(interaction.baseRect.width, interaction.baseRect.height, 120);
      const dominantDelta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
      const nextScale = Math.min(
        3,
        Math.max(0.35, interaction.startTransform.scale * ((baseSize + dominantDelta) / baseSize)),
      );

      updateBlockTransform(
        interaction.block,
        {
          ...interaction.startTransform,
          scale: Number.isFinite(nextScale) ? nextScale : interaction.startTransform.scale,
        },
        interaction.committed,
      );
      interaction.committed = true;
    };

    const handlePointerEnd = () => {
      interactionRef.current = null;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [updateBlockTransform]);

  useEffect(() => {
    setSelectedBlock(null);
  }, [templateId]);

  const beginBlockInteraction = useCallback((
    event: React.PointerEvent<HTMLButtonElement>,
    block: MarketingBlockKey,
    mode: 'move' | 'resize',
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const currentTransform = data.blockTransforms?.[block];
    interactionRef.current = {
      block,
      mode,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startTransform: {
        x: currentTransform?.x ?? 0,
        y: currentTransform?.y ?? 0,
        scale: currentTransform?.scale ?? 1,
      },
      baseRect: blockRects[block] ?? { left: 0, top: 0, width: 220, height: 220 },
      committed: false,
    };

    setSelectedBlock(block);
  }, [blockRects, data.blockTransforms]);

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
          {/* Tab bar: Templates | Edit */}
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
          </div>

          {/* ── Templates tab ── */}
          {leftTab === 'templates' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <ScrollArea className="flex-1">
                {/* ── Recent section ── */}
                {recents.length > 0 && (
                  <div className="border-b pb-3">
                    <div className="flex items-center gap-1.5 px-3 pt-3 pb-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Recent</span>
                      <span className="ml-auto text-[9px] text-muted-foreground/60">{recents.length}</span>
                    </div>
                    <div className="px-2 space-y-1">
                      {recents.map((entry) => {
                        const t = TEMPLATES.find((t) => t.id === entry.templateId);
                        if (!t) return null;
                        const thumbScale = 52 / t.width;
                        const thumbH = Math.round(t.height * thumbScale);
                        const isActive = entry.templateId === templateId;
                        return (
                          <div
                            key={entry.templateId}
                            className={cn(
                              'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg border-2 text-left transition-all hover:bg-muted/60 group',
                              isActive ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted-foreground/20'
                            )}
                          >
                            <button
                              onClick={() => resumeRecent(entry)}
                              className="flex items-center gap-2.5 flex-1 min-w-0"
                            >
                              {/* Mini preview */}
                              <div
                                className="rounded overflow-hidden bg-muted shrink-0 border"
                                style={{ width: 52, height: thumbH }}
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
                              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                <div className="flex items-center gap-1 min-w-0">
                                  {renamingId === entry.templateId ? (
                                    <input
                                      autoFocus
                                      className="text-[11px] font-semibold bg-transparent border-b border-primary outline-none w-full"
                                      value={renameValue}
                                      onChange={(e) => setRenameValue(e.target.value)}
                                      onBlur={() => renameRecent(entry.templateId, renameValue)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') renameRecent(entry.templateId, renameValue);
                                        if (e.key === 'Escape') setRenamingId(null);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <span className="text-[11px] font-semibold text-foreground truncate">
                                      {entry.customName || t.name}
                                    </span>
                                  )}
                                  {isActive && renamingId !== entry.templateId && (
                                    <span className="text-[8px] font-bold px-1 py-0.5 bg-primary text-primary-foreground rounded-full shrink-0">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground truncate">{entry.data.address}</span>
                                <span className="text-[9px] text-muted-foreground/60">{timeAgo(entry.lastEdited)}</span>
                              </div>
                            </button>
                            {/* Actions dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem onClick={() => openRecentInNewTab(entry)}>
                                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                  Open in a new tab
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setRenameValue(entry.customName || t.name);
                                  setRenamingId(entry.templateId);
                                }}>
                                  <PencilLine className="h-3.5 w-3.5 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => duplicateRecent(entry)}>
                                  <Copy className="h-3.5 w-3.5 mr-2" />
                                  Make a copy
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => downloadRecent(entry)}>
                                  <Download className="h-3.5 w-3.5 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => deleteRecent(entry.templateId)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Move to Trash
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Category filter pills ── */}
                <div className="p-2 flex flex-wrap gap-1 border-b">
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

                {/* ── Template grid ── */}
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
                            {t.render({ ...getDefaultTemplateData(deal, t.category), photos: data.photos }, false)}
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
                <Collapsible open={studioBasicsOpen} onOpenChange={setStudioBasicsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t">
                    Basics
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${studioBasicsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pb-4">
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Headline Style</div>
                      <div className="grid grid-cols-2 gap-2">
                        <OptionCard
                          label="H1"
                          description="Large serif hero headline"
                          preview={<span className={cn('font-serif text-3xl leading-none', data.headlineStyle === 'h1' ? 'text-primary' : 'text-foreground')}>H1</span>}
                          active={data.headlineStyle === 'h1'}
                          onClick={() => setHeadlineStyle('h1')}
                        />
                        <OptionCard
                          label="H2"
                          description="Refined uppercase editorial"
                          preview={<span className={cn('text-3xl font-bold uppercase tracking-[0.2em] leading-none', data.headlineStyle === 'h2' ? 'text-primary' : 'text-foreground')}>H2</span>}
                          active={data.headlineStyle === 'h2'}
                          onClick={() => setHeadlineStyle('h2')}
                        />
                        <OptionCard
                          label="H3"
                          description="Classic luxury headline"
                          preview={<span className={cn('font-serif text-3xl font-medium tracking-wide leading-none', data.headlineStyle === 'h3' ? 'text-primary' : 'text-foreground')}>H3</span>}
                          active={data.headlineStyle === 'h3'}
                          onClick={() => setHeadlineStyle('h3')}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Photo Layout</div>
                      <div className="grid grid-cols-2 gap-2">
                        <OptionCard
                          label="Hero"
                          description="Single main image"
                          icon={ImagePlus}
                          active={data.photoLayout === 'single'}
                          onClick={() => setPhotoLayout('single')}
                        />
                        <OptionCard
                          label="Collage"
                          description="Main image with supporting photos"
                          icon={LayoutGrid}
                          active={data.photoLayout === 'collage'}
                          onClick={() => setPhotoLayout('collage')}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Collapsible open={studioAgentsOpen} onOpenChange={setStudioAgentsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t">
                    Agents
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${studioAgentsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <OptionCard
                        label="Agent"
                        description="Single agent footer"
                        icon={User}
                        active={data.agentLayout === 'single'}
                        onClick={() => setAgentLayout('single')}
                      />
                      <OptionCard
                        label="Agent Multi"
                        description="Use multiple deal agents"
                        icon={Users}
                        active={data.agentLayout === 'multi'}
                        onClick={() => setAgentLayout('multi')}
                      />
                    </div>
                    <div className="rounded-xl border bg-muted/25 px-3 py-2 text-[11px] leading-4 text-muted-foreground">
                      Agent Multi uses the agents already attached to the deal. If only one deal agent exists, the poster falls back to a single agent card.
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="rounded-2xl border bg-muted/25 px-3 py-3 text-[11px] leading-4 text-muted-foreground">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-foreground/70">Canvas Layout</div>
                  <div className="mt-2">
                    Drag the outline on the poster to move text or images. Use the corner handle to scale them up or down.
                  </div>
                  {selectedBlock ? (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border bg-background px-2.5 py-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Selected</div>
                        <div className="text-xs font-semibold text-foreground">{MARKETING_BLOCK_LABELS[selectedBlock]}</div>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={resetSelectedBlock}>
                        Reset
                      </Button>
                    </div>
                  ) : null}
                </div>

                <Collapsible open={basicsOpen} onOpenChange={setBasicsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80">
                    Property Details
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${basicsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2.5 pb-4">
                    <div>
                      <VisibilityLabel
                        htmlFor="marketing-show-headline"
                        label="Headline"
                        checked={visibility.headline}
                        onCheckedChange={(checked) => updateVisibility('headline', checked)}
                      />
                      <Input value={data.headline} onChange={(e) => updateField('headline', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div>
                      <VisibilityLabel
                        htmlFor="marketing-show-address"
                        label="Address"
                        checked={visibility.address}
                        onCheckedChange={(checked) => updateVisibility('address', checked)}
                      />
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
                      <VisibilityLabel
                        htmlFor="marketing-show-price"
                        label="Price"
                        checked={visibility.price}
                        onCheckedChange={(checked) => updateVisibility('price', checked)}
                      />
                      <Input value={data.price} onChange={(e) => updateField('price', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <div className="col-span-3">
                        <VisibilityLabel
                          htmlFor="marketing-show-stats"
                          label="Beds / Baths / Sq Ft"
                          checked={visibility.stats}
                          onCheckedChange={(checked) => updateVisibility('stats', checked)}
                        />
                      </div>
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
                      <VisibilityLabel
                        htmlFor="marketing-show-description"
                        label="Description"
                        checked={visibility.description}
                        onCheckedChange={(checked) => updateVisibility('description', checked)}
                      />
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
                      <VisibilityLabel
                        htmlFor="marketing-show-agent-name"
                        label="Name"
                        checked={visibility.agentName}
                        onCheckedChange={(checked) => updateVisibility('agentName', checked)}
                      />
                      <Input value={data.agentName} onChange={(e) => updateField('agentName', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div>
                      <VisibilityLabel
                        htmlFor="marketing-show-agent-title"
                        label="Title"
                        checked={visibility.agentTitle}
                        onCheckedChange={(checked) => updateVisibility('agentTitle', checked)}
                      />
                      <Input value={data.agentTitle} onChange={(e) => updateField('agentTitle', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div>
                      <VisibilityLabel
                        htmlFor="marketing-show-agent-phone"
                        label="Phone"
                        checked={visibility.agentPhone}
                        onCheckedChange={(checked) => updateVisibility('agentPhone', checked)}
                      />
                      <Input value={data.agentPhone} onChange={(e) => updateField('agentPhone', e.target.value)} className="mt-1 h-7 text-xs" />
                    </div>
                    <div>
                      <VisibilityLabel
                        htmlFor="marketing-show-agent-email"
                        label="Email"
                        checked={visibility.agentEmail}
                        onCheckedChange={(checked) => updateVisibility('agentEmail', checked)}
                      />
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
              ref={previewShellRef}
              className="relative shadow-2xl"
              style={{ width: template.width, height: template.height }}
            >
              <div
                ref={canvasRef}
                style={{ width: template.width, height: template.height }}
              >
                {template.render(data, false)}
              </div>

              <div
                className="absolute inset-0"
                onPointerDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setSelectedBlock(null);
                  }
                }}
              >
                {Object.entries(blockRects).map(([blockKey, rect]) => {
                  if (!rect) return null;
                  const block = blockKey as MarketingBlockKey;
                  const selected = selectedBlock === block;

                  return (
                    <div
                      key={block}
                      className={cn(
                        'absolute rounded-xl transition-colors',
                        selected
                          ? 'border-2 border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(255,255,255,0.95)]'
                          : 'border border-transparent hover:border-primary/40 hover:bg-primary/5'
                      )}
                      style={{
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height,
                      }}
                    >
                      <button
                        type="button"
                        className="absolute inset-0 cursor-move rounded-xl"
                        onPointerDown={(event) => beginBlockInteraction(event, block, 'move')}
                        aria-label={`Move ${MARKETING_BLOCK_LABELS[block]}`}
                      />

                      {(selected || block === 'photo') ? (
                        <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-background/95 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">
                          {MARKETING_BLOCK_LABELS[block]}
                        </div>
                      ) : null}

                      <button
                        type="button"
                        className={cn(
                          'absolute bottom-0 right-0 h-4 w-4 translate-x-1/2 translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-sm',
                          selected ? 'opacity-100' : 'opacity-0 hover:opacity-100 focus:opacity-100'
                        )}
                        onPointerDown={(event) => beginBlockInteraction(event, block, 'resize')}
                        aria-label={`Resize ${MARKETING_BLOCK_LABELS[block]}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
