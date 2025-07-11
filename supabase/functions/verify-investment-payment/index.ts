import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-INVESTMENT-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    // Create Supabase client using service role for database updates
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse request body
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      throw new Error("Missing sessionId");
    }

    logStep("Verifying session", { sessionId });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Retrieve checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      throw new Error("Session not found");
    }

    logStep("Session retrieved", { 
      sessionId: session.id, 
      paymentStatus: session.payment_status,
      paymentIntent: session.payment_intent
    });

    // Check if payment was successful
    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Payment not completed",
        paymentStatus: session.payment_status
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Extract metadata
    const {
      property_id: propertyId,
      token_amount: tokenAmountStr,
      investment_amount: investmentAmountStr,
      platform_fee: platformFeeStr,
      user_id: userId
    } = session.metadata || {};

    if (!propertyId || !tokenAmountStr || !userId) {
      throw new Error("Missing required metadata");
    }

    const tokenAmount = parseInt(tokenAmountStr);
    const investmentAmount = parseFloat(investmentAmountStr);
    const platformFee = parseFloat(platformFeeStr || "0");

    logStep("Payment verified", { 
      propertyId, 
      tokenAmount, 
      investmentAmount, 
      platformFee, 
      userId 
    });

    // Update investment transaction status
    const { error: updateError } = await supabaseClient
      .from("investment_transactions")
      .update({
        status: "completed",
        processed_at: new Date().toISOString(),
        blockchain_tx_hash: session.payment_intent as string
      })
      .eq("stripe_payment_intent_id", session.payment_intent as string)
      .eq("user_id", userId);

    if (updateError) {
      logStep("Failed to update transaction", { error: updateError });
      throw new Error("Failed to update transaction status");
    }

    // Create investment record
    const { error: investmentError } = await supabaseClient
      .from("investments")
      .insert({
        user_id: userId,
        property_id: propertyId,
        token_amount: tokenAmount,
        price_per_token: investmentAmount / tokenAmount,
        total_amount: investmentAmount + platformFee,
        net_amount: investmentAmount,
        fee_amount: platformFee,
        payment_currency: "USD",
        payment_method: "stripe",
        payment_tx_hash: session.payment_intent as string,
        status: "confirmed",
        confirmed_at: new Date().toISOString()
      });

    if (investmentError) {
      logStep("Failed to create investment", { error: investmentError });
      throw new Error("Failed to create investment record");
    }

    // Update token supply
    const { error: supplyError } = await supabaseClient
      .from("token_supply")
      .update({
        available_supply: supabaseClient.raw(`available_supply - ${tokenAmount}`),
        updated_at: new Date().toISOString()
      })
      .eq("property_id", propertyId);

    if (supplyError) {
      logStep("Failed to update token supply", { error: supplyError });
      // Don't throw error here - investment is still valid
    }

    // Create notification
    await supabaseClient
      .from("enhanced_notifications")
      .insert({
        user_id: userId,
        type: "investment",
        title: "Investment Confirmed",
        message: `Your investment of $${investmentAmount.toLocaleString()} has been confirmed. You now own ${tokenAmount} tokens.`,
        data: {
          property_id: propertyId,
          token_amount: tokenAmount,
          investment_amount: investmentAmount
        }
      });

    logStep("Investment completed successfully");

    return new Response(JSON.stringify({ 
      success: true,
      investment: {
        propertyId,
        tokenAmount,
        investmentAmount,
        platformFee,
        totalAmount: investmentAmount + platformFee
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});