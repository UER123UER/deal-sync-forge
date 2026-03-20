import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OfferRow {
  id: string;
  deal_id: string;
  amount: string;
  buyer_name: string;
  status: string;
  notes: string | null;
  created_at: string | null;
}

export function useOffers(dealId: string | undefined) {
  return useQuery({
    queryKey: ['offers', dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase.from('offers').select('*').eq('deal_id', dealId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as OfferRow[];
    },
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offer: { deal_id: string; amount: string; buyer_name: string; notes?: string }) => {
      const { data, error } = await supabase.from('offers').insert(offer).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['offers', vars.deal_id] }),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dealId }: { id: string; dealId: string }) => {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => qc.invalidateQueries({ queryKey: ['offers', dealId] }),
  });
}
