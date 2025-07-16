#!/usr/bin/env node

/**
 * TOKO AI Integration Test Script
 * 
 * This script tests the TOKO AI integration by:
 * 1. Testing the chat endpoint with a sample message
 * 2. Testing the voice endpoint with sample text
 * 3. Verifying environment variables are properly configured
 * 
 * Usage:
 * node scripts/test-toko-integration.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTokoChat() {
  console.log('🧪 Testing TOKO Chat Function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('toko-chat', {
      body: {
        message: "Hello TOKO! Can you tell me about the current real estate market in Dubai?",
        conversationHistory: []
      }
    });

    if (error) {
      console.error('❌ TOKO Chat Error:', error);
      return false;
    }

    console.log('✅ TOKO Chat Response:', data.response);
    console.log('✅ Conversation ID:', data.conversationId);
    console.log('✅ Timestamp:', data.timestamp);
    
    return true;
  } catch (error) {
    console.error('❌ TOKO Chat Exception:', error.message);
    return false;
  }
}

async function testTokoVoice() {
  console.log('\n🎤 Testing TOKO Voice Function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('toko-voice', {
      body: {
        text: "Hello! I'm TOKO AI, your real estate investment advisor. How can I help you today?"
      }
    });

    if (error) {
      console.error('❌ TOKO Voice Error:', error);
      return false;
    }

    // Check if we got audio data
    if (data && data.byteLength > 0) {
      console.log('✅ TOKO Voice Response: Audio buffer received');
      console.log('✅ Audio size:', data.byteLength, 'bytes');
      return true;
    } else {
      console.error('❌ TOKO Voice Error: No audio data received');
      return false;
    }
  } catch (error) {
    console.error('❌ TOKO Voice Exception:', error.message);
    return false;
  }
}

function checkEnvironmentVariables() {
  console.log('🔍 Checking Environment Variables...');
  
  const requiredVars = [
    'OPENAI_API_KEY',
    'ELEVENLABS_API_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'your_openai_api_key_here' || value === 'your_elevenlabs_api_key_here') {
      missing.push(varName);
    } else {
      console.log(`✅ ${varName}: Configured`);
    }
  });

  if (missing.length > 0) {
    console.log('❌ Missing or invalid environment variables:', missing.join(', '));
    console.log('💡 Please update your .env.local file with valid API keys');
    return false;
  }

  return true;
}

async function runTests() {
  console.log('🚀 Starting TOKO AI Integration Tests...\n');
  
  // Check environment variables
  const envOk = checkEnvironmentVariables();
  if (!envOk) {
    console.log('\n❌ Environment check failed. Please configure your API keys.');
    process.exit(1);
  }

  // Test chat function
  const chatOk = await testTokoChat();
  
  // Test voice function
  const voiceOk = await testTokoVoice();

  // Summary
  console.log('\n📊 Test Summary:');
  console.log(`Chat Function: ${chatOk ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Voice Function: ${voiceOk ? '✅ PASS' : '❌ FAIL'}`);
  
  if (chatOk && voiceOk) {
    console.log('\n🎉 All tests passed! TOKO AI integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the logs above for details.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);