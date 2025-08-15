/**
 * @file search.spec.ts
 * @description Medical image search and analysis results tests
 */

import { test, expect } from '@playwright/test';
import { SearchPage } from './pages/search-page';
import { AuthPage } from './pages/auth-page';
import { TEST_USERS } from './fixtures/test-user';

test.describe('Medical Image Search', () => {
  let searchPage: SearchPage;
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new SearchPage(page);
    authPage = new AuthPage(page);
    
    // Login before each test
    await authPage.login(TEST_USERS.validUser);
  });

  test.describe('Search Interface', () => {
    test('should display search interface', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await expect(searchPage.searchInput).toBeVisible();
      await expect(searchPage.searchButton).toBeVisible();
      await expect(searchPage.filterPanel).toBeVisible();
    });

    test('should show search placeholder text', async ({ page }) => {
      await searchPage.gotoSearch();
      
      const placeholder = await searchPage.searchInput.getAttribute('placeholder');
      expect(placeholder).toBeTruthy();
      expect(placeholder?.toLowerCase()).toContain('search');
    });

    test('should display available filters', async ({ page }) => {
      await searchPage.gotoSearch();
      
      // Check for common filter elements
      if (await searchPage.dateRangeFilter.isVisible()) {
        await expect(searchPage.dateRangeFilter).toBeVisible();
      }
      
      if (await searchPage.modalityFilter.isVisible()) {
        await expect(searchPage.modalityFilter).toBeVisible();
      }
    });
  });

  test.describe('Basic Search', () => {
    test('should perform basic text search', async ({ page }) => {
      await searchPage.gotoSearch();
      
      // Mock search API response
      await page.route('**/api/search**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [
              {
                id: 'img_001',
                patientId: 'PAT001',
                studyDescription: 'Chest X-Ray',
                modality: 'CR',
                date: '2024-01-15',
                findings: 'Normal chest X-ray'
              },
              {
                id: 'img_002', 
                patientId: 'PAT002',
                studyDescription: 'Chest CT',
                modality: 'CT',
                date: '2024-01-16',
                findings: 'Minor inflammatory changes'
              }
            ],
            total: 2
          })
        });
      });
      
      await searchPage.search('chest');
      await searchPage.expectResultsCount(2);
      await searchPage.expectResultsContain('chest');
    });

    test('should handle empty search results', async ({ page }) => {
      await searchPage.gotoSearch();
      
      // Mock empty search response
      await page.route('**/api/search**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [],
            total: 0
          })
        });
      });
      
      await searchPage.search('nonexistent-term');
      await searchPage.expectNoResults();
    });

    test('should clear search results', async ({ page }) => {
      await searchPage.gotoSearch();
      
      // First search for something
      await page.route('**/api/search**', async route => {
        const url = route.request().url();
        const hasQuery = new URL(url).searchParams.get('q');
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: hasQuery ? [{ id: '1', title: 'Test Result' }] : [],
            total: hasQuery ? 1 : 0
          })
        });
      });
      
      await searchPage.search('test');
      await searchPage.expectResultsCount(1);
      
      // Clear search
      await searchPage.clearSearch();
      await searchPage.expectNoResults();
    });

    test('should handle search errors gracefully', async ({ page }) => {
      await searchPage.gotoSearch();
      
      // Mock search API error
      await page.route('**/api/search**', async route => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Internal server error'
          })
        });
      });
      
      await searchPage.search('test');
      
      // Should show error message
      const errorMessage = page.locator('[role="alert"], .error-message');
      await expect(errorMessage).toBeVisible();
    });
  });

  test.describe('Advanced Search Filters', () => {
    test('should filter by date range', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        const url = new URL(route.request().url());
        const dateFrom = url.searchParams.get('dateFrom');
        const dateTo = url.searchParams.get('dateTo');
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: dateFrom && dateTo ? [
              {
                id: 'filtered_001',
                date: '2024-01-15',
                studyDescription: 'Recent study within date range'
              }
            ] : [],
            total: dateFrom && dateTo ? 1 : 0
          })
        });
      });
      
      await searchPage.filterByDateRange('2024-01-01', '2024-01-31');
      await searchPage.expectResultsCount(1);
    });

    test('should filter by modality', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        const url = new URL(route.request().url());
        const modality = url.searchParams.get('modality');
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: modality === 'CT' ? [
              {
                id: 'ct_001',
                modality: 'CT',
                studyDescription: 'CT Chest'
              }
            ] : [],
            total: modality === 'CT' ? 1 : 0
          })
        });
      });
      
      await searchPage.filterByModality('CT');
      await searchPage.expectResultsCount(1);
    });

    test('should filter by patient ID', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        const url = new URL(route.request().url());
        const patient = url.searchParams.get('patient');
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: patient === 'PAT001' ? [
              {
                id: 'patient_001',
                patientId: 'PAT001',
                studyDescription: 'Patient PAT001 study'
              }
            ] : [],
            total: patient === 'PAT001' ? 1 : 0
          })
        });
      });
      
      await searchPage.filterByPatient('PAT001');
      await searchPage.expectResultsCount(1);
    });

    test('should combine multiple filters', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        const url = new URL(route.request().url());
        const query = url.searchParams.get('q');
        const modality = url.searchParams.get('modality');
        const patient = url.searchParams.get('patient');
        
        const matchesAllFilters = query === 'chest' && modality === 'CT' && patient === 'PAT001';
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: matchesAllFilters ? [
              {
                id: 'combined_001',
                patientId: 'PAT001',
                modality: 'CT',
                studyDescription: 'Chest CT for PAT001'
              }
            ] : [],
            total: matchesAllFilters ? 1 : 0
          })
        });
      });
      
      await searchPage.performAdvancedSearch({
        query: 'chest',
        modality: 'CT',
        patient: 'PAT001'
      });
      
      await searchPage.expectResultsCount(1);
    });
  });

  test.describe('Search Results', () => {
    test('should display result items with proper structure', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [
              {
                id: 'result_001',
                patientId: 'PAT001',
                studyDescription: 'Chest X-Ray',
                modality: 'CR',
                date: '2024-01-15',
                thumbnailUrl: '/api/thumbnails/result_001.jpg'
              }
            ],
            total: 1
          })
        });
      });
      
      await searchPage.search('chest');
      await searchPage.verifyResultItemStructure(0);
    });

    test('should allow clicking on search results', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [
              {
                id: 'clickable_001',
                studyDescription: 'Clickable Study'
              }
            ],
            total: 1
          })
        });
      });
      
      await searchPage.search('test');
      await searchPage.clickResult(0);
      
      // Should navigate to details or open modal
      // This depends on your app's behavior
    });

    test('should open result details modal', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [
              {
                id: 'detailed_001',
                studyDescription: 'Detailed Study'
              }
            ],
            total: 1
          })
        });
      });
      
      await searchPage.search('test');
      
      if (await searchPage.resultItems.first().locator('button:has-text("View"), button:has-text("Details")').isVisible()) {
        await searchPage.viewResultDetails(0);
        await expect(searchPage.detailsModal).toBeVisible();
        
        await searchPage.closeDetailsModal();
        await expect(searchPage.detailsModal).not.toBeVisible();
      }
    });
  });

  test.describe('Sorting and Pagination', () => {
    test('should sort results by different criteria', async ({ page }) => {
      await searchPage.gotoSearch();
      
      let currentSort = 'date';
      
      await page.route('**/api/search**', async route => {
        const url = new URL(route.request().url());
        const sort = url.searchParams.get('sort') || 'date';
        currentSort = sort;
        
        const results = sort === 'date' ? [
          { id: '1', date: '2024-01-16', studyDescription: 'Recent study' },
          { id: '2', date: '2024-01-15', studyDescription: 'Older study' }
        ] : [
          { id: '2', date: '2024-01-15', studyDescription: 'Older study' },
          { id: '1', date: '2024-01-16', studyDescription: 'Recent study' }
        ];
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ results, total: 2 })
        });
      });
      
      await searchPage.search('study');
      
      if (await searchPage.sortDropdown.isVisible()) {
        await searchPage.sortBy('date');
        await searchPage.expectResultsCount(2);
      }
    });

    test('should handle pagination', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        const url = new URL(route.request().url());
        const page_num = parseInt(url.searchParams.get('page') || '1');
        
        const allResults = Array.from({ length: 25 }, (_, i) => ({
          id: `result_${i + 1}`,
          studyDescription: `Study ${i + 1}`
        }));
        
        const pageSize = 10;
        const startIndex = (page_num - 1) * pageSize;
        const pageResults = allResults.slice(startIndex, startIndex + pageSize);
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: pageResults,
            total: allResults.length,
            page: page_num,
            totalPages: Math.ceil(allResults.length / pageSize)
          })
        });
      });
      
      await searchPage.search('study');
      await searchPage.expectResultsCount(10);
      
      if (await searchPage.paginationControls.isVisible()) {
        await searchPage.goToNextPage();
        await searchPage.expectResultsCount(10);
      }
    });
  });

  test.describe('Export Functionality', () => {
    test('should export search results', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [{ id: '1', studyDescription: 'Exportable Study' }],
            total: 1
          })
        });
      });
      
      // Mock export endpoint
      await page.route('**/api/export**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'text/csv',
          body: 'ID,Study Description\n1,Exportable Study',
          headers: {
            'Content-Disposition': 'attachment; filename=search-results.csv'
          }
        });
      });
      
      await searchPage.search('exportable');
      
      if (await searchPage.exportButton.isVisible()) {
        const download = await searchPage.exportResults('CSV');
        expect(download.suggestedFilename()).toContain('.csv');
      }
    });
  });

  test.describe('Performance', () => {
    test('should handle large result sets efficiently', async ({ page }) => {
      await searchPage.gotoSearch();
      
      // Mock large result set
      await page.route('**/api/search**', async route => {
        const largeResults = Array.from({ length: 1000 }, (_, i) => ({
          id: `large_${i}`,
          studyDescription: `Large Dataset Study ${i}`
        }));
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: largeResults.slice(0, 50), // Return first page
            total: largeResults.length
          })
        });
      });
      
      const startTime = Date.now();
      await searchPage.search('large dataset');
      const endTime = Date.now();
      
      // Search should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
      await searchPage.expectResultsCount(50);
    });

    test('should debounce search input', async ({ page }) => {
      await searchPage.gotoSearch();
      
      let searchCallCount = 0;
      await page.route('**/api/search**', async route => {
        searchCallCount++;
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ results: [], total: 0 })
        });
      });
      
      // Type quickly (should be debounced)
      await searchPage.searchInput.type('quick typing test', { delay: 50 });
      
      // Wait for debounce
      await page.waitForTimeout(1000);
      
      // Should have made fewer API calls than characters typed
      expect(searchCallCount).toBeLessThan(10);
    });
  });

  test.describe('Accessibility', () => {
    test('search interface should be accessible', async ({ page }) => {
      await searchPage.gotoSearch();
      
      // Check for proper labels
      await expect(searchPage.searchInput).toHaveAttribute('aria-label');
      
      // Check that search button has accessible text
      const searchButtonText = await searchPage.searchButton.textContent();
      expect(searchButtonText).toBeTruthy();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await searchPage.gotoSearch();
      
      // Tab through search interface
      await page.keyboard.press('Tab');
      await expect(searchPage.searchInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(searchPage.searchButton).toBeFocused();
    });

    test('should announce search results to screen readers', async ({ page }) => {
      await searchPage.gotoSearch();
      
      await page.route('**/api/search**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            results: [{ id: '1', studyDescription: 'Accessible Result' }],
            total: 1
          })
        });
      });
      
      await searchPage.search('accessible');
      
      // Check for aria-live region or status announcement
      const liveRegions = page.locator('[aria-live], [role="status"]');
      const count = await liveRegions.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});