/**
 * Shared utilities for Supabase Edge Functions
 * Common patterns and configurations used across all functions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

export const createJsonResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status,
  });
};

export const createErrorResponse = (message: string, status: number = 500, details?: any) => {
  return createJsonResponse({
    success: false,
    error: message,
    details,
    timestamp: new Date().toISOString()
  }, status);
};

export const createSuccessResponse = (data: any, message?: string) => {
  return createJsonResponse({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  });
};