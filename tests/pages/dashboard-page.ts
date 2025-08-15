/**
 * @file dashboard-page.ts
 * @description Page object model for the dashboard page
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  readonly userMenu: Locator;
  readonly logoutButton: Locator;
  readonly navigationMenu: Locator;
  readonly uploadButton: Locator;
  readonly searchButton: Locator;
  readonly recentUploads: Locator;
  readonly welcomeMessage: Locator;
  readonly profileLink: Locator;
  readonly settingsLink: Locator;

  constructor(page: Page) {
    super(page);
    
    this.userMenu = page.locator('[data-testid="user-menu"], .user-menu, [role="menu"]');
    this.logoutButton = page.locator('button', { hasText: /logout|sign out/i });
    this.navigationMenu = page.locator('nav, [role="navigation"]');
    this.uploadButton = page.locator('a[href="/upload"], button', { hasText: /upload/i });
    this.searchButton = page.locator('a[href="/search"], button', { hasText: /search/i });
    this.recentUploads = page.locator('[data-testid="recent-uploads"], .recent-uploads');
    this.welcomeMessage = page.locator('[data-testid="welcome"], .welcome-message, h1');
    this.profileLink = page.locator('a', { hasText: /profile/i });
    this.settingsLink = page.locator('a', { hasText: /settings/i });
  }

  /**
   * Navigate to dashboard
   */
  async gotoDashboard() {
    await this.goto('/dashboard');
    await this.waitForLoad();
  }

  /**
   * Check if user is on dashboard
   */
  async expectOnDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/);
    await expect(this.welcomeMessage).toBeVisible();
  }

  /**
   * Navigate to upload page
   */
  async goToUpload() {
    await this.uploadButton.click();
    await this.page.waitForURL('/upload');
  }

  /**
   * Navigate to search page
   */
  async goToSearch() {
    await this.searchButton.click();
    await this.page.waitForURL('/search');
  }

  /**
   * Open user menu
   */
  async openUserMenu() {
    await this.userMenu.click();
  }

  /**
   * Logout user
   */
  async logout() {
    await this.openUserMenu();
    await this.logoutButton.click();
    await this.page.waitForURL('/auth/login');
  }

  /**
   * Check dashboard statistics/KPIs
   */
  async checkDashboardStats() {
    const statsCards = this.page.locator('[data-testid="stat-card"], .stat-card, .kpi-card');
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Check that each stat card has a value
    for (let i = 0; i < count; i++) {
      const card = statsCards.nth(i);
      await expect(card).toBeVisible();
      const value = card.locator('[data-testid="stat-value"], .stat-value, .value');
      await expect(value).toBeVisible();
    }
  }

  /**
   * Check recent uploads section
   */
  async checkRecentUploads() {
    if (await this.recentUploads.isVisible()) {
      const uploadItems = this.recentUploads.locator('.upload-item, [data-testid="upload-item"]');
      const count = await uploadItems.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) { // Check first 5 items
        const item = uploadItems.nth(i);
        await expect(item).toBeVisible();
      }
    }
  }

  /**
   * Verify navigation menu functionality
   */
  async checkNavigation() {
    await expect(this.navigationMenu).toBeVisible();
    
    const navLinks = this.navigationMenu.locator('a');
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);
    
    // Check that each nav link is clickable
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href');
    }
  }
}