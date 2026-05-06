
-- Wipe all app data
TRUNCATE TABLE
  public.session_fields,
  public.session_recipients,
  public.session_documents,
  public.signing_sessions,
  public.signature_recipients,
  public.signature_requests,
  public.deal_notes,
  public.deal_contacts,
  public.checklist_items,
  public.open_houses,
  public.offers,
  public.tasks,
  public.deals,
  public.contacts,
  public.affiliate_links,
  public.bank_accounts,
  public.user_roles,
  public.profiles
RESTART IDENTITY CASCADE;

-- Delete all auth users (cascades to identities, sessions, etc.)
DELETE FROM auth.users;
