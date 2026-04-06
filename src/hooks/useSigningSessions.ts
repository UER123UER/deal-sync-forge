import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface SessionRoleAssignment {
  id: string;
  role_name: string;
  recipient_id: string | null;
}

export interface SigningSession {
  id: string;
  deal_id: string;
  session_name: string;
  email_message: string | null;
  status: string;
  created_by: string | null;
  date_sent: string | null;
  expiration_date: string | null;
  role_assignments: SessionRoleAssignment[] | null;
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

export interface SigningSessionByTokenResult {
  session: SigningSession;
  recipient: SessionRecipient;
  fields: SessionField[];
  documents: SessionDocument[];
}

const isMissingRoleAssignmentsColumnError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const values = Object.values(error as Record<string, unknown>)
    .filter((value) => typeof value === 'string')
    .join(' ')
    .toLowerCase();

  return values.includes('role_assignments') && (
    values.includes('column') ||
    values.includes('schema cache') ||
    values.includes('could not find')
  );
};

const isFunctionMissingError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const values = Object.values(error as Record<string, unknown>)
    .filter((value) => typeof value === 'string')
    .join(' ')
    .toLowerCase();

  return (
    values.includes('function') &&
    (values.includes('not found') || values.includes('404') || values.includes('does not exist'))
  );
};

export async function fetchSigningSessionByToken(
  token: string
): Promise<SigningSessionByTokenResult | null> {
  let functionError: unknown = null;

  const { data: functionData, error: invokeError } = await supabase.functions.invoke(
    'get-signing-session',
    {
      body: { token },
    }
  );

  if (!invokeError && functionData) {
    return functionData as SigningSessionByTokenResult;
  }

  functionError = invokeError;

  const { data: recipient, error: recipientError } = await supabase
    .from('session_recipients')
    .select('*')
    .eq('token', token)
    .maybeSingle();
  if (recipientError) throw recipientError;
  if (!recipient) return null;

  const { data: session, error: sessionError } = await supabase
    .from('signing_sessions')
    .select('*')
    .eq('id', recipient.session_id)
    .single();
  if (sessionError) throw sessionError;

  const { data: fields, error: fieldsError } = await supabase
    .from('session_fields')
    .select('*')
    .eq('session_id', recipient.session_id);
  if (fieldsError) {
    if (functionError && !isFunctionMissingError(functionError)) {
      throw functionError;
    }
    throw fieldsError;
  }

  const { data: documents, error: documentsError } = await supabase
    .from('session_documents')
    .select('*')
    .eq('session_id', recipient.session_id)
    .order('sort_order');
  if (documentsError) throw documentsError;

  return {
    session: session as unknown as SigningSession,
    recipient: recipient as SessionRecipient,
    fields: (fields || []) as SessionField[],
    documents: (documents || []) as SessionDocument[],
  };
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
      return data as unknown as SigningSession[];
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
      return data as unknown as SigningSession;
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
    mutationFn: async (input: {
      deal_id: string;
      session_name: string;
      email_message?: string;
      signing_order_enabled?: boolean;
      reminder_interval_days?: number;
      expiration_date?: string;
      role_assignments?: SessionRoleAssignment[];
    }) => {
      const { role_assignments, ...rest } = input;
      const payload = { ...rest, role_assignments: role_assignments as unknown as Json };
      const { data, error } = await supabase
        .from('signing_sessions')
        .insert(payload)
        .select()
        .single();
      if (error && input.role_assignments && isMissingRoleAssignmentsColumnError(error)) {
        const { role_assignments: _ignored, ...fallbackInput } = input;
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('signing_sessions')
          .insert(fallbackInput)
          .select()
          .single();
        if (fallbackError) throw fallbackError;
        return {
          ...fallbackData,
          role_assignments: input.role_assignments,
        } as SigningSession;
      }
      if (error) throw error;
      return data as unknown as SigningSession;
    },
    onSuccess: (d) => { qc.invalidateQueries({ queryKey: ['signing_sessions', d.deal_id] }); },
  });
}

export function useUpdateSigningSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SigningSession> & { id: string }) => {
      const { role_assignments, ...restUpdates } = updates;
      const payload = { ...restUpdates, ...(role_assignments !== undefined ? { role_assignments: role_assignments as unknown as Json } : {}) };
      const { data, error } = await supabase
        .from('signing_sessions')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error && 'role_assignments' in updates && isMissingRoleAssignmentsColumnError(error)) {
        const { role_assignments: _ignored, ...fallbackUpdates } = updates;
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('signing_sessions')
          .update(fallbackUpdates)
          .eq('id', id)
          .select()
          .single();
        if (fallbackError) throw fallbackError;
        return {
          ...fallbackData,
          role_assignments: updates.role_assignments ?? null,
        } as SigningSession;
      }
      if (error) throw error;
      return data as unknown as SigningSession;
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

// Fields - insert-first, then delete old rows to prevent data loss
export function useSaveSessionFields() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ session_id, fields }: { session_id: string; fields: Omit<SessionField, 'id' | 'created_at'>[] }) => {
      // 1. Fetch existing field IDs to delete later
      const { data: existingFields } = await supabase
        .from('session_fields')
        .select('id')
        .eq('session_id', session_id);
      const oldIds = (existingFields || []).map((f) => f.id);

      // 2. Insert new fields first
      if (fields.length > 0) {
        const { data, error } = await supabase
          .from('session_fields')
          .insert(fields)
          .select('id');
        if (error) throw error;
        if (!data || data.length !== fields.length) {
          throw new Error(`Expected to save ${fields.length} fields but saved ${data?.length || 0}`);
        }
      }

      // 3. Only after successful insert, delete old rows
      if (oldIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('session_fields')
          .delete()
          .in('id', oldIds);
        if (deleteError) {
          console.error('Failed to clean up old fields:', deleteError);
          // Not fatal — new fields are already saved
        }
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
    queryFn: async () => fetchSigningSessionByToken(token!),
  });
}
