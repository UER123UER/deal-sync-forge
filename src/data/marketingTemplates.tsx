import React from 'react';

export type TemplateCategory =
  | 'Just Listed'
  | 'Open House'
  | 'Coming Soon'
  | 'Just Sold'
  | 'Price Cut'
  | 'Under Contract';
export type TemplateType = 'flyer' | 'post' | 'story';
export type HeadlineStyle = 'h1' | 'h2' | 'h3';
export type PhotoLayout = 'single' | 'collage';
export type AgentLayout = 'single' | 'multi';
export type PhotoFitMode = 'cover' | 'contain';

// ── Canvas Dimensions ──────────────────────────────────────────────────────
export interface CanvasDimension {
  id: string;
  label: string;
  sublabel: string;        // e.g. "1080 × 1080"
  platform: string;        // e.g. "Instagram · TikTok"
  platformIcon: string;    // emoji icon for the platform group
  width: number;
  height: number;
  aspectLabel: string;     // e.g. "1:1"
}

export const CANVAS_DIMENSIONS: CanvasDimension[] = [
  {
    id: 'square',
    label: 'Square Post',
    sublabel: '1080 × 1080',
    platform: 'Instagram · Facebook',
    platformIcon: '⬜',
    width: 1080,
    height: 1080,
    aspectLabel: '1:1',
  },
  {
    id: 'portrait',
    label: 'Portrait Feed',
    sublabel: '1080 × 1350',
    platform: 'Instagram · Facebook',
    platformIcon: '📸',
    width: 1080,
    height: 1350,
    aspectLabel: '4:5',
  },
  {
    id: 'story',
    label: 'Story / Reel',
    sublabel: '1080 × 1920',
    platform: 'Instagram · TikTok',
    platformIcon: '📱',
    width: 1080,
    height: 1920,
    aspectLabel: '9:16',
  },
  {
    id: 'landscape',
    label: 'Landscape',
    sublabel: '1920 × 1080',
    platform: 'Facebook · LinkedIn',
    platformIcon: '🖥',
    width: 1920,
    height: 1080,
    aspectLabel: '16:9',
  },
  {
    id: 'custom',
    label: 'Custom',
    sublabel: 'Any size',
    platform: 'Custom',
    platformIcon: '✏️',
    width: 1080,
    height: 1080,
    aspectLabel: 'Custom',
  },
];
export type MarketingBlockKey =
  | 'logo'
  | 'photo'
  | `photo-${number}`
  | 'headline'
  | 'address'
  | 'price'
  | 'stats'
  | 'description'
  | 'agent'
  | `custom-text-${string}`;

export interface MarketingBlockTransform {
  x: number;
  y: number;
  scale: number;
  fitMode?: PhotoFitMode;
}

export type MarketingBlockTransforms = Partial<Record<MarketingBlockKey, MarketingBlockTransform>>;

export interface MarketingAgent {
  id?: string;
  name: string;
  title: string;
  phone: string;
  email: string;
}

export interface MarketingCustomTextBlock {
  id: string;
  text: string;
}

export interface TemplateData {
  address: string;
  city: string;
  state: string;
  zip: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  lotSize: string;
  photos: string[];
  agentName: string;
  agentTitle: string;
  agentPhone: string;
  agentEmail: string;
  headline: string;
  subheadline: string;
  description: string;
  openHouseDate: string;
  openHouseTime: string;
  visibility: TemplateVisibility;
  headlineStyle: HeadlineStyle;
  photoLayout: PhotoLayout;
  agentLayout: AgentLayout;
  agents: MarketingAgent[];
  customTextBlocks: MarketingCustomTextBlock[];
  groupedBlockKeys: MarketingBlockKey[];
  blockTransforms: MarketingBlockTransforms;
  // Canvas dimension
  canvasDimensionId: string;  // matches CanvasDimension.id
  canvasWidth: number;
  canvasHeight: number;
}

export interface TemplateVisibility {
  headline: boolean;
  address: boolean;
  price: boolean;
  stats: boolean;
  description: boolean;
  agentName: boolean;
  agentTitle: boolean;
  agentPhone: boolean;
  agentEmail: boolean;
}

export interface MarketingTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  type: TemplateType;
  width: number;
  height: number;
  thumbnail: string;
  render: (data: TemplateData, editable?: boolean) => React.ReactNode;
}

export const DEFAULT_TEMPLATE_VISIBILITY: TemplateVisibility = {
  headline: false,
  address: false,
  price: false,
  stats: false,
  description: false,
  agentName: false,
  agentTitle: false,
  agentPhone: false,
  agentEmail: false,
};

const DEFAULT_BLOCK_TRANSFORM: MarketingBlockTransform = {
  x: 0,
  y: 0,
  scale: 1,
};

export function mergeTemplateVisibility(
  visibility?: Partial<TemplateVisibility> | null
): TemplateVisibility {
  return {
    ...DEFAULT_TEMPLATE_VISIBILITY,
    ...(visibility ?? {}),
  };
}

export function mergeMarketingBlockTransforms(
  blockTransforms?: MarketingBlockTransforms | null
): MarketingBlockTransforms {
  return blockTransforms ?? {};
}

function getBlockTransform(
  data: Pick<TemplateData, 'blockTransforms'>,
  block: MarketingBlockKey
): MarketingBlockTransform {
  return {
    ...DEFAULT_BLOCK_TRANSFORM,
    ...(data.blockTransforms?.[block] ?? {}),
  };
}

function AdjustableBlock({
  data,
  block,
  style,
  children,
}: {
  data: Pick<TemplateData, 'blockTransforms'>;
  block: MarketingBlockKey;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const transform = getBlockTransform(data, block);

  return (
    <div
      data-marketing-block={block}
      style={{
        ...style,
        position: 'relative',
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
        transformOrigin: 'top left',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

function renderCustomTextBlocks(data: TemplateData, editable?: boolean, fontScale = 1) {
  const customTextBlocks = data.customTextBlocks ?? [];

  return customTextBlocks.map((block, index) => {
    const blockKey = `custom-text-${block.id}` as MarketingBlockKey;
    const defaultX = Math.round((data.canvasWidth || 1080) * 0.08);
    const defaultY = Math.round((data.canvasHeight || 1080) * 0.08) + (index * Math.round(72 * fontScale));

    return (
      <AdjustableBlock
        key={block.id}
        data={{
          blockTransforms: {
            ...data.blockTransforms,
            [blockKey]: {
              x: data.blockTransforms?.[blockKey]?.x ?? defaultX,
              y: data.blockTransforms?.[blockKey]?.y ?? defaultY,
              scale: data.blockTransforms?.[blockKey]?.scale ?? 1,
            },
          },
        }}
        block={blockKey}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          maxWidth: Math.round((data.canvasWidth || 1080) * 0.72),
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: Math.round(40 * fontScale),
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: -0.8,
            color: '#0e1428',
            whiteSpace: 'pre-wrap',
            textShadow: '0 1px 2px rgba(255,255,255,0.3)',
          }}
        >
          <E editable={editable}>{block.text}</E>
        </div>
      </AdjustableBlock>
    );
  });
}

// ─── Editable text ────────────────────────────────────────────────────────────
const E = ({
  children,
  editable,
  style,
}: {
  children: React.ReactNode;
  editable?: boolean;
  style?: React.CSSProperties;
}) => (
  <span
    contentEditable={editable}
    suppressContentEditableWarning
    style={{ outline: 'none', cursor: editable ? 'text' : 'default', ...style }}
  >
    {children}
  </span>
);

// ─── Photo area ───────────────────────────────────────────────────────────────
const Photo = ({ photos, style }: { photos: string[]; style?: React.CSSProperties }) =>
  photos[0] ? (
    <img
      src={photos[0]}
      alt="Property"
      crossOrigin="anonymous"
      loading="eager"
      style={{ ...style, objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <div
      style={{
        ...style,
        background: '#d1d5db',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        color: '#9ca3af',
      }}
    >
      <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span style={{ fontSize: 13, letterSpacing: 1 }}>Add Property Photo</span>
    </div>
  );

const PhotoFrame = ({
  src,
  style,
  label = 'Add Property Photo',
}: {
  src?: string;
  style?: React.CSSProperties;
  label?: string;
}) =>
  src ? (
    <img
      src={src}
      alt="Property"
      crossOrigin="anonymous"
      loading="eager"
      style={{ ...style, objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <div
      style={{
        ...style,
        background: '#d1d5db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9ca3af',
        fontSize: 12,
        letterSpacing: 0.8,
      }}
    >
      {label}
    </div>
  );

// ─── Real UER logo ────────────────────────────────────────────────────────────
const Logo = ({ width = 300 }: { width?: number }) => (
  <img
    src="/logo.png"
    alt="United Estates Realty"
    crossOrigin="anonymous"
    loading="eager"
    style={{ width, height: 'auto', objectFit: 'contain', display: 'block' }}
  />
);

function splitHeadline(
  headline: string,
  fallback: { italic: string; bold: string }
) {
  const normalized = headline.trim();
  if (!normalized) return fallback;
  const parts = normalized.split(/\s+/);
  if (parts.length === 1) {
    return { italic: '', bold: parts[0] };
  }
  return {
    italic: parts.slice(0, -1).join(' '),
    bold: parts[parts.length - 1],
  };
}

function getRenderableAgents(data: TemplateData): MarketingAgent[] {
  if (data.agents?.length) {
    return data.agents.filter((agent) => agent.name.trim()).slice(0, 3);
  }

  return [{
    name: data.agentName,
    title: data.agentTitle,
    phone: data.agentPhone,
    email: data.agentEmail,
  }].filter((agent) => agent.name.trim());
}

function renderHeadlineBlock(
  style: HeadlineStyle,
  headline: string,
  fallback: { italic: string; bold: string },
  editable?: boolean,
  fontScale = 1,
) {
  const headlineParts = splitHeadline(headline, fallback);

  if (style === 'h2') {
    return (
      <div style={{ marginBottom: Math.round(16 * fontScale) }}>
        <div
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: Math.round(20 * fontScale),
            fontWeight: 700,
            letterSpacing: 7,
            textTransform: 'uppercase',
            color: '#c9a96e',
            marginBottom: Math.round(10 * fontScale),
          }}
        >
          <E editable={editable}>{headline}</E>
        </div>
        <div
          style={{
            width: Math.round(112 * fontScale),
            height: 1,
            background: 'rgba(255,255,255,0.3)',
            margin: '0 auto',
          }}
        />
      </div>
    );
  }

  if (style === 'h3') {
    return (
      <div style={{ marginBottom: Math.round(18 * fontScale) }}>
        <div
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: Math.round(50 * fontScale),
            fontWeight: 400,
            letterSpacing: 1.2,
            color: '#ffffff',
            lineHeight: 1.04,
          }}
        >
          <E editable={editable}>{headline}</E>
        </div>
      </div>
    );
  }

  // h1 — Serif Split (default)
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: Math.round(14 * fontScale),
        marginBottom: Math.round(18 * fontScale),
        flexWrap: 'wrap',
      }}
    >
      {headlineParts.italic ? (
        <span
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: Math.round(68 * fontScale),
            color: '#ffffff',
            lineHeight: 1,
          }}
        >
          <E editable={editable}>{headlineParts.italic}</E>
        </span>
      ) : null}
      <span
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: Math.round(68 * fontScale),
          color: '#ffffff',
          lineHeight: 1,
        }}
      >
        <E editable={editable}>{headlineParts.bold}</E>
      </span>
    </div>
  );
}

/** A single collage cell — overflow-hidden frame with pan+zoom of the inner image.
 *  data-marketing-block="photo-N" is set so the editor overlay can detect and
 *  allow independent drag (pan) / resize (zoom) of each cell.
 */
function CollageCell({
  src,
  index,
  data,
  r,
}: {
  src: string;
  index: number;
  data: TemplateData;
  r: number;
}) {
  const blockKey = `photo-${index}` as MarketingBlockKey;
  const t = getBlockTransform(data, blockKey);
  // x/y = pan offset in px; scale = zoom multiplier (>1 = zoomed in)
  const zoom = Math.max(1, t.scale);
  const fitMode = t.fitMode ?? (index === 0 ? 'cover' : 'contain');

  return (
    <div
      data-marketing-block={blockKey}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: r,
        overflow: 'hidden',
        minHeight: 0,
        minWidth: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={`Property ${index + 1}`}
          crossOrigin="anonymous"
          loading="eager"
          style={{
            position: 'absolute',
            // Zoom from centre, then shift by pan offset
            width: `${zoom * 100}%`,
            height: `${zoom * 100}%`,
            objectFit: fitMode,
            objectPosition: 'center center',
            // Centre the zoomed image, then shift by pan (t.x / t.y in canvas-px)
            left: `${50 - zoom * 50}%`,
            top: `${50 - zoom * 50}%`,
            transform: `translate(${t.x}px, ${t.y}px)`,
            transformOrigin: 'top left',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      ) : (
        <div
          style={{
            width: '100%', height: '100%', borderRadius: r,
            background: '#d1d5db',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#9ca3af', fontSize: 12,
          }}
        >
          Add Photo {index + 1}
        </div>
      )}
    </div>
  );
}

function renderPhotoBlock(data: TemplateData) {
  const photos = data.photos.filter(Boolean);
  const n = photos.length;

  // ── Single / hero layout ───────────────────────────────────────────────────
  if (data.photoLayout !== 'collage' || n < 2) {
    return <Photo photos={photos} style={{ width: '100%', height: '100%' }} />;
  }

  const w = data.canvasWidth  || 1080;
  const h = data.canvasHeight || 1080;
  const isPortrait  = h > w * 1.15;
  const isLandscape = w > h * 1.15;
  const gap = Math.round(Math.min(w, h) * 0.008);
  const pad = Math.round(Math.min(w, h) * 0.009);
  const r   = Math.round(Math.min(w, h) * 0.006);
  const bg  = '#0e1428';

  // Each photo gets its own independently pannable/zoomable cell
  const cell = (photoIndex: number) => (
    <CollageCell
      key={photoIndex}
      src={photos[photoIndex]}
      index={photoIndex}
      data={data}
      r={r}
    />
  );

  const wrap = (children: React.ReactNode, grid: React.CSSProperties) => (
    <div style={{ width: '100%', height: '100%', background: bg, padding: pad, display: 'grid', gap, boxSizing: 'border-box', ...grid }}>
      {children}
    </div>
  );

  // ── 2 photos ───────────────────────────────────────────────────────────────
  if (n === 2) {
    if (isPortrait) {
      return wrap(<>{cell(0)}{cell(1)}</>, { gridTemplateRows: '1fr 1fr' });
    }
    return wrap(<>{cell(0)}{cell(1)}</>, { gridTemplateColumns: '1fr 1fr' });
  }

  // ── 3 photos ───────────────────────────────────────────────────────────────
  if (n === 3) {
    if (isLandscape || !isPortrait) {
      return wrap(
        <>
          {cell(0)}
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap }}>
            {cell(1)}{cell(2)}
          </div>
        </>,
        { gridTemplateColumns: isLandscape ? '1.5fr 1fr' : '1.2fr 1fr' }
      );
    }
    return wrap(
      <>
        {cell(0)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>
          {cell(1)}{cell(2)}
        </div>
      </>,
      { gridTemplateRows: '1.75fr 1fr' }
    );
  }

  // ── 4 photos ───────────────────────────────────────────────────────────────
  if (n === 4) {
    return wrap(
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>
          {cell(0)}{cell(1)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>
          {cell(2)}{cell(3)}
        </div>
      </>,
      { gridTemplateRows: '1fr 1fr' }
    );
  }

  // ── 5 photos ───────────────────────────────────────────────────────────────
  if (n === 5) {
    if (isLandscape) {
      return wrap(
        <>
          {cell(0)}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap }}>
            {cell(1)}{cell(2)}{cell(3)}{cell(4)}
          </div>
        </>,
        { gridTemplateColumns: '1.2fr 1fr' }
      );
    }
    return wrap(
      <>
        {cell(0)}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>
          {cell(1)}{cell(2)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>
          {cell(3)}{cell(4)}
        </div>
      </>,
      { gridTemplateRows: '1.4fr 1fr 1fr' }
    );
  }

  // ── 6+ photos ──────────────────────────────────────────────────────────────
  const visible = photos.slice(0, 6);
  const extra   = n - 6;
  const cols = isLandscape ? 3 : 2;
  const rows = Math.ceil(visible.length / cols);
  return wrap(
    <>
      {visible.map((_, i) => {
        const isLast = i === visible.length - 1 && extra > 0;
        return (
          <div key={i} style={{ position: 'relative', minHeight: 0 }}>
            {cell(i)}
            {isLast && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: r,
                background: 'rgba(0,0,0,0.55)', pointerEvents: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: Math.round(Math.min(w, h) * 0.04),
                fontWeight: 700, fontFamily: 'system-ui, sans-serif',
              }}>
                +{extra}
              </div>
            )}
          </div>
        );
      })}
    </>,
    { gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }
  );
}

// ─── Shared template builder ──────────────────────────────────────────────────
// All templates share the same layout: white header (logo) | photo | navy footer
// The render uses data.canvasWidth/canvasHeight so it adapts to any dimension.
function buildTemplate(
  id: string,
  name: string,
  category: TemplateCategory,
  labelParts: { italic: string; bold: string },
): MarketingTemplate {
  return {
    id,
    name,
    category,
    type: 'post',
    // Default size — overridden at render time by data.canvasWidth/canvasHeight
    width: 1080,
    height: 1080,
    thumbnail: '',
    render: (data, editable) => {
      const w = data.canvasWidth || 1080;
      const h = data.canvasHeight || 1080;
      const isPortrait = h > w;
      const isLandscape = w > h * 1.1;
      const visibility = mergeTemplateVisibility(data.visibility);
      const agents = getRenderableAgents(data);
      const showAgentBlock =
        visibility.agentName ||
        visibility.agentTitle ||
        visibility.agentPhone ||
        visibility.agentEmail;

      // Scale font sizes proportionally to canvas width (base = 1080)
      const fontScale = Math.min(w, h) / 1080;

      return (
        <div
          style={{
            width: w,
            height: h,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: '#fff',
            fontFamily: 'Georgia, "Times New Roman", serif',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              // Scale header padding relative to canvas width
              padding: `${Math.round(44 * fontScale)}px ${Math.round(60 * fontScale)}px ${Math.round(40 * fontScale)}px`,
              flexShrink: 0,
            }}
          >
            <AdjustableBlock
              data={data}
              block="logo"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Logo width={Math.round(360 * fontScale)} />
            </AdjustableBlock>
          </div>

          <AdjustableBlock
            data={data}
            block="photo"
            style={{ flex: 1, minHeight: 0, display: 'flex' }}
          >
            {renderPhotoBlock(data)}
          </AdjustableBlock>

          <div
            style={{
              background: '#0e1428',
              flexShrink: 0,
              padding: `${Math.round(40 * fontScale)}px ${Math.round(64 * fontScale)}px ${Math.round(42 * fontScale)}px`,
              textAlign: 'center',
            }}
          >
            {visibility.headline && (
              <AdjustableBlock data={data} block="headline">
                {renderHeadlineBlock(data.headlineStyle, data.headline, labelParts, editable, fontScale)}
              </AdjustableBlock>
            )}

            {visibility.address && (
              <AdjustableBlock data={data} block="address">
                {visibility.headline && (
                  <div style={{ width: Math.round(80 * fontScale), height: 2, background: '#c9a96e', margin: `0 auto ${Math.round(22 * fontScale)}px` }} />
                )}
                <div
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: Math.round(36 * fontScale),
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: 0.3,
                    lineHeight: 1.12,
                    marginBottom: Math.round(8 * fontScale),
                  }}
                >
                  <E editable={editable}>{data.address}</E>
                </div>

                <div
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: Math.round(22 * fontScale),
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.6)',
                    letterSpacing: 0.6,
                    marginBottom: visibility.price || visibility.stats || visibility.description ? Math.round(16 * fontScale) : 0,
                  }}
                >
                  <E editable={editable}>{data.city}, {data.state} {data.zip}</E>
                </div>
              </AdjustableBlock>
            )}

            {visibility.price && (
              <AdjustableBlock data={data} block="price">
                <div
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: Math.round(42 * fontScale),
                    fontWeight: 700,
                    color: '#c9a96e',
                    letterSpacing: 0.4,
                    marginBottom: visibility.stats || visibility.description ? Math.round(18 * fontScale) : 0,
                  }}
                >
                  <E editable={editable}>{data.price}</E>
                </div>
              </AdjustableBlock>
            )}

            {visibility.stats && (
              <AdjustableBlock data={data} block="stats">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: Math.round(36 * fontScale),
                    marginBottom: visibility.description ? Math.round(18 * fontScale) : 0,
                    flexWrap: 'wrap',
                    fontFamily: '"Inter", system-ui, sans-serif',
                  }}
                >
                  {[
                    { label: 'Beds', value: data.beds },
                    { label: 'Baths', value: data.baths },
                    { label: 'Sq Ft', value: data.sqft },
                  ].map((item) => (
                    <div key={item.label} style={{ minWidth: Math.round(110 * fontScale) }}>
                      <div style={{ fontSize: Math.round(28 * fontScale), fontWeight: 700, color: '#ffffff' }}>
                        <E editable={editable}>{item.value}</E>
                      </div>
                      <div style={{ fontSize: Math.round(11 * fontScale), letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </AdjustableBlock>
            )}

            {visibility.description && (
              <AdjustableBlock data={data} block="description">
                <div
                  style={{
                    maxWidth: Math.round(760 * fontScale),
                    margin: '0 auto',
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: Math.round(18 * fontScale),
                    lineHeight: 1.45,
                    color: 'rgba(255,255,255,0.72)',
                  }}
                >
                  <E editable={editable}>{data.description}</E>
                </div>
              </AdjustableBlock>
            )}

            {category === 'Open House' && (
              <div style={{ marginTop: Math.round(20 * fontScale), fontSize: Math.round(24 * fontScale), color: '#c9a96e', fontStyle: 'italic' }}>
                <E editable={editable}>{data.openHouseDate}</E>
                <span style={{ margin: `0 ${Math.round(12 * fontScale)}px`, color: 'rgba(255,255,255,0.3)' }}>|</span>
                <E editable={editable}>{data.openHouseTime}</E>
              </div>
            )}

            {showAgentBlock && (
              <AdjustableBlock data={data} block="agent">
                {data.agentLayout === 'multi' && agents.length > 1 ? (
                  <div
                    style={{
                      marginTop: Math.round(24 * fontScale),
                      paddingTop: Math.round(20 * fontScale),
                      borderTop: '1px solid rgba(255,255,255,0.14)',
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(agents.length, 3)}, minmax(0, 1fr))`,
                      gap: Math.round(14 * fontScale),
                      fontFamily: '"Inter", system-ui, sans-serif',
                    }}
                  >
                    {agents.map((agent) => (
                      <div
                        key={agent.id || `${agent.name}-${agent.email}`}
                        style={{
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: Math.round(16 * fontScale),
                          padding: `${Math.round(14 * fontScale)}px ${Math.round(12 * fontScale)}px`,
                          background: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        {visibility.agentName && (
                          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: Math.round(15 * fontScale), marginBottom: visibility.agentTitle ? 4 : 8 }}>
                            {agent.name}
                          </div>
                        )}
                        {visibility.agentTitle && (
                          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: Math.round(12 * fontScale), marginBottom: visibility.agentPhone || visibility.agentEmail ? 10 : 0 }}>
                            {agent.title}
                          </div>
                        )}
                        {visibility.agentPhone && (
                          <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: Math.round(12 * fontScale), marginBottom: visibility.agentEmail ? 4 : 0 }}>
                            {agent.phone}
                          </div>
                        )}
                        {visibility.agentEmail && (
                          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: Math.round(11 * fontScale), wordBreak: 'break-word' }}>
                            {agent.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: Math.round(24 * fontScale),
                      paddingTop: Math.round(20 * fontScale),
                      borderTop: '1px solid rgba(255,255,255,0.14)',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: Math.round(20 * fontScale),
                      flexWrap: 'wrap',
                      fontFamily: '"Inter", system-ui, sans-serif',
                      color: 'rgba(255,255,255,0.72)',
                      fontSize: Math.round(16 * fontScale),
                    }}
                  >
                    {visibility.agentName && (
                      <span style={{ color: '#ffffff', fontWeight: 700 }}>
                        <E editable={editable}>{data.agentName}</E>
                      </span>
                    )}
                    {visibility.agentTitle && (
                      <span>
                        <E editable={editable}>{data.agentTitle}</E>
                      </span>
                    )}
                    {visibility.agentPhone && (
                      <span>
                        <E editable={editable}>{data.agentPhone}</E>
                      </span>
                    )}
                    {visibility.agentEmail && (
                      <span>
                        <E editable={editable}>{data.agentEmail}</E>
                      </span>
                    )}
                  </div>
                )}
              </AdjustableBlock>
            )}
          </div>

          {(data.customTextBlocks?.length ?? 0) > 0 && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {renderCustomTextBlocks(data, editable, fontScale)}
            </div>
          )}
        </div>
      );
    },
  };
}

export const TEMPLATES: MarketingTemplate[] = [
  buildTemplate('just-listed-post-1', 'Just Listed', 'Just Listed', { italic: 'Just', bold: 'Listed' }),
  buildTemplate('open-house-post-1', 'Open House', 'Open House', { italic: 'Open', bold: 'House' }),
  buildTemplate('coming-soon-post-1', 'Coming Soon', 'Coming Soon', { italic: 'Coming', bold: 'Soon' }),
  buildTemplate('just-sold-post-1', 'Just Sold', 'Just Sold', { italic: 'Just', bold: 'Sold' }),
  buildTemplate('price-cut-post-1', 'Price Cut', 'Price Cut', { italic: 'Price', bold: 'Cut' }),
  buildTemplate('under-contract-post-1', 'Under Contract', 'Under Contract', { italic: 'Under', bold: 'Contract' }),
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Just Listed',
  'Open House',
  'Coming Soon',
  'Just Sold',
  'Price Cut',
  'Under Contract',
];

export function getDefaultTemplateData(
  deal?: any,
  category: TemplateCategory = 'Just Listed'
): TemplateData {
  const contacts = deal?.deal_contacts || [];
  const agentContacts = contacts.filter((dc: any) => {
    const role = (dc.role || '').toLowerCase();
    return role.includes('agent') || role.includes('broker');
  });
  const uniqueAgents = Array.from(new Map(
    agentContacts
      .filter((dc: any) => dc.contact)
      .map((dc: any) => {
        const contact = dc.contact;
        const id = contact.id || `${contact.first_name}-${contact.last_name}-${dc.role}`;
        return [id, {
          id,
          name: `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || deal?.primary_agent || 'Agent Name',
          title: dc.role || 'Real Estate Agent',
          phone: contact.phone || '',
          email: contact.email || '',
        }];
      })
  ).values()) as MarketingAgent[];
  const sellerAgent = contacts.find(
    (dc: any) => dc.role === 'Seller Agent' || dc.role === 'Listing Agent'
  )?.contact;
  const primaryAgent: MarketingAgent = uniqueAgents[0] || {
    name: sellerAgent
      ? `${sellerAgent.first_name} ${sellerAgent.last_name}`
      : deal?.primary_agent || 'Agent Name',
    title: 'Real Estate Agent',
    phone: sellerAgent?.phone || '(555) 123-4567',
    email: sellerAgent?.email || 'agent@unitedestatesrealty.com',
  };

  return {
    address: deal?.address || '123 Main Street',
    city: deal?.city || 'City',
    state: deal?.state || 'ST',
    zip: deal?.zip || '00000',
    price: deal?.price || '$595,000',
    beds: '4',
    baths: '3',
    sqft: '2,500',
    lotSize: '0.25 acres',
    photos: [],
    agentName: primaryAgent.name,
    agentTitle: primaryAgent.title,
    agentPhone: primaryAgent.phone,
    agentEmail: primaryAgent.email,
    headline: category,
    subheadline: 'Your Dream Home Awaits',
    description:
      'Beautiful property featuring modern finishes, spacious living areas, and a stunning outdoor space. Schedule your private showing today!',
    openHouseDate: 'Saturday, March 22',
    openHouseTime: '1:00 PM – 4:00 PM',
    visibility: { ...DEFAULT_TEMPLATE_VISIBILITY },
    headlineStyle: 'h1',
    photoLayout: 'single',
    agentLayout: 'single',
    agents: uniqueAgents.length ? uniqueAgents : [primaryAgent],
    customTextBlocks: [],
    groupedBlockKeys: [],
    blockTransforms: {},
    canvasDimensionId: 'square',
    canvasWidth: 1080,
    canvasHeight: 1080,
  };
}
