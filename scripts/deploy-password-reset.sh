#!/bin/bash

# Password Reset System Deployment Script
# This script deploys the custom password reset functionality

set -e

echo "🔐 Deploying Password Reset System..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

# Check if we're in a Supabase project
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Not in a Supabase project directory"
    exit 1
fi

echo "📊 Running database migration..."
supabase db push

echo "🚀 Deploying Edge Functions..."

# Deploy the forgot password function
echo "   Deploying auth-forgot-password..."
supabase functions deploy auth-forgot-password

# Deploy the token validation function
echo "   Deploying auth-validate-reset..."
supabase functions deploy auth-validate-reset

# Deploy the password reset function
echo "   Deploying auth-reset-password..."
supabase functions deploy auth-reset-password

echo "🔍 Setting up environment variables..."
echo "Please ensure the following environment variables are set in your Supabase Edge Functions:"
echo ""
echo "   RESEND_API_KEY=your_resend_api_key"
echo "   SITE_URL=https://your-domain.com"
echo ""
echo "You can set these using:"
echo "   supabase secrets set RESEND_API_KEY=your_key"
echo "   supabase secrets set SITE_URL=https://your-domain.com"

echo "✅ Password Reset System deployed successfully!"
echo ""
echo "🧪 Next steps:"
echo "1. Set the required environment variables (see above)"
echo "2. Test the system using the QA checklist: tests/qa/password-reset-flow-qa.md"
echo "3. Update your frontend application with the new flow"
echo ""
echo "📋 New API endpoints available:"
echo "   POST /functions/v1/auth-forgot-password"
echo "   GET  /functions/v1/auth-validate-reset?token=..."
echo "   POST /functions/v1/auth-reset-password"
echo ""
echo "🎯 Frontend route updated:"
echo "   /auth/reset?token=... (instead of /auth/reset-password)"