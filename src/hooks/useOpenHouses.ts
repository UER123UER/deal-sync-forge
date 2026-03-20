import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface OpenHouseRow {
  id: string;
  deal_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  notes: string | null;
  created_at: string | null;
}

export function useOpenHouses(dealId?: string) {
  return useQuery({
    queryKey: ['open_houses', dealId],
    queryFn: async () => {
      let q = supabase.from('open_houses').select('*').order('scheduled_date', { ascending: true });
      if (dealId) q = q.eq('deal_id', dealId);
      const { data, error } = await q;
      if (error) throw error;
      return data as unknown as OpenHouseRow[];
    },
  });
}

export function useCreateOpenHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (oh: { deal_id: string; scheduled_date: string; start_time: string; end_time: string; notes?: string }) => {
      const { data, error } = await supabase.from('open_houses').insert(oh).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['open_houses'] }),
  });
}

export function useDeleteOpenHouse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('open_houses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['open_houses'] }),
  });
}
