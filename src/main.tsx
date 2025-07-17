import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
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

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <SentryErrorBoundary>
      <App />
    </SentryErrorBoundary>
  </React.StrictMode>
);
