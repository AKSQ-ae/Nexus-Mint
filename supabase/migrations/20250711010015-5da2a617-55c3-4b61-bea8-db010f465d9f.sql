-- Fix RLS policies to work with existing user_profiles structure

-- Drop previous policies that referenced user_id
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

-- Enhanced RLS Policies for user_profiles (using id instead of user_id)
CREATE POLICY "Users can view own profile" ON public.user_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles  
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_role_assignments 
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  )
);

-- Update the user registration function to work with existing structure
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'first_name', 
      ''
    ) || ' ' || COALESCE(
      NEW.raw_user_meta_data ->> 'last_name', 
      ''
    ),
    NEW.created_at
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name);
  
  -- Assign default investor role if not exists
  INSERT INTO public.user_role_assignments (user_id, role)
  VALUES (NEW.id, 'investor')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the role checking functions to work correctly
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_role_assignments 
    WHERE user_id = check_user_id 
      AND role = 'admin' 
      AND is_active = true
  );
$$;

-- Storage policies with better error handling
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view property media" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage property media" ON storage.objects;
DROP POLICY IF EXISTS "Users can access own investment documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own investment documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can access chat attachments in their rooms" ON storage.objects;

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

CREATE POLICY "Property managers can upload media" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'property-media' AND 
  EXISTS (
    SELECT 1 FROM public.user_role_assignments 
    WHERE user_id = auth.uid() 
      AND role IN ('admin', 'property_manager') 
      AND is_active = true
  )
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