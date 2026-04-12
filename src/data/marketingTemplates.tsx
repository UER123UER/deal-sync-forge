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

// ─── Real UER logo ────────────────────────────────────────────────────────────
const Logo = ({ width = 300 }: { width?: number }) => (
  <img
    src="/logo.jpg"
    alt="United Estates Realty"
    style={{ width, height: 'auto', objectFit: 'contain', display: 'block' }}
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1 — "Just Sold" Social Post  1080×1080
// Layout: white header (logo) | full photo | navy footer (Just Sold + address)
// Matches the reference image exactly.
// ─────────────────────────────────────────────────────────────────────────────
export const TEMPLATES: MarketingTemplate[] = [
  {
    id: 'just-sold-post-1',
    name: 'Just Sold',
    category: 'Just Sold',
    type: 'post',
    width: 1080,
    height: 1080,
    thumbnail: '🎉',
    render: (data, editable) => (
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
        {/* ── White header — logo centred ── */}
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
          <Logo width={360} />
        </div>

        {/* ── Property photo — edge to edge, fills remaining space ── */}
        <Photo
          photos={data.photos}
          style={{ flex: 1, width: '100%' }}
        />

        {/* ── Navy footer ── */}
        <div
          style={{
            background: '#0e1428',
            flexShrink: 0,
            padding: '44px 64px 52px',
            textAlign: 'center',
          }}
        >
          {/* "Just Sold" — italic serif + bold mix */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: 14,
              marginBottom: 22,
            }}
          >
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
              Just
            </span>
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
              Sold
            </span>
          </div>

          {/* Thin gold divider */}
          <div
            style={{
              width: 80,
              height: 2,
              background: '#c9a96e',
              margin: '0 auto 24px',
            }}
          />

          {/* Address */}
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              fontStyle: 'normal',
              color: '#ffffff',
              letterSpacing: 0.5,
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            <E editable={editable}>{data.address}</E>
          </div>

          {/* City, State */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              fontStyle: 'normal',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: 1,
            }}
          >
            <E editable={editable}>{data.city}, {data.state}</E>
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
