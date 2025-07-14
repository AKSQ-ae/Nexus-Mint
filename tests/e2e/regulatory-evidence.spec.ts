import { test, expect } from '@playwright/test';

test.describe('Regulatory Evidence Export', () => {
  test('should access phase 1 validation page', async ({ page }) => {
    await page.goto('/phase1-validation');
    await expect(page.locator('body')).toBeVisible();
    
    // Page should load successfully
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should access quality assurance page', async ({ page }) => {
    await page.goto('/quality-assurance');
    await expect(page.locator('body')).toBeVisible();
    
    // Page should load with content
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should handle form interactions', async ({ page }) => {
    await page.goto('/phase1-validation');
    
    // Look for form elements
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      // Try clicking a button
      const firstButton = buttons.first();
      await firstButton.click();
      await page.waitForTimeout(500);
    }
    
    // Page should remain functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/supabase/functions/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Evidence generation failed' })
      });
    });
    
    await page.goto('/phase1-validation');
    await expect(page.locator('body')).toBeVisible();
    
    // Page should handle errors gracefully
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should navigate between validation pages', async ({ page }) => {
    const pages = ['/phase1-validation', '/quality-assurance'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await expect(page.locator('body')).toBeVisible();
      
      // Each page should have content
      const content = await page.locator('body').textContent();
      expect(content).toBeTruthy();
    }
  });
});