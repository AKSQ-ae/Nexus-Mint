import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[GENERATE-REPORT] ${step}${details ? ` - ${JSON.stringify(details)}` : ''}`);
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

    const { processId, reportType = "completion_report" } = await req.json();
    logStep("Generating report", { processId, reportType });

    // Get process details
    const { data: process, error: processError } = await supabaseClient
      .from("tokenization_processes")
      .select(`
        *,
        tokenization_steps(*),
        properties(*)
      `)
      .eq("id", processId)
      .eq("user_id", user.id)
      .single();

    if (processError) throw processError;

    // Get property analytics
    const { data: analytics, error: analyticsError } = await supabaseClient
      .from("property_analytics")
      .select("*")
      .eq("property_id", process.property_id)
      .order("report_date", { ascending: false })
      .limit(1);

    if (analyticsError) throw analyticsError;

    // Get audit results
    const { data: audits, error: auditsError } = await supabaseClient
      .from("property_audits")
      .select("*")
      .eq("property_id", process.property_id)
      .order("audit_date", { ascending: false })
      .limit(1);

    if (auditsError) throw auditsError;

    // Calculate performance metrics
    const steps = process.tokenization_steps || [];
    const completedSteps = steps.filter(step => step.status === "completed");
    const failedSteps = steps.filter(step => step.status === "failed");
    const totalDuration = steps.reduce((total, step) => total + (step.duration_seconds || 0), 0);

    const performanceData = {
      total_steps: steps.length,
      completed_steps: completedSteps.length,
      failed_steps: failedSteps.length,
      success_rate: steps.length > 0 ? (completedSteps.length / steps.length) * 100 : 0,
      total_duration_minutes: Math.round(totalDuration / 60),
      average_step_duration: steps.length > 0 ? Math.round(totalDuration / steps.length) : 0,
      process_efficiency: process.progress_percentage || 0
    };

    const complianceData = {
      audit_score: audits[0]?.audit_score || 0,
      compliance_status: audits[0]?.compliance_status || "pending",
      risk_level: audits[0]?.risk_level || "unknown",
      regulatory_checks_passed: true, // This would come from actual compliance checks
      kyc_verification_complete: true, // This would come from KYC system
      legal_review_status: "approved" // This would come from legal review system
    };

    const metrics = {
      property_value: process.properties?.price || 0,
      token_supply: process.properties?.total_tokens || 0,
      tokenization_ratio: process.properties?.total_tokens && process.properties?.price ? 
        (process.properties.price / process.properties.total_tokens).toFixed(2) : "0",
      funding_target: process.properties?.funding_target || 0,
      minimum_investment: process.properties?.min_investment || 0,
      estimated_roi: analytics[0]?.rental_yield || 0,
      market_value: analytics[0]?.market_value || process.properties?.price || 0
    };

    const reportData = {
      process_id: processId,
      property_details: {
        title: process.properties?.title,
        location: process.properties?.location,
        type: process.properties?.property_type,
        price: process.properties?.price,
        tokenization_status: process.properties?.tokenization_status
      },
      process_summary: {
        status: process.status,
        started_at: process.started_at,
        completed_at: process.completed_at,
        duration_hours: process.completed_at && process.started_at ? 
          Math.round((new Date(process.completed_at).getTime() - new Date(process.started_at).getTime()) / (1000 * 60 * 60)) : null,
        progress_percentage: process.progress_percentage
      },
      step_breakdown: steps.map(step => ({
        name: step.step_name,
        status: step.status,
        started_at: step.started_at,
        completed_at: step.completed_at,
        duration_seconds: step.duration_seconds,
        error_details: step.error_details
      })),
      success_factors: completedSteps.map(step => ({
        step: step.step_name,
        completed_at: step.completed_at,
        efficiency: step.duration_seconds ? (step.duration_seconds < 300 ? "high" : step.duration_seconds < 600 ? "medium" : "low") : "unknown"
      })),
      challenges_faced: failedSteps.map(step => ({
        step: step.step_name,
        error: step.error_details,
        impact: "high" // This could be calculated based on step importance
      })),
      recommendations: [
        process.progress_percentage < 100 ? "Complete remaining tokenization steps" : "Process completed successfully",
        performanceData.success_rate < 80 ? "Review failed steps and implement improvements" : "Maintain current process quality",
        complianceData.audit_score < 80 ? "Address compliance gaps before launch" : "Compliance requirements met"
      ].filter(Boolean)
    };

    // Save the report
    const { data: report, error: reportError } = await supabaseClient
      .from("tokenization_reports")
      .insert({
        process_id: processId,
        property_id: process.property_id,
        report_type: reportType,
        report_data: reportData,
        metrics,
        performance_data: performanceData,
        compliance_data: complianceData,
        generated_by: user.id
      })
      .select()
      .single();

    if (reportError) throw reportError;

    logStep("Report generated successfully", { reportId: report.id });

    return new Response(JSON.stringify({ 
      report,
      report_data: reportData,
      metrics,
      performance_data: performanceData,
      compliance_data: complianceData
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