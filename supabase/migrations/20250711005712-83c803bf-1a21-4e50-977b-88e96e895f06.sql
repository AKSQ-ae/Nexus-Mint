-- Enhanced RLS and Security Implementation for Real Estate Platform

-- Create user roles enum for better type safety
CREATE TYPE public.user_role AS ENUM ('admin', 'investor', 'property_manager', 'compliance_officer');

-- Create investment status enum
CREATE TYPE public.investment_status AS ENUM ('pending', 'processing', 'confirmed', 'completed', 'failed', 'refunded');

-- Create notification types enum
CREATE TYPE public.notification_type AS ENUM ('investment', 'return', 'property_update', 'kyc', 'system', 'chat');

-- Create enhanced user profiles table
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  nationality TEXT,
  kyc_status TEXT DEFAULT 'pending',
  kyc_level INTEGER DEFAULT 0,
  accredited_investor BOOLEAN DEFAULT false,
  investment_experience TEXT,
  risk_tolerance TEXT,
  preferred_investment_size NUMERIC,
  total_invested NUMERIC DEFAULT 0,
  total_returns NUMERIC DEFAULT 0,
  properties_owned INTEGER DEFAULT 0,
  wallet_address TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create user roles assignment table
CREATE TABLE public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);

-- Create enhanced notifications table
CREATE TABLE public.enhanced_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user sessions for real-time presence
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  ip_address INET,
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create investment analytics table
CREATE TABLE public.investment_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id),
  metric_type TEXT NOT NULL,
  metric_value NUMERIC,
  metric_data JSONB DEFAULT '{}',
  calculated_at TIMESTAMPTZ DEFAULT now(),
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ
);

-- Create property performance tracking
CREATE TABLE public.property_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  valuation NUMERIC,
  rental_income NUMERIC,
  occupancy_rate NUMERIC,
  maintenance_costs NUMERIC,
  market_performance NUMERIC,
  roi_percentage NUMERIC,
  report_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create smart contract events table
CREATE TABLE public.smart_contract_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_address TEXT NOT NULL,
  event_name TEXT NOT NULL,
  block_number BIGINT,
  transaction_hash TEXT,
  event_data JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create real-time chat rooms
CREATE TABLE public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  reply_to UUID REFERENCES public.chat_messages(id),
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat room participants
CREATE TABLE public.chat_room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(room_id, user_id)
);

-- Enhanced storage buckets for documents and media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
('user-avatars', 'user-avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
('property-media', 'property-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'video/mp4']),
('investment-documents', 'investment-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
('kyc-documents', 'kyc-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
('chat-attachments', 'chat-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enhanced_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smart_contract_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_participants ENABLE ROW LEVEL SECURITY;

-- Create security definer functions for role checking
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role 
  FROM public.user_role_assignments 
  WHERE user_role_assignments.user_id = get_user_role.user_id 
    AND is_active = true 
  ORDER BY 
    CASE role 
      WHEN 'admin' THEN 1
      WHEN 'compliance_officer' THEN 2  
      WHEN 'property_manager' THEN 3
      WHEN 'investor' THEN 4
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_role_assignments 
    WHERE user_role_assignments.user_id = has_role.user_id 
      AND role = required_role 
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT public.has_role(user_id, 'admin');
$$;

CREATE OR REPLACE FUNCTION public.can_access_property(user_id UUID, property_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT CASE 
    WHEN public.is_admin(user_id) THEN true
    WHEN EXISTS (
      SELECT 1 FROM public.investments 
      WHERE investments.user_id = can_access_property.user_id 
        AND investments.property_id = can_access_property.property_id
        AND status IN ('confirmed', 'completed')
    ) THEN true
    ELSE false
  END;
$$;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles  
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for user_role_assignments
CREATE POLICY "Users can view own roles" ON public.user_role_assignments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_role_assignments
FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for enhanced_notifications
CREATE POLICY "Users can view own notifications" ON public.enhanced_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.enhanced_notifications
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_sessions
CREATE POLICY "Users can view own sessions" ON public.user_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own sessions" ON public.user_sessions
FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for investment_analytics
CREATE POLICY "Users can view own analytics" ON public.investment_analytics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics" ON public.investment_analytics
FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for property_performance  
CREATE POLICY "Public can view property performance" ON public.property_performance
FOR SELECT USING (true);

CREATE POLICY "Admins can manage property performance" ON public.property_performance
FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for smart_contract_events
CREATE POLICY "Admins can view contract events" ON public.smart_contract_events
FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view accessible chat rooms" ON public.chat_rooms
FOR SELECT USING (
  is_public = true OR 
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.chat_room_participants 
    WHERE room_id = chat_rooms.id AND user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can create chat rooms" ON public.chat_rooms
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in accessible rooms" ON public.chat_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_participants 
    WHERE room_id = chat_messages.room_id AND user_id = auth.uid() AND is_active = true
  )
);

CREATE POLICY "Users can insert messages in accessible rooms" ON public.chat_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.chat_room_participants 
    WHERE room_id = chat_messages.room_id AND user_id = auth.uid() AND is_active = true
  )
);

-- RLS Policies for chat_room_participants
CREATE POLICY "Users can view room participants" ON public.chat_room_participants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_room_participants p2
    WHERE p2.room_id = chat_room_participants.room_id AND p2.user_id = auth.uid() AND p2.is_active = true
  )
);

-- Storage policies for enhanced buckets
CREATE POLICY "Users can upload own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can update own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view property media" ON storage.objects
FOR SELECT USING (bucket_id = 'property-media');

CREATE POLICY "Admins can manage property media" ON storage.objects
FOR ALL USING (
  bucket_id = 'property-media' AND 
  public.is_admin(auth.uid())
);

CREATE POLICY "Users can access own investment documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'investment-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own investment documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'investment-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can access own KYC documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own KYC documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'kyc-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable realtime for real-time features
ALTER PUBLICATION supabase_realtime ADD TABLE public.enhanced_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.investment_analytics;
ALTER PUBLICATION supabase_realtime ADD TABLE public.property_performance;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_room_participants;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id,
    email,
    first_name,
    last_name,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.created_at
  );
  
  -- Assign default investor role
  INSERT INTO public.user_role_assignments (user_id, role)
  VALUES (NEW.id, 'investor');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();