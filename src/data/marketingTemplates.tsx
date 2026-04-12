import React from 'react';

export type TemplateCategory =
  | 'Just Listed'
  | 'Open House'
  | 'Coming Soon'
  | 'Just Sold'
  | 'Price Cut'
  | 'Under Contract';
export type TemplateType = 'flyer' | 'post' | 'story';

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

// ─── Editable text wrapper ────────────────────────────────────────────────────
const EditableText = ({
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
    style={{ ...style, outline: 'none', cursor: editable ? 'text' : 'default' }}
  >
    {children}
  </span>
);

// ─── Property photo helper ────────────────────────────────────────────────────
const PhotoArea = ({
  photos,
  style,
}: {
  photos: string[];
  style?: React.CSSProperties;
}) =>
  photos[0] ? (
    <img
      src={photos[0]}
      alt="Property"
      style={{ ...style, objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <div
      style={{
        ...style,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        background: '#e8eaf0',
        color: '#9ca3af',
      }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span style={{ fontSize: 14, letterSpacing: 1 }}>Add Property Photo</span>
    </div>
  );

// ─── UER Logo — real image from /public/logo.jpg ─────────────────────────────
const UERBrandMark = ({ width = 320 }: { width?: number; dark?: boolean; scale?: number }) => (
  <img
    src="/logo.jpg"
    alt="United Estates Realty"
    style={{ width, height: 'auto', objectFit: 'contain', display: 'block' }}
  />
);

// ─── Stat chip ────────────────────────────────────────────────────────────────
const Stat = ({
  value, label, color = '#fff', editable,
}: { value: string; label: string; color?: string; editable?: boolean }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <span style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>
      <EditableText editable={editable}>{value || '—'}</EditableText>
    </span>
    <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color, opacity: 0.5, marginTop: 4 }}>
      {label}
    </span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SHARED LAYOUT: White top (logo) → Photo → Navy bottom (category + address)
// This is the primary brand template style, used across all categories.
// ─────────────────────────────────────────────────────────────────────────────

// POST 1080×1080 brand layout
const BrandPost = (
  data: TemplateData,
  editable: boolean | undefined,
  categoryLabel: string,
  accentColor = '#c9a96e',
) => (
  <div style={{
    width: 1080, height: 1080,
    fontFamily: '"Inter", system-ui, sans-serif',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', background: '#fff',
  }}>
    {/* White header — logo */}
    <div style={{
      background: '#ffffff',
      padding: '36px 60px 28px',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      borderBottom: '1px solid #f0f0f0',
      flexShrink: 0,
    }}>
      <UERBrandMark width={340} />
    </div>

    {/* Photo */}
    <PhotoArea
      photos={data.photos}
      style={{ flex: 1, width: '100%' }}
    />

    {/* Navy bottom */}
    <div style={{
      background: '#12163a',
      color: '#f0ede6',
      padding: '36px 60px 44px',
      flexShrink: 0,
    }}>
      {/* Category */}
      <div style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 52,
        fontStyle: 'italic',
        fontWeight: 400,
        color: accentColor,
        lineHeight: 1,
        marginBottom: 10,
      }}>
        <EditableText editable={editable}>{categoryLabel}</EditableText>
      </div>
      {/* Address */}
      <div style={{
        fontSize: 42,
        fontWeight: 700,
        letterSpacing: -0.5,
        lineHeight: 1.05,
        marginBottom: 6,
      }}>
        <EditableText editable={editable}>{data.address}</EditableText>
      </div>
      <div style={{
        fontSize: 24,
        color: 'rgba(240,237,230,0.5)',
        fontWeight: 400,
        letterSpacing: 0,
        marginBottom: 20,
      }}>
        <EditableText editable={editable}>{data.city}, {data.state}</EditableText>
      </div>
      {/* Price + stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 36, fontWeight: 300, color: accentColor }}>
          <EditableText editable={editable}>{data.price}</EditableText>
        </span>
        <div style={{ display: 'flex', gap: 36 }}>
          <Stat value={data.beds} label="Beds" editable={editable} />
          <Stat value={data.baths} label="Baths" editable={editable} />
          <Stat value={data.sqft} label="Sq Ft" editable={editable} />
        </div>
      </div>
      {/* Agent line */}
      <div style={{
        marginTop: 20, paddingTop: 16,
        borderTop: '1px solid rgba(240,237,230,0.1)',
        fontSize: 13, color: 'rgba(240,237,230,0.35)',
        letterSpacing: 1.5, textTransform: 'uppercase',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <EditableText editable={editable}>{data.agentName}</EditableText>
        <EditableText editable={editable}>{data.agentPhone}</EditableText>
      </div>
    </div>
  </div>
);

// FLYER 816×1056 brand layout
const BrandFlyer = (
  data: TemplateData,
  editable: boolean | undefined,
  categoryLabel: string,
  accentColor = '#c9a96e',
) => (
  <div style={{
    width: 816, height: 1056,
    fontFamily: '"Inter", system-ui, sans-serif',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', background: '#fff',
  }}>
    {/* White header — logo */}
    <div style={{
      background: '#ffffff',
      padding: '28px 48px 20px',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      borderBottom: '1px solid #f0f0f0',
      flexShrink: 0,
    }}>
      <UERBrandMark width={280} />
    </div>

    {/* Photo */}
    <PhotoArea
      photos={data.photos}
      style={{ flex: 1, width: '100%' }}
    />

    {/* Navy bottom */}
    <div style={{
      background: '#12163a',
      color: '#f0ede6',
      padding: '28px 48px 32px',
      flexShrink: 0,
    }}>
      {/* Category */}
      <div style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 40,
        fontStyle: 'italic',
        fontWeight: 400,
        color: accentColor,
        lineHeight: 1,
        marginBottom: 8,
      }}>
        <EditableText editable={editable}>{categoryLabel}</EditableText>
      </div>
      {/* Address */}
      <div style={{
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: -0.3,
        lineHeight: 1.1,
        marginBottom: 4,
      }}>
        <EditableText editable={editable}>{data.address}</EditableText>
      </div>
      <div style={{
        fontSize: 18,
        color: 'rgba(240,237,230,0.45)',
        marginBottom: 16,
      }}>
        <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
      </div>
      {/* Price + stats */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 30, fontWeight: 300, color: accentColor }}>
          <EditableText editable={editable}>{data.price}</EditableText>
        </span>
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { label: 'Beds', value: data.beds },
            { label: 'Baths', value: data.baths },
            { label: 'Sq Ft', value: data.sqft },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700 }}><EditableText editable={editable}>{s.value || '—'}</EditableText></div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.45, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Agent */}
      <div style={{
        paddingTop: 14,
        borderTop: '1px solid rgba(240,237,230,0.1)',
        fontSize: 11, color: 'rgba(240,237,230,0.35)',
        letterSpacing: 1.5, textTransform: 'uppercase',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <EditableText editable={editable}>{data.agentName}</EditableText>
        <EditableText editable={editable}>{data.agentPhone}</EditableText>
      </div>
    </div>
  </div>
);

// STORY 1080×1920 brand layout
const BrandStory = (
  data: TemplateData,
  editable: boolean | undefined,
  categoryLabel: string,
  accentColor = '#c9a96e',
) => (
  <div style={{
    width: 1080, height: 1920,
    fontFamily: '"Inter", system-ui, sans-serif',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', background: '#fff',
  }}>
    {/* White header — logo */}
    <div style={{
      background: '#ffffff',
      padding: '60px 80px 48px',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      borderBottom: '1px solid #f0f0f0',
      flexShrink: 0,
    }}>
      <UERBrandMark width={380} />
    </div>

    {/* Photo */}
    <PhotoArea
      photos={data.photos}
      style={{ flex: 1, width: '100%' }}
    />

    {/* Navy bottom */}
    <div style={{
      background: '#12163a',
      color: '#f0ede6',
      padding: '52px 80px 80px',
      flexShrink: 0,
    }}>
      {/* Category */}
      <div style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 80,
        fontStyle: 'italic',
        fontWeight: 400,
        color: accentColor,
        lineHeight: 1,
        marginBottom: 16,
      }}>
        <EditableText editable={editable}>{categoryLabel}</EditableText>
      </div>
      {/* Address */}
      <div style={{
        fontSize: 68,
        fontWeight: 800,
        letterSpacing: -1,
        lineHeight: 1.02,
        marginBottom: 10,
      }}>
        <EditableText editable={editable}>{data.address}</EditableText>
      </div>
      <div style={{
        fontSize: 36,
        color: 'rgba(240,237,230,0.4)',
        marginBottom: 36,
      }}>
        <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
      </div>
      {/* Price */}
      <div style={{
        fontSize: 52,
        fontWeight: 300,
        color: accentColor,
        marginBottom: 28,
      }}>
        <EditableText editable={editable}>{data.price}</EditableText>
      </div>
      {/* Stats row */}
      <div style={{ display: 'flex', gap: 48, marginBottom: 40 }}>
        <Stat value={data.beds} label="Beds" editable={editable} />
        <Stat value={data.baths} label="Baths" editable={editable} />
        <Stat value={data.sqft} label="Sq Ft" editable={editable} />
      </div>
      {/* Agent */}
      <div style={{
        paddingTop: 24,
        borderTop: '1px solid rgba(240,237,230,0.1)',
        fontSize: 18, color: 'rgba(240,237,230,0.35)',
        letterSpacing: 2, textTransform: 'uppercase',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <EditableText editable={editable}>{data.agentName}</EditableText>
        <EditableText editable={editable}>{data.agentPhone}</EditableText>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Open House variant — same layout, but includes date/time in the navy section
// ─────────────────────────────────────────────────────────────────────────────
const OpenHousePost = (data: TemplateData, editable: boolean | undefined) => (
  <div style={{
    width: 1080, height: 1080,
    fontFamily: '"Inter", system-ui, sans-serif',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', background: '#fff',
  }}>
    <div style={{
      background: '#ffffff', padding: '36px 60px 28px',
      display: 'flex', justifyContent: 'center',
      borderBottom: '1px solid #f0f0f0', flexShrink: 0,
    }}>
      <UERBrandMark width={340} />
    </div>
    <PhotoArea photos={data.photos} style={{ flex: 1, width: '100%' }} />
    <div style={{ background: '#12163a', color: '#f0ede6', padding: '32px 60px 40px', flexShrink: 0 }}>
      <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 48, fontStyle: 'italic', color: '#74c69d', lineHeight: 1, marginBottom: 8 }}>
        Open House
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#74c69d', marginBottom: 12 }}>
        <EditableText editable={editable}>{data.openHouseDate}</EditableText>
        <span style={{ opacity: 0.6, fontWeight: 400 }}> · </span>
        <EditableText editable={editable}>{data.openHouseTime}</EditableText>
      </div>
      <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -0.3, marginBottom: 4 }}>
        <EditableText editable={editable}>{data.address}</EditableText>
      </div>
      <div style={{ fontSize: 22, color: 'rgba(240,237,230,0.45)', marginBottom: 18 }}>
        <EditableText editable={editable}>{data.city}, {data.state}</EditableText>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 32, fontWeight: 300, color: '#74c69d' }}>
          <EditableText editable={editable}>{data.price}</EditableText>
        </span>
        <div style={{ display: 'flex', gap: 32 }}>
          <Stat value={data.beds} label="Beds" editable={editable} color="#74c69d" />
          <Stat value={data.baths} label="Baths" editable={editable} color="#74c69d" />
          <Stat value={data.sqft} label="Sq Ft" editable={editable} color="#74c69d" />
        </div>
      </div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(240,237,230,0.1)', fontSize: 11, color: 'rgba(240,237,230,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
        <EditableText editable={editable}>{data.agentName}</EditableText>
        <EditableText editable={editable}>{data.agentPhone}</EditableText>
      </div>
    </div>
  </div>
);

const OpenHouseFlyer = (data: TemplateData, editable: boolean | undefined) => (
  <div style={{
    width: 816, height: 1056,
    fontFamily: '"Inter", system-ui, sans-serif',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden', background: '#fff',
  }}>
    <div style={{
      background: '#ffffff', padding: '24px 48px 18px',
      display: 'flex', justifyContent: 'center',
      borderBottom: '1px solid #f0f0f0', flexShrink: 0,
    }}>
      <UERBrandMark width={280} />
    </div>
    <PhotoArea photos={data.photos} style={{ flex: 1, width: '100%' }} />
    <div style={{ background: '#12163a', color: '#f0ede6', padding: '24px 48px 30px', flexShrink: 0 }}>
      <div style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 36, fontStyle: 'italic', color: '#74c69d', lineHeight: 1, marginBottom: 6 }}>
        Open House
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#74c69d', marginBottom: 10 }}>
        <EditableText editable={editable}>{data.openHouseDate}</EditableText>
        <span style={{ opacity: 0.6, fontWeight: 400 }}> · </span>
        <EditableText editable={editable}>{data.openHouseTime}</EditableText>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
        <EditableText editable={editable}>{data.address}</EditableText>
      </div>
      <div style={{ fontSize: 16, color: 'rgba(240,237,230,0.4)', marginBottom: 14 }}>
        <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 26, fontWeight: 300, color: '#74c69d' }}>
          <EditableText editable={editable}>{data.price}</EditableText>
        </span>
        <div style={{ display: 'flex', gap: 24 }}>
          {[{ label: 'Beds', value: data.beds }, { label: 'Baths', value: data.baths }, { label: 'Sq Ft', value: data.sqft }].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#74c69d' }}><EditableText editable={editable}>{s.value || '—'}</EditableText></div>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.45, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ paddingTop: 12, borderTop: '1px solid rgba(240,237,230,0.1)', fontSize: 10, color: 'rgba(240,237,230,0.3)', letterSpacing: 1.5, textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
        <EditableText editable={editable}>{data.agentName}</EditableText>
        <EditableText editable={editable}>{data.agentPhone}</EditableText>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATES ARRAY
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATES: MarketingTemplate[] = [

  // ── JUST LISTED ─────────────────────────────────────
  {
    id: 'just-listed-post-1',
    name: 'Just Listed Post',
    category: 'Just Listed',
    type: 'post',
    width: 1080, height: 1080,
    thumbnail: '🏠',
    render: (data, editable) => BrandPost(data, editable, 'Just Listed', '#c9a96e'),
  },
  {
    id: 'just-listed-flyer-1',
    name: 'Just Listed Flyer',
    category: 'Just Listed',
    type: 'flyer',
    width: 816, height: 1056,
    thumbnail: '🏡',
    render: (data, editable) => BrandFlyer(data, editable, 'Just Listed', '#c9a96e'),
  },
  {
    id: 'just-listed-story-1',
    name: 'Just Listed Story',
    category: 'Just Listed',
    type: 'story',
    width: 1080, height: 1920,
    thumbnail: '📱',
    render: (data, editable) => BrandStory(data, editable, 'Just Listed', '#c9a96e'),
  },

  // ── JUST SOLD ────────────────────────────────────────
  {
    id: 'just-sold-post-1',
    name: 'Just Sold Post',
    category: 'Just Sold',
    type: 'post',
    width: 1080, height: 1080,
    thumbnail: '🎉',
    render: (data, editable) => BrandPost(data, editable, 'Just Sold', '#e94560'),
  },
  {
    id: 'just-sold-flyer-1',
    name: 'Just Sold Flyer',
    category: 'Just Sold',
    type: 'flyer',
    width: 816, height: 1056,
    thumbnail: '🏆',
    render: (data, editable) => BrandFlyer(data, editable, 'Just Sold', '#e94560'),
  },
  {
    id: 'just-sold-story-1',
    name: 'Just Sold Story',
    category: 'Just Sold',
    type: 'story',
    width: 1080, height: 1920,
    thumbnail: '🎊',
    render: (data, editable) => BrandStory(data, editable, 'Just Sold', '#e94560'),
  },

  // ── OPEN HOUSE ──────────────────────────────────────
  {
    id: 'open-house-post-1',
    name: 'Open House Post',
    category: 'Open House',
    type: 'post',
    width: 1080, height: 1080,
    thumbnail: '🏘️',
    render: (data, editable) => OpenHousePost(data, editable),
  },
  {
    id: 'open-house-flyer-1',
    name: 'Open House Flyer',
    category: 'Open House',
    type: 'flyer',
    width: 816, height: 1056,
    thumbnail: '🏛️',
    render: (data, editable) => OpenHouseFlyer(data, editable),
  },
  {
    id: 'open-house-story-1',
    name: 'Open House Story',
    category: 'Open House',
    type: 'story',
    width: 1080, height: 1920,
    thumbnail: '📲',
    render: (data, editable) => BrandStory(data, editable, 'Open House', '#74c69d'),
  },

  // ── COMING SOON ─────────────────────────────────────
  {
    id: 'coming-soon-post-1',
    name: 'Coming Soon Post',
    category: 'Coming Soon',
    type: 'post',
    width: 1080, height: 1080,
    thumbnail: '⏳',
    render: (data, editable) => BrandPost(data, editable, 'Coming Soon', '#f0c040'),
  },
  {
    id: 'coming-soon-flyer-1',
    name: 'Coming Soon Flyer',
    category: 'Coming Soon',
    type: 'flyer',
    width: 816, height: 1056,
    thumbnail: '🔜',
    render: (data, editable) => BrandFlyer(data, editable, 'Coming Soon', '#f0c040'),
  },
  {
    id: 'coming-soon-story-1',
    name: 'Coming Soon Story',
    category: 'Coming Soon',
    type: 'story',
    width: 1080, height: 1920,
    thumbnail: '📲',
    render: (data, editable) => BrandStory(data, editable, 'Coming Soon', '#f0c040'),
  },

  // ── PRICE CUT ───────────────────────────────────────
  {
    id: 'price-cut-post-1',
    name: 'Price Cut Post',
    category: 'Price Cut',
    type: 'post',
    width: 1080, height: 1080,
    thumbnail: '💰',
    render: (data, editable) => BrandPost(data, editable, 'Price Reduced', '#e94560'),
  },
  {
    id: 'price-cut-flyer-1',
    name: 'Price Cut Flyer',
    category: 'Price Cut',
    type: 'flyer',
    width: 816, height: 1056,
    thumbnail: '🏷️',
    render: (data, editable) => BrandFlyer(data, editable, 'Price Reduced', '#e94560'),
  },

  // ── UNDER CONTRACT ──────────────────────────────────
  {
    id: 'under-contract-post-1',
    name: 'Under Contract Post',
    category: 'Under Contract',
    type: 'post',
    width: 1080, height: 1080,
    thumbnail: '📝',
    render: (data, editable) => BrandPost(data, editable, 'Under Contract', '#3b82f6'),
  },
  {
    id: 'under-contract-flyer-1',
    name: 'Under Contract Flyer',
    category: 'Under Contract',
    type: 'flyer',
    width: 816, height: 1056,
    thumbnail: '📋',
    render: (data, editable) => BrandFlyer(data, editable, 'Under Contract', '#3b82f6'),
  },
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  'Just Listed',
  'Open House',
  'Coming Soon',
  'Just Sold',
  'Price Cut',
  'Under Contract',
];

export function getDefaultTemplateData(deal?: any): TemplateData {
  const contacts = deal?.deal_contacts || [];
  const sellerAgent = contacts.find(
    (dc: any) => dc.role === 'Seller Agent' || dc.role === 'Listing Agent'
  )?.contact;

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
    agentName: sellerAgent
      ? `${sellerAgent.first_name} ${sellerAgent.last_name}`
      : deal?.primary_agent || 'Agent Name',
    agentTitle: 'Real Estate Agent',
    agentPhone: sellerAgent?.phone || '(555) 123-4567',
    agentEmail: sellerAgent?.email || 'agent@unitedestatesrealty.com',
    headline: 'Just Listed',
    subheadline: 'Your Dream Home Awaits',
    description:
      'Beautiful property featuring modern finishes, spacious living areas, and a stunning outdoor space. Schedule your private showing today!',
    openHouseDate: 'Saturday, March 22',
    openHouseTime: '1:00 PM – 4:00 PM',
  };
}
