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
    sourcemap: mode === 'development', // Only enable source maps in development
    minify: 'terser', // Better minification than esbuild
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Optimize chunk splitting
          if (id.includes('node_modules')) {
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
            if (id.includes('@rainbow-me') || id.includes('wagmi')) {
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
            return 'vendor'; // all other vendor chunks
          }
        },
        // Asset naming for CDN optimization
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      }
    },
    chunkSizeWarningLimit: 600, // Stricter limit
    // AWS S3/CloudFront compatibility
    assetsDir: 'assets',
    emptyOutDir: true,
    // Performance optimizations
    reportCompressedSize: false, // Faster builds
    cssCodeSplit: true,
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
      '@tanstack/react-query',
      'zod'
    ],
    exclude: [
      '@reown/appkit',
      '@walletconnect/core'
    ],
    esbuildOptions: {
      target: 'es2020',
    }
  }
}))
