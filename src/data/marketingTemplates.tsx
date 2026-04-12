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

export const TEMPLATES: MarketingTemplate[] = [
  // Templates will be added here as ordered
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
