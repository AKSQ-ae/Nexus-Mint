-- Disable email confirmation for faster testing
-- This allows users to sign up and immediately access the platform

-- Check current auth settings
SELECT * FROM auth.config;