#!/usr/bin/env node

/**
 * 🚀 Vercel Deployment Verification Script
 * Checks for common issues that cause deployment failures
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentVerifier {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.fixes = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  checkFile(filePath, description) {
    if (fs.existsSync(filePath)) {
      this.log(`✅ ${description} exists: ${filePath}`, 'success');
      return true;
    } else {
      this.log(`❌ ${description} missing: ${filePath}`, 'error');
      this.issues.push(`Missing ${description}: ${filePath}`);
      return false;
    }
  }

  checkPackageJson() {
    this.log('🔍 Checking package.json configuration...', 'info');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check essential fields
      if (!packageJson.name) {
        this.issues.push('package.json missing "name" field');
      }
      
      if (!packageJson.scripts?.build) {
        this.issues.push('package.json missing "build" script');
      } else {
        this.log(`✅ Build script: ${packageJson.scripts.build}`, 'success');
      }
      
      // Check for Node version
      if (!packageJson.engines?.node) {
        this.warnings.push('No Node version specified in engines field');
        this.fixes.push('Add "engines": {"node": ">=20.0.0"} to package.json');
      } else {
        this.log(`✅ Node version specified: ${packageJson.engines.node}`, 'success');
      }
      
      // Check for type: module
      if (packageJson.type === 'module') {
        this.log('✅ ES modules enabled', 'success');
      }
      
      return true;
    } catch (error) {
      this.issues.push(`Invalid package.json: ${error.message}`);
      return false;
    }
  }

  checkVercelConfig() {
    this.log('🔍 Checking Vercel configuration...', 'info');
    
    if (this.checkFile('vercel.json', 'Vercel config')) {
      try {
        const vercelJson = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        
        // Check build command
        if (vercelJson.buildCommand) {
          this.log(`✅ Build command: ${vercelJson.buildCommand}`, 'success');
        }
        
        // Check output directory
        if (vercelJson.outputDirectory) {
          this.log(`✅ Output directory: ${vercelJson.outputDirectory}`, 'success');
        }
        
        // Check install command
        if (vercelJson.installCommand) {
          this.log(`✅ Install command: ${vercelJson.installCommand}`, 'success');
        }
        
        return true;
      } catch (error) {
        this.issues.push(`Invalid vercel.json: ${error.message}`);
        return false;
      }
    }
    
    return false;
  }

  checkViteConfig() {
    this.log('🔍 Checking Vite configuration...', 'info');
    
    if (this.checkFile('vite.config.ts', 'Vite config')) {
      try {
        const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
        
        // Check for essential configurations
        if (viteConfig.includes('outDir')) {
          this.log('✅ Output directory configured', 'success');
        }
        
        if (viteConfig.includes('target:')) {
          this.log('✅ Build target specified', 'success');
        }
        
        if (viteConfig.includes('manualChunks')) {
          this.log('✅ Manual chunks configured', 'success');
        }
        
        return true;
      } catch (error) {
        this.issues.push(`Error reading vite.config.ts: ${error.message}`);
        return false;
      }
    }
    
    return false;
  }

  checkEnvironmentFiles() {
    this.log('🔍 Checking environment files...', 'info');
    
    // Check for .env files
    const envFiles = ['.env', '.env.local', '.env.example'];
    let hasEnvFile = false;
    
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log(`✅ Environment file found: ${file}`, 'success');
        hasEnvFile = true;
      }
    });
    
    if (!hasEnvFile) {
      this.warnings.push('No environment files found');
      this.fixes.push('Ensure environment variables are properly configured in Vercel dashboard');
    }
    
    // Check gitignore
    if (this.checkFile('.gitignore', '.gitignore')) {
      const gitignore = fs.readFileSync('.gitignore', 'utf8');
      if (gitignore.includes('.env')) {
        this.log('✅ .env files are gitignored', 'success');
      } else {
        this.warnings.push('.env files may not be properly gitignored');
      }
    }
  }

  checkDependencies() {
    this.log('🔍 Checking dependencies...', 'info');
    
    try {
      // Check for node_modules
      if (fs.existsSync('node_modules')) {
        this.log('✅ node_modules directory exists', 'success');
      } else {
        this.issues.push('node_modules directory missing - run npm install');
      }
      
      // Check for package-lock.json
      if (fs.existsSync('package-lock.json')) {
        this.log('✅ package-lock.json exists', 'success');
      } else {
        this.warnings.push('package-lock.json missing - may cause inconsistent builds');
      }
      
      return true;
    } catch (error) {
      this.issues.push(`Error checking dependencies: ${error.message}`);
      return false;
    }
  }

  checkBuildProcess() {
    this.log('🔍 Testing build process...', 'info');
    
    try {
      // Test build
      this.log('Running build test...', 'info');
      execSync('npm run build', { stdio: 'pipe' });
      this.log('✅ Build successful', 'success');
      
      // Check output directory
      if (fs.existsSync('dist')) {
        this.log('✅ Dist directory created', 'success');
        
        // Check for index.html
        if (fs.existsSync('dist/index.html')) {
          this.log('✅ index.html generated', 'success');
        } else {
          this.issues.push('index.html not generated in dist directory');
        }
        
        // Check for assets
        if (fs.existsSync('dist/assets')) {
          this.log('✅ Assets directory created', 'success');
        } else {
          this.warnings.push('Assets directory not found in dist');
        }
      } else {
        this.issues.push('Dist directory not created after build');
      }
      
      return true;
    } catch (error) {
      this.issues.push(`Build failed: ${error.message}`);
      return false;
    }
  }

  checkCommonIssues() {
    this.log('🔍 Checking for common deployment issues...', 'info');
    
    // Check for large files
    try {
      const distSize = this.getDirSize('dist');
      if (distSize > 100 * 1024 * 1024) { // 100MB
        this.warnings.push(`Large build size: ${(distSize / 1024 / 1024).toFixed(2)}MB`);
        this.fixes.push('Consider optimizing bundle size with code splitting');
      }
    } catch (error) {
      // Ignore if dist doesn't exist
    }
    
    // Check for TypeScript errors
    try {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      this.log('✅ TypeScript compilation successful', 'success');
    } catch (error) {
      this.warnings.push('TypeScript compilation has errors');
      this.fixes.push('Fix TypeScript errors before deployment');
    }
  }

  getDirSize(dir) {
    let size = 0;
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          size += this.getDirSize(filePath);
        } else {
          size += stats.size;
        }
      });
    }
    return size;
  }

  generateReport() {
    this.log('\n📋 DEPLOYMENT VERIFICATION REPORT', 'info');
    this.log('='.repeat(50), 'info');
    
    if (this.issues.length === 0) {
      this.log('🎉 No critical issues found!', 'success');
    } else {
      this.log(`❌ ${this.issues.length} critical issues found:`, 'error');
      this.issues.forEach(issue => {
        this.log(`   • ${issue}`, 'error');
      });
    }
    
    if (this.warnings.length > 0) {
      this.log(`\n⚠️  ${this.warnings.length} warnings:`, 'warning');
      this.warnings.forEach(warning => {
        this.log(`   • ${warning}`, 'warning');
      });
    }
    
    if (this.fixes.length > 0) {
      this.log(`\n🔧 Recommended fixes:`, 'info');
      this.fixes.forEach(fix => {
        this.log(`   • ${fix}`, 'info');
      });
    }
    
    this.log('\n🚀 Deployment Readiness:', 'info');
    if (this.issues.length === 0) {
      this.log('✅ READY FOR DEPLOYMENT', 'success');
    } else {
      this.log('❌ NEEDS FIXES BEFORE DEPLOYMENT', 'error');
    }
  }

  async run() {
    this.log('🚀 Starting Vercel Deployment Verification...', 'info');
    
    // Run all checks
    this.checkPackageJson();
    this.checkVercelConfig();
    this.checkViteConfig();
    this.checkEnvironmentFiles();
    this.checkDependencies();
    this.checkBuildProcess();
    this.checkCommonIssues();
    
    // Generate report
    this.generateReport();
    
    // Return success status
    return this.issues.length === 0;
  }
}

// Run the verifier
const verifier = new DeploymentVerifier();
verifier.run().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Verification failed:', error);
  process.exit(1);
});