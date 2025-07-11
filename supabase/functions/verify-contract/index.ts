import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-CONTRACT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting contract verification");

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

    const { contractAddress, sourceCode, constructorParams } = await req.json();
    if (!contractAddress || !sourceCode) {
      throw new Error("Contract address and source code are required");
    }

    logStep("Verifying contract", { contractAddress });

    // In a real implementation, this would:
    // 1. Submit source code to blockchain explorer API (e.g., Polygonscan)
    // 2. Wait for verification result
    // 3. Handle verification status

    // Simulate contract verification process
    const verificationResult = {
      status: "verified",
      verificationId: `verification_${Math.random().toString(36).substring(7)}`,
      explorerUrl: `https://polygonscan.com/address/${contractAddress}#code`,
      verifiedAt: new Date().toISOString(),
      compilerVersion: "0.8.19",
      optimizationEnabled: true,
      sourceCodeHash: sourceCode.substring(0, 64),
      constructorArgumentsHash: constructorParams ? JSON.stringify(constructorParams).substring(0, 32) : null
    };

    // Update contract verification status
    const { error: updateError } = await supabaseClient
      .from("property_tokens")
      .update({
        verification_status: verificationResult.status,
        verification_id: verificationResult.verificationId,
        verified_at: verificationResult.verifiedAt,
        explorer_url: verificationResult.explorerUrl
      })
      .eq("contract_address", contractAddress);

    if (updateError) {
      logStep("Error updating verification status", { error: updateError });
      // Continue even if update fails
    }

    // Log verification event
    await supabaseClient
      .from("smart_contract_events")
      .insert({
        contract_address: contractAddress,
        event_name: "ContractVerified",
        event_data: {
          verificationId: verificationResult.verificationId,
          explorerUrl: verificationResult.explorerUrl,
          compilerVersion: verificationResult.compilerVersion,
          optimizationEnabled: verificationResult.optimizationEnabled
        },
        transaction_hash: null,
        block_number: null
      });

    logStep("Contract verification completed", { 
      contractAddress,
      verificationId: verificationResult.verificationId 
    });

    return new Response(JSON.stringify({
      success: true,
      verification: verificationResult,
      message: "Contract verified successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-contract", { message: errorMessage });
    
    // Return unverified status instead of complete failure
    return new Response(JSON.stringify({ 
      success: false,
      verification: {
        status: "unverified",
        error: errorMessage
      },
      message: "Contract verification failed"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 so the flow can continue
    });
  }
});