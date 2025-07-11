import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-PROPERTY-DATA] ${step}${detailsStr}`);
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
    logStep("Property data sync started");

    // Get all active properties
    const { data: properties, error: propertiesError } = await supabaseClient
      .from('properties')
      .select('*')
      .eq('is_active', true);

    if (propertiesError) {
      throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
    }

    logStep("Properties fetched", { count: properties?.length || 0 });

    const updatedProperties = [];

    for (const property of properties || []) {
      try {
        // Calculate funding progress
        const { data: investments, error: invError } = await supabaseClient
          .from('investments')
          .select('total_amount, token_amount')
          .eq('property_id', property.id)
          .in('status', ['confirmed', 'completed']);

        const totalInvested = investments?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
        const totalTokensSold = investments?.reduce((sum, inv) => sum + (inv.token_amount || 0), 0) || 0;
        const fundingProgress = property.funding_target ? (totalInvested / property.funding_target) * 100 : 0;

        // Calculate estimated valuation based on market trends
        const basePrice = property.price;
        const monthsSinceListing = Math.floor(
          (Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
        );
        
        // Mock appreciation based on property type
        const appreciationRates: Record<string, number> = {
          'RESIDENTIAL': 0.5, // 0.5% per month
          'COMMERCIAL': 0.7,  // 0.7% per month
          'INDUSTRIAL': 0.4,  // 0.4% per month
          'MIXED_USE': 0.6   // 0.6% per month
        };

        const monthlyAppreciation = appreciationRates[property.property_type] || 0.5;
        const currentValuation = basePrice * (1 + (monthlyAppreciation / 100) * monthsSinceListing);

        // Calculate ROI metrics
        const occupancyRate = 85 + Math.random() * 10; // Mock occupancy rate 85-95%
        const annualRentalIncome = currentValuation * 0.08; // 8% rental yield
        const maintenanceCosts = annualRentalIncome * 0.15; // 15% for maintenance
        const netRentalIncome = annualRentalIncome - maintenanceCosts;
        const roiPercentage = (netRentalIncome / currentValuation) * 100;

        // Update property performance
        const performanceData = {
          property_id: property.id,
          valuation: currentValuation,
          rental_income: netRentalIncome,
          occupancy_rate: occupancyRate,
          maintenance_costs: maintenanceCosts,
          market_performance: monthlyAppreciation,
          roi_percentage: roiPercentage,
          report_date: new Date().toISOString().split('T')[0]
        };

        const { error: perfError } = await supabaseClient
          .from('property_performance')
          .upsert(performanceData, {
            onConflict: 'property_id,report_date'
          });

        if (perfError) {
          logStep(`Warning: Failed to update performance for property ${property.id}`, { error: perfError.message });
        }

        // Update token supply if needed
        const { data: tokenSupply, error: tokenError } = await supabaseClient
          .from('token_supply')
          .select('*')
          .eq('property_id', property.id)
          .single();

        if (!tokenSupply && !tokenError) {
          // Create token supply record if it doesn't exist
          const totalTokens = property.total_tokens || Math.floor(property.price / (property.price_per_token || 100));
          const availableTokens = totalTokens - totalTokensSold;

          const { error: supplyError } = await supabaseClient
            .from('token_supply')
            .insert({
              property_id: property.id,
              total_supply: totalTokens,
              available_supply: Math.max(0, availableTokens),
              token_price: property.price_per_token || 100,
              minimum_investment: property.min_investment || 100,
              last_price_update: new Date().toISOString()
            });

          if (supplyError) {
            logStep(`Warning: Failed to create token supply for property ${property.id}`, { error: supplyError.message });
          }
        }

        // Update property with latest data
        const { error: updateError } = await supabaseClient
          .from('properties')
          .update({
            tokens_issued: totalTokensSold,
            last_synced: new Date().toISOString()
          })
          .eq('id', property.id);

        if (!updateError) {
          updatedProperties.push({
            id: property.id,
            title: property.title,
            total_invested: totalInvested,
            tokens_sold: totalTokensSold,
            funding_progress: fundingProgress,
            current_valuation: currentValuation,
            roi_percentage: roiPercentage
          });
        }

        // Create analytics records for significant events
        if (fundingProgress >= 100 && property.tokenization_status !== 'fully_funded') {
          await supabaseClient
            .from('properties')
            .update({ tokenization_status: 'fully_funded' })
            .eq('id', property.id);

          // Notify investors
          const { data: propertyInvestors } = await supabaseClient
            .from('investments')
            .select('user_id')
            .eq('property_id', property.id)
            .in('status', ['confirmed', 'completed']);

          const uniqueInvestors = [...new Set(propertyInvestors?.map(inv => inv.user_id) || [])];

          for (const investorId of uniqueInvestors) {
            await supabaseClient
              .from('enhanced_notifications')
              .insert({
                user_id: investorId,
                type: 'property_update',
                title: 'Property Fully Funded!',
                message: `The property "${property.title}" has reached its funding target. Your investment will now start generating returns.`,
                data: {
                  property_id: property.id,
                  funding_progress: 100
                },
                action_url: `/properties/${property.id}`
              });
          }
        }

      } catch (propertyError) {
        logStep(`Error processing property ${property.id}`, { error: propertyError });
        continue;
      }
    }

    logStep("Property data sync completed", { 
      propertiesProcessed: properties?.length || 0,
      propertiesUpdated: updatedProperties.length 
    });

    return new Response(JSON.stringify({
      success: true,
      properties_processed: properties?.length || 0,
      properties_updated: updatedProperties.length,
      updated_properties: updatedProperties
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in sync-property-data", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});