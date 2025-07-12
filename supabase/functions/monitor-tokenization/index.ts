import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[MONITOR-TOKENIZATION] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");

    const { action, processId, propertyId, stepName, status, stepData, errorDetails } = await req.json();
    logStep("Processing action", { action, processId, propertyId });

    switch (action) {
      case "create_process": {
        const { data: process, error } = await supabaseClient
          .from("tokenization_processes")
          .insert({
            property_id: propertyId,
            user_id: user.id,
            process_type: "property_tokenization",
            status: "started",
            current_step: "initialization",
            progress_percentage: 0
          })
          .select()
          .single();

        if (error) throw error;

        // Create initial steps
        const steps = [
          { name: "initialization", order: 1 },
          { name: "property_audit", order: 2 },
          { name: "legal_review", order: 3 },
          { name: "smart_contract_deployment", order: 4 },
          { name: "token_generation", order: 5 },
          { name: "compliance_verification", order: 6 },
          { name: "launch_preparation", order: 7 },
          { name: "completion", order: 8 }
        ];

        const { error: stepsError } = await supabaseClient
          .from("tokenization_steps")
          .insert(
            steps.map(step => ({
              process_id: process.id,
              step_name: step.name,
              step_order: step.order,
              status: step.order === 1 ? "in_progress" : "pending"
            }))
          );

        if (stepsError) throw stepsError;

        logStep("Process created", { processId: process.id });
        return new Response(JSON.stringify({ process }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "update_step": {
        const { data: currentProcess, error: processError } = await supabaseClient
          .from("tokenization_processes")
          .select("*")
          .eq("id", processId)
          .eq("user_id", user.id)
          .single();

        if (processError) throw processError;

        // Update the specific step
        const { error: stepError } = await supabaseClient
          .from("tokenization_steps")
          .update({
            status,
            started_at: status === "in_progress" ? new Date().toISOString() : undefined,
            completed_at: status === "completed" ? new Date().toISOString() : undefined,
            step_data: stepData || {},
            error_details: errorDetails || null
          })
          .eq("process_id", processId)
          .eq("step_name", stepName);

        if (stepError) throw stepError;

        // Calculate progress
        const { data: allSteps, error: allStepsError } = await supabaseClient
          .from("tokenization_steps")
          .select("*")
          .eq("process_id", processId)
          .order("step_order");

        if (allStepsError) throw allStepsError;

        const completedSteps = allSteps.filter(step => step.status === "completed").length;
        const totalSteps = allSteps.length;
        const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

        // Update process
        const processStatus = status === "failed" ? "failed" : 
                             progressPercentage === 100 ? "completed" : "in_progress";

        const { error: updateError } = await supabaseClient
          .from("tokenization_processes")
          .update({
            current_step: stepName,
            progress_percentage: progressPercentage,
            status: processStatus,
            completed_at: processStatus === "completed" ? new Date().toISOString() : null,
            steps_completed: allSteps.filter(s => s.status === "completed").map(s => s.step_name),
            error_logs: status === "failed" ? [...(currentProcess.error_logs || []), {
              step: stepName,
              error: errorDetails,
              timestamp: new Date().toISOString()
            }] : currentProcess.error_logs
          })
          .eq("id", processId);

        if (updateError) throw updateError;

        logStep("Step updated", { stepName, status, progressPercentage });
        return new Response(JSON.stringify({ 
          success: true, 
          progressPercentage,
          status: processStatus
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "get_process": {
        const { data: process, error: processError } = await supabaseClient
          .from("tokenization_processes")
          .select(`
            *,
            tokenization_steps(*),
            properties(title, location)
          `)
          .eq("id", processId)
          .eq("user_id", user.id)
          .single();

        if (processError) throw processError;

        return new Response(JSON.stringify({ process }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      case "list_processes": {
        const { data: processes, error } = await supabaseClient
          .from("tokenization_processes")
          .select(`
            *,
            properties(title, location, price),
            tokenization_reports(count)
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        return new Response(JSON.stringify({ processes }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});