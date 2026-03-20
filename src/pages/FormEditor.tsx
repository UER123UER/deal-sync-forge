import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, AlertTriangle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeal, useUpdateDeal } from '@/hooks/useDeals';
import { toast } from 'sonner';

export default function FormEditor() {
  const { id, formId } = useParams<{ id: string; formId: string }>();
  const navigate = useNavigate();
  const { data: deal, isLoading } = useDeal(id);
  const updateDeal = useUpdateDeal();

  const contacts = (deal?.deal_contacts || []).map((dc) => ({
    role: dc.role || '',
    firstName: dc.contact?.first_name || '',
    lastName: dc.contact?.last_name || '',
    company: dc.contact?.company || '',
    commission: dc.contact?.commission || '',
  }));

  const checklistItem = (deal?.checklist_items || []).find((ci) => ci.id === formId);
  const seller = contacts.find((c) => c.role === 'Seller');
  const agent = contacts.find((c) => c.role.includes('Agent'));

  const [fields, setFields] = useState({
    sellerName: '',
    brokerName: '',
    brokerCompany: '',
    propertyAddress: '',
    listingStartDate: '',
    listingExpiration: '',
    listPrice: '',
    commissionRate: '',
    mlsNumber: '',
  });
  const [initialized, setInitialized] = useState(false);

  // Properly initialize fields when deal data loads
  useEffect(() => {
    if (deal && !initialized) {
      const s = contacts.find((c) => c.role === 'Seller');
      const a = contacts.find((c) => c.role.includes('Agent'));
      setFields({
        sellerName: s ? `${s.firstName} ${s.lastName}` : '',
        brokerName: a ? `${a.firstName} ${a.lastName}` : '',
        brokerCompany: a?.company || '',
        propertyAddress: `${deal.address}, ${deal.city}, ${deal.state} ${deal.zip}`,
        listingStartDate: deal.listing_start_date || '',
        listingExpiration: deal.listing_expiration || '',
        listPrice: deal.price || '',
        commissionRate: a?.commission || '',
        mlsNumber: deal.mls_number || '',
      });
      setInitialized(true);
    }
  }, [deal, initialized]);

  const updateField = (key: string, value: string) => {
    setFields((f) => ({ ...f, [key]: value }));
  };

  const handleClose = () => navigate(`/transactions/${id}`);

  const handleSave = async () => {
    if (!deal) return;
    try {
      await updateDeal.mutateAsync({
        id: deal.id,
        price: fields.listPrice || undefined,
        mls_number: fields.mlsNumber || undefined,
        listing_start_date: fields.listingStartDate || undefined,
        listing_expiration: fields.listingExpiration || undefined,
      });
      toast.success('Form saved successfully');
    } catch {
      toast.error('Failed to save form');
    }
  };

  const InlineField = ({ fieldKey, width = 200 }: { fieldKey: keyof typeof fields; width?: number }) => (
    <input
      value={fields[fieldKey]}
      onChange={(e) => updateField(fieldKey, e.target.value)}
      className="border-b-2 border-primary/30 bg-primary/5 px-1 py-0.5 text-primary outline-none focus:border-primary transition-colors"
      style={{ width, fontFamily: 'inherit', fontSize: 'inherit' }}
    />
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-muted/30">
      {/* Header */}
      <div className="h-14 bg-background border-b flex items-center px-6 flex-shrink-0">
        <h1 className="text-sm font-semibold text-foreground truncate flex-1">
          {checklistItem?.name || 'Document'}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => toast.info('Issue reported. Thank you!')}>
            <AlertTriangle className="w-3.5 h-3.5" /> Report an Issue
          </Button>
          <Button size="sm" className="text-xs gap-1.5" onClick={handleSave} disabled={updateDeal.isPending}>
            <Save className="w-3.5 h-3.5" /> {updateDeal.isPending ? 'Saving...' : 'Save'}
          </Button>
          <button onClick={handleClose} className="p-2 rounded-md hover:bg-muted transition-colors ml-2">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Document Body */}
      <div className="flex-1 overflow-auto py-8">
        <div className="max-w-[816px] mx-auto bg-background shadow-sm border rounded px-16 py-12" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          <h2 className="text-center text-lg font-bold mb-1 tracking-wide" style={{ fontFamily: 'inherit' }}>
            EXCLUSIVE RIGHT OF SALE LISTING AGREEMENT
          </h2>
          <p className="text-center text-xs text-muted-foreground mb-8" style={{ fontFamily: 'sans-serif' }}>
            THIS IS A LEGALLY BINDING CONTRACT. IF NOT UNDERSTOOD, SEEK LEGAL ADVICE.
          </p>

          <div className="space-y-6 text-sm leading-relaxed" style={{ fontFamily: 'inherit' }}>
            <p>
              <strong>1. PARTIES.</strong> This Exclusive Right of Sale Listing Agreement ("Agreement") is entered into between{' '}
              <InlineField fieldKey="sellerName" width={180} /> ("Seller") and{' '}
              <InlineField fieldKey="brokerName" width={180} /> of{' '}
              <InlineField fieldKey="brokerCompany" width={180} /> ("Broker").
            </p>

            <p>
              <strong>2. PROPERTY.</strong> Seller hereby lists with Broker the property located at{' '}
              <InlineField fieldKey="propertyAddress" width={320} /> ("Property"), including all improvements thereon and all rights appurtenant thereto.
            </p>

            <p>
              <strong>3. LISTING PERIOD.</strong> This Agreement shall commence on{' '}
              <InlineField fieldKey="listingStartDate" width={120} /> and shall expire on{' '}
              <InlineField fieldKey="listingExpiration" width={120} /> ("Listing Period"), unless renewed or extended in writing.
            </p>

            <p>
              <strong>4. LISTING PRICE.</strong> Seller authorizes Broker to offer the Property for sale at a listing price of{' '}
              <InlineField fieldKey="listPrice" width={120} /> or at such other price as Seller may subsequently authorize in writing.
            </p>

            <p>
              <strong>5. BROKER'S COMPENSATION.</strong> Seller agrees to pay Broker a commission of{' '}
              <InlineField fieldKey="commissionRate" width={60} />% of the gross sales price as compensation for services rendered. This commission shall be earned upon the earlier of: (a) execution of a binding contract of sale; (b) procurement of a ready, willing, and able buyer; or (c) closing of the transaction.
            </p>

            <p>
              <strong>6. MLS AUTHORIZATION.</strong> Seller authorizes Broker to submit this listing to the Multiple Listing Service (MLS#:{' '}
              <InlineField fieldKey="mlsNumber" width={120} />) and to provide information about the Property to other brokers and prospective buyers.
            </p>

            <p>
              <strong>7. SELLER'S REPRESENTATIONS.</strong> Seller represents that Seller has full authority to execute this Agreement and to sell the Property. Seller agrees to provide all required disclosures in compliance with applicable laws and regulations.
            </p>

            <p>
              <strong>8. BROKER'S DUTIES.</strong> Broker agrees to use reasonable efforts to market the Property, including but not limited to: listing the Property on the MLS, conducting showings, and negotiating offers on behalf of Seller.
            </p>

            <div className="mt-12 pt-8 border-t space-y-8">
              <div className="flex gap-8">
                <div className="flex-1">
                  <div className="border-b border-foreground/30 pb-1 mb-1">
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Seller Signature</span>
                  </div>
                  <div className="h-8" />
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Date: _______________</div>
                </div>
                <div className="flex-1">
                  <div className="border-b border-foreground/30 pb-1 mb-1">
                    <span className="text-xs text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Broker Signature</span>
                  </div>
                  <div className="h-8" />
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: 'sans-serif' }}>Date: _______________</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
