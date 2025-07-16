import '@testing-library/jest-dom';

// Mock global objects for testing
global.fetch = jest.fn();

// Mock window.gtag for analytics
Object.defineProperty(window, 'gtag', {
  value: jest.fn(),
  writable: true
});

// Mock webkitSpeechRecognition
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn(),
  writable: true
});