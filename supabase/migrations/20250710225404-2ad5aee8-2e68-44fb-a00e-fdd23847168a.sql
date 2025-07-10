-- Create user profiles table for additional user information
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  nationality TEXT,
  address TEXT,
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'in_review', 'approved', 'rejected')),
  accredited_investor BOOLEAN DEFAULT false,
  investment_experience TEXT CHECK (investment_experience IN ('beginner', 'intermediate', 'experienced', 'professional')),
  risk_tolerance TEXT CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  preferred_investment_size NUMERIC,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user profiles
CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'drivers_license', 'national_id', 'proof_of_address', 'bank_statement')),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for KYC documents
CREATE POLICY "Users can view own documents" 
ON public.kyc_documents 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" 
ON public.kyc_documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method_type TEXT NOT NULL CHECK (method_type IN ('bank_transfer', 'crypto', 'credit_card')),
  details JSONB NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for payment methods
CREATE POLICY "Users can manage own payment methods" 
ON public.payment_methods 
FOR ALL 
USING (auth.uid() = user_id);

-- Add missing columns to investments table
ALTER TABLE public.investments 
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES public.payment_methods(id),
ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS estimated_annual_return NUMERIC,
ADD COLUMN IF NOT EXISTS actual_return NUMERIC DEFAULT 0;

-- Create property returns table for tracking dividend payments
CREATE TABLE IF NOT EXISTS public.property_returns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  return_type TEXT NOT NULL CHECK (return_type IN ('rental_income', 'appreciation', 'distribution')),
  amount NUMERIC NOT NULL,
  return_date DATE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.property_returns ENABLE ROW LEVEL SECURITY;

-- Create policies for property returns
CREATE POLICY "Users can view own returns" 
ON public.property_returns 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('investment', 'kyc', 'payment', 'return', 'system')),
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
  
  -- Send welcome notification
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (
    NEW.id, 
    'Welcome to Nexus Platform!', 
    'Complete your profile and KYC verification to start investing in real estate.',
    'system'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_documents_updated_at
  BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();