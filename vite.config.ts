import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Optimize for production deployment
    outDir: 'dist',
    sourcemap: mode === 'development', // Only enable source maps in development
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-ui': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-toast',
            '@radix-ui/react-progress',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch'
          ],
          'vendor-crypto': ['ethers', 'viem'],
          'vendor-wallets': [
            '@rainbow-me/rainbowkit',
            'wagmi'
          ],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['clsx', 'tailwind-merge'],
          'vendor-analytics': ['@sentry/react'],
          'vendor-supabase': ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 800,
    // Ensure compatibility with AWS S3/CloudFront
    assetsDir: 'assets',
    emptyOutDir: true,
    // Optimize for AWS deployment
    reportCompressedSize: false,
    cssCodeSplit: true
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
    ]
  }
}))
