import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Removed componentTagger plugin due to incompatible peer dependency
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
            '@reown/appkit',
            '@reown/appkit-controllers',
            '@walletconnect/core',
            '@walletconnect/utils'
          ],
          'vendor-icons': ['lucide-react'],
          'vendor-utils': ['clsx', 'tailwind-merge'],
          'vendor-analytics': ['@sentry/react'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ai': ['@11labs/react']
        }
      }
    },
    chunkSizeWarningLimit: 800, // Reduced from 1000
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
      'lucide-react'
    ],
    exclude: [
      '@reown/appkit',
      '@walletconnect/core'
    ]
  }
}))
