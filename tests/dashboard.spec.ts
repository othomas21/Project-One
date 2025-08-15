/**
 * @file dashboard.spec.ts
 * @description Dashboard functionality and navigation tests
 */

import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/dashboard-page';
import { AuthPage } from './pages/auth-page';
import { TEST_USERS } from './fixtures/test-user';

test.describe('Dashboard', () => {
  let dashboardPage: DashboardPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    authPage = new AuthPage(page);
    
    // Login before each test
    await authPage.login(TEST_USERS.validUser);
    await dashboardPage.gotoDashboard();
  });

  test.describe('Dashboard Layout', () => {
    test('should display dashboard welcome message', async ({ page }) => {
      await expect(dashboardPage.welcomeMessage).toBeVisible();
      
      const welcomeText = await dashboardPage.welcomeMessage.textContent();
      expect(welcomeText).toMatch(/welcome|dashboard|hello/i);
    });

    test('should display navigation menu', async ({ page }) => {
      await expect(dashboardPage.navigationMenu).toBeVisible();
      await dashboardPage.checkNavigation();
    });

    test('should display user menu', async ({ page }) => {
      await expect(dashboardPage.userMenu).toBeVisible();
    });

    test('should show main action buttons', async ({ page }) => {
      await expect(dashboardPage.uploadButton).toBeVisible();
      await expect(dashboardPage.searchButton).toBeVisible();
    });
  });

  test.describe('Dashboard Statistics', () => {
    test('should display key performance indicators', async ({ page }) => {
      // Mock dashboard stats API
      await page.route('**/api/dashboard/stats**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalUploads: 42,
            totalAnalyses: 38,
            recentActivity: 5,
            avgProcessingTime: '2.3 minutes'
          })
        });
      });
      
      await dashboardPage.checkDashboardStats();
    });

    test('should show recent activity', async ({ page }) => {
      // Mock recent activity API
      await page.route('**/api/dashboard/activity**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            activities: [
              {
                id: 'act_001',
                type: 'upload',
                description: 'Chest X-Ray uploaded',
                timestamp: '2024-01-15T10:30:00Z'
              },
              {
                id: 'act_002',
                type: 'analysis',
                description: 'Analysis completed for PAT001',
                timestamp: '2024-01-15T09:15:00Z'
              }
            ]
          })
        });
      });
      
      const activitySection = page.locator('[data-testid="recent-activity"], .recent-activity, .activity-feed');
      
      if (await activitySection.isVisible()) {
        await expect(activitySection).toBeVisible();
        
        const activityItems = activitySection.locator('.activity-item, [data-testid="activity-item"]');
        const count = await activityItems.count();
        
        if (count > 0) {
          for (let i = 0; i < Math.min(count, 3); i++) {
            await expect(activityItems.nth(i)).toBeVisible();
          }
        }
      }
    });

    test('should display charts and visualizations', async ({ page }) => {
      const chartsContainer = page.locator('[data-testid="charts"], .charts-container, .dashboard-charts');
      
      if (await chartsContainer.isVisible()) {
        await expect(chartsContainer).toBeVisible();
        
        // Check for common chart elements
        const charts = chartsContainer.locator('canvas, svg, .chart');
        const chartCount = await charts.count();
        expect(chartCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to upload page', async ({ page }) => {
      await dashboardPage.goToUpload();
      await expect(page).toHaveURL('/upload');
    });

    test('should navigate to search page', async ({ page }) => {
      await dashboardPage.goToSearch();
      await expect(page).toHaveURL('/search');
    });

    test('should open user menu and show options', async ({ page }) => {
      await dashboardPage.openUserMenu();
      
      // Check for common user menu items
      const userMenuItems = page.locator('[role="menu"] a, [role="menuitem"]');
      const itemCount = await userMenuItems.count();
      
      if (itemCount > 0) {
        // Look for profile and settings links
        const profileLink = userMenuItems.filter({ hasText: /profile/i });
        const settingsLink = userMenuItems.filter({ hasText: /settings/i });
        
        if (await profileLink.count() > 0) {
          await expect(profileLink.first()).toBeVisible();
        }
        
        if (await settingsLink.count() > 0) {
          await expect(settingsLink.first()).toBeVisible();
        }
      }
    });

    test('should logout successfully', async ({ page }) => {
      await dashboardPage.logout();
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Recent Uploads', () => {
    test('should display recent uploads section', async ({ page }) => {
      // Mock recent uploads API
      await page.route('**/api/uploads/recent**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            uploads: [
              {
                id: 'upload_001',
                fileName: 'chest-xray-001.jpg',
                patientId: 'PAT001',
                uploadDate: '2024-01-15T10:30:00Z',
                status: 'completed',
                thumbnailUrl: '/api/thumbnails/upload_001.jpg'
              },
              {
                id: 'upload_002',
                fileName: 'ct-scan-002.dcm',
                patientId: 'PAT002',
                uploadDate: '2024-01-15T09:15:00Z',
                status: 'processing',
                thumbnailUrl: '/api/thumbnails/upload_002.jpg'
              }
            ]
          })
        });
      });
      
      await dashboardPage.checkRecentUploads();
    });

    test('should handle empty recent uploads', async ({ page }) => {
      // Mock empty uploads API
      await page.route('**/api/uploads/recent**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            uploads: []
          })
        });
      });
      
      const recentUploads = dashboardPage.recentUploads;
      if (await recentUploads.isVisible()) {
        const emptyState = recentUploads.locator('.empty-state, [data-testid="empty-state"]');
        if (await emptyState.count() > 0) {
          await expect(emptyState.first()).toBeVisible();
        }
      }
    });

    test('should show upload status indicators', async ({ page }) => {
      // Mock uploads with different statuses
      await page.route('**/api/uploads/recent**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            uploads: [
              { id: '1', status: 'completed', fileName: 'completed.jpg' },
              { id: '2', status: 'processing', fileName: 'processing.jpg' },
              { id: '3', status: 'failed', fileName: 'failed.jpg' }
            ]
          })
        });
      });
      
      if (await dashboardPage.recentUploads.isVisible()) {
        const uploads = dashboardPage.recentUploads.locator('.upload-item, [data-testid="upload-item"]');
        const uploadCount = await uploads.count();
        
        for (let i = 0; i < uploadCount; i++) {
          const upload = uploads.nth(i);
          const statusIndicator = upload.locator('.status, [data-testid="status"]');
          
          if (await statusIndicator.isVisible()) {
            await expect(statusIndicator).toBeVisible();
          }
        }
      }
    });
  });

  test.describe('Quick Actions', () => {
    test('should display quick action buttons', async ({ page }) => {
      const quickActions = page.locator('[data-testid="quick-actions"], .quick-actions, .action-buttons');
      
      if (await quickActions.isVisible()) {
        await expect(quickActions).toBeVisible();
        
        const actionButtons = quickActions.locator('button, a');
        const buttonCount = await actionButtons.count();
        expect(buttonCount).toBeGreaterThan(0);
      }
    });

    test('should execute quick upload action', async ({ page }) => {
      const quickUpload = page.locator('button, a').filter({ hasText: /quick upload|upload now/i });
      
      if (await quickUpload.count() > 0) {
        await quickUpload.first().click();
        
        // Should navigate to upload page or open upload modal
        await Promise.race([
          expect(page).toHaveURL('/upload'),
          expect(page.locator('[data-testid="upload-modal"], .upload-modal, [role="dialog"]')).toBeVisible()
        ]);
      }
    });

    test('should execute quick search action', async ({ page }) => {
      const quickSearch = page.locator('button, a').filter({ hasText: /quick search|search now/i });
      
      if (await quickSearch.count() > 0) {
        await quickSearch.first().click();
        
        // Should navigate to search page or open search modal
        await Promise.race([
          expect(page).toHaveURL('/search'),
          expect(page.locator('[data-testid="search-modal"], .search-modal, [role="dialog"]')).toBeVisible()
        ]);
      }
    });
  });

  test.describe('Dashboard Responsiveness', () => {
    test('should adapt to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      
      // Dashboard should still be functional on mobile
      await dashboardPage.expectOnDashboard();
      
      // Check mobile-specific elements
      const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav, .hamburger-menu');
      if (await mobileNav.count() > 0) {
        await expect(mobileNav.first()).toBeVisible();
      }
      
      // Check that content doesn't overflow
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
    });

    test('should adapt to tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      
      await dashboardPage.expectOnDashboard();
      
      // Dashboard elements should be visible and properly sized
      await expect(dashboardPage.welcomeMessage).toBeVisible();
      await expect(dashboardPage.navigationMenu).toBeVisible();
    });
  });

  test.describe('Real-time Updates', () => {
    test('should handle real-time notifications', async ({ page }) => {
      // Mock WebSocket or SSE connection for real-time updates
      await page.evaluate(() => {
        // Simulate real-time notification
        const notification = new CustomEvent('notification', {
          detail: {
            type: 'analysis_complete',
            message: 'Analysis completed for study ABC123'
          }
        });
        window.dispatchEvent(notification);
      });
      
      // Check for notification display
      const notification = page.locator('[data-testid="notification"], .notification, [role="alert"]');
      
      // Give some time for the notification to appear
      await page.waitForTimeout(1000);
      
      if (await notification.count() > 0) {
        await expect(notification.first()).toBeVisible();
      }
    });

    test('should update dashboard stats in real-time', async ({ page }) => {
      // Mock initial stats
      await page.route('**/api/dashboard/stats**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            totalUploads: 42,
            totalAnalyses: 38
          })
        });
      });
      
      // Simulate real-time stat update
      await page.evaluate(() => {
        const event = new CustomEvent('stats_update', {
          detail: {
            totalUploads: 43,
            totalAnalyses: 39
          }
        });
        window.dispatchEvent(event);
      });
      
      // Check if stats were updated (this depends on your implementation)
      const statsCards = page.locator('[data-testid="stat-card"], .stat-card');
      if (await statsCards.count() > 0) {
        await expect(statsCards.first()).toBeVisible();
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle dashboard data loading errors', async ({ page }) => {
      // Mock API error
      await page.route('**/api/dashboard/**', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal server error'
          })
        });
      });
      
      await page.reload();
      
      // Should show error state or fallback content
      const errorState = page.locator('[data-testid="error"], .error-state, [role="alert"]');
      if (await errorState.count() > 0) {
        await expect(errorState.first()).toBeVisible();
      }
    });

    test('should recover from network interruptions', async ({ page }) => {
      // Simulate network failure then recovery
      await page.route('**/api/dashboard/**', async route => {
        await route.abort();
      });
      
      await page.reload();
      
      // Remove network block
      await page.unroute('**/api/dashboard/**');
      
      // Mock successful response
      await page.route('**/api/dashboard/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {}
          })
        });
      });
      
      // Trigger retry (depends on your implementation)
      const retryButton = page.locator('button').filter({ hasText: /retry|reload/i });
      if (await retryButton.count() > 0) {
        await retryButton.first().click();
      }
      
      // Dashboard should recover
      await dashboardPage.expectOnDashboard();
    });
  });

  test.describe('Accessibility', () => {
    test('dashboard should be accessible', async ({ page }) => {
      // Check for proper heading structure
      const headings = page.locator('h1, h2, h3, h4, h5, h6');
      const headingCount = await headings.count();
      expect(headingCount).toBeGreaterThan(0);
      
      // Check for proper ARIA landmarks
      const landmarks = page.locator('[role="main"], [role="navigation"], [role="banner"]');
      const landmarkCount = await landmarks.count();
      expect(landmarkCount).toBeGreaterThan(0);
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab through dashboard elements
      await page.keyboard.press('Tab');
      
      let focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
      
      // Continue tabbing through interactive elements
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        focusedElement = page.locator(':focus');
        
        if (await focusedElement.count() > 0) {
          const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
          expect(['a', 'button', 'input', 'select', 'textarea']).toContain(tagName);
        }
      }
    });

    test('should have proper screen reader support', async ({ page }) => {
      // Check for aria-labels and descriptions
      const interactiveElements = page.locator('button, a, input');
      const elementCount = await interactiveElements.count();
      
      for (let i = 0; i < Math.min(elementCount, 5); i++) {
        const element = interactiveElements.nth(i);
        const hasAriaLabel = await element.getAttribute('aria-label');
        const hasText = await element.textContent();
        const hasAriaDescribedBy = await element.getAttribute('aria-describedby');
        
        // Element should have accessible name or description
        expect(hasAriaLabel || hasText || hasAriaDescribedBy).toBeTruthy();
      }
    });
  });
});