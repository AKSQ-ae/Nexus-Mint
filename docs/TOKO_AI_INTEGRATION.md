# TOKO AI Advisor Integration

## Overview

TOKO AI Advisor is an AI-powered real estate investment assistant integrated into the Nexus Mint platform. It provides:

- **Chat Interface**: Conversational AI for investment guidance
- **Voice Synthesis**: Text-to-speech responses using ElevenLabs
- **Voice Recognition**: Speech-to-text input using browser APIs

## Architecture

### Backend Functions (Supabase Edge Functions)

1. **`toko-chat`** (`supabase/functions/toko-chat/index.ts`)
   - Handles chat conversations with OpenAI GPT-4
   - Uses `OPENAI_API_KEY` environment variable
   - Returns structured responses with conversation context

2. **`toko-voice`** (`supabase/functions/toko-voice/index.ts`)
   - Converts text to speech using ElevenLabs API
   - Uses `ELEVENLABS_API_KEY` environment variable
   - Returns audio buffer for playback

3. **`elevenlabs-session`** (`supabase/functions/elevenlabs-session/index.ts`)
   - Manages ElevenLabs conversational AI sessions
   - Used for advanced voice interactions

### Frontend Components

1. **`TOKOChatWidget`** (`src/components/ai/TOKOChatWidget.tsx`)
   - Main chat interface component
   - Integrates voice input/output
   - Handles conversation state and UI

2. **`TOKOAdvisorPage`** (`src/pages/TOKOAdvisorPage.tsx`)
   - Dedicated page for TOKO AI interactions
   - Landing page with feature explanations

## Environment Variables

### Required for Local Development

Create a `.env.local` file in the project root:

```bash
# OpenAI API Key for TOKO Chat
OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs API Key for TOKO Voice
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Production Configuration

For production, configure these secrets in **Supabase Dashboard**:

1. Go to **Settings** → **Edge Functions**
2. Add the following secrets:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key

## Testing

### Local Testing

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

3. **Run local tests**:
   ```bash
   node scripts/test-toko-integration.js
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Test in browser**:
   - Navigate to `/toko-advisor`
   - Click "TOKO AI Live Chat"
   - Test chat and voice functionality

### Production Testing

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Verify deployment**:
   ```bash
   node scripts/verify-toko-deployment.js https://your-app.vercel.app
   ```

3. **Check Vercel Function logs**:
   - Go to Vercel Dashboard → Functions
   - Monitor logs for any errors

## API Endpoints

### Chat Endpoint

**Function**: `toko-chat`

**Request**:
```json
{
  "message": "Hello TOKO!",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant", 
      "content": "Previous response"
    }
  ]
}
```

**Response**:
```json
{
  "response": "AI response text",
  "conversationId": "uuid",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Voice Endpoint

**Function**: `toko-voice`

**Request**:
```json
{
  "text": "Text to convert to speech",
  "voiceId": "21m00Tcm4TlvDq8ikWAM" // Optional
}
```

**Response**: Audio buffer (MP3 format)

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY is not configured"**
   - Check Supabase Edge Function secrets
   - Verify environment variable is set correctly

2. **"ELEVENLABS_API_KEY is not configured"**
   - Check Supabase Edge Function secrets
   - Verify API key is valid

3. **Chat not responding**
   - Check browser console for errors
   - Verify Supabase client configuration
   - Check network tab for failed requests

4. **Voice not working**
   - Check browser audio permissions
   - Verify ElevenLabs API key has sufficient credits
   - Check browser console for audio errors

5. **CORS errors**
   - Verify CORS headers in Edge Functions
   - Check Supabase project configuration

### Debug Steps

1. **Check environment variables**:
   ```bash
   node scripts/test-toko-integration.js
   ```

2. **Test individual functions**:
   ```bash
   # Test chat
   curl -X POST https://your-project.supabase.co/functions/v1/toko-chat \
     -H "Authorization: Bearer your-anon-key" \
     -H "Content-Type: application/json" \
     -d '{"message": "test"}'
   
   # Test voice
   curl -X POST https://your-project.supabase.co/functions/v1/toko-voice \
     -H "Authorization: Bearer your-anon-key" \
     -H "Content-Type: application/json" \
     -d '{"text": "test"}'
   ```

3. **Check Supabase logs**:
   - Go to Supabase Dashboard → Edge Functions
   - View function logs for errors

4. **Check Vercel logs**:
   - Go to Vercel Dashboard → Functions
   - Monitor real-time logs

## Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **Rate Limiting**: Implement rate limiting for production use
3. **Input Validation**: All user inputs are validated server-side
4. **CORS**: Proper CORS configuration for cross-origin requests
5. **Authentication**: Consider adding user authentication for production

## Performance Optimization

1. **Caching**: Implement response caching for common queries
2. **Streaming**: Consider streaming responses for better UX
3. **Audio Compression**: Optimize audio quality vs. file size
4. **Connection Pooling**: Reuse Supabase connections

## Monitoring

### Key Metrics to Monitor

1. **Response Times**: Chat and voice response latency
2. **Error Rates**: API failures and user errors
3. **Usage Patterns**: Most common queries and features
4. **Audio Quality**: Voice synthesis success rates

### Logging

All functions include comprehensive logging:

```typescript
console.log('TOKO Chat request:', { message, historyLength });
console.log('TOKO Chat response generated successfully');
console.error('TOKO Chat error:', error);
```

## Future Enhancements

1. **Multi-language Support**: Arabic and other regional languages
2. **Advanced Voice Features**: Real-time voice conversations
3. **Personalization**: User-specific investment recommendations
4. **Integration**: Connect with portfolio management features
5. **Analytics**: Advanced conversation analytics and insights