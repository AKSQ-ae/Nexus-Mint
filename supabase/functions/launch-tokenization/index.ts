import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[LAUNCH-TOKENIZATION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting tokenization launch");

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

    const { propertyId, contractAddress } = await req.json();
    if (!propertyId || !contractAddress) {
      throw new Error("Property ID and contract address are required");
    }

    logStep("Launching tokenization", { propertyId, contractAddress });

    // Activate tokenization
    const { error: updateError } = await supabaseClient
      .from("properties")
      .update({
        tokenization_active: true,
        tokenization_status: "live",
        is_featured: true // Feature newly launched properties
      })
      .eq("id", propertyId);

    if (updateError) {
      throw new Error(`Failed to activate tokenization: ${updateError.message}`);
    }

    // Update contract status
    await supabaseClient
      .from("property_tokens")
      .update({
        status: "live",
        launch_date: new Date().toISOString()
      })
      .eq("contract_address", contractAddress);

    // Create launch notification for all users
    const { data: users } = await supabaseClient
      .from("user_profiles")
      .select("id")
      .eq("is_active", true);

    if (users && users.length > 0) {
      const notifications = users.map(user => ({
        user_id: user.id,
        title: "New Investment Opportunity",
        message: `Property tokenization is now live! Start investing in real estate tokens.`,
        type: "property_update",
        action_url: `/properties/${propertyId}`,
        data: {
          propertyId,
          contractAddress,
          launchDate: new Date().toISOString()
        }
      }));

      await supabaseClient
        .from("enhanced_notifications")
        .insert(notifications);
    }

    // Log launch event
    await supabaseClient
      .from("smart_contract_events")
      .insert({
        contract_address: contractAddress,
        event_name: "TokenizationLaunched",
        event_data: {
          propertyId,
          launchDate: new Date().toISOString(),
          status: "live"
        },
        transaction_hash: null,
        block_number: null
      });

    // Initialize property analytics
    await supabaseClient
      .from("property_analytics")
      .insert({
        property_id: propertyId,
        report_date: new Date().toISOString().split('T')[0],
        total_invested: 0,
        number_of_investors: 0,
        funding_percentage: 0,
        average_investment_size: 0
      });

    logStep("Tokenization launched successfully", { propertyId });

    return new Response(JSON.stringify({
      success: true,
      propertyId,
      contractAddress,
      launchDate: new Date().toISOString(),
      message: "Tokenization launched successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in launch-tokenization", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});