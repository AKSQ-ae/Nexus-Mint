import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface KYCRequest {
  documentType: string;
  applicantId?: string;
  checkResults?: any;
}

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-KYC] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("KYC verification started");

    // Initialize Supabase with service role
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
    if (!user) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id });

    const { documentType, applicantId, checkResults }: KYCRequest = await req.json();

    // Get Onfido API credentials
    const onfidoToken = Deno.env.get("ONFIDO_API_TOKEN");
    if (!onfidoToken) {
      throw new Error("Onfido API token not configured");
    }

    // Create Onfido applicant if not provided
    let finalApplicantId = applicantId;
    
    if (!finalApplicantId) {
      logStep("Creating Onfido applicant");
      
      const applicantResponse = await fetch("https://api.eu.onfido.com/v3.6/applicants", {
        method: "POST",
        headers: {
          "Authorization": `Token token=${onfidoToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          first_name: user.user_metadata?.first_name || "User",
          last_name: user.user_metadata?.last_name || "User",
          email: user.email
        })
      });

      if (!applicantResponse.ok) {
        throw new Error(`Failed to create Onfido applicant: ${applicantResponse.statusText}`);
      }

      const applicantData = await applicantResponse.json();
      finalApplicantId = applicantData.id;
      
      logStep("Onfido applicant created", { applicantId: finalApplicantId });
    }

    // If this is a webhook callback with check results
    if (checkResults) {
      logStep("Processing KYC check results", { checkResults });

      const isApproved = checkResults.result === "consider" || checkResults.result === "clear";
      const kycStatus = isApproved ? "approved" : "rejected";

      // Update user KYC status
      const { error: userUpdateError } = await supabaseClient
        .from("users")
        .update({
          kyc_status: kycStatus,
          kyc_documents: {
            onfido_applicant_id: finalApplicantId,
            check_results: checkResults,
            verified_at: new Date().toISOString()
          }
        })
        .eq("id", user.id);

      if (userUpdateError) {
        throw new Error(`Failed to update user KYC status: ${userUpdateError.message}`);
      }

      // Create KYC document record
      const { error: docError } = await supabaseClient
        .from("kyc_documents")
        .insert({
          user_id: user.id,
          document_type: documentType,
          file_name: `onfido_check_${finalApplicantId}`,
          file_url: `onfido://check/${checkResults.id}`,
          status: kycStatus,
          notes: `Onfido check result: ${checkResults.result}`
        });

      if (docError) {
        logStep("Warning: Failed to create KYC document record", { error: docError.message });
      }

      logStep("KYC verification completed", { status: kycStatus });

      return new Response(JSON.stringify({
        success: true,
        status: kycStatus,
        applicantId: finalApplicantId
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Generate Onfido SDK token for frontend
    logStep("Generating Onfido SDK token");
    
    const sdkTokenResponse = await fetch("https://api.eu.onfido.com/v3.6/sdk_token", {
      method: "POST",
      headers: {
        "Authorization": `Token token=${onfidoToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        applicant_id: finalApplicantId,
        application_id: Deno.env.get("ONFIDO_APPLICATION_ID") || "lovable-property-platform"
      })
    });

    if (!sdkTokenResponse.ok) {
      throw new Error(`Failed to generate SDK token: ${sdkTokenResponse.statusText}`);
    }

    const sdkTokenData = await sdkTokenResponse.json();
    
    logStep("SDK token generated successfully");

    return new Response(JSON.stringify({
      success: true,
      sdkToken: sdkTokenData.token,
      applicantId: finalApplicantId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in KYC verification", { message: errorMessage });
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});