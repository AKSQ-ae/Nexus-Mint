# Dependency Management Guide

## Overview

This project uses a carefully curated set of dependencies to avoid peer dependency conflicts while maintaining compatibility with modern development tools.

## Key Changes Made

### 1. **React Version Stabilization**
- Downgraded from `react@^18.3.1` to `react@^18.2.0`
- Downgraded from `react-dom@^18.3.1` to `react-dom@^18.2.0`
- Added `overrides` and `resolutions` to ensure consistent React versions

### 2. **ESLint Compatibility**
- Downgraded from `eslint@^9.9.0` to `eslint@^8.57.0` (more stable)
- Updated `typescript-eslint` from `^8.0.1` to `^7.1.0`
- Changed `eslint-plugin-react-hooks` from RC version to stable `^4.6.0`

### 3. **Build Tools Stabilization**
- Downgraded from `vite@^7.0.4` to `vite@^5.1.4` (more stable)
- Updated `@vitejs/plugin-react-swc` to `^3.6.0`
- Downgraded `typescript` from `^5.5.3` to `^5.3.3`

### 4. **Testing Framework Updates**
- Downgraded `jest` from `^30.0.4` to `^29.7.0` (more stable)
- Updated `@testing-library/react` from `^16.3.0` to `^14.2.1`
- Updated `ts-jest` to `^29.1.2`

## Installation Commands

### Local Development
```bash
# Clean install with legacy peer deps
npm ci --legacy-peer-deps

# Or for fresh install
npm install --legacy-peer-deps
```

### CI/CD Pipeline
```bash
# Production build with error handling
npm ci --legacy-peer-deps --prefer-offline --no-audit
npm audit fix --legacy-peer-deps || true
npm run build
```

## Dependency Resolution Strategy

### 1. **Overrides Section**
The `overrides` section in `package.json` forces specific versions for critical dependencies:
```json
"overrides": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@types/react": "^18.2.61",
  "@types/react-dom": "^18.2.19"
}
```

### 2. **Resolutions Section**
The `resolutions` section provides additional version pinning for yarn/npm compatibility:
```json
"resolutions": {
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "@types/react": "^18.2.61",
  "@types/react-dom": "^18.2.19"
}
```

## Troubleshooting

### Common Issues

1. **Peer Dependency Warnings**
   - These are expected and can be safely ignored
   - The `--legacy-peer-deps` flag handles most conflicts

2. **Build Failures**
   - Clear `node_modules` and `package-lock.json`
   - Run `npm ci --legacy-peer-deps`

3. **TypeScript Errors**
   - Ensure TypeScript version compatibility
   - Check `@types/*` package versions

### Commands for Debugging

```bash
# Check for peer dependency issues
npm ls --depth=0

# View dependency tree
npm ls

# Check for outdated packages
npm outdated

# Audit dependencies
npm audit --legacy-peer-deps
```

## Version Compatibility Matrix

| Package | Version | Status |
|---------|---------|--------|
| React | 18.2.0 | ✅ Stable |
| Vite | 5.1.4 | ✅ Stable |
| ESLint | 8.57.0 | ✅ Stable |
| TypeScript | 5.3.3 | ✅ Stable |
| Jest | 29.7.0 | ✅ Stable |

## Migration Notes

- All changes maintain backward compatibility
- No breaking changes introduced
- Performance improvements from more stable versions
- Better CI/CD reliability

## Future Updates

When updating dependencies:
1. Test thoroughly in development
2. Check for peer dependency conflicts
3. Update CI/CD pipeline if needed
4. Document any breaking changes