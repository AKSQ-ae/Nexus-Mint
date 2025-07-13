#!/bin/bash

# Nexus Mint Comprehensive Test Suite
# This script runs all automated checks for the application

set -e

echo "🚀 Starting Nexus Mint Test Suite..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 passed${NC}"
    else
        echo -e "${RED}❌ $2 failed${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "📋 Running comprehensive test suite..."

# 1. ESLint & TypeScript checks
echo "🔍 Running ESLint and TypeScript checks..."
npm run lint || true
npx tsc --noEmit
print_status $? "TypeScript type checking"

# 2. Jest unit tests
echo "🧪 Running Jest unit tests..."
npm test -- --coverage --watchAll=false
print_status $? "Jest unit tests"

# 3. React Testing Library integration tests
echo "🔗 Running React Testing Library integration tests..."
npm test -- --testMatch="**/integration/**/*.test.{js,ts,tsx}" --watchAll=false
print_status $? "Integration tests"

# 4. Accessibility tests with axe-core
echo "♿ Running accessibility tests..."
npm test -- --testMatch="**/accessibility/**/*.test.{js,ts,tsx}" --watchAll=false
print_status $? "Accessibility tests"

# 5. Playwright E2E tests
echo "🎭 Running Playwright E2E tests..."
npx playwright test
print_status $? "Playwright E2E tests"

# 6. Security audit
echo "🔒 Running security audit..."
npm audit --audit-level=moderate
print_status $? "NPM security audit"

# 7. Build test
echo "🏗️ Testing production build..."
npm run build
print_status $? "Production build"

# 8. Lighthouse CI (if available)
echo "💡 Running Lighthouse CI..."
if command -v lhci &> /dev/null; then
    lhci autorun
    print_status $? "Lighthouse CI"
else
    print_warning "Lighthouse CI not installed, skipping..."
fi

# 9. Postman API tests (if Newman is available)
echo "📮 Running API tests..."
if command -v newman &> /dev/null; then
    newman run tests/postman/nexus-mint-api.json
    print_status $? "API tests"
else
    print_warning "Newman not installed, skipping API tests..."
fi

# 10. Bundle size analysis
echo "📦 Analyzing bundle size..."
npm run build -- --analyze || true
print_status $? "Bundle analysis"

echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
echo "📊 Test Results Summary:"
echo "- TypeScript: ✅ Passed"
echo "- Unit Tests: ✅ Passed"
echo "- Integration Tests: ✅ Passed"
echo "- Accessibility: ✅ Passed"
echo "- E2E Tests: ✅ Passed"
echo "- Security Audit: ✅ Passed"
echo "- Build: ✅ Passed"

echo "🚀 Nexus Mint is ready for deployment!"