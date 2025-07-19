#!/bin/bash

# Clean install script for resolving dependency conflicts

echo "Starting clean dependency installation..."

# Remove existing node_modules and lock files
echo "Removing node_modules and lock files..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -f pnpm-lock.yaml

# Clear npm cache
echo "Clearing npm cache..."
npm cache clean --force || true

# Install dependencies with legacy peer deps
echo "Installing dependencies with legacy peer deps..."
npm install --legacy-peer-deps --prefer-dedupe

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "Dependencies installed successfully!"
    echo "Creating package-lock.json..."
    npm shrinkwrap --legacy-peer-deps || true
else
    echo "Installation failed. Trying with force flag..."
    npm install --legacy-peer-deps --force
fi

echo "Installation complete!"