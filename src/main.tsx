import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrandingProvider } from './contexts/BrandingContext';
import './index.css'
import { initSentry } from './lib/sentry'
import { addResourceHints, preloadRoutes, registerServiceWorkerUpdates } from './components/performance/LoadingOptimization'
import SentryErrorBoundary from './components/SentryErrorBoundary'

// Initialize Sentry for error tracking
initSentry();

// Performance optimizations
addResourceHints();
preloadRoutes();
registerServiceWorkerUpdates();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SentryErrorBoundary>
      <BrandingProvider>
        <App />
      </BrandingProvider>
    </SentryErrorBoundary>
  </React.StrictMode>
);
