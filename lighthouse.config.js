module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:5173/', 'http://localhost:5173/properties', 'http://localhost:5173/early-access'],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Local:.*:5173',
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};