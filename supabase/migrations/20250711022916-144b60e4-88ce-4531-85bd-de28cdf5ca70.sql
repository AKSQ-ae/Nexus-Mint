-- Add token supply data manually with correct values
WITH property_data AS (
  SELECT id, price_per_token, min_investment, tokens_issued 
  FROM public.properties 
  WHERE title IN ('Modern Downtown Apartment', 'Luxury Villa in Emirates Hills', 'Downtown Penthouse')
)
INSERT INTO public.token_supply (
  property_id, total_supply, available_supply, reserved_supply, 
  token_price, minimum_investment
)
SELECT 
  id as property_id,
  10000 as total_supply,
  (10000 - COALESCE(tokens_issued, 0)) as available_supply,
  COALESCE(tokens_issued, 0) as reserved_supply,
  COALESCE(price_per_token, 100) as token_price,
  COALESCE(min_investment, 1000) as minimum_investment
FROM property_data;