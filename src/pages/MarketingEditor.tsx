import { useRef, useState, useCallback, useEffect, Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { toast } from 'sonner';
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
  Loader2,
  Maximize2,
  Keyboard,
  Check,
  GripVertical,
  Lock,
  LockOpen,
  Link2,
  Link2Off,
  Type,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDeal } from '@/hooks/useDeals';
import { useDealPhotos, useUploadDealPhoto } from '@/hooks/useDealPhotos';
import {
  TEMPLATES,
  CANVAS_DIMENSIONS,
  DEFAULT_TEMPLATE_VISIBILITY,
  getDefaultTemplateData,
  mergeMarketingBlockTransforms,
  type AgentLayout,
  type CanvasDimension,
  type MarketingCustomTextBlock,
  type HeadlineStyle,
  type MarketingBlockKey,
  type PhotoLayout,
  type TemplateData,
  type TemplateCategory,
  type TemplateVisibility,
} from '@/data/marketingTemplates';
import { cn } from '@/lib/utils';

// ── Layout constants ─────────────────────────────────────────────────────────
const LEFT_PANEL_WIDTH  = 260; // px — left edit panel width
const TOP_BAR_HEIGHT    = 56;  // px — top toolbar height

// ── Alignment / Snap Guide System ───────────────────────────────────────────

const SNAP_THRESHOLD = 8;   // px — snap when within this many canvas-px
const GUIDE_COLOR = '#a855f7'; // purple-500

interface AlignGuide {
  type: 'v' | 'h';           // vertical line | horizontal line
  pos: number;               // canvas-px coordinate
  label?: string;            // e.g. "Center"
  source?: string;           // which block this came from
}

type SpacingReason = 'equal' | 'centered' | 'near-equal';

interface SpacingGuide {
  axis: 'x' | 'y';
  from: number;    // start of gap (canvas-px)
  to: number;      // end of gap (canvas-px)
  center: number;  // perpendicular midpoint for line placement
  value: number;   // gap size in canvas-px
  showLabel: boolean;   // only true when spacing is meaningful
  reason: SpacingReason; // why we're showing this
}

interface SnapResult {
  x: number;
  y: number;
  guides: AlignGuide[];
  spacingGuides: SpacingGuide[];
}

function waitForImageToLoad(image: HTMLImageElement) {
  if (image.complete && image.naturalWidth > 0) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const handleDone = () => {
      image.removeEventListener('load', handleDone);
      image.removeEventListener('error', handleDone);
      resolve();
    };

    image.addEventListener('load', handleDone, { once: true });
    image.addEventListener('error', handleDone, { once: true });
  });
}

async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(images.map((image) => waitForImageToLoad(image as HTMLImageElement)));
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }
      reject(new Error('Unable to convert image blob to data URL.'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read image blob.'));
    reader.readAsDataURL(blob);
  });
}

async function inlineImagesForExport(sourceRoot: HTMLElement, cloneRoot: HTMLElement) {
  const sourceImages = Array.from(sourceRoot.querySelectorAll('img')) as HTMLImageElement[];
  const cloneImages = Array.from(cloneRoot.querySelectorAll('img')) as HTMLImageElement[];

  await Promise.all(
    cloneImages.map(async (cloneImage, index) => {
      const sourceImage = sourceImages[index];
      const source = sourceImage?.currentSrc || sourceImage?.getAttribute('src') || cloneImage.getAttribute('src');
      if (!source || source.startsWith('data:')) {
        return;
      }

      cloneImage.loading = 'eager';
      cloneImage.decoding = 'sync';

      try {
        const response = await fetch(source, { cache: 'force-cache' });
        if (!response.ok) {
          throw new Error(`Image fetch failed with ${response.status}`);
        }

        const blob = await response.blob();
        cloneImage.src = await blobToDataUrl(blob);
      } catch (error) {
        console.warn('Failed to inline export image:', source, error);
      }

      await waitForImageToLoad(cloneImage);
    })
  );
}

async function exportNodeToPng(node: HTMLElement, exportW: number, exportH: number) {
  await waitForImages(node);

  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.width = `${exportW}px`;
  wrapper.style.height = `${exportH}px`;
  wrapper.style.pointerEvents = 'none';
  wrapper.style.opacity = '0';
  wrapper.style.zIndex = '-1';

  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.width = `${exportW}px`;
  clone.style.height = `${exportH}px`;

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    await inlineImagesForExport(node, clone);
    await waitForImages(clone);

    return await toPng(clone, {
      width: exportW,
      height: exportH,
      pixelRatio: 2,
      cacheBust: true,
    });
  } finally {
    document.body.removeChild(wrapper);
  }
}

/** Compute snap offset + guides for a block being dragged */
function computeSnap(
  block: string,
  proposed: { left: number; top: number; width: number; height: number },
  canvasW: number,
  canvasH: number,
  allRects: Partial<Record<string, { left: number; top: number; width: number; height: number }>>,
  threshold = SNAP_THRESHOLD,
): SnapResult {
  const cx = canvasW / 2;
  const cy = canvasH / 2;

  // Centers + edges of the dragged block
  const bCX = proposed.left + proposed.width / 2;
  const bCY = proposed.top + proposed.height / 2;
  const bR  = proposed.left + proposed.width;
  const bB  = proposed.top + proposed.height;

  const guides: AlignGuide[] = [];
  const spacingGuides: SpacingGuide[] = [];
  let snapDX = 0;
  let snapDY = 0;

  // ── 1. Canvas center snapping ──────────────────────────────────────────────
  const dCX = bCX - cx;
  const dCY = bCY - cy;
  if (Math.abs(dCX) < threshold) { snapDX = -dCX; guides.push({ type: 'v', pos: cx, label: 'Center' }); }
  if (Math.abs(dCY) < threshold) { snapDY = -dCY; guides.push({ type: 'h', pos: cy, label: 'Center' }); }

  // Canvas edges
  if (Math.abs(proposed.left + snapDX) < threshold) { snapDX = -proposed.left; guides.push({ type: 'v', pos: 0 }); }
  if (Math.abs(bR + snapDX - canvasW) < threshold)  { snapDX = canvasW - bR; guides.push({ type: 'v', pos: canvasW }); }
  if (Math.abs(proposed.top + snapDY) < threshold)  { snapDY = -proposed.top; guides.push({ type: 'h', pos: 0 }); }
  if (Math.abs(bB + snapDY - canvasH) < threshold)  { snapDY = canvasH - bB; guides.push({ type: 'h', pos: canvasH }); }

  // ── 2. Other-block alignment snapping ──────────────────────────────────────
  const others = Object.entries(allRects).filter(([k]) => k !== block);

  for (const [key, rect] of others) {
    if (!rect) continue;
    const oCX = rect.left + rect.width  / 2;
    const oCY = rect.top  + rect.height / 2;
    const oR  = rect.left + rect.width;
    const oB  = rect.top  + rect.height;

    // Horizontal axes (Y alignment)
    const hCases: [number, number][] = [
      [bCY, oCY],   // center-center
      [proposed.top, rect.top],     // top-top
      [bB, oB],       // bottom-bottom
      [proposed.top, oB],           // top to bottom
      [bB, rect.top],               // bottom to top
    ];
    for (const [bVal, oVal] of hCases) {
      const d = bVal - oVal;
      if (Math.abs(d + snapDY) < threshold && Math.abs(d) < threshold * 2) {
        snapDY = -d;
        guides.push({ type: 'h', pos: oVal, source: key });
        break;
      }
    }

    // Vertical axes (X alignment)
    const vCases: [number, number][] = [
      [bCX, oCX],   // center-center
      [proposed.left, rect.left],   // left-left
      [bR,  oR],      // right-right
      [proposed.left, oR],          // left to right edge
      [bR,  rect.left],             // right to left edge
    ];
    for (const [bVal, oVal] of vCases) {
      const d = bVal - oVal;
      if (Math.abs(d + snapDX) < threshold && Math.abs(d) < threshold * 2) {
        snapDX = -d;
        guides.push({ type: 'v', pos: oVal, source: key });
        break;
      }
    }
  }

  // ── 3. Spacing guides — Canva-style: only show when meaningful ─────────────
  const snappedLeft = proposed.left + snapDX;
  const snappedTop  = proposed.top  + snapDY;
  const snappedCX   = snappedLeft + proposed.width  / 2;
  const snappedCY   = snappedTop  + proposed.height / 2;
  const snappedR    = snappedLeft + proposed.width;
  const snappedB    = snappedTop  + proposed.height;

  // Collect all gaps between the dragged block and every other block
  type RawGap = { axis: 'x' | 'y'; from: number; to: number; center: number; value: number };
  const rawGaps: RawGap[] = [];

  for (const [, rect] of others) {
    if (!rect) continue;
    const oR  = rect.left + rect.width;
    const oB  = rect.top  + rect.height;
    const oCY = rect.top  + rect.height / 2;
    const oCX = rect.left + rect.width  / 2;

    // Only collect gaps where blocks are clearly on the same axis
    // (overlapping blocks on the perpendicular axis are ignored)
    const xOverlap = snappedLeft < oR && snappedR > rect.left;
    const yOverlap = snappedTop  < oB && snappedB > rect.top;

    if (!yOverlap) {
      // X-axis: blocks beside each other horizontally
      if (oR <= snappedLeft) {
        rawGaps.push({ axis: 'x', from: oR, to: snappedLeft, center: (snappedCY + oCY) / 2, value: snappedLeft - oR });
      } else if (rect.left >= snappedR) {
        rawGaps.push({ axis: 'x', from: snappedR, to: rect.left, center: (snappedCY + oCY) / 2, value: rect.left - snappedR });
      }
    }

    if (!xOverlap) {
      // Y-axis: blocks above/below each other
      if (oB <= snappedTop) {
        rawGaps.push({ axis: 'y', from: oB, to: snappedTop, center: (snappedCX + oCX) / 2, value: snappedTop - oB });
      } else if (rect.top >= snappedB) {
        rawGaps.push({ axis: 'y', from: snappedB, to: rect.top, center: (snappedCX + oCX) / 2, value: rect.top - snappedB });
      }
    }
  }

  // ── Decide which gaps are worth showing ──────────────────────────────────
  // Strategy: only show guides/labels when there is a meaningful spacing relationship.
  // Rule 1 — Equal gaps: two or more gaps on the same axis are equal (or within 3px)
  // Rule 2 — Centered: the dragged block sits centered between two others (gaps are equal on both sides)
  // Rule 3 — Near-equal snap: one gap is within SNAP_THRESHOLD of another existing gap

  const NEAR_EQUAL = threshold * 1.5; // px within which two gaps are considered "matching"

  const xGaps = rawGaps.filter(g => g.axis === 'x' && g.value >= 2);
  const yGaps = rawGaps.filter(g => g.axis === 'y' && g.value >= 2);

  function findEqualGroups(gaps: RawGap[]): Map<number, RawGap[]> {
    // Group gaps whose rounded values are within NEAR_EQUAL of each other
    const groups = new Map<number, RawGap[]>();
    for (const g of gaps) {
      const rounded = Math.round(g.value);
      let matched = false;
      for (const [key, group] of groups) {
        if (Math.abs(key - rounded) <= NEAR_EQUAL) {
          group.push(g);
          matched = true;
          break;
        }
      }
      if (!matched) groups.set(rounded, [g]);
    }
    return groups;
  }

  function isCentered(gaps: RawGap[]): boolean {
    // Exactly two gaps and they are equal (block is between two others)
    if (gaps.length !== 2) return false;
    return Math.abs(gaps[0].value - gaps[1].value) <= NEAR_EQUAL;
  }

  function buildSpacingGuides(gaps: RawGap[]): SpacingGuide[] {
    if (gaps.length === 0) return [];

    const groups = findEqualGroups(gaps);
    // Only show if there's a group of 2+ equal gaps (or centered)
    const meaningfulGroups = [...groups.values()].filter(g => g.length >= 2);

    // Also check centered case (2 gaps of equal value from a single group)
    const centered = isCentered(gaps);

    if (meaningfulGroups.length === 0 && !centered) return []; // nothing useful — stay quiet

    const result: SpacingGuide[] = [];
    const usedGaps = centered ? gaps : meaningfulGroups.flat();

    for (const g of usedGaps) {
      const reason: SpacingReason = centered ? 'centered' : 'equal';
      result.push({ ...g, showLabel: true, reason });
    }
    return result;
  }

  spacingGuides.push(...buildSpacingGuides(xGaps));
  spacingGuides.push(...buildSpacingGuides(yGaps));

  return { x: snapDX, y: snapDY, guides, spacingGuides };
}

// ── Recents persistence (localStorage, keyed per deal) ──────────────────────

export interface RecentEntry {
  templateId: string;
  data: TemplateData;
  lastEdited: number; // ms timestamp
  customName?: string; // user-defined name
}

const RECENTS_LIMIT = 20;
const HISTORY_LIMIT = 100; // cap undo stack to prevent memory bloat

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

function saveRecents(dealId: string, entries: RecentEntry[]): boolean {
  try {
    localStorage.setItem(recentsKey(dealId), JSON.stringify(entries.slice(0, RECENTS_LIMIT)));
    return true;
  } catch (err) {
    // QuotaExceededError — caller should surface this to the user
    console.warn('[Marketing] localStorage quota exceeded:', err);
    return false;
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

// Human-readable headline style labels
const HEADLINE_STYLE_LABELS: Record<HeadlineStyle, { name: string; desc: string }> = {
  h1: { name: 'Serif Split', desc: 'Large italic + bold hero' },
  h2: { name: 'Editorial', desc: 'Uppercase gold tracking' },
  h3: { name: 'Classic', desc: 'Clean serif single line' },
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
  targets: Array<{
    block: MarketingBlockKey;
    startTransform: {
      x: number;
      y: number;
      scale: number;
    };
    baseRect: MarketingBlockRect;
  }>;
  committed: boolean;
};

const MARKETING_BLOCK_LABELS: Record<string, string> = {
  logo: 'Logo',
  photo: 'Photo',
  headline: 'Headline',
  address: 'Address',
  price: 'Price',
  stats: 'Beds / Baths / Sq Ft',
  description: 'Description',
  agent: 'Agent info',
};

function isCustomTextBlock(block: string): block is `custom-text-${string}` {
  return block.startsWith('custom-text-');
}

function isPhotoIndexBlock(block: string): block is `photo-${number}` {
  return /^photo-\d+$/.test(block);
}

function getPhotoIndex(block: string): number {
  return parseInt(block.replace('photo-', ''), 10);
}

function getCustomTextBlockId(block: MarketingBlockKey): string | null {
  return isCustomTextBlock(block) ? block.replace('custom-text-', '') : null;
}

function getBlockLabel(block: MarketingBlockKey, customTextBlocks: MarketingCustomTextBlock[]): string {
  if (isCustomTextBlock(block)) {
    const customTextId = getCustomTextBlockId(block);
    const customText = customTextBlocks.find((entry) => entry.id === customTextId);
    const preview = customText?.text.trim();
    return preview ? `Text: ${preview.slice(0, 18)}` : 'Custom Text';
  }

  if (isPhotoIndexBlock(block)) {
    return `Photo ${getPhotoIndex(block) + 1}`;
  }

  return MARKETING_BLOCK_LABELS[block] ?? 'Block';
}

const ZOOM_PRESETS = [0.5, 0.75, 1.0];

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
        'rounded-2xl border p-3 text-left transition-all hover:border-foreground/25 hover:bg-muted/40',
        active ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20' : 'border-border bg-background'
      )}
    >
      <div className="mb-2.5 flex h-10 items-center justify-center rounded-xl bg-muted/40">
        {preview ?? (Icon ? <Icon className={cn('h-5 w-5', active ? 'text-primary' : 'text-foreground')} /> : null)}
      </div>
      <div className="text-[11px] font-semibold text-foreground leading-tight">{label}</div>
      <div className="mt-0.5 text-[10px] leading-3.5 text-muted-foreground">{description}</div>
    </button>
  );
}

// ── Template Error Boundary ───────────────────────────────────────────────────

class TemplateErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message ?? 'Unknown render error' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[TemplateErrorBoundary] Template render failed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fef2f2',
            color: '#991b1b',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 13,
            gap: 8,
            padding: 24,
            textAlign: 'center',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <strong>Template failed to render</strong>
          <span style={{ fontSize: 11, color: '#b91c1c', maxWidth: 320 }}>{this.state.message}</span>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            style={{
              marginTop: 4,
              padding: '4px 12px',
              background: '#dc2626',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MarketingEditor() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateId = searchParams.get('template') || TEMPLATES[0].id;
  const navigate = useNavigate();
  const { data: deal } = useDeal(id);
  const { data: dealPhotos = [] } = useDealPhotos(id);
  const uploadDealPhoto = useUploadDealPhoto();
  const canvasRef = useRef<HTMLDivElement>(null);
  const previewShellRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const scaleRef = useRef(1);
  const interactionRef = useRef<MarketingBlockInteraction | null>(null);

  const template = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

  // ── History (undo / redo) ─────────────────────────────────────────────────
  // Single state object so index + stack update atomically (no stale closure crash)
  const [hist, setHist] = useState<{ stack: TemplateData[]; index: number }>({
    stack: [getDefaultTemplateData(undefined, template.category)],
    index: 0,
  });
  const data = hist.stack[hist.index] ?? getDefaultTemplateData(undefined, template.category);

  const setData = useCallback((updater: TemplateData | ((prev: TemplateData) => TemplateData)) => {
    setHist((h) => {
      const current = h.stack[h.index];
      const next = typeof updater === 'function' ? updater(current) : updater;
      // Drop any future states (overwrite forward history), cap at HISTORY_LIMIT
      const base = h.stack.slice(0, h.index + 1);
      const newStack = [...base, next].slice(-HISTORY_LIMIT);
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
      customTextBlocks: incoming?.customTextBlocks ?? base.customTextBlocks ?? [],
      groupedBlockKeys: incoming?.groupedBlockKeys ?? base.groupedBlockKeys ?? [],
      agents: incoming?.agents?.length
        ? incoming.agents
        : [{
            name: incoming?.agentName ?? base.agentName,
            title: incoming?.agentTitle ?? base.agentTitle,
            phone: incoming?.agentPhone ?? base.agentPhone,
            email: incoming?.agentEmail ?? base.agentEmail,
          }],
      // Ensure canvas dimension fields always exist (backwards compat)
      canvasDimensionId: incoming?.canvasDimensionId ?? base.canvasDimensionId ?? 'square',
      canvasWidth: incoming?.canvasWidth ?? base.canvasWidth ?? 1080,
      canvasHeight: incoming?.canvasHeight ?? base.canvasHeight ?? 1080,
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

  // ── Recents state ─────────────────────────────────────────────────────────
  const [recents, setRecents] = useState<RecentEntry[]>(() =>
    id ? loadRecents(id) : []
  );

  // Auto-save: debounce 800ms after any data change
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!id) return;
    setSaveStatus('saving');
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const entries = loadRecents(id).filter((e) => e.templateId !== templateId);
      const updated: RecentEntry[] = [{ templateId, data, lastEdited: Date.now() }, ...entries];
      const saved = saveRecents(id, updated);
      if (saved) {
        setRecents(updated);
      } else {
        toast.error('Auto-save failed — browser storage is full. Try clearing old designs.');
      }
      setSaveStatus('saved');
      if (saveStatusTimerRef.current) clearTimeout(saveStatusTimerRef.current);
      saveStatusTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
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
  const [exporting, setExporting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [personalPhotos, setPersonalPhotos] = useState<string[]>([]);
  const [uploadingPersonalPhoto, setUploadingPersonalPhoto] = useState(false);
  const personalPhotoInputRef = useRef<HTMLInputElement>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<MarketingBlockKey | null>(null);
  const [lockedBlocks, setLockedBlocks] = useState<Set<MarketingBlockKey>>(new Set());
  const [isDraggingBlock, setIsDraggingBlock] = useState(false); // hides toolbar while moving
  const [blockRects, setBlockRects] = useState<Partial<Record<MarketingBlockKey, MarketingBlockRect>>>({});
  // Save-status indicator
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keyboard shortcut overlay
  const [showShortcuts, setShowShortcuts] = useState(false);
  // Photo drag-to-reorder
  const photoDragIndexRef = useRef<number | null>(null);
  // Pending delete (for undo-toast pattern)
  const pendingDeleteRef = useRef<{ id: string; entries: RecentEntry[] } | null>(null);
  // Alignment guides (live during drag)
  const [alignGuides, setAlignGuides] = useState<AlignGuide[]>([]);
  const [spacingGuides, setSpacingGuides] = useState<SpacingGuide[]>([]);
  // Position readout HUD (shows X/Y during drag)
  const [dragHud, setDragHud] = useState<{ x: number; y: number } | null>(null);
  // Dimension picker
  const [showDimensionPicker, setShowDimensionPicker] = useState(false);
  const [customW, setCustomW] = useState('1080');
  const [customH, setCustomH] = useState('1080');
  const [lockAspect, setLockAspect] = useState(false);
  const customAspectRef = useRef(1); // w/h ratio when lock is activated

  // ── Recent item actions ───────────────────────────────────────────────────
  const deleteRecent = useCallback((entryTemplateId: string) => {
    if (!id) return;
    // Optimistically remove
    const before = [...recents];
    const updated = recents.filter((e) => e.templateId !== entryTemplateId);
    saveRecents(id, updated);
    setRecents(updated);
    pendingDeleteRef.current = { id: entryTemplateId, entries: before };
    toast('Design removed', {
      action: {
        label: 'Undo',
        onClick: () => {
          if (pendingDeleteRef.current?.id === entryTemplateId) {
            saveRecents(id, before);
            setRecents(before);
            pendingDeleteRef.current = null;
          }
        },
      },
      duration: 5000,
    });
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
    toast.success('Design duplicated');
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
    // Use actual saved canvas dimensions, falling back to template defaults
    const exportW = entry.data.canvasWidth || t.width;
    const exportH = entry.data.canvasHeight || t.height;
    const toastId = toast.loading('Preparing download…');
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
      const exportTarget = container.firstElementChild as HTMLElement | null;
      if (!exportTarget) {
        throw new Error('Unable to render recent design for export.');
      }
      const dataUrl = await exportNodeToPng(exportTarget, exportW, exportH);
      const link = document.createElement('a');
      link.download = `${(entry.customName || t.name).replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Downloaded!', { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error('Download failed', { id: toastId });
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
  const groupedBlocks = new Set<MarketingBlockKey>(data.groupedBlockKeys ?? []);
  const selectedCustomTextId = selectedBlock ? getCustomTextBlockId(selectedBlock) : null;
  const selectedCustomTextBlock = selectedCustomTextId
    ? data.customTextBlocks.find((entry) => entry.id === selectedCustomTextId) ?? null
    : null;

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

  const applyCanvasDimension = useCallback((dim: CanvasDimension) => {
    setData((prev) => ({
      ...prev,
      canvasDimensionId: dim.id,
      canvasWidth: dim.width,
      canvasHeight: dim.height,
    }));
    if (dim.id === 'custom') {
      setCustomW(String(dim.width));
      setCustomH(String(dim.height));
    }
    setShowDimensionPicker(false);
  }, [setData]);

  const applyCustomDimension = useCallback(() => {
    const w = Math.max(100, Math.min(4096, parseInt(customW, 10) || 1080));
    const h = Math.max(100, Math.min(4096, parseInt(customH, 10) || 1080));
    setData((prev) => ({
      ...prev,
      canvasDimensionId: 'custom',
      canvasWidth: w,
      canvasHeight: h,
    }));
    setShowDimensionPicker(false);
  }, [customW, customH, setData]);

  const updateBlockTransforms = useCallback((
    updates: Partial<Record<MarketingBlockKey, { x?: number; y?: number; scale?: number }>>,
    replace = false,
  ) => {
    const applyUpdate = replace ? replaceCurrentData : setData;
    applyUpdate((prev) => {
      const nextTransforms = { ...(prev.blockTransforms ?? {}) };

      Object.entries(updates).forEach(([blockKey, patch]) => {
        const block = blockKey as MarketingBlockKey;
        const current = nextTransforms[block] ?? { x: 0, y: 0, scale: 1 };
        nextTransforms[block] = {
          ...current,
          ...patch,
        };
      });

      return {
        ...prev,
        blockTransforms: nextTransforms,
      };
    });
  }, [replaceCurrentData, setData]);

  const updateBlockTransform = useCallback((
    block: MarketingBlockKey,
    nextTransform: { x: number; y: number; scale: number },
    replace = false,
  ) => {
    updateBlockTransforms({ [block]: nextTransform }, replace);
  }, [updateBlockTransforms]);

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

  // ── Block action toolbar helpers ─────────────────────────────────────────

  const toggleLockBlock = useCallback((block: MarketingBlockKey) => {
    setLockedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(block)) {
        next.delete(block);
        toast.success('Block unlocked');
      } else {
        next.add(block);
        toast('Block locked — position is frozen');
      }
      return next;
    });
  }, []);

  const duplicateBlock = useCallback((block: MarketingBlockKey) => {
    if (isCustomTextBlock(block)) {
      // Custom text blocks can actually be duplicated
      const customTextId = getCustomTextBlockId(block);
      if (!customTextId) return;
      const newId = `text-${Date.now()}`;
      const newBlockKey = `custom-text-${newId}` as MarketingBlockKey;
      const currentTransform = data.blockTransforms?.[block];
      setData((prev) => {
        const original = prev.customTextBlocks.find((entry) => entry.id === customTextId);
        if (!original) return prev;
        return {
          ...prev,
          customTextBlocks: [...prev.customTextBlocks, { id: newId, text: original.text }],
          blockTransforms: {
            ...prev.blockTransforms,
            [newBlockKey]: {
              x: (currentTransform?.x ?? 0) + 24,
              y: (currentTransform?.y ?? 0) + 24,
              scale: currentTransform?.scale ?? 1,
            },
          },
        };
      });
      setSelectedBlock(newBlockKey);
      toast.success('Text box duplicated');
      return;
    }

    // Template blocks can't be truly duplicated — reset position instead (already in toolbar via Reset)
    toast('Template blocks can\'t be duplicated — use Reset to clear position');
  }, [data.blockTransforms, setData]);

  const deleteBlock = useCallback((block: MarketingBlockKey) => {
    if (isCustomTextBlock(block)) {
      const customTextId = getCustomTextBlockId(block);
      if (!customTextId) return;

      setData((prev) => {
        const nextTransforms = { ...(prev.blockTransforms ?? {}) };
        delete nextTransforms[block];
        return {
          ...prev,
          customTextBlocks: prev.customTextBlocks.filter((entry) => entry.id !== customTextId),
          groupedBlockKeys: prev.groupedBlockKeys.filter((entry) => entry !== block),
          blockTransforms: nextTransforms,
        };
      });
      setLockedBlocks((prev) => {
        const next = new Set(prev);
        next.delete(block);
        return next;
      });
      setSelectedBlock(null);
      toast.success('Custom text removed');
      return;
    }

    // Other blocks → hide via visibility toggle
    const visibilityKey = (block === 'agent' || block === 'photo') ? null : block as keyof TemplateVisibility;
    if (!visibilityKey) return;
    setData((prev) => ({
      ...prev,
      groupedBlockKeys: prev.groupedBlockKeys.filter((entry) => entry !== block),
      visibility: { ...prev.visibility, [visibilityKey]: false },
    }));
    setSelectedBlock(null);
    toast('Block hidden', {
      action: {
        label: 'Undo',
        onClick: () => setData((prev) => ({
          ...prev,
          visibility: { ...prev.visibility, [visibilityKey]: true },
        })),
      },
      duration: 5000,
    });
  }, [setData]);

  const toggleGroupBlock = useCallback((block: MarketingBlockKey) => {
    setData((prev) => {
      const next = new Set(prev.groupedBlockKeys ?? []);
      if (next.has(block)) {
        next.delete(block);
        toast('Ungrouped');
      } else {
        next.add(block);
        toast(next.size > 1 ? `${next.size} blocks will move together` : 'Block added to group');
      }

      return {
        ...prev,
        groupedBlockKeys: Array.from(next),
      };
    });
  }, [setData]);

  const addCustomTextBlock = useCallback(() => {
    const customTextId = `text-${Date.now()}`;
    const blockKey = `custom-text-${customTextId}` as MarketingBlockKey;

    setData((prev) => {
      const cw = prev.canvasWidth || 1080;
      const ch = prev.canvasHeight || 1080;
      // Scale the stacking offset proportionally with canvas size
      const fontScale = cw / 1080;
      const stackOffset = Math.round(72 * fontScale);
      return {
        ...prev,
        customTextBlocks: [
          ...prev.customTextBlocks,
          {
            id: customTextId,
            text: 'Custom text',
          },
        ],
        blockTransforms: {
          ...(prev.blockTransforms ?? {}),
          [blockKey]: {
            x: Math.round(cw * 0.08),
            y: Math.round(ch * 0.1) + (prev.customTextBlocks.length * stackOffset),
            scale: 1,
          },
        },
      };
    });

    setSelectedBlock(blockKey);
    toast.success('Custom text box added');
  }, [setData]);

  const updateCustomTextBlock = useCallback((blockId: string, text: string) => {
    setData((prev) => ({
      ...prev,
      customTextBlocks: prev.customTextBlocks.map((entry) =>
        entry.id === blockId ? { ...entry, text } : entry
      ),
    }));
  }, [setData]);

  // ── Photo upload — persists to Supabase storage ───────────────────────────
  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!id) {
      // No deal context — fall back to temporary blob URL with a warning
      const url = URL.createObjectURL(file);
      setData((prev) => ({ ...prev, photos: [url, ...prev.photos] }));
      toast.warning('Photo added locally only — open this template from a deal to save photos permanently.');
      return;
    }

    setUploadingPhoto(true);
    try {
      // Upload to Supabase and get back the permanent public URL via query invalidation
      await uploadDealPhoto.mutateAsync({ dealId: id, file });
      // dealPhotos query will auto-refresh; we'll sync via the dealPhotos effect below
      toast.success('Photo uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Photo upload failed. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  }, [id, uploadDealPhoto, setData]);

  // Sync deal photos into editor whenever they change (covers both initial load + new uploads)
  useEffect(() => {
    if (!photosInitialized || dealPhotos.length === 0) return;
    setData((prev) => {
      // Only update if the Supabase URLs are different from what we have
      const supabaseUrls = dealPhotos.map((p) => p.url);
      const hasNew = supabaseUrls.some((u) => !prev.photos.includes(u));
      if (!hasNew) return prev;
      // Merge: Supabase photos first, then any local blob URLs not yet replaced
      const blobUrls = prev.photos.filter((u) => u.startsWith('blob:'));
      return { ...prev, photos: [...supabaseUrls, ...blobUrls] };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dealPhotos]);

  const removePhoto = (index: number) => {
    setData((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const reorderPhoto = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setData((prev) => {
      const photos = [...prev.photos];
      const [moved] = photos.splice(fromIndex, 1);
      photos.splice(toIndex, 0, moved);
      return { ...prev, photos };
    });
  }, [setData]);

  // ── Personal photo upload — session-only blob URLs ─────────────────────────
  const handlePersonalPhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Snapshot files BEFORE resetting the input — some browsers clear FileList on value reset
    const fileList = e.target.files;
    const fileArray = fileList ? Array.from(fileList) : [];
    // Reset input so the same file can be re-selected later
    e.target.value = '';
    if (fileArray.length === 0) return;
    const urls = fileArray.map((f) => URL.createObjectURL(f));
    // Add to sidebar thumbnails
    setPersonalPhotos((prev) => [...urls, ...prev]);
    // Also add to the poster's photo array so the template actually shows them
    setData((prev) => ({ ...prev, photos: [...urls, ...prev.photos] }));
    toast.success(urls.length === 1 ? 'Photo added to poster' : `${urls.length} photos added to poster`);
  }, [setData]);

  const removePersonalPhoto = useCallback((index: number) => {
    setPersonalPhotos((prev) => {
      const removed = prev[index];
      if (removed?.startsWith('blob:')) URL.revokeObjectURL(removed);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ── Drag photo onto canvas — sets as main poster photo ─────────────────────
  const handleCanvasPhotoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const photoUrl = e.dataTransfer.getData('text/photo-url');
    if (photoUrl) {
      setData((prev) => {
        // Put the dropped photo first (main photo position)
        const filtered = prev.photos.filter((u) => u !== photoUrl);
        return { ...prev, photos: [photoUrl, ...filtered] };
      });
      toast.success('Photo set as main image');
      return;
    }
    // Also handle file drops directly onto canvas
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPersonalPhotos((prev) => [url, ...prev]);
        setData((prev) => ({ ...prev, photos: [url, ...prev.photos] }));
        toast.success('Photo added and set as main image');
      }
    }
  }, [setData]);

  const handleCanvasPhotoDragOver = useCallback((e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('text/photo-url') || e.dataTransfer.types.includes('Files')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, []);

  const selectTemplate = (tid: string) => {
    setSearchParams({ template: tid });
  };

  /** Resume a recent entry: load its saved data and switch to edit tab */
  const resumeRecent = (entry: RecentEntry) => {
    setSearchParams({ template: entry.templateId });
    const recentTemplate = TEMPLATES.find((t) => t.id === entry.templateId);
    setHist({
      stack: [hydrateTemplateData(getDefaultTemplateData(deal, recentTemplate?.category ?? template.category), entry.data)],
      index: 0,
    });
  };

  const handleExport = useCallback(async () => {
    if (!canvasRef.current) return;
    setExporting(true);
    const toastId = toast.loading('Exporting image…');
    const exportW = data.canvasWidth || 1080;
    const exportH = data.canvasHeight || 1080;
    try {
      const dataUrl = await exportNodeToPng(canvasRef.current, exportW, exportH);
      const link = document.createElement('a');
      link.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}-${data.address.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Downloaded successfully!', { id: toastId });
    } catch (err) {
      console.error('Export failed:', err);
      toast.error('Export failed — please try again.', { id: toastId });
    } finally {
      setExporting(false);
    }
  }, [template, data.address]);

  // Canvas dimensions — use data dimensions (which reflect selected dimension preset)
  const canvasW = data.canvasWidth || 1080;
  const canvasH = data.canvasHeight || 1080;

  // Scale canvas to viewport (subtract panel widths / header height)
  const maxCanvasWidth  = typeof window !== 'undefined' ? window.innerWidth  - LEFT_PANEL_WIDTH - 64 : 600;
  const maxCanvasHeight = typeof window !== 'undefined' ? window.innerHeight - TOP_BAR_HEIGHT   - 64 : 600;
  const naturalScale = Math.min(maxCanvasWidth / canvasW, maxCanvasHeight / canvasH, 1);
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
      // Re-measure both on load and when already complete
      if (image.complete) {
        handleLoad();
      } else {
        image.addEventListener('load', handleLoad);
      }
    });

    return () => {
      images.forEach((image) => image.removeEventListener('load', handleLoad));
    };
  }, [measureBlocks, data.photos, templateId]);

  // Keep a ref to blockRects so pointer handler can read latest without re-registering
  const blockRectsRef = useRef<Partial<Record<MarketingBlockKey, MarketingBlockRect>>>({});
  // Live overlay positions during drag — updated every pointermove frame, no setState lag
  const liveOverlayRef = useRef<Partial<Record<MarketingBlockKey, MarketingBlockRect>>>({});
  const [, forceOverlayUpdate] = useState(0);
  useEffect(() => { blockRectsRef.current = blockRects; }, [blockRects]);

  // Keep a ref to canvasW/H for snap engine
  const canvasSizeRef = useRef({ w: canvasW, h: canvasH });
  useEffect(() => { canvasSizeRef.current = { w: canvasW, h: canvasH }; }, [canvasW, canvasH]);

  const getInteractionTargets = useCallback((block: MarketingBlockKey) => {
    const rects = blockRectsRef.current;
    const groupedTargetKeys = groupedBlocks.has(block)
      ? (data.groupedBlockKeys ?? []).filter((entry) => rects[entry] && !lockedBlocks.has(entry))
      : [block];

    const targetKeys = groupedTargetKeys.length > 0 ? groupedTargetKeys : [block];

    return targetKeys
      .map((entry) => {
        const baseRect = rects[entry];
        if (!baseRect) return null;
        const currentTransform = data.blockTransforms?.[entry];
        return {
          block: entry,
          startTransform: {
            x: currentTransform?.x ?? 0,
            y: currentTransform?.y ?? 0,
            scale: currentTransform?.scale ?? 1,
          },
          baseRect,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  }, [data.blockTransforms, data.groupedBlockKeys, groupedBlocks, lockedBlocks]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const interaction = interactionRef.current;
      if (!interaction) return;

      event.preventDefault();
      setIsDraggingBlock(true); // hide action toolbar while dragging

      const divisor = scaleRef.current || 1;
      const dx = (event.clientX - interaction.startClientX) / divisor;
      const dy = (event.clientY - interaction.startClientY) / divisor;

      if (interaction.mode === 'move') {
        // ── photo-N pan mode — drag shifts the image within its cell ────────
        if (isPhotoIndexBlock(interaction.block)) {
          const newX = interaction.startTransform.x + dx;
          const newY = interaction.startTransform.y + dy;
          updateBlockTransform(
            interaction.block,
            { ...interaction.startTransform, x: newX, y: newY },
            interaction.committed,
          );
          interaction.committed = true;
          // Live overlay stays at the cell rect (cell doesn't move, only the image inside pans)
          forceOverlayUpdate((n) => n + 1);
          setAlignGuides([]);
          setSpacingGuides([]);
          setDragHud({ x: Math.round(newX), y: Math.round(newY) });
          return;
        }

        const rawX = interaction.startTransform.x + dx;
        const rawY = interaction.startTransform.y + dy;

        // Current block rect (moved to proposed position)
        const baseRect = interaction.baseRect;
        const proposedLeft = baseRect.left + (rawX - interaction.startTransform.x);
        const proposedTop  = baseRect.top  + (rawY - interaction.startTransform.y);
        const proposed = {
          left: proposedLeft,
          top: proposedTop,
          width: baseRect.width,
          height: baseRect.height,
        };

        // Compute snapping — convert other rects (they're in canvas-px already)
        const snap = computeSnap(
          interaction.block,
          proposed,
          canvasSizeRef.current.w,
          canvasSizeRef.current.h,
          blockRectsRef.current,
        );

        // Apply snap offset to transform
        const snappedX = rawX + snap.x;
        const snappedY = rawY + snap.y;

        const deltaX = snappedX - interaction.startTransform.x;
        const deltaY = snappedY - interaction.startTransform.y;
        const updates: Partial<Record<MarketingBlockKey, { x?: number; y?: number; scale?: number }>> = {};

        interaction.targets.forEach((target) => {
          updates[target.block] = {
            ...target.startTransform,
            x: target.startTransform.x + deltaX,
            y: target.startTransform.y + deltaY,
          };
        });

        updateBlockTransforms(updates, interaction.committed);
        interaction.committed = true;

        // ── Live overlay sync (no DOM measurement lag) ──────────────────
        // Compute exactly where each dragged block's overlay rect should be
        // using the same math as the transform, then force a cheap re-render
        // of the overlay layer only (no template re-render involved).
        interaction.targets.forEach((target) => {
          const base = target.baseRect;
          liveOverlayRef.current[target.block] = {
            left:  base.left  + deltaX,
            top:   base.top   + deltaY,
            width: base.width,
            height: base.height,
          };
        });
        forceOverlayUpdate((n) => n + 1);

        // Update guide overlays + position HUD
        setAlignGuides(snap.guides);
        setSpacingGuides(snap.spacingGuides);
        setDragHud({ x: Math.round(snappedX), y: Math.round(snappedY) });
        return;
      }

      // Resize mode — no snapping, clear guides
      setAlignGuides([]);
      setSpacingGuides([]);

      // ── photo-N zoom mode — drag changes zoom level within the cell ──────
      if (isPhotoIndexBlock(interaction.block)) {
        const baseSize = Math.max(interaction.baseRect.width, interaction.baseRect.height, 120);
        const dominantDelta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        const nextScale = Math.min(
          5,
          // photo-N zoom minimum is 1.0 — can't zoom out below filling the cell
          Math.max(1, interaction.startTransform.scale * ((baseSize + dominantDelta) / baseSize)),
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
        return;
      }

      const isGroupedInteraction = interaction.targets.length > 1;

      if (isGroupedInteraction) {
        const baseScaleSize = Math.max(interaction.baseRect.width, interaction.baseRect.height, 120);
        const dominantDelta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
        const ratio = Math.min(3, Math.max(0.35, (baseScaleSize + dominantDelta) / baseScaleSize));
        const updates: Partial<Record<MarketingBlockKey, { x?: number; y?: number; scale?: number }>> = {};

        interaction.targets.forEach((target) => {
          updates[target.block] = {
            ...target.startTransform,
            scale: Number.isFinite(target.startTransform.scale * ratio)
              ? Math.min(3, Math.max(0.35, target.startTransform.scale * ratio))
              : target.startTransform.scale,
          };
        });

        updateBlockTransforms(updates, interaction.committed);
      } else {
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
      }
      interaction.committed = true;
    };

    const handlePointerEnd = () => {
      interactionRef.current = null;
      // Clear live overlay overrides so we fall back to measured blockRects
      liveOverlayRef.current = {};
      // Clear guides + HUD when drag ends
      setAlignGuides([]);
      setSpacingGuides([]);
      setDragHud(null);
      setIsDraggingBlock(false); // re-show action toolbar
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerEnd);
    window.addEventListener('pointercancel', handlePointerEnd);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerEnd);
      window.removeEventListener('pointercancel', handlePointerEnd);
    };
  }, [getInteractionTargets, updateBlockTransform, updateBlockTransforms]);

  useEffect(() => {
    setSelectedBlock(null);
  }, [templateId]);

  // Keep custom W/H inputs in sync with current data dimensions
  useEffect(() => {
    setCustomW(String(data.canvasWidth || 1080));
    setCustomH(String(data.canvasHeight || 1080));
  }, [data.canvasWidth, data.canvasHeight]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable;

      // Undo / Redo (always)
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); return; }
      if ((mod && e.key === 'z' && e.shiftKey) || (mod && e.key === 'y')) { e.preventDefault(); handleRedo(); return; }

      // Canvas shortcuts only when not in an input
      if (isInput) return;

      // Escape — deselect block
      if (e.key === 'Escape') { setSelectedBlock(null); return; }

      // Delete / Backspace — reset selected block position
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlock) {
        e.preventDefault();
        if (isCustomTextBlock(selectedBlock)) {
          deleteBlock(selectedBlock);
          return;
        }
        resetSelectedBlock();
        return;
      }

      // Arrow keys — nudge selected block
      if (selectedBlock && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const nudge = e.shiftKey ? 10 : 1;
        const targets = getInteractionTargets(selectedBlock);
        const updates: Partial<Record<MarketingBlockKey, { x?: number; y?: number; scale?: number }>> = {};

        targets.forEach((target) => {
          let nx = target.startTransform.x;
          let ny = target.startTransform.y;
          if (e.key === 'ArrowUp') ny -= nudge;
          if (e.key === 'ArrowDown') ny += nudge;
          if (e.key === 'ArrowLeft') nx -= nudge;
          if (e.key === 'ArrowRight') nx += nudge;

          updates[target.block] = {
            ...target.startTransform,
            x: nx,
            y: ny,
          };
        });

        updateBlockTransforms(updates);
        return;
      }

      // +/- — zoom
      if (e.key === '+' || e.key === '=') { setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2))); return; }
      if (e.key === '-') { setZoom((z) => Math.max(0.15, +(z - 0.1).toFixed(2))); return; }
      if (e.key === '0') { setZoom(1); return; }
      // ? — toggle shortcut overlay
      if (e.key === '?') { setShowShortcuts((s) => !s); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [data.blockTransforms, deleteBlock, getInteractionTargets, handleRedo, handleUndo, resetSelectedBlock, selectedBlock, updateBlockTransforms]);

  const beginBlockInteraction = useCallback((
    event: React.PointerEvent<HTMLButtonElement>,
    block: MarketingBlockKey,
    mode: 'move' | 'resize',
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedBlock(block);

    // Locked blocks can be selected but not moved/resized.
    // photo-N cells are also locked when the parent 'photo' block is locked.
    const effectiveLocked = lockedBlocks.has(block) || (isPhotoIndexBlock(block) && lockedBlocks.has('photo'));
    if (effectiveLocked) return;

    const currentTransform = data.blockTransforms?.[block];
    const baseRect = blockRects[block] ?? { left: 0, top: 0, width: 220, height: 220 };
    const targets = getInteractionTargets(block);
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
      baseRect,
      targets,
      committed: false,
    };
  }, [blockRects, data.blockTransforms, getInteractionTargets, lockedBlocks]);


  return (
    <div className="h-screen flex flex-col bg-muted/20">
      {/* ── Top Toolbar ── */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/transactions/${id}?tab=Marketing`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{template.name}</span>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', CATEGORY_COLORS[template.category])}>
              {template.category}
            </span>
            <span className="text-xs text-muted-foreground">
              {TYPE_LABELS[template.type]} · {canvasW}×{canvasH}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dimension picker button */}
          <button
            onClick={() => setShowDimensionPicker(true)}
            className="flex items-center gap-1.5 h-8 px-3 rounded-md border bg-background text-xs font-medium hover:bg-muted transition-colors"
            title="Change canvas dimensions"
          >
            {/* Aspect ratio visual indicator */}
            <span className="flex items-center justify-center">
              <span
                className="border-2 border-foreground/70 rounded-sm bg-muted/40"
                style={{
                  display: 'inline-block',
                  width: Math.round(14 * Math.min(1, canvasW / canvasH)),
                  height: Math.round(14 * Math.min(1, canvasH / canvasW)),
                  minWidth: 8,
                  minHeight: 8,
                }}
              />
            </span>
            <span className="text-muted-foreground">
              {CANVAS_DIMENSIONS.find(d => d.id === data.canvasDimensionId)?.aspectLabel ?? `${canvasW}×${canvasH}`}
            </span>
            <span className="font-semibold text-foreground">
              {canvasW}×{canvasH}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border rounded-md px-1">
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={handleUndo} disabled={!canUndo}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost" size="icon" className="h-7 w-7"
              onClick={handleRedo} disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Zoom — presets + fine-tune */}
          <div className="flex items-center gap-1 border rounded-md px-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Zoom out (-)" onClick={() => setZoom((z) => Math.max(0.15, +(z - 0.1).toFixed(2)))}>
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            {/* Quick preset buttons */}
            <div className="flex items-center gap-0.5">
              {ZOOM_PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setZoom(p)}
                  className={cn(
                    'h-5 px-1.5 rounded text-[10px] font-medium transition-colors',
                    Math.abs(zoom - p) < 0.01
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  title={`Set zoom to ${Math.round(p * 100)}%`}
                >
                  {Math.round(p * 100)}%
                </button>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Zoom in (+)" onClick={() => setZoom((z) => Math.min(1.5, +(z + 0.1).toFixed(2)))}>
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Auto-save status */}
          <div className={cn(
            'flex items-center gap-1 text-[11px] font-medium transition-all duration-300',
            saveStatus === 'idle' ? 'opacity-0 pointer-events-none' : 'opacity-100',
            saveStatus === 'saved' ? 'text-emerald-600' : 'text-muted-foreground'
          )}>
            {saveStatus === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
            {saveStatus === 'saved' && <Check className="h-3 w-3" />}
            {saveStatus === 'saving' ? 'Saving…' : 'Saved'}
          </div>

          {/* Keyboard shortcuts button */}
          <Button
            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (?)"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </Button>

          <Button onClick={handleExport} size="sm" disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exporting ? 'Exporting…' : 'Download PNG'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel ── */}
        <div className="w-[260px] border-r bg-background shrink-0 flex flex-col">
          {/* ── Edit Panel ── */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
                {/* Property Photos */}
                <div className="pb-3 border-b mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-foreground">Property Photos</div>
                    {data.photos.length > 1 ? (
                      <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                        <GripVertical className="h-2.5 w-2.5" />
                        Drag to reorder
                      </span>
                    ) : dealPhotos.length > 0 ? (
                      <span className="text-[9px] text-muted-foreground">{dealPhotos.length} from deal</span>
                    ) : null}
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {data.photos.length === 0 ? (
                    <button
                      onClick={() => photoInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="w-full h-24 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-1.5 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingPhoto
                        ? <><Loader2 className="h-5 w-5 animate-spin" /><span>Uploading…</span></>
                        : <><ImagePlus className="h-5 w-5" /><span>Click to add photo</span></>
                      }
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {data.photos.map((src, i) => (
                        <div
                          key={src + i}
                          className="relative group cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={(e) => {
                            photoDragIndexRef.current = i;
                            e.dataTransfer.setData('text/photo-url', src);
                            e.dataTransfer.effectAllowed = 'copyMove';
                          }}
                          onDragOver={(e) => { e.preventDefault(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const from = photoDragIndexRef.current;
                            if (from !== null && from !== i) reorderPhoto(from, i);
                            photoDragIndexRef.current = null;
                          }}
                          onDragEnd={() => { photoDragIndexRef.current = null; }}
                        >
                          <img src={src} alt="" className="w-16 h-16 object-cover rounded border" />
                          <div className="absolute top-0 left-0 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <GripVertical className="h-3 w-3 text-white drop-shadow" />
                          </div>
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
                        disabled={uploadingPhoto}
                        className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                      >
                        {uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                      </button>
                    </div>
                  )}
                </div>

                {/* Personal Photos — session-only, not saved to deal */}
                <div className="pb-4 border-b mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-foreground">Personal Photos</div>
                    <span className="text-[9px] text-muted-foreground">Drag onto poster</span>
                  </div>
                  <input ref={personalPhotoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePersonalPhotoUpload} />
                  {personalPhotos.length === 0 ? (
                    <button
                      onClick={() => personalPhotoInputRef.current?.click()}
                      className="w-full h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors text-xs"
                    >
                      <ImagePlus className="h-4 w-4" />
                      <span>Add any photo</span>
                    </button>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {personalPhotos.map((src, i) => (
                        <div
                          key={src + i}
                          className="relative group cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/photo-url', src);
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                        >
                          <img src={src} alt="" className="w-16 h-16 object-cover rounded border" />
                          <button
                            onClick={() => removePersonalPhoto(i)}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-2.5 w-2.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => personalPhotoInputRef.current?.click()}
                        className="w-16 h-16 border-2 border-dashed border-muted-foreground/30 rounded flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Style & Layout */}
                <Collapsible open={studioBasicsOpen} onOpenChange={setStudioBasicsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t">
                    Style &amp; Layout
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${studioBasicsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-3 pb-4">
                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Headline Style</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['h1', 'h2', 'h3'] as HeadlineStyle[]).map((hs) => {
                          const meta = HEADLINE_STYLE_LABELS[hs];
                          return (
                            <OptionCard
                              key={hs}
                              label={meta.name}
                              description={meta.desc}
                              preview={
                                hs === 'h1' ? <span className={cn('font-serif text-2xl italic leading-none', data.headlineStyle === 'h1' ? 'text-primary' : 'text-foreground')}>Aa</span>
                                : hs === 'h2' ? <span className={cn('text-sm font-bold uppercase tracking-[0.25em] leading-none', data.headlineStyle === 'h2' ? 'text-primary' : 'text-foreground')}>AA</span>
                                : <span className={cn('font-serif text-2xl font-medium leading-none', data.headlineStyle === 'h3' ? 'text-primary' : 'text-foreground')}>Aa</span>
                              }
                              active={data.headlineStyle === hs}
                              onClick={() => setHeadlineStyle(hs)}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Photo Layout</div>
                      <div className="grid grid-cols-2 gap-2">
                        <OptionCard
                          label="Hero"
                          description="Single full-bleed photo"
                          active={data.photoLayout === 'single'}
                          preview={
                            <div className={cn('w-14 h-8 rounded-md', data.photoLayout === 'single' ? 'bg-primary/30 border border-primary' : 'bg-muted-foreground/20')} />
                          }
                          onClick={() => setPhotoLayout('single')}
                        />
                        <OptionCard
                          label="Collage"
                          description="Main + 2 side photos"
                          active={data.photoLayout === 'collage'}
                          preview={
                            <div className="flex flex-col gap-0.5 w-14 h-8">
                              <div className={cn('rounded-sm flex-[1.75]', data.photoLayout === 'collage' ? 'bg-primary/30 border border-primary' : 'bg-muted-foreground/20')} />
                              <div className="flex gap-0.5 flex-1">
                                <div className={cn('flex-1 rounded-sm', data.photoLayout === 'collage' ? 'bg-primary/20 border border-primary/50' : 'bg-muted-foreground/15')} />
                                <div className={cn('flex-1 rounded-sm', data.photoLayout === 'collage' ? 'bg-primary/20 border border-primary/50' : 'bg-muted-foreground/15')} />
                              </div>
                            </div>
                          }
                          onClick={() => setPhotoLayout('collage')}
                        />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Agents section */}
                <Collapsible open={studioAgentsOpen} onOpenChange={setStudioAgentsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t">
                    Agents
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${studioAgentsOpen ? 'rotate-180' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 pb-4">
                    <div className="grid grid-cols-2 gap-2">
                      <OptionCard
                        label="Single"
                        description="One agent footer"
                        icon={User}
                        active={data.agentLayout === 'single'}
                        onClick={() => setAgentLayout('single')}
                      />
                      <OptionCard
                        label="Multi-Agent"
                        description="All deal agents"
                        icon={Users}
                        active={data.agentLayout === 'multi'}
                        onClick={() => setAgentLayout('multi')}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {selectedBlock ? (
                  <div className="rounded-2xl border bg-muted/25 px-3 py-3 text-[11px] leading-4 text-muted-foreground">
                    <div className="flex items-center justify-between gap-2 rounded-xl border bg-background px-2.5 py-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Selected</div>
                        <div className="text-xs font-semibold text-foreground">{getBlockLabel(selectedBlock, data.customTextBlocks)}</div>
                      </div>
                      <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={resetSelectedBlock}>
                        Reset
                      </Button>
                    </div>
                  </div>
                ) : null}

                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t">
                    Custom Text
                    <ChevronDown className="h-3.5 w-3.5 transition-transform data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2.5 pb-4">
                    <Button type="button" variant="outline" size="sm" className="h-8 w-full justify-start gap-2 text-xs" onClick={addCustomTextBlock}>
                      <Type className="h-3.5 w-3.5" />
                      Add Text Box
                    </Button>

                    {data.customTextBlocks.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                          {data.customTextBlocks.map((entry, index) => {
                            const blockKey = `custom-text-${entry.id}` as MarketingBlockKey;
                            const selected = selectedBlock === blockKey;
                            return (
                              <button
                                key={entry.id}
                                type="button"
                                onClick={() => setSelectedBlock(blockKey)}
                                className={cn(
                                  'rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors',
                                  selected
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'border-border bg-background text-muted-foreground hover:text-foreground'
                                )}
                              >
                                {entry.text.trim() ? `${index + 1}. ${entry.text.trim().slice(0, 18)}` : `Text ${index + 1}`}
                              </button>
                            );
                          })}
                        </div>

                        {selectedCustomTextBlock ? (
                          <div className="rounded-xl border bg-background p-3 space-y-2.5">
                            <div>
                              <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Text content</Label>
                              <Textarea
                                value={selectedCustomTextBlock.text}
                                onChange={(event) => updateCustomTextBlock(selectedCustomTextBlock.id, event.target.value)}
                                className="mt-1 text-xs"
                                rows={3}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 w-full justify-start gap-2 text-xs text-red-600 hover:text-red-700"
                              onClick={() => deleteBlock(`custom-text-${selectedCustomTextBlock.id}` as MarketingBlockKey)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Remove Text Box
                            </Button>
                          </div>
                        ) : (
                          <div className="rounded-xl border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                            Select a text box on the canvas to edit its text here.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                        Add a custom text box if you want text that is not tied to the template fields.
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Property Details */}
                <Collapsible open={basicsOpen} onOpenChange={setBasicsOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-xs font-semibold text-foreground hover:text-foreground/80 border-t">
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
                      <Input value={data.price} onChange={(e) => updateField('price', e.target.value)} placeholder="$595,000" className="mt-1 h-7 text-xs" />
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
                        <Input
                          type="number" min="0" max="99" step="1"
                          value={data.beds}
                          onChange={(e) => updateField('beds', e.target.value)}
                          className="mt-1 h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Baths</Label>
                        <Input
                          type="number" min="0" max="99" step="0.5"
                          value={data.baths}
                          onChange={(e) => updateField('baths', e.target.value)}
                          className="mt-1 h-7 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Sq Ft</Label>
                        <Input
                          value={data.sqft}
                          onChange={(e) => updateField('sqft', e.target.value)}
                          placeholder="2,500"
                          className="mt-1 h-7 text-xs"
                        />
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
                        <Input value={data.openHouseDate} onChange={(e) => updateField('openHouseDate', e.target.value)} placeholder="Saturday, March 22" className="mt-1 h-7 text-xs" />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wide">Time</Label>
                        <Input value={data.openHouseTime} onChange={(e) => updateField('openHouseTime', e.target.value)} placeholder="1:00 PM – 4:00 PM" className="mt-1 h-7 text-xs" />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
            </div>
          </ScrollArea>

        </div>

        {/* ── Canvas Area ── */}
        <div
          className="flex-1 overflow-auto flex items-start justify-center p-8 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] [background-size:20px_20px] relative"
          onDragOver={handleCanvasPhotoDragOver}
          onDrop={handleCanvasPhotoDrop}
        >
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
              style={{ width: canvasW, height: canvasH }}
            >
              <div
                ref={canvasRef}
                style={{ width: canvasW, height: canvasH }}
              >
                <TemplateErrorBoundary>
                  {template.render(data, false)}
                </TemplateErrorBoundary>
              </div>

              {/* ── Alignment Guide Overlay ── */}
              {(alignGuides.length > 0 || spacingGuides.length > 0) && (
                <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 30 }}>
                  {/* Center/alignment lines */}
                  {alignGuides.map((guide, i) => (
                    guide.type === 'v' ? (
                      <div
                        key={`v-${i}`}
                        className="absolute top-0 bottom-0"
                        style={{
                          left: guide.pos,
                          width: 1,
                          background: GUIDE_COLOR,
                          opacity: 0.9,
                          boxShadow: `0 0 3px ${GUIDE_COLOR}`,
                        }}
                      >
                        {guide.label && (
                          <span
                            className="absolute text-[9px] font-bold px-1 py-0.5 rounded whitespace-nowrap"
                            style={{
                              top: canvasH / 2 - 10,
                              left: 4,
                              background: GUIDE_COLOR,
                              color: '#fff',
                              fontSize: 11,
                            }}
                          >
                            {guide.label}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div
                        key={`h-${i}`}
                        className="absolute left-0 right-0"
                        style={{
                          top: guide.pos,
                          height: 1,
                          background: GUIDE_COLOR,
                          opacity: 0.9,
                          boxShadow: `0 0 3px ${GUIDE_COLOR}`,
                        }}
                      >
                        {guide.label && (
                          <span
                            className="absolute text-[9px] font-bold px-1 py-0.5 rounded whitespace-nowrap"
                            style={{
                              left: canvasW / 2 - 25,
                              top: 4,
                              background: GUIDE_COLOR,
                              color: '#fff',
                              fontSize: 11,
                            }}
                          >
                            {guide.label}
                          </span>
                        )}
                      </div>
                    )
                  ))}

                  {/* Spacing guides — only rendered when equal/centered spacing detected */}
                  {spacingGuides.map((sg, i) => {
                    const gapPx = Math.round(sg.value);
                    if (gapPx < 2) return null;
                    // All spacing guides here are meaningful (equal or centered)
                    // Use orange-amber to match Canva's equal-spacing color
                    const color = '#f59e0b';
                    const labelText = sg.reason === 'centered' ? `= ${gapPx}` : `= ${gapPx}`;

                    if (sg.axis === 'x') {
                      const midY = sg.center;
                      const midX = (sg.from + sg.to) / 2;
                      const gapW = sg.to - sg.from;
                      return (
                        <div key={`sg-x-${i}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                          {/* Gap line */}
                          <div style={{ position: 'absolute', left: sg.from, top: midY - 0.5, width: gapW, height: 1, background: color, opacity: 0.9 }} />
                          {/* End caps */}
                          <div style={{ position: 'absolute', left: sg.from, top: midY - 4, width: 1, height: 8, background: color, opacity: 0.9 }} />
                          <div style={{ position: 'absolute', left: sg.to - 1, top: midY - 4, width: 1, height: 8, background: color, opacity: 0.9 }} />
                          {/* Label — only when showLabel */}
                          {sg.showLabel && (
                            <span style={{
                              position: 'absolute',
                              left: midX,
                              top: midY - 16,
                              transform: 'translateX(-50%)',
                              background: color,
                              color: '#fff',
                              fontSize: 9,
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              padding: '1px 4px',
                              borderRadius: 3,
                              whiteSpace: 'nowrap',
                              letterSpacing: '0.02em',
                            }}>
                              {labelText}
                            </span>
                          )}
                        </div>
                      );
                    } else {
                      const midX = sg.center;
                      const midY = (sg.from + sg.to) / 2;
                      const gapH = sg.to - sg.from;
                      return (
                        <div key={`sg-y-${i}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                          {/* Gap line */}
                          <div style={{ position: 'absolute', top: sg.from, left: midX - 0.5, width: 1, height: gapH, background: color, opacity: 0.9 }} />
                          {/* End caps */}
                          <div style={{ position: 'absolute', top: sg.from, left: midX - 4, width: 8, height: 1, background: color, opacity: 0.9 }} />
                          <div style={{ position: 'absolute', top: sg.to - 1, left: midX - 4, width: 8, height: 1, background: color, opacity: 0.9 }} />
                          {/* Label — only when showLabel */}
                          {sg.showLabel && (
                            <span style={{
                              position: 'absolute',
                              top: midY,
                              left: midX + 6,
                              transform: 'translateY(-50%)',
                              background: color,
                              color: '#fff',
                              fontSize: 9,
                              fontWeight: 700,
                              fontFamily: 'monospace',
                              padding: '1px 4px',
                              borderRadius: 3,
                              whiteSpace: 'nowrap',
                              letterSpacing: '0.02em',
                            }}>
                              {labelText}
                            </span>
                          )}
                        </div>
                      );
                    }
                  })}
                </div>
              )}

              {/* ── Position Readout HUD ── */}
              {dragHud && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    bottom: 10,
                    right: 10,
                    zIndex: 40,
                    background: 'rgba(0,0,0,0.72)',
                    color: '#fff',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 5,
                    letterSpacing: '0.02em',
                    backdropFilter: 'blur(4px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  X {dragHud.x > 0 ? '+' : ''}{dragHud.x} &nbsp; Y {dragHud.y > 0 ? '+' : ''}{dragHud.y}
                </div>
              )}

              <div
                className="absolute inset-0"
                onPointerDown={(event) => {
                  if (event.target === event.currentTarget) {
                    setSelectedBlock(null);
                  }
                }}
              >
                {Object.entries(blockRects).map(([blockKey, measuredRect]) => {
                  if (!measuredRect) return null;
                  const block = blockKey as MarketingBlockKey;

                  // photo-N blocks are only interactive in collage mode
                  if (isPhotoIndexBlock(block) && data.photoLayout !== 'collage') return null;

                  // Use live-computed position during drag to eliminate render-lag;
                  // fall back to DOM-measured rect when idle.
                  const rect = liveOverlayRef.current[block] ?? measuredRect;
                  const selected = selectedBlock === block;

                  const isPhotoCell = isPhotoIndexBlock(block);
                  // photo-N cells inherit locked state from parent 'photo' block
                  const isLocked = lockedBlocks.has(block) || (isPhotoCell && lockedBlocks.has('photo'));
                  const isGrouped = !isPhotoCell && groupedBlocks.has(block);
                  const isCustomTextSelection = isCustomTextBlock(block);
                  const visibilityKey = (block === 'agent' || block === 'photo' || isCustomTextSelection || isPhotoCell)
                    ? null
                    : block as keyof TemplateVisibility;
                  const canDelete = visibilityKey !== null || isCustomTextSelection;

                  return (
                    <div
                      key={block}
                      className={cn(
                        'absolute group/block',
                        // photo cells get rounded corners matching the cell border-radius
                        isPhotoCell ? 'rounded-md' : 'rounded-xl',
                        // Only animate when NOT dragging — during drag we want instant position
                        !isDraggingBlock && 'transition-all',
                        selected && isLocked
                          ? 'border-2 border-amber-400 bg-amber-400/5 shadow-[0_0_0_1px_rgba(255,255,255,0.95)]'
                          : selected
                          ? 'border-2 border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(255,255,255,0.95)]'
                          : isLocked
                          ? 'border border-amber-400/40 hover:border-amber-400/70'
                          : 'border border-transparent hover:border-primary/50 hover:bg-primary/5'
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
                        className={cn(
                          'absolute inset-0',
                          isPhotoCell ? 'rounded-md' : 'rounded-xl',
                          isLocked ? 'cursor-not-allowed' : isPhotoCell ? 'cursor-grab active:cursor-grabbing' : 'cursor-move',
                        )}
                        onPointerDown={(event) => beginBlockInteraction(event, block, 'move')}
                        aria-label={`${isPhotoCell ? 'Pan' : 'Move'} ${getBlockLabel(block, data.customTextBlocks)}`}
                      />

                      {/* ── Floating Action Toolbar — appears above selected block ── */}
                      {selected && !isDraggingBlock && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-xl border bg-background/95 shadow-xl backdrop-blur-sm px-1 py-1"
                          style={{ bottom: '100%', marginBottom: 8, zIndex: 50, pointerEvents: 'auto', whiteSpace: 'nowrap' }}
                          onPointerDown={(e) => e.stopPropagation()} // don't start drag when clicking toolbar
                        >
                          {/* Block label */}
                          <span className="px-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide select-none">
                            {getBlockLabel(block, data.customTextBlocks)}
                          </span>

                          {/* photo-N toolbar: just reset pan/zoom */}
                          {isPhotoCell ? (
                            <>
                              <div className="w-px h-4 bg-border mx-0.5" />
                              <button
                                type="button"
                                title="Reset pan & zoom"
                                onClick={resetSelectedBlock}
                                className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              >
                                <Undo2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <div className="w-px h-4 bg-border mx-0.5" />

                              {/* Group / Ungroup */}
                              <button
                                type="button"
                                title={isGrouped ? 'Remove from group' : 'Add to group'}
                                onClick={() => toggleGroupBlock(block)}
                                className={cn(
                                  'flex items-center justify-center h-7 w-7 rounded-lg transition-colors',
                                  isGrouped
                                    ? 'bg-violet-100 text-violet-600 hover:bg-violet-200'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                              >
                                {isGrouped ? <Link2Off className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                              </button>

                              {/* Lock / Unlock */}
                              <button
                                type="button"
                                title={isLocked ? 'Unlock block' : 'Lock block'}
                                onClick={() => toggleLockBlock(block)}
                                className={cn(
                                  'flex items-center justify-center h-7 w-7 rounded-lg transition-colors',
                                  isLocked
                                    ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                              >
                                {isLocked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
                              </button>

                              {/* Duplicate — only for custom text blocks; template blocks get a Reset instead */}
                              {isCustomTextSelection ? (
                                <button
                                  type="button"
                                  title="Duplicate text box"
                                  onClick={() => duplicateBlock(block)}
                                  className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  title="Reset block position"
                                  onClick={resetSelectedBlock}
                                  className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                                >
                                  <Undo2 className="h-3.5 w-3.5" />
                                </button>
                              )}

                              {/* Delete (hide block) */}
                              {canDelete && (
                                <>
                                  <div className="w-px h-4 bg-border mx-0.5" />
                                  <button
                                    type="button"
                                    title="Hide block"
                                    onClick={() => deleteBlock(block)}
                                    className="flex items-center justify-center h-7 w-7 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {/* Label — always visible when locked; visible on hover or select otherwise */}
                      <div className={cn(
                        'pointer-events-none absolute left-2 top-2 rounded-full bg-background/95 px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm transition-opacity flex items-center gap-1',
                        selected || isLocked ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
                      )}>
                        {isLocked && <Lock className="h-2.5 w-2.5 text-amber-500" />}
                        {isGrouped && <Link2 className="h-2.5 w-2.5 text-violet-500" />}
                        {getBlockLabel(block, data.customTextBlocks)}
                      </div>

                      {/* Resize handle — visible on hover OR when selected (disabled when locked).
                          For photo cells this controls zoom level within the cell. */}
                      {!isLocked && (
                        <button
                          type="button"
                          className={cn(
                            'absolute bottom-0 right-0 h-5 w-5 translate-x-1/2 translate-y-1/2 rounded-full border-2 border-background bg-primary shadow-sm transition-opacity cursor-se-resize flex items-center justify-center',
                            selected ? 'opacity-100' : 'opacity-0 group-hover/block:opacity-100'
                          )}
                          onPointerDown={(event) => beginBlockInteraction(event, block, 'resize')}
                          aria-label={isPhotoCell ? `Zoom ${getBlockLabel(block, data.customTextBlocks)}` : `Resize ${getBlockLabel(block, data.customTextBlocks)}`}
                          title={isPhotoCell ? 'Drag to zoom' : 'Drag to resize'}
                        >
                          <Maximize2 className="h-2.5 w-2.5 text-primary-foreground" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Keyboard shortcut hint — bottom-right of canvas area */}
          <div className="absolute bottom-4 right-4 pointer-events-none">
            <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
              <Keyboard className="h-3 w-3" />
              Press <kbd className="px-1 py-0.5 rounded bg-muted/80 text-foreground/60 text-[9px] font-mono">?</kbd> for shortcuts
            </span>
          </div>
        </div>
      </div>

      {/* ── Dimension Picker Overlay ── */}
      {showDimensionPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowDimensionPicker(false)}
        >
          <div
            className="bg-background rounded-2xl border shadow-2xl p-6 w-[480px] max-w-[95vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-sm">Canvas Size</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Choose your posting format or set a custom size</p>
              </div>
              <button onClick={() => setShowDimensionPicker(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Presets grid */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              {CANVAS_DIMENSIONS.filter(d => d.id !== 'custom').map((dim) => {
                const isActive = data.canvasDimensionId === dim.id;
                // Visual aspect ratio preview box — max 40px wide or tall
                const previewMaxSize = 36;
                const previewW = dim.width >= dim.height
                  ? previewMaxSize
                  : Math.round(previewMaxSize * dim.width / dim.height);
                const previewH = dim.height >= dim.width
                  ? previewMaxSize
                  : Math.round(previewMaxSize * dim.height / dim.width);
                return (
                  <button
                    key={dim.id}
                    onClick={() => applyCanvasDimension(dim)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all hover:bg-muted/40',
                      isActive
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    {/* Aspect ratio preview */}
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <div
                        className={cn(
                          'rounded border-2',
                          isActive ? 'border-primary bg-primary/20' : 'border-muted-foreground/40 bg-muted/30'
                        )}
                        style={{ width: previewW, height: previewH }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{dim.label}</span>
                        <span className={cn(
                          'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}>
                          {dim.aspectLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{dim.sublabel}</div>
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5">{dim.platform}</div>
                    </div>
                    {isActive && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom size section */}
            <div className={cn(
              'rounded-xl border-2 p-4 transition-all',
              data.canvasDimensionId === 'custom' ? 'border-primary bg-primary/5' : 'border-border'
            )}>
              <div className="flex items-center gap-2 mb-3">
                <PencilLine className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Custom Size</span>
                <span className="text-[10px] text-muted-foreground ml-auto">px</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Width</Label>
                  <Input
                    type="number"
                    min="100"
                    max="4096"
                    value={customW}
                    onChange={(e) => {
                      setCustomW(e.target.value);
                      if (lockAspect) {
                        const w = parseInt(e.target.value, 10);
                        if (!isNaN(w)) setCustomH(String(Math.round(w / customAspectRef.current)));
                      }
                    }}
                    className="h-8 text-xs"
                    placeholder="1080"
                  />
                </div>

                {/* Aspect ratio lock button */}
                <button
                  type="button"
                  onClick={() => {
                    const newLocked = !lockAspect;
                    if (newLocked) {
                      const w = parseInt(customW, 10) || 1080;
                      const h = parseInt(customH, 10) || 1080;
                      customAspectRef.current = w / h;
                    }
                    setLockAspect(newLocked);
                  }}
                  className={cn(
                    'mt-5 h-8 w-8 rounded-lg border-2 flex items-center justify-center transition-all shrink-0',
                    lockAspect
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/30 text-muted-foreground hover:border-foreground/50'
                  )}
                  title={lockAspect ? 'Aspect ratio locked' : 'Lock aspect ratio'}
                >
                  {lockAspect ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
                    </svg>
                  )}
                </button>

                <div className="flex-1">
                  <Label className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 block">Height</Label>
                  <Input
                    type="number"
                    min="100"
                    max="4096"
                    value={customH}
                    onChange={(e) => {
                      setCustomH(e.target.value);
                      if (lockAspect) {
                        const h = parseInt(e.target.value, 10);
                        if (!isNaN(h)) setCustomW(String(Math.round(h * customAspectRef.current)));
                      }
                    }}
                    className="h-8 text-xs"
                    placeholder="1080"
                  />
                </div>
              </div>

              {/* Common custom size shortcuts */}
              <div className="flex flex-wrap gap-1 mt-3">
                {[
                  { label: 'LinkedIn Banner', w: 1584, h: 396 },
                  { label: 'Twitter Header', w: 1500, h: 500 },
                  { label: 'Email Header', w: 600, h: 200 },
                  { label: 'Flyer', w: 816, h: 1056 },
                ].map(({ label, w, h }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => { setCustomW(String(w)); setCustomH(String(h)); setLockAspect(false); }}
                    className="text-[9px] px-2 py-1 rounded-full border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {label} ({w}×{h})
                  </button>
                ))}
              </div>

              <Button
                className="w-full mt-3 h-8 text-xs"
                onClick={applyCustomDimension}
              >
                Apply {customW}×{customH}
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground mt-3 text-center">
              Changing size resets block positions · Export uses the exact pixel dimensions
            </p>
          </div>
        </div>
      )}

      {/* ── Keyboard Shortcuts Overlay ── */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="bg-background rounded-2xl border shadow-2xl p-6 w-80 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Keyboard Shortcuts
              </h3>
              <button onClick={() => setShowShortcuts(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Editing</div>
                <div className="space-y-1.5">
                  {[
                    { keys: ['⌘', 'Z'], desc: 'Undo' },
                    { keys: ['⌘', '⇧', 'Z'], desc: 'Redo' },
                    { keys: ['Del'], desc: 'Reset selected block' },
                    { keys: ['Esc'], desc: 'Deselect block' },
                  ].map(({ keys, desc }) => (
                    <div key={desc} className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{desc}</span>
                      <div className="flex items-center gap-0.5">
                        {keys.map((k) => (
                          <kbd key={k} className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-foreground/80">{k}</kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Block Movement</div>
                <div className="space-y-1.5">
                  {[
                    { keys: ['↑↓←→'], desc: 'Nudge 1px' },
                    { keys: ['⇧', '↑↓←→'], desc: 'Nudge 10px' },
                  ].map(({ keys, desc }) => (
                    <div key={desc} className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{desc}</span>
                      <div className="flex items-center gap-0.5">
                        {keys.map((k) => (
                          <kbd key={k} className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-foreground/80">{k}</kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">View</div>
                <div className="space-y-1.5">
                  {[
                    { keys: ['+'], desc: 'Zoom in' },
                    { keys: ['-'], desc: 'Zoom out' },
                    { keys: ['0'], desc: 'Reset zoom to 100%' },
                    { keys: ['?'], desc: 'Toggle this panel' },
                  ].map(({ keys, desc }) => (
                    <div key={desc} className="flex items-center justify-between">
                      <span className="text-xs text-foreground">{desc}</span>
                      <div className="flex items-center gap-0.5">
                        {keys.map((k) => (
                          <kbd key={k} className="px-1.5 py-0.5 rounded border bg-muted text-[10px] font-mono text-foreground/80">{k}</kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground mt-4 text-center">Click anywhere outside to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
