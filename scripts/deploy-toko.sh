#!/bin/bash

echo "🚀 Deploying TOKO AI Advisor Integration to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it with: npm i -g vercel"
    exit 1
fi

# Check if environment variables are set
echo "📋 Checking environment variables..."

if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set. Please set it in your environment or Vercel dashboard."
    echo "   You can set it locally with: export OPENAI_API_KEY=your_key_here"
    exit 1
fi

if [ -z "$ELEVENLABS_API_KEY" ]; then
    echo "❌ ELEVENLABS_API_KEY not set. Please set it in your environment or Vercel dashboard."
    echo "   You can set it locally with: export ELEVENLABS_API_KEY=your_key_here"
    exit 1
fi

echo "✅ Environment variables are configured"

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed"

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Test the chat endpoint: POST /api/toko/chat"
    echo "2. Test the voice endpoint: POST /api/toko/voice"
    echo "3. Verify the TOKO AI Live Chat button works"
    echo "4. Test the Speak functionality"
    echo ""
    echo "📝 To set environment variables in Vercel dashboard:"
    echo "   - Go to your project settings"
    echo "   - Navigate to Environment Variables"
    echo "   - Add OPENAI_API_KEY and ELEVENLABS_API_KEY"
else
    echo "❌ Deployment failed"
    exit 1
fi