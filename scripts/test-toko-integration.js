#!/usr/bin/env node

/**
 * TOKO AI Integration Test Script
 * Tests both chat and voice endpoints to diagnose timeout and error issues
 */

import https from 'https';
import http from 'http';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  verbose: true
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toISOString();
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

function logError(message, error) {
  log(`❌ ${message}`, 'red');
  if (error) {
    console.error(error);
  }
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Helper function to make HTTP requests
function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        ...options.headers
      },
      timeout: TEST_CONFIG.timeout
    };

    if (TEST_CONFIG.verbose) {
      logInfo(`Making ${requestOptions.method} request to: ${url}`);
      logInfo(`Headers: ${JSON.stringify(requestOptions.headers, null, 2)}`);
      if (data) {
        logInfo(`Request body: ${JSON.stringify(data, null, 2)}`);
      }
    }

    const req = client.request(requestOptions, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const response = {
          statusCode: res.statusCode,
          headers: res.headers,
          data: responseData
        };
        
        if (TEST_CONFIG.verbose) {
          logInfo(`Response status: ${res.statusCode}`);
          logInfo(`Response headers: ${JSON.stringify(res.headers, null, 2)}`);
          logInfo(`Response data: ${responseData.substring(0, 500)}${responseData.length > 500 ? '...' : ''}`);
        }
        
        resolve(response);
      });
    });

    req.on('error', (error) => {
      logError(`Request failed: ${error.message}`, error);
      reject(error);
    });

    req.on('timeout', () => {
      logError('Request timed out');
      req.destroy();
      reject(new Error('Request timed out'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test TOKO Chat endpoint
async function testTokoChat() {
  logInfo('🧪 Testing TOKO Chat endpoint...');
  
  const testMessage = "Hello TOKO! Can you explain the benefits of tokenized real estate investments?";
  const conversationHistory = [
    { role: 'user', content: 'What are the minimum investment amounts?' },
    { role: 'assistant', content: 'The minimum investment is $100 USD (approximately AED 367).' }
  ];

  try {
    const response = await makeRequest(
      `${SUPABASE_URL}/functions/v1/toko-chat`,
      { method: 'POST' },
      {
        message: testMessage,
        conversationHistory: conversationHistory
      }
    );

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      logSuccess(`Chat test passed! Response: ${data.response?.substring(0, 100)}...`);
      return { success: true, data };
    } else {
      logError(`Chat test failed with status ${response.statusCode}: ${response.data}`);
      return { success: false, error: response.data, statusCode: response.statusCode };
    }
  } catch (error) {
    logError('Chat test failed with exception', error);
    return { success: false, error: error.message };
  }
}

// Test TOKO Voice endpoint
async function testTokoVoice() {
  logInfo('🎤 Testing TOKO Voice endpoint...');
  
  const testText = "Welcome to TOKO AI Advisor. I'm here to help you with your real estate investment decisions.";

  try {
    const response = await makeRequest(
      `${SUPABASE_URL}/functions/v1/toko-voice`,
      { method: 'POST' },
      {
        text: testText,
        voice: 'Sarah'
      }
    );

    if (response.statusCode === 200) {
      const data = JSON.parse(response.data);
      if (data.audioContent) {
        logSuccess(`Voice test passed! Audio content length: ${data.audioContent.length} characters`);
        return { success: true, data };
      } else {
        logError('Voice test failed: No audio content in response');
        return { success: false, error: 'No audio content' };
      }
    } else {
      logError(`Voice test failed with status ${response.statusCode}: ${response.data}`);
      return { success: false, error: response.data, statusCode: response.statusCode };
    }
  } catch (error) {
    logError('Voice test failed with exception', error);
    return { success: false, error: error.message };
  }
}

// Test environment configuration
async function testEnvironmentConfig() {
  logInfo('🔧 Testing environment configuration...');
  
  const issues = [];
  
  // Check if required environment variables are set
  if (!SUPABASE_URL || SUPABASE_URL === 'https://your-project.supabase.co') {
    issues.push('SUPABASE_URL not properly configured');
  }
  
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your-anon-key') {
    issues.push('SUPABASE_ANON_KEY not properly configured');
  }
  
  // Test Supabase connection
  try {
    const response = await makeRequest(
      `${SUPABASE_URL}/rest/v1/`,
      { method: 'GET' }
    );
    
    if (response.statusCode === 200) {
      logSuccess('Supabase connection test passed');
    } else {
      issues.push(`Supabase connection failed with status ${response.statusCode}`);
    }
  } catch (error) {
    issues.push(`Supabase connection error: ${error.message}`);
  }
  
  if (issues.length === 0) {
    logSuccess('Environment configuration is valid');
    return { success: true };
  } else {
    logError('Environment configuration issues found:');
    issues.forEach(issue => logError(`  - ${issue}`));
    return { success: false, issues };
  }
}

// Main test runner
async function runTests() {
  logInfo('🚀 Starting TOKO AI Integration Tests');
  logInfo(`Test configuration: ${JSON.stringify(TEST_CONFIG, null, 2)}`);
  
  const results = {
    environment: null,
    chat: null,
    voice: null,
    summary: {
      total: 3,
      passed: 0,
      failed: 0
    }
  };
  
  // Test 1: Environment configuration
  results.environment = await testEnvironmentConfig();
  if (results.environment.success) {
    results.summary.passed++;
  } else {
    results.summary.failed++;
  }
  
  // Test 2: Chat endpoint
  results.chat = await testTokoChat();
  if (results.chat.success) {
    results.summary.passed++;
  } else {
    results.summary.failed++;
  }
  
  // Test 3: Voice endpoint
  results.voice = await testTokoVoice();
  if (results.voice.success) {
    results.summary.passed++;
  } else {
    results.summary.failed++;
  }
  
  // Print summary
  logInfo('📊 Test Results Summary:');
  logInfo(`Total tests: ${results.summary.total}`);
  logInfo(`Passed: ${results.summary.passed}`);
  logInfo(`Failed: ${results.summary.failed}`);
  
  if (results.summary.failed === 0) {
    logSuccess('🎉 All tests passed! TOKO AI integration is working correctly.');
  } else {
    logError('❌ Some tests failed. Please check the logs above for details.');
    
    // Provide specific recommendations
    if (!results.environment.success) {
      logWarning('💡 Environment issues detected. Please check:');
      logWarning('  1. SUPABASE_URL and SUPABASE_ANON_KEY are properly set');
      logWarning('  2. Supabase project is accessible');
    }
    
    if (!results.chat.success) {
      logWarning('💡 Chat endpoint issues detected. Please check:');
      logWarning('  1. OPENAI_API_KEY is configured in Supabase Edge Functions');
      logWarning('  2. OpenAI API key is valid and has sufficient credits');
      logWarning('  3. Network connectivity to OpenAI API');
    }
    
    if (!results.voice.success) {
      logWarning('💡 Voice endpoint issues detected. Please check:');
      logWarning('  1. ELEVENLABS_API_KEY is configured in Supabase Edge Functions');
      logWarning('  2. ElevenLabs API key is valid and has sufficient credits');
      logWarning('  3. Voice ID "EXAVITQu4vr4xnSDxMaL" exists and is accessible');
      logWarning('  4. Network connectivity to ElevenLabs API');
    }
  }
  
  return results;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(error => {
    logError('Test runner failed', error);
    process.exit(1);
  });
}

export { runTests, testTokoChat, testTokoVoice, testEnvironmentConfig };