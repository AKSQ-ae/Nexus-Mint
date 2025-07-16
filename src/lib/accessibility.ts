import { createComponentLogger } from './logger';

const logger = createComponentLogger('Accessibility');

// ARIA Live Region Manager
class AriaLiveRegionManager {
  private regions: Map<string, HTMLElement> = new Map();

  constructor() {
    this.createDefaultRegions();
  }

  private createDefaultRegions() {
    const regions = [
      { id: 'announcements', level: 'polite' },
      { id: 'alerts', level: 'assertive' },
      { id: 'status', level: 'polite' }
    ];

    regions.forEach(({ id, level }) => {
      const region = document.createElement('div');
      region.id = `aria-live-${id}`;
      region.setAttribute('aria-live', level);
      region.setAttribute('aria-atomic', 'true');
      region.style.position = 'absolute';
      region.style.left = '-10000px';
      region.style.width = '1px';
      region.style.height = '1px';
      region.style.overflow = 'hidden';
      
      document.body.appendChild(region);
      this.regions.set(id, region);
    });
  }

  announce(message: string, type: 'polite' | 'assertive' | 'status' = 'polite') {
    const regionKey = type === 'assertive' ? 'alerts' : type === 'status' ? 'status' : 'announcements';
    const region = this.regions.get(regionKey);
    
    if (region) {
      region.textContent = message;
      logger.debug('Accessibility announcement', { message, type });
      
      // Clear after announcement to allow repeated messages
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }
}

export const ariaLiveRegions = new AriaLiveRegionManager();

// Focus Management
export class FocusManager {
  private focusStack: HTMLElement[] = [];
  private previouslyFocused: HTMLElement | null = null;

  trapFocus(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Store previously focused element
    this.previouslyFocused = document.activeElement as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
      
      if (e.key === 'Escape') {
        this.releaseFocus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement.focus();

    // Store cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      this.releaseFocus();
    };
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[role="button"]:not([disabled])',
      '[role="link"]:not([disabled])'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector))
      .filter(el => this.isVisible(el)) as HTMLElement[];
  }

  private isVisible(element: Element): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }

  releaseFocus() {
    if (this.previouslyFocused && this.isVisible(this.previouslyFocused)) {
      this.previouslyFocused.focus();
    }
    this.previouslyFocused = null;
  }

  setFocusToElement(element: HTMLElement | null) {
    if (element && this.isVisible(element)) {
      element.focus();
      return true;
    }
    return false;
  }
}

export const focusManager = new FocusManager();

// Skip Navigation Links
export function createSkipNavigation() {
  const skipNav = document.createElement('a');
  skipNav.href = '#main-content';
  skipNav.textContent = 'Skip to main content';
  skipNav.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded';
  
  // Insert as first element in body
  document.body.insertBefore(skipNav, document.body.firstChild);
  
  // Ensure main content area exists
  let mainContent = document.getElementById('main-content');
  if (!mainContent) {
    mainContent = document.createElement('main');
    mainContent.id = 'main-content';
    mainContent.setAttribute('tabindex', '-1');
    
    // Find app root and wrap it
    const appRoot = document.getElementById('root') || document.querySelector('#app') || document.body;
    if (appRoot && appRoot !== document.body) {
      const parent = appRoot.parentNode;
      if (parent) {
        parent.insertBefore(mainContent, appRoot);
        mainContent.appendChild(appRoot);
      }
    }
  }
}

// Color Contrast Utilities
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map(c => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  
  const lightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (lightest + 0.05) / (darkest + 0.05);
}

export function checkContrastCompliance(
  foreground: string, 
  background: string, 
  fontSize: number = 16,
  fontWeight: number = 400
): { ratio: number; wcagAA: boolean; wcagAAA: boolean } {
  const ratio = getContrastRatio(foreground, background);
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
  
  const wcagAA = isLargeText ? ratio >= 3 : ratio >= 4.5;
  const wcagAAA = isLargeText ? ratio >= 4.5 : ratio >= 7;
  
  return { ratio, wcagAA, wcagAAA };
}

// Reduced Motion Support
export function respectsReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createReducedMotionCSS() {
  if (respectsReducedMotion()) {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }
}

// Keyboard Navigation Enhancement
export function enhanceKeyboardNavigation() {
  // Add visible focus indicators
  const style = document.createElement('style');
  style.textContent = `
    .focus-visible:focus,
    *:focus-visible {
      outline: 2px solid hsl(var(--primary)) !important;
      outline-offset: 2px !important;
    }
    
    /* Hide focus for mouse users */
    *:focus:not(.focus-visible) {
      outline: none;
    }
  `;
  document.head.appendChild(style);

  // Enhanced keyboard navigation for custom components
  document.addEventListener('keydown', (e) => {
    // Arrow key navigation for radio groups
    if (e.target instanceof HTMLInputElement && e.target.type === 'radio') {
      const radioGroup = document.querySelectorAll(`input[name="${e.target.name}"]`);
      const currentIndex = Array.from(radioGroup).indexOf(e.target);
      
      let nextIndex = currentIndex;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % radioGroup.length;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + radioGroup.length) % radioGroup.length;
      }
      
      if (nextIndex !== currentIndex) {
        e.preventDefault();
        (radioGroup[nextIndex] as HTMLInputElement).focus();
        (radioGroup[nextIndex] as HTMLInputElement).checked = true;
      }
    }
  });
}

// Screen Reader Utilities
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  ariaLiveRegions.announce(message, priority);
}

export function setScreenReaderText(element: HTMLElement, text: string) {
  element.setAttribute('aria-label', text);
}

export function hideFromScreenReader(element: HTMLElement) {
  element.setAttribute('aria-hidden', 'true');
}

export function showToScreenReader(element: HTMLElement) {
  element.removeAttribute('aria-hidden');
}

// Form Accessibility Enhancements
export function enhanceFormAccessibility(form: HTMLFormElement) {
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    // Ensure labels are properly associated
    const label = form.querySelector(`label[for="${input.id}"]`) as HTMLLabelElement;
    if (!label && input.id) {
      const labelText = input.getAttribute('placeholder') || input.getAttribute('name') || 'Input field';
      const newLabel = document.createElement('label');
      newLabel.setAttribute('for', input.id);
      newLabel.textContent = labelText;
      newLabel.className = 'sr-only';
      input.parentNode?.insertBefore(newLabel, input);
    }
    
    // Add error descriptions
    const errorId = `${input.id}-error`;
    if (input.hasAttribute('aria-invalid') && input.getAttribute('aria-invalid') === 'true') {
      if (!document.getElementById(errorId)) {
        const errorDiv = document.createElement('div');
        errorDiv.id = errorId;
        errorDiv.className = 'text-sm text-destructive mt-1';
        errorDiv.setAttribute('aria-live', 'polite');
        input.parentNode?.insertBefore(errorDiv, input.nextSibling);
        input.setAttribute('aria-describedby', errorId);
      }
    }
  });
}

// React Hooks for Accessibility
export function useAnnouncement() {
  return {
    announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      announceToScreenReader(message, priority);
    }
  };
}

export function useFocusManagement() {
  return {
    trapFocus: (container: HTMLElement) => focusManager.trapFocus(container),
    releaseFocus: () => focusManager.releaseFocus(),
    setFocus: (element: HTMLElement | null) => focusManager.setFocusToElement(element)
  };
}

export function useKeyboardNavigation(onEscape?: () => void, onEnter?: () => void) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
      }
      if (e.key === 'Enter' && onEnter) {
        onEnter();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, onEnter]);
}

// Accessibility Testing Utilities
export function runAccessibilityAudit(): Promise<AccessibilityAuditResult[]> {
  return new Promise((resolve) => {
    const issues: AccessibilityAuditResult[] = [];
    
    // Check for missing alt attributes
    const images = document.querySelectorAll('img:not([alt])');
    images.forEach(img => {
      issues.push({
        type: 'missing-alt',
        element: img,
        message: 'Image missing alt attribute',
        severity: 'error'
      });
    });
    
    // Check for poor color contrast
    const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, button, a');
    textElements.forEach(el => {
      const computedStyle = window.getComputedStyle(el);
      const color = computedStyle.color;
      const backgroundColor = computedStyle.backgroundColor;
      
      if (color && backgroundColor && color !== backgroundColor) {
        const contrast = checkContrastCompliance(color, backgroundColor);
        if (!contrast.wcagAA) {
          issues.push({
            type: 'poor-contrast',
            element: el,
            message: `Poor color contrast ratio: ${contrast.ratio.toFixed(2)}`,
            severity: 'warning'
          });
        }
      }
    });
    
    // Check for missing form labels
    const inputs = document.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach(input => {
      const hasLabel = document.querySelector(`label[for="${input.id}"]`) || input.getAttribute('aria-label');
      if (!hasLabel) {
        issues.push({
          type: 'missing-label',
          element: input,
          message: 'Form control missing accessible label',
          severity: 'error'
        });
      }
    });
    
    resolve(issues);
  });
}

interface AccessibilityAuditResult {
  type: string;
  element: Element;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// Initialize accessibility enhancements
export function initializeAccessibility() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupAccessibility();
    });
  } else {
    setupAccessibility();
  }
}

function setupAccessibility() {
  createSkipNavigation();
  createReducedMotionCSS();
  enhanceKeyboardNavigation();
  
  logger.info('Accessibility enhancements initialized');
}

// Auto-initialize
initializeAccessibility();