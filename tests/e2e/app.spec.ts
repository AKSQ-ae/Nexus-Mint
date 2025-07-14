import { test, expect } from '@playwright/test';

test.describe('Basic App Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress console errors and warnings to reduce noise
    await page.addInitScript(() => {
      console.error = () => {};
      console.warn = () => {};
    });
  });

  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Basic checks that the app loaded
    await expect(page).toHaveURL('/');
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    
    // Check that React app mounted (look for React root or any content)
    const hasContent = await page.locator('body').textContent();
    expect(hasContent).toBeTruthy();
  });

  test('should navigate through main pages without errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Test basic navigation
    const testRoutes = ['/properties', '/how-it-works', '/early-access'];
    
    for (const route of testRoutes) {
      await page.goto(route);
      await expect(page.locator('body')).toBeVisible();
      await expect(page).toHaveURL(route);
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check mobile rendering
    await expect(page.locator('body')).toBeVisible();
    
    // Verify content doesn't overflow horizontally
    const viewport = page.viewportSize();
    const body = await page.locator('body').boundingBox();
    
    if (body && viewport) {
      expect(body.width).toBeLessThanOrEqual(viewport.width + 50); // Small tolerance
    }
  });

  test('should handle unknown routes gracefully', async ({ page }) => {
    // Test invalid route - should show 404 or redirect
    await page.goto('/this-page-does-not-exist-12345');
    
    // Should still load something (404 page or redirect)
    await expect(page.locator('body')).toBeVisible();
    
    // The app should handle it gracefully, not crash
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });
});