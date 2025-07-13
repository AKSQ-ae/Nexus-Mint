import { test, expect } from '@playwright/test';

test.describe('Investment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display homepage elements', async ({ page }) => {
    // Check for main navigation
    await expect(page.locator('nav')).toBeVisible();
    
    // Check for hero section
    await expect(page.getByRole('heading', { name: /revolutionize real estate/i })).toBeVisible();
    
    // Check for CTA buttons
    await expect(page.getByRole('link', { name: /start investing/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /learn more/i })).toBeVisible();
  });

  test('should navigate to properties page', async ({ page }) => {
    await page.getByRole('link', { name: /properties/i }).click();
    await expect(page).toHaveURL(/\/properties/);
    
    // Check for properties grid
    await expect(page.locator('[data-testid="properties-grid"]')).toBeVisible();
  });

  test('should navigate to early access page', async ({ page }) => {
    await page.getByRole('link', { name: /early access/i }).click();
    await expect(page).toHaveURL(/\/early-access/);
    
    // Check for early access form
    await expect(page.getByRole('heading', { name: /join the revolution/i })).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });

  test('should submit early access form', async ({ page }) => {
    await page.goto('/early-access');
    
    // Fill out the form
    await page.fill('input[name="firstName"]', 'John');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.selectOption('select[name="investmentRange"]', '10000-50000');
    await page.selectOption('select[name="investmentExperience"]', 'some');
    
    // Submit the form
    await page.getByRole('button', { name: /join waitlist/i }).click();
    
    // Check for success message or redirect
    await expect(page.getByText(/success/i)).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to system health', async ({ page }) => {
    await page.goto('/system-health');
    
    // Check for system health components
    await expect(page.getByRole('heading', { name: /system health/i })).toBeVisible();
    await expect(page.locator('[data-testid="health-metrics"]')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile navigation
    await expect(page.locator('[data-testid="mobile-menu-toggle"]')).toBeVisible();
    
    // Test mobile menu
    await page.locator('[data-testid="mobile-menu-toggle"]').click();
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('should work on tablet devices', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check that content is properly displayed on tablet
    await expect(page.getByRole('heading', { name: /revolutionize real estate/i })).toBeVisible();
    await expect(page.locator('.grid')).toBeVisible();
  });
});