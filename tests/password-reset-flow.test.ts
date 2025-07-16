import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'newpassword123';

test.describe('Password Reset Flow', () => {
  test('Complete password reset flow', async ({ page }) => {
    // Step 1: Navigate to forgot password page
    await page.goto(`${BASE_URL}/auth/forgot-password`);
    await expect(page).toHaveTitle(/Forgot Password/);
    
    // Verify the form is present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Step 2: Submit forgot password form
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=Check your email')).toBeVisible();
    await expect(page.locator(`text=${TEST_EMAIL}`)).toBeVisible();
    
    // Step 3: Simulate clicking the reset link (this would normally come from email)
    // For testing, we'll directly navigate to the reset page with a mock token
    const mockToken = 'test-reset-token-123';
    await page.goto(`${BASE_URL}/auth/reset?token=${mockToken}`);
    
    // Verify the reset form is present
    await expect(page.locator('text=Reset your password')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Step 4: Fill out the reset password form
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill(TEST_PASSWORD);
    await passwordInputs.nth(1).fill(TEST_PASSWORD);
    
    // Step 5: Submit the form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=Password updated')).toBeVisible();
    
    // Step 6: Verify redirect to sign in page
    await page.waitForURL(`${BASE_URL}/auth/signin`);
    await expect(page.locator('text=Your password has been reset successfully')).toBeVisible();
  });

  test('Invalid token handling', async ({ page }) => {
    // Navigate to reset page with invalid token
    await page.goto(`${BASE_URL}/auth/reset?token=invalid-token`);
    
    // Verify error message
    await expect(page.locator('text=Invalid reset link')).toBeVisible();
    await expect(page.locator('text=Request new reset link')).toBeVisible();
  });

  test('Missing token handling', async ({ page }) => {
    // Navigate to reset page without token
    await page.goto(`${BASE_URL}/auth/reset`);
    
    // Verify error message
    await expect(page.locator('text=Invalid reset link')).toBeVisible();
  });

  test('Password validation', async ({ page }) => {
    // Navigate to reset page with valid token
    const mockToken = 'test-reset-token-123';
    await page.goto(`${BASE_URL}/auth/reset?token=${mockToken}`);
    
    // Try to submit with short password
    const passwordInputs = page.locator('input[type="password"]');
    await passwordInputs.nth(0).fill('123');
    await passwordInputs.nth(1).fill('123');
    await page.click('button[type="submit"]');
    
    // Verify validation error
    await expect(page.locator('text=Password must be at least 6 characters long')).toBeVisible();
    
    // Try to submit with mismatched passwords
    await passwordInputs.nth(0).fill('password123');
    await passwordInputs.nth(1).fill('password456');
    await page.click('button[type="submit"]');
    
    // Verify validation error
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('Email validation on forgot password', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/forgot-password`);
    
    // Try to submit with invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    // Verify validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    
    // Try to submit with empty email
    await page.fill('input[type="email"]', '');
    await page.click('button[type="submit"]');
    
    // Verify validation error
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('Navigation between auth pages', async ({ page }) => {
    // Test navigation from forgot password to sign in
    await page.goto(`${BASE_URL}/auth/forgot-password`);
    await page.click('text=Back to sign in');
    await expect(page).toHaveURL(`${BASE_URL}/auth/signin`);
    
    // Test navigation from sign in to forgot password
    await page.click('text=Forgot password?');
    await expect(page).toHaveURL(`${BASE_URL}/auth/forgot-password`);
  });
});

test.describe('API Endpoints', () => {
  test('Forgot password API', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/forgot-password`, {
      data: { email: TEST_EMAIL }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBeTruthy();
  });

  test('Validate reset token API', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/auth/validate-reset?token=test-token`);
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('valid');
  });

  test('Reset password API', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/auth/reset-password`, {
      data: { 
        token: 'test-token',
        password: TEST_PASSWORD 
      }
    });
    
    // This should fail with invalid token, but the endpoint should be accessible
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});