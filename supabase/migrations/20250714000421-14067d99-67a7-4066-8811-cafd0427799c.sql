-- Add security and privacy fields to user profiles
ALTER TABLE user_profiles 
ADD COLUMN data_retention_days INTEGER DEFAULT 90,
ADD COLUMN consent_given BOOLEAN DEFAULT false,
ADD COLUMN consent_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN last_data_export TIMESTAMP WITH TIME ZONE,
ADD COLUMN privacy_settings JSONB DEFAULT '{"analytics": true, "personalization": true, "voice_data": false}'::jsonb;

-- Create user data requests table for GDPR compliance
CREATE TABLE user_data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete', 'anonymize')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  data_location TEXT, -- URL for download or confirmation details
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user data requests
ALTER TABLE user_data_requests ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own data requests
CREATE POLICY "Users can manage own data requests" ON user_data_requests
  FOR ALL USING (auth.uid() = user_id);

-- Add explainability fields to ai_interactions
ALTER TABLE ai_interactions 
ADD COLUMN reasoning_factors TEXT[],
ADD COLUMN data_sources_used TEXT[],
ADD COLUMN confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
ADD COLUMN recommendation_type TEXT,
ADD COLUMN outcome_tracked BOOLEAN DEFAULT false,
ADD COLUMN outcome_result TEXT,
ADD COLUMN outcome_date TIMESTAMP WITH TIME ZONE;

-- Create advice history materialized view
CREATE MATERIALIZED VIEW user_advice_history AS
SELECT 
  ai.user_id,
  ai.id as interaction_id,
  ai.user_message,
  ai.ai_response,
  ai.recommendation_type,
  ai.reasoning_factors,
  ai.data_sources_used,
  ai.confidence_score,
  ai.user_feedback,
  ai.outcome_tracked,
  ai.outcome_result,
  ai.outcome_date,
  ai.created_at,
  ai.session_id
FROM ai_interactions ai
WHERE ai.recommendation_type IS NOT NULL
ORDER BY ai.created_at DESC;

-- Create index for performance
CREATE INDEX idx_advice_history_user_date ON user_advice_history(user_id, created_at DESC);

-- Enable RLS on the materialized view
ALTER TABLE user_advice_history ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own advice history
CREATE POLICY "Users can view own advice history" ON user_advice_history
  FOR SELECT USING (auth.uid() = user_id);

-- Function to refresh advice history view
CREATE OR REPLACE FUNCTION refresh_advice_history()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_advice_history;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle data retention cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS VOID AS $$
BEGIN
  -- Delete old AI interactions based on user preferences
  DELETE FROM ai_interactions 
  WHERE created_at < (
    SELECT CASE 
      WHEN up.data_retention_days IS NOT NULL 
      THEN now() - (up.data_retention_days || ' days')::interval
      ELSE now() - interval '90 days'
    END
    FROM user_profiles up 
    WHERE up.id = ai_interactions.user_id
  );
  
  -- Clean up old data requests
  DELETE FROM user_data_requests 
  WHERE status = 'completed' 
  AND completed_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;