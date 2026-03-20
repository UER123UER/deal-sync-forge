import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DealNoteRow {
  id: string;
  deal_id: string;
  content: string;
  created_at: string | null;
}

export function useDealNotes(dealId: string | undefined) {
  return useQuery({
    queryKey: ['deal_notes', dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase.from('deal_notes').select('*').eq('deal_id', dealId!).order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as DealNoteRow[];
    },
  });
}

export function useCreateDealNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (note: { deal_id: string; content: string }) => {
      const { data, error } = await supabase.from('deal_notes').insert(note).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['deal_notes', vars.deal_id] }),
  });
}

export function useDeleteDealNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dealId }: { id: string; dealId: string }) => {
      const { error } = await supabase.from('deal_notes').delete().eq('id', id);
      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => qc.invalidateQueries({ queryKey: ['deal_notes', dealId] }),
  });
}
