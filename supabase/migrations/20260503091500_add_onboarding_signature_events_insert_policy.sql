CREATE POLICY "Users can insert their own onboarding signature events"
  ON public.onboarding_signature_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
