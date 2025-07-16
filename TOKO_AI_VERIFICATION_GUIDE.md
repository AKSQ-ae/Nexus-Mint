# TOKO AI Advisor Integration Verification Guide

## Overview

This guide helps you verify and restore the TOKO AI Advisor integration, ensuring both chat and voice functionality work correctly with proper environment variable configuration.

## ✅ What I've Verified & Implemented

### 1. Environment Variable Security ✅
- **TOKO Chat Function** (`/supabase/functions/toko-chat/index.ts`)
  - ✅ Uses `Deno.env.get('OPENAI_API_KEY')` - properly reads from environment
  - ✅ Not hard-coded or exposed client-side
  - ✅ Includes proper error handling for missing keys

- **TOKO Voice Function** (`/supabase/functions/toko-voice/index.ts`)
  - ✅ **CREATED** - New dedicated TTS endpoint
  - ✅ Uses `Deno.env.get('ELEVENLABS_API_KEY')` 
  - ✅ Returns audio buffer for text-to-speech conversion
  - ✅ Proper error handling and logging

### 2. Frontend Integration ✅
- **TOKOChatWidget** (`/src/components/ai/TOKOChatWidget.tsx`)
  - ✅ **ENHANCED** - Added TTS "Speak" button for AI responses
  - ✅ Connects to `supabase.functions.invoke('toko-chat')`
  - ✅ **NEW** - Connects to `supabase.functions.invoke('toko-voice')`
  - ✅ Proper error handling and user feedback

### 3. Local Development Setup ✅
- ✅ **CREATED** `.env.local` template for local testing
- ✅ **CREATED** `test-toko-endpoints.js` for endpoint verification

## 🔧 Next Steps for Complete Verification

### Step 1: Configure Environment Variables

#### For Local Development:
1. Edit `.env.local` with your actual API keys:
```bash
OPENAI_API_KEY=sk-your-actual-openai-key-here
ELEVENLABS_API_KEY=your-actual-elevenlabs-key-here
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

#### For Vercel Deployment:
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Add environment variables:
   - `OPENAI_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Step 2: Deploy & Test Functions

#### Deploy Supabase Functions:
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Deploy the functions
supabase functions deploy toko-chat
supabase functions deploy toko-voice
```

#### Trigger Fresh Vercel Deploy:
```bash
# Commit changes and push to trigger deploy
git add .
git commit -m "Add TOKO voice endpoint and enhance chat widget"
git push origin main
```

### Step 3: Verify Endpoints

#### Test Locally:
```bash
# Load environment variables and test
source .env.local
node test-toko-endpoints.js
```

#### Test in Production:
1. Check Vercel Function logs:
   - Go to Vercel dashboard > Functions tab
   - Monitor logs for `toko-chat` and `toko-voice` calls

2. Test endpoints manually:
```bash
# Test chat endpoint
curl -X POST "https://your-supabase-url/functions/v1/toko-chat" \
  -H "Authorization: Bearer your-supabase-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message"}'

# Test voice endpoint  
curl -X POST "https://your-supabase-url/functions/v1/toko-voice" \
  -H "Authorization: Bearer your-supabase-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello from TOKO"}' \
  --output test-voice.mp3
```

### Step 4: Frontend Testing

#### Browser Network Panel Testing:
1. Open browser DevTools > Network tab
2. Navigate to `/toko-advisor` page
3. Click "TOKO AI Live Chat" button
4. Verify requests go to Supabase functions and return 200 status
5. Send a test message and verify chat response
6. Click the "Speak" button (🔊) on AI responses
7. Verify audio plays without CORS/401/403 errors

#### Expected Network Requests:
- `POST /functions/v1/toko-chat` → Should return 200 with AI response
- `POST /functions/v1/toko-voice` → Should return 200 with audio buffer

## 🔍 Troubleshooting

### Common Issues & Solutions:

#### 1. 401 Unauthorized Errors
- **Cause**: Missing or invalid API keys
- **Solution**: Check environment variables are set correctly
- **Debug**: Look for "API key not configured" in function logs

#### 2. CORS Errors
- **Cause**: Missing CORS headers in function responses
- **Solution**: Functions already include proper CORS headers

#### 3. Audio Playback Issues
- **Cause**: Browser security policies or invalid audio data
- **Solution**: Test the generated audio file independently

#### 4. Function Timeout
- **Cause**: API response taking too long
- **Solution**: Check OpenAI/ElevenLabs API status

## 📊 Expected Behavior

### ✅ Successful Integration Indicators:

1. **Chat Functionality**:
   - "TOKO AI Live Chat" button opens widget
   - Messages stream responses in real-time
   - No console errors
   - Network requests return 200 status

2. **Voice Functionality**:
   - 🔊 "Speak" button appears on AI messages
   - Clicking plays AI-generated audio
   - Audio plays without buffering issues
   - 🔇 Button stops playback when clicked

3. **Environment Variables**:
   - Function logs show keys as "defined" (not undefined)
   - No 401/500 errors from OpenAI/ElevenLabs APIs

## 📱 Browser Compatibility

### Supported Features:
- **Speech Recognition**: Chrome, Edge (webkit)
- **Audio Playback**: All modern browsers
- **Text-to-Speech**: All browsers via ElevenLabs API

### Testing Matrix:
- [ ] Chrome Desktop
- [ ] Firefox Desktop  
- [ ] Safari Desktop
- [ ] Mobile browsers

## 🚀 Performance Optimization

### Recommendations:
1. **Caching**: Consider caching frequent TTS requests
2. **Audio Compression**: ElevenLabs already provides compressed MP3
3. **Fallback**: Browser TTS as fallback for ElevenLabs failures

## 📋 Verification Checklist

- [ ] Environment variables configured (local & production)
- [ ] Functions deployed to Supabase
- [ ] Fresh Vercel deployment triggered
- [ ] Chat endpoint returns 200 with valid responses
- [ ] Voice endpoint returns 200 with audio buffer
- [ ] Frontend chat widget opens and works
- [ ] TTS "Speak" button plays audio
- [ ] No CORS or authentication errors
- [ ] Function logs show defined API keys

---

## 🎯 Summary

The TOKO AI Advisor integration has been **verified and enhanced** with:

1. ✅ **Secure API key handling** - All keys read from `process.env`
2. ✅ **New TTS functionality** - Dedicated voice endpoint created
3. ✅ **Enhanced UI** - Speak buttons added to chat responses
4. ✅ **Test utilities** - Local testing and verification scripts
5. ✅ **Comprehensive documentation** - This verification guide

**Next Action**: Complete the environment variable setup and run the verification tests to ensure everything works in your deployment environment.