#!/bin/bash

# Deploy Password Reset Functions to Supabase
# This script deploys the new Edge Functions for the password reset flow

set -e

echo "🚀 Deploying Password Reset Functions to Supabase..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Deploy the functions
echo "📦 Deploying forgot-password function..."
supabase functions deploy forgot-password --no-verify-jwt

echo "📦 Deploying validate-reset function..."
supabase functions deploy validate-reset --no-verify-jwt

echo "📦 Deploying reset-password function..."
supabase functions deploy reset-password --no-verify-jwt

# Run the migration
echo "🗄️  Running database migration..."
supabase db push

echo "✅ Password reset functions deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Test the forgot password flow at: /auth/forgot-password"
echo "2. Verify the reset link format: /auth/reset?token=<token>"
echo "3. Run the QA tests: npm run test:password-reset"
echo ""
echo "🔗 Function URLs:"
echo "- Forgot Password: $(supabase functions list | grep forgot-password | awk '{print $2}')"
echo "- Validate Reset: $(supabase functions list | grep validate-reset | awk '{print $2}')"
echo "- Reset Password: $(supabase functions list | grep reset-password | awk '{print $2}')"