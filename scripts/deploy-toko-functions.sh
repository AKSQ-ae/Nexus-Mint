#!/bin/bash

# TOKO AI Functions Deployment Script
# This script deploys the TOKO AI chat and voice functions to Supabase

set -e

echo "🚀 Deploying TOKO AI Functions to Supabase..."

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
echo "📦 Deploying toko-chat function..."
supabase functions deploy toko-chat --project-ref $(grep -o 'project_id = "[^"]*"' supabase/config.toml | cut -d'"' -f2)

echo "📦 Deploying toko-voice function..."
supabase functions deploy toko-voice --project-ref $(grep -o 'project_id = "[^"]*"' supabase/config.toml | cut -d'"' -f2)

echo "✅ TOKO AI Functions deployed successfully!"

# Verify deployment
echo "🔍 Verifying deployment..."

# Test chat function
echo "Testing toko-chat function..."
curl -X POST "https://$(grep -o 'project_id = "[^"]*"' supabase/config.toml | cut -d'"' -f2).supabase.co/functions/v1/toko-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(grep -o 'anon_key = "[^"]*"' supabase/config.toml | cut -d'"' -f2)" \
  -d '{"message": "test"}' || echo "⚠️  Chat function test failed (this is normal if API keys are not set)"

# Test voice function
echo "Testing toko-voice function..."
curl -X POST "https://$(grep -o 'project_id = "[^"]*"' supabase/config.toml | cut -d'"' -f2).supabase.co/functions/v1/toko-voice" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(grep -o 'anon_key = "[^"]*"' supabase/config.toml | cut -d'"' -f2)" \
  -d '{"text": "test"}' || echo "⚠️  Voice function test failed (this is normal if API keys are not set)"

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Set up environment variables in Supabase Dashboard:"
echo "      - Go to Settings > Edge Functions"
echo "      - Add OPENAI_API_KEY and ELEVENLABS_API_KEY"
echo "   2. Test the integration using:"
echo "      npm run test:toko"
echo "   3. Monitor function logs in Supabase Dashboard"