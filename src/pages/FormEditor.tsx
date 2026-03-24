import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Save, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeal, useUpdateDeal } from '@/hooks/useDeals';
import { useUpdateContact } from '@/hooks/useContacts';
import { SignaturePanel } from '@/components/deal/SignaturePanel';
import { ListingAgreementDocument, ListingAgreementFields, DEFAULT_FIELDS } from '@/components/deal/ListingAgreementDocument';
import { toast } from 'sonner';

export default function FormEditor() {
  const { id, formId } = useParams<{ id: string; formId: string }>();
  const navigate = useNavigate();
  const { data: deal, isLoading } = useDeal(id);
  const updateDeal = useUpdateDeal();
  const updateContact = useUpdateContact();
  const [signatureOpen, setSignatureOpen] = useState(false);

  const dealContacts = (deal?.deal_contacts || []).map((dc) => ({
    id: dc.contact?.id || dc.contact_id,
    role: dc.role || '',
    firstName: dc.contact?.first_name || '',
    lastName: dc.contact?.last_name || '',
    email: dc.contact?.email || '',
    phone: dc.contact?.phone || '',
    company: dc.contact?.company || '',
    commission: dc.contact?.commission || '',
  }));

  const checklistItem = (deal?.checklist_items || []).find((ci) => ci.id === formId);

  const [fields, setFields] = useState<ListingAgreementFields>({ ...DEFAULT_FIELDS });
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (deal && !initialized) {
      const s = dealContacts.find((c) => c.role === 'Seller');
      const a = dealContacts.find((c) => c.role.includes('Agent') || c.role.includes('Broker'));
      setFields({
        ...DEFAULT_FIELDS,
        sellerName: s ? `${s.firstName} ${s.lastName}` : '',
        brokerName: a ? `${a.firstName} ${a.lastName}` : '',
        brokerCompany: a?.company || '',
        propertyAddress: `${deal.address}, ${deal.city}, ${deal.state} ${deal.zip}`,
        listingStartDate: deal.listing_start_date || '',
        listingExpiration: deal.listing_expiration || '',
        listPrice: deal.price || '',
        commissionPercent: a?.commission || '',
        mlsNumber: deal.mls_number || '',
        sellerPhone: s?.phone || '',
        sellerEmail: s?.email || '',
        brokerPhone: a?.phone || '',
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
      const addressParts = fields.propertyAddress.split(',').map((s) => s.trim());
      const streetAddress = addressParts[0] || deal.address;
      const city = addressParts[1] || deal.city;
      const stateZip = (addressParts[2] || `${deal.state} ${deal.zip}`).trim().split(/\s+/);
      const state = stateZip[0] || deal.state;
      const zip = stateZip[1] || deal.zip;

      await updateDeal.mutateAsync({
        id: deal.id,
        price: fields.listPrice || undefined,
        mls_number: fields.mlsNumber || undefined,
        listing_start_date: fields.listingStartDate || undefined,
        listing_expiration: fields.listingExpiration || undefined,
        address: streetAddress,
        city,
        state,
        zip,
      } as any);

      const sellerDc = (deal.deal_contacts || []).find((dc) => dc.role === 'Seller');
      if (sellerDc?.contact?.id && fields.sellerName) {
        const nameParts = fields.sellerName.trim().split(/\s+/);
        await updateContact.mutateAsync({
          id: sellerDc.contact.id,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
        });
      }

      const agentDc = (deal.deal_contacts || []).find((dc) => dc.role?.includes('Agent') || dc.role?.includes('Broker'));
      if (agentDc?.contact?.id) {
        const nameParts = fields.brokerName.trim().split(/\s+/);
        await updateContact.mutateAsync({
          id: agentDc.contact.id,
          first_name: nameParts[0] || '',
          last_name: nameParts.slice(1).join(' ') || '',
          company: fields.brokerCompany || undefined,
          commission: fields.commissionPercent || undefined,
        } as any);
      }

      toast.success('Form saved successfully');
    } catch {
      toast.error('Failed to save form');
    }
  };

  const InlineField = ({ fieldKey, width = 200 }: { fieldKey: keyof ListingAgreementFields; width?: number }) => {
    if (fieldKey === 'additionalTerms') {
      return (
        <textarea
          value={fields[fieldKey]}
          onChange={(e) => updateField(fieldKey, e.target.value)}
          className="w-full border-b-2 border-primary/30 bg-primary/5 px-2 py-1 text-primary outline-none focus:border-primary transition-colors resize-none"
          rows={4}
          style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
        />
      );
    }
    return (
      <input
        value={fields[fieldKey]}
        onChange={(e) => updateField(fieldKey, e.target.value)}
        className="border-b-2 border-primary/30 bg-primary/5 px-1 py-0.5 text-primary outline-none focus:border-primary transition-colors"
        style={{ width, fontFamily: 'inherit', fontSize: 'inherit' }}
      />
    );
  };

  const renderField = (key: keyof ListingAgreementFields, width?: number) => (
    <InlineField fieldKey={key} width={width} />
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
          {checklistItem?.name || 'Exclusive Right of Sale Listing Agreement'}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setSignatureOpen(true)}>
            <Send className="w-3.5 h-3.5" /> Send for Signature
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
        <div className="max-w-[816px] mx-auto bg-background shadow-sm border rounded px-16 py-12">
          <ListingAgreementDocument
            fields={fields}
            renderField={renderField}
          />
        </div>
      </div>

      {/* Signature Panel */}
      <SignaturePanel
        open={signatureOpen}
        onClose={() => setSignatureOpen(false)}
        documentName={checklistItem?.name || 'Exclusive Right of Sale Listing Agreement'}
        contacts={dealContacts}
        dealId={id || ''}
        checklistItemId={formId}
        formData={fields}
      />
    </div>
  );
}
