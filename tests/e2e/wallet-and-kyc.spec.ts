import { test, expect } from '@playwright/test';

test.describe('Wallet Connection & KYC Flow', () => {
  test('should connect wallet and complete KYC', async ({ page }) => {
    // 1. Navigate to home page
    await page.goto('/');

    // 2. Wait for page to load and check for Connect Wallet button
    await expect(page.locator('text=Connect Wallet')).toBeVisible();

    // 3. Mock MetaMask before interaction
    await page.addInitScript(() => {
      (window as any).ethereum = {
        request: async (params: any) => {
          if (params.method === 'eth_requestAccounts') {
            return ['0xDEADBEEF12345678'];
          }
          if (params.method === 'eth_chainId') {
            return '0x1'; // Ethereum mainnet
          }
          return null;
        },
        isMetaMask: true,
        selectedAddress: '0xDEADBEEF12345678',
      };
    });

    // 4. Click connect wallet button
    await page.click('button:has-text("Connect Wallet")');

    // 5. Wait for connection success
    await expect(page.locator('text=0xDEAD...5678')).toBeVisible({ timeout: 10000 });

    // 6. Navigate to profile for KYC
    await page.click('a[href="/profile"]');
    await page.waitForURL('**/profile');

    // 7. Check KYC upload section
    await expect(page.locator('text=KYC Verification')).toBeVisible();

    // 8. Mock file upload (create test fixture)
    const mockFileContent = Buffer.from('mock-document-content');
    await page.setInputFiles('input[type="file"]', {
      name: 'test-id.png',
      mimeType: 'image/png',
      buffer: mockFileContent,
    });

    // 9. Submit KYC document
    await page.click('button:has-text("Upload")');

    // 10. Wait for upload confirmation
    await expect(page.locator('text=Document uploaded successfully')).toBeVisible({ timeout: 10000 });
  });

  test('should handle wallet connection errors gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Mock MetaMask rejection
    await page.addInitScript(() => {
      (window as any).ethereum = {
        request: async () => {
          throw new Error('User rejected the request');
        },
        isMetaMask: true,
      };
    });

    await page.click('button:has-text("Connect Wallet")');
    await expect(page.locator('text=Wallet connection failed')).toBeVisible({ timeout: 5000 });
  });
});