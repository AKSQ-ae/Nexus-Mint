import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[PAYMENT-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase with service role
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    // Verify webhook signature (in production, use webhook endpoint secret)
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
      );
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    logStep("Webhook verified", { eventType: event.type, eventId: event.id });

    // Handle payment intent events
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      logStep("Processing successful payment", { 
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount 
      });

      // Get the transaction record
      const { data: transaction, error: transactionError } = await supabaseClient
        .from("investment_transactions")
        .select("*")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .single();

      if (transactionError || !transaction) {
        throw new Error(`Transaction not found for payment intent: ${paymentIntent.id}`);
      }

      // Update transaction status
      const { error: updateError } = await supabaseClient
        .from("investment_transactions")
        .update({
          status: "completed",
          processed_at: new Date().toISOString()
        })
        .eq("id", transaction.id);

      if (updateError) {
        throw new Error(`Failed to update transaction: ${updateError.message}`);
      }

      // Get token supply info
      const { data: tokenSupply, error: tokenError } = await supabaseClient
        .from("token_supply")
        .select("*")
        .eq("property_id", transaction.property_id)
        .single();

      if (tokenError || !tokenSupply) {
        throw new Error(`Token supply not found for property: ${transaction.property_id}`);
      }

      // Move tokens from reserved to issued
      const { error: tokenUpdateError } = await supabaseClient
        .from("token_supply")
        .update({
          reserved_supply: tokenSupply.reserved_supply - transaction.token_amount,
          available_supply: tokenSupply.available_supply - transaction.token_amount
        })
        .eq("property_id", transaction.property_id);

      if (tokenUpdateError) {
        throw new Error(`Failed to update token supply: ${tokenUpdateError.message}`);
      }

      // Create or update investment record
      const { error: investmentError } = await supabaseClient
        .from("investments")
        .upsert({
          user_id: transaction.user_id,
          property_id: transaction.property_id,
          token_amount: transaction.token_amount,
          price_per_token: transaction.token_price,
          total_amount: transaction.total_amount,
          fee_amount: transaction.fees_amount,
          net_amount: transaction.net_amount,
          payment_method: "stripe",
          payment_currency: transaction.payment_currency,
          payment_tx_hash: paymentIntent.id,
          status: "TOKENS_ISSUED",
          investment_transaction_id: transaction.id,
          confirmed_at: new Date().toISOString()
        }, {
          onConflict: "investment_transaction_id"
        });

      if (investmentError) {
        throw new Error(`Failed to create investment record: ${investmentError.message}`);
      }

      // Update property tokens issued count
      const { error: propertyUpdateError } = await supabaseClient
        .from("properties")
        .update({
          tokens_issued: tokenSupply.total_supply - (tokenSupply.available_supply - transaction.token_amount)
        })
        .eq("id", transaction.property_id);

      if (propertyUpdateError) {
        logStep("Warning: Failed to update property tokens count", { error: propertyUpdateError.message });
      }

      logStep("Investment successfully processed", { 
        transactionId: transaction.id,
        tokenAmount: transaction.token_amount 
      });

    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      logStep("Processing failed payment", { paymentIntentId: paymentIntent.id });

      // Update transaction status to failed
      const { error: updateError } = await supabaseClient
        .from("investment_transactions")
        .update({
          status: "failed",
          processed_at: new Date().toISOString()
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      if (updateError) {
        throw new Error(`Failed to update failed transaction: ${updateError.message}`);
      }

      // Release reserved tokens back to available supply
      const { data: transaction } = await supabaseClient
        .from("investment_transactions")
        .select("property_id, token_amount")
        .eq("stripe_payment_intent_id", paymentIntent.id)
        .single();

      if (transaction) {
        const { data: tokenSupply } = await supabaseClient
          .from("token_supply")
          .select("*")
          .eq("property_id", transaction.property_id)
          .single();

        if (tokenSupply) {
          await supabaseClient
            .from("token_supply")
            .update({
              available_supply: tokenSupply.available_supply + transaction.token_amount,
              reserved_supply: Math.max(0, tokenSupply.reserved_supply - transaction.token_amount)
            })
            .eq("property_id", transaction.property_id);
        }
      }

      logStep("Failed payment processed", { paymentIntentId: paymentIntent.id });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in payment webhook", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});