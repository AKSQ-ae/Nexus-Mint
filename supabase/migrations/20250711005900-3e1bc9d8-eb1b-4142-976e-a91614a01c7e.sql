-- Complete RLS policies and enhance security

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Enhanced RLS Policies for user_profiles
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

CREATE POLICY "System can create notifications" ON public.enhanced_notifications
FOR INSERT WITH CHECK (true);

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

CREATE POLICY "System can create analytics" ON public.investment_analytics
FOR INSERT WITH CHECK (true);

-- RLS Policies for property_performance  
CREATE POLICY "Public can view property performance" ON public.property_performance
FOR SELECT USING (true);

CREATE POLICY "Admins can manage property performance" ON public.property_performance
FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for smart_contract_events
CREATE POLICY "Admins can view contract events" ON public.smart_contract_events
FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "System can create contract events" ON public.smart_contract_events
FOR INSERT WITH CHECK (true);

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

CREATE POLICY "Users can join rooms" ON public.chat_room_participants
FOR INSERT WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Users can access chat attachments in their rooms" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-attachments' AND 
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM public.chat_room_participants 
      WHERE room_id::text = (storage.foldername(name))[2] 
        AND user_id = auth.uid() 
        AND is_active = true
    )
  )
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

DROP TRIGGER IF EXISTS handle_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration and update existing
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
  ) ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name);
  
  -- Assign default investor role if not exists
  INSERT INTO public.user_role_assignments (user_id, role)
  VALUES (NEW.id, 'investor')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();