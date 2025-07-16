#!/usr/bin/env node

/**
 * TOKO AI Integration Diagnostic Script
 * This script tests the TOKO AI chat and voice functions to identify issues
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test data
const testMessage = "Hello, can you help me understand real estate investment opportunities?";
const testText = "Welcome to TOKO AI Advisor. I'm here to help you with your real estate investment questions.";

console.log('🔍 TOKO AI Integration Diagnostic\n');

async function testTokoChat() {
  console.log('📝 Testing TOKO Chat Function...');
  
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase.functions.invoke('toko-chat', {
      body: {
        message: testMessage,
        conversationHistory: []
      }
    });

    const duration = Date.now() - startTime;
    
    if (error) {
      console.log('❌ Chat Function Error:', error.message);
      console.log('   Status:', error.status);
      console.log('   Details:', error);
      return false;
    }

    console.log('✅ Chat Function Success');
    console.log('   Response:', data.response?.substring(0, 100) + '...');
    console.log('   Duration:', duration + 'ms');
    console.log('   Conversation ID:', data.conversationId);
    
    return true;
  } catch (error) {
    console.log('❌ Chat Function Exception:', error.message);
    return false;
  }
}

async function testTokoVoice() {
  console.log('\n🎤 Testing TOKO Voice Function...');
  
  try {
    const startTime = Date.now();
    
    const { data, error } = await supabase.functions.invoke('toko-voice', {
      body: {
        text: testText,
        voice: 'Sarah'
      }
    });

    const duration = Date.now() - startTime;
    
    if (error) {
      console.log('❌ Voice Function Error:', error.message);
      console.log('   Status:', error.status);
      console.log('   Details:', error);
      return false;
    }

    console.log('✅ Voice Function Success');
    console.log('   Audio Content Length:', data.audioContent?.length || 0);
    console.log('   Content Type:', data.contentType);
    console.log('   Duration:', duration + 'ms');
    
    return true;
  } catch (error) {
    console.log('❌ Voice Function Exception:', error.message);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔧 Checking Environment Variables...');
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'ELEVENLABS_API_KEY'
  ];

  const missing = [];
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  if (missing.length > 0) {
    console.log('❌ Missing Environment Variables:', missing.join(', '));
    console.log('   Note: OPENAI_API_KEY and ELEVENLABS_API_KEY should be set in Supabase Edge Functions');
    return false;
  }

  console.log('✅ All Environment Variables Present');
  return true;
}

async function testNetworkConnectivity() {
  console.log('\n🌐 Testing Network Connectivity...');
  
  try {
    // Test OpenAI connectivity
    const openaiResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY || 'test'}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   OpenAI API Status:', openaiResponse.status);
    
    // Test ElevenLabs connectivity
    const elevenlabsResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY || 'test',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   ElevenLabs API Status:', elevenlabsResponse.status);
    
    return openaiResponse.ok || elevenlabsResponse.ok;
  } catch (error) {
    console.log('❌ Network Connectivity Error:', error.message);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🚀 Starting TOKO AI Integration Diagnostics...\n');
  
  const results = {
    environment: await testEnvironmentVariables(),
    network: await testNetworkConnectivity(),
    chat: await testTokoChat(),
    voice: await testTokoVoice()
  };

  console.log('\n📊 Diagnostic Summary:');
  console.log('   Environment Variables:', results.environment ? '✅' : '❌');
  console.log('   Network Connectivity:', results.network ? '✅' : '❌');
  console.log('   Chat Function:', results.chat ? '✅' : '❌');
  console.log('   Voice Function:', results.voice ? '✅' : '❌');

  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! TOKO AI integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    console.log('\n🔧 Recommended Actions:');
    
    if (!results.environment) {
      console.log('   1. Set up environment variables in Supabase Edge Functions');
    }
    if (!results.network) {
      console.log('   2. Check API keys and network connectivity');
    }
    if (!results.chat) {
      console.log('   3. Verify OpenAI API key and function deployment');
    }
    if (!results.voice) {
      console.log('   4. Verify ElevenLabs API key and function deployment');
    }
  }

  return allPassed;
}

// Run diagnostics
runDiagnostics().catch(console.error);