import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/sentry'
import { addResourceHints, preloadRoutes, registerServiceWorkerUpdates } from './components/performance/LoadingOptimization'

// Initialize Sentry for error tracking
initSentry();

// Performance optimizations
addResourceHints();
preloadRoutes();
registerServiceWorkerUpdates();

createRoot(document.getElementById("root")!).render(<App />);
