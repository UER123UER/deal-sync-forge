import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DealContact {
  id: string;
  deal_id: string;
  contact_id: string;
  role: string | null;
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    mls_id: string | null;
    mls: string | null;
    commission: string | null;
    commission_type: string | null;
    current_address: string | null;
  };
}

export interface ChecklistItemRow {
  id: string;
  deal_id: string;
  name: string;
  has_digital_form: boolean;
  completed: boolean;
  sort_order: number;
}

export interface DealRow {
  id: string;
  property_type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  representation_side: string;
  status: string;
  price: string | null;
  mls_number: string | null;
  listing_start_date: string | null;
  listing_expiration: string | null;
  primary_agent: string | null;
  created_at: string;
  deal_contacts?: DealContact[];
  checklist_items?: ChecklistItemRow[];
}

export function useDeals() {
  return useQuery({
    queryKey: ['deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, deal_contacts(*, contact:contacts(*)), checklist_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as DealRow[];
    },
  });
}

export function useDeal(id: string | undefined) {
  return useQuery({
    queryKey: ['deals', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, deal_contacts(*, contact:contacts(*)), checklist_items(*)')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as unknown as DealRow;
    },
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deal: {
      property_type: string;
      address: string;
      city: string;
      state: string;
      zip: string;
      representation_side: string;
      status?: string;
      price?: string;
      primary_agent?: string;
      contacts?: { contact_id?: string; first_name: string; last_name: string; email?: string; phone?: string; company?: string; role: string; mls_id?: string; mls?: string; commission?: string; commission_type?: string; current_address?: string }[];
    }) => {
      const { data: newDeal, error: dealErr } = await supabase
        .from('deals')
        .insert({
          property_type: deal.property_type,
          address: deal.address,
          city: deal.city,
          state: deal.state,
          zip: deal.zip,
          representation_side: deal.representation_side,
          status: deal.status || 'draft',
          price: deal.price || '$0',
          primary_agent: deal.primary_agent || 'Unassigned',
        })
        .select()
        .single();
      if (dealErr) throw dealErr;

      if (deal.contacts?.length) {
        for (const c of deal.contacts) {
          let contactId = c.contact_id;
          if (!contactId) {
            const { data: newContact, error: cErr } = await supabase
              .from('contacts')
              .insert({
                first_name: c.first_name,
                last_name: c.last_name,
                email: c.email || null,
                phone: c.phone || null,
                company: c.company || null,
                role: c.role,
                mls_id: c.mls_id || null,
                mls: c.mls || null,
                commission: c.commission || null,
                commission_type: c.commission_type || null,
                current_address: c.current_address || null,
              })
              .select()
              .single();
            if (cErr) throw cErr;
            contactId = newContact.id;
          }
          await supabase.from('deal_contacts').insert({
            deal_id: newDeal.id,
            contact_id: contactId,
            role: c.role,
          });
        }
      }

      const DEFAULT_CHECKLIST = [
        { name: 'Exclusive Right of Sale Listing Agreement', has_digital_form: true },
        { name: 'Tax Roll', has_digital_form: false },
        { name: 'Lead-Based Paint Pamphlet', has_digital_form: false },
        { name: 'Sellers Property Disclosure - Residential', has_digital_form: true },
        { name: 'Affiliated Business Arrangement Disclosure Statement (Seller)', has_digital_form: true },
        { name: 'P. Lead Based Paint Disclosure (Pre 1978 Housing)', has_digital_form: true },
        { name: 'Compensation Agreement - Owner/Listing Broker to Tenants Broker', has_digital_form: true },
        { name: 'Compensation Agreement - Seller or Sellers Broker to Buyers Broker', has_digital_form: true },
        { name: 'Modification to Compensation Agreement - Seller or Sellers Broker to Buyers Broker', has_digital_form: true },
      ];
      await supabase.from('checklist_items').insert(
        DEFAULT_CHECKLIST.map((item, i) => ({
          deal_id: newDeal.id,
          name: item.name,
          has_digital_form: item.has_digital_form,
          sort_order: i,
        }))
      );

      return newDeal;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; status?: string; price?: string; mls_number?: string; primary_agent?: string; listing_start_date?: string; listing_expiration?: string; visible_to_office?: boolean }) => {
      const { error } = await supabase.from('deals').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useToggleChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      const { error } = await supabase.from('checklist_items').update({ completed }).eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useDeleteChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('checklist_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}

export function useAddDealContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dealId, contactId, role }: { dealId: string; contactId: string; role: string }) => {
      const { error } = await supabase.from('deal_contacts').insert({ deal_id: dealId, contact_id: contactId, role });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  });
}
