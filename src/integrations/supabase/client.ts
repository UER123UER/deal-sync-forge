import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dwhlgnlpkrychygodwdw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3aGxnbmxwa3J5Y2h5Z29kd2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4ODYyODAsImV4cCI6MjA4OTQ2MjI4MH0.qwY5RNkTsHZqwslAJPMEcAKwpZqmpe5dWVIgj6_I5TI";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

// SSG-safe: localStorage is only available in the browser. During static
// pre-rendering (Node), fall back to undefined so module init doesn't crash.
const browserStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    ? window.localStorage
    : undefined;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: browserStorage,
    persistSession: typeof window !== 'undefined',
    autoRefreshToken: typeof window !== 'undefined',
  }
});