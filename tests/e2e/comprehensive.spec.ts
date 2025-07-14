import { test, expect } from '@playwright/test';

test.describe('Comprehensive System Integration', () => {
  test('should complete full user journey from signup to investment', async ({ page }) => {
    // 1. Start from home page
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // 2. Navigate to authentication
    await page.click('a[href="/auth/signin"]');
    await page.waitForURL('**/auth/signin');

    // 3. Sign up new user
    await page.click('a[href="/auth/signup"]');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');

    // 4. Mock wallet connection
    await page.addInitScript(() => {
      (window as any).ethereum = {
        request: async () => ['0xDEADBEEF12345678'],
        isMetaMask: true,
        selectedAddress: '0xDEADBEEF12345678',
      };
    });

    // 5. Connect wallet
    await page.click('button:has-text("Connect Wallet")');
    await expect(page.locator('text=0xDEAD...5678')).toBeVisible({ timeout: 10000 });

    // 6. Complete profile setup
    await page.click('a[href="/profile"]');
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[name="phoneNumber"]', '+971501234567');
    await page.click('button:has-text("Save Profile")');

    // 7. Upload KYC document
    const mockFileContent = Buffer.from('mock-kyc-document');
    await page.setInputFiles('input[type="file"]', {
      name: 'passport.png',
      mimeType: 'image/png',
      buffer: mockFileContent,
    });
    await page.click('button:has-text("Upload")');

    // 8. Browse properties
    await page.click('a[href="/properties"]');
    await expect(page.locator('[data-testid="property-card"]')).toBeVisible();

    // 9. View property details
    await page.click('[data-testid="property-card"]:first-child');
    await expect(page.locator('text=Property Details')).toBeVisible();

    // 10. Make investment
    await page.click('button:has-text("Invest Now")');
    await page.fill('input[placeholder*="amount"]', '1000');
    await page.click('button:has-text("Proceed to Payment")');

    // 11. Complete payment
    await page.click('input[value="stripe"]');
    await page.click('button:has-text("Complete Investment")');
    await expect(page.locator('text=Investment Successful')).toBeVisible({ timeout: 15000 });

    // 12. Check portfolio
    await page.click('a[href="/portfolio"]');
    await expect(page.locator('text=1000 AED')).toBeVisible();
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