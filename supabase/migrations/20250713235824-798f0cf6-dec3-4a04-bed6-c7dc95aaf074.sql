-- Create AI interaction tracking table for learning and analytics
CREATE TABLE public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  intent_detected TEXT,
  suggestions_provided TEXT[],
  response_time_ms INTEGER,
  user_feedback INTEGER CHECK (user_feedback >= -1 AND user_feedback <= 1), -- -1 thumbs down, 0 neutral, 1 thumbs up
  portfolio_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only view/manage their own interactions
CREATE POLICY "Users can view own AI interactions" 
ON public.ai_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI interactions" 
ON public.ai_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI interactions" 
ON public.ai_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create AI safety guidelines table
CREATE TABLE public.ai_safety_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type TEXT NOT NULL, -- 'risk_warning', 'regulatory_check', 'content_filter'
  rule_description TEXT NOT NULL,
  trigger_keywords TEXT[],
  action_type TEXT NOT NULL, -- 'warning', 'block', 'redirect'
  action_message TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Populate with initial safety rules
INSERT INTO public.ai_safety_rules (rule_type, rule_description, trigger_keywords, action_type, action_message) VALUES
('risk_warning', 'High risk investment warning', ARRAY['leverage', 'margin', 'high yield', 'guaranteed return'], 'warning', '⚠️ This investment strategy carries significant risk. Please consult with a financial advisor.'),
('regulatory_check', 'Sharia compliance check', ARRAY['interest', 'gambling', 'alcohol'], 'warning', '⚠️ This may not be Sharia-compliant. Please verify with your Islamic finance advisor.'),
('content_filter', 'Investment advice disclaimer', ARRAY['buy now', 'sell immediately', 'guaranteed profit'], 'warning', '⚠️ This is educational information only, not financial advice. Always do your own research.');

-- Create user AI preferences table
CREATE TABLE public.ai_user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  communication_style TEXT DEFAULT 'balanced', -- 'cautious', 'balanced', 'aggressive'
  learning_rate TEXT DEFAULT 'normal', -- 'slow', 'normal', 'fast'
  risk_warnings_enabled BOOLEAN DEFAULT true,
  voice_enabled BOOLEAN DEFAULT true,
  notification_frequency TEXT DEFAULT 'daily', -- 'none', 'daily', 'weekly'
  blacklisted_keywords TEXT[] DEFAULT '{}',
  preferred_markets TEXT[] DEFAULT '{}',
  data_retention_days INTEGER DEFAULT 90,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for preferences
ALTER TABLE public.ai_user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own AI preferences" 
ON public.ai_user_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_interactions_updated_at 
BEFORE UPDATE ON public.ai_interactions 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_user_preferences_updated_at 
BEFORE UPDATE ON public.ai_user_preferences 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();