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
          // Dynamic chunk splitting based on file paths
          if (id.includes('node_modules')) {
            // Split vendor chunks for better caching
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('ethers') || id.includes('viem')) {
              return 'vendor-crypto';
            }
            if (id.includes('@reown') || id.includes('@walletconnect')) {
              return 'vendor-wallets';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'vendor-utils';
            }
            if (id.includes('@sentry')) {
              return 'vendor-analytics';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('@11labs')) {
              return 'vendor-ai';
            }
            // Group remaining node_modules
            return 'vendor-misc';
          }
          
          // Split application code by feature
          if (id.includes('/src/components/')) {
            if (id.includes('/admin/')) return 'app-admin';
            if (id.includes('/dashboard/')) return 'app-dashboard';
            if (id.includes('/properties/')) return 'app-properties';
            if (id.includes('/investment/')) return 'app-investment';
            if (id.includes('/trading/')) return 'app-trading';
            if (id.includes('/tokenization/')) return 'app-tokenization';
            if (id.includes('/ai/')) return 'app-ai';
            if (id.includes('/analytics/')) return 'app-analytics';
            if (id.includes('/ui/')) return 'app-ui';
            return 'app-components';
          }
          
          if (id.includes('/src/pages/')) {
            return 'app-pages';
          }
          
          if (id.includes('/src/lib/')) {
            return 'app-lib';
          }
          
          // Default chunk for remaining app code
          return 'app-main';
        }
      }
    },
    chunkSizeWarningLimit: 500, // Further reduced for better performance
    // Ensure compatibility with Vercel
    assetsDir: 'assets',
    emptyOutDir: true,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize CSS
    cssMinify: true
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
      'lucide-react'
    ],
    exclude: [
      '@reown/appkit',
      '@walletconnect/core'
    ]
  }
}))
