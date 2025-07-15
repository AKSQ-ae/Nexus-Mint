# AI Buddy Deployment Setup Guide

## Environment Variables Required

To enable full AI functionality in your deployment, you need to configure the following environment variables in your Vercel project:

### 1. OpenAI API Key
```bash
OPENAI_API_KEY=your_openai_api_key_here
```

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your Vercel environment variables

### 2. ElevenLabs API Key (Optional - for voice features)
```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

**How to get it:**
1. Go to [ElevenLabs](https://elevenlabs.io/)
2. Sign up and get your API key
3. Add it to your Vercel environment variables

## Vercel Configuration

### 1. Add Environment Variables
1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the variables above for all environments (Production, Preview, Development)

### 2. Supabase Edge Functions
Make sure your Supabase edge functions are deployed and accessible:
- `ai-buddy-chat`
- `intelligent-analytics`
- `elevenlabs-session`

## Current Status

### ✅ Working Features
- Text-based AI chat (with fallback responses)
- Portfolio data display
- Basic investment suggestions
- Responsive UI

### ⚠️ Limited Features (in deployment)
- Voice chat (requires ElevenLabs API key)
- Advanced AI responses (requires OpenAI API key)

### 🔧 Fallback Behavior
- If OpenAI API key is missing: Uses predefined responses
- If ElevenLabs API key is missing: Voice features disabled, text mode only
- If Supabase functions fail: Uses cached/fallback data

## Testing

1. **Local Development**: All features work with proper API keys
2. **Deployment**: Text features work, voice features require API keys
3. **Fallback Mode**: Basic functionality works without API keys

## Troubleshooting

### AI Buddy Not Responding
1. Check browser console for errors
2. Verify Supabase functions are deployed
3. Check environment variables in Vercel

### Voice Features Not Working
1. Ensure ElevenLabs API key is configured
2. Check if you're in a deployment environment (voice may be disabled)
3. Verify microphone permissions

### Slow Responses
1. Check Supabase function logs
2. Verify API rate limits
3. Consider upgrading API plans if needed

## Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive data
- Consider using API key rotation for production
- Monitor API usage to avoid unexpected costs