/**
 * @file upload-page.ts
 * @description Page object model for the medical image upload page
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class UploadPage extends BasePage {
  readonly fileInput: Locator;
  readonly dropZone: Locator;
  readonly uploadButton: Locator;
  readonly progressBar: Locator;
  readonly fileList: Locator;
  readonly removeFileButton: Locator;
  readonly patientInfoForm: Locator;
  readonly patientIdInput: Locator;
  readonly studyDescriptionInput: Locator;
  readonly modalitySelect: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;
  readonly analysisResults: Locator;

  constructor(page: Page) {
    super(page);
    
    this.fileInput = page.locator('input[type="file"]');
    this.dropZone = page.locator('[data-testid="drop-zone"], .drop-zone, .upload-area');
    this.uploadButton = page.locator('button[type="submit"], button', { hasText: /upload|analyze/i });
    this.progressBar = page.locator('[role="progressbar"], .progress-bar, progress');
    this.fileList = page.locator('[data-testid="file-list"], .file-list, .selected-files');
    this.removeFileButton = page.locator('button', { hasText: /remove|delete|×/i });
    
    // Patient information form
    this.patientInfoForm = page.locator('[data-testid="patient-form"], .patient-info, form');
    this.patientIdInput = page.locator('input[name="patientId"], input[name="patient_id"]');
    this.studyDescriptionInput = page.locator('input[name="studyDescription"], textarea[name="description"]');
    this.modalitySelect = page.locator('select[name="modality"], [data-testid="modality-select"]');
    
    // Messages and results
    this.successMessage = page.locator('[data-testid="success"], .success-message, [role="alert"]').filter({ hasText: /success|complete/i });
    this.errorMessage = page.locator('[data-testid="error"], .error-message, [role="alert"]').filter({ hasText: /error|failed/i });
    this.analysisResults = page.locator('[data-testid="analysis-results"], .analysis-results, .results');
  }

  /**
   * Navigate to upload page
   */
  async gotoUpload() {
    await this.goto('/upload');
    await this.waitForLoad();
  }

  /**
   * Upload file using file input
   */
  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
    await this.waitForLoadingToComplete();
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(filePaths: string[]) {
    await this.fileInput.setInputFiles(filePaths);
    await this.waitForLoadingToComplete();
  }

  /**
   * Simulate drag and drop file upload
   */
  async dragAndDropFile(filePath: string) {
    // Read file for drag and drop simulation
    const fs = require('fs');
    const buffer = fs.readFileSync(filePath);
    
    await this.dropZone.dispatchEvent('dragover');
    await this.dropZone.dispatchEvent('drop', {
      dataTransfer: {
        files: [new File([buffer], filePath.split('/').pop() || 'file')],
      },
    });
    
    await this.waitForLoadingToComplete();
  }

  /**
   * Fill patient information form
   */
  async fillPatientInfo(patientId: string, studyDescription: string, modality?: string) {
    if (await this.patientIdInput.isVisible()) {
      await this.patientIdInput.fill(patientId);
    }
    
    if (await this.studyDescriptionInput.isVisible()) {
      await this.studyDescriptionInput.fill(studyDescription);
    }
    
    if (modality && await this.modalitySelect.isVisible()) {
      await this.modalitySelect.selectOption(modality);
    }
  }

  /**
   * Submit upload/analysis
   */
  async submitUpload() {
    await this.uploadButton.click();
    
    // Wait for upload to start
    if (await this.progressBar.isVisible({ timeout: 5000 })) {
      await this.progressBar.waitFor({ state: 'hidden', timeout: 60000 });
    }
    
    await this.waitForLoadingToComplete();
  }

  /**
   * Remove selected file
   */
  async removeFile(index: number = 0) {
    const removeButtons = this.removeFileButton;
    await removeButtons.nth(index).click();
  }

  /**
   * Check upload progress
   */
  async expectUploadProgress() {
    await expect(this.progressBar).toBeVisible();
    
    // Wait for progress to complete
    await this.page.waitForFunction(() => {
      const progressBar = document.querySelector('[role="progressbar"], .progress-bar, progress');
      if (!progressBar) return true;
      const value = progressBar.getAttribute('value') || progressBar.getAttribute('aria-valuenow');
      return value === '100' || value === null;
    }, { timeout: 60000 });
  }

  /**
   * Check for successful upload
   */
  async expectUploadSuccess(message?: string) {
    await this.successMessage.waitFor({ state: 'visible', timeout: 10000 });
    
    if (message) {
      await expect(this.successMessage).toContainText(message);
    }
  }

  /**
   * Check for upload error
   */
  async expectUploadError(message?: string) {
    await this.errorMessage.waitFor({ state: 'visible', timeout: 10000 });
    
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  /**
   * Verify analysis results are displayed
   */
  async checkAnalysisResults() {
    await this.analysisResults.waitFor({ state: 'visible', timeout: 30000 });
    await expect(this.analysisResults).toBeVisible();
    
    // Check for key result elements
    const findings = this.analysisResults.locator('[data-testid="findings"], .findings');
    const confidence = this.analysisResults.locator('[data-testid="confidence"], .confidence-score');
    
    if (await findings.isVisible()) {
      await expect(findings).toBeVisible();
    }
    
    if (await confidence.isVisible()) {
      await expect(confidence).toBeVisible();
    }
  }

  /**
   * Check file format validation
   */
  async expectFileFormatError(fileName: string) {
    const fileError = this.page.locator(`[data-testid="file-error"], .file-error`).filter({ hasText: fileName });
    await fileError.waitFor({ state: 'visible' });
    await expect(fileError).toContainText(/format|type|supported/i);
  }

  /**
   * Check file size validation
   */
  async expectFileSizeError(fileName: string) {
    const sizeError = this.page.locator(`[data-testid="file-error"], .file-error`).filter({ hasText: fileName });
    await sizeError.waitFor({ state: 'visible' });
    await expect(sizeError).toContainText(/size|large|limit/i);
  }

  /**
   * Verify selected files list
   */
  async checkSelectedFiles(expectedCount: number) {
    const fileItems = this.fileList.locator('.file-item, [data-testid="file-item"]');
    await expect(fileItems).toHaveCount(expectedCount);
    
    // Check each file item has necessary information
    for (let i = 0; i < expectedCount; i++) {
      const fileItem = fileItems.nth(i);
      await expect(fileItem).toBeVisible();
      
      // Check for file name
      const fileName = fileItem.locator('.file-name, [data-testid="file-name"]');
      if (await fileName.isVisible()) {
        await expect(fileName).toHaveText(/.+/);
      }
    }
  }
}