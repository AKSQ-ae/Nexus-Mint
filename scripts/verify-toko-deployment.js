#!/usr/bin/env node

/**
 * TOKO AI Deployment Verification Script
 * 
 * This script verifies the TOKO AI integration after deployment by:
 * 1. Testing the deployed chat endpoint
 * 2. Testing the deployed voice endpoint
 * 3. Checking for proper environment variable configuration
 * 
 * Usage:
 * node scripts/verify-toko-deployment.js [BASE_URL]
 * 
 * Example:
 * node scripts/verify-toko-deployment.js https://your-app.vercel.app
 */

const { createClient } = require('@supabase/supabase-js');

// Get base URL from command line or use default
const baseUrl = process.argv[2] || 'https://your-app.vercel.app';

// Supabase configuration - these should be set in Vercel environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDeployedChat() {
  console.log('🧪 Testing Deployed TOKO Chat Function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('toko-chat', {
      body: {
        message: "Test message from deployment verification script",
        conversationHistory: []
      }
    });

    if (error) {
      console.error('❌ Deployed Chat Error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    console.log('✅ Deployed Chat Response:', data.response);
    console.log('✅ Conversation ID:', data.conversationId);
    console.log('✅ Timestamp:', data.timestamp);
    
    return {
      success: true,
      response: data.response,
      conversationId: data.conversationId
    };
  } catch (error) {
    console.error('❌ Deployed Chat Exception:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testDeployedVoice() {
  console.log('\n🎤 Testing Deployed TOKO Voice Function...');
  
  try {
    const { data, error } = await supabase.functions.invoke('toko-voice', {
      body: {
        text: "This is a test of the deployed TOKO voice function."
      }
    });

    if (error) {
      console.error('❌ Deployed Voice Error:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }

    // Check if we got audio data
    if (data && data.byteLength > 0) {
      console.log('✅ Deployed Voice Response: Audio buffer received');
      console.log('✅ Audio size:', data.byteLength, 'bytes');
      return {
        success: true,
        audioSize: data.byteLength
      };
    } else {
      console.error('❌ Deployed Voice Error: No audio data received');
      return {
        success: false,
        error: 'No audio data received'
      };
    }
  } catch (error) {
    console.error('❌ Deployed Voice Exception:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function testFrontendIntegration() {
  console.log('\n🌐 Testing Frontend Integration...');
  
  try {
    // Test if the main page loads
    const response = await fetch(baseUrl);
    
    if (!response.ok) {
      return {
        success: false,
        error: `Frontend not accessible: ${response.status} ${response.statusText}`
      };
    }

    const html = await response.text();
    
    // Check for TOKO-related content
    const hasTokoContent = html.includes('TOKO') || html.includes('toko');
    const hasChatWidget = html.includes('TOKOChatWidget') || html.includes('toko-chat');
    
    console.log('✅ Frontend accessible');
    console.log('✅ TOKO content found:', hasTokoContent);
    console.log('✅ Chat widget found:', hasChatWidget);
    
    return {
      success: true,
      hasTokoContent,
      hasChatWidget
    };
  } catch (error) {
    console.error('❌ Frontend Integration Error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

function generateReport(results) {
  console.log('\n📊 Deployment Verification Report');
  console.log('=====================================');
  
  const { chat, voice, frontend } = results;
  
  console.log(`Chat Function: ${chat.success ? '✅ PASS' : '❌ FAIL'}`);
  if (!chat.success) {
    console.log(`  Error: ${chat.error}`);
  }
  
  console.log(`Voice Function: ${voice.success ? '✅ PASS' : '❌ FAIL'}`);
  if (!voice.success) {
    console.log(`  Error: ${voice.error}`);
  }
  
  console.log(`Frontend Integration: ${frontend.success ? '✅ PASS' : '❌ FAIL'}`);
  if (!frontend.success) {
    console.log(`  Error: ${frontend.error}`);
  }
  
  const allPassed = chat.success && voice.success && frontend.success;
  
  if (allPassed) {
    console.log('\n🎉 All verification tests passed! TOKO AI integration is working correctly in production.');
    console.log('\n📝 Next Steps:');
    console.log('1. Test the "TOKO AI Live Chat" button in the browser');
    console.log('2. Test the "Speak" button for voice responses');
    console.log('3. Monitor Vercel Function logs for any errors');
  } else {
    console.log('\n⚠️  Some verification tests failed. Please check the logs above and:');
    console.log('1. Verify environment variables are set in Vercel');
    console.log('2. Check Supabase Edge Functions are deployed');
    console.log('3. Review Vercel Function logs for detailed error messages');
  }
  
  return allPassed;
}

async function runVerification() {
  console.log('🚀 Starting TOKO AI Deployment Verification...');
  console.log(`📍 Base URL: ${baseUrl}`);
  console.log(`🔧 Supabase URL: ${supabaseUrl}\n`);
  
  // Test deployed functions
  const chat = await testDeployedChat();
  const voice = await testDeployedVoice();
  const frontend = await testFrontendIntegration();
  
  // Generate report
  const allPassed = generateReport({ chat, voice, frontend });
  
  if (!allPassed) {
    process.exit(1);
  }
}

// Run the verification
runVerification().catch(console.error);