# Peer Dependency Resolution Strategy

## Issue Summary

The project experienced build failures in AWS CodePipeline due to peer dependency conflicts, specifically:
- `lovable-tagger@1.1.8` requires `vite@^5.0.0`
- The project was using `vite@^7.0.4`

## Solution Applied

We've implemented a multi-pronged approach to resolve peer dependency conflicts:

### 1. Package Version Adjustments
- Downgraded `vite` from `^7.0.4` to `^5.4.11` to maintain compatibility with `lovable-tagger`
- Added `overrides` section in package.json to enforce the vite version

### 2. NPM Configuration
- Created `.npmrc` file with `legacy-peer-deps=true` to handle future peer dependency conflicts gracefully
- Added custom npm scripts for consistent installation:
  - `npm run install:ci` - For CI/CD pipelines
  - `npm run install:local` - For local development

### 3. Build Pipeline Configuration
- Created `buildspec.yml` for AWS CodePipeline with `npm ci --legacy-peer-deps`
- All GitHub Actions workflows already use `--legacy-peer-deps` flag

## Installation Commands

### Local Development
```bash
# Remove existing dependencies and lock file
rm -rf node_modules package-lock.json

# Install with legacy peer deps
npm install --legacy-peer-deps

# Or use the npm script
npm run install:local
```

### CI/CD Pipeline
```bash
# In buildspec.yml or CI configuration
npm ci --legacy-peer-deps

# Or use the npm script
npm run install:ci
```

## AWS CodePipeline Configuration

Use the provided `buildspec.yml` file which includes:
- Node.js 20 runtime
- `npm ci --legacy-peer-deps` for dependency installation
- Proper artifact configuration for the `dist` directory
- Node modules caching for faster builds

## Alternative Solutions (Not Implemented)

If you prefer not to downgrade vite, you could:
1. Remove `lovable-tagger` dependency if it's not critical
2. Fork and update `lovable-tagger` to support vite 7
3. Keep vite 7 and always use `--legacy-peer-deps` flag

## Monitoring

Monitor the build pipeline for:
- Successful dependency installation
- No peer dependency warnings/errors
- Successful build completion

## Future Considerations

1. Consider updating or replacing `lovable-tagger` if a version compatible with vite 7 becomes available
2. Regularly review and update dependencies to minimize peer dependency conflicts
3. Consider using `pnpm` or `yarn` with better peer dependency handling for future projects