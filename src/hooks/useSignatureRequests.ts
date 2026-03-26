import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SignatureRequest {
  id: string;
  deal_id: string;
  checklist_item_id: string | null;
  document_name: string;
  sender_name: string;
  subject: string;
  message: string | null;
  status: string;
  token: string;
  form_data: Record<string, any> | null;
  created_at: string;
  signature_recipients?: SignatureRecipient[];
}

export interface SignatureRecipient {
  id: string;
  signature_request_id: string;
  contact_id: string | null;
  name: string;
  email: string;
  role: string | null;
  status: string;
  signed_at: string | null;
  signature_data: string | null;
}

export function useSignatureRequests(dealId: string | undefined) {
  return useQuery({
    queryKey: ['signature_requests', dealId],
    enabled: !!dealId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('signature_requests')
        .select('*, signature_recipients(*)')
        .eq('deal_id', dealId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SignatureRequest[];
    },
  });
}

export function useSignatureRequestByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['signature_request_token', token],
    enabled: !!token,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('signature_requests')
        .select('*, signature_recipients(*)')
        .eq('token', token!)
        .single();
      if (error) throw error;
      return data as SignatureRequest;
    },
  });
}

export function useCreateSignatureRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (req: {
      deal_id: string;
      checklist_item_id?: string;
      document_name: string;
      sender_name: string;
      subject: string;
      message: string;
      form_data: Record<string, any>;
      recipients: { contact_id: string; name: string; email: string; role: string }[];
      designated_fields?: Array<{ type: string; x: number; y: number; page: number; width: number; height: number; signerId?: string }>;
    }) => {
      const token = crypto.randomUUID();
      const { data: sigReq, error: reqErr } = await (supabase as any)
        .from('signature_requests')
        .insert({
          deal_id: req.deal_id,
          checklist_item_id: req.checklist_item_id || null,
          document_name: req.document_name,
          sender_name: req.sender_name,
          subject: req.subject,
          message: req.message,
          token,
          form_data: {
            ...req.form_data,
            designated_fields: req.designated_fields || [],
          },
        })
        .select()
        .single();
      if (reqErr) throw reqErr;

      for (const r of req.recipients) {
        const { error: recErr } = await (supabase as any)
          .from('signature_recipients')
          .insert({
            signature_request_id: sigReq.id,
            contact_id: r.contact_id,
            name: r.name,
            email: r.email,
            role: r.role,
          });
        if (recErr) throw recErr;
      }

      return sigReq as SignatureRequest;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['signature_requests'] }),
  });
}

export function useSignDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipientId, signatureData }: { recipientId: string; signatureData: string }) => {
      const { error } = await (supabase as any)
        .from('signature_recipients')
        .update({ status: 'signed', signed_at: new Date().toISOString(), signature_data: signatureData })
        .eq('id', recipientId);
      if (error) throw error;

      // Check if all recipients signed — if so, mark request as signed
      const { data: recipient } = await (supabase as any)
        .from('signature_recipients')
        .select('signature_request_id')
        .eq('id', recipientId)
        .single();
      
      if (recipient) {
        const { data: allRecipients } = await (supabase as any)
          .from('signature_recipients')
          .select('status')
          .eq('signature_request_id', recipient.signature_request_id);
        
        const allSigned = allRecipients?.every((r: any) => r.status === 'signed');
        if (allSigned) {
          await (supabase as any)
            .from('signature_requests')
            .update({ status: 'signed' })
            .eq('id', recipient.signature_request_id);
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['signature_requests'] });
      qc.invalidateQueries({ queryKey: ['signature_request_token'] });
    },
  });
}
