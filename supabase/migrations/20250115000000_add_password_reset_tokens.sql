-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_used ON password_reset_tokens(used);

-- Create index for cleaning up expired tokens
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Add RLS policies
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role to manage tokens
CREATE POLICY "Service role can manage password reset tokens" ON password_reset_tokens
    FOR ALL USING (auth.role() = 'service_role');

-- Policy to allow users to read their own tokens (for validation)
CREATE POLICY "Users can read their own reset tokens" ON password_reset_tokens
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_reset_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() OR used = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a cron job to clean up expired tokens (runs every hour)
SELECT cron.schedule(
    'cleanup-expired-reset-tokens',
    '0 * * * *', -- Every hour
    'SELECT cleanup_expired_reset_tokens();'
);