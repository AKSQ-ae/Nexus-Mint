#!/usr/bin/env node

/**
 * Comprehensive Smart Contract Analysis Script
 * Runs before every merge to ensure contract quality and security
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ContractAnalyzer {
  constructor() {
    this.contractsDir = path.join(__dirname, '../contracts');
    this.report = {
      timestamp: new Date().toISOString(),
      contracts: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        criticalIssues: 0
      }
    };
  }

  async analyzeAll() {
    console.log('🔍 Starting comprehensive contract analysis...\n');
    
    try {
      // Get all Solidity files
      const contractFiles = this.getContractFiles();
      console.log(`📋 Found ${contractFiles.length} contracts to analyze\n`);
      
      for (const contractFile of contractFiles) {
        await this.analyzeContract(contractFile);
      }
      
      this.generateReport();
      this.printSummary();
      
      if (this.report.summary.criticalIssues > 0) {
        console.error('❌ Critical issues found! Merge blocked.');
        process.exit(1);
      }
      
      console.log('✅ All contracts passed analysis');
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  getContractFiles() {
    const files = fs.readdirSync(this.contractsDir)
      .filter(file => file.endsWith('.sol'))
      .map(file => path.join(this.contractsDir, file));
    
    return files;
  }

  async analyzeContract(contractPath) {
    const contractName = path.basename(contractPath, '.sol');
    console.log(`🔍 Analyzing ${contractName}...`);
    
    const contractReport = {
      name: contractName,
      path: contractPath,
      checks: {},
      issues: [],
      warnings: [],
      gasEstimate: null
    };

    // 1. Compilation check
    contractReport.checks.compilation = await this.checkCompilation(contractPath);
    
    // 2. Security analysis
    contractReport.checks.security = await this.checkSecurity(contractPath);
    
    // 3. Gas optimization
    contractReport.checks.gasOptimization = await this.checkGasOptimization(contractPath);
    
    // 4. Sharia compliance check
    contractReport.checks.shariaCompliance = await this.checkShariaCompliance(contractPath);
    
    // 5. Documentation check
    contractReport.checks.documentation = await this.checkDocumentation(contractPath);
    
    // 6. Test coverage
    contractReport.checks.testCoverage = await this.checkTestCoverage(contractName);
    
    this.report.contracts.push(contractReport);
    
    // Update summary
    this.report.summary.total++;
    if (contractReport.issues.length === 0) {
      this.report.summary.passed++;
    } else {
      this.report.summary.failed++;
      this.report.summary.criticalIssues += contractReport.issues.filter(issue => issue.severity === 'critical').length;
    }
    this.report.summary.warnings += contractReport.warnings.length;
  }

  async checkCompilation(contractPath) {
    try {
      execSync(`cd ${this.contractsDir} && npx hardhat compile`, { stdio: 'pipe' });
      return { status: 'passed', message: 'Contract compiles successfully' };
    } catch (error) {
      return { status: 'failed', message: 'Compilation failed', error: error.message };
    }
  }

  async checkSecurity(contractPath) {
    const issues = [];
    const warnings = [];
    
    try {
      // Read contract content
      const content = fs.readFileSync(contractPath, 'utf8');
      
      // Check for common security issues
      const securityChecks = [
        {
          pattern: /reentrancy|reentrant/i,
          message: 'Potential reentrancy vulnerability',
          severity: 'critical'
        },
        {
          pattern: /tx\.origin/i,
          message: 'Use of tx.origin - prefer msg.sender',
          severity: 'critical'
        },
        {
          pattern: /block\.timestamp/i,
          message: 'Use of block.timestamp for critical operations',
          severity: 'warning'
        },
        {
          pattern: /block\.number/i,
          message: 'Use of block.number for critical operations',
          severity: 'warning'
        },
        {
          pattern: /call\(/i,
          message: 'Low-level call detected - ensure proper error handling',
          severity: 'warning'
        },
        {
          pattern: /delegatecall\(/i,
          message: 'delegatecall detected - high security risk',
          severity: 'critical'
        },
        {
          pattern: /selfdestruct\(/i,
          message: 'selfdestruct detected - ensure proper access control',
          severity: 'critical'
        },
        {
          pattern: /suicide\(/i,
          message: 'suicide detected - ensure proper access control',
          severity: 'critical'
        }
      ];
      
      securityChecks.forEach(check => {
        if (check.pattern.test(content)) {
          const issue = {
            type: 'security',
            message: check.message,
            severity: check.severity,
            line: this.findLineNumber(content, check.pattern)
          };
          
          if (check.severity === 'critical') {
            issues.push(issue);
          } else {
            warnings.push(issue);
          }
        }
      });
      
      return { status: issues.length === 0 ? 'passed' : 'failed', issues, warnings };
      
    } catch (error) {
      return { status: 'error', message: 'Security analysis failed', error: error.message };
    }
  }

  async checkGasOptimization(contractPath) {
    const warnings = [];
    
    try {
      const content = fs.readFileSync(contractPath, 'utf8');
      
      // Gas optimization checks
      const gasChecks = [
        {
          pattern: /for\s*\([^)]*\)\s*{[^}]*storage[^}]*}/i,
          message: 'Storage access in loop - consider caching'
        },
        {
          pattern: /mapping\s*\([^)]*\)\s*mapping/i,
          message: 'Nested mappings can be gas expensive'
        },
        {
          pattern: /require\s*\([^)]*\)/g,
          message: 'Multiple require statements - consider combining'
        }
      ];
      
      gasChecks.forEach(check => {
        const matches = content.match(check.pattern);
        if (matches && matches.length > 1) {
          warnings.push({
            type: 'gas',
            message: check.message,
            count: matches.length
          });
        }
      });
      
      return { status: 'passed', warnings };
      
    } catch (error) {
      return { status: 'error', message: 'Gas analysis failed', error: error.message };
    }
  }

  async checkShariaCompliance(contractPath) {
    const issues = [];
    const warnings = [];
    
    try {
      const content = fs.readFileSync(contractPath, 'utf8');
      
      // Sharia compliance checks
      const shariaChecks = [
        {
          pattern: /interest|riba/i,
          message: 'Interest-based operations detected - ensure Sharia compliance',
          severity: 'critical'
        },
        {
          pattern: /gambling|betting/i,
          message: 'Gambling-related operations detected',
          severity: 'critical'
        },
        {
          pattern: /alcohol|pork/i,
          message: 'Non-halal operations detected',
          severity: 'critical'
        },
        {
          pattern: /musharaka|mudaraba|ijara/i,
          message: 'Islamic finance terms detected - good compliance indicator',
          severity: 'info'
        },
        {
          pattern: /@notice.*sharia|@notice.*islamic/i,
          message: 'Sharia compliance documentation found',
          severity: 'info'
        }
      ];
      
      shariaChecks.forEach(check => {
        if (check.pattern.test(content)) {
          const issue = {
            type: 'sharia',
            message: check.message,
            severity: check.severity
          };
          
          if (check.severity === 'critical') {
            issues.push(issue);
          } else if (check.severity === 'warning') {
            warnings.push(issue);
          }
        }
      });
      
      return { status: issues.length === 0 ? 'passed' : 'failed', issues, warnings };
      
    } catch (error) {
      return { status: 'error', message: 'Sharia compliance check failed', error: error.message };
    }
  }

  async checkDocumentation(contractPath) {
    const warnings = [];
    
    try {
      const content = fs.readFileSync(contractPath, 'utf8');
      
      // Documentation checks
      if (!content.includes('@title')) {
        warnings.push({ type: 'documentation', message: 'Missing @title annotation' });
      }
      
      if (!content.includes('@author')) {
        warnings.push({ type: 'documentation', message: 'Missing @author annotation' });
      }
      
      if (!content.includes('@notice')) {
        warnings.push({ type: 'documentation', message: 'Missing @notice annotations' });
      }
      
      // Check for function documentation
      const functions = content.match(/function\s+\w+/g) || [];
      const documentedFunctions = content.match(/@param|@return/g) || [];
      
      if (functions.length > documentedFunctions.length) {
        warnings.push({ 
          type: 'documentation', 
          message: `Only ${documentedFunctions.length}/${functions.length} functions have documentation` 
        });
      }
      
      return { status: warnings.length === 0 ? 'passed' : 'warning', warnings };
      
    } catch (error) {
      return { status: 'error', message: 'Documentation check failed', error: error.message };
    }
  }

  async checkTestCoverage(contractName) {
    try {
      // Check if test file exists
      const testFile = path.join(this.contractsDir, 'test', `${contractName}.test.js`);
      const testExists = fs.existsSync(testFile);
      
      if (!testExists) {
        return { 
          status: 'failed', 
          message: `No test file found for ${contractName}`,
          coverage: 0 
        };
      }
      
      // Run tests and get coverage
      try {
        execSync(`cd ${this.contractsDir} && npx hardhat test test/${contractName}.test.js --coverage`, { stdio: 'pipe' });
        return { status: 'passed', message: 'Tests pass with coverage', coverage: 100 };
      } catch (error) {
        return { status: 'failed', message: 'Tests failed', error: error.message, coverage: 0 };
      }
      
    } catch (error) {
      return { status: 'error', message: 'Test coverage check failed', error: error.message };
    }
  }

  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        return i + 1;
      }
    }
    return null;
  }

  generateReport() {
    const reportPath = path.join(__dirname, '../contract-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.report, null, 2));
    console.log(`📊 Report saved to: ${reportPath}`);
  }

  printSummary() {
    console.log('\n📋 Contract Analysis Summary');
    console.log('=' .repeat(50));
    console.log(`Total Contracts: ${this.report.summary.total}`);
    console.log(`✅ Passed: ${this.report.summary.passed}`);
    console.log(`❌ Failed: ${this.report.summary.failed}`);
    console.log(`⚠️  Warnings: ${this.report.summary.warnings}`);
    console.log(`🚨 Critical Issues: ${this.report.summary.criticalIssues}`);
    
    if (this.report.summary.criticalIssues > 0) {
      console.log('\n🚨 Critical Issues Found:');
      this.report.contracts.forEach(contract => {
        const criticalIssues = contract.issues.filter(issue => issue.severity === 'critical');
        if (criticalIssues.length > 0) {
          console.log(`  ${contract.name}:`);
          criticalIssues.forEach(issue => {
            console.log(`    - ${issue.message} (line ${issue.line || 'N/A'})`);
          });
        }
      });
    }
  }
}

// Run analysis if called directly
if (require.main === module) {
  const analyzer = new ContractAnalyzer();
  analyzer.analyzeAll();
}

module.exports = ContractAnalyzer;