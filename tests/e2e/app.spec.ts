import { test, expect } from '@playwright/test';

test.describe('Nexus Mint E2E Tests', () => {
  test('should navigate through main pages without errors', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Properties');
    await expect(page).toHaveURL(/.*properties/);
    
    await page.click('text=System Health');
    await expect(page).toHaveURL(/.*system-health/);
  });

  test('help center modal should work correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click help center 
    await page.click('[data-testid="help-center-button"]');
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Test navigation doesn't affect background
    const currentUrl = page.url();
    await page.click('text=Properties');
    
    // Modal should close and navigate
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    await expect(page).toHaveURL(/.*properties/);
  });
});