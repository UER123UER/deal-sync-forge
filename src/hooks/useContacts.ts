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

export type ContactUpdate = {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  role?: string | null;
  current_address?: string | null;
  tags?: string[];
  last_touch?: string | null;
  next_touch?: string | null;
  commission?: string | null;
  commission_type?: string | null;
  mls_id?: string | null;
  mls?: string | null;
};

// ── Source helper (stored as "source:VALUE" in tags) ─────────────────────────
export const CONTACT_SOURCES = [
  'Referral', 'Open House', 'Website', 'Cold Call', 'Social Media',
  'Walk-in', 'Past Client', 'Direct Mail', 'Zillow', 'Realtor.com', 'Other',
] as const;

export type ContactSource = (typeof CONTACT_SOURCES)[number];

export function getContactSource(contact: ContactRow): ContactSource | null {
  const tag = (contact.tags || []).find((t) => t.startsWith('source:'));
  if (!tag) return null;
  return tag.replace('source:', '') as ContactSource;
}

export function setContactSource(tags: string[], source: ContactSource | ''): string[] {
  const withoutSource = tags.filter((t) => !t.startsWith('source:'));
  return source ? [...withoutSource, `source:${source}`] : withoutSource;
}

// ── Lead Score (0-100) ────────────────────────────────────────────────────────
export function calcLeadScore(contact: ContactRow, dealCount: number): number {
  let score = 0;
  if (contact.email) score += 15;
  if (contact.phone) score += 15;
  if (contact.company) score += 5;
  if (contact.current_address) score += 5;
  if (dealCount > 0) score += 20;
  if (dealCount > 1) score += 10;
  if (contact.last_touch) {
    try {
      const days = Math.floor((Date.now() - new Date(contact.last_touch).getTime()) / 86_400_000);
      if (days <= 7) score += 15;
      else if (days <= 30) score += 10;
      else if (days <= 90) score += 5;
    } catch { /* ignore */ }
  }
  if (contact.next_touch) score += 10;
  if ((contact.tags || []).includes('VIP')) score += 5;
  return Math.min(score, 100);
}

export function leadScoreColor(score: number): string {
  if (score >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
  return 'text-slate-500 bg-slate-50 border-slate-200';
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
    mutationFn: async (contact: {
      first_name: string;
      last_name: string;
      email?: string | null;
      phone?: string | null;
      company?: string | null;
      role?: string | null;
      tags?: string[];
      current_address?: string | null;
      last_touch?: string | null;
      next_touch?: string | null;
    }) => {
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
    mutationFn: async ({ id, ...data }: ContactUpdate) => {
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
