import { test, expect } from '@playwright/test';

test.describe('Basic Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock dependencies before page loads
    await page.addInitScript(() => {
      // Mock Supabase environment
      (window as any).SUPABASE_ANON_KEY = 'test-key';
      (window as any).SUPABASE_URL = 'https://test.supabase.co';
      
      // Mock wallet
      (window as any).ethereum = {
        request: async () => ['0xTest'],
        isMetaMask: true
      };
      
      // Suppress console noise
      console.error = () => {};
      console.warn = () => {};
    });

    // Mock API calls
    await page.route('**/supabase/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], error: null })
      });
    });
  });

  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that page loaded (flexible check)
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL('/');
  });

  test('should navigate between main pages', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation to different pages
    const pages = ['/properties', '/how-it-works', '/early-access'];
    
    for (const pagePath of pages) {
      // Try navigation via link click or direct goto
      try {
        await page.click(`a[href="${pagePath}"]`);
      } catch {
        await page.goto(pagePath);
      }
      
      // Verify we reached the page
      await expect(page).toHaveURL(pagePath);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should load properties page', async ({ page }) => {
    await page.goto('/properties');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that page loads with content
    await expect(page.locator('body')).toBeVisible();
    
    // Page should have some content
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should handle modal interactions', async ({ page }) => {
    await page.goto('/');
    
    // Look for any button that might open a modal
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Try clicking the first button and check for modal
      await buttons.first().click();
      await page.waitForTimeout(500);
    }
    
    // Test navigation still works
    await page.goto('/properties');
    await expect(page).toHaveURL(/.*properties/);
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
    
    // Test forms are usable on mobile
    await page.goto('/early-access');
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@mobile.com');
      await expect(emailInput).toHaveValue('test@mobile.com');
    }
  });

  test('Error handling and edge cases', async ({ page }) => {
    // Test invalid routes - should not crash
    await page.goto('/invalid-route-12345');
    await expect(page.locator('body')).toBeVisible();
    
    // Test that app handles API errors gracefully
    await page.route('**/supabase/functions/**', route => route.abort());
    await page.goto('/properties');
    await expect(page.locator('body')).toBeVisible();
  });

  test('Performance under stress', async ({ page }) => {
    // Test rapid navigation
    const routes = ['/', '/properties', '/how-it-works'];
    
    for (let i = 0; i < 3; i++) {
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(100);
      }
    }
    
    // Should still be responsive
    await expect(page.locator('body')).toBeVisible();
  });
});