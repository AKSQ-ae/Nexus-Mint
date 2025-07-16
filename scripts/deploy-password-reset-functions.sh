#!/bin/bash

# Deploy Password Reset Edge Functions to Supabase
# This script deploys the forgot-password, validate-reset, and reset-password functions

set -e

echo "🚀 Deploying Password Reset Edge Functions to Supabase..."

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

# Run the database migration
echo "🗄️  Running database migration..."
supabase db push

echo "✅ Password reset functions deployed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Set the SITE_URL environment variable in your Supabase dashboard:"
echo "   - Go to Settings > Edge Functions"
echo "   - Add SITE_URL=https://nexus-mint.com (or your domain)"
echo ""
echo "2. Test the flow using the QA checklist:"
echo "   - tests/qa-password-reset-flow.md"
echo ""
echo "3. Verify the functions are working:"
echo "   - Check Supabase dashboard > Edge Functions"
echo "   - Test with a real email address"