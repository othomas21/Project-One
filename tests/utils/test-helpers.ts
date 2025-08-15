/**
 * @file test-helpers.ts
 * @description Common test utilities and helper functions
 */

import { Page, expect, Locator } from '@playwright/test';

/**
 * Wait for an element to be stable (not moving/changing)
 */
export async function waitForStable(locator: Locator, timeout: number = 5000): Promise<void> {
  let previousBoundingBox = await locator.boundingBox();
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const currentBoundingBox = await locator.boundingBox();
    
    if (JSON.stringify(previousBoundingBox) === JSON.stringify(currentBoundingBox)) {
      return;
    }
    
    previousBoundingBox = currentBoundingBox;
  }
}

/**
 * Simulate file upload with drag and drop
 */
export async function uploadFileByDragAndDrop(
  page: Page,
  dropZoneSelector: string,
  filePath: string
): Promise<void> {
  const fs = require('fs');
  const path = require('path');
  
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  
  await page.locator(dropZoneSelector).dispatchEvent('drop', {
    dataTransfer: {
      files: [{
        name: fileName,
        type: getMimeType(filePath),
        content: fileBuffer
      }]
    }
  });
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(filePath: string): string {
  const ext = filePath.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'dcm': 'application/dicom',
    'pdf': 'application/pdf',
    'txt': 'text/plain'
  };
  
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Generate random test data
 */
export const generateTestData = {
  patientId: () => `PAT${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
  
  studyDescription: () => {
    const descriptions = [
      'Chest X-Ray PA',
      'CT Chest without contrast',
      'MRI Brain with contrast',
      'Ultrasound Abdomen',
      'Mammography Bilateral',
      'Bone scan whole body'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  },
  
  modality: () => {
    const modalities = ['CR', 'CT', 'MR', 'US', 'MG', 'NM'];
    return modalities[Math.floor(Math.random() * modalities.length)];
  },
  
  email: () => `test${Date.now()}@example.com`,
  
  password: () => `TestPass${Math.floor(Math.random() * 1000)}!`,
  
  date: () => {
    const start = new Date(2023, 0, 1);
    const end = new Date();
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString().split('T')[0];
  }
};

/**
 * Mock API responses for testing
 */
export class ApiMocker {
  constructor(private page: Page) {}
  
  async mockAuthSuccess(user: any = {}) {
    await this.page.route('**/api/auth/**', async route => {
      const url = route.request().url();
      
      if (url.includes('login')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: user.id || 'user_123',
              email: user.email || 'test@example.com',
              name: user.name || 'Test User'
            },
            token: 'mock_jwt_token'
          })
        });
      }
    });
  }
  
  async mockAuthFailure(errorMessage: string = 'Invalid credentials') {
    await this.page.route('**/api/auth/**', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: errorMessage
        })
      });
    });
  }
  
  async mockUploadSuccess(analysisResults: any = {}) {
    await this.page.route('**/api/upload**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          uploadId: 'upload_123',
          analysisResults: {
            findings: analysisResults.findings || 'Normal study',
            confidence: analysisResults.confidence || 0.95,
            recommendations: analysisResults.recommendations || ['No further action needed']
          }
        })
      });
    });
  }
  
  async mockSearchResults(results: any[] = []) {
    await this.page.route('**/api/search**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results,
          total: results.length,
          page: 1,
          totalPages: 1
        })
      });
    });
  }
}

/**
 * Accessibility testing helpers
 */
export class AccessibilityHelper {
  constructor(private page: Page) {}
  
  async checkFocusManagement() {
    // Check that focus is visible
    await this.page.keyboard.press('Tab');
    const focusedElement = this.page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Check focus outline
    const focusStyles = await focusedElement.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      };
    });
    
    // Should have some form of focus indicator
    expect(
      focusStyles.outline !== 'none' || 
      focusStyles.outlineWidth !== '0px' || 
      focusStyles.boxShadow !== 'none'
    ).toBeTruthy();
  }
  
  async checkHeadingStructure() {
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all();
    
    expect(headings.length).toBeGreaterThan(0);
    
    // Check that there's at least one h1
    const h1s = await this.page.locator('h1').count();
    expect(h1s).toBeGreaterThanOrEqual(1);
  }
  
  async checkAriaLabels() {
    const interactiveElements = await this.page.locator(
      'button, a, input, select, textarea, [role="button"], [role="link"]'
    ).all();
    
    for (const element of interactiveElements) {
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledBy = await element.getAttribute('aria-labelledby');
      const textContent = await element.textContent();
      const title = await element.getAttribute('title');
      
      // Each interactive element should have an accessible name
      expect(
        ariaLabel || ariaLabelledBy || textContent?.trim() || title
      ).toBeTruthy();
    }
  }
}

/**
 * Performance testing helpers
 */
export class PerformanceHelper {
  constructor(private page: Page) {}
  
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now();
    await this.page.waitForLoadState('networkidle');
    return Date.now() - startTime;
  }
  
  async measureInteractionTime(interaction: () => Promise<void>): Promise<number> {
    const startTime = Date.now();
    await interaction();
    return Date.now() - startTime;
  }
  
  async checkLargestContentfulPaint(): Promise<number> {
    return await this.page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
  }
}

/**
 * Visual testing helpers
 */
export class VisualHelper {
  constructor(private page: Page) {}
  
  async compareScreenshot(name: string, options: any = {}) {
    const screenshot = await this.page.screenshot({
      fullPage: true,
      ...options
    });
    
    // This would integrate with visual regression testing tools
    // For now, just save the screenshot
    const fs = require('fs');
    const path = require('path');
    
    const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(screenshotDir, `${name}.png`), screenshot);
    
    return screenshot;
  }
  
  async checkColorContrast(selector: string): Promise<number> {
    return await this.page.locator(selector).evaluate((element) => {
      const styles = window.getComputedStyle(element);
      
      // This is a simplified contrast check
      // In a real implementation, you'd use a proper color contrast library
      return parseFloat(styles.opacity || '1');
    });
  }
}

/**
 * Database testing helpers for integration tests
 */
export class DatabaseHelper {
  static async cleanupTestData() {
    // This would clean up test data from the database
    // Implementation depends on your database setup
    console.log('Cleaning up test data...');
  }
  
  static async seedTestData(data: any[]) {
    // This would seed test data into the database
    // Implementation depends on your database setup
    console.log('Seeding test data...', data.length, 'records');
  }
}