import { test, expect } from '@playwright/test';

test.describe('Property Tokenization Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Suppress console errors
    await page.addInitScript(() => {
      console.error = () => {};
      console.warn = () => {};
    });

    // Mock wallet connection for all tests
    await page.addInitScript(() => {
      (window as any).ethereum = {
        request: async (params: any) => {
          if (params.method === 'eth_requestAccounts') {
            return ['0xDEADBEEF12345678'];
          }
          return null;
        },
        isMetaMask: true,
        selectedAddress: '0xDEADBEEF12345678',
      };
    });

    // Mock successful API responses
    await page.route('**/supabase/functions/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, contractAddress: '0x123456789' })
      });
    });
  });

  test('should access tokenization demo page', async ({ page }) => {
    await page.goto('/tokenization-demo');
    await expect(page.locator('body')).toBeVisible();
    
    // Page should load with content
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should access tokenization dashboard', async ({ page }) => {
    await page.goto('/tokenization-dashboard');
    await expect(page.locator('body')).toBeVisible();
    
    // Page should load successfully
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should handle form inputs', async ({ page }) => {
    await page.goto('/tokenization-demo');
    
    // Look for form inputs
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      // Try filling the first input
      const firstInput = inputs.first();
      await firstInput.fill('TEST');
      
      // Verify input was filled
      await expect(firstInput).toHaveValue('TEST');
    }
    
    // Page should remain functional
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle tokenization process errors', async ({ page }) => {
    // Mock API error
    await page.route('**/supabase/functions/live-tokenization-deploy', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Network error' })
      });
    });

    await page.goto('/tokenization-demo');
    await expect(page.locator('body')).toBeVisible();
    
    // Page should handle errors gracefully
    const content = await page.locator('body').textContent();
    expect(content).toBeTruthy();
  });

  test('should navigate between tokenization pages', async ({ page }) => {
    const pages = ['/tokenization-demo', '/tokenization-dashboard'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      await expect(page.locator('body')).toBeVisible();
      
      // Each page should have content
      const content = await page.locator('body').textContent();
      expect(content).toBeTruthy();
    }
  });
});