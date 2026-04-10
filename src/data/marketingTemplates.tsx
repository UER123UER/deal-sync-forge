import React from 'react';

export type TemplateCategory = 'Just Listed' | 'Open House' | 'Coming Soon' | 'Just Sold' | 'Price Cut' | 'Under Contract';
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

const EditableText = ({
  children,
  editable,
  className,
  style,
}: {
  children: React.ReactNode;
  editable?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <span
    contentEditable={editable}
    suppressContentEditableWarning
    className={className}
    style={{ ...style, outline: 'none', cursor: editable ? 'text' : 'default' }}
  >
    {children}
  </span>
);

// Reusable photo area helper
const PhotoArea = ({
  photos,
  style,
  label = 'Property Photo',
}: {
  photos: string[];
  style?: React.CSSProperties;
  label?: string;
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
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        color: '#94a3b8',
        letterSpacing: 1,
        fontWeight: 400,
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );

const StatPill = ({
  value,
  label,
  color = '#fff',
  editable,
}: {
  value: string;
  label: string;
  color?: string;
  editable?: boolean;
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <span style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>
      <EditableText editable={editable}>{value || '—'}</EditableText>
    </span>
    <span style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color, opacity: 0.55, marginTop: 4 }}>
      {label}
    </span>
  </div>
);

export const TEMPLATES: MarketingTemplate[] = [
  // ─────────────────────────────────────────────────────────────
  // JUST LISTED — FLYER 1: "Prestige Dark"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'just-listed-flyer-1',
    name: 'Prestige Dark',
    category: 'Just Listed',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '🏠',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: "'Inter', system-ui, sans-serif", background: '#0d0d0d', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{ padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#c9a96e', fontWeight: 600 }}>
            <EditableText editable={editable}>{data.headline}</EditableText>
          </div>
          <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            <EditableText editable={editable}>{data.agentTitle}</EditableText>
          </div>
        </div>
        {/* Photo */}
        <PhotoArea
          photos={data.photos}
          style={{ flex: 1, width: '100%', background: '#1a1a1a' }}
        />
        {/* Gradient overlay section */}
        <div style={{ background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)', padding: '36px 40px 28px' }}>
          {/* Price */}
          <div style={{ fontSize: 13, letterSpacing: 4, textTransform: 'uppercase', color: '#c9a96e', marginBottom: 10 }}>Listed at</div>
          <div style={{ fontSize: 52, fontWeight: 800, letterSpacing: -1, lineHeight: 1, marginBottom: 14 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          {/* Address */}
          <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4, letterSpacing: -0.3 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 28 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
          {/* Stats row */}
          <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24 }}>
            {[
              { label: 'Bedrooms', value: data.beds },
              { label: 'Bathrooms', value: data.baths },
              { label: 'Square Feet', value: data.sqft },
            ].map((s, i) => (
              <div key={s.label} style={{ flex: 1, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none', paddingLeft: i > 0 ? 24 : 0 }}>
                <StatPill value={s.value} label={s.label} color="#c9a96e" editable={editable} />
              </div>
            ))}
          </div>
        </div>
        {/* Agent footer */}
        <div style={{ background: '#c9a96e', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0d0d0d' }}>
              <EditableText editable={editable}>{data.agentName}</EditableText>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.55)', marginTop: 1 }}>
              <EditableText editable={editable}>{data.agentTitle}</EditableText>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: 'rgba(0,0,0,0.7)' }}>
            <div style={{ fontWeight: 600 }}><EditableText editable={editable}>{data.agentPhone}</EditableText></div>
            <div style={{ marginTop: 2 }}><EditableText editable={editable}>{data.agentEmail}</EditableText></div>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // JUST LISTED — FLYER 2: "Clean White"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'just-listed-flyer-2',
    name: 'Clean White',
    category: 'Just Listed',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '🏡',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: "'Inter', system-ui, sans-serif", background: '#ffffff', color: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header band */}
        <div style={{ background: '#1a1a1a', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#fff', fontWeight: 600 }}>
            <EditableText editable={editable}>{data.headline}</EditableText>
          </div>
          <div style={{ width: 40, height: 2, background: '#e2c27a' }} />
        </div>
        {/* Photo */}
        <PhotoArea photos={data.photos} style={{ height: 480, width: '100%', background: '#f0f0f0' }} />
        {/* Content */}
        <div style={{ flex: 1, padding: '32px 48px 24px', display: 'flex', flexDirection: 'column' }}>
          {/* Price */}
          <div style={{ fontSize: 48, fontWeight: 800, color: '#1a1a1a', letterSpacing: -1, marginBottom: 6 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          {/* Address */}
          <div style={{ fontSize: 20, fontWeight: 600, color: '#222', marginBottom: 3 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 14, color: '#888', marginBottom: 24 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 40, marginBottom: 24 }}>
            {[
              { label: 'Beds', value: data.beds },
              { label: 'Baths', value: data.baths },
              { label: 'Sq Ft', value: data.sqft },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#1a1a1a' }}>
                  <EditableText editable={editable}>{s.value || '—'}</EditableText>
                </div>
                <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1.5, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Description */}
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.65, flex: 1 }}>
            <EditableText editable={editable}>{data.description}</EditableText>
          </div>
        </div>
        {/* Footer */}
        <div style={{ borderTop: '2px solid #1a1a1a', padding: '18px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}><EditableText editable={editable}>{data.agentTitle}</EditableText></div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: '#666' }}>
            <div style={{ fontWeight: 600, color: '#1a1a1a' }}><EditableText editable={editable}>{data.agentPhone}</EditableText></div>
            <div style={{ marginTop: 2 }}><EditableText editable={editable}>{data.agentEmail}</EditableText></div>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // OPEN HOUSE — FLYER 1: "Sage Green"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'open-house-flyer-1',
    name: 'Sage Green',
    category: 'Open House',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '🏘️',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: "'Inter', system-ui, sans-serif", background: '#fff', color: '#222', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top header */}
        <div style={{ background: '#2d6a4f', color: '#fff', padding: '44px 52px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 7, textTransform: 'uppercase', opacity: 0.65, marginBottom: 12 }}>You're Invited</div>
          <div style={{ fontSize: 58, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>OPEN HOUSE</div>
          <div style={{ width: 48, height: 2, background: '#74c69d', margin: '20px auto 16px' }} />
          <div style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>
            <EditableText editable={editable}>{data.openHouseDate}</EditableText>
          </div>
          <div style={{ fontSize: 16, opacity: 0.75, marginTop: 4 }}>
            <EditableText editable={editable}>{data.openHouseTime}</EditableText>
          </div>
        </div>
        {/* Photo */}
        <PhotoArea photos={data.photos} style={{ flex: 1, width: '100%', background: '#e0e0e0' }} />
        {/* Property info */}
        <div style={{ padding: '32px 52px 24px' }}>
          <div style={{ fontSize: 32, fontWeight: 700, marginBottom: 6, letterSpacing: -0.5 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#2d6a4f', marginBottom: 12 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ display: 'flex', gap: 28, fontSize: 14, color: '#555' }}>
            {[
              { label: 'Beds', value: data.beds },
              { label: 'Baths', value: data.baths },
              { label: 'Sq Ft', value: data.sqft },
            ].map((s) => (
              <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong style={{ fontSize: 17 }}><EditableText editable={editable}>{s.value}</EditableText></strong> {s.label}
              </span>
            ))}
          </div>
        </div>
        {/* Footer */}
        <div style={{ background: '#2d6a4f', color: '#fff', padding: '18px 52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}><EditableText editable={editable}>{data.agentTitle}</EditableText></div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div style={{ fontWeight: 600 }}><EditableText editable={editable}>{data.agentPhone}</EditableText></div>
            <div style={{ opacity: 0.7, marginTop: 2 }}><EditableText editable={editable}>{data.agentEmail}</EditableText></div>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // OPEN HOUSE — FLYER 2: "Elegant Serif"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'open-house-flyer-2',
    name: 'Elegant Serif',
    category: 'Open House',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '🏛️',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: 'Georgia, "Times New Roman", serif', background: '#f8f5ef', color: '#2c2c2c', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top ornament */}
        <div style={{ padding: '52px 60px 28px', textAlign: 'center', borderBottom: '1px solid #d5cfc6' }}>
          <div style={{ fontSize: 11, letterSpacing: 7, textTransform: 'uppercase', color: '#b08968', fontFamily: 'system-ui, sans-serif', marginBottom: 14 }}>Open House</div>
          <div style={{ fontSize: 46, fontWeight: 400, letterSpacing: -0.5, lineHeight: 1.1 }}>
            <EditableText editable={editable}>{data.openHouseDate}</EditableText>
          </div>
          <div style={{ fontSize: 18, color: '#888', marginTop: 8, fontStyle: 'italic' }}>
            <EditableText editable={editable}>{data.openHouseTime}</EditableText>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
            <div style={{ flex: 1, height: 1, background: '#d0c8bc' }} />
            <div style={{ fontSize: 18, color: '#b08968' }}>◆</div>
            <div style={{ flex: 1, height: 1, background: '#d0c8bc' }} />
          </div>
        </div>
        {/* Photo */}
        <PhotoArea photos={data.photos} style={{ flex: 1, margin: '28px 60px 0', background: '#e0dcd5' }} />
        {/* Property info */}
        <div style={{ padding: '28px 60px', textAlign: 'center' }}>
          <div style={{ fontSize: 34, fontWeight: 400, letterSpacing: -0.3, marginBottom: 6 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 15, color: '#888', marginBottom: 16, fontFamily: 'system-ui, sans-serif' }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
          <div style={{ fontSize: 40, color: '#b08968', fontWeight: 400, marginBottom: 16 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, fontSize: 14, color: '#888', fontFamily: 'system-ui, sans-serif' }}>
            <span><strong style={{ color: '#555' }}><EditableText editable={editable}>{data.beds}</EditableText></strong> Bedrooms</span>
            <span><strong style={{ color: '#555' }}><EditableText editable={editable}>{data.baths}</EditableText></strong> Bathrooms</span>
            <span><strong style={{ color: '#555' }}><EditableText editable={editable}>{data.sqft}</EditableText></strong> Sq Ft</span>
          </div>
        </div>
        {/* Footer */}
        <div style={{ borderTop: '1px solid #d5cfc6', padding: '18px 60px', display: 'flex', justifyContent: 'center', gap: 48, fontSize: 13, color: '#888', fontFamily: 'system-ui, sans-serif' }}>
          <span style={{ fontWeight: 600, color: '#555' }}><EditableText editable={editable}>{data.agentName}</EditableText></span>
          <span><EditableText editable={editable}>{data.agentPhone}</EditableText></span>
          <span><EditableText editable={editable}>{data.agentEmail}</EditableText></span>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // JUST LISTED — SOCIAL POST: "Bold Dark"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'just-listed-post-1',
    name: 'Bold Dark Post',
    category: 'Just Listed',
    type: 'post',
    width: 1080,
    height: 1080,
    thumbnail: '📱',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1080, fontFamily: "'Inter', system-ui, sans-serif", background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Photo fills most of frame */}
        <PhotoArea photos={data.photos} style={{ flex: 1, width: '100%', background: '#1c1c1c' }} />
        {/* Bottom gradient overlay */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.6) 55%, transparent 100%)', padding: '140px 52px 52px' }}>
          {/* Category badge */}
          <div style={{ display: 'inline-block', background: '#c9a96e', color: '#000', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', fontWeight: 700, padding: '6px 16px', borderRadius: 2, marginBottom: 18 }}>
            <EditableText editable={editable}>{data.headline}</EditableText>
          </div>
          {/* Address */}
          <div style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.05, letterSpacing: -0.5, marginBottom: 8 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.55)', marginBottom: 24 }}>
            <EditableText editable={editable}>{data.city}, {data.state}</EditableText>
          </div>
          {/* Price + stats */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 32 }}>
            <span style={{ fontSize: 42, fontWeight: 300, color: '#c9a96e' }}>
              <EditableText editable={editable}>{data.price}</EditableText>
            </span>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 20 }}>
              <span><EditableText editable={editable}>{data.beds}</EditableText> BD</span>
              <span><EditableText editable={editable}>{data.baths}</EditableText> BA</span>
              <span><EditableText editable={editable}>{data.sqft}</EditableText> SF</span>
            </span>
          </div>
          {/* Agent */}
          <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 13, color: 'rgba(255,255,255,0.4)', display: 'flex', gap: 8 }}>
            <EditableText editable={editable}>{data.agentName}</EditableText>
            <span>·</span>
            <EditableText editable={editable}>{data.agentPhone}</EditableText>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // OPEN HOUSE — SOCIAL POST: "Emerald"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'open-house-post-1',
    name: 'Emerald Post',
    category: 'Open House',
    type: 'post',
    width: 1080,
    height: 1080,
    thumbnail: '📸',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1080, fontFamily: "'Inter', system-ui, sans-serif", background: '#1b4332', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top section */}
        <div style={{ padding: '60px 64px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: 7, textTransform: 'uppercase', color: '#74c69d', marginBottom: 14 }}>You're Invited</div>
          <div style={{ fontSize: 66, fontWeight: 900, letterSpacing: -1, lineHeight: 0.95 }}>OPEN<br />HOUSE</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, margin: '24px 0 20px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ fontSize: 22, fontWeight: 700, color: '#74c69d' }}>
              <EditableText editable={editable}>{data.openHouseDate}</EditableText>
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
          </div>
          <div style={{ fontSize: 18, opacity: 0.65 }}>
            <EditableText editable={editable}>{data.openHouseTime}</EditableText>
          </div>
        </div>
        {/* Photo */}
        <PhotoArea photos={data.photos} style={{ flex: 1, margin: '0 64px', background: 'rgba(255,255,255,0.07)', borderRadius: 8 }} />
        {/* Property info */}
        <div style={{ padding: '28px 64px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.3, marginBottom: 6 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 15, opacity: 0.5, marginBottom: 12 }}>
            <EditableText editable={editable}>{data.city}, {data.state}</EditableText>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#74c69d', marginBottom: 16 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ fontSize: 14, opacity: 0.45 }}>
            <EditableText editable={editable}>{data.agentName}</EditableText>
            {' · '}
            <EditableText editable={editable}>{data.agentPhone}</EditableText>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // PRICE CUT — SOCIAL POST: "Crimson"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'price-cut-post-1',
    name: 'Crimson Price Cut',
    category: 'Price Cut',
    type: 'post',
    width: 1080,
    height: 1080,
    thumbnail: '💰',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1080, fontFamily: "'Inter', system-ui, sans-serif", background: '#fff', color: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Big red header */}
        <div style={{ background: '#c1121f', color: '#fff', padding: '36px 56px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.8, marginBottom: 8 }}>Price Reduced</div>
          <div style={{ fontSize: 56, fontWeight: 900, letterSpacing: -1 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
        </div>
        {/* Photo */}
        <PhotoArea photos={data.photos} style={{ flex: 1, width: '100%', background: '#f0f0f0' }} />
        {/* Info */}
        <div style={{ padding: '32px 56px', borderTop: '3px solid #c1121f' }}>
          <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 6, letterSpacing: -0.3 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 16, color: '#666', marginBottom: 16 }}>
            <EditableText editable={editable}>{data.city}, {data.state}</EditableText>
          </div>
          <div style={{ display: 'flex', gap: 32, marginBottom: 20 }}>
            {[
              { label: 'Beds', value: data.beds },
              { label: 'Baths', value: data.baths },
              { label: 'Sq Ft', value: data.sqft },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 24, fontWeight: 700 }}><EditableText editable={editable}>{s.value || '—'}</EditableText></div>
                <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#999' }}>
            <EditableText editable={editable}>{data.agentName}</EditableText>
            {' · '}
            <EditableText editable={editable}>{data.agentPhone}</EditableText>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // UNDER CONTRACT — SOCIAL POST: "Navy Stamp"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'under-contract-post-1',
    name: 'Navy Stamp',
    category: 'Under Contract',
    type: 'post',
    width: 1080,
    height: 1080,
    thumbnail: '📝',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1080, fontFamily: "'Inter', system-ui, sans-serif", background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Photo fills top */}
        <PhotoArea photos={data.photos} style={{ flex: 1, width: '100%', background: '#1e293b' }} />
        {/* Rotated stamp watermark */}
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%) rotate(-18deg)', fontSize: 78, fontWeight: 900, letterSpacing: 6, color: 'rgba(59,130,246,0.12)', textTransform: 'uppercase', whiteSpace: 'nowrap', pointerEvents: 'none', border: '8px solid rgba(59,130,246,0.1)', padding: '10px 28px', borderRadius: 4 }}>
          UNDER CONTRACT
        </div>
        {/* Bottom panel */}
        <div style={{ background: 'linear-gradient(to top, #0f172a, #0f172acc)', padding: '44px 56px 48px' }}>
          <div style={{ fontSize: 12, letterSpacing: 5, textTransform: 'uppercase', color: '#3b82f6', marginBottom: 14 }}>
            <EditableText editable={editable}>Under Contract</EditableText>
          </div>
          <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -0.5, marginBottom: 6 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', marginBottom: 16 }}>
            <EditableText editable={editable}>{data.city}, {data.state}</EditableText>
          </div>
          <div style={{ fontSize: 38, fontWeight: 300, color: '#3b82f6', marginBottom: 24 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            <EditableText editable={editable}>{data.agentName}</EditableText>
            {' · '}
            <EditableText editable={editable}>{data.agentPhone}</EditableText>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // COMING SOON — STORY: "Cinematic"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'coming-soon-story-1',
    name: 'Cinematic Story',
    category: 'Coming Soon',
    type: 'story',
    width: 1080,
    height: 1920,
    thumbnail: '📲',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1920, fontFamily: "'Inter', system-ui, sans-serif", background: '#080808', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <PhotoArea photos={data.photos} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#111' }} />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 35%, transparent 50%, rgba(0,0,0,0.92) 80%)' }} />
        {/* Top badge */}
        <div style={{ position: 'relative', padding: '72px 64px 0', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ background: '#c9a96e', color: '#000', fontSize: 10, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase', padding: '8px 20px' }}>
            Coming Soon
          </div>
        </div>
        {/* Bottom text */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 64px 80px' }}>
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 0.95, letterSpacing: -2, marginBottom: 16 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginBottom: 28 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
          <div style={{ fontSize: 52, fontWeight: 200, color: '#c9a96e', marginBottom: 28 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
            <StatPill value={data.beds} label="Beds" editable={editable} />
            <StatPill value={data.baths} label="Baths" editable={editable} />
            <StatPill value={data.sqft} label="Sq Ft" editable={editable} />
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: 28 }}>
            <div style={{ fontWeight: 700, fontSize: 20 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
              <EditableText editable={editable}>{data.agentPhone}</EditableText>
              {' · '}
              <EditableText editable={editable}>{data.agentEmail}</EditableText>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // JUST SOLD — STORY: "Celebration"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'just-sold-story-1',
    name: 'Celebration Story',
    category: 'Just Sold',
    type: 'story',
    width: 1080,
    height: 1920,
    thumbnail: '🎉',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1920, fontFamily: "'Inter', system-ui, sans-serif", background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top header */}
        <div style={{ padding: '80px 64px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, letterSpacing: 8, textTransform: 'uppercase', color: '#e94560', marginBottom: 16 }}>
            <EditableText editable={editable}>Just Sold</EditableText>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(233,69,96,0.4)' }} />
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e94560' }} />
            <div style={{ flex: 1, height: 1, background: 'rgba(233,69,96,0.4)' }} />
          </div>
        </div>
        {/* Photo */}
        <PhotoArea photos={data.photos} style={{ height: 880, margin: '0 64px', background: '#1a1a1a', borderRadius: 16 }} />
        {/* Bottom info */}
        <div style={{ flex: 1, padding: '52px 64px 80px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.05, letterSpacing: -0.8, marginBottom: 12 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
          <div style={{ fontSize: 60, fontWeight: 200, color: '#e94560', marginBottom: 28 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 56, marginBottom: 48 }}>
            <StatPill value={data.beds} label="BD" color="rgba(255,255,255,0.7)" editable={editable} />
            <StatPill value={data.baths} label="BA" color="rgba(255,255,255,0.7)" editable={editable} />
            <StatPill value={data.sqft} label="SF" color="rgba(255,255,255,0.7)" editable={editable} />
          </div>
          <div style={{ paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginTop: 6 }}>
              <EditableText editable={editable}>{data.agentPhone}</EditableText>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // JUST SOLD — FLYER: "Trophy"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'just-sold-flyer-1',
    name: 'Trophy Flyer',
    category: 'Just Sold',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '🏆',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: "'Inter', system-ui, sans-serif", background: '#fff', color: '#111', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Sold banner */}
        <div style={{ background: '#e94560', color: '#fff', textAlign: 'center', padding: '24px 48px' }}>
          <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: 4, textTransform: 'uppercase' }}>SOLD</div>
          <div style={{ fontSize: 12, letterSpacing: 4, opacity: 0.8, marginTop: 4 }}>Congratulations!</div>
        </div>
        {/* Photo */}
        <PhotoArea photos={data.photos} style={{ flex: 1, width: '100%', background: '#f0f0f0' }} />
        {/* Price band */}
        <div style={{ background: '#111', color: '#fff', padding: '22px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>Sold For</div>
          <div style={{ fontSize: 40, fontWeight: 800, color: '#e94560' }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
        </div>
        {/* Content */}
        <div style={{ padding: '28px 48px' }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6, letterSpacing: -0.3 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 15, color: '#777', marginBottom: 20 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
          <div style={{ display: 'flex', gap: 36, marginBottom: 20 }}>
            {[
              { label: 'Beds', value: data.beds },
              { label: 'Baths', value: data.baths },
              { label: 'Sq Ft', value: data.sqft },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 26, fontWeight: 700 }}><EditableText editable={editable}>{s.value || '—'}</EditableText></div>
                <div style={{ fontSize: 11, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: '#777', lineHeight: 1.6 }}>
            <EditableText editable={editable}>{data.description}</EditableText>
          </div>
        </div>
        {/* Agent footer */}
        <div style={{ borderTop: '2px solid #e94560', padding: '16px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 1 }}><EditableText editable={editable}>{data.agentTitle}</EditableText></div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: '#666' }}>
            <div style={{ fontWeight: 600, color: '#111' }}><EditableText editable={editable}>{data.agentPhone}</EditableText></div>
            <div style={{ marginTop: 2 }}><EditableText editable={editable}>{data.agentEmail}</EditableText></div>
          </div>
        </div>
      </div>
    ),
  },

  // ─────────────────────────────────────────────────────────────
  // UNDER CONTRACT — FLYER: "Blueprint"
  // ─────────────────────────────────────────────────────────────
  {
    id: 'under-contract-flyer-1',
    name: 'Blueprint Flyer',
    category: 'Under Contract',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '📋',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: "'Inter', system-ui, sans-serif", background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '36px 48px 28px', borderBottom: '1px solid rgba(59,130,246,0.2)' }}>
          <div style={{ fontSize: 11, letterSpacing: 5, textTransform: 'uppercase', color: '#3b82f6', marginBottom: 10 }}>Under Contract</div>
          <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -0.8, lineHeight: 1 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
        </div>
        {/* Photo */}
        <PhotoArea photos={data.photos} style={{ flex: 1, width: '100%', background: '#1e293b' }} />
        {/* Price + stats */}
        <div style={{ background: '#3b82f6', padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 40, fontWeight: 800 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ display: 'flex', gap: 36 }}>
            {[
              { label: 'Beds', value: data.beds },
              { label: 'Baths', value: data.baths },
              { label: 'SF', value: data.sqft },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700 }}><EditableText editable={editable}>{s.value || '—'}</EditableText></div>
                <div style={{ fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.7 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Description */}
        <div style={{ padding: '20px 48px', fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
          <EditableText editable={editable}>{data.description}</EditableText>
        </div>
        {/* Agent */}
        <div style={{ padding: '18px 48px', borderTop: '1px solid rgba(59,130,246,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}><EditableText editable={editable}>{data.agentTitle}</EditableText></div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
            <div style={{ fontWeight: 600, color: '#3b82f6' }}><EditableText editable={editable}>{data.agentPhone}</EditableText></div>
            <div style={{ marginTop: 2 }}><EditableText editable={editable}>{data.agentEmail}</EditableText></div>
          </div>
        </div>
      </div>
    ),
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
    price: deal?.price || '$0',
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
    agentEmail: sellerAgent?.email || 'agent@email.com',
    headline: 'Just Listed',
    subheadline: 'Your Dream Home Awaits',
    description:
      'Beautiful property featuring modern finishes, spacious living areas, and a stunning outdoor space. Schedule your private showing today!',
    openHouseDate: 'Saturday, March 22',
    openHouseTime: '1:00 PM – 4:00 PM',
  };
}
