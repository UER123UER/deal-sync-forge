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
export type MarketingBlockKey =
  | 'logo'
  | 'photo'
  | 'headline'
  | 'address'
  | 'price'
  | 'stats'
  | 'description'
  | 'agent';

export interface MarketingBlockTransform {
  x: number;
  y: number;
  scale: number;
}

export type MarketingBlockTransforms = Partial<Record<MarketingBlockKey, MarketingBlockTransform>>;

export interface MarketingAgent {
  id?: string;
  name: string;
  title: string;
  phone: string;
  email: string;
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
  blockTransforms: MarketingBlockTransforms;
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
  headline: true,
  address: true,
  price: true,
  stats: true,
  description: true,
  agentName: true,
  agentTitle: true,
  agentPhone: true,
  agentEmail: true,
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
    <img src={photos[0]} alt="Property" style={{ ...style, objectFit: 'cover', display: 'block' }} />
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
    <img src={src} alt="Property" style={{ ...style, objectFit: 'cover', display: 'block' }} />
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
    src="/logo.jpg"
    alt="United Estates Realty"
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
) {
  const headlineParts = splitHeadline(headline, fallback);

  if (style === 'h2') {
    return (
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 7,
            textTransform: 'uppercase',
            color: '#c9a96e',
            marginBottom: 10,
          }}
        >
          <E editable={editable}>{headline}</E>
        </div>
        <div
          style={{
            width: 112,
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
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 50,
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

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'center',
        gap: 14,
        marginBottom: 18,
        flexWrap: 'wrap',
      }}
    >
      {headlineParts.italic ? (
        <span
          style={{
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 68,
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
          fontSize: 68,
          color: '#ffffff',
          lineHeight: 1,
        }}
      >
        <E editable={editable}>{headlineParts.bold}</E>
      </span>
    </div>
  );
}

function renderPhotoBlock(data: TemplateData) {
  if (data.photoLayout !== 'collage' || data.photos.length < 2) {
    return <Photo photos={data.photos} style={{ width: '100%', height: '100%' }} />;
  }

  const [first, second, third] = data.photos;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#f5f5f5',
        padding: 10,
        display: 'grid',
        gridTemplateRows: '1.75fr 1fr',
        gap: 10,
      }}
    >
      <PhotoFrame src={first} style={{ width: '100%', height: '100%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <PhotoFrame src={second || first} style={{ width: '100%', height: '100%' }} />
        <PhotoFrame src={third || second || first} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

// ─── Shared template builder ──────────────────────────────────────────────────
// All templates share the same layout: white header (logo) | photo | navy footer
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
    width: 1080,
    height: 1080,
    thumbnail: '',
    render: (data, editable) => {
      const visibility = mergeTemplateVisibility(data.visibility);
      const agents = getRenderableAgents(data);
      const showAgentBlock =
        visibility.agentName ||
        visibility.agentTitle ||
        visibility.agentPhone ||
        visibility.agentEmail;

      return (
        <div
          style={{
            width: 1080,
            height: 1080,
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
              padding: '44px 60px 40px',
              flexShrink: 0,
            }}
          >
            <AdjustableBlock
              data={data}
              block="logo"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Logo width={360} />
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
              padding: '40px 64px 42px',
              textAlign: 'center',
            }}
          >
            {visibility.headline && (
              <AdjustableBlock data={data} block="headline">
                {renderHeadlineBlock(data.headlineStyle, data.headline, labelParts, editable)}
              </AdjustableBlock>
            )}

            {visibility.address && (
              <AdjustableBlock data={data} block="address">
                {(visibility.headline || visibility.address || visibility.price) && (
                  <div style={{ width: 80, height: 2, background: '#c9a96e', margin: '0 auto 22px' }} />
                )}
                <div
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 36,
                    fontWeight: 700,
                    color: '#ffffff',
                    letterSpacing: 0.3,
                    lineHeight: 1.12,
                    marginBottom: 8,
                  }}
                >
                  <E editable={editable}>{data.address}</E>
                </div>

                <div
                  style={{
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 22,
                    fontWeight: 400,
                    color: 'rgba(255,255,255,0.6)',
                    letterSpacing: 0.6,
                    marginBottom: visibility.price || visibility.stats || visibility.description ? 16 : 0,
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
                    fontSize: 42,
                    fontWeight: 700,
                    color: '#c9a96e',
                    letterSpacing: 0.4,
                    marginBottom: visibility.stats || visibility.description ? 18 : 0,
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
                    gap: 36,
                    marginBottom: visibility.description ? 18 : 0,
                    flexWrap: 'wrap',
                    fontFamily: '"Inter", system-ui, sans-serif',
                  }}
                >
                  {[
                    { label: 'Beds', value: data.beds },
                    { label: 'Baths', value: data.baths },
                    { label: 'Sq Ft', value: data.sqft },
                  ].map((item) => (
                    <div key={item.label} style={{ minWidth: 110 }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffff' }}>
                        <E editable={editable}>{item.value}</E>
                      </div>
                      <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
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
                    maxWidth: 760,
                    margin: '0 auto',
                    fontFamily: '"Inter", system-ui, sans-serif',
                    fontSize: 18,
                    lineHeight: 1.45,
                    color: 'rgba(255,255,255,0.72)',
                  }}
                >
                  <E editable={editable}>{data.description}</E>
                </div>
              </AdjustableBlock>
            )}

            {category === 'Open House' && (
              <div style={{ marginTop: 20, fontSize: 24, color: '#c9a96e', fontStyle: 'italic' }}>
                <E editable={editable}>{data.openHouseDate}</E>
                <span style={{ margin: '0 12px', color: 'rgba(255,255,255,0.3)' }}>|</span>
                <E editable={editable}>{data.openHouseTime}</E>
              </div>
            )}

            {showAgentBlock && (
              <AdjustableBlock data={data} block="agent">
                {data.agentLayout === 'multi' && agents.length > 1 ? (
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 20,
                      borderTop: '1px solid rgba(255,255,255,0.14)',
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(agents.length, 3)}, minmax(0, 1fr))`,
                      gap: 14,
                      fontFamily: '"Inter", system-ui, sans-serif',
                    }}
                  >
                    {agents.map((agent) => (
                      <div
                        key={agent.id || `${agent.name}-${agent.email}`}
                        style={{
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 16,
                          padding: '14px 12px',
                          background: 'rgba(255,255,255,0.04)',
                        }}
                      >
                        {visibility.agentName && (
                          <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 15, marginBottom: visibility.agentTitle ? 4 : 8 }}>
                            {agent.name}
                          </div>
                        )}
                        {visibility.agentTitle && (
                          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: visibility.agentPhone || visibility.agentEmail ? 10 : 0 }}>
                            {agent.title}
                          </div>
                        )}
                        {visibility.agentPhone && (
                          <div style={{ color: 'rgba(255,255,255,0.82)', fontSize: 12, marginBottom: visibility.agentEmail ? 4 : 0 }}>
                            {agent.phone}
                          </div>
                        )}
                        {visibility.agentEmail && (
                          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, wordBreak: 'break-word' }}>
                            {agent.email}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 24,
                      paddingTop: 20,
                      borderTop: '1px solid rgba(255,255,255,0.14)',
                      display: 'flex',
                      justifyContent: 'center',
                      gap: 20,
                      flexWrap: 'wrap',
                      fontFamily: '"Inter", system-ui, sans-serif',
                      color: 'rgba(255,255,255,0.72)',
                      fontSize: 16,
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
    blockTransforms: {},
  };
}
