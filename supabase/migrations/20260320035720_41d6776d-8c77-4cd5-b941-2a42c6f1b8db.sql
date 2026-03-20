
-- 1. open_houses table
CREATE TABLE public.open_houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  start_time text NOT NULL DEFAULT '10:00 AM',
  end_time text NOT NULL DEFAULT '12:00 PM',
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.open_houses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to open_houses" ON public.open_houses FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. deal_notes table
CREATE TABLE public.deal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.deal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to deal_notes" ON public.deal_notes FOR ALL TO public USING (true) WITH CHECK (true);

-- 3. offers table
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  amount text NOT NULL,
  buyer_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to offers" ON public.offers FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Add deal_id to tasks
ALTER TABLE public.tasks ADD COLUMN deal_id uuid REFERENCES public.deals(id) ON DELETE SET NULL;

-- 5. Add visible_to_office to deals
ALTER TABLE public.deals ADD COLUMN visible_to_office boolean NOT NULL DEFAULT false;

-- 6. Create deal-photos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('deal-photos', 'deal-photos', true);
CREATE POLICY "Allow all uploads to deal-photos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'deal-photos');
CREATE POLICY "Allow all reads from deal-photos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'deal-photos');
CREATE POLICY "Allow all deletes from deal-photos" ON storage.objects FOR DELETE TO public USING (bucket_id = 'deal-photos');
