-- Add RLS policies only
-- Enhanced notifications policies
ALTER TABLE public.enhanced_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their notifications" ON public.enhanced_notifications;
CREATE POLICY "Users can view their notifications" ON public.enhanced_notifications
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their notifications" ON public.enhanced_notifications;
CREATE POLICY "Users can update their notifications" ON public.enhanced_notifications
FOR UPDATE USING (user_id = auth.uid());

-- Investment analytics policies
ALTER TABLE public.investment_analytics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their analytics" ON public.investment_analytics;
CREATE POLICY "Users can view their analytics" ON public.investment_analytics
FOR SELECT USING (user_id = auth.uid());

-- User profiles policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
CREATE POLICY "Users can view their own profile" ON public.user_profiles
FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
CREATE POLICY "Users can update their own profile" ON public.user_profiles
FOR UPDATE USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
CREATE POLICY "Users can insert their own profile" ON public.user_profiles
FOR INSERT WITH CHECK (id = auth.uid());

-- User role assignments policies
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_role_assignments;
CREATE POLICY "Users can view their own roles" ON public.user_role_assignments
FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all role assignments" ON public.user_role_assignments;
CREATE POLICY "Admins can manage all role assignments" ON public.user_role_assignments
FOR ALL USING (public.is_admin(auth.uid()));