-- Create materialized views for predictive analytics and performance optimization

-- 1. Portfolio Performance Materialized View - Pre-aggregated portfolio metrics
CREATE MATERIALIZED VIEW public.portfolio_performance_mv AS
SELECT 
  user_id,
  COUNT(*) as total_investments,
  SUM(total_amount) as total_invested,
  SUM(COALESCE(current_value, total_amount)) as current_value,
  SUM(token_amount) as total_tokens,
  AVG(COALESCE(roi_percentage, 0)) as avg_roi,
  MAX(created_at) as last_investment_date,
  -- Growth metrics
  SUM(COALESCE(current_value, total_amount) - total_amount) as total_gains,
  CASE 
    WHEN SUM(total_amount) > 0 THEN 
      (SUM(COALESCE(current_value, total_amount) - total_amount) / SUM(total_amount)) * 100
    ELSE 0 
  END as portfolio_growth_percentage,
  -- Property type diversification
  COUNT(DISTINCT p.property_type) as property_type_diversity,
  -- Geographic diversification
  COUNT(DISTINCT p.city) as geographic_diversity,
  -- Risk metrics
  STDDEV(COALESCE(roi_percentage, 0)) as roi_volatility
FROM public.investments i
LEFT JOIN public.properties p ON i.property_id = p.id
WHERE i.status IN ('confirmed', 'completed', 'pending')
GROUP BY user_id;

-- Create unique index for fast lookups
CREATE UNIQUE INDEX idx_portfolio_performance_mv_user_id ON public.portfolio_performance_mv(user_id);

-- 2. Property Market Insights - Pre-aggregated property analytics
CREATE MATERIALIZED VIEW public.property_market_insights_mv AS
SELECT 
  p.id as property_id,
  p.title,
  p.city,
  p.country,
  p.property_type,
  p.price,
  p.price_per_token,
  -- Investment metrics
  COUNT(i.id) as total_investors,
  SUM(i.total_amount) as total_invested,
  SUM(i.token_amount) as tokens_issued,
  COALESCE(p.total_tokens, 1000) - SUM(i.token_amount) as available_tokens,
  -- Performance metrics
  AVG(COALESCE(i.roi_percentage, 0)) as avg_investor_roi,
  -- Market positioning
  RANK() OVER (PARTITION BY p.property_type ORDER BY COUNT(i.id) DESC) as popularity_rank,
  RANK() OVER (PARTITION BY p.city ORDER BY SUM(i.total_amount) DESC) as investment_volume_rank,
  -- Funding progress
  CASE 
    WHEN p.funding_target > 0 THEN (SUM(i.total_amount) / p.funding_target) * 100
    ELSE 0 
  END as funding_percentage,
  -- Time to market metrics
  EXTRACT(DAYS FROM NOW() - p.created_at) as days_on_platform,
  -- Price trends (mock calculation for now)
  p.price_per_token * (1 + (RANDOM() * 0.1 - 0.05)) as estimated_current_price
FROM public.properties p
LEFT JOIN public.investments i ON p.id = i.property_id AND i.status IN ('confirmed', 'completed')
WHERE p.is_active = true
GROUP BY p.id, p.title, p.city, p.country, p.property_type, p.price, p.price_per_token, p.total_tokens, p.funding_target, p.created_at;

-- Create indexes for efficient querying
CREATE INDEX idx_property_market_insights_mv_city ON public.property_market_insights_mv(city);
CREATE INDEX idx_property_market_insights_mv_type ON public.property_market_insights_mv(property_type);
CREATE INDEX idx_property_market_insights_mv_popularity ON public.property_market_insights_mv(popularity_rank);

-- 3. Investment Opportunities Scoring - AI-like recommendations
CREATE MATERIALIZED VIEW public.investment_opportunities_mv AS
SELECT 
  p.id as property_id,
  p.title,
  p.city,
  p.property_type,
  p.price_per_token,
  -- Opportunity scoring factors
  CASE 
    WHEN pmi.funding_percentage < 50 THEN 20  -- Early opportunity bonus
    WHEN pmi.funding_percentage < 80 THEN 10
    ELSE 5
  END +
  CASE 
    WHEN pmi.avg_investor_roi > 10 THEN 25    -- High ROI bonus
    WHEN pmi.avg_investor_roi > 5 THEN 15
    ELSE 5
  END +
  CASE 
    WHEN pmi.total_investors < 10 THEN 15     -- Low competition bonus
    WHEN pmi.total_investors < 50 THEN 10
    ELSE 5
  END +
  CASE 
    WHEN pmi.days_on_platform < 30 THEN 10   -- New listing bonus
    ELSE 0
  END as opportunity_score,
  -- Risk factors
  CASE 
    WHEN pmi.total_investors = 0 THEN 'HIGH'
    WHEN pmi.total_investors < 5 THEN 'MEDIUM-HIGH'
    WHEN pmi.total_investors < 20 THEN 'MEDIUM'
    WHEN pmi.total_investors < 50 THEN 'LOW-MEDIUM'
    ELSE 'LOW'
  END as risk_level,
  -- Market insights
  pmi.funding_percentage,
  pmi.total_investors,
  pmi.avg_investor_roi,
  pmi.popularity_rank,
  -- Recommendation reasons
  ARRAY[
    CASE WHEN pmi.funding_percentage < 50 THEN 'Early Investment Opportunity' END,
    CASE WHEN pmi.avg_investor_roi > 10 THEN 'High ROI Potential' END,
    CASE WHEN pmi.total_investors < 10 THEN 'Low Competition' END,
    CASE WHEN pmi.days_on_platform < 30 THEN 'New to Platform' END,
    CASE WHEN pmi.popularity_rank <= 3 THEN 'Trending in ' || p.property_type END
  ]::text[] as recommendation_reasons
FROM public.properties p
JOIN public.property_market_insights_mv pmi ON p.id = pmi.property_id
WHERE p.is_active = true
  AND pmi.available_tokens > 0
ORDER BY opportunity_score DESC;

-- 4. User Investment Pattern Analysis - For personalized recommendations
CREATE MATERIALIZED VIEW public.user_investment_patterns_mv AS
SELECT 
  user_id,
  -- Preference analysis
  MODE() WITHIN GROUP (ORDER BY p.property_type) as preferred_property_type,
  MODE() WITHIN GROUP (ORDER BY p.city) as preferred_city,
  AVG(i.total_amount) as avg_investment_size,
  MIN(i.total_amount) as min_investment_size,
  MAX(i.total_amount) as max_investment_size,
  -- Investment behavior
  COUNT(*) as total_investments,
  EXTRACT(DAYS FROM NOW() - MIN(i.created_at)) as days_investing,
  EXTRACT(DAYS FROM AVG(i.created_at - LAG(i.created_at) OVER (PARTITION BY user_id ORDER BY i.created_at))) as avg_days_between_investments,
  -- Risk profile
  STDDEV(i.total_amount) as investment_size_volatility,
  COUNT(DISTINCT p.property_type) as property_type_diversity,
  COUNT(DISTINCT p.city) as geographic_diversity,
  -- Performance tracking
  AVG(COALESCE(i.roi_percentage, 0)) as avg_performance,
  SUM(i.total_amount) as total_invested_lifetime
FROM public.investments i
JOIN public.properties p ON i.property_id = p.id
WHERE i.status IN ('confirmed', 'completed')
GROUP BY user_id
HAVING COUNT(*) >= 1;

-- Create refresh function for materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.portfolio_performance_mv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.property_market_insights_mv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.investment_opportunities_mv;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.user_investment_patterns_mv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up automated refresh (every hour)
SELECT cron.schedule(
  'refresh-analytics-views',
  '0 * * * *', -- Every hour
  $$SELECT refresh_analytics_views();$$
);

-- Grant appropriate permissions
GRANT SELECT ON public.portfolio_performance_mv TO authenticated;
GRANT SELECT ON public.property_market_insights_mv TO authenticated;
GRANT SELECT ON public.investment_opportunities_mv TO authenticated;
GRANT SELECT ON public.user_investment_patterns_mv TO authenticated;

-- RLS policies for materialized views
ALTER TABLE public.portfolio_performance_mv ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own portfolio performance" ON public.portfolio_performance_mv
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE public.property_market_insights_mv ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view property market insights" ON public.property_market_insights_mv
  FOR SELECT USING (true);

ALTER TABLE public.investment_opportunities_mv ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view investment opportunities" ON public.investment_opportunities_mv
  FOR SELECT USING (true);

ALTER TABLE public.user_investment_patterns_mv ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own investment patterns" ON public.user_investment_patterns_mv
  FOR SELECT USING (user_id = auth.uid());