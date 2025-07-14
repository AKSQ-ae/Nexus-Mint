# GitHub Actions CI/CD Pipeline

This repository includes a comprehensive GitHub Actions pipeline for automated Phase 1 validation and evidence generation.

## Pipeline Overview

The `.github/workflows/phase1-validation.yml` workflow automatically runs on every push to `main` and pull requests, performing:

1. **Smart Contract Testing & Deployment**
   - Runs Hardhat test suite
   - Deploys contracts to Mumbai testnet
   - Captures deployment addresses

2. **Edge Function Testing**
   - Sets up local Supabase environment
   - Tests regulatory evidence export function
   - Tests live investment flow function

3. **Evidence Validation**
   - Runs CLI validation script
   - Generates JSON/CSV evidence reports
   - Uploads artifacts for regulatory review

## Required GitHub Secrets

Set these in your repository settings (`Settings → Secrets and variables → Actions`):

### Required Secrets
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional Secrets (for enhanced functionality)
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations
- `TESTNET_PRIVATE_KEY` - Private key for contract deployments
- `POLYGON_API_KEY` - For contract verification on PolygonScan
- `SUPABASE_ACCESS_TOKEN` - For Supabase CLI operations

## Local Testing

Before pushing, you can run the validation locally:

```bash
# Install dependencies
npm ci

# Run Phase 1 validation
npm run validate:phase1

# Test contracts
cd contracts && npm test

# Check environment
node scripts/check-env.ts
```

## Pipeline Jobs

### 1. Setup
- Installs Node.js and Deno
- Caches dependencies

### 2. Contracts
- Runs smart contract tests
- Deploys to testnet
- Outputs contract address

### 3. Edge Functions
- Starts local Supabase
- Tests edge functions
- Validates API responses

### 4. Evidence Validator
- Runs comprehensive validation
- Generates regulatory reports
- Uploads evidence artifacts

### 5. Summary
- Provides pipeline results
- Shows success/failure status

## Artifacts

The pipeline generates the following artifacts:

- **Validation Reports** - JSON/CSV evidence files
- **Contract Deployment Logs** - Deployment transactions and addresses
- **Test Results** - Coverage reports and test outputs

These artifacts are retained for 90 days and can be downloaded from the Actions tab.

## Troubleshooting

### Common Issues

1. **Missing Secrets**: Ensure all required secrets are set in GitHub repository settings
2. **Test Failures**: Check that all dependencies are properly installed
3. **Network Issues**: Testnet deployments may fail due to network congestion

### Debug Steps

1. Check the Actions tab for detailed logs
2. Review artifact uploads for evidence files
3. Verify secret configuration
4. Test locally before pushing

## Phase 2 Preparation

This pipeline provides the foundation for Phase 2 integration:

- Banking/custody integration testing
- KYC provider validation
- Legal compliance workflows
- Production deployment pipelines

The evidence artifacts generated here serve as regulatory submission materials for Phase 1 compliance demonstration.