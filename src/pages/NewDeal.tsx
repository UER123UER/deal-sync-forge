import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, Check, ChevronRight, User, Users, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateDeal } from '@/hooks/useDeals';
import { useAddressAutocomplete } from '@/hooks/useAddressAutocomplete';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const PROPERTY_TYPES = [
  'Sale-Condo', 'Sale-Single Family Home', 'Sale-Land', 'Sale-New Construction',
  'Sale-Commercial', 'Lease-Commercial', 'Lease-Condo', 'Lease-Single Family Home', 'Referral',
];



const MOCK_AGENTS = [
  { id: 'a1', teamName: 'Premier Realty Group', location: 'Orlando, FL', agents: [
    { id: 'ag1', firstName: 'Michael', lastName: 'Rivera', avatar: 'MR' },
    { id: 'ag2', firstName: 'Lisa', lastName: 'Chen', avatar: 'LC' },
  ]},
  { id: 'a2', teamName: 'Coastal Properties', location: 'Miami, FL', agents: [
    { id: 'ag3', firstName: 'David', lastName: 'Park', avatar: 'DP' },
  ]},
];

export default function NewDeal() {
  const navigate = useNavigate();
  const createDealMutation = useCreateDeal();
  const { suggestions: addressSuggestions, isLoading: addressLoading } = useAddressAutocomplete(addressSearch);

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
  const [createdDealId, setCreatedDealId] = useState<string | null>(null);

  const [sellerForm, setSellerForm] = useState({ role: 'Seller', firstName: '', lastName: '', email: '', phone: '', company: '', currentAddress: '' });
  const [agentForm, setAgentForm] = useState({ role: 'Seller Agent', firstName: '', lastName: '', email: '', phone: '', company: '', mlsId: '', mls: '', commission: '', commissionType: 'percentage' as 'percentage' | 'dollars' });
  const [agentErrors, setAgentErrors] = useState<Record<string, boolean>>({});

  const handleClose = () => navigate('/transactions');

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
    setStep(4);
  };

  const handleSelectAgent = (agent: { firstName: string; lastName: string }) => {
    setAgentForm((f) => ({ ...f, firstName: agent.firstName, lastName: agent.lastName }));
    setStep(5);
  };

  const handleSaveSeller = () => setStep(6);

  const handleSaveAgent = async () => {
    const errors: Record<string, boolean> = {};
    if (!agentForm.mls) errors.mls = true;
    if (!agentForm.firstName) errors.firstName = true;
    if (!agentForm.lastName) errors.lastName = true;
    if (Object.keys(errors).length) {
      setAgentErrors(errors);
      return;
    }

    const contacts = [];
    if (agentForm.firstName) {
      contacts.push({
        first_name: agentForm.firstName,
        last_name: agentForm.lastName,
        email: agentForm.email || undefined,
        phone: agentForm.phone || undefined,
        company: agentForm.company || undefined,
        role: agentForm.role,
        mls_id: agentForm.mlsId || undefined,
        mls: agentForm.mls || undefined,
        commission: agentForm.commission || undefined,
        commission_type: agentForm.commissionType || undefined,
      });
    }
    if (sellerForm.firstName) {
      contacts.push({
        first_name: sellerForm.firstName,
        last_name: sellerForm.lastName,
        email: sellerForm.email || undefined,
        phone: sellerForm.phone || undefined,
        company: sellerForm.company || undefined,
        role: sellerForm.role,
        current_address: sellerForm.currentAddress || undefined,
      });
    }

    try {
      const newDeal = await createDealMutation.mutateAsync({
        property_type: propertyType,
        address: address || 'TBD',
        city: city || '',
        state: state || '',
        zip: zip || '',
        representation_side: representationSide || 'seller',
        primary_agent: agentForm.firstName ? `${agentForm.firstName} ${agentForm.lastName}` : 'Unassigned',
        contacts,
      });
      setCreatedDealId(newDeal.id);
      setStep(7);
    } catch (err) {
      console.error('Failed to create deal:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 border-b flex items-center px-6">
        <h1 className="text-lg font-semibold text-foreground">Create New Deal</h1>
        <div className="flex-1" />
        <button onClick={handleClose} className="p-2 rounded-md hover:bg-muted transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto py-10 px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    {addressLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
                    <Input
                      placeholder="Start typing an address..."
                      className="pl-9"
                      value={addressSearch}
                      onChange={(e) => {
                        setAddressSearch(e.target.value);
                        setShowAddresses(true);
                      }}
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

              {/* Step 4: Agent Search */}
              {step === 4 && (
                <div>
                  <h2 className="text-xl font-semibold mb-1 text-foreground">Seller's Agent</h2>
                  <p className="text-sm text-muted-foreground mb-6">Search for teams or agents.</p>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search for teams or agents"
                      className="pl-9"
                      value={agentSearch}
                      onChange={(e) => setAgentSearch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    {MOCK_AGENTS.map((team) => (
                      <div key={team.id} className="border rounded-md overflow-hidden">
                        <div className="px-4 py-2.5 bg-muted/50 border-b">
                          <div className="text-sm font-medium text-foreground">{team.teamName}</div>
                          <div className="text-xs text-muted-foreground">{team.location}</div>
                        </div>
                        {team.agents.map((agent) => (
                          <button
                            key={agent.id}
                            onClick={() => handleSelectAgent(agent)}
                            className="w-full text-left px-4 py-3 hover:bg-muted/50 flex items-center gap-3 text-sm transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                              {agent.avatar}
                            </div>
                            <span className="text-foreground">{agent.firstName} {agent.lastName}</span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 5: Seller Info */}
              {step === 5 && (
                <div>
                  <h2 className="text-xl font-semibold mb-1 text-foreground">Seller Legal Name</h2>
                  <p className="text-sm text-muted-foreground mb-6">Enter the seller's name or add a new seller.</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Role</Label>
                        <Input value={sellerForm.role} onChange={(e) => setSellerForm((f) => ({ ...f, role: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">First Name</Label>
                        <Input value={sellerForm.firstName} onChange={(e) => setSellerForm((f) => ({ ...f, firstName: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Last Name</Label>
                        <Input value={sellerForm.lastName} onChange={(e) => setSellerForm((f) => ({ ...f, lastName: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input type="email" value={sellerForm.email} onChange={(e) => setSellerForm((f) => ({ ...f, email: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Phone</Label>
                        <Input value={sellerForm.phone} onChange={(e) => setSellerForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Company / Trust</Label>
                      <Input value={sellerForm.company} onChange={(e) => setSellerForm((f) => ({ ...f, company: e.target.value }))} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Current Address</Label>
                      <Input value={sellerForm.currentAddress} onChange={(e) => setSellerForm((f) => ({ ...f, currentAddress: e.target.value }))} className="mt-1" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" onClick={() => setStep(4)}>Back</Button>
                      <Button onClick={handleSaveSeller}>Continue</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 6: Agent Details */}
              {step === 6 && (
                <div>
                  <h2 className="text-xl font-semibold mb-1 text-foreground">Seller Agent Details</h2>
                  <p className="text-sm text-muted-foreground mb-6">Complete the agent information.</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Role</Label>
                        <Input value={agentForm.role} onChange={(e) => setAgentForm((f) => ({ ...f, role: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">First Name <span className="text-destructive">*</span></Label>
                        <Input value={agentForm.firstName} onChange={(e) => { setAgentForm((f) => ({ ...f, firstName: e.target.value })); setAgentErrors((e2) => ({ ...e2, firstName: false })); }} className={cn('mt-1', agentErrors.firstName && 'border-destructive')} />
                      </div>
                      <div>
                        <Label className="text-xs">Last Name <span className="text-destructive">*</span></Label>
                        <Input value={agentForm.lastName} onChange={(e) => { setAgentForm((f) => ({ ...f, lastName: e.target.value })); setAgentErrors((e2) => ({ ...e2, lastName: false })); }} className={cn('mt-1', agentErrors.lastName && 'border-destructive')} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Email</Label>
                        <Input type="email" value={agentForm.email} onChange={(e) => setAgentForm((f) => ({ ...f, email: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Phone</Label>
                        <Input value={agentForm.phone} onChange={(e) => setAgentForm((f) => ({ ...f, phone: e.target.value }))} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Company / Trust</Label>
                      <Input value={agentForm.company} onChange={(e) => setAgentForm((f) => ({ ...f, company: e.target.value }))} className="mt-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">MLS ID</Label>
                        <Input value={agentForm.mlsId} onChange={(e) => setAgentForm((f) => ({ ...f, mlsId: e.target.value }))} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">MLS <span className="text-destructive">*</span></Label>
                        <Input value={agentForm.mls} onChange={(e) => { setAgentForm((f) => ({ ...f, mls: e.target.value })); setAgentErrors((e2) => ({ ...e2, mls: false })); }} className={cn('mt-1', agentErrors.mls && 'border-destructive')} />
                        {agentErrors.mls && <p className="text-xs text-destructive mt-1">MLS is required</p>}
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Commission</Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={agentForm.commission} onChange={(e) => setAgentForm((f) => ({ ...f, commission: e.target.value }))} className="flex-1" placeholder="0" />
                        <div className="flex border rounded-md overflow-hidden">
                          <button
                            onClick={() => setAgentForm((f) => ({ ...f, commissionType: 'percentage' }))}
                            className={cn('px-3 py-2 text-xs font-medium transition-colors', agentForm.commissionType === 'percentage' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted')}
                          >%</button>
                          <button
                            onClick={() => setAgentForm((f) => ({ ...f, commissionType: 'dollars' }))}
                            className={cn('px-3 py-2 text-xs font-medium transition-colors', agentForm.commissionType === 'dollars' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-muted')}
                          >$</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" onClick={() => setStep(5)}>Cancel</Button>
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
                  <Button onClick={() => navigate(`/transactions/${createdDealId}`)}>
                    View Deal
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
