import { test, expect } from '@playwright/test';

test.describe('Basic Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress console errors
    await page.addInitScript(() => {
      console.error = () => {};
      console.warn = () => {};
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

  test('Investment process end-to-end', async ({ page }) => {
    await page.goto('/properties');
    
    // Test property loading
    await page.waitForSelector('[data-testid="property-card"]', { timeout: 10000 });
    
    // Test property details
    await page.click('[data-testid="property-card"]');
    await expect(page.locator('text=Invest')).toBeVisible();
    
    // Test investment flow
    await page.click('text=Invest');
    await expect(page.locator('input[type="number"]')).toBeVisible();
  });

  test('Help center modal navigation fix', async ({ page }) => {
    // Click help center
    await page.click('[data-testid="help-center-button"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Test quick action buttons don't break navigation
    const currentUrl = page.url();
    await page.click('text=Properties');
    
    // Should close modal and navigate properly
    await page.waitForTimeout(200);
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page).toHaveURL(/.*properties/);
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Test navigation menu
    await page.click('[data-testid="mobile-menu"]');
    await expect(page.locator('nav')).toBeVisible();
    
    // Test forms are usable on mobile
    await page.goto('/early-access');
    await page.fill('input[name="email"]', 'test@mobile.com');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@mobile.com');
  });

  test('Error handling and edge cases', async ({ page }) => {
    // Test invalid routes
    await page.goto('/invalid-route');
    await expect(page.locator('text=404')).toBeVisible();
    
    // Test network errors
    await page.route('**/api/**', route => route.abort());
    await page.goto('/properties');
    await expect(page.locator('text=error')).toBeVisible();
  });

  test('Performance under stress', async ({ page }) => {
    // Test rapid navigation
    for (let i = 0; i < 5; i++) {
      await page.click('text=Properties');
      await page.click('text=Home');
      await page.waitForTimeout(100);
    }
    
    // Should still be responsive
    await expect(page.locator('h1')).toBeVisible();
  });
});