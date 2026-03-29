import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SigningSession {
  id: string;
  deal_id: string;
  session_name: string;
  email_message: string | null;
  status: string;
  created_by: string | null;
  date_sent: string | null;
  expiration_date: string | null;
  reminder_interval_days: number | null;
  signing_order_enabled: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SessionDocument {
  id: string;
  session_id: string;
  name: string;
  storage_path: string;
  sort_order: number | null;
  page_count: number | null;
  created_at: string | null;
}

export interface SessionRecipient {
  id: string;
  session_id: string;
  contact_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  type: string;
  sort_order: number | null;
  status: string;
  signed_at: string | null;
  signature_data: string | null;
  token: string;
  created_at: string | null;
}

export interface SessionField {
  id: string;
  session_id: string;
  document_id: string | null;
  recipient_id: string | null;
  type: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value: string | null;
  created_at: string | null;
}

// Fetch all sessions for a deal
export function useSigningSessions(dealId: string | undefined) {
  return useQuery({
    queryKey: ['signing_sessions', dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signing_sessions')
        .select('*')
        .eq('deal_id', dealId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SigningSession[];
    },
  });
}

// Fetch single session with recipients
export function useSigningSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['signing_session', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('signing_sessions')
        .select('*')
        .eq('id', sessionId!)
        .single();
      if (error) throw error;
      return data as SigningSession;
    },
  });
}

export function useSessionRecipients(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session_recipients', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_recipients')
        .select('*')
        .eq('session_id', sessionId!)
        .order('sort_order');
      if (error) throw error;
      return data as SessionRecipient[];
    },
  });
}

export function useSessionDocuments(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session_documents', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_documents')
        .select('*')
        .eq('session_id', sessionId!)
        .order('sort_order');
      if (error) throw error;
      return data as SessionDocument[];
    },
  });
}

export function useSessionFields(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session_fields', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_fields')
        .select('*')
        .eq('session_id', sessionId!);
      if (error) throw error;
      return data as SessionField[];
    },
  });
}

// Mutations
export function useCreateSigningSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { deal_id: string; session_name: string; email_message?: string; signing_order_enabled?: boolean; reminder_interval_days?: number; expiration_date?: string }) => {
      const { data, error } = await supabase.from('signing_sessions').insert(input).select().single();
      if (error) throw error;
      return data as SigningSession;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['signing_sessions', d.deal_id] }); },
  });
}

export function useUpdateSigningSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SigningSession> & { id: string }) => {
      const { data, error } = await supabase.from('signing_sessions').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data as SigningSession;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['signing_session', d.id] });
      qc.invalidateQueries({ queryKey: ['signing_sessions', d.deal_id] });
    },
  });
}

export function useDeleteSigningSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('signing_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['signing_sessions'] }); },
  });
}

// Recipients
export function useAddSessionRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { session_id: string; first_name: string; last_name?: string; email: string; type?: string; sort_order?: number; contact_id?: string }) => {
      const { data, error } = await supabase.from('session_recipients').insert(input).select().single();
      if (error) throw error;
      return data as SessionRecipient;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['session_recipients', d.session_id] }); },
  });
}

export function useRemoveSessionRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, session_id }: { id: string; session_id: string }) => {
      const { error } = await supabase.from('session_recipients').delete().eq('id', id);
      if (error) throw error;
      return session_id;
    },
    onSuccess: (sid) => { qc.invalidateQueries({ queryKey: ['session_recipients', sid] }); },
  });
}

export function useUpdateSessionRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      session_id,
      ...updates
    }: Partial<SessionRecipient> & { id: string; session_id: string }) => {
      const { data, error } = await supabase
        .from('session_recipients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as SessionRecipient;
    },
    onSuccess: (d) => {
      qc.invalidateQueries({ queryKey: ['session_recipients', d.session_id] });
    },
  });
}

// Documents
export function useAddSessionDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { session_id: string; name: string; storage_path: string; sort_order?: number; page_count?: number }) => {
      const { data, error } = await supabase.from('session_documents').insert(input).select().single();
      if (error) throw error;
      return data as SessionDocument;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['session_documents', d.session_id] }); },
  });
}

// Fields
export function useSaveSessionFields() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ session_id, fields }: { session_id: string; fields: Omit<SessionField, 'id' | 'created_at'>[] }) => {
      // Delete existing fields then insert new ones
      await supabase.from('session_fields').delete().eq('session_id', session_id);
      if (fields.length > 0) {
        const { error } = await supabase.from('session_fields').insert(fields);
        if (error) throw error;
      }
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['session_fields', v.session_id] }); },
  });
}

// Fetch session by recipient token (for signing page)
export function useSessionByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['session_by_token', token],
    enabled: !!token,
    queryFn: async () => {
      const { data: recipient, error } = await supabase
        .from('session_recipients')
        .select('*')
        .eq('token', token!)
        .single();
      if (error) throw error;
      
      const { data: session } = await supabase
        .from('signing_sessions')
        .select('*')
        .eq('id', recipient.session_id)
        .single();
      
      const { data: fields } = await supabase
        .from('session_fields')
        .select('*')
        .eq('session_id', recipient.session_id)
        .eq('recipient_id', recipient.id);
      
      const { data: documents } = await supabase
        .from('session_documents')
        .select('*')
        .eq('session_id', recipient.session_id)
        .order('sort_order');

      return {
        session: session as SigningSession,
        recipient: recipient as SessionRecipient,
        fields: (fields || []) as SessionField[],
        documents: (documents || []) as SessionDocument[],
      };
    },
  });
}
