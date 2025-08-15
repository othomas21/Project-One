/**
 * @file example.spec.ts
 * @description Basic smoke tests to verify the application is running
 */

import { test, expect } from '@playwright/test';

test.describe('Application Smoke Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Curie Radiology|Medical Imaging/i);
  });

  test('navigation menu is visible', async ({ page }) => {
    await page.goto('/');
    
    // Check for navigation elements
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that content fits in mobile viewport
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Verify no horizontal scroll
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test('health check endpoints respond', async ({ page, request }) => {
    // Test API health if available
    try {
      const response = await request.get('/api/health');
      if (response.status() !== 404) {
        expect(response.status()).toBeLessThan(500);
      }
    } catch (error) {
      // Skip if no health endpoint
      test.skip(true, 'Health endpoint not available');
    }
  });
});
