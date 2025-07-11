-- Add sample property data with correct property types
INSERT INTO public.properties (
  title, description, price, price_per_token, location, city, state_province, country,
  address, bedrooms, bathrooms, sqft, property_type, images, amenities,
  is_active, is_featured, tokenization_active, total_tokens, tokens_issued,
  min_investment, funding_target, funding_deadline
) VALUES 
(
  'Modern Downtown Apartment',
  'Luxurious 2-bedroom apartment in the heart of Dubai Marina with stunning sea views and premium amenities.',
  2500000,
  250,
  'Dubai Marina, Dubai',
  'Dubai',
  'Dubai',
  'UAE',
  'Marina Walk, Dubai Marina',
  2,
  2,
  1200,
  'residential',
  '["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"]',
  '["Swimming Pool", "Gym", "24/7 Security", "Parking", "Balcony", "Sea View"]',
  true,
  true,
  true,
  10000,
  0,
  1000,
  2500000,
  '2024-12-31'
),
(
  'Luxury Villa in Emirates Hills',
  'Exclusive 5-bedroom villa with private pool and garden in the prestigious Emirates Hills community.',
  8500000,
  850,
  'Emirates Hills, Dubai',
  'Dubai',
  'Dubai', 
  'UAE',
  'Emirates Hills Boulevard',
  5,
  6,
  4500,
  'residential',
  '["https://images.unsplash.com/photo-1613977257363-707ba9348227", "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"]',
  '["Private Pool", "Garden", "Maid Room", "Driver Room", "Study", "Garage"]',
  true,
  true,
  true,
  10000,
  2500,
  5000,
  8500000,
  '2024-11-30'
),
(
  'Business Bay Office Tower',
  'Premium office space in Business Bay with panoramic city views, ideal for corporate headquarters.',
  15000000,
  1500,
  'Business Bay, Dubai',
  'Dubai',
  'Dubai',
  'UAE',
  'Business Bay Crossing',
  0,
  0,
  8000,
  'office',
  '["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab", "https://images.unsplash.com/photo-1497366216548-37526070297c"]',
  '["High-speed Internet", "Conference Rooms", "Reception Area", "Parking", "Security", "HVAC"]',
  true,
  false,
  true,
  10000,
  1200,
  10000,
  15000000,
  '2025-02-28'
);

-- Add corresponding token supply data
INSERT INTO public.token_supply (
  property_id, total_supply, available_supply, reserved_supply, 
  token_price, minimum_investment, maximum_investment
)
SELECT 
  id as property_id,
  total_tokens as total_supply,
  (total_tokens - COALESCE(tokens_issued, 0)) as available_supply,
  COALESCE(tokens_issued, 0) as reserved_supply,
  price_per_token as token_price,
  min_investment as minimum_investment,
  NULL as maximum_investment
FROM public.properties 
WHERE title IN ('Modern Downtown Apartment', 'Luxury Villa in Emirates Hills', 'Business Bay Office Tower');