-- Direct deposits table: stores agent banking info for deal payouts
CREATE TABLE public.direct_deposits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name text NOT NULL,
  bank_name text,
  routing_number text NOT NULL,
  account_number_last4 text NOT NULL,
  account_type text NOT NULL DEFAULT 'checking',
  created_at timestamp with time zone NOT NULL DEFAULT now()
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

CREATE POLICY "Users can delete their own direct deposits"
  ON public.direct_deposits FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Also add the missing DELETE policy for bank_accounts
CREATE POLICY "Users can delete their own bank accounts"
  ON public.bank_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
