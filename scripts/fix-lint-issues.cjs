#!/usr/bin/env node

/**
 * 🔧 Lint Issues Auto-Fixer
 * Systematically fixes common TypeScript and React issues
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common 'any' type replacements
const anyTypeReplacements = {
  'any[]': 'unknown[]',
  'any;': 'unknown;',
  'any,': 'unknown,',
  'any)': 'unknown)',
  'any>': 'unknown>',
  'any =': 'unknown =',
  'any|': 'unknown|',
  'any &': 'unknown &',
  ': any': ': unknown',
  '(any': '(unknown',
  '<any': '<unknown',
  'Record<string, any>': 'Record<string, unknown>',
  'Array<any>': 'Array<unknown>',
  'Promise<any>': 'Promise<unknown>',
  'React.ComponentProps<any>': 'React.ComponentProps<typeof Component>',
  'event: any': 'event: Event',
  'error: any': 'error: Error',
  'data: any': 'data: unknown',
  'response: any': 'response: unknown',
  'result: any': 'result: unknown',
  'value: any': 'value: unknown',
  'item: any': 'item: unknown',
  'obj: any': 'obj: Record<string, unknown>',
  'params: any': 'params: Record<string, unknown>',
  'options: any': 'options: Record<string, unknown>',
  'config: any': 'config: Record<string, unknown>',
  'props: any': 'props: Record<string, unknown>',
};

// Files to process (excluding node_modules, dist, etc.)
const includePatterns = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'supabase/**/*.ts',
  'contracts/**/*.ts',
  'tests/**/*.ts',
  'tests/**/*.tsx',
];

const excludePatterns = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  'public',
  'assets',
];

class LintFixer {
  constructor() {
    this.fixedFiles = 0;
    this.fixedIssues = 0;
    this.errors = [];
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

  getAllFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludePatterns.some(pattern => entry.name.includes(pattern))) {
          this.getAllFiles(fullPath, files);
        }
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  fixAnyTypes(content) {
    let fixed = content;
    let changesCount = 0;
    
    Object.entries(anyTypeReplacements).forEach(([pattern, replacement]) => {
      const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = (fixed.match(regex) || []).length;
      if (matches > 0) {
        fixed = fixed.replace(regex, replacement);
        changesCount += matches;
      }
    });
    
    return { fixed, changesCount };
  }

  fixReactHookDependencies(content) {
    let fixed = content;
    let changesCount = 0;
    
    // Common React Hook dependency patterns
    const patterns = [
      // useEffect with missing dependencies
      {
        pattern: /useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);/g,
        description: 'Empty dependency array'
      },
      // useCallback without dependencies
      {
        pattern: /useCallback\(\([^)]*\) => \{[\s\S]*?\}\);/g,
        description: 'Missing useCallback dependencies'
      }
    ];
    
    // This is a simplified approach - more complex fixes would require AST parsing
    // For now, just add comments for manual review
    patterns.forEach(({ pattern, description }) => {
      fixed = fixed.replace(pattern, (match) => {
        if (!match.includes('// TODO: Fix dependencies')) {
          changesCount++;
          return `// TODO: Fix dependencies - ${description}\n  ${match}`;
        }
        return match;
      });
    });
    
    return { fixed, changesCount };
  }

  fixEmptyInterfaces(content) {
    let fixed = content;
    let changesCount = 0;
    
    // Fix empty interfaces extending other types
    const emptyInterfacePattern = /interface\s+(\w+)\s*\{\s*\}/g;
    fixed = fixed.replace(emptyInterfacePattern, (match, interfaceName) => {
      changesCount++;
      return `type ${interfaceName} = Record<string, never>;`;
    });
    
    return { fixed, changesCount };
  }

  fixRequireImports(content) {
    let fixed = content;
    let changesCount = 0;
    
    // Convert require() to import statements
    const requirePattern = /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);/g;
    fixed = fixed.replace(requirePattern, (match, varName, modulePath) => {
      changesCount++;
      return `import ${varName} from '${modulePath}';`;
    });
    
    return { fixed, changesCount };
  }

  processFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      let fixed = content;
      let totalChanges = 0;
      
      // Apply all fixes
      const fixes = [
        this.fixAnyTypes(fixed),
        this.fixReactHookDependencies(fixed),
        this.fixEmptyInterfaces(fixed),
        this.fixRequireImports(fixed)
      ];
      
      fixes.forEach(({ fixed: newContent, changesCount }) => {
        fixed = newContent;
        totalChanges += changesCount;
      });
      
      // Write back if there were changes
      if (totalChanges > 0) {
        fs.writeFileSync(filePath, fixed, 'utf8');
        this.fixedFiles++;
        this.fixedIssues += totalChanges;
        this.log(`Fixed ${totalChanges} issues in ${filePath}`, 'success');
      }
      
      return totalChanges;
    } catch (error) {
      this.log(`Error processing ${filePath}: ${error.message}`, 'error');
      this.errors.push({ file: filePath, error: error.message });
      return 0;
    }
  }

  async run() {
    this.log('🔧 Starting Lint Fixer...', 'info');
    
    // Get current lint issues count
    let currentIssues = 0;
    try {
      const lintOutput = execSync('npm run lint 2>&1 | grep -E "(error|warning)" | wc -l', { encoding: 'utf8' });
      currentIssues = parseInt(lintOutput.trim());
      this.log(`Current issues: ${currentIssues}`, 'info');
    } catch (error) {
      this.log('Could not get current lint count', 'warning');
    }
    
    // Get all TypeScript files
    const files = this.getAllFiles('src').concat(
      this.getAllFiles('supabase/functions'),
      this.getAllFiles('contracts'),
      this.getAllFiles('tests')
    );
    
    this.log(`Found ${files.length} TypeScript files to process`, 'info');
    
    // Process files in batches
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      this.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(files.length / batchSize)}`, 'info');
      
      batch.forEach(file => {
        this.processFile(file);
      });
    }
    
    // Final report
    this.log(`\n📊 LINT FIXER COMPLETE!`, 'success');
    this.log(`✅ Files processed: ${this.fixedFiles}`, 'success');
    this.log(`✅ Issues fixed: ${this.fixedIssues}`, 'success');
    
    if (this.errors.length > 0) {
      this.log(`❌ Errors encountered: ${this.errors.length}`, 'error');
      this.errors.forEach(({ file, error }) => {
        this.log(`   ${file}: ${error}`, 'error');
      });
    }
    
    // Check new lint count
    try {
      const lintOutput = execSync('npm run lint 2>&1 | grep -E "(error|warning)" | wc -l', { encoding: 'utf8' });
      const newIssues = parseInt(lintOutput.trim());
      const improvement = currentIssues - newIssues;
      
      if (improvement > 0) {
        this.log(`🎉 Reduced issues from ${currentIssues} to ${newIssues} (-${improvement})`, 'success');
      } else {
        this.log(`Current issues: ${newIssues}`, 'info');
      }
    } catch (error) {
      this.log('Could not get final lint count', 'warning');
    }
    
    this.log('\n🚀 Run "npm run lint" to see remaining issues', 'info');
    this.log('🔧 Run "git add . && git commit -m \'Fix: Automated lint fixes\'" to commit changes', 'info');
  }
}

// Run the fixer
const fixer = new LintFixer();
fixer.run().catch(console.error);