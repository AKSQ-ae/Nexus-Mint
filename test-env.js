// Test script to verify environment variables
import { config } from 'dotenv';
import { readFileSync } from 'fs';

// Load environment variables from .env.local
config({ path: '.env.local' });

console.log('🔍 Environment Variables Test');
console.log('=============================');

const openaiKey = process.env.OPENAI_API_KEY;
const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

console.log('OpenAI API Key:', openaiKey ? '✅ Configured' : '❌ Missing');
console.log('ElevenLabs API Key:', elevenlabsKey ? '✅ Configured' : '❌ Missing');

if (openaiKey) {
  console.log('OpenAI Key starts with:', openaiKey.substring(0, 20) + '...');
}

if (elevenlabsKey) {
  console.log('ElevenLabs Key starts with:', elevenlabsKey.substring(0, 20) + '...');
}

console.log('\n📝 Next Steps:');
console.log('1. Add these same environment variables to your Vercel project');
console.log('2. Redeploy your application');
console.log('3. Your AI buddy should start working!');