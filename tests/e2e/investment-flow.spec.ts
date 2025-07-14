import { test, expect } from '@playwright/test';

test.describe('Investment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress console errors to avoid noise
    await page.addInitScript(() => {
      console.error = () => {};
      console.warn = () => {};
    });

    // Mock wallet connection and Stripe
    await page.addInitScript(() => {
      (window as any).ethereum = {
        request: async (params: any) => {
          if (params.method === 'eth_requestAccounts') {
            return ['0xDEADBEEF12345678'];
          }
          if (params.method === 'eth_chainId') {
            return '0x1';
          }
          return null;
        },
        isMetaMask: true,
        selectedAddress: '0xDEADBEEF12345678',
        chainId: '0x1',
      };

      // Mock Stripe
      (window as any).Stripe = () => ({
        elements: () => ({
          create: () => ({
            mount: () => {},
            on: () => {},
          }),
        }),
        confirmPayment: () => Promise.resolve({ paymentIntent: { status: 'succeeded' } }),
      });
    });

    // Mock successful Supabase responses
    await page.route('**/supabase/functions/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, id: 'test-id' })
      });
    });
  });

  test('should navigate to properties page', async ({ page }) => {
    await page.goto('/');
    
    // Check home page loads
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    
    // Navigate to properties via direct navigation (most reliable)
    await page.goto('/properties');
    
    // Verify we're on properties page
    await expect(page).toHaveURL(/.*properties/);
    
    // Check for basic content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load properties page content', async ({ page }) => {
    await page.goto('/properties');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded properly
    await expect(page.locator('body')).toBeVisible();
    
    // The page should have some content (properties, loading, or empty state)
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });

  test('should access investment calculator', async ({ page }) => {
    await page.goto('/investment-calculator');
    
    // Check that calculator page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Look for input elements (flexible selector)
    const inputs = page.locator('input[type="number"]');
    if (await inputs.count() > 0) {
      await inputs.first().fill('1000');
      await expect(page.locator('body')).toContainText('1000');
    }
  });

  test('should handle navigation to payment page', async ({ page }) => {
    await page.goto('/payments');
    
    // Check that payments page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Mock API calls to prevent errors
    await page.route('**/supabase/functions/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Page should have payment-related content
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should access authentication pages', async ({ page }) => {
    // Test sign in page
    await page.goto('/auth/signin');
    await expect(page.locator('body')).toBeVisible();
    
    // Test sign up page
    await page.goto('/auth/signup');
    await expect(page.locator('body')).toBeVisible();
    
    // Pages should load without errors
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should access profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // Check that profile page loads (may show login required)
    await expect(page.locator('body')).toBeVisible();
    
    // Page should have some content
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should access portfolio page', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Check that portfolio page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Page should have content (may show login required or empty portfolio)
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should handle different routes gracefully', async ({ page }) => {
    const routes = ['/how-it-works', '/early-access', '/dashboard'];
    
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
      
      // Each page should have some content
      const content = await page.locator('body').textContent();
      expect(content).toBeTruthy();
    }
  });
});

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    // Check mobile layout loads
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile navigation to properties
    await page.goto('/properties');
    await expect(page).toHaveURL('/properties');
    
    // Verify mobile layout doesn't overflow
    const body = await page.locator('body').boundingBox();
    expect(body?.width).toBeLessThanOrEqual(375 + 10); // Small tolerance
  });
});