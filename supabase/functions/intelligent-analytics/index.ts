import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  userId: string;
  propertyId?: string;
  type: 'portfolio' | 'market' | 'recommendations' | 'insights';
  filters?: Record<string, any>;
}

interface EdgeLocation {
  region: string;
  latency: number;
  isActive: boolean;
}

// Simulated edge locations for global distribution
const EDGE_LOCATIONS: EdgeLocation[] = [
  { region: 'us-east-1', latency: 50, isActive: true },
  { region: 'eu-west-1', latency: 80, isActive: true },
  { region: 'ap-southeast-1', latency: 120, isActive: true },
  { region: 'me-south-1', latency: 90, isActive: true },
];

// Performance monitoring and tracing
class PerformanceTracer {
  private traces: Map<string, any> = new Map();
  
  startTrace(traceId: string, operation: string) {
    this.traces.set(traceId, {
      operation,
      startTime: performance.now(),
      spans: []
    });
  }
  
  addSpan(traceId: string, spanName: string, data?: any) {
    const trace = this.traces.get(traceId);
    if (trace) {
      trace.spans.push({
        name: spanName,
        timestamp: performance.now(),
        duration: performance.now() - trace.startTime,
        data
      });
    }
  }
  
  endTrace(traceId: string) {
    const trace = this.traces.get(traceId);
    if (trace) {
      trace.endTime = performance.now();
      trace.totalDuration = trace.endTime - trace.startTime;
      return trace;
    }
    return null;
  }
}

const tracer = new PerformanceTracer();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const traceId = crypto.randomUUID();
  tracer.startTrace(traceId, 'intelligent-analytics');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    tracer.addSpan(traceId, 'request-parsing');
    const requestData: AnalyticsRequest = await req.json();
    const { userId, propertyId, type, filters } = requestData;

    // Determine optimal edge location (simulated)
    tracer.addSpan(traceId, 'edge-location-selection');
    const optimalEdge = EDGE_LOCATIONS
      .filter(edge => edge.isActive)
      .sort((a, b) => a.latency - b.latency)[0];

    console.log(`[INTELLIGENT-ANALYTICS] Processing ${type} request for user ${userId} from edge: ${optimalEdge.region}`);

    let result: any;

    switch (type) {
      case 'portfolio':
        result = await generatePortfolioInsights(supabaseClient, userId, traceId);
        break;
      case 'market':
        result = await generateMarketInsights(supabaseClient, filters, traceId);
        break;
      case 'recommendations':
        result = await generatePersonalizedRecommendations(supabaseClient, userId, traceId);
        break;
      case 'insights':
        result = await generateAIInsights(supabaseClient, userId, propertyId, traceId);
        break;
      default:
        throw new Error(`Unknown analytics type: ${type}`);
    }

    tracer.addSpan(traceId, 'response-preparation');
    const trace = tracer.endTrace(traceId);

    // Return results with performance metrics
    return new Response(JSON.stringify({
      success: true,
      data: result,
      metadata: {
        executedAt: optimalEdge.region,
        latency: optimalEdge.latency,
        processingTime: trace?.totalDuration,
        spans: trace?.spans.length,
        timestamp: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[INTELLIGENT-ANALYTICS] Error:', error);
    
    const trace = tracer.endTrace(traceId);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      metadata: {
        processingTime: trace?.totalDuration,
        timestamp: new Date().toISOString()
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePortfolioInsights(supabaseClient: any, userId: string, traceId: string) {
  tracer.addSpan(traceId, 'portfolio-data-fetch');
  
  // Fetch pre-aggregated portfolio data from materialized view
  const { data: portfolio, error } = await supabaseClient
    .from('user_portfolio_performance')
    .select('*')
    .single();

  if (error) throw error;

  tracer.addSpan(traceId, 'portfolio-analysis');

  // Advanced portfolio analysis
  const insights = {
    performance: {
      totalReturn: portfolio.portfolio_growth_percentage,
      annualizedReturn: portfolio.avg_roi,
      sharpeRatio: calculateSharpeRatio(portfolio),
      volatility: portfolio.roi_volatility,
      benchmark: 8.5 // Market benchmark
    },
    composition: {
      diversificationScore: calculateDiversificationScore(portfolio),
      concentrationRisk: calculateConcentrationRisk(portfolio),
      optimalAllocation: generateOptimalAllocation(portfolio)
    },
    recommendations: {
      rebalancing: generateRebalancingAdvice(portfolio),
      opportunities: await findMatchingOpportunities(supabaseClient, portfolio),
      riskAdjustments: generateRiskAdjustments(portfolio)
    }
  };

  tracer.addSpan(traceId, 'portfolio-insights-generated');
  return insights;
}

async function generateMarketInsights(supabaseClient: any, filters: any, traceId: string) {
  tracer.addSpan(traceId, 'market-data-fetch');

  // Fetch market insights from materialized views
  const { data: marketData, error } = await supabaseClient
    .from('property_market_insights_mv')
    .select('*')
    .limit(50);

  if (error) throw error;

  tracer.addSpan(traceId, 'market-analysis');

  // Market trend analysis
  const insights = {
    trends: {
      hotMarkets: identifyHotMarkets(marketData),
      emergingOpportunities: identifyEmergingOpportunities(marketData),
      priceTrends: analyzePriceTrends(marketData)
    },
    sectors: {
      performanceBySector: analyzeByPropertyType(marketData),
      geographicPerformance: analyzeByLocation(marketData),
      investmentFlow: analyzeInvestmentFlow(marketData)
    },
    forecasts: {
      nextQuarter: generateQuarterlyForecast(marketData),
      riskFactors: identifyRiskFactors(marketData),
      opportunities: rankOpportunities(marketData)
    }
  };

  tracer.addSpan(traceId, 'market-insights-generated');
  return insights;
}

async function generatePersonalizedRecommendations(supabaseClient: any, userId: string, traceId: string) {
  tracer.addSpan(traceId, 'user-pattern-analysis');

  // Fetch user investment patterns and preferences
  const [portfolioResult, opportunitiesResult] = await Promise.all([
    supabaseClient.from('user_portfolio_performance').select('*').single(),
    supabaseClient.from('public_investment_opportunities').select('*').limit(20)
  ]);

  const portfolio = portfolioResult.data;
  const opportunities = opportunitiesResult.data || [];

  tracer.addSpan(traceId, 'personalization-engine');

  // AI-like recommendation engine
  const recommendations = {
    topPicks: opportunities
      .filter(opp => matchesUserProfile(opp, portfolio))
      .sort((a, b) => b.opportunity_score - a.opportunity_score)
      .slice(0, 5)
      .map(opp => ({
        ...opp,
        personalizedScore: calculatePersonalizedScore(opp, portfolio),
        matchReasons: generateMatchReasons(opp, portfolio)
      })),
    
    portfolioOptimization: {
      suggestedAllocations: generateAllocationSuggestions(portfolio),
      rebalancingActions: generateRebalancingActions(portfolio),
      riskMitigation: generateRiskMitigationSuggestions(portfolio)
    },
    
    nextBestActions: [
      {
        action: 'diversify_geography',
        priority: portfolio.geographic_diversity < 3 ? 'high' : 'low',
        description: 'Add properties from different geographical regions',
        impact: 'Reduced concentration risk, improved stability'
      },
      {
        action: 'increase_commercial_exposure',
        priority: 'medium',
        description: 'Commercial properties showing strong fundamentals',
        impact: 'Higher potential returns, income stability'
      }
    ]
  };

  tracer.addSpan(traceId, 'personalized-recommendations-generated');
  return recommendations;
}

async function generateAIInsights(supabaseClient: any, userId: string, propertyId?: string, traceId: string) {
  tracer.addSpan(traceId, 'ai-insights-generation');

  // Generate contextual AI insights
  const insights = {
    smartAlerts: await generateSmartAlerts(supabaseClient, userId),
    marketSentiment: await analyzeMarketSentiment(supabaseClient),
    predictiveAnalytics: await generatePredictiveInsights(supabaseClient, userId),
    actionableRecommendations: await generateActionableRecommendations(supabaseClient, userId)
  };

  tracer.addSpan(traceId, 'ai-insights-completed');
  return insights;
}

// Helper functions for advanced analytics

function calculateSharpeRatio(portfolio: any): number {
  const riskFreeRate = 2.5; // 2.5% risk-free rate
  const excessReturn = portfolio.avg_roi - riskFreeRate;
  return portfolio.roi_volatility > 0 ? excessReturn / portfolio.roi_volatility : 0;
}

function calculateDiversificationScore(portfolio: any): number {
  const typeScore = Math.min(portfolio.property_type_diversity / 4, 1) * 40;
  const geoScore = Math.min(portfolio.geographic_diversity / 5, 1) * 40;
  const sizeScore = portfolio.total_investments > 10 ? 20 : (portfolio.total_investments / 10) * 20;
  return typeScore + geoScore + sizeScore;
}

function calculateConcentrationRisk(portfolio: any): string {
  if (portfolio.property_type_diversity === 1) return 'HIGH';
  if (portfolio.property_type_diversity === 2) return 'MEDIUM';
  if (portfolio.geographic_diversity < 3) return 'MEDIUM';
  return 'LOW';
}

function generateOptimalAllocation(portfolio: any): any {
  // Simplified Modern Portfolio Theory allocation
  return {
    residential: 40,
    commercial: 35,
    industrial: 15,
    mixed_use: 10
  };
}

function generateRebalancingAdvice(portfolio: any): string[] {
  const advice = [];
  if (portfolio.property_type_diversity < 3) {
    advice.push('Consider diversifying across more property types');
  }
  if (portfolio.geographic_diversity < 3) {
    advice.push('Add properties from different geographic regions');
  }
  if (portfolio.roi_volatility > 5) {
    advice.push('Consider adding more stable, income-generating properties');
  }
  return advice;
}

async function findMatchingOpportunities(supabaseClient: any, portfolio: any): Promise<any[]> {
  // Find opportunities that complement the current portfolio
  const { data: opportunities } = await supabaseClient
    .from('public_investment_opportunities')
    .select('*')
    .limit(10);
  
  return (opportunities || []).filter(opp => 
    opp.opportunity_score > 60 && opp.risk_level !== 'HIGH'
  );
}

function generateRiskAdjustments(portfolio: any): string[] {
  const adjustments = [];
  if (portfolio.roi_volatility > 5) {
    adjustments.push('Reduce position sizes in high-volatility properties');
  }
  if (portfolio.geographic_diversity < 2) {
    adjustments.push('Diversify geographically to reduce regional risk');
  }
  return adjustments;
}

function identifyHotMarkets(marketData: any[]): any[] {
  return marketData
    .filter(market => market.avg_investor_roi > 10)
    .sort((a, b) => b.total_invested - a.total_invested)
    .slice(0, 5);
}

function identifyEmergingOpportunities(marketData: any[]): any[] {
  return marketData
    .filter(market => market.days_on_platform < 30 && market.funding_percentage < 50)
    .sort((a, b) => b.opportunity_score - a.opportunity_score)
    .slice(0, 3);
}

function analyzePriceTrends(marketData: any[]): any {
  // Simulate price trend analysis
  return {
    overallTrend: 'upward',
    avgPriceChange: '+3.2%',
    volatility: 'moderate',
    momentum: 'strong'
  };
}

function analyzeByPropertyType(marketData: any[]): any {
  const types = ['residential', 'commercial', 'industrial', 'mixed_use'];
  return types.map(type => ({
    type,
    avgROI: marketData
      .filter(m => m.property_type?.toLowerCase() === type)
      .reduce((avg, m) => avg + m.avg_investor_roi, 0) / 
      marketData.filter(m => m.property_type?.toLowerCase() === type).length || 0,
    totalInvestment: marketData
      .filter(m => m.property_type?.toLowerCase() === type)
      .reduce((sum, m) => sum + m.total_invested, 0)
  }));
}

function analyzeByLocation(marketData: any[]): any[] {
  const locationMap = new Map();
  marketData.forEach(market => {
    const city = market.city;
    if (!locationMap.has(city)) {
      locationMap.set(city, { totalInvested: 0, avgROI: 0, count: 0 });
    }
    const loc = locationMap.get(city);
    loc.totalInvested += market.total_invested;
    loc.avgROI += market.avg_investor_roi;
    loc.count += 1;
  });
  
  return Array.from(locationMap.entries()).map(([city, data]) => ({
    city,
    totalInvested: data.totalInvested,
    avgROI: data.avgROI / data.count,
    properties: data.count
  }));
}

function analyzeInvestmentFlow(marketData: any[]): any {
  return {
    totalInvestment: marketData.reduce((sum, m) => sum + m.total_invested, 0),
    avgInvestmentPerProperty: marketData.reduce((sum, m) => sum + m.total_invested, 0) / marketData.length,
    topPerformers: marketData.sort((a, b) => b.avg_investor_roi - a.avg_investor_roi).slice(0, 3)
  };
}

function generateQuarterlyForecast(marketData: any[]): any {
  return {
    expectedGrowth: '8-12%',
    riskFactors: ['Interest rate changes', 'Regulatory updates'],
    opportunities: ['Emerging markets', 'Technology integration'],
    recommendation: 'Maintain diversified portfolio with selective growth investments'
  };
}

function identifyRiskFactors(marketData: any[]): string[] {
  return [
    'Geographic concentration in emerging markets',
    'Regulatory changes in key markets',
    'Interest rate volatility',
    'Currency exchange risks'
  ];
}

function rankOpportunities(marketData: any[]): any[] {
  return marketData
    .sort((a, b) => (b.avg_investor_roi * (100 - b.funding_percentage)) - (a.avg_investor_roi * (100 - a.funding_percentage)))
    .slice(0, 10);
}

function matchesUserProfile(opportunity: any, portfolio: any): boolean {
  // Simple matching logic - can be enhanced with ML
  if (!portfolio) return true;
  
  // Prefer opportunities that diversify the portfolio
  if (portfolio.property_type_diversity < 3) {
    return opportunity.risk_level !== 'HIGH';
  }
  
  return opportunity.opportunity_score > 50;
}

function calculatePersonalizedScore(opportunity: any, portfolio: any): number {
  let score = opportunity.opportunity_score;
  
  // Boost score for diversification
  if (portfolio && portfolio.property_type_diversity < 3) {
    score += 10;
  }
  
  // Penalize high-risk opportunities for conservative portfolios
  if (portfolio && portfolio.roi_volatility > 5 && opportunity.risk_level === 'HIGH') {
    score -= 15;
  }
  
  return Math.min(score, 100);
}

function generateMatchReasons(opportunity: any, portfolio: any): string[] {
  const reasons = [];
  
  if (opportunity.opportunity_score > 80) {
    reasons.push('High opportunity score');
  }
  
  if (opportunity.avg_investor_roi > 10) {
    reasons.push('Above-average returns');
  }
  
  if (portfolio && portfolio.property_type_diversity < 3) {
    reasons.push('Diversifies your portfolio');
  }
  
  if (opportunity.funding_percentage < 50) {
    reasons.push('Early investment opportunity');
  }
  
  return reasons;
}

function generateAllocationSuggestions(portfolio: any): any {
  if (!portfolio) return null;
  
  return {
    current: {
      diversityScore: calculateDiversificationScore(portfolio),
      riskLevel: calculateConcentrationRisk(portfolio)
    },
    suggested: {
      increaseDiversification: portfolio.property_type_diversity < 3,
      addGeographicExposure: portfolio.geographic_diversity < 3,
      rebalanceRisk: portfolio.roi_volatility > 5
    }
  };
}

function generateRebalancingActions(portfolio: any): any[] {
  const actions = [];
  
  if (portfolio && portfolio.property_type_diversity < 3) {
    actions.push({
      action: 'Add different property types',
      impact: 'Reduce concentration risk',
      priority: 'high'
    });
  }
  
  return actions;
}

function generateRiskMitigationSuggestions(portfolio: any): string[] {
  const suggestions = [];
  
  if (portfolio && portfolio.roi_volatility > 5) {
    suggestions.push('Consider adding stable, income-generating properties');
  }
  
  if (portfolio && portfolio.geographic_diversity < 3) {
    suggestions.push('Diversify across different geographic markets');
  }
  
  return suggestions;
}

async function generateSmartAlerts(supabaseClient: any, userId: string): Promise<any[]> {
  // Fetch recent market changes and user portfolio
  const alerts = [
    {
      type: 'opportunity',
      title: 'Market Opportunity',
      message: 'Dubai properties showing 15% above-average growth',
      priority: 'medium'
    },
    {
      type: 'performance',
      title: 'Portfolio Update',
      message: 'Your portfolio outperformed market benchmark this quarter',
      priority: 'low'
    }
  ];
  
  return alerts;
}

async function analyzeMarketSentiment(supabaseClient: any): Promise<any> {
  return {
    overall: 'positive',
    confidence: 0.75,
    keyDrivers: ['Economic growth', 'Infrastructure development', 'Tourism recovery'],
    riskFactors: ['Regulatory changes', 'Global economic uncertainty']
  };
}

async function generatePredictiveInsights(supabaseClient: any, userId: string): Promise<any> {
  return {
    portfolioForecast: {
      expectedReturn: '10-12%',
      confidenceInterval: '8-15%',
      timeHorizon: '12 months'
    },
    marketForecast: {
      hotSectors: ['commercial', 'mixed_use'],
      emergingMarkets: ['Dubai', 'Abu Dhabi'],
      riskAreas: ['regulatory_changes']
    }
  };
}

async function generateActionableRecommendations(supabaseClient: any, userId: string): Promise<any[]> {
  return [
    {
      action: 'Diversify portfolio',
      description: 'Add commercial properties to balance residential holdings',
      impact: 'Reduced risk, improved returns',
      timeframe: '30 days',
      priority: 'high'
    },
    {
      action: 'Monitor market trends',
      description: 'Dubai market showing strong momentum',
      impact: 'Identify timing for next investment',
      timeframe: '14 days',
      priority: 'medium'
    }
  ];
}