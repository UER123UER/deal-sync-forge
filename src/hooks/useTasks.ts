import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  type: string;
  due_date: string | null;
  end_date: string | null;
  assignee: string | null;
  deal_id: string | null;
  created_at: string;
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as TaskRow[];
    },
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: { title: string; description?: string; type: string; due_date?: string; end_date?: string; assignee?: string }) => {
      const { data, error } = await supabase.from('tasks').insert(task).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; title?: string; description?: string; type?: string; due_date?: string | null; assignee?: string | null }) => {
      const { error } = await supabase.from('tasks').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
