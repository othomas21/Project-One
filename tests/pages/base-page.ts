/**
 * @file base-page.ts
 * @description Base page class with common functionality for all pages
 */

import { Page, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = '/') {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  /**
   * Wait for toast notification
   */
  async waitForToast(message?: string) {
    const toast = this.page.locator('[role="alert"], .toast, [data-testid="toast"]').first();
    await toast.waitFor({ state: 'visible' });
    
    if (message) {
      await expect(toast).toContainText(message);
    }
    
    return toast;
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingToComplete() {
    await this.page.waitForSelector('[data-testid="loading"], .loading', { state: 'hidden', timeout: 30000 });
  }

  /**
   * Check accessibility violations
   */
  async checkA11y() {
    // This would integrate with axe-core for accessibility testing
    // For now, we'll do basic checks
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
  }

  /**
   * Verify page is responsive on mobile
   */
  async checkMobileLayout() {
    await this.page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await this.page.waitForTimeout(500); // Allow layout to settle
    
    // Check that no horizontal scrollbar appears
    const scrollWidth = await this.page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await this.page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // Allow 1px tolerance
  }
}