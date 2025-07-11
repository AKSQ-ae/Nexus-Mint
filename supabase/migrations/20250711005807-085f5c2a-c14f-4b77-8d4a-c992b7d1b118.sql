-- Enhanced RLS and Security Implementation - Update existing tables

-- Create user roles enum for better type safety
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('admin', 'investor', 'property_manager', 'compliance_officer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create investment status enum
DO $$ BEGIN
    CREATE TYPE public.investment_status AS ENUM ('pending', 'processing', 'confirmed', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notification types enum
DO $$ BEGIN
    CREATE TYPE public.notification_type AS ENUM ('investment', 'return', 'property_update', 'kyc', 'system', 'chat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update existing user_profiles table with new columns
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS accredited_investor BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS investment_experience TEXT,
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT,
ADD COLUMN IF NOT EXISTS preferred_investment_size NUMERIC,
ADD COLUMN IF NOT EXISTS total_returns NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS wallet_address TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create user roles assignment table
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role)
);

-- Create enhanced notifications table
CREATE TABLE IF NOT EXISTS public.enhanced_notifications (
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
CREATE TABLE IF NOT EXISTS public.user_sessions (
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
CREATE TABLE IF NOT EXISTS public.investment_analytics (
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
CREATE TABLE IF NOT EXISTS public.property_performance (
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
CREATE TABLE IF NOT EXISTS public.smart_contract_events (
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
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id),
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
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
CREATE TABLE IF NOT EXISTS public.chat_room_participants (
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
('chat-attachments', 'chat-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on all tables
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