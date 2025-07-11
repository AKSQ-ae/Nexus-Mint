import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvestmentRequest {
  property_id: string;
  token_amount: number;
  payment_method: 'stripe' | 'crypto';
  payment_intent_id?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PROCESS-INVESTMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Investment processing started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { property_id, token_amount, payment_method, payment_intent_id }: InvestmentRequest = await req.json();

    // Validate input
    if (!property_id || !token_amount || token_amount <= 0) {
      throw new Error("Invalid investment parameters");
    }

    // Get property details
    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('id', property_id)
      .single();

    if (propertyError || !property) {
      throw new Error("Property not found");
    }
    logStep("Property validated", { propertyId: property_id, price: property.price });

    // Check token availability
    const { data: tokenSupply, error: tokenError } = await supabaseClient
      .from('token_supply')
      .select('available_supply, token_price')
      .eq('property_id', property_id)
      .single();

    if (tokenError || !tokenSupply) {
      throw new Error("Token supply information not found");
    }

    if (tokenSupply.available_supply < token_amount) {
      throw new Error("Insufficient tokens available");
    }

    // Calculate investment amounts
    const token_price = tokenSupply.token_price || property.price_per_token || 100;
    const gross_amount = token_amount * token_price;
    
    // Calculate fees using the fee calculation function
    const { data: feeResult, error: feeError } = await supabaseClient
      .rpc('calculate_investment_fees', {
        investment_amount: gross_amount,
        fee_type: 'investment'
      });

    const fee_amount = feeError ? gross_amount * 0.025 : feeResult; // 2.5% fallback
    const net_amount = gross_amount - fee_amount;

    logStep("Investment amounts calculated", {
      gross_amount,
      fee_amount,
      net_amount,
      token_price
    });

    // Create investment transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('investment_transactions')
      .insert({
        user_id: user.id,
        property_id,
        token_amount,
        token_price,
        total_amount: gross_amount,
        fees_amount: fee_amount,
        net_amount,
        payment_method,
        stripe_payment_intent_id: payment_intent_id,
        transaction_type: 'investment',
        status: 'processing'
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Failed to create transaction: ${transactionError.message}`);
    }

    logStep("Transaction created", { transactionId: transaction.id });

    // Create investment record
    const { data: investment, error: investmentError } = await supabaseClient
      .from('investments')
      .insert({
        user_id: user.id,
        property_id,
        token_amount,
        price_per_token: token_price,
        total_amount: gross_amount,
        net_amount,
        fee_amount,
        payment_method,
        payment_currency: 'USD',
        status: 'pending',
        investment_transaction_id: transaction.id,
        estimated_annual_return: property.estimated_annual_return || 8.5
      })
      .select()
      .single();

    if (investmentError) {
      throw new Error(`Failed to create investment: ${investmentError.message}`);
    }

    // Update token supply
    const { error: supplyUpdateError } = await supabaseClient
      .from('token_supply')
      .update({
        available_supply: tokenSupply.available_supply - token_amount,
        updated_at: new Date().toISOString()
      })
      .eq('property_id', property_id);

    if (supplyUpdateError) {
      logStep("Warning: Failed to update token supply", { error: supplyUpdateError.message });
    }

    // Create analytics record
    await supabaseClient
      .from('investment_analytics')
      .insert({
        user_id: user.id,
        property_id,
        metric_type: 'investment_created',
        metric_value: gross_amount,
        metric_data: {
          token_amount,
          token_price,
          fee_amount,
          payment_method
        }
      });

    // Create notification
    await supabaseClient
      .from('enhanced_notifications')
      .insert({
        user_id: user.id,
        type: 'investment',
        title: 'Investment Processing',
        message: `Your investment of ${token_amount} tokens in ${property.title} is being processed.`,
        data: {
          investment_id: investment.id,
          property_id,
          amount: gross_amount
        },
        action_url: `/dashboard`
      });

    logStep("Investment processed successfully", {
      investmentId: investment.id,
      transactionId: transaction.id
    });

    return new Response(JSON.stringify({
      success: true,
      investment_id: investment.id,
      transaction_id: transaction.id,
      total_amount: gross_amount,
      fee_amount,
      net_amount,
      token_amount,
      token_price,
      status: 'processing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in process-investment", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});