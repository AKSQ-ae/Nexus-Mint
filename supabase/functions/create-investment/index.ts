import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvestmentRequest {
  propertyId: string;
  tokenAmount: number;
  paymentMethodId?: string;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-INVESTMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Initialize Supabase with service role for secure operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { propertyId, tokenAmount, paymentMethodId }: InvestmentRequest = await req.json();

    // Validate input
    if (!propertyId || !tokenAmount || tokenAmount <= 0) {
      throw new Error("Invalid investment parameters");
    }

    logStep("Input validated", { propertyId, tokenAmount, paymentMethodId });

    // Get property and token supply information
    const { data: property, error: propertyError } = await supabaseClient
      .from("properties")
      .select("*, token_supply!inner(*)")
      .eq("id", propertyId)
      .eq("tokenization_active", true)
      .single();

    if (propertyError || !property) {
      throw new Error("Property not found or not available for tokenization");
    }

    const tokenSupply = property.token_supply[0];
    if (!tokenSupply) {
      throw new Error("Token supply not configured for this property");
    }

    logStep("Property and token supply retrieved", { 
      propertyTitle: property.title,
      tokenPrice: tokenSupply.token_price,
      availableSupply: tokenSupply.available_supply
    });

    // Validate investment amount and availability
    if (tokenAmount > tokenSupply.available_supply) {
      throw new Error("Insufficient tokens available");
    }

    if (tokenAmount < tokenSupply.minimum_investment) {
      throw new Error(`Minimum investment is ${tokenSupply.minimum_investment} tokens`);
    }

    if (tokenSupply.maximum_investment && tokenAmount > tokenSupply.maximum_investment) {
      throw new Error(`Maximum investment is ${tokenSupply.maximum_investment} tokens`);
    }

    // Calculate investment amounts
    const tokenPrice = tokenSupply.token_price;
    const grossAmount = tokenAmount * tokenPrice;
    
    // Get fee calculation
    const { data: feeAmount } = await supabaseClient
      .rpc('calculate_investment_fees', { 
        investment_amount: grossAmount, 
        fee_type: 'onboarding' 
      });

    const netAmount = grossAmount - (feeAmount || 0);

    logStep("Investment calculation completed", { 
      grossAmount, 
      feeAmount, 
      netAmount 
    });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check or create Stripe customer
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
    }

    logStep("Stripe customer ready", { customerId });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(grossAmount * 100), // Convert to cents
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      confirmation_method: "manual",
      confirm: !!paymentMethodId,
      metadata: {
        user_id: user.id,
        property_id: propertyId,
        token_amount: tokenAmount.toString(),
        investment_type: "property_tokens"
      }
    });

    logStep("Payment intent created", { 
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status 
    });

    // Create investment transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from("investment_transactions")
      .insert({
        user_id: user.id,
        property_id: propertyId,
        transaction_type: "purchase",
        token_amount: tokenAmount,
        token_price: tokenPrice,
        total_amount: grossAmount,
        fees_amount: feeAmount || 0,
        net_amount: netAmount,
        payment_method: "stripe",
        payment_currency: "USD",
        stripe_payment_intent_id: paymentIntent.id,
        status: paymentIntent.status === "succeeded" ? "completed" : "pending"
      })
      .select()
      .single();

    if (transactionError) {
      throw new Error(`Failed to create transaction record: ${transactionError.message}`);
    }

    logStep("Transaction record created", { transactionId: transaction.id });

    // If payment is successful, reserve tokens and create investment record
    if (paymentIntent.status === "succeeded") {
      // Reserve tokens by reducing available supply
      const { error: tokenUpdateError } = await supabaseClient
        .from("token_supply")
        .update({
          available_supply: tokenSupply.available_supply - tokenAmount,
          reserved_supply: tokenSupply.reserved_supply + tokenAmount
        })
        .eq("property_id", propertyId);

      if (tokenUpdateError) {
        throw new Error(`Failed to reserve tokens: ${tokenUpdateError.message}`);
      }

      // Create investment record
      const { error: investmentError } = await supabaseClient
        .from("investments")
        .insert({
          user_id: user.id,
          property_id: propertyId,
          token_amount: tokenAmount,
          price_per_token: tokenPrice,
          total_amount: grossAmount,
          fee_amount: feeAmount || 0,
          net_amount: netAmount,
          payment_method: "stripe",
          payment_currency: "USD",
          payment_tx_hash: paymentIntent.id,
          status: "PAID",
          investment_transaction_id: transaction.id
        });

      if (investmentError) {
        throw new Error(`Failed to create investment record: ${investmentError.message}`);
      }

      logStep("Investment completed successfully");
    }

    return new Response(JSON.stringify({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
        status: paymentIntent.status
      },
      transaction: {
        id: transaction.id,
        grossAmount,
        feeAmount: feeAmount || 0,
        netAmount,
        tokenAmount,
        tokenPrice
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-investment", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});