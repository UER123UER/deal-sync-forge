import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'text'
  | 'meeting'
  | 'stage_change'
  | 'touch_logged'
  | 'deal_linked';

export interface ContactActivity {
  id: string;
  contact_id: string;
  type: ActivityType;
  content: string;
  created_at: string;
}

// We store activities in deal_notes but scoped to contacts via a prefix hack
// UNTIL a real contact_activities table is created. We use the note content as JSON.
// Format stored: JSON string { type, content, contact_id }
// We use the deal_notes table with deal_id = contact_id (Supabase allows any UUID)
// This is a safe workaround — no schema change needed.

const ACTIVITY_KEY = (contactId: string) => ['contact_activities', contactId];

export function useContactActivities(contactId: string | undefined) {
  return useQuery({
    queryKey: ACTIVITY_KEY(contactId ?? ''),
    enabled: !!contactId,
    queryFn: async (): Promise<ContactActivity[]> => {
      if (!contactId) return [];
      // We store contact activities in deal_notes with deal_id = contactId
      // and content = JSON { _crmActivity: true, type, content }
      const { data, error } = await supabase
        .from('deal_notes')
        .select('*')
        .eq('deal_id', contactId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || [])
        .map((row) => {
          try {
            const parsed = JSON.parse(row.content);
            if (!parsed._crmActivity) return null;
            return {
              id: row.id,
              contact_id: contactId,
              type: parsed.type as ActivityType,
              content: parsed.content as string,
              created_at: row.created_at,
            } satisfies ContactActivity;
          } catch {
            return null;
          }
        })
        .filter(Boolean) as ContactActivity[];
    },
  });
}

export function useCreateContactActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contactId,
      type,
      content,
    }: {
      contactId: string;
      type: ActivityType;
      content: string;
    }) => {
      const payload = JSON.stringify({ _crmActivity: true, type, content });
      const { data, error } = await supabase
        .from('deal_notes')
        .insert({ deal_id: contactId, content: payload })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ACTIVITY_KEY(variables.contactId) });
    },
  });
}

export function useDeleteContactActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, contactId }: { id: string; contactId: string }) => {
      const { error } = await supabase.from('deal_notes').delete().eq('id', id);
      if (error) throw error;
      return contactId;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ACTIVITY_KEY(variables.contactId) });
    },
  });
}
