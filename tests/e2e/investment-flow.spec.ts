import { test, expect } from '@playwright/test';

test.describe('Complete Investment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full investment journey', async ({ page }) => {
    // Step 1: Navigate to properties
    await page.click('text=Properties');
    await expect(page).toHaveURL('/properties');
    
    // Verify properties are loaded
    await expect(page.locator('[data-testid="property-card"]').first()).toBeVisible();
    
    // Step 2: Select a property
    await page.locator('[data-testid="property-card"]').first().click();
    await expect(page.locator('h1')).toContainText('Property Details');
    
    // Step 3: Start investment process
    await page.click('text=Invest Now');
    
    // Should redirect to sign in if not authenticated
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should handle wallet connection flow', async ({ page }) => {
    // Navigate to wallet connection
    await page.goto('/auth/signin');
    
    // Click wallet connect button
    await page.click('[data-testid="wallet-connect-button"]');
    
    // Verify wallet modal appears
    await expect(page.locator('[data-testid="wallet-modal"]')).toBeVisible();
    
    // Test MetaMask option
    await page.click('text=MetaMask');
    
    // Should show connection status
    await expect(page.locator('text=Connecting')).toBeVisible();
  });

  test('should complete KYC verification flow', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/profile');
    
    // Navigate to KYC section
    await page.click('text=Complete KYC');
    
    // Fill KYC form
    await page.fill('[data-testid="kyc-full-name"]', 'John Doe');
    await page.fill('[data-testid="kyc-email"]', 'john@example.com');
    await page.fill('[data-testid="kyc-phone"]', '+1234567890');
    
    // Upload document (mock file)
    const fileInput = page.locator('[data-testid="kyc-document-upload"]');
    await fileInput.setInputFiles({
      name: 'passport.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('mock pdf content')
    });
    
    // Submit KYC
    await page.click('[data-testid="kyc-submit"]');
    
    // Verify submission success
    await expect(page.locator('text=KYC submitted successfully')).toBeVisible();
  });

  test('should handle investment calculation', async ({ page }) => {
    await page.goto('/properties');
    
    // Select property
    await page.locator('[data-testid="property-card"]').first().click();
    
    // Test investment calculator
    await page.fill('[data-testid="investment-amount"]', '1000');
    
    // Verify calculations update
    await expect(page.locator('[data-testid="token-amount"]')).toContainText('10'); // 1000/100 = 10 tokens
    await expect(page.locator('[data-testid="fees-amount"]')).toContainText('25'); // 2.5% fee
    await expect(page.locator('[data-testid="total-amount"]')).toContainText('1025');
  });

  test('should complete payment flow', async ({ page }) => {
    // Mock authenticated user with completed KYC
    await page.goto('/investment/new?property=test-property-id&amount=1000');
    
    // Select payment method
    await page.click('[data-testid="payment-method-card"]');
    
    // Fill card details (test data)
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    
    // Submit payment
    await page.click('[data-testid="submit-payment"]');
    
    // Verify success page
    await expect(page).toHaveURL(/\/investment\/success/);
    await expect(page.locator('text=Investment Successful')).toBeVisible();
  });

  test('should show portfolio after investment', async ({ page }) => {
    await page.goto('/portfolio');
    
    // Verify portfolio loads
    await expect(page.locator('[data-testid="portfolio-overview"]')).toBeVisible();
    
    // Check investment cards
    await expect(page.locator('[data-testid="investment-card"]')).toHaveCount.toBeGreaterThan(0);
    
    // Test portfolio metrics
    await expect(page.locator('[data-testid="total-invested"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="roi-percentage"]')).toBeVisible();
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/**', route => route.abort());
    
    await page.goto('/properties');
    
    // Should show error state
    await expect(page.locator('text=Failed to load')).toBeVisible();
    
    // Test retry functionality
    await page.unroute('**/api/**');
    await page.click('[data-testid="retry-button"]');
    
    // Should recover and show content
    await expect(page.locator('[data-testid="property-card"]')).toBeVisible();
  });
});

test.describe('Mobile Investment Flow', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should work on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Navigate to properties
    await page.click('[data-testid="mobile-nav-properties"]');
    await expect(page).toHaveURL('/properties');
    
    // Test mobile property cards
    await expect(page.locator('[data-testid="property-card"]')).toBeVisible();
    
    // Test touch interactions
    await page.locator('[data-testid="property-card"]').first().tap();
    await expect(page.locator('h1')).toContainText('Property Details');
  });
});