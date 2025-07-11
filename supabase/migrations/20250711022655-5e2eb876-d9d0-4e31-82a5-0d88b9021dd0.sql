-- Add sample property data
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
  'apartment',
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
  'villa',
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
  'Premium commercial space in Business Bay with panoramic city views, ideal for corporate headquarters.',
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
  'commercial',
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

-- Add missing RLS policies for security

-- Chat messages policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their rooms" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_participants 
    WHERE room_id = chat_messages.room_id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
);

CREATE POLICY "Users can insert messages in their rooms" ON public.chat_messages
FOR INSERT WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.chat_room_participants 
    WHERE room_id = chat_messages.room_id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
);

-- Chat room participants policies
ALTER TABLE public.chat_room_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their room participations" ON public.chat_room_participants
FOR SELECT USING (user_id = auth.uid());

-- Chat rooms policies
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public rooms and their rooms" ON public.chat_rooms
FOR SELECT USING (
  is_public = true OR 
  created_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.chat_room_participants 
    WHERE room_id = chat_rooms.id 
    AND user_id = auth.uid() 
    AND is_active = true
  )
);

-- Enhanced notifications policies
ALTER TABLE public.enhanced_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" ON public.enhanced_notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.enhanced_notifications
FOR UPDATE USING (user_id = auth.uid());

-- Investment analytics policies
ALTER TABLE public.investment_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their analytics" ON public.investment_analytics
FOR SELECT USING (user_id = auth.uid());

-- Market data policies (public read-only)
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market data is publicly viewable" ON public.market_data
FOR SELECT USING (true);

-- Property analytics policies (public read-only)
ALTER TABLE public.property_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property analytics are publicly viewable" ON public.property_analytics
FOR SELECT USING (true);

-- Property documents policies
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public documents are viewable by everyone" ON public.property_documents
FOR SELECT USING (is_public = true);

CREATE POLICY "KYC documents viewable by verified users" ON public.property_documents
FOR SELECT USING (
  requires_kyc = false OR 
  (requires_kyc = true AND 
   EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND kyc_status = 'approved'))
);

-- Property performance policies (public read-only)
ALTER TABLE public.property_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property performance is publicly viewable" ON public.property_performance
FOR SELECT USING (true);

-- Property tokens policies (public read-only)
ALTER TABLE public.property_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Property tokens are publicly viewable" ON public.property_tokens
FOR SELECT USING (true);

-- Smart contract events policies (admin only)
ALTER TABLE public.smart_contract_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage smart contract events" ON public.smart_contract_events
FOR ALL USING (public.is_admin(auth.uid()));

-- Token holders policies
ALTER TABLE public.token_holders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their token holdings" ON public.token_holders
FOR SELECT USING (user_id = auth.uid());

-- Transactions policies
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view transactions involving their address" ON public.transactions
FOR SELECT USING (
  from_address IN (SELECT wallet_address FROM public.user_profiles WHERE id = auth.uid()) OR
  to_address IN (SELECT wallet_address FROM public.user_profiles WHERE id = auth.uid())
);

-- User profiles policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- User role assignments policies
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_role_assignments
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all role assignments" ON public.user_role_assignments
FOR ALL USING (public.is_admin(auth.uid()));

-- User sessions policies
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sessions" ON public.user_sessions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sessions" ON public.user_sessions
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions" ON public.user_sessions
FOR UPDATE USING (user_id = auth.uid());