module.exports = {
  tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
  rules: {
    // Customize rules as needed
    'color-contrast': { enabled: true },
    'keyboard-navigation': { enabled: true },
    'focus-management': { enabled: true },
    'aria-labels': { enabled: true },
    'heading-structure': { enabled: true },
    'form-labels': { enabled: true },
    'image-alt': { enabled: true },
  },
  exclude: [
    // Exclude third-party components if needed
    '#third-party-widget',
  ],
};