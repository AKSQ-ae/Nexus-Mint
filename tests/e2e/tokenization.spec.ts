import { test, expect } from '@playwright/test';

test.describe('Property Tokenization Flow', () => {
  test.beforeEach(async ({ page }) => {
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
  });

  test('should complete full tokenization flow', async ({ page }) => {
    // 1. Navigate to tokenization page
    await page.goto('/tokenization-demo');
    await expect(page.locator('h1:has-text("Property Tokenization")')).toBeVisible();

    // 2. Select a property for tokenization
    await page.click('[data-testid="property-card"]:first-child');
    await expect(page.locator('text=Tokenize this Property')).toBeVisible();

    // 3. Click tokenize button
    await page.click('button:has-text("Tokenize Property")');

    // 4. Fill tokenization form
    await page.fill('input[name="tokenSymbol"]', 'TEST');
    await page.fill('input[name="totalSupply"]', '1000');
    await page.fill('input[name="initialPrice"]', '100');

    // 5. Step through wizard
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');

    // 6. Confirm tokenization
    await page.click('button:has-text("Confirm & Deploy")');

    // 7. Wait for success message
    await expect(page.locator('text=Tokenization successful')).toBeVisible({ timeout: 15000 });

    // 8. Verify contract deployment
    await expect(page.locator('text=Contract Address:')).toBeVisible();
  });

  test('should validate tokenization inputs', async ({ page }) => {
    await page.goto('/tokenization-demo');
    
    // Try to proceed without filling required fields
    await page.click('[data-testid="property-card"]:first-child');
    await page.click('button:has-text("Tokenize Property")');
    await page.click('button:has-text("Next")');

    // Should show validation errors
    await expect(page.locator('text=Token symbol is required')).toBeVisible();
    await expect(page.locator('text=Total supply must be greater than 0')).toBeVisible();
  });

  test('should handle tokenization errors', async ({ page }) => {
    await page.goto('/tokenization-demo');
    
    // Mock network error
    await page.route('**/supabase/functions/live-tokenization-deploy', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Network error' })
      });
    });

    await page.click('[data-testid="property-card"]:first-child');
    await page.click('button:has-text("Tokenize Property")');
    
    // Fill form and submit
    await page.fill('input[name="tokenSymbol"]', 'TEST');
    await page.fill('input[name="totalSupply"]', '1000');
    await page.fill('input[name="initialPrice"]', '100');
    await page.click('button:has-text("Confirm & Deploy")');

    await expect(page.locator('text=Tokenization failed')).toBeVisible({ timeout: 10000 });
  });
});