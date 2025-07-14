#!/usr/bin/env node

/**
 * Environment validation script for CI/CD pipeline
 * Checks that all required environment variables are set
 */

interface RequiredSecrets {
  [key: string]: {
    description: string;
    required: boolean;
  };
}

const REQUIRED_SECRETS: RequiredSecrets = {
  SUPABASE_URL: {
    description: 'Supabase project URL',
    required: true
  },
  SUPABASE_ANON_KEY: {
    description: 'Supabase anonymous key',
    required: true
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    description: 'Supabase service role key (for admin operations)',
    required: false
  },
  TESTNET_PRIVATE_KEY: {
    description: 'Private key for testnet deployments',
    required: false
  },
  POLYGON_API_KEY: {
    description: 'PolygonScan API key for contract verification',
    required: false
  }
};

function checkEnvironment(): boolean {
  console.log('🔍 Checking environment variables...\n');
  
  let allRequiredPresent = true;
  let warnings = 0;

  for (const [key, config] of Object.entries(REQUIRED_SECRETS)) {
    const value = process.env[key];
    const isPresent = !!value;

    if (config.required && !isPresent) {
      console.log(`❌ MISSING (REQUIRED): ${key} - ${config.description}`);
      allRequiredPresent = false;
    } else if (!config.required && !isPresent) {
      console.log(`⚠️  MISSING (OPTIONAL): ${key} - ${config.description}`);
      warnings++;
    } else {
      console.log(`✅ PRESENT: ${key} - ${config.description}`);
    }
  }

  console.log('\n📊 SUMMARY:');
  console.log(`Required secrets: ${allRequiredPresent ? 'ALL PRESENT' : 'MISSING SOME'}`);
  console.log(`Optional secrets: ${warnings} warnings`);

  if (!allRequiredPresent) {
    console.log('\n❌ Environment check failed. Required secrets are missing.');
    console.log('Please set the required environment variables before running the pipeline.');
    return false;
  }

  if (warnings > 0) {
    console.log('\n⚠️  Environment check passed with warnings.');
    console.log('Some optional features may not work without the missing secrets.');
  } else {
    console.log('\n✅ Environment check passed! All secrets are configured.');
  }

  return true;
}

// CLI entry point
if (require.main === module) {
  const success = checkEnvironment();
  process.exit(success ? 0 : 1);
}

export { checkEnvironment };