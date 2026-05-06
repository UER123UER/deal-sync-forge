CREATE TABLE public.direct_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  bank_name TEXT,
  routing_number TEXT NOT NULL,
  account_number_last4 TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'checking',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own direct deposits"
ON public.direct_deposits FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own direct deposits"
ON public.direct_deposits FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own direct deposits"
ON public.direct_deposits FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id);

CREATE TRIGGER update_direct_deposits_updated_at
BEFORE UPDATE ON public.direct_deposits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_direct_deposits_owner_id ON public.direct_deposits(owner_id);