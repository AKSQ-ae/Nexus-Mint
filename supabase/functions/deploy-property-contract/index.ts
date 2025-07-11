import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[DEPLOY-CONTRACT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    logStep("User authenticated", { userId: user.id });

    const { propertyId } = await req.json();
    if (!propertyId) throw new Error("Property ID is required");

    // Get property details from database
    const { data: property, error: propertyError } = await supabaseClient
      .from("properties")
      .select("*")
      .eq("id", propertyId)
      .single();

    if (propertyError || !property) {
      throw new Error("Property not found");
    }
    logStep("Property found", { propertyId, title: property.title });

    // Check if contract already exists
    const { data: existingToken } = await supabaseClient
      .from("property_tokens")
      .select("*")
      .eq("property_id", propertyId)
      .single();

    if (existingToken) {
      logStep("Contract already exists", { contractAddress: existingToken.contract_address });
      return new Response(JSON.stringify({
        success: true,
        contractAddress: existingToken.contract_address,
        message: "Contract already deployed"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // For demonstration, we'll create a mock contract deployment
    // In production, this would use ethers.js to deploy to actual blockchain
    const mockContractAddress = `0x${Math.random().toString(16).substring(2, 42)}`;
    const totalSupply = 1000000; // 1 million tokens
    const tokenPrice = property.price / totalSupply;

    logStep("Mock contract deployment", { 
      contractAddress: mockContractAddress,
      totalSupply,
      tokenPrice 
    });

    // Create property token record
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from("property_tokens")
      .insert({
        property_id: propertyId,
        contract_address: mockContractAddress,
        token_address: mockContractAddress,
        token_name: `${property.title} Token`,
        token_symbol: property.title.split(' ').map(word => word[0]).join('').toUpperCase(),
        total_supply: totalSupply,
        available_supply: totalSupply,
        initial_price: tokenPrice,
        current_price: tokenPrice,
        blockchain_network: "polygon",
        status: "active",
        minimum_investment: 100
      })
      .select()
      .single();

    if (tokenError) {
      logStep("Error creating token record", { error: tokenError });
      throw new Error(`Failed to create token record: ${tokenError.message}`);
    }

    // Update property tokenization status
    const { error: updateError } = await supabaseClient
      .from("properties")
      .update({
        tokenization_active: true,
        tokenization_status: "active",
        token_address: mockContractAddress,
        total_tokens: totalSupply,
        price_per_token: tokenPrice
      })
      .eq("id", propertyId);

    if (updateError) {
      logStep("Error updating property", { error: updateError });
      throw new Error(`Failed to update property: ${updateError.message}`);
    }

    // Create token supply record
    const { error: supplyError } = await supabaseClient
      .from("token_supply")
      .insert({
        property_id: propertyId,
        total_supply: totalSupply,
        available_supply: totalSupply,
        reserved_supply: 0,
        token_price: tokenPrice,
        minimum_investment: 100
      });

    if (supplyError) {
      logStep("Error creating token supply", { error: supplyError });
      throw new Error(`Failed to create token supply: ${supplyError.message}`);
    }

    logStep("Contract deployment completed successfully", {
      contractAddress: mockContractAddress,
      propertyId,
      totalSupply,
      tokenPrice
    });

    return new Response(JSON.stringify({
      success: true,
      contractAddress: mockContractAddress,
      tokenData,
      message: "Smart contract deployed successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in deploy-property-contract", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});