import { create } from 'zustand';

export interface Contact {
  id: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  currentAddress?: string;
  mlsId?: string;
  mls?: string;
  commission?: string;
  commissionType?: 'percentage' | 'dollars';
}

export interface ChecklistItem {
  id: string;
  name: string;
  hasDigitalForm: boolean;
  completed: boolean;
  expanded: boolean;
}

export interface Deal {
  id: string;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  representationSide: 'buyer' | 'seller' | 'both';
  status: 'draft' | 'active' | 'pending' | 'archive';
  price: string;
  mlsNumber: string;
  listingStartDate: string;
  listingExpiration: string;
  contacts: Contact[];
  checklistItems: ChecklistItem[];
  primaryAgent: string;
  createdAt: string;
}

const DEFAULT_CHECKLIST: Omit<ChecklistItem, 'id'>[] = [
  { name: 'Exclusive Right of Sale Listing Agreement', hasDigitalForm: true, completed: false, expanded: false },
  { name: 'Tax Roll', hasDigitalForm: false, completed: false, expanded: false },
  { name: 'Lead-Based Paint Pamphlet', hasDigitalForm: false, completed: false, expanded: false },
  { name: 'Sellers Property Disclosure - Residential', hasDigitalForm: true, completed: false, expanded: false },
  { name: 'Affiliated Business Arrangement Disclosure Statement (Seller)', hasDigitalForm: true, completed: false, expanded: false },
  { name: 'P. Lead Based Paint Disclosure (Pre 1978 Housing)', hasDigitalForm: true, completed: false, expanded: false },
  { name: 'Compensation Agreement – Owner/Listing Broker to Tenant\'s Broker', hasDigitalForm: true, completed: false, expanded: false },
  { name: 'Compensation Agreement – Seller or Seller\'s Broker to Buyer\'s Broker', hasDigitalForm: true, completed: false, expanded: false },
  { name: 'Modification to Compensation Agreement – Seller or Seller\'s Broker to Buyer\'s Broker', hasDigitalForm: true, completed: false, expanded: false },
];

const SAMPLE_DEALS: Deal[] = [
  {
    id: '1',
    propertyType: 'Sale-Single Family Home',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    state: 'IL',
    zip: '62704',
    representationSide: 'seller',
    status: 'active',
    price: '$450,000',
    mlsNumber: 'MLS-2024-001',
    listingStartDate: '2026-01-15',
    listingExpiration: '2026-07-15',
    contacts: [
      { id: 'c1', role: 'Seller Agent', firstName: 'John', lastName: 'Smith', email: 'john@realty.com', phone: '(555) 123-4567', company: 'ABC Realty', mlsId: 'AGT001', mls: 'MFRMLS', commission: '3', commissionType: 'percentage' },
      { id: 'c2', role: 'Seller', firstName: 'Homer', lastName: 'Simpson', email: 'homer@email.com', phone: '(555) 987-6543', company: '', currentAddress: '742 Evergreen Terrace, Springfield IL' },
    ],
    checklistItems: DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `cl-1-${i}` })),
    primaryAgent: 'John Smith',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    propertyType: 'Sale-Condo',
    address: '1600 Pennsylvania Avenue',
    city: 'Washington',
    state: 'DC',
    zip: '20500',
    representationSide: 'buyer',
    status: 'pending',
    price: '$1,200,000',
    mlsNumber: 'MLS-2024-002',
    listingStartDate: '2026-02-01',
    listingExpiration: '2026-08-01',
    contacts: [
      { id: 'c3', role: 'Buyer Agent', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@homes.com', phone: '(555) 234-5678', company: 'Premier Homes', mlsId: 'AGT002', mls: 'BRIGHTMLS', commission: '2.5', commissionType: 'percentage' },
    ],
    checklistItems: DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `cl-2-${i}` })),
    primaryAgent: 'Sarah Johnson',
    createdAt: '2026-02-01',
  },
  {
    id: '3',
    propertyType: 'Sale-Land',
    address: '100 Oak Street',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    representationSide: 'both',
    status: 'draft',
    price: '$850,000',
    mlsNumber: '',
    listingStartDate: '',
    listingExpiration: '',
    contacts: [],
    checklistItems: DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `cl-3-${i}` })),
    primaryAgent: 'Unassigned',
    createdAt: '2026-03-10',
  },
];

interface NewDealState {
  step: number;
  propertyType: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  representationSide: 'buyer' | 'seller' | 'both' | '';
  sellerAgent: Contact | null;
  seller: Contact | null;
}

interface DealStore {
  deals: Deal[];
  newDeal: NewDealState;
  setNewDealStep: (step: number) => void;
  updateNewDeal: (data: Partial<NewDealState>) => void;
  resetNewDeal: () => void;
  createDeal: () => string;
  updateDeal: (id: string, data: Partial<Deal>) => void;
  toggleChecklistItem: (dealId: string, itemId: string) => void;
  toggleChecklistExpand: (dealId: string, itemId: string) => void;
}

const initialNewDeal: NewDealState = {
  step: 1,
  propertyType: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  representationSide: '',
  sellerAgent: null,
  seller: null,
};

export const useDealStore = create<DealStore>((set, get) => ({
  deals: SAMPLE_DEALS,
  newDeal: { ...initialNewDeal },

  setNewDealStep: (step) => set((s) => ({ newDeal: { ...s.newDeal, step } })),

  updateNewDeal: (data) => set((s) => ({ newDeal: { ...s.newDeal, ...data } })),

  resetNewDeal: () => set({ newDeal: { ...initialNewDeal } }),

  createDeal: () => {
    const { newDeal } = get();
    const id = crypto.randomUUID();
    const deal: Deal = {
      id,
      propertyType: newDeal.propertyType,
      address: newDeal.address,
      city: newDeal.city,
      state: newDeal.state,
      zip: newDeal.zip,
      representationSide: (newDeal.representationSide || 'seller') as Deal['representationSide'],
      status: 'draft',
      price: '$0',
      mlsNumber: '',
      listingStartDate: new Date().toISOString().split('T')[0],
      listingExpiration: '',
      contacts: [newDeal.sellerAgent, newDeal.seller].filter(Boolean) as Contact[],
      checklistItems: DEFAULT_CHECKLIST.map((item, i) => ({ ...item, id: `cl-${id}-${i}` })),
      primaryAgent: newDeal.sellerAgent ? `${newDeal.sellerAgent.firstName} ${newDeal.sellerAgent.lastName}` : 'Unassigned',
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((s) => ({ deals: [...s.deals, deal] }));
    return id;
  },

  updateDeal: (id, data) => set((s) => ({
    deals: s.deals.map((d) => (d.id === id ? { ...d, ...data } : d)),
  })),

  toggleChecklistItem: (dealId, itemId) => set((s) => ({
    deals: s.deals.map((d) =>
      d.id === dealId
        ? { ...d, checklistItems: d.checklistItems.map((ci) => ci.id === itemId ? { ...ci, completed: !ci.completed } : ci) }
        : d
    ),
  })),

  toggleChecklistExpand: (dealId, itemId) => set((s) => ({
    deals: s.deals.map((d) =>
      d.id === dealId
        ? { ...d, checklistItems: d.checklistItems.map((ci) => ci.id === itemId ? { ...ci, expanded: !ci.expanded } : ci) }
        : d
    ),
  })),
}));
