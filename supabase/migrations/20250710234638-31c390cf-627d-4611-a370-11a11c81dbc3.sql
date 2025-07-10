-- Fix existing policies and add new functionality
-- Update existing policies and add new tables for tokenization

-- First, let's handle the existing users table policies by updating them
-- Drop existing conflicting policies if they exist
DROP POLICY IF EXISTS "Allow public inserts" ON users;
DROP POLICY IF EXISTS "Allow public reads" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Recreate user policies with proper permissions
CREATE POLICY "Allow authenticated user creation" ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Create user_roles table for role-based access
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'investor', 'manager')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view own roles" ON user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create token_supply table for dynamic token management
CREATE TABLE IF NOT EXISTS public.token_supply (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  total_supply NUMERIC NOT NULL CHECK (total_supply > 0),
  available_supply NUMERIC NOT NULL CHECK (available_supply >= 0),
  reserved_supply NUMERIC NOT NULL DEFAULT 0 CHECK (reserved_supply >= 0),
  token_price NUMERIC NOT NULL CHECK (token_price > 0),
  minimum_investment NUMERIC NOT NULL DEFAULT 100 CHECK (minimum_investment > 0),
  maximum_investment NUMERIC,
  last_price_update TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id)
);

-- Enable RLS on token_supply
ALTER TABLE public.token_supply ENABLE ROW LEVEL SECURITY;

-- Token supply policies
CREATE POLICY "Public can view token supply" ON token_supply
  FOR SELECT TO authenticated
  USING (true);

-- Create investment_transactions table for detailed transaction tracking
CREATE TABLE IF NOT EXISTS public.investment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'dividend', 'fee')),
  token_amount NUMERIC NOT NULL CHECK (token_amount > 0),
  token_price NUMERIC NOT NULL CHECK (token_price > 0),
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  fees_amount NUMERIC NOT NULL DEFAULT 0 CHECK (fees_amount >= 0),
  net_amount NUMERIC NOT NULL CHECK (net_amount > 0),
  payment_method TEXT,
  payment_currency TEXT NOT NULL DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  blockchain_tx_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on investment_transactions
ALTER TABLE public.investment_transactions ENABLE ROW LEVEL SECURITY;

-- Investment transactions policies
CREATE POLICY "Users can view own transactions" ON investment_transactions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON investment_transactions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create fee_schedules table for dynamic fee management
CREATE TABLE IF NOT EXISTS public.fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_type TEXT NOT NULL CHECK (fee_type IN ('onboarding', 'management', 'secondary_market', 'withdrawal')),
  percentage NUMERIC NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  fixed_amount NUMERIC NOT NULL DEFAULT 0 CHECK (fixed_amount >= 0),
  min_fee NUMERIC NOT NULL DEFAULT 0 CHECK (min_fee >= 0),
  max_fee NUMERIC,
  currency TEXT NOT NULL DEFAULT 'USD',
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on fee_schedules
ALTER TABLE public.fee_schedules ENABLE ROW LEVEL SECURITY;

-- Fee schedules policies
CREATE POLICY "Public can view active fee schedules" ON fee_schedules
  FOR SELECT TO authenticated
  USING (is_active = true AND (effective_until IS NULL OR effective_until > now()));

-- Update investments table with new columns for better tracking
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS investment_transaction_id UUID REFERENCES investment_transactions(id),
ADD COLUMN IF NOT EXISTS fee_amount NUMERIC DEFAULT 0 CHECK (fee_amount >= 0),
ADD COLUMN IF NOT EXISTS net_amount NUMERIC;

-- Update properties table for tokenization support
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS tokenization_active BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS tokens_issued NUMERIC DEFAULT 0 CHECK (tokens_issued >= 0),
ADD COLUMN IF NOT EXISTS funding_target NUMERIC CHECK (funding_target > 0),
ADD COLUMN IF NOT EXISTS funding_deadline TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS min_investment NUMERIC DEFAULT 100 CHECK (min_investment > 0);

-- Create function to calculate investment fees
CREATE OR REPLACE FUNCTION public.calculate_investment_fees(
  investment_amount NUMERIC,
  fee_type TEXT DEFAULT 'onboarding'
)
RETURNS NUMERIC
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    GREATEST(
      (investment_amount * percentage / 100) + fixed_amount,
      min_fee
    ),
    0
  )
  FROM fee_schedules
  WHERE fee_schedules.fee_type = calculate_investment_fees.fee_type
    AND is_active = true
    AND effective_from <= now()
    AND (effective_until IS NULL OR effective_until > now())
  ORDER BY effective_from DESC
  LIMIT 1;
$$;

-- Add updated_at triggers for new tables
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_token_supply_updated_at
  BEFORE UPDATE ON token_supply
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_transactions_updated_at
  BEFORE UPDATE ON investment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fee_schedules_updated_at
  BEFORE UPDATE ON fee_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default fee schedule
INSERT INTO fee_schedules (fee_type, percentage, fixed_amount, min_fee, max_fee)
VALUES 
  ('onboarding', 2.0, 0, 2, NULL),
  ('management', 1.0, 0, 10, NULL),
  ('secondary_market', 0.25, 0, 1, NULL)
ON CONFLICT DO NOTHING;