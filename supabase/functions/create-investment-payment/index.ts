import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  propertyId: string;
  tokenAmount: number;
  investmentAmount: number;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-INVESTMENT-PAYMENT] ${step}${detailsStr}`);
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
    logStep("Stripe key verified");

    // Create Supabase client using anon key for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const { propertyId, tokenAmount, investmentAmount }: PaymentRequest = await req.json();
    
    if (!propertyId || !tokenAmount || !investmentAmount) {
      throw new Error("Missing required fields: propertyId, tokenAmount, investmentAmount");
    }

    // Validate investment amount range
    if (investmentAmount < 100 || investmentAmount > 50000) {
      throw new Error("Investment amount must be between $100 and $50,000");
    }

    logStep("Request validated", { propertyId, tokenAmount, investmentAmount });

    // Calculate platform fee (2%)
    const platformFeeAmount = Math.round(investmentAmount * 0.02);
    const totalAmount = investmentAmount + platformFeeAmount;
    
    logStep("Fees calculated", { investmentAmount, platformFeeAmount, totalAmount });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("New customer created", { customerId });
    }

    // Get property details for checkout description
    const { data: property } = await supabaseClient
      .from("properties")
      .select("title")
      .eq("id", propertyId)
      .single();

    const propertyTitle = property?.title || "Property Investment";

    // Create checkout session
    const origin = req.headers.get("origin") || "https://your-domain.com";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${propertyTitle} - ${tokenAmount} Tokens`,
              description: `Investment in ${propertyTitle}`,
              metadata: {
                property_id: propertyId,
                token_amount: tokenAmount.toString(),
                user_id: user.id,
              },
            },
            unit_amount: investmentAmount * 100, // Convert to cents
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Platform Fee (2%)",
              description: "Transaction processing fee",
            },
            unit_amount: platformFeeAmount * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/investment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/investment/cancel`,
      metadata: {
        property_id: propertyId,
        token_amount: tokenAmount.toString(),
        investment_amount: investmentAmount.toString(),
        platform_fee: platformFeeAmount.toString(),
        user_id: user.id,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    // Create pending investment record using service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: investmentError } = await supabaseService
      .from("investment_transactions")
      .insert({
        user_id: user.id,
        property_id: propertyId,
        token_amount: tokenAmount,
        token_price: investmentAmount / tokenAmount,
        net_amount: investmentAmount,
        fees_amount: platformFeeAmount,
        total_amount: totalAmount,
        payment_currency: "USD",
        payment_method: "stripe",
        stripe_payment_intent_id: session.payment_intent as string,
        status: "pending",
        transaction_type: "investment",
      });

    if (investmentError) {
      logStep("Failed to create investment record", { error: investmentError });
      throw new Error("Failed to create investment record");
    }

    logStep("Investment record created");

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      totalAmount,
      platformFee: platformFeeAmount
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});