import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Check, ChevronRight, ChevronUp, User, Users, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateDeal } from '@/hooks/useDeals';
import { useContacts } from '@/hooks/useContacts';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const PROPERTY_TYPES = [
  'Sale-Condo',
  'Sale-Single Family Home',
  'Lease-Condo',
  'Lease-Single Family Home',
];

type PartyFormKey = 'seller1' | 'seller2' | 'buyer1' | 'buyer2';

type PartyFormState = {
  contactId?: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
};

const createPartyForm = (role: string): PartyFormState => ({
  role,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
});

const emptyPartyErrorState = (): Record<PartyFormKey, Record<string, boolean>> => ({
  seller1: {},
  seller2: {},
  buyer1: {},
  buyer2: {},
});

const hasPartyDetails = (form: PartyFormState) =>
  Boolean(form.firstName.trim() || form.lastName.trim() || form.email.trim() || form.phone.trim() || form.company.trim());

export default function NewDeal() {
  const navigate = useNavigate();
  const createDealMutation = useCreateDeal();
  const { data: allContacts = [] } = useContacts();

  const [step, setStep] = useState(1);
  const [propertyType, setPropertyType] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [representationSide, setRepresentationSide] = useState<'buyer' | 'seller' | 'both' | ''>('');

  const [addressSearch, setAddressSearch] = useState('');
  const [agentSearch, setAgentSearch] = useState('');
  const [showAddresses, setShowAddresses] = useState(false);

  const { suggestions: addressSuggestions, isLoading: addressLoading } = useAddressAutocomplete(addressSearch);
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);

  const [partyForms, setPartyForms] = useState<Record<PartyFormKey, PartyFormState>>({
    seller1: createPartyForm('Seller'),
    seller2: createPartyForm('Seller 2'),
    buyer1: createPartyForm('Buyer'),
    buyer2: createPartyForm('Buyer 2'),
  });
  const [partyErrors, setPartyErrors] = useState<Record<PartyFormKey, Record<string, boolean>>>(emptyPartyErrorState);
  const [agentForm, setAgentForm] = useState({ role: 'Seller Agent', firstName: '', lastName: '', email: '', phone: '', company: '', mlsId: '', mls: '', commission: '', commissionType: 'percentage' as 'percentage' | 'dollars' });
  const [agentErrors, setAgentErrors] = useState<Record<string, boolean>>({});

  const [partySearch, setPartySearch] = useState<Record<PartyFormKey, string>>({
    seller1: '',
    seller2: '',
    buyer1: '',
    buyer2: '',
  });
  const [showPartyResults, setShowPartyResults] = useState<Record<PartyFormKey, boolean>>({
    seller1: false,
    seller2: false,
    buyer1: false,
    buyer2: false,
  });
  const [showSecondSeller, setShowSecondSeller] = useState(false);
  const [showSecondBuyer, setShowSecondBuyer] = useState(false);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);

  const handleClose = () => navigate('/transactions');

  const agentTitle = representationSide === 'buyer'
    ? "Buyer's Agent"
    : representationSide === 'both'
      ? 'Lead Agent'
      : "Seller's Agent";
  const agentDetailsTitle = representationSide === 'buyer'
    ? 'Buyer Agent Details'
    : representationSide === 'both'
      ? 'Agent Details'
      : 'Seller Agent Details';
  const clientStepTitle = representationSide === 'both'
    ? 'Deal Parties'
    : representationSide === 'buyer'
      ? 'Buyer Legal Name'
      : 'Seller Legal Name';
  const clientStepDescription = representationSide === 'both'
    ? 'Add the sellers and buyers on this deal. Second parties are optional.'
    : representationSide === 'buyer'
      ? "Search your contacts or enter the buyer's name. Add a second buyer if needed."
      : "Search your contacts or enter the seller's name. Add a second seller if needed.";

  // Auto-scroll to current step
  useEffect(() => {
    const el = stepRefs.current[step - 1];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  // Click outside to close address dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addressDropdownRef.current && !addressDropdownRef.current.contains(e.target as Node)) {
        setShowAddresses(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const goToStep = (targetStep: number) => {
    if (targetStep < step) setStep(targetStep);
  };

  const handlePropertyType = (type: string) => {
    setPropertyType(type);
    setStep(2);
  };

  const handleAddress = (addr: { address: string; city: string; state: string; zip: string }) => {
    setAddress(addr.address);
    setCity(addr.city);
    setState(addr.state);
    setZip(addr.zip);
    setAddressSearch('');
    setShowAddresses(false);
    setStep(3);
  };

  const handleRepSide = (side: 'buyer' | 'seller' | 'both') => {
    setRepresentationSide(side);
    setAgentForm((f) => ({
      ...f,
      role: side === 'buyer' ? 'Buyer Agent' : side === 'seller' ? 'Seller Agent' : 'Agent',
    }));
    setStep(4);
  };

  const handleSelectAgent = (agent: { first_name: string; last_name: string; email?: string | null; phone?: string | null; company?: string | null; mls_id?: string | null; mls?: string | null; commission?: string | null; commission_type?: string | null }) => {
    setAgentForm((f) => ({
      ...f,
      firstName: agent.first_name,
      lastName: agent.last_name,
      email: agent.email || '',
      phone: agent.phone || '',
      company: agent.company || '',
      mlsId: agent.mls_id || '',
      mls: agent.mls || '',
      commission: agent.commission || '',
      commissionType: (agent.commission_type as 'percentage' | 'dollars') || f.commissionType,
    }));
    setStep(5);
  };

  const updatePartyField = <K extends keyof PartyFormState>(key: PartyFormKey, field: K, value: PartyFormState[K]) => {
    setPartyForms((forms) => ({
      ...forms,
      [key]: {
        ...forms[key],
        [field]: value,
        contactId: field === 'role' ? forms[key].contactId : undefined,
      },
    }));
    if (field === 'firstName' || field === 'lastName') {
      setPartyErrors((errors) => ({
        ...errors,
        [key]: {
          ...errors[key],
          [field]: false,
        },
      }));
    }
  };

  const selectPartyContact = (key: PartyFormKey, contact: { id: string; first_name: string; last_name: string; email?: string | null; phone?: string | null; company?: string | null; role?: string | null }) => {
    setPartyForms((forms) => ({
      ...forms,
      [key]: {
        ...forms[key],
        contactId: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        role: forms[key].role,
      },
    }));
    setPartySearch((search) => ({ ...search, [key]: '' }));
    setShowPartyResults((show) => ({ ...show, [key]: false }));
    setPartyErrors((errors) => ({
      ...errors,
      [key]: {},
    }));
  };

  const validatePartyForm = (form: PartyFormState, required: boolean) => {
    const needsValidation = required || hasPartyDetails(form);
    if (!needsValidation) return {};

    const errors: Record<string, boolean> = {};
    if (!form.firstName.trim()) errors.firstName = true;
    if (!form.lastName.trim()) errors.lastName = true;
    return errors;
  };

  const handleSaveParties = () => {
    const nextErrors = emptyPartyErrorState();
    let hasErrors = false;

    if (representationSide === 'seller' || representationSide === 'both') {
      nextErrors.seller1 = validatePartyForm(partyForms.seller1, true);
      nextErrors.seller2 = validatePartyForm(partyForms.seller2, false);
      hasErrors = hasErrors || Object.keys(nextErrors.seller1).length > 0 || Object.keys(nextErrors.seller2).length > 0;
    }

    if (representationSide === 'buyer' || representationSide === 'both') {
      nextErrors.buyer1 = validatePartyForm(partyForms.buyer1, true);
      nextErrors.buyer2 = validatePartyForm(partyForms.buyer2, false);
      hasErrors = hasErrors || Object.keys(nextErrors.buyer1).length > 0 || Object.keys(nextErrors.buyer2).length > 0;
    }

    if (hasErrors) {
      setPartyErrors(nextErrors);
      toast.error('Each added seller or buyer needs a first and last name.');
      return;
    }

    setStep(6);
  };

  const handleSaveAgent = async () => {
    const errors: Record<string, boolean> = {};

    if (!agentForm.firstName) errors.firstName = true;
    if (!agentForm.lastName) errors.lastName = true;
    if (Object.keys(errors).length) {
      setAgentErrors(errors);
      return;
    }

    const contacts = [];
    if (agentForm.firstName) {
      contacts.push({
        first_name: agentForm.firstName, last_name: agentForm.lastName,
        email: agentForm.email || undefined, phone: agentForm.phone || undefined,
        company: agentForm.company || undefined, role: agentForm.role,
        mls_id: agentForm.mlsId || undefined, mls: agentForm.mls || undefined,
        commission: agentForm.commission || undefined, commission_type: agentForm.commissionType || undefined,
      });
    }
    const includedPartyKeys: PartyFormKey[] = [];
    if (representationSide === 'seller' || representationSide === 'both') includedPartyKeys.push('seller1', 'seller2');
    if (representationSide === 'buyer' || representationSide === 'both') includedPartyKeys.push('buyer1', 'buyer2');

    includedPartyKeys.forEach((key) => {
      const form = partyForms[key];
      const shouldInclude = key.endsWith('1') || hasPartyDetails(form);
      if (!shouldInclude || !form.firstName.trim() || !form.lastName.trim()) return;
      contacts.push({
        contact_id: form.contactId,
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        company: form.company || undefined,
        role: form.role,
      });
    });

    try {
      const newDeal = await createDealMutation.mutateAsync({
        property_type: propertyType, address: address || 'TBD',
        city: city || '', state: state || '', zip: zip || '',
        representation_side: representationSide || 'seller',
        primary_agent: agentForm.firstName ? `${agentForm.firstName} ${agentForm.lastName}` : 'Unassigned',
        contacts,
      });
      setCreatedDealId(newDeal.id);
      setStep(7);
      toast.success('Deal created successfully!');
    } catch (err) {
      console.error('Failed to create deal:', err);
      toast.error('Failed to create deal. Please try again.');
    }
  };

  // Filter agents from contacts
  const agentContacts = allContacts.filter((c) => {
    const role = (c.role || '').toLowerCase();
    const matchesRole = role.includes('agent') || role.includes('broker') || c.mls_id || c.mls;
    if (!agentSearch) return matchesRole;
    const term = agentSearch.toLowerCase();
    return matchesRole && (
      c.first_name.toLowerCase().includes(term) ||
      c.last_name.toLowerCase().includes(term) ||
      (c.company || '').toLowerCase().includes(term)
    );
  });

  const stepSummary = (s: number) => {
    switch (s) {
      case 1: return propertyType;
      case 2: return address === 'TBD' ? 'TBD' : `${address}${city ? `, ${city}` : ''}${state ? `, ${state}` : ''} ${zip}`.trim();
      case 3: return representationSide ? representationSide.charAt(0).toUpperCase() + representationSide.slice(1) : '';
      case 4: return agentForm.firstName ? `${agentForm.firstName} ${agentForm.lastName}` : '';
      case 5: {
        const sellerNames = [partyForms.seller1, partyForms.seller2]
          .filter((form) => hasPartyDetails(form) && form.firstName.trim())
          .map((form) => `${form.firstName} ${form.lastName}`.trim());
        const buyerNames = [partyForms.buyer1, partyForms.buyer2]
          .filter((form) => hasPartyDetails(form) && form.firstName.trim())
          .map((form) => `${form.firstName} ${form.lastName}`.trim());

        if (representationSide === 'seller') return sellerNames.join(', ');
        if (representationSide === 'buyer') return buyerNames.join(', ');

        const parts = [];
        if (sellerNames.length) parts.push(`Sellers: ${sellerNames.join(', ')}`);
        if (buyerNames.length) parts.push(`Buyers: ${buyerNames.join(', ')}`);
        return parts.join(' • ');
      }
      case 6: return 'Completed';
      default: return '';
    }
  };

  const renderPartySection = ({
    keyName,
    title,
    description,
  }: {
    keyName: PartyFormKey;
    title: string;
    description: string;
  }) => {
    const form = partyForms[keyName];
    const errors = partyErrors[keyName];
    const searchTerm = partySearch[keyName];
    const shouldShowResults = showPartyResults[keyName] && searchTerm.length >= 1;
    const filteredContacts = allContacts
      .filter((c) => {
        const term = searchTerm.toLowerCase();
        return c.first_name.toLowerCase().includes(term)
          || c.last_name.toLowerCase().includes(term)
          || (c.email || '').toLowerCase().includes(term);
      })
      .slice(0, 8);

    return (
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts to auto-fill..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setPartySearch((search) => ({ ...search, [keyName]: e.target.value }))}
              onFocus={() => setShowPartyResults((show) => ({ ...show, [keyName]: true }))}
            />
            {shouldShowResults && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-48 overflow-auto">
                {filteredContacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectPartyContact(keyName, c)}
                    className="w-full text-left px-4 py-2.5 hover:bg-muted flex items-center gap-3 text-sm transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                      {c.first_name[0]}{c.last_name[0]}
                    </div>
                    <div>
                      <span className="text-foreground">{c.first_name} {c.last_name}</span>
                      {c.email && <span className="text-xs text-muted-foreground ml-2">• {c.email}</span>}
                    </div>
                  </button>
                ))}
                {filteredContacts.length === 0 && (
                  <p className="text-sm text-muted-foreground py-3 text-center">No contacts found</p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Role</Label>
              <Input
                value={form.role}
                onChange={(e) => updatePartyField(keyName, 'role', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">First Name <span className="text-destructive">*</span></Label>
              <Input
                value={form.firstName}
                onChange={(e) => updatePartyField(keyName, 'firstName', e.target.value)}
                className={cn('mt-1', errors.firstName && 'border-destructive')}
              />
              {errors.firstName && <p className="text-xs text-destructive mt-1">Required</p>}
            </div>
            <div>
              <Label className="text-xs">Last Name <span className="text-destructive">*</span></Label>
              <Input
                value={form.lastName}
                onChange={(e) => updatePartyField(keyName, 'lastName', e.target.value)}
                className={cn('mt-1', errors.lastName && 'border-destructive')}
              />
              {errors.lastName && <p className="text-xs text-destructive mt-1">Required</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updatePartyField(keyName, 'email', e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input
                value={form.phone}
                onChange={(e) => updatePartyField(keyName, 'phone', e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Company / Trust</Label>
            <Input
              value={form.company}
              onChange={(e) => updatePartyField(keyName, 'company', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    );
  };

  const CompletedStep = ({ stepNum, title }: { stepNum: number; title: string }) => (
    <div
      ref={(el) => { stepRefs.current[stepNum - 1] = el; }}
      onClick={() => goToStep(stepNum)}
      className="cursor-pointer group"
    >
      <div className="flex items-center gap-3 px-4 py-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors">
        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground">{title}</div>
          <div className="text-sm font-medium text-foreground truncate">{stepSummary(stepNum)}</div>
        </div>
        <ChevronUp className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-6 sticky top-0 bg-background z-20">
        <h1 className="text-lg font-semibold text-foreground">Create New Deal</h1>
        <div className="flex-1" />
        {step > 1 && step < 7 && (
          <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="mr-2 text-muted-foreground">
            <ChevronUp className="w-4 h-4 mr-1" /> Back
          </Button>
        )}
        <button onClick={handleClose} className="p-2 rounded-md hover:bg-muted transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${((step) / 7) * 100}%` }} />
      </div>

      {/* Scrolling content */}
      <div ref={containerRef} className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto py-10 px-6 space-y-6">

          {/* Completed steps shown as compact summaries */}
          {step > 1 && <CompletedStep stepNum={1} title="Property Type" />}
          {step > 2 && <CompletedStep stepNum={2} title="Property Address" />}
          {step > 3 && <CompletedStep stepNum={3} title="Representation Side" />}
          {step > 4 && <CompletedStep stepNum={4} title={agentTitle} />}
          {step > 5 && <CompletedStep stepNum={5} title={clientStepTitle} />}
          {step > 6 && <CompletedStep stepNum={6} title={agentDetailsTitle} />}

          {/* Active step */}
          <motion.div
            key={step}
            ref={(el) => { stepRefs.current[step - 1] = el; }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Step 1: Property Type */}
            {step === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground">What type of property is this?</h2>
                <p className="text-sm text-muted-foreground mb-6">Select the property type to get started.</p>
                <div className="space-y-1">
                  {PROPERTY_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() => handlePropertyType(type)}
                      className={cn(
                        'w-full text-left px-4 py-3 rounded-md border text-sm transition-colors flex items-center justify-between group',
                        propertyType === type
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border hover:border-primary/30 text-foreground'
                      )}
                    >
                      {type}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground">Property Address</h2>
                <p className="text-sm text-muted-foreground mb-6">Enter the MLS# or property address.</p>
                <div className="relative" ref={addressDropdownRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {addressLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
                  <Input
                    placeholder="Start typing an address..."
                    className="pl-9"
                    value={addressSearch}
                    onChange={(e) => { setAddressSearch(e.target.value); setShowAddresses(true); }}
                    onFocus={() => addressSearch.length >= 3 && setShowAddresses(true)}
                  />
                  {showAddresses && addressSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-64 overflow-auto">
                      {addressSuggestions.map((addr, i) => (
                        <button
                          key={`${addr.label}-${i}`}
                          onClick={() => handleAddress(addr)}
                          className="w-full text-left px-4 py-3 hover:bg-muted flex items-center gap-3 text-sm transition-colors"
                        >
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <div className="text-foreground">{addr.address}</div>
                            <div className="text-xs text-muted-foreground">{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.zip}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setAddress('TBD'); setCity(''); setState(''); setZip(''); setStep(3); }}>
                    Skip
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Representation Side */}
            {step === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground">Which side do you represent?</h2>
                <p className="text-sm text-muted-foreground mb-6">Select your representation in this deal.</p>
                <div className="space-y-2">
                  {([['buyer', 'Buyer', User], ['seller', 'Seller', User], ['both', 'Both', Users]] as const).map(([value, label, Icon]) => (
                    <button
                      key={value}
                      onClick={() => handleRepSide(value)}
                      className={cn(
                        'w-full text-left px-4 py-4 rounded-md border text-sm transition-colors flex items-center gap-3',
                        representationSide === value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30'
                      )}
                    >
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-foreground font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Agent Search - uses real contacts */}
            {step === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground">{agentTitle}</h2>
                <p className="text-sm text-muted-foreground mb-6">Search for agents from your contacts or enter manually.</p>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search agents by name or company" className="pl-9" value={agentSearch} onChange={(e) => setAgentSearch(e.target.value)} />
                </div>
                <div className="space-y-1 max-h-64 overflow-auto">
                  {agentContacts.length > 0 ? agentContacts.map((c) => (
                    <button key={c.id} onClick={() => handleSelectAgent(c)} className="w-full text-left px-4 py-3 hover:bg-muted/50 rounded-md flex items-center gap-3 text-sm transition-colors border border-border">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">{c.first_name[0]}{c.last_name[0]}</div>
                      <div className="flex-1">
                        <span className="text-foreground">{c.first_name} {c.last_name}</span>
                        {c.company && <span className="text-xs text-muted-foreground ml-2">• {c.company}</span>}
                      </div>
                    </button>
                  )) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">No agents found in your contacts.</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => { setAgentForm((f) => ({ ...f, firstName: '', lastName: '' })); setStep(5); }}>
                    Enter agent manually instead
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Seller Info */}
            {step === 5 && (
              <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground">{clientStepTitle}</h2>
                <p className="text-sm text-muted-foreground mb-6">{clientStepDescription}</p>
                <div className="space-y-4">
                  {(representationSide === 'seller' || representationSide === 'both') && (
                    <>
                      {renderPartySection({
                        keyName: 'seller1',
                        title: 'Seller 1',
                        description: 'Primary seller contact on this deal.',
                      })}
                      {showSecondSeller ? (
                        <div className="space-y-3">
                          {renderPartySection({
                            keyName: 'seller2',
                            title: 'Seller 2',
                            description: 'Optional second seller for trusts, spouses, or co-owners.',
                          })}
                          <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => {
                            setShowSecondSeller(false);
                            setPartyForms((forms) => ({ ...forms, seller2: createPartyForm('Seller 2') }));
                            setPartyErrors((errors) => ({ ...errors, seller2: {} }));
                            setPartySearch((search) => ({ ...search, seller2: '' }));
                            setShowPartyResults((show) => ({ ...show, seller2: false }));
                          }}>
                            Remove second seller
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setShowSecondSeller(true)}>
                          Add second seller
                        </Button>
                      )}
                    </>
                  )}

                  {(representationSide === 'buyer' || representationSide === 'both') && (
                    <>
                      {renderPartySection({
                        keyName: 'buyer1',
                        title: 'Buyer 1',
                        description: 'Primary buyer contact on this deal.',
                      })}
                      {showSecondBuyer ? (
                        <div className="space-y-3">
                          {renderPartySection({
                            keyName: 'buyer2',
                            title: 'Buyer 2',
                            description: 'Optional second buyer for spouses, co-buyers, or entities.',
                          })}
                          <Button variant="ghost" size="sm" className="w-full sm:w-auto" onClick={() => {
                            setShowSecondBuyer(false);
                            setPartyForms((forms) => ({ ...forms, buyer2: createPartyForm('Buyer 2') }));
                            setPartyErrors((errors) => ({ ...errors, buyer2: {} }));
                            setPartySearch((search) => ({ ...search, buyer2: '' }));
                            setShowPartyResults((show) => ({ ...show, buyer2: false }));
                          }}>
                            Remove second buyer
                          </Button>
                        </div>
                      ) : (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setShowSecondBuyer(true)}>
                          Add second buyer
                        </Button>
                      )}
                    </>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
                    <Button onClick={handleSaveParties}>Continue</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Agent Details */}
            {step === 6 && (
              <div>
                <h2 className="text-xl font-semibold mb-1 text-foreground">{agentDetailsTitle}</h2>
                <p className="text-sm text-muted-foreground mb-6">Complete the agent information.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label className="text-xs">Role</Label><Input value={agentForm.role} onChange={(e) => setAgentForm((f) => ({ ...f, role: e.target.value }))} className="mt-1" /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">First Name <span className="text-destructive">*</span></Label>
                      <Input value={agentForm.firstName} onChange={(e) => { setAgentForm((f) => ({ ...f, firstName: e.target.value })); setAgentErrors((e2) => ({ ...e2, firstName: false })); }} className={cn('mt-1', agentErrors.firstName && 'border-destructive')} />
                    </div>
                    <div>
                      <Label className="text-xs">Last Name <span className="text-destructive">*</span></Label>
                      <Input value={agentForm.lastName} onChange={(e) => { setAgentForm((f) => ({ ...f, lastName: e.target.value })); setAgentErrors((e2) => ({ ...e2, lastName: false })); }} className={cn('mt-1', agentErrors.lastName && 'border-destructive')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label className="text-xs">Email</Label><Input type="email" value={agentForm.email} onChange={(e) => setAgentForm((f) => ({ ...f, email: e.target.value }))} className="mt-1" /></div>
                    <div><Label className="text-xs">Phone</Label><Input value={agentForm.phone} onChange={(e) => setAgentForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1" /></div>
                  </div>
                  <div><Label className="text-xs">Company / Trust</Label><Input value={agentForm.company} onChange={(e) => setAgentForm((f) => ({ ...f, company: e.target.value }))} className="mt-1" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label className="text-xs">MLS ID</Label><Input value={agentForm.mlsId} onChange={(e) => setAgentForm((f) => ({ ...f, mlsId: e.target.value }))} className="mt-1" /></div>
                    <div>
                      <Label className="text-xs">MLS</Label>
                      <Input value={agentForm.mls} onChange={(e) => setAgentForm((f) => ({ ...f, mls: e.target.value }))} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Commission</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={agentForm.commission} onChange={(e) => setAgentForm((f) => ({ ...f, commission: e.target.value }))} className="flex-1" placeholder="0" />
                      <div className="flex border rounded-md overflow-hidden">
                        <button onClick={() => setAgentForm((f) => ({ ...f, commissionType: 'percentage' }))} className={cn('px-3 py-2 text-xs font-medium transition-colors', agentForm.commissionType === 'percentage' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted')}>%</button>
                        <button onClick={() => setAgentForm((f) => ({ ...f, commissionType: 'dollars' }))} className={cn('px-3 py-2 text-xs font-medium transition-colors', agentForm.commissionType === 'dollars' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted')}>$</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => setStep(5)}>Back</Button>
                    <Button onClick={handleSaveAgent} disabled={createDealMutation.isPending}>
                      {createDealMutation.isPending ? 'Creating...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Success */}
            {step === 7 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">Congratulations!</h2>
                <p className="text-muted-foreground mb-8">Your deal has been created successfully.</p>
                <Button onClick={() => navigate(`/transactions/${createdDealId}`)}>View Deal</Button>
              </div>
            )}
          </motion.div>

          {/* Bottom spacer for scroll comfort */}
          <div className="h-32" />
        </div>
      </div>
    </div>
  );
}
