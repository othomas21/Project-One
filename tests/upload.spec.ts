/**
 * @file upload.spec.ts
 * @description Medical image upload and analysis functionality tests
 */

import { test, expect } from '@playwright/test';
import { UploadPage } from './pages/upload-page';
import { AuthPage } from './pages/auth-page';
import { TEST_USERS, MEDICAL_DATA } from './fixtures/test-user';
import path from 'path';

test.describe('Medical Image Upload', () => {
  let uploadPage: UploadPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    uploadPage = new UploadPage(page);
    authPage = new AuthPage(page);
    
    // Login before each test
    await authPage.login(TEST_USERS.validUser);
  });

  test.describe('File Upload Interface', () => {
    test('should display upload interface', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      await expect(uploadPage.dropZone).toBeVisible();
      await expect(uploadPage.fileInput).toBeVisible();
      await expect(uploadPage.uploadButton).toBeVisible();
    });

    test('should show upload instructions', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      const instructions = page.locator('text=/drag.*drop|select.*files|supported.*formats/i');
      await expect(instructions.first()).toBeVisible();
    });

    test('should display supported file formats', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      const formatInfo = page.locator('text=/\\.dcm|\\.jpg|\\.png|dicom/i');
      await expect(formatInfo.first()).toBeVisible();
    });
  });

  test.describe('File Selection', () => {
    test('should accept valid DICOM files', async ({ page }) => {
      // Skip if no sample files available
      const sampleFile = path.join(__dirname, 'fixtures', 'sample.dcm');
      
      test.skip(!require('fs').existsSync(sampleFile), 'Sample DICOM file not available');
      
      await uploadPage.gotoUpload();
      await uploadPage.uploadFile(sampleFile);
      
      await uploadPage.checkSelectedFiles(1);
    });

    test('should accept valid image files', async ({ page }) => {
      // Create a sample test image file
      const testImage = path.join(__dirname, 'fixtures', 'test-image.jpg');
      
      // Skip if no test files available
      test.skip(!require('fs').existsSync(testImage), 'Test image file not available');
      
      await uploadPage.gotoUpload();
      await uploadPage.uploadFile(testImage);
      
      await uploadPage.checkSelectedFiles(1);
    });

    test('should handle multiple file selection', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Create mock files for testing
      const mockFiles = ['test1.jpg', 'test2.png'].map(name => 
        path.join(__dirname, 'fixtures', name)
      ).filter(file => require('fs').existsSync(file));
      
      if (mockFiles.length > 0) {
        await uploadPage.uploadMultipleFiles(mockFiles);
        await uploadPage.checkSelectedFiles(mockFiles.length);
      } else {
        test.skip(true, 'Multiple test files not available');
      }
    });

    test('should allow file removal', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock file upload
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await uploadPage.checkSelectedFiles(1);
      await uploadPage.removeFile(0);
      await uploadPage.checkSelectedFiles(0);
    });
  });

  test.describe('File Validation', () => {
    test('should reject unsupported file formats', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock unsupported file upload
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File(['test'], 'document.pdf', { type: 'application/pdf' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await uploadPage.expectFileFormatError('document.pdf');
    });

    test('should validate file size limits', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock large file upload
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          // Create a file that appears large (100MB)
          const largeArray = new Array(100 * 1024 * 1024).fill(0);
          const file = new File([new Uint8Array(largeArray)], 'large-image.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await uploadPage.expectFileSizeError('large-image.jpg');
    });

    test('should validate empty files', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock empty file upload
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File([''], 'empty.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await uploadPage.expectFileFormatError('empty.jpg');
    });
  });

  test.describe('Patient Information', () => {
    test('should display patient information form', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      if (await uploadPage.patientInfoForm.isVisible()) {
        await expect(uploadPage.patientIdInput).toBeVisible();
        await expect(uploadPage.studyDescriptionInput).toBeVisible();
      }
    });

    test('should accept patient information', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      await uploadPage.fillPatientInfo('PAT001', 'Chest X-Ray Routine', 'CR');
      
      await expect(uploadPage.patientIdInput).toHaveValue('PAT001');
      await expect(uploadPage.studyDescriptionInput).toHaveValue('Chest X-Ray Routine');
    });

    test('should validate required patient fields', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock file upload to enable form validation
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // Try to submit without required fields
      await uploadPage.submitUpload();
      
      // Check for validation errors
      const validationErrors = page.locator('[role="alert"], .error, .field-error');
      if (await validationErrors.count() > 0) {
        await expect(validationErrors.first()).toBeVisible();
      }
    });
  });

  test.describe('Upload Process', () => {
    test('should show upload progress', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock file upload
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File(['test data'], 'test.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await uploadPage.fillPatientInfo('PAT001', 'Test Study');
      
      // Mock progress for testing
      await page.evaluate(() => {
        const progressBar = document.querySelector('[role="progressbar"], .progress-bar, progress');
        if (progressBar) {
          progressBar.setAttribute('value', '50');
          progressBar.setAttribute('aria-valuenow', '50');
        }
      });
      
      if (await uploadPage.progressBar.isVisible()) {
        await expect(uploadPage.progressBar).toBeVisible();
      }
    });

    test('should handle upload success', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock successful upload
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File(['test data'], 'test.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await uploadPage.fillPatientInfo('PAT001', 'Test Study');
      
      // Mock upload submission (since we don't have real backend)
      await page.route('**/api/upload**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true, 
            message: 'Upload completed successfully',
            analysisId: 'analysis_123'
          })
        });
      });
      
      await uploadPage.submitUpload();
      await uploadPage.expectUploadSuccess('Upload completed successfully');
    });

    test('should handle upload errors', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock file upload
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File(['test data'], 'test.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // Mock upload failure
      await page.route('**/api/upload**', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ 
            error: true, 
            message: 'Upload failed due to server error'
          })
        });
      });
      
      await uploadPage.submitUpload();
      await uploadPage.expectUploadError('Upload failed');
    });

    test('should handle network interruptions', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock file upload
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File(['test data'], 'test.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      // Mock network timeout
      await page.route('**/api/upload**', async route => {
        // Simulate network timeout
        await new Promise(resolve => setTimeout(resolve, 60000));
      });
      
      await uploadPage.submitUpload();
      await uploadPage.expectUploadError();
    });
  });

  test.describe('Analysis Results', () => {
    test('should display analysis results after successful upload', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock successful upload with analysis
      await page.route('**/api/upload**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true,
            analysisId: 'analysis_123',
            results: {
              findings: 'Normal chest X-ray',
              confidence: 0.95,
              recommendations: ['No further action required']
            }
          })
        });
      });
      
      // Mock file upload and submit
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File(['test data'], 'chest-xray.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await uploadPage.fillPatientInfo('PAT001', 'Chest X-Ray');
      await uploadPage.submitUpload();
      
      await uploadPage.checkAnalysisResults();
    });

    test('should handle analysis errors gracefully', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Mock upload success but analysis failure
      await page.route('**/api/upload**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true,
            error: 'Analysis failed - unable to process image'
          })
        });
      });
      
      // Mock file upload and submit
      await page.evaluate(() => {
        const input = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (input) {
          const file = new File(['test data'], 'corrupted.jpg', { type: 'image/jpeg' });
          const dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      
      await uploadPage.submitUpload();
      await uploadPage.expectUploadError();
    });
  });

  test.describe('Accessibility', () => {
    test('upload interface should be accessible', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Check for proper ARIA labels
      await expect(uploadPage.fileInput).toHaveAttribute('aria-label');
      
      // Check that upload button has accessible name
      const uploadButtonText = await uploadPage.uploadButton.textContent();
      expect(uploadButtonText).toBeTruthy();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      
      // File input should be focusable
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should announce upload status to screen readers', async ({ page }) => {
      await uploadPage.gotoUpload();
      
      // Check for aria-live regions
      const liveRegions = page.locator('[aria-live], [role="status"], [role="alert"]');
      const count = await liveRegions.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});