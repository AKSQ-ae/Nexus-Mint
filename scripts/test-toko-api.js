#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Check if .env.local exists and load it
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

async function testTokoAPI() {
  console.log('🧪 Testing TOKO AI API endpoints...\n');

  // Test environment variables
  console.log('📋 Environment Variables Check:');
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`ELEVENLABS_API_KEY: ${process.env.ELEVENLABS_API_KEY ? '✅ Configured' : '❌ Missing'}\n`);

  if (!process.env.OPENAI_API_KEY || !process.env.ELEVENLABS_API_KEY) {
    console.log('❌ Missing required environment variables. Please add them to .env.local:');
    console.log('OPENAI_API_KEY=your_openai_key_here');
    console.log('ELEVENLABS_API_KEY=your_elevenlabs_key_here');
    return;
  }

  // Test chat endpoint
  console.log('💬 Testing Chat Endpoint:');
  try {
    const chatResponse = await fetch('http://localhost:8080/api/toko/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Hello TOKO, can you tell me about real estate investment opportunities?',
        conversationHistory: []
      })
    });

    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log('✅ Chat endpoint working');
      console.log(`Response: ${data.response.substring(0, 100)}...`);
    } else {
      const error = await chatResponse.json();
      console.log(`❌ Chat endpoint failed: ${error.error}`);
    }
  } catch (error) {
    console.log(`❌ Chat endpoint error: ${error.message}`);
  }

  console.log('');

  // Test voice endpoint
  console.log('🔊 Testing Voice Endpoint:');
  try {
    const voiceResponse = await fetch('http://localhost:8080/api/toko/voice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello, this is a test of the TOKO voice system.'
      })
    });

    if (voiceResponse.ok) {
      const data = await voiceResponse.json();
      console.log('✅ Voice endpoint working');
      console.log(`Audio size: ${data.size} bytes`);
    } else {
      const error = await voiceResponse.json();
      console.log(`❌ Voice endpoint failed: ${error.error}`);
    }
  } catch (error) {
    console.log(`❌ Voice endpoint error: ${error.message}`);
  }

  console.log('\n🎯 Test completed!');
}

// Run the test
testTokoAPI().catch(console.error);