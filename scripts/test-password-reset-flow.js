#!/usr/bin/env node

/**
 * Password Reset Flow Test Script
 * 
 * This script tests the password reset flow by:
 * 1. Calling the forgot-password endpoint
 * 2. Simulating token validation
 * 3. Testing password reset
 * 
 * Usage: node scripts/test-password-reset-flow.js
 */

const https = require('https');
const crypto = require('crypto');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://qncfxkgjydeiefyhyllk.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuY2Z4a2dqeWRlaWVmeWh5bGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3OTk3NTEsImV4cCI6MjA2NzM3NTc1MX0.OqbFtCDzHr08_GldcbxvoaxIqIAao_g7U8ys0WjNYBY';

// Test email (replace with a real test email)
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test 1: Forgot Password
async function testForgotPassword() {
  console.log('🧪 Testing forgot password endpoint...');
  
  try {
    const response = await makeRequest(`${SUPABASE_URL}/functions/v1/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ email: TEST_EMAIL }),
    });

    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log('✅ Forgot password endpoint working correctly');
      return true;
    } else {
      console.log('❌ Forgot password endpoint failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing forgot password:', error.message);
    return false;
  }
}

// Test 2: Token Validation (with fake token)
async function testTokenValidation() {
  console.log('\n🧪 Testing token validation endpoint...');
  
  const fakeToken = crypto.randomBytes(32).toString('hex');
  
  try {
    const response = await makeRequest(`${SUPABASE_URL}/functions/v1/validate-reset?token=${fakeToken}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 400 && response.data.valid === false) {
      console.log('✅ Token validation endpoint working correctly (rejected invalid token)');
      return true;
    } else {
      console.log('❌ Token validation endpoint failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing token validation:', error.message);
    return false;
  }
}

// Test 3: Password Reset (with fake token)
async function testPasswordReset() {
  console.log('\n🧪 Testing password reset endpoint...');
  
  const fakeToken = crypto.randomBytes(32).toString('hex');
  
  try {
    const response = await makeRequest(`${SUPABASE_URL}/functions/v1/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ 
        token: fakeToken, 
        password: 'newpassword123' 
      }),
    });

    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    if (response.status === 400 && response.data.error) {
      console.log('✅ Password reset endpoint working correctly (rejected invalid token)');
      return true;
    } else {
      console.log('❌ Password reset endpoint failed');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing password reset:', error.message);
    return false;
  }
}

// Test 4: Health Check
async function testHealthCheck() {
  console.log('\n🧪 Testing health check...');
  
  try {
    const response = await makeRequest(`${SUPABASE_URL}/functions/v1/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    console.log(`Status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('✅ Health check passed');
      return true;
    } else {
      console.log('❌ Health check failed');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Health check endpoint not available (this is optional)');
    return true; // Don't fail the test for missing health check
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Password Reset Flow Tests\n');
  console.log(`Testing with email: ${TEST_EMAIL}`);
  console.log(`Supabase URL: ${SUPABASE_URL}\n`);

  const results = {
    forgotPassword: await testForgotPassword(),
    tokenValidation: await testTokenValidation(),
    passwordReset: await testPasswordReset(),
    healthCheck: await testHealthCheck(),
  };

  console.log('\n📊 Test Results:');
  console.log('================');
  console.log(`Forgot Password: ${results.forgotPassword ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Token Validation: ${results.tokenValidation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Password Reset: ${results.passwordReset ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Health Check: ${results.healthCheck ? '✅ PASS' : '⚠️  SKIP'}`);

  const allPassed = results.forgotPassword && results.tokenValidation && results.passwordReset;
  
  console.log('\n🎯 Overall Result:');
  if (allPassed) {
    console.log('✅ All critical tests passed! Password reset flow is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Test with a real email address');
    console.log('2. Complete the full flow manually');
    console.log('3. Run the QA checklist: tests/qa-password-reset-flow.md');
  } else {
    console.log('❌ Some tests failed. Please check the implementation.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure Edge Functions are deployed');
    console.log('2. Check environment variables');
    console.log('3. Verify database migration is applied');
    console.log('4. Check Supabase dashboard for errors');
  }

  process.exit(allPassed ? 0 : 1);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };