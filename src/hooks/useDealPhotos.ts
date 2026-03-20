import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DealPhoto {
  name: string;
  url: string;
}

export function useDealPhotos(dealId: string | undefined) {
  return useQuery({
    queryKey: ['deal_photos', dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from('deal-photos').list(dealId!, { sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      return (data || []).map((f) => ({
        name: f.name,
        url: supabase.storage.from('deal-photos').getPublicUrl(`${dealId}/${f.name}`).data.publicUrl,
      })) as DealPhoto[];
    },
  });
}

export function useUploadDealPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dealId, file }: { dealId: string; file: File }) => {
      const path = `${dealId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from('deal-photos').upload(path, file);
      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => qc.invalidateQueries({ queryKey: ['deal_photos', dealId] }),
  });
}

export function useDeleteDealPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ dealId, name }: { dealId: string; name: string }) => {
      const { error } = await supabase.storage.from('deal-photos').remove([`${dealId}/${name}`]);
      if (error) throw error;
      return dealId;
    },
    onSuccess: (dealId) => qc.invalidateQueries({ queryKey: ['deal_photos', dealId] }),
  });
}
