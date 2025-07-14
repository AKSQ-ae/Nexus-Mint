import { test, expect } from '@playwright/test';

test.describe('Basic UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress console errors
    await page.addInitScript(() => {
      console.error = () => {};
      console.warn = () => {};
    });
  });

  test('should load and display main UI elements', async ({ page }) => {
    await page.goto('/');
    
    // Check that basic elements are present
    await expect(page.locator('body')).toBeVisible();
    
    // Look for common UI elements (flexible selectors)
    const possibleElements = [
      'nav', 'header', 'main', 'footer',
      'button', 'a', 'h1', 'h2'
    ];
    
    let foundElements = 0;
    for (const selector of possibleElements) {
      const count = await page.locator(selector).count();
      if (count > 0) foundElements++;
    }
    
    // Expect at least some UI elements to be present
    expect(foundElements).toBeGreaterThan(2);
  });

  test('should check responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check page loads on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Test that content fits in mobile viewport
    const body = await page.locator('body').boundingBox();
    expect(body?.width).toBeLessThanOrEqual(375);
  });

  test('should handle page loading states', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to be in a stable state
    await page.waitForLoadState('networkidle');
    
    // Check that the page is functional
    await expect(page.locator('body')).toBeVisible();
    
    // Test that we can navigate to other pages
    await page.goto('/properties');
    await expect(page.locator('body')).toBeVisible();
  });
});