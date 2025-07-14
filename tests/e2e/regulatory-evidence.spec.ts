import { test, expect } from '@playwright/test';

test.describe('Regulatory Evidence Export', () => {
  test('should generate and download regulatory evidence JSON', async ({ page }) => {
    // 1. Navigate to Phase 1 Validation page
    await page.goto('/phase1-validation');
    await expect(page.locator('h1:has-text("Phase 1 Validation")')).toBeVisible();

    // 2. Select a property for evidence generation
    await page.click('[data-testid="property-selector"]');
    await page.click('[data-testid="property-option"]:first-child');

    // 3. Click generate evidence button
    await page.click('button:has-text("Generate Evidence")');

    // 4. Wait for generation to complete
    await expect(page.locator('text=Evidence Generated')).toBeVisible({ timeout: 15000 });

    // 5. Verify download button appears
    await expect(page.locator('button:has-text("Download JSON")')).toBeVisible();

    // 6. Mock download and verify content
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download JSON")');
    const download = await downloadPromise;

    // 7. Verify filename
    expect(download.suggestedFilename()).toMatch(/evidence-\d+\.json/);

    // 8. Verify file content structure
    const downloadPath = await download.path();
    const fs = require('fs');
    const content = JSON.parse(fs.readFileSync(downloadPath, 'utf8'));
    
    expect(content).toHaveProperty('propertyId');
    expect(content).toHaveProperty('evidenceHash');
    expect(content).toHaveProperty('complianceData');
    expect(content).toHaveProperty('auditTrail');
    expect(content).toHaveProperty('timestamp');
  });

  test('should validate evidence data integrity', async ({ page }) => {
    await page.goto('/phase1-validation');
    
    // Select property and generate evidence
    await page.click('[data-testid="property-selector"]');
    await page.click('[data-testid="property-option"]:first-child');
    await page.click('button:has-text("Generate Evidence")');
    
    // Wait for validation results
    await expect(page.locator('text=Validation Complete')).toBeVisible({ timeout: 15000 });
    
    // Check validation indicators
    await expect(page.locator('[data-testid="compliance-check"] .status-success')).toBeVisible();
    await expect(page.locator('[data-testid="audit-trail-check"] .status-success')).toBeVisible();
    await expect(page.locator('[data-testid="data-integrity-check"] .status-success')).toBeVisible();
  });

  test('should export evidence for multiple properties', async ({ page }) => {
    await page.goto('/phase1-validation');
    
    // Enable bulk export mode
    await page.click('input[type="checkbox"][aria-label="Bulk Export"]');
    
    // Select multiple properties
    await page.click('[data-testid="property-checkbox"]:nth-child(1)');
    await page.click('[data-testid="property-checkbox"]:nth-child(2)');
    await page.click('[data-testid="property-checkbox"]:nth-child(3)');
    
    // Generate bulk evidence
    await page.click('button:has-text("Generate Bulk Evidence")');
    
    // Wait for completion
    await expect(page.locator('text=Bulk Evidence Generated')).toBeVisible({ timeout: 30000 });
    
    // Download bulk evidence
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Download Bulk Evidence")');
    const download = await downloadPromise;
    
    // Verify bulk file
    expect(download.suggestedFilename()).toMatch(/bulk-evidence-\d+\.zip/);
  });

  test('should handle evidence generation errors', async ({ page }) => {
    await page.goto('/phase1-validation');
    
    // Mock API error
    await page.route('**/supabase/functions/regulatory-evidence-export', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Evidence generation failed' })
      });
    });
    
    await page.click('[data-testid="property-selector"]');
    await page.click('[data-testid="property-option"]:first-child');
    await page.click('button:has-text("Generate Evidence")');
    
    // Verify error handling
    await expect(page.locator('text=Evidence generation failed')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('should display evidence validation metrics', async ({ page }) => {
    await page.goto('/phase1-validation');
    
    // Navigate to evidence dashboard
    await page.click('a[href="/quality-assurance"]');
    await expect(page.locator('h1:has-text("Quality Assurance")')).toBeVisible();
    
    // Verify metrics are displayed
    await expect(page.locator('[data-testid="total-evidence-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="compliance-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-success-rate"]')).toBeVisible();
    
    // Check evidence quality chart
    await expect(page.locator('[data-testid="evidence-quality-chart"]')).toBeVisible();
  });
});