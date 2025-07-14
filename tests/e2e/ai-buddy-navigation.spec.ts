import { test, expect } from '@playwright/test';

test.describe('AI Buddy Chat Navigation', () => {
  test('should open chat widget and respond to property queries', async ({ page }) => {
    // 1. Navigate to home page
    await page.goto('/');

    // 2. Open AI chat widget
    await page.click('[aria-label="Open Chat"]');
    await expect(page.locator('[data-testid="chat-widget"]')).toBeVisible();

    // 3. Send property search query
    const chatInput = page.locator('textarea[placeholder*="ask"]');
    await chatInput.fill('Find Dubai properties under 50K AED');
    await page.keyboard.press('Enter');

    // 4. Wait for AI response
    await expect(page.locator('text=Here are some Dubai properties')).toBeVisible({ timeout: 10000 });

    // 5. Verify navigation suggestions
    await expect(page.locator('button:has-text("View Properties")')).toBeVisible();
    
    // 6. Click navigation button
    await page.click('button:has-text("View Properties")');
    await page.waitForURL('**/properties**');
    
    // 7. Verify filters are applied
    await expect(page.locator('text=Dubai')).toBeVisible();
    await expect(page.locator('text=Under 50,000 AED')).toBeVisible();
  });

  test('should handle investment queries and open investment modal', async ({ page }) => {
    await page.goto('/');
    
    // Mock wallet connection
    await page.addInitScript(() => {
      (window as any).ethereum = {
        request: async () => ['0xDEADBEEF12345678'],
        isMetaMask: true,
        selectedAddress: '0xDEADBEEF12345678',
      };
    });

    // Open AI chat
    await page.click('[aria-label="Open Chat"]');
    
    // Send investment query
    await page.fill('textarea[placeholder*="ask"]', 'I want to invest 5000 AED in property tokens');
    await page.keyboard.press('Enter');

    // Wait for AI response with investment suggestions
    await expect(page.locator('text=investment opportunities')).toBeVisible({ timeout: 10000 });
    
    // Click on investment suggestion
    await page.click('button:has-text("Start Investment")');
    
    // Verify investment modal/page opens
    await expect(page.locator('text=Investment Calculator')).toBeVisible();
  });

  test('should provide helpful responses for general queries', async ({ page }) => {
    await page.goto('/');
    await page.click('[aria-label="Open Chat"]');
    
    const queries = [
      'What is property tokenization?',
      'How do I start investing?',
      'What are the fees?',
      'Is this platform secure?'
    ];

    for (const query of queries) {
      await page.fill('textarea[placeholder*="ask"]', query);
      await page.keyboard.press('Enter');
      
      // Wait for response
      await expect(page.locator('.chat-message:last-child')).toContainText(/\w+/, { timeout: 10000 });
      
      // Clear input for next query
      await page.fill('textarea[placeholder*="ask"]', '');
    }
  });

  test('should maintain chat history during session', async ({ page }) => {
    await page.goto('/');
    await page.click('[aria-label="Open Chat"]');
    
    // Send first message
    await page.fill('textarea[placeholder*="ask"]', 'Hello');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    // Send second message
    await page.fill('textarea[placeholder*="ask"]', 'Show me properties in Abu Dhabi');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    // Verify both messages are visible
    await expect(page.locator('text=Hello')).toBeVisible();
    await expect(page.locator('text=Show me properties in Abu Dhabi')).toBeVisible();
    
    // Close and reopen chat
    await page.click('[aria-label="Close Chat"]');
    await page.click('[aria-label="Open Chat"]');
    
    // Verify history is maintained
    await expect(page.locator('text=Hello')).toBeVisible();
    await expect(page.locator('text=Show me properties in Abu Dhabi')).toBeVisible();
  });
});