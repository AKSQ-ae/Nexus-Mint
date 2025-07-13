import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { BrowserRouter } from 'react-router-dom';
import { Providers } from '@/components/providers/Providers';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Wrapper component for testing
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <Providers>
      {children}
    </Providers>
  </BrowserRouter>
);

describe('Accessibility Tests', () => {
  it('should not have accessibility violations on homepage', async () => {
    const { default: Index } = await import('@/pages/Index');
    const { container } = render(
      <TestWrapper>
        <Index />
      </TestWrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations on properties page', async () => {
    const { default: Properties } = await import('@/pages/Properties');
    const { container } = render(
      <TestWrapper>
        <Properties />
      </TestWrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations on early access page', async () => {
    const { default: EarlyAccess } = await import('@/pages/EarlyAccess');
    const { container } = render(
      <TestWrapper>
        <EarlyAccess />
      </TestWrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations on dashboard', async () => {
    const { default: Dashboard } = await import('@/pages/Dashboard');
    const { container } = render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});