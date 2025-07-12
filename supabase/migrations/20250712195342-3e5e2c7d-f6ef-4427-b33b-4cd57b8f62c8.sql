-- Fix nullable user_id columns that should be required for RLS
ALTER TABLE investments ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE token_holders ALTER COLUMN user_id SET NOT NULL;

-- Add missing RLS policies for tables without them
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_contract_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_holders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Chat system RLS policies
CREATE POLICY "Users can view messages in rooms they participate in" 
ON chat_messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM chat_room_participants 
  WHERE room_id = chat_messages.room_id 
  AND user_id = auth.uid()
  AND is_active = true
));

CREATE POLICY "Users can send messages to rooms they participate in" 
ON chat_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM chat_room_participants 
  WHERE room_id = chat_messages.room_id 
  AND user_id = auth.uid()
  AND is_active = true
));

CREATE POLICY "Users can view their room participations" 
ON chat_room_participants FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can join public rooms" 
ON chat_room_participants FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view rooms they participate in" 
ON chat_rooms FOR SELECT 
USING (is_public = true OR EXISTS (
  SELECT 1 FROM chat_room_participants 
  WHERE room_id = chat_rooms.id 
  AND user_id = auth.uid()
  AND is_active = true
));

-- Market data - public read
CREATE POLICY "Public can view market data" 
ON market_data FOR SELECT 
USING (true);

-- Property analytics - public read
CREATE POLICY "Public can view property analytics" 
ON property_analytics FOR SELECT 
USING (true);

-- Property documents - based on property access
CREATE POLICY "Users can view property documents" 
ON property_documents FOR SELECT 
USING (is_public = true OR (requires_kyc = false) OR 
  can_access_property(auth.uid(), property_id));

-- Property performance - public read for active properties
CREATE POLICY "Public can view property performance" 
ON property_performance FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM properties 
  WHERE id = property_performance.property_id 
  AND is_active = true
));

-- Property tokens - public read for active tokens
CREATE POLICY "Public can view property tokens" 
ON property_tokens FOR SELECT 
USING (status IN ('active', 'launched'));

-- Smart contract events - admin only
CREATE POLICY "Admins can view contract events" 
ON smart_contract_events FOR SELECT 
USING (is_admin(auth.uid()));

-- Token holders - users can view their own holdings
CREATE POLICY "Users can view their token holdings" 
ON token_holders FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create token holdings" 
ON token_holders FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Transactions - users can view their own
CREATE POLICY "Users can view their transactions" 
ON transactions FOR SELECT 
USING (from_address IN (
  SELECT wallet_address FROM user_profiles WHERE id = auth.uid()
) OR to_address IN (
  SELECT wallet_address FROM user_profiles WHERE id = auth.uid()
));

-- User sessions - users can view their own
CREATE POLICY "Users can view their own sessions" 
ON user_sessions FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own sessions" 
ON user_sessions FOR INSERT 
WITH CHECK (user_id = auth.uid());