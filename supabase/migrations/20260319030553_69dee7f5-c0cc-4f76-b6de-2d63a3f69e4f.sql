
-- 1. contacts table
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text,
  phone text,
  company text,
  role text,
  current_address text,
  mls_id text,
  mls text,
  commission text,
  commission_type text,
  tags text[] DEFAULT '{}',
  last_touch timestamptz,
  next_touch timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 2. deals table
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_type text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  representation_side text NOT NULL DEFAULT 'seller',
  status text NOT NULL DEFAULT 'draft',
  price text DEFAULT '$0',
  mls_number text,
  listing_start_date date,
  listing_expiration date,
  primary_agent text DEFAULT 'Unassigned',
  created_at timestamptz DEFAULT now()
);

-- 3. deal_contacts join table
CREATE TABLE public.deal_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  role text,
  UNIQUE(deal_id, contact_id)
);

-- 4. checklist_items table
CREATE TABLE public.checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  has_digital_form boolean DEFAULT false,
  completed boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 5. tasks table
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'todo',
  due_date timestamptz,
  end_date timestamptz,
  assignee text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon (temporary until auth is added)
CREATE POLICY "Allow all access to contacts" ON public.contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to deals" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to deal_contacts" ON public.deal_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to checklist_items" ON public.checklist_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
