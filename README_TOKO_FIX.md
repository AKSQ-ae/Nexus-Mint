# TOKO AI Integration Fix

## Quick Start

### Run Tests
```bash
# Test TOKO integration
npm run test:toko

# Run Jest tests
npm test -- --testPathPattern=toko-integration
```

### Environment Setup
1. **Supabase Edge Functions**: Add these secrets in your Supabase Dashboard
   - `OPENAI_API_KEY`: Your OpenAI API key (starts with `sk-`)
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key

2. **Local Testing**: Set these environment variables
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_ANON_KEY="your-anon-key"
   ```

## What Was Fixed

### Issues Resolved
- ❌ **Timeouts**: Added 25s/30s timeouts for OpenAI/ElevenLabs APIs
- ❌ **Poor Error Messages**: Implemented specific error handling for each failure type
- ❌ **No Logging**: Added structured JSON logging with request IDs
- ❌ **No Validation**: Added API key and input validation
- ❌ **No Tests**: Created comprehensive test suite

### Files Modified
- `supabase/functions/toko-chat/index.ts` - Enhanced with timeouts, logging, validation
- `supabase/functions/toko-voice/index.ts` - Enhanced with timeouts, logging, validation
- `scripts/test-toko-integration.js` - New integration test script
- `src/tests/integration/toko-integration.test.ts` - New Jest test suite
- `package.json` - Added test scripts

## Common Issues

| Error | Cause | Solution |
|-------|-------|----------|
| "OpenAI API key is invalid" | Invalid/expired key | Check Supabase secrets, verify key starts with `sk-` |
| "ElevenLabs API key is invalid" | Invalid/expired key | Check Supabase secrets, verify key length |
| "Request timed out" | Network/API issues | Check connectivity, increase timeout if needed |
| "Rate limit exceeded" | Too many requests | Implement throttling, check API limits |
| "No audio content" | Empty response | Verify text content, check voice ID |

## Monitoring

### Check Logs
- **Supabase Dashboard** → Edge Functions → Logs
- Look for structured JSON logs with request IDs

### Run Diagnostics
```bash
# Quick health check
npm run test:toko

# Detailed testing
npm test -- --testPathPattern=toko-integration --verbose
```

## Documentation
See `docs/TOKO_AI_INTEGRATION_FIX.md` for detailed technical documentation.

## Support
If issues persist:
1. Run the test script to isolate the problem
2. Check Supabase function logs for detailed error information
3. Verify API keys and account credits
4. Review the comprehensive documentation