import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Free exchange rate API (no key required)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Exchange API error: ${data.message || 'Unknown error'}`);
    }

    // Extract AED rate
    const usdToAed = data.rates?.AED || 3.67; // Fallback to typical rate
    const aedToUsd = 1 / usdToAed;

    return new Response(
      JSON.stringify({
        success: true,
        rates: {
          USD_TO_AED: usdToAed,
          AED_TO_USD: aedToUsd
        },
        lastUpdated: data.date || new Date().toISOString(),
        source: 'exchangerate-api.com'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    
    // Return fallback rates if API fails
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        rates: {
          USD_TO_AED: 3.67, // UAE Central Bank typical rate
          AED_TO_USD: 0.272
        },
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  }
});