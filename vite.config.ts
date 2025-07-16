import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize for production deployment
    outDir: 'dist',
    sourcemap: true, // Enable source maps for analysis
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React and routing
          if (id.includes('react') || id.includes('react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('react-router')) {
            return 'vendor-router';
          }

          // UI libraries
          if (id.includes('@radix-ui')) {
            return 'vendor-ui';
          }
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          // Crypto and blockchain
          if (id.includes('ethers') || id.includes('viem') || id.includes('wagmi')) {
            return 'vendor-crypto';
          }
          if (id.includes('@reown') || id.includes('@walletconnect')) {
            return 'vendor-wallets';
          }
          if (id.includes('@metamask') || id.includes('metamask-sdk')) {
            return 'vendor-metamask';
          }

          // Utilities
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'vendor-utils';
          }

          // Analytics and monitoring
          if (id.includes('@sentry')) {
            return 'vendor-analytics';
          }

          // Database and backend
          if (id.includes('@supabase')) {
            return 'vendor-supabase';
          }

          // AI and ML
          if (id.includes('@11labs') || id.includes('openai')) {
            return 'vendor-ai';
          }

          // Date and time utilities
          if (id.includes('date-fns')) {
            return 'vendor-dates';
          }

          // Form handling
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'vendor-forms';
          }

          // Charts and visualization
          if (id.includes('recharts') || id.includes('chart.js')) {
            return 'vendor-charts';
          }

          // File handling
          if (id.includes('file-saver') || id.includes('jszip')) {
            return 'vendor-files';
          }

          // Web3Modal and wallet connections
          if (id.includes('@web3modal') || id.includes('w3m')) {
            return 'vendor-web3modal';
          }

          // RainbowKit
          if (id.includes('@rainbow-me')) {
            return 'vendor-rainbowkit';
          }

          // Other large dependencies
          if (id.includes('lodash')) {
            return 'vendor-lodash';
          }
          if (id.includes('framer-motion')) {
            return 'vendor-animations';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increased to accommodate large chunks
    // Ensure compatibility with Vercel
    assetsDir: 'assets',
    emptyOutDir: true
  },
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    port: 8080,
    host: true
  },
  // Optimize dependencies for production
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'ethers',
      'viem',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'date-fns'
    ],
    exclude: [
      '@reown/appkit',
      '@walletconnect/core',
      '@metamask/sdk'
    ]
  }
}))
