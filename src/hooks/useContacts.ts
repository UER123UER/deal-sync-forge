import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContactRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
  current_address: string | null;
  mls_id: string | null;
  mls: string | null;
  commission: string | null;
  commission_type: string | null;
  tags: string[];
  last_touch: string | null;
  next_touch: string | null;
  created_at: string;
}

export function useContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as ContactRow[];
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (contact: { first_name: string; last_name: string; email?: string | null; phone?: string | null; company?: string | null; role?: string | null; tags?: string[] }) => {
      const { data, error } = await supabase.from('contacts').insert(contact).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; first_name?: string; last_name?: string; email?: string | null; phone?: string | null; company?: string | null; role?: string | null; tags?: string[] }) => {
      const { error } = await supabase.from('contacts').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}
