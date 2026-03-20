import React from 'react';

export type TemplateCategory = 'Just Listed' | 'Open House' | 'Coming Soon' | 'Just Sold' | 'New Price' | 'Under Contract';
export type TemplateType = 'flyer' | 'post' | 'story' | 'email';

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

const EditableText = ({ children, editable, className, style }: { children: React.ReactNode; editable?: boolean; className?: string; style?: React.CSSProperties }) => (
  <span
    contentEditable={editable}
    suppressContentEditableWarning
    className={className}
    style={{ ...style, outline: 'none', cursor: editable ? 'text' : 'default' }}
  >
    {children}
  </span>
);

export const TEMPLATES: MarketingTemplate[] = [
  // --- FLYERS ---
  {
    id: 'just-listed-flyer-1',
    name: 'Classic Just Listed',
    category: 'Just Listed',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '🏠',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: 'system-ui, sans-serif', background: '#1a1a2e', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #e94560, #0f3460)', padding: '32px 40px', textAlign: 'center' }}>
          <EditableText editable={editable} style={{ fontSize: 14, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.9 }}>{data.headline}</EditableText>
          <div style={{ fontSize: 42, fontWeight: 800, marginTop: 8, lineHeight: 1.1 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 18, marginTop: 8, opacity: 0.85 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
        </div>
        <div style={{ flex: 1, background: '#16213e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, opacity: 0.3 }}>
          Property Photo
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 1, background: '#0f3460' }}>
          {[
            { label: 'Price', value: data.price },
            { label: 'Beds', value: data.beds },
            { label: 'Baths', value: data.baths },
            { label: 'Sq Ft', value: data.sqft },
          ].map((s) => (
            <div key={s.label} style={{ background: '#1a1a2e', padding: '20px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.6 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>
                <EditableText editable={editable}>{s.value || '—'}</EditableText>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '20px 40px', textAlign: 'center', fontSize: 13, lineHeight: 1.6, opacity: 0.8 }}>
          <EditableText editable={editable}>{data.description}</EditableText>
        </div>
        <div style={{ background: '#0f3460', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 12, opacity: 0.7 }}><EditableText editable={editable}>{data.agentTitle}</EditableText></div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 12 }}>
            <div><EditableText editable={editable}>{data.agentPhone}</EditableText></div>
            <div style={{ opacity: 0.7 }}><EditableText editable={editable}>{data.agentEmail}</EditableText></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'just-listed-flyer-2',
    name: 'Modern Minimal',
    category: 'Just Listed',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '🏡',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: 'system-ui, sans-serif', background: '#fafafa', color: '#222', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '48px 48px 24px' }}>
          <div style={{ fontSize: 12, letterSpacing: 4, textTransform: 'uppercase', color: '#999' }}>
            <EditableText editable={editable}>{data.headline}</EditableText>
          </div>
          <div style={{ fontSize: 48, fontWeight: 300, marginTop: 12, lineHeight: 1.1, color: '#111' }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
        </div>
        <div style={{ flex: 1, margin: '0 48px', background: '#e5e5e5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#999' }}>
          Property Photo
        </div>
        <div style={{ padding: '24px 48px' }}>
          <div style={{ fontSize: 28, fontWeight: 600 }}><EditableText editable={editable}>{data.address}</EditableText></div>
          <div style={{ fontSize: 16, color: '#666', marginTop: 4 }}><EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText></div>
          <div style={{ display: 'flex', gap: 32, marginTop: 20 }}>
            {[
              { label: 'Beds', value: data.beds },
              { label: 'Baths', value: data.baths },
              { label: 'Sq Ft', value: data.sqft },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 24, fontWeight: 600 }}><EditableText editable={editable}>{s.value || '—'}</EditableText></div>
                <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '20px 48px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 12, color: '#999' }}><EditableText editable={editable}>{data.agentPhone}</EditableText></div>
          </div>
          <div style={{ fontSize: 12, color: '#999' }}><EditableText editable={editable}>{data.agentEmail}</EditableText></div>
        </div>
      </div>
    ),
  },
  // --- OPEN HOUSE ---
  {
    id: 'open-house-flyer-1',
    name: 'Bold Open House',
    category: 'Open House',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '🏘️',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: 'system-ui, sans-serif', background: '#fff', color: '#222', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#2d6a4f', color: '#fff', padding: '40px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.8 }}>You're Invited</div>
          <div style={{ fontSize: 52, fontWeight: 800, marginTop: 8 }}>
            <EditableText editable={editable}>OPEN HOUSE</EditableText>
          </div>
          <div style={{ fontSize: 20, marginTop: 12, opacity: 0.9 }}>
            <EditableText editable={editable}>{data.openHouseDate} • {data.openHouseTime}</EditableText>
          </div>
        </div>
        <div style={{ flex: 1, background: '#e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#999' }}>
          Property Photo
        </div>
        <div style={{ padding: '28px 48px' }}>
          <div style={{ fontSize: 30, fontWeight: 700 }}><EditableText editable={editable}>{data.address}</EditableText></div>
          <div style={{ fontSize: 16, color: '#666', marginTop: 4 }}><EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText></div>
          <div style={{ fontSize: 28, fontWeight: 300, marginTop: 12, color: '#2d6a4f' }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 14, color: '#666' }}>
            <span><EditableText editable={editable}>{data.beds}</EditableText> Beds</span>
            <span><EditableText editable={editable}>{data.baths}</EditableText> Baths</span>
            <span><EditableText editable={editable}>{data.sqft}</EditableText> Sq Ft</span>
          </div>
        </div>
        <div style={{ background: '#2d6a4f', color: '#fff', padding: '18px 48px', display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 12, opacity: 0.8 }}><EditableText editable={editable}>{data.agentTitle}</EditableText></div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13 }}>
            <div><EditableText editable={editable}>{data.agentPhone}</EditableText></div>
            <div style={{ opacity: 0.7 }}><EditableText editable={editable}>{data.agentEmail}</EditableText></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'open-house-flyer-2',
    name: 'Elegant Open House',
    category: 'Open House',
    type: 'flyer',
    width: 816,
    height: 1056,
    thumbnail: '🏛️',
    render: (data, editable) => (
      <div style={{ width: 816, height: 1056, fontFamily: 'Georgia, serif', background: '#f8f5f0', color: '#333', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '60px 56px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, letterSpacing: 8, textTransform: 'uppercase', color: '#b08968' }}>Open House</div>
          <div style={{ width: 60, height: 1, background: '#b08968', margin: '16px auto' }} />
          <div style={{ fontSize: 20, marginTop: 8 }}>
            <EditableText editable={editable}>{data.openHouseDate}</EditableText>
          </div>
          <div style={{ fontSize: 16, color: '#888', marginTop: 4 }}>
            <EditableText editable={editable}>{data.openHouseTime}</EditableText>
          </div>
        </div>
        <div style={{ flex: 1, margin: '20px 56px', background: '#e0dcd5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#999' }}>
          Property Photo
        </div>
        <div style={{ padding: '24px 56px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 400 }}><EditableText editable={editable}>{data.address}</EditableText></div>
          <div style={{ fontSize: 15, color: '#888', marginTop: 8 }}><EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText></div>
          <div style={{ fontSize: 36, color: '#b08968', marginTop: 16, fontWeight: 400 }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 16, fontSize: 13, color: '#888' }}>
            <span><EditableText editable={editable}>{data.beds}</EditableText> Bedrooms</span>
            <span><EditableText editable={editable}>{data.baths}</EditableText> Bathrooms</span>
            <span><EditableText editable={editable}>{data.sqft}</EditableText> Sq Ft</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #d5cfc6', padding: '18px 56px', display: 'flex', justifyContent: 'center', gap: 40, fontSize: 13, color: '#888' }}>
          <span><EditableText editable={editable}>{data.agentName}</EditableText></span>
          <span><EditableText editable={editable}>{data.agentPhone}</EditableText></span>
          <span><EditableText editable={editable}>{data.agentEmail}</EditableText></span>
        </div>
      </div>
    ),
  },
  // --- SOCIAL POSTS (1080x1080) ---
  {
    id: 'just-listed-post-1',
    name: 'Just Listed Post',
    category: 'Just Listed',
    type: 'post',
    width: 1080,
    height: 1080,
    thumbnail: '📱',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1080, fontFamily: 'system-ui, sans-serif', background: '#111', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#666' }}>
          Property Photo
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.95))', padding: '120px 48px 48px' }}>
          <div style={{ fontSize: 16, letterSpacing: 4, textTransform: 'uppercase', color: '#e94560' }}>
            <EditableText editable={editable}>{data.headline}</EditableText>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, marginTop: 12 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 18, opacity: 0.7, marginTop: 4 }}>
            <EditableText editable={editable}>{data.city}, {data.state}</EditableText>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 20, fontSize: 16 }}>
            <span style={{ fontSize: 32, fontWeight: 300 }}><EditableText editable={editable}>{data.price}</EditableText></span>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 12, fontSize: 14, opacity: 0.6 }}>
            <span><EditableText editable={editable}>{data.beds}</EditableText> BD</span>
            <span><EditableText editable={editable}>{data.baths}</EditableText> BA</span>
            <span><EditableText editable={editable}>{data.sqft}</EditableText> SF</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 13, opacity: 0.5 }}>
            <EditableText editable={editable}>{data.agentName} • {data.agentPhone}</EditableText>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'open-house-post-1',
    name: 'Open House Post',
    category: 'Open House',
    type: 'post',
    width: 1080,
    height: 1080,
    thumbnail: '📸',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1080, fontFamily: 'system-ui, sans-serif', background: '#2d6a4f', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '60px 56px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 16, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.7 }}>You're Invited</div>
          <div style={{ fontSize: 56, fontWeight: 800, marginTop: 8 }}>
            <EditableText editable={editable}>OPEN HOUSE</EditableText>
          </div>
          <div style={{ fontSize: 22, marginTop: 16, opacity: 0.9 }}>
            <EditableText editable={editable}>{data.openHouseDate}</EditableText>
          </div>
          <div style={{ fontSize: 18, opacity: 0.7 }}>
            <EditableText editable={editable}>{data.openHouseTime}</EditableText>
          </div>
        </div>
        <div style={{ flex: 1, margin: '32px 56px', background: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, opacity: 0.3 }}>
          Property Photo
        </div>
        <div style={{ padding: '0 56px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}><EditableText editable={editable}>{data.address}</EditableText></div>
          <div style={{ fontSize: 16, opacity: 0.7, marginTop: 4 }}><EditableText editable={editable}>{data.city}, {data.state}</EditableText></div>
          <div style={{ fontSize: 36, fontWeight: 300, marginTop: 12 }}><EditableText editable={editable}>{data.price}</EditableText></div>
          <div style={{ marginTop: 16, fontSize: 14, opacity: 0.6 }}>
            <EditableText editable={editable}>{data.agentName} • {data.agentPhone}</EditableText>
          </div>
        </div>
      </div>
    ),
  },
  // --- STORIES (1080x1920) ---
  {
    id: 'coming-soon-story-1',
    name: 'Coming Soon Story',
    category: 'Coming Soon',
    type: 'story',
    width: 1080,
    height: 1920,
    thumbnail: '📲',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1920, fontFamily: 'system-ui, sans-serif', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <div style={{ flex: 1, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: '#444' }}>
          Property Photo
        </div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.9))', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '80px 56px' }}>
          <div style={{ fontSize: 18, letterSpacing: 8, textTransform: 'uppercase', color: '#c9a96e' }}>
            <EditableText editable={editable}>Coming Soon</EditableText>
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, marginTop: 16, lineHeight: 1.1 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 20, opacity: 0.7, marginTop: 8 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
          <div style={{ fontSize: 44, fontWeight: 300, marginTop: 24, color: '#c9a96e' }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 20, fontSize: 16, opacity: 0.6 }}>
            <span><EditableText editable={editable}>{data.beds}</EditableText> Beds</span>
            <span><EditableText editable={editable}>{data.baths}</EditableText> Baths</span>
            <span><EditableText editable={editable}>{data.sqft}</EditableText> Sq Ft</span>
          </div>
          <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 24 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 14, opacity: 0.5, marginTop: 4 }}><EditableText editable={editable}>{data.agentPhone} • {data.agentEmail}</EditableText></div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'just-sold-story-1',
    name: 'Just Sold Story',
    category: 'Just Sold',
    type: 'story',
    width: 1080,
    height: 1920,
    thumbnail: '🎉',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1920, fontFamily: 'system-ui, sans-serif', background: '#1a1a2e', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '100px 56px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, letterSpacing: 8, textTransform: 'uppercase', color: '#e94560' }}>
            <EditableText editable={editable}>Just Sold</EditableText>
          </div>
          <div style={{ width: 60, height: 2, background: '#e94560', margin: '20px auto' }} />
        </div>
        <div style={{ flex: 1, margin: '0 56px', background: '#16213e', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#444' }}>
          Property Photo
        </div>
        <div style={{ padding: '40px 56px 80px', textAlign: 'center' }}>
          <div style={{ fontSize: 44, fontWeight: 700, lineHeight: 1.1 }}>
            <EditableText editable={editable}>{data.address}</EditableText>
          </div>
          <div style={{ fontSize: 18, opacity: 0.6, marginTop: 8 }}>
            <EditableText editable={editable}>{data.city}, {data.state} {data.zip}</EditableText>
          </div>
          <div style={{ fontSize: 48, fontWeight: 300, marginTop: 24, color: '#e94560' }}>
            <EditableText editable={editable}>{data.price}</EditableText>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 16, fontSize: 15, opacity: 0.5 }}>
            <span><EditableText editable={editable}>{data.beds}</EditableText> BD</span>
            <span><EditableText editable={editable}>{data.baths}</EditableText> BA</span>
            <span><EditableText editable={editable}>{data.sqft}</EditableText> SF</span>
          </div>
          <div style={{ marginTop: 40 }}>
            <div style={{ fontWeight: 600, fontSize: 16 }}><EditableText editable={editable}>{data.agentName}</EditableText></div>
            <div style={{ fontSize: 13, opacity: 0.5, marginTop: 4 }}><EditableText editable={editable}>{data.agentPhone}</EditableText></div>
          </div>
        </div>
      </div>
    ),
  },
  // --- NEW PRICE ---
  {
    id: 'new-price-post-1',
    name: 'Price Reduction Post',
    category: 'New Price',
    type: 'post',
    width: 1080,
    height: 1080,
    thumbnail: '💰',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1080, fontFamily: 'system-ui, sans-serif', background: '#fff', color: '#222', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ background: '#dc2626', color: '#fff', padding: '28px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, letterSpacing: 6, textTransform: 'uppercase' }}>
            <EditableText editable={editable}>New Price</EditableText>
          </div>
        </div>
        <div style={{ flex: 1, background: '#f1f1f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#999' }}>
          Property Photo
        </div>
        <div style={{ padding: '32px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 700 }}><EditableText editable={editable}>{data.price}</EditableText></div>
          <div style={{ fontSize: 24, fontWeight: 600, marginTop: 12 }}><EditableText editable={editable}>{data.address}</EditableText></div>
          <div style={{ fontSize: 15, color: '#666', marginTop: 4 }}><EditableText editable={editable}>{data.city}, {data.state}</EditableText></div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 16, fontSize: 14, color: '#888' }}>
            <span><EditableText editable={editable}>{data.beds}</EditableText> BD</span>
            <span><EditableText editable={editable}>{data.baths}</EditableText> BA</span>
            <span><EditableText editable={editable}>{data.sqft}</EditableText> SF</span>
          </div>
          <div style={{ marginTop: 20, fontSize: 13, color: '#999' }}>
            <EditableText editable={editable}>{data.agentName} • {data.agentPhone}</EditableText>
          </div>
        </div>
      </div>
    ),
  },
  // --- UNDER CONTRACT ---
  {
    id: 'under-contract-post-1',
    name: 'Under Contract Post',
    category: 'Under Contract',
    type: 'post',
    width: 1080,
    height: 1080,
    thumbnail: '📝',
    render: (data, editable) => (
      <div style={{ width: 1080, height: 1080, fontFamily: 'system-ui, sans-serif', background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#475569' }}>
          Property Photo
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-15deg)', fontSize: 72, fontWeight: 900, letterSpacing: 8, color: 'rgba(255,255,255,0.08)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          UNDER CONTRACT
        </div>
        <div style={{ padding: '40px 48px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.95)' }}>
          <div style={{ fontSize: 14, letterSpacing: 6, textTransform: 'uppercase', color: '#3b82f6' }}>
            <EditableText editable={editable}>Under Contract</EditableText>
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, marginTop: 12 }}><EditableText editable={editable}>{data.address}</EditableText></div>
          <div style={{ fontSize: 15, opacity: 0.6, marginTop: 4 }}><EditableText editable={editable}>{data.city}, {data.state}</EditableText></div>
          <div style={{ fontSize: 30, fontWeight: 300, marginTop: 16, color: '#3b82f6' }}><EditableText editable={editable}>{data.price}</EditableText></div>
          <div style={{ marginTop: 20, fontSize: 13, opacity: 0.5 }}>
            <EditableText editable={editable}>{data.agentName} • {data.agentPhone}</EditableText>
          </div>
        </div>
      </div>
    ),
  },
];

export const TEMPLATE_CATEGORIES: TemplateCategory[] = ['Just Listed', 'Open House', 'Coming Soon', 'Just Sold', 'New Price', 'Under Contract'];

export function getDefaultTemplateData(deal?: any): TemplateData {
  const contacts = deal?.deal_contacts || [];
  const sellerAgent = contacts.find((dc: any) => dc.role === 'Seller Agent' || dc.role === 'Listing Agent')?.contact;
  
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
    agentName: sellerAgent ? `${sellerAgent.first_name} ${sellerAgent.last_name}` : (deal?.primary_agent || 'Agent Name'),
    agentTitle: 'Real Estate Agent',
    agentPhone: sellerAgent?.phone || '(555) 123-4567',
    agentEmail: sellerAgent?.email || 'agent@email.com',
    headline: 'Just Listed',
    subheadline: 'Your Dream Home Awaits',
    description: 'Beautiful property featuring modern finishes, spacious living areas, and a stunning outdoor space. Schedule your private showing today!',
    openHouseDate: 'Saturday, March 22',
    openHouseTime: '1:00 PM - 4:00 PM',
  };
}
