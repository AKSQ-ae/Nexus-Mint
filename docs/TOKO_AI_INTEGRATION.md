# TOKO AI Advisor Integration

This document outlines the TOKO AI Advisor integration, including setup, deployment, and verification steps.

## Overview

The TOKO AI Advisor provides:
- **Chat Interface**: AI-powered real estate investment advice
- **Voice Support**: Text-to-speech functionality using ElevenLabs
- **Real-time Responses**: Powered by OpenAI's GPT-4o-mini model
- **Contextual Knowledge**: Specialized in UAE/Middle East real estate markets

## API Endpoints

### Chat Endpoint
- **URL**: `POST /api/toko/chat`
- **Purpose**: Generate AI responses for real estate investment queries
- **Environment Variable**: `OPENAI_API_KEY`

### Voice Endpoint
- **URL**: `POST /api/toko/voice`
- **Purpose**: Convert text to speech using ElevenLabs
- **Environment Variable**: `ELEVENLABS_API_KEY`

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the project root:

```bash
# OpenAI API Key for chat functionality
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs API Key for voice functionality
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### 2. Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Test the API endpoints:
   ```bash
   node scripts/test-toko-api.js
   ```

### 3. Production Deployment

#### Vercel Deployment

1. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add `OPENAI_API_KEY` and `ELEVENLABS_API_KEY`

2. Deploy using the provided script:
   ```bash
   ./scripts/deploy-toko.sh
   ```

3. Verify the deployment:
   ```bash
   node scripts/verify-toko-integration.js https://your-vercel-url.vercel.app
   ```

## Verification Checklist

### ✅ Environment Variables
- [ ] `OPENAI_API_KEY` is configured in Vercel
- [ ] `ELEVENLABS_API_KEY` is configured in Vercel
- [ ] Keys are valid and have proper permissions

### ✅ API Endpoints
- [ ] `POST /api/toko/chat` returns 200 responses
- [ ] `POST /api/toko/voice` returns 200 responses
- [ ] No 401/500 errors in Vercel Function logs

### ✅ UI Integration
- [ ] "TOKO AI Live Chat" button opens the chat widget
- [ ] "Learn More" button navigates to advisor page
- [ ] "Speak" button plays audio responses
- [ ] Chat messages stream in real-time

### ✅ Voice Functionality
- [ ] Text-to-speech conversion works
- [ ] Audio playback without CORS issues
- [ ] No 401/403 errors from ElevenLabs

## Troubleshooting

### Common Issues

#### Environment Variables Not Working
```bash
# Check if variables are set in Vercel
vercel env ls

# Redeploy after setting variables
vercel --prod
```

#### API Endpoints Returning 500
1. Check Vercel Function logs
2. Verify API keys are valid
3. Ensure proper CORS headers

#### Voice Not Playing
1. Check browser console for CORS errors
2. Verify ElevenLabs API key permissions
3. Test with different browsers

### Debug Commands

```bash
# Test local development
npm run dev
node scripts/test-toko-api.js

# Test production deployment
node scripts/verify-toko-integration.js https://your-url.vercel.app

# Check Vercel logs
vercel logs
```

## Security Considerations

- API keys are stored securely in Vercel environment variables
- No sensitive data is exposed client-side
- CORS is properly configured for cross-origin requests
- Input validation prevents injection attacks

## Performance Optimization

- Chat responses are limited to 500 tokens for faster responses
- Voice audio is cached and optimized for streaming
- API calls include proper error handling and retries

## Support

For issues with the TOKO AI integration:
1. Check the troubleshooting section above
2. Review Vercel Function logs
3. Test with the provided verification scripts
4. Contact the development team with specific error messages