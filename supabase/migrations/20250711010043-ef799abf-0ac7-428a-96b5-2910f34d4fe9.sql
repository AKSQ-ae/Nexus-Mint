-- Recreate the function for handling new users
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

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();