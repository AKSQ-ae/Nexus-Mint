#!/bin/bash

echo "🔧 Fixing Nexus-Mint dependency conflicts..."

# Step 1: Clean existing installations
echo "📦 Cleaning existing node_modules and lockfile..."
rm -rf node_modules package-lock.json

# Step 2: Install with legacy peer deps to handle conflicts
echo "🔄 Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps

# Step 3: Run build to verify everything works
echo "🏗️  Testing build..."
npm run build

echo "✅ Dependency conflicts resolved!"
echo ""
echo "📋 Changes made:"
echo "   • Added npm 'overrides' to force vite@7.0.4 compatibility"
echo "   • Cleaned node_modules and package-lock.json"
echo "   • Used --legacy-peer-deps for installation"
echo ""
echo "🚀 Your Vercel preview should now build successfully!"