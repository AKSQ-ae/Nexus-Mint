import { createClient } from '@supabase/supabase-js';

// Admin client – uses the service role key so we can manage users and run RLS-disabled queries.
// Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in the environment variables.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
}

// We don’t pass auth options here because admin client should not persist session client-side.
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});