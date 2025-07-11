import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CALCULATE-ANALYTICS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Analytics calculation started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.id) throw new Error("User not authenticated");

    const { user_id, property_id } = await req.json();
    const targetUserId = user_id || user.id;

    // Get user investments
    const { data: investments, error: investmentsError } = await supabaseClient
      .from('investments')
      .select(`
        *,
        properties (
          id,
          title,
          property_type,
          price,
          location
        )
      `)
      .eq('user_id', targetUserId)
      .in('status', ['confirmed', 'completed']);

    if (investmentsError) {
      throw new Error(`Failed to fetch investments: ${investmentsError.message}`);
    }

    logStep("Investments fetched", { count: investments?.length || 0 });

    // Calculate portfolio metrics
    const totalInvested = investments?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
    const totalTokens = investments?.reduce((sum, inv) => sum + (inv.token_amount || 0), 0) || 0;

    // Calculate current value with mock appreciation
    const currentValue = investments?.reduce((sum, inv) => {
      const investmentAge = new Date().getTime() - new Date(inv.created_at).getTime();
      const monthsOld = investmentAge / (1000 * 60 * 60 * 24 * 30);
      const annualReturn = inv.estimated_annual_return || 8.5;
      const currentVal = (inv.total_amount || 0) * (1 + (annualReturn / 100) * (monthsOld / 12));
      return sum + currentVal;
    }, 0) || 0;

    const totalGains = currentValue - totalInvested;
    const totalGainsPercentage = totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0;

    // Calculate property type distribution
    const propertyTypeDistribution: Record<string, number> = {};
    investments?.forEach(inv => {
      const type = inv.properties?.property_type || 'Unknown';
      propertyTypeDistribution[type] = (propertyTypeDistribution[type] || 0) + (inv.total_amount || 0);
    });

    // Calculate monthly performance data (last 12 months)
    const monthlyPerformance = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthlyInvestments = investments?.filter(inv => {
        const invDate = new Date(inv.created_at);
        return invDate <= date;
      }) || [];

      const monthlyInvested = monthlyInvestments.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
      const monthlyValue = monthlyInvestments.reduce((sum, inv) => {
        const investmentAge = date.getTime() - new Date(inv.created_at).getTime();
        const monthsOld = investmentAge / (1000 * 60 * 60 * 24 * 30);
        const annualReturn = inv.estimated_annual_return || 8.5;
        const currentVal = (inv.total_amount || 0) * (1 + (annualReturn / 100) * (monthsOld / 12));
        return sum + currentVal;
      }, 0);

      monthlyPerformance.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        invested: monthlyInvested,
        value: monthlyValue,
        returns: monthlyValue - monthlyInvested
      });
    }

    // Store analytics in database
    const analyticsData = {
      user_id: targetUserId,
      property_id: property_id || null,
      metric_type: 'portfolio_summary',
      metric_value: currentValue,
      metric_data: {
        total_invested: totalInvested,
        current_value: currentValue,
        total_tokens: totalTokens,
        total_gains: totalGains,
        total_gains_percentage: totalGainsPercentage,
        properties_count: investments?.length || 0,
        property_type_distribution: propertyTypeDistribution,
        monthly_performance: monthlyPerformance
      },
      calculated_at: new Date().toISOString()
    };

    const { error: analyticsError } = await supabaseClient
      .from('investment_analytics')
      .insert(analyticsData);

    if (analyticsError) {
      logStep("Warning: Failed to store analytics", { error: analyticsError.message });
    }

    // Update user profile with calculated totals
    const { error: profileError } = await supabaseClient
      .from('user_profiles')
      .update({
        total_invested: totalInvested,
        total_returns: totalGains,
        properties_owned: investments?.length || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId);

    if (profileError) {
      logStep("Warning: Failed to update user profile", { error: profileError.message });
    }

    logStep("Analytics calculated successfully", {
      totalInvested,
      currentValue,
      totalGains,
      propertiesCount: investments?.length || 0
    });

    return new Response(JSON.stringify({
      success: true,
      analytics: {
        total_invested: totalInvested,
        current_value: currentValue,
        total_tokens: totalTokens,
        total_gains: totalGains,
        total_gains_percentage: totalGainsPercentage,
        properties_count: investments?.length || 0,
        property_type_distribution: propertyTypeDistribution,
        monthly_performance: monthlyPerformance
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in calculate-analytics", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});