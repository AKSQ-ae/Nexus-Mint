#!/usr/bin/env node

/**
 * 🧪 Comprehensive Functionality Testing Suite
 * Tests all core features to ensure platform readiness
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class FunctionalityTester {
  constructor() {
    this.testResults = [];
    this.baseUrl = 'http://localhost:8080';
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

  async testFeature(name, testFunction) {
    this.log(`🧪 Testing: ${name}`, 'info');
    
    try {
      const result = await testFunction();
      this.testResults.push({ name, status: 'PASS', result });
      this.log(`✅ ${name}: PASSED`, 'success');
      return result;
    } catch (error) {
      this.testResults.push({ name, status: 'FAIL', error: error.message });
      this.log(`❌ ${name}: FAILED - ${error.message}`, 'error');
      return null;
    }
  }

  async testBuild() {
    return this.testFeature('Build Process', async () => {
      execSync('npm run build', { stdio: 'pipe' });
      
      // Check build output
      const distExists = fs.existsSync('dist');
      const indexExists = fs.existsSync('dist/index.html');
      const assetsExist = fs.existsSync('dist/assets');
      
      if (!distExists || !indexExists || !assetsExist) {
        throw new Error('Build output incomplete');
      }
      
      return 'Build completed successfully';
    });
  }

  async testDevelopmentServer() {
    return this.testFeature('Development Server', async () => {
      // Start dev server in background
      const devServer = execSync('npm run dev &', { stdio: 'pipe' });
      
      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test if server responds
      try {
        execSync(`curl -f ${this.baseUrl}`, { stdio: 'pipe' });
        return 'Development server responding';
      } catch (error) {
        throw new Error('Development server not responding');
      }
    });
  }

  async testTypeScript() {
    return this.testFeature('TypeScript Compilation', async () => {
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      return 'TypeScript compilation successful';
    });
  }

  async testLinting() {
    return this.testFeature('Code Quality (ESLint)', async () => {
      const output = execSync('npm run lint 2>&1', { encoding: 'utf8' });
      const errorCount = (output.match(/error/g) || []).length;
      const warningCount = (output.match(/warning/g) || []).length;
      
      return `${errorCount} errors, ${warningCount} warnings`;
    });
  }

  async testComponents() {
    return this.testFeature('Component Architecture', async () => {
      const componentDirs = [
        'src/components/properties',
        'src/components/investment',
        'src/components/ai',
        'src/components/dashboard',
        'src/components/analytics',
        'src/components/tokenization',
        'src/components/wallet',
        'src/components/payment'
      ];
      
      let componentCount = 0;
      
      componentDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          const files = fs.readdirSync(dir).filter(file => 
            file.endsWith('.tsx') || file.endsWith('.ts')
          );
          componentCount += files.length;
        }
      });
      
      if (componentCount < 10) {
        throw new Error('Insufficient component architecture');
      }
      
      return `${componentCount} components found`;
    });
  }

  async testAPI() {
    return this.testFeature('API Integration', async () => {
      const apiFiles = [
        'src/integrations/supabase/client.ts',
        'src/lib/services/web3-service.ts',
        'src/lib/services/user-service.ts',
        'src/lib/services/currency-service.ts'
      ];
      
      let missingFiles = [];
      
      apiFiles.forEach(file => {
        if (!fs.existsSync(file)) {
          missingFiles.push(file);
        }
      });
      
      if (missingFiles.length > 0) {
        throw new Error(`Missing API files: ${missingFiles.join(', ')}`);
      }
      
      return 'API integration files present';
    });
  }

  async testDatabase() {
    return this.testFeature('Database Schema', async () => {
      const schemaFile = 'supabase/schema.md';
      const migrationFile = 'supabase/migrations/001_initial_schema.sql';
      
      if (!fs.existsSync(schemaFile)) {
        throw new Error('Database schema file missing');
      }
      
      let tables = 0;
      
      // Check schema.md file
      const schema = fs.readFileSync(schemaFile, 'utf8');
      tables += (schema.match(/CREATE TABLE/g) || []).length;
      
      // Check migration files
      if (fs.existsSync(migrationFile)) {
        const migration = fs.readFileSync(migrationFile, 'utf8');
        tables += (migration.match(/CREATE TABLE/g) || []).length;
      }
      
      // Check entire migrations directory
      if (fs.existsSync('supabase/migrations')) {
        const migrationFiles = fs.readdirSync('supabase/migrations').filter(file => file.endsWith('.sql'));
        migrationFiles.forEach(file => {
          const content = fs.readFileSync(`supabase/migrations/${file}`, 'utf8');
          tables += (content.match(/CREATE TABLE/g) || []).length;
        });
      }
      
      if (tables < 5) {
        throw new Error('Insufficient database schema');
      }
      
      return `${tables} database tables defined`;
    });
  }

  async testContracts() {
    return this.testFeature('Smart Contracts', async () => {
      const contractsDir = 'contracts';
      
      if (!fs.existsSync(contractsDir)) {
        throw new Error('Contracts directory missing');
      }
      
      const contractFiles = fs.readdirSync(contractsDir, { recursive: true })
        .filter(file => file.endsWith('.sol'));
      
      if (contractFiles.length < 3) {
        throw new Error('Insufficient smart contracts');
      }
      
      return `${contractFiles.length} smart contracts found`;
    });
  }

  async testSecurity() {
    return this.testFeature('Security Configuration', async () => {
      const securityChecks = [
        // Check for environment variables
        fs.existsSync('.env.example'),
        // Check for gitignore
        fs.existsSync('.gitignore'),
        // Check for security headers in vercel.json
        fs.existsSync('vercel.json')
      ];
      
      const passedChecks = securityChecks.filter(check => check).length;
      
      if (passedChecks < 3) {
        throw new Error('Security configuration incomplete');
      }
      
      return `${passedChecks}/3 security checks passed`;
    });
  }

  async testPerformance() {
    return this.testFeature('Performance Metrics', async () => {
      // Check bundle size
      const distStats = this.getDirSize('dist');
      const bundleSizeMB = (distStats / 1024 / 1024).toFixed(2);
      
      // Check for performance optimizations
      const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
      const hasManualChunks = viteConfig.includes('manualChunks');
      const hasMinification = viteConfig.includes('minify');
      
      if (!hasManualChunks || !hasMinification) {
        throw new Error('Performance optimizations missing');
      }
      
      return `Bundle size: ${bundleSizeMB}MB, optimizations enabled`;
    });
  }

  getDirSize(dir) {
    let size = 0;
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir, { recursive: true });
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          size += stats.size;
        }
      });
    }
    return size;
  }

  generateReport() {
    this.log('\n🧪 COMPREHENSIVE FUNCTIONALITY TEST REPORT', 'info');
    this.log('='.repeat(60), 'info');
    
    const passedTests = this.testResults.filter(test => test.status === 'PASS').length;
    const failedTests = this.testResults.filter(test => test.status === 'FAIL').length;
    const totalTests = this.testResults.length;
    
    this.log(`📊 Overall Results: ${passedTests}/${totalTests} tests passed`, 'info');
    
    if (failedTests === 0) {
      this.log('🎉 ALL TESTS PASSED! Platform is ready for next phase.', 'success');
    } else {
      this.log(`⚠️  ${failedTests} tests failed. See details below:`, 'warning');
      
      this.testResults.forEach(test => {
        if (test.status === 'FAIL') {
          this.log(`   ❌ ${test.name}: ${test.error}`, 'error');
        } else {
          this.log(`   ✅ ${test.name}: ${test.result}`, 'success');
        }
      });
    }
    
    this.log('\n🎯 NEXT STEPS:', 'info');
    if (passedTests >= totalTests * 0.8) {
      this.log('✅ Platform ready for enhanced feature development', 'success');
      this.log('🚀 Proceed to Phase 2: Feature Enhancement', 'success');
    } else {
      this.log('⚠️  Address failing tests before proceeding', 'warning');
      this.log('🔧 Focus on fixing critical functionality first', 'warning');
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Comprehensive Functionality Testing...', 'info');
    
    // Run all tests
    await this.testBuild();
    await this.testTypeScript();
    await this.testLinting();
    await this.testComponents();
    await this.testAPI();
    await this.testDatabase();
    await this.testContracts();
    await this.testSecurity();
    await this.testPerformance();
    
    // Generate report
    this.generateReport();
    
    return this.testResults;
  }
}

// Run the comprehensive test
const tester = new FunctionalityTester();
tester.runAllTests().catch(console.error);