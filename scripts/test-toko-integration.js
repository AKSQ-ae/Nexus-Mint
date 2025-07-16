#!/usr/bin/env node

/**
 * TOKO AI Integration Test Script
 * This script performs comprehensive testing of the TOKO AI chat and voice functions
 */

import { createClient } from '@supabase/supabase-js';

// Configuration - these should be set in your environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL and SUPABASE_ANON_KEY must be set');
  console.error('\nExample:');
  console.error('   SUPABASE_URL=https://your-project.supabase.co');
  console.error('   SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test scenarios
const testScenarios = [
  {
    name: 'Basic Chat',
    message: "Hello, can you help me understand real estate investment opportunities?",
    expectedKeywords: ['real estate', 'investment', 'opportunities']
  },
  {
    name: 'Portfolio Question',
    message: "What are the best ways to diversify my real estate portfolio?",
    expectedKeywords: ['diversify', 'portfolio', 'real estate']
  },
  {
    name: 'Yield Question',
    message: "What kind of returns can I expect from tokenized real estate?",
    expectedKeywords: ['returns', 'yield', 'tokenized']
  }
];

const voiceTestScenarios = [
  {
    name: 'Short Text',
    text: "Welcome to TOKO AI Advisor. I'm here to help you with your real estate investment questions.",
    maxLength: 100
  },
  {
    name: 'Medium Text',
    text: "Tokenized real estate offers several advantages including fractional ownership, increased liquidity, and lower barriers to entry. This makes it accessible to a wider range of investors who can now participate in high-value real estate markets with smaller capital requirements.",
    maxLength: 200
  }
];

console.log('🧪 TOKO AI Integration Test Suite\n');

async function testChatFunction() {
  console.log('📝 Testing Chat Function...\n');
  
  const results = [];
  
  for (const scenario of testScenarios) {
    console.log(`  Testing: ${scenario.name}`);
    
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('toko-chat', {
        body: {
          message: scenario.message,
          conversationHistory: []
        }
      });

      const duration = Date.now() - startTime;
      
      if (error) {
        console.log(`    ❌ Failed: ${error.message}`);
        results.push({ scenario: scenario.name, success: false, error: error.message });
        continue;
      }

      // Check if response contains expected keywords
      const response = data.response.toLowerCase();
      const foundKeywords = scenario.expectedKeywords.filter(keyword => 
        response.includes(keyword.toLowerCase())
      );

      console.log(`    ✅ Success (${duration}ms)`);
      console.log(`    Response: ${data.response.substring(0, 100)}...`);
      console.log(`    Keywords found: ${foundKeywords.length}/${scenario.expectedKeywords.length}`);
      console.log(`    Request ID: ${data.requestId}`);
      
      results.push({ 
        scenario: scenario.name, 
        success: true, 
        duration,
        keywordsFound: foundKeywords.length,
        totalKeywords: scenario.expectedKeywords.length
      });
      
    } catch (error) {
      console.log(`    ❌ Exception: ${error.message}`);
      results.push({ scenario: scenario.name, success: false, error: error.message });
    }
    
    console.log('');
  }
  
  return results;
}

async function testVoiceFunction() {
  console.log('🎤 Testing Voice Function...\n');
  
  const results = [];
  
  for (const scenario of voiceTestScenarios) {
    console.log(`  Testing: ${scenario.name}`);
    
    try {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('toko-voice', {
        body: {
          text: scenario.text,
          voice: 'Sarah'
        }
      });

      const duration = Date.now() - startTime;
      
      if (error) {
        console.log(`    ❌ Failed: ${error.message}`);
        results.push({ scenario: scenario.name, success: false, error: error.message });
        continue;
      }

      console.log(`    ✅ Success (${duration}ms)`);
      console.log(`    Audio Content Length: ${data.audioContent?.length || 0}`);
      console.log(`    Content Type: ${data.contentType}`);
      console.log(`    Text Length: ${data.textLength}`);
      console.log(`    Request ID: ${data.requestId}`);
      
      results.push({ 
        scenario: scenario.name, 
        success: true, 
        duration,
        audioLength: data.audioContent?.length || 0,
        textLength: data.textLength
      });
      
    } catch (error) {
      console.log(`    ❌ Exception: ${error.message}`);
      results.push({ scenario: scenario.name, success: false, error: error.message });
    }
    
    console.log('');
  }
  
  return results;
}

async function testErrorHandling() {
  console.log('⚠️  Testing Error Handling...\n');
  
  const errorTests = [
    {
      name: 'Empty Message',
      body: { message: '', conversationHistory: [] },
      expectedError: 'Message is required'
    },
    {
      name: 'Empty Text for Voice',
      body: { text: '', voice: 'Sarah' },
      expectedError: 'Text is required for voice synthesis'
    },
    {
      name: 'Very Long Text',
      body: { text: 'A'.repeat(6000), voice: 'Sarah' },
      expectedError: 'too long'
    }
  ];
  
  const results = [];
  
  for (const test of errorTests) {
    console.log(`  Testing: ${test.name}`);
    
    try {
      const functionName = test.body.message !== undefined ? 'toko-chat' : 'toko-voice';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: test.body
      });

      if (error && error.message.includes(test.expectedError)) {
        console.log(`    ✅ Correctly handled error: ${error.message}`);
        results.push({ test: test.name, success: true, error: error.message });
      } else if (error) {
        console.log(`    ⚠️  Unexpected error: ${error.message}`);
        results.push({ test: test.name, success: false, error: error.message });
      } else {
        console.log(`    ❌ Expected error but got success`);
        results.push({ test: test.name, success: false, error: 'Expected error but got success' });
      }
      
    } catch (error) {
      console.log(`    ❌ Exception: ${error.message}`);
      results.push({ test: test.name, success: false, error: error.message });
    }
    
    console.log('');
  }
  
  return results;
}

async function runAllTests() {
  console.log('🚀 Starting TOKO AI Integration Tests...\n');
  
  const chatResults = await testChatFunction();
  const voiceResults = await testVoiceFunction();
  const errorResults = await testErrorHandling();
  
  // Summary
  console.log('📊 Test Summary\n');
  
  console.log('Chat Function Results:');
  const chatSuccess = chatResults.filter(r => r.success).length;
  console.log(`  ✅ Passed: ${chatSuccess}/${chatResults.length}`);
  
  console.log('\nVoice Function Results:');
  const voiceSuccess = voiceResults.filter(r => r.success).length;
  console.log(`  ✅ Passed: ${voiceSuccess}/${voiceResults.length}`);
  
  console.log('\nError Handling Results:');
  const errorSuccess = errorResults.filter(r => r.success).length;
  console.log(`  ✅ Passed: ${errorSuccess}/${errorResults.length}`);
  
  const totalTests = chatResults.length + voiceResults.length + errorResults.length;
  const totalPassed = chatSuccess + voiceSuccess + errorSuccess;
  
  console.log(`\nOverall: ${totalPassed}/${totalTests} tests passed`);
  
  if (totalPassed === totalTests) {
    console.log('\n🎉 All tests passed! TOKO AI integration is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    
    // Show failed tests
    const failedTests = [
      ...chatResults.filter(r => !r.success).map(r => `Chat: ${r.scenario}`),
      ...voiceResults.filter(r => !r.success).map(r => `Voice: ${r.scenario}`),
      ...errorResults.filter(r => !r.success).map(r => `Error: ${r.test}`)
    ];
    
    if (failedTests.length > 0) {
      console.log('\nFailed Tests:');
      failedTests.forEach(test => console.log(`  ❌ ${test}`));
    }
  }
  
  return totalPassed === totalTests;
}

// Run the tests
runAllTests().catch(console.error);