/**
 * @file search-page.ts
 * @description Page object model for the medical image search and analysis page
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

export class SearchPage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly filterPanel: Locator;
  readonly dateRangeFilter: Locator;
  readonly modalityFilter: Locator;
  readonly patientFilter: Locator;
  readonly resultsContainer: Locator;
  readonly resultItems: Locator;
  readonly noResultsMessage: Locator;
  readonly loadingSpinner: Locator;
  readonly sortDropdown: Locator;
  readonly paginationControls: Locator;
  readonly exportButton: Locator;
  readonly detailsModal: Locator;

  constructor(page: Page) {
    super(page);
    
    this.searchInput = page.locator('input[type="search"], input[name="search"], input[placeholder*="search"]');
    this.searchButton = page.locator('button[type="submit"], button', { hasText: /search/i });
    
    // Filter panel
    this.filterPanel = page.locator('[data-testid="filter-panel"], .filter-panel, .filters');
    this.dateRangeFilter = page.locator('[data-testid="date-filter"], .date-filter');
    this.modalityFilter = page.locator('[data-testid="modality-filter"], select[name="modality"]');
    this.patientFilter = page.locator('[data-testid="patient-filter"], input[name="patient"]');
    
    // Results
    this.resultsContainer = page.locator('[data-testid="results"], .search-results, .results-container');
    this.resultItems = page.locator('[data-testid="result-item"], .result-item, .search-result');
    this.noResultsMessage = page.locator('[data-testid="no-results"], .no-results, .empty-state');
    this.loadingSpinner = page.locator('[data-testid="loading"], .loading, .spinner');
    
    // Controls
    this.sortDropdown = page.locator('[data-testid="sort"], select[name="sort"]');
    this.paginationControls = page.locator('[data-testid="pagination"], .pagination');
    this.exportButton = page.locator('button', { hasText: /export|download/i });
    this.detailsModal = page.locator('[data-testid="details-modal"], .modal, [role="dialog"]');
  }

  /**
   * Navigate to search page
   */
  async gotoSearch() {
    await this.goto('/search');
    await this.waitForLoad();
  }

  /**
   * Perform basic search
   */
  async search(query: string) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    await this.waitForSearchResults();
  }

  /**
   * Clear search
   */
  async clearSearch() {
    await this.searchInput.clear();
    await this.searchButton.click();
    await this.waitForSearchResults();
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults() {
    // Wait for loading to complete
    if (await this.loadingSpinner.isVisible({ timeout: 2000 })) {
      await this.loadingSpinner.waitFor({ state: 'hidden', timeout: 30000 });
    }
    
    // Wait for either results or no results message
    await Promise.race([
      this.resultsContainer.waitFor({ state: 'visible' }),
      this.noResultsMessage.waitFor({ state: 'visible' })
    ]);
  }

  /**
   * Apply date range filter
   */
  async filterByDateRange(startDate: string, endDate: string) {
    await this.dateRangeFilter.click();
    
    const startInput = this.page.locator('input[name="startDate"], input[placeholder*="start"]');
    const endInput = this.page.locator('input[name="endDate"], input[placeholder*="end"]');
    
    await startInput.fill(startDate);
    await endInput.fill(endDate);
    
    await this.searchButton.click();
    await this.waitForSearchResults();
  }

  /**
   * Filter by modality
   */
  async filterByModality(modality: string) {
    await this.modalityFilter.selectOption(modality);
    await this.waitForSearchResults();
  }

  /**
   * Filter by patient
   */
  async filterByPatient(patientId: string) {
    await this.patientFilter.fill(patientId);
    await this.searchButton.click();
    await this.waitForSearchResults();
  }

  /**
   * Sort results
   */
  async sortBy(sortOption: string) {
    await this.sortDropdown.selectOption(sortOption);
    await this.waitForSearchResults();
  }

  /**
   * Check search results count
   */
  async expectResultsCount(expectedCount: number) {
    await expect(this.resultItems).toHaveCount(expectedCount);
  }

  /**
   * Check for no results message
   */
  async expectNoResults(message?: string) {
    await expect(this.noResultsMessage).toBeVisible();
    
    if (message) {
      await expect(this.noResultsMessage).toContainText(message);
    }
  }

  /**
   * Check that results contain expected text
   */
  async expectResultsContain(text: string) {
    const firstResult = this.resultItems.first();
    await expect(firstResult).toBeVisible();
    await expect(this.resultsContainer).toContainText(text);
  }

  /**
   * Click on a search result
   */
  async clickResult(index: number = 0) {
    await this.resultItems.nth(index).click();
  }

  /**
   * View result details
   */
  async viewResultDetails(index: number = 0) {
    const result = this.resultItems.nth(index);
    const detailsButton = result.locator('button', { hasText: /view|details|open/i });
    
    await detailsButton.click();
    await this.detailsModal.waitFor({ state: 'visible' });
  }

  /**
   * Close details modal
   */
  async closeDetailsModal() {
    const closeButton = this.detailsModal.locator('button', { hasText: /close|×/i });
    await closeButton.click();
    await this.detailsModal.waitFor({ state: 'hidden' });
  }

  /**
   * Export search results
   */
  async exportResults(format: 'CSV' | 'PDF' = 'CSV') {
    await this.exportButton.click();
    
    // If there's a format selector, use it
    const formatOption = this.page.locator(`button, a`, { hasText: format });
    if (await formatOption.isVisible({ timeout: 2000 })) {
      await formatOption.click();
    }
    
    // Wait for download to start
    const downloadPromise = this.page.waitForEvent('download');
    const download = await downloadPromise;
    
    expect(download).toBeTruthy();
    return download;
  }

  /**
   * Navigate through pagination
   */
  async goToPage(pageNumber: number) {
    const pageButton = this.paginationControls.locator('button', { hasText: pageNumber.toString() });
    await pageButton.click();
    await this.waitForSearchResults();
  }

  /**
   * Go to next page
   */
  async goToNextPage() {
    const nextButton = this.paginationControls.locator('button', { hasText: /next|>/i });
    await nextButton.click();
    await this.waitForSearchResults();
  }

  /**
   * Go to previous page
   */
  async goToPreviousPage() {
    const prevButton = this.paginationControls.locator('button', { hasText: /previous|</i });
    await prevButton.click();
    await this.waitForSearchResults();
  }

  /**
   * Verify result item structure
   */
  async verifyResultItemStructure(index: number = 0) {
    const result = this.resultItems.nth(index);
    await expect(result).toBeVisible();
    
    // Check for common result elements
    const thumbnail = result.locator('img, .thumbnail, [data-testid="thumbnail"]');
    const title = result.locator('h2, h3, .title, [data-testid="title"]');
    const metadata = result.locator('.metadata, [data-testid="metadata"]');
    
    if (await thumbnail.isVisible()) {
      await expect(thumbnail).toHaveAttribute('src');
    }
    
    if (await title.isVisible()) {
      await expect(title).toHaveText(/.+/);
    }
    
    if (await metadata.isVisible()) {
      await expect(metadata).toBeVisible();
    }
  }

  /**
   * Check advanced search functionality
   */
  async performAdvancedSearch(criteria: {
    query?: string;
    dateFrom?: string;
    dateTo?: string;
    modality?: string;
    patient?: string;
  }) {
    if (criteria.query) {
      await this.searchInput.fill(criteria.query);
    }
    
    if (criteria.dateFrom && criteria.dateTo) {
      await this.filterByDateRange(criteria.dateFrom, criteria.dateTo);
    }
    
    if (criteria.modality) {
      await this.filterByModality(criteria.modality);
    }
    
    if (criteria.patient) {
      await this.filterByPatient(criteria.patient);
    }
    
    await this.searchButton.click();
    await this.waitForSearchResults();
  }
}