// TailwindCSS Purge Audit Configuration
// This helps identify unused CSS classes and optimize bundle size

const fs = require('fs');
const path = require('path');

// Function to analyze Tailwind usage
function analyzeTailwindUsage() {
  const sourceFiles = [
    'src/**/*.{js,jsx,ts,tsx}',
    'index.html',
  ];

  const usedClasses = new Set();
  const unusedClasses = new Set();

  // This would be integrated with PostCSS to analyze actual usage
  // For now, we'll create a basic structure for analysis

  return {
    usedClasses: Array.from(usedClasses),
    unusedClasses: Array.from(unusedClasses),
    totalClasses: usedClasses.size + unusedClasses.size,
    usagePercentage: (usedClasses.size / (usedClasses.size + unusedClasses.size)) * 100,
  };
}

// Performance budget for CSS
const CSS_PERFORMANCE_BUDGET = {
  maxSizeKB: 50, // Max CSS bundle size
  maxUnusedPercentage: 10, // Max percentage of unused CSS
  criticalClasses: [
    // Core classes that should always be included
    'container',
    'mx-auto',
    'flex',
    'grid',
    'hidden',
    'block',
    'text-center',
    'font-bold',
    'bg-primary',
    'text-primary',
    'hover:*',
    'focus:*',
    'active:*',
  ],
};

module.exports = {
  analyzeTailwindUsage,
  CSS_PERFORMANCE_BUDGET,
};