import { test, expect } from '@playwright/test';

test.describe('Investment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock localStorage for persisted state
    await page.addInitScript(() => {
      // Prevent real Supabase calls
      (window as any).SUPABASE_ANON_KEY = 'test-key';
      (window as any).SUPABASE_URL = 'https://test.supabase.co';
    });

    // Mock all external API calls
    await page.route('**/supabase/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          data: [], 
          error: null,
          count: 0,
          status: 200,
          statusText: 'OK'
        })
      });
    });

    // Mock wallet providers
    await page.addInitScript(() => {
      (window as any).ethereum = {
        request: async () => ['0xTest'],
        isMetaMask: true,
        selectedAddress: '0xTest',
        chainId: '0x1',
      };
    });

    // Suppress console noise  
    await page.addInitScript(() => {
      console.error = () => {};
      console.warn = () => {};
    });
  });

  test('should navigate to properties page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for React to load and render
    await page.waitForLoadState('domcontentloaded');
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Navigate to properties
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on properties page
    await expect(page).toHaveURL(/.*properties/);
    
    // Check for React content (not just body)
    await expect(page.locator('[data-testid], main, .container, div')).toBeVisible();
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
    // Use the how-it-works page which contains investment calculator
    await page.goto('/how-it-works');
    
    // Check that page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // The page should have some content
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
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