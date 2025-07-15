# Vercel Environment Variables Setup

## 🚨 IMPORTANT: Set these environment variables in your Vercel deployment

Your AI buddy is not working because the required API keys are not configured in your Vercel environment. Follow these steps to fix it:

### Step 1: Go to Vercel Dashboard
1. Visit [vercel.com](https://vercel.com)
2. Sign in to your account
3. Select your project

### Step 2: Add Environment Variables
1. Go to **Settings** tab
2. Click on **Environment Variables** in the left sidebar
3. Add the following variables:

#### For Production Environment:
```
Name: OPENAI_API_KEY
Value: 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
Environment: Production, Preview, Development
```

```
Name: ELEVENLABS_API_KEY
Value: sk_abaf9193e18b3ebda6442f76964f63d9f32e018c935b5d8b
Environment: Production, Preview, Development
```

### Step 3: Redeploy
1. After adding the environment variables, go to **Deployments** tab
2. Click **Redeploy** on your latest deployment
3. Or push a new commit to trigger automatic deployment

### Step 4: Verify Setup
1. Once deployed, visit your AI Buddy page
2. The AI should now respond properly
3. Voice features should work if ElevenLabs key is valid

## 🔧 Troubleshooting

### If AI still doesn't respond:
1. Check Vercel function logs in the **Functions** tab
2. Verify API keys are correctly copied (no extra spaces)
3. Ensure both Production and Preview environments have the variables

### If voice features don't work:
1. Verify your ElevenLabs API key is active
2. Check ElevenLabs dashboard for usage limits
3. The app will fallback to text mode if voice fails

## 📝 Local Development
For local development, the `.env.local` file has been created with your API keys. Make sure to:
1. Never commit this file to git (it's already in .gitignore)
2. Keep your API keys secure
3. Use different keys for development vs production if needed

## 🔒 Security Notes
- These API keys are now configured for your deployment
- The keys are encrypted in Vercel's environment
- Local development uses `.env.local` which is git-ignored
- Consider rotating keys periodically for security