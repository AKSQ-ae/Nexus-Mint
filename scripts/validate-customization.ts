#!/usr/bin/env node
/**
 * 🔍 Platform Customization Validation Script
 * 
 * This script validates that the platform customization standards have been properly implemented.
 * It checks for remaining hardcoded references and validates configuration files.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, access } from 'fs/promises';
import { join } from 'path';

const execAsync = promisify(exec);

interface ValidationResult {
  passed: boolean;
  message: string;
  details?: string[];
}

class CustomizationValidator {
  private results: ValidationResult[] = [];
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  async validate(): Promise<void> {
    console.log('🔍 Starting Platform Customization Validation...\n');

    // Check for hardcoded references
    await this.checkHardcodedReferences();
    
    // Validate configuration files
    await this.validateConfigurationFiles();
    
    // Check environment variables setup
    await this.checkEnvironmentSetup();
    
    // Validate key files
    await this.validateKeyFiles();
    
    // Print results
    this.printResults();
  }

  private async checkHardcodedReferences(): Promise<void> {
    console.log('📋 Checking for hardcoded references...');
    
    const patterns = [
      'Nexus Mint',
      'nexusmint',
      'nexus-mint',
      'NEXUS MINT',
      'support@nexusmint.com',
      'notifications@nexusmint.com'
    ];

    const excludePatterns = [
      'node_modules',
      'dist',
      'build',
      '.git',
      'PLATFORM_CUSTOMIZATION_REPORT.md',
      'scripts/validate-customization.ts'
    ];

    for (const pattern of patterns) {
      try {
        const { stdout } = await execAsync(
          `grep -r "${pattern}" . --exclude-dir={${excludePatterns.join(',')}} --exclude="*.md" --exclude="*.log" || true`
        );
        
        if (stdout.trim()) {
          const lines = stdout.trim().split('\n');
          this.results.push({
            passed: false,
            message: `Found hardcoded reference: "${pattern}"`,
            details: lines.slice(0, 10) // Show first 10 matches
          });
        }
      } catch (error) {
        console.log(`⚠️  Could not check pattern "${pattern}": ${error}`);
      }
    }

    if (this.results.length === 0) {
      this.results.push({
        passed: true,
        message: 'No hardcoded references found ✅'
      });
    }
  }

  private async validateConfigurationFiles(): Promise<void> {
    console.log('📁 Validating configuration files...');
    
    const requiredFiles = [
      'src/config/branding.config.ts',
      'src/config/services.config.ts',
      '.env.example'
    ];

    for (const file of requiredFiles) {
      try {
        await access(join(this.projectRoot, file));
        this.results.push({
          passed: true,
          message: `Configuration file exists: ${file} ✅`
        });
      } catch (error) {
        this.results.push({
          passed: false,
          message: `Missing configuration file: ${file} ❌`
        });
      }
    }

    // Validate branding config structure
    try {
      const brandingConfig = await readFile(
        join(this.projectRoot, 'src/config/branding.config.ts'),
        'utf-8'
      );
      
      const requiredExports = [
        'BrandingConfig',
        'defaultBrandingConfig',
        'getBrandingConfig',
        'getCompanyName'
      ];

      for (const exportName of requiredExports) {
        if (brandingConfig.includes(exportName)) {
          this.results.push({
            passed: true,
            message: `Branding config has required export: ${exportName} ✅`
          });
        } else {
          this.results.push({
            passed: false,
            message: `Branding config missing export: ${exportName} ❌`
          });
        }
      }
    } catch (error) {
      this.results.push({
        passed: false,
        message: `Could not validate branding config: ${error}`
      });
    }
  }

  private async checkEnvironmentSetup(): Promise<void> {
    console.log('🔧 Checking environment setup...');
    
    try {
      const envExample = await readFile(
        join(this.projectRoot, '.env.example'),
        'utf-8'
      );
      
      const requiredEnvVars = [
        'VITE_COMPANY_NAME',
        'VITE_COMPANY_SHORT_NAME',
        'VITE_SUPPORT_EMAIL',
        'VITE_NOTIFICATION_EMAIL',
        'VITE_PLATFORM_TITLE',
        'VITE_PLATFORM_DESCRIPTION'
      ];

      for (const envVar of requiredEnvVars) {
        if (envExample.includes(envVar)) {
          this.results.push({
            passed: true,
            message: `Environment variable configured: ${envVar} ✅`
          });
        } else {
          this.results.push({
            passed: false,
            message: `Missing environment variable: ${envVar} ❌`
          });
        }
      }
    } catch (error) {
      this.results.push({
        passed: false,
        message: `Could not validate environment setup: ${error}`
      });
    }
  }

  private async validateKeyFiles(): Promise<void> {
    console.log('📄 Validating key files...');
    
    const filesToCheck = [
      {
        path: 'index.html',
        shouldContain: ['Your Company', 'window.__APP_CONFIG__'],
        shouldNotContain: ['Nexus Mint']
      },
      {
        path: 'package.json',
        shouldContain: ['real-estate-tokenization-platform'],
        shouldNotContain: ['nexus-mint']
      },
      {
        path: 'public/manifest.json',
        shouldContain: ['Your Company'],
        shouldNotContain: ['Nexus Mint']
      }
    ];

    for (const fileCheck of filesToCheck) {
      try {
        const content = await readFile(
          join(this.projectRoot, fileCheck.path),
          'utf-8'
        );
        
        // Check required content
        for (const required of fileCheck.shouldContain) {
          if (content.includes(required)) {
            this.results.push({
              passed: true,
              message: `${fileCheck.path} contains required content: "${required}" ✅`
            });
          } else {
            this.results.push({
              passed: false,
              message: `${fileCheck.path} missing required content: "${required}" ❌`
            });
          }
        }
        
        // Check forbidden content
        for (const forbidden of fileCheck.shouldNotContain) {
          if (!content.includes(forbidden)) {
            this.results.push({
              passed: true,
              message: `${fileCheck.path} does not contain forbidden content: "${forbidden}" ✅`
            });
          } else {
            this.results.push({
              passed: false,
              message: `${fileCheck.path} contains forbidden content: "${forbidden}" ❌`
            });
          }
        }
      } catch (error) {
        this.results.push({
          passed: false,
          message: `Could not validate ${fileCheck.path}: ${error}`
        });
      }
    }
  }

  private printResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 PLATFORM CUSTOMIZATION VALIDATION RESULTS');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    
    console.log(`\n📊 Summary: ${passed}/${total} checks passed`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Checks:');
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`  • ${result.message}`);
          if (result.details) {
            result.details.forEach(detail => {
              console.log(`    ${detail}`);
            });
          }
        });
    }
    
    console.log('\n✅ Passed Checks:');
    this.results
      .filter(r => r.passed)
      .forEach(result => {
        console.log(`  • ${result.message}`);
      });
    
    console.log('\n' + '='.repeat(60));
    
    if (failed === 0) {
      console.log('🎉 All customization standards have been successfully implemented!');
      console.log('📋 The platform is now fully white-label ready.');
    } else {
      console.log('⚠️  Some customization standards need attention.');
      console.log('📋 Please review the failed checks above.');
    }
    
    console.log('\n📚 For more information, see:');
    console.log('  • PLATFORM_CUSTOMIZATION_REPORT.md');
    console.log('  • src/config/branding.config.ts');
    console.log('  • src/config/services.config.ts');
    console.log('  • .env.example');
    
    process.exit(failed > 0 ? 1 : 0);
  }
}

// Run validation
const validator = new CustomizationValidator();
validator.validate().catch(console.error);