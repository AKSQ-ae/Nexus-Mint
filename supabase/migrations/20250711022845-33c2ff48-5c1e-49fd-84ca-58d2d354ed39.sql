-- Add token supply data for the sample properties
INSERT INTO public.token_supply (
  property_id, total_supply, available_supply, reserved_supply, 
  token_price, minimum_investment
)
SELECT 
  id as property_id,
  10000 as total_supply,
  (10000 - COALESCE(tokens_issued, 0)) as available_supply,
  COALESCE(tokens_issued, 0) as reserved_supply,
  price_per_token as token_price,
  min_investment as minimum_investment
FROM public.properties 
WHERE title IN ('Modern Downtown Apartment', 'Luxury Villa in Emirates Hills', 'Downtown Penthouse');

-- Add missing RLS policies for security

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