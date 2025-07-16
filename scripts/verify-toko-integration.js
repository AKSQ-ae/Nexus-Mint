#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get deployment URL from command line or use default
const deploymentUrl = process.argv[2] || 'http://localhost:8080';

async function verifyTokoIntegration() {
  console.log('🔍 Verifying TOKO AI Advisor Integration...\n');
  console.log(`📍 Testing against: ${deploymentUrl}\n`);

  const results = {
    environment: false,
    chat: false,
    voice: false,
    ui: false
  };

  // Test 1: Environment Variables
  console.log('1️⃣ Testing Environment Variables...');
  try {
    const chatResponse = await fetch(`${deploymentUrl}/api/toko/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'test' })
    });

    if (chatResponse.status === 500) {
      const error = await chatResponse.json();
      if (error.error && error.error.includes('not configured')) {
        console.log('❌ Environment variables not configured in production');
        console.log('   Please set OPENAI_API_KEY and ELEVENLABS_API_KEY in Vercel dashboard');
      } else {
        console.log('✅ Environment variables appear to be configured');
        results.environment = true;
      }
    } else {
      console.log('✅ Environment variables are working');
      results.environment = true;
    }
  } catch (error) {
    console.log('❌ Could not test environment variables:', error.message);
  }

  console.log('');

  // Test 2: Chat Endpoint
  console.log('2️⃣ Testing Chat Endpoint...');
  try {
    const chatResponse = await fetch(`${deploymentUrl}/api/toko/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hello TOKO, can you tell me about real estate investment opportunities?',
        conversationHistory: []
      })
    });

    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log('✅ Chat endpoint working');
      console.log(`   Response: ${data.response.substring(0, 100)}...`);
      console.log(`   Conversation ID: ${data.conversationId}`);
      results.chat = true;
    } else {
      const error = await chatResponse.json();
      console.log(`❌ Chat endpoint failed: ${error.error}`);
    }
  } catch (error) {
    console.log(`❌ Chat endpoint error: ${error.message}`);
  }

  console.log('');

  // Test 3: Voice Endpoint
  console.log('3️⃣ Testing Voice Endpoint...');
  try {
    const voiceResponse = await fetch(`${deploymentUrl}/api/toko/voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Hello, this is a test of the TOKO voice system.'
      })
    });

    if (voiceResponse.ok) {
      const data = await voiceResponse.json();
      console.log('✅ Voice endpoint working');
      console.log(`   Audio size: ${data.size} bytes`);
      console.log(`   Format: ${data.format}`);
      results.voice = true;
    } else {
      const error = await voiceResponse.json();
      console.log(`❌ Voice endpoint failed: ${error.error}`);
    }
  } catch (error) {
    console.log(`❌ Voice endpoint error: ${error.message}`);
  }

  console.log('');

  // Test 4: UI Integration
  console.log('4️⃣ Testing UI Integration...');
  try {
    const pageResponse = await fetch(`${deploymentUrl}/toko-advisor`);
    if (pageResponse.ok) {
      console.log('✅ TOKO Advisor page accessible');
      results.ui = true;
    } else {
      console.log('❌ TOKO Advisor page not accessible');
    }
  } catch (error) {
    console.log(`❌ UI test error: ${error.message}`);
  }

  console.log('\n📊 Test Results Summary:');
  console.log(`Environment Variables: ${results.environment ? '✅' : '❌'}`);
  console.log(`Chat Endpoint: ${results.chat ? '✅' : '❌'}`);
  console.log(`Voice Endpoint: ${results.voice ? '✅' : '❌'}`);
  console.log(`UI Integration: ${results.ui ? '✅' : '❌'}`);

  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! TOKO AI Advisor integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
    
    if (!results.environment) {
      console.log('\n🔧 To fix environment variables:');
      console.log('1. Go to your Vercel project dashboard');
      console.log('2. Navigate to Settings → Environment Variables');
      console.log('3. Add OPENAI_API_KEY and ELEVENLABS_API_KEY');
      console.log('4. Redeploy the project');
    }
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Test the "TOKO AI Live Chat" button in the UI');
  console.log('2. Test the "Speak" button for voice responses');
  console.log('3. Verify the "Learn More" button opens the advisor widget');
  console.log('4. Check Vercel Function logs for any errors');
}

// Run the verification
verifyTokoIntegration().catch(console.error);