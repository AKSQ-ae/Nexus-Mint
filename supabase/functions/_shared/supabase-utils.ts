import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

/**
 * Supabase client utilities for edge functions
 */

export const createSupabaseClient = (useServiceRole: boolean = false) => {
  const url = Deno.env.get('SUPABASE_URL');
  const key = useServiceRole 
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    : Deno.env.get('SUPABASE_ANON_KEY');

  if (!url || !key) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(url, key, { 
    auth: { persistSession: false } 
  });
};

export const authenticateUser = async (req: Request, supabase: any) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('No authorization header provided');
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Authentication failed');
  }

  return user;
};

export const validateRequiredFields = (data: any, fields: string[]) => {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};