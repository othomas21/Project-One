# Playwright End-to-End Testing

This directory contains comprehensive end-to-end tests for the medical radiology application using Playwright.

## Test Structure

```
tests/
├── fixtures/                    # Test data and helper files
│   ├── test-user.ts             # User credentials and test data
│   ├── sample-data.ts           # Medical data samples and scenarios
│   ├── test-image.jpg           # Sample medical image for testing
│   └── test-image.png           # Additional test image
├── pages/                       # Page Object Model (POM) classes
│   ├── base-page.ts             # Base page with common functionality
│   ├── auth-page.ts             # Authentication pages (login/register)
│   ├── dashboard-page.ts        # Dashboard page interactions
│   ├── upload-page.ts           # Medical image upload functionality
│   └── search-page.ts           # Search and analysis results pages
├── utils/                       # Test utilities and helpers
│   └── test-helpers.ts          # Common helper functions
├── auth.spec.ts                 # Authentication flow tests
├── dashboard.spec.ts            # Dashboard functionality tests
├── upload.spec.ts               # File upload and analysis tests
├── search.spec.ts               # Search functionality tests
└── example.spec.ts              # Smoke tests and basic functionality
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- The application should be runnable locally

### Installation

1. Install dependencies:
```bash
npm install
```

2. Install Playwright browsers:
```bash
npm run playwright:install
```

### Running Tests

#### Run all tests:
```bash
npm run test:e2e
```

#### Run tests with UI mode (interactive):
```bash
npm run test:e2e:ui
```

#### Run tests in headed mode (visible browser):
```bash
npm run test:e2e:headed
```

#### Debug tests:
```bash
npm run test:e2e:debug
```

#### Run specific test file:
```bash
npx playwright test auth.spec.ts
```

#### Run tests matching a pattern:
```bash
npx playwright test --grep "login"
```

## Test Configuration

The tests are configured in `playwright.config.ts` with the following features:

- **Multi-browser testing**: Chrome, Firefox, Safari, and mobile browsers
- **Automatic retries**: Failed tests are retried up to 2 times in CI
- **Parallel execution**: Tests run in parallel for faster execution
- **Screenshots and videos**: Captured on failure for debugging
- **Network interception**: Mock API responses for isolated testing
- **Real-time reporting**: HTML reports with detailed test results

## Page Object Model (POM)

We use the Page Object Model pattern to maintain clean, reusable test code:

```typescript
// Example usage
import { AuthPage } from './pages/auth-page';
import { DashboardPage } from './pages/dashboard-page';

test('user can login and access dashboard', async ({ page }) => {
  const authPage = new AuthPage(page);
  const dashboardPage = new DashboardPage(page);
  
  await authPage.login({ email: 'test@example.com', password: 'password' });
  await dashboardPage.expectOnDashboard();
});
```

## Test Data Management

Test data is organized in the `fixtures/` directory:

- `test-user.ts`: User credentials and authentication data
- `sample-data.ts`: Medical imaging scenarios and test cases
- Sample image files for upload testing

## Medical Imaging Test Scenarios

The test suite covers these key medical imaging workflows:

### Authentication
- User registration and login
- Password reset functionality
- Session management
- Security validations

### File Upload
- DICOM file upload and validation
- Image format support (JPG, PNG, DICOM)
- File size validation
- Patient information forms
- Upload progress tracking
- AI analysis result display

### Search and Analysis
- Medical image search functionality
- Filter combinations (date, modality, patient)
- Pagination and sorting
- Analysis result display
- Export functionality

### Dashboard
- Key performance indicators (KPIs)
- Recent uploads and activity
- Navigation and user management
- Real-time updates

## API Mocking

Tests use request interception to mock API responses:

```typescript
// Mock successful upload
await page.route('**/api/upload**', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      success: true,
      analysisResults: {
        findings: 'Normal chest X-ray',
        confidence: 0.95
      }
    })
  });
});
```

## Accessibility Testing

Accessibility tests are included to ensure WCAG 2.1 AA compliance:

- Keyboard navigation
- Screen reader compatibility
- Focus management
- Color contrast
- ARIA attributes

## Mobile Testing

Tests include mobile-specific scenarios:

- Responsive design validation
- Touch interactions
- Mobile navigation
- Viewport-specific layouts

## Performance Testing

Basic performance checks are included:

- Page load times
- API response times
- File upload performance
- Large dataset handling

## Continuous Integration

Tests run automatically in GitHub Actions:

- **On pull requests**: Full test suite
- **On push to main**: All tests including deployment tests
- **Scheduled runs**: Daily regression testing
- **Multiple environments**: Node 18 and 20, multiple browsers

## Debugging Tests

### Visual Debugging
```bash
npm run test:e2e:headed
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### View Test Reports
After running tests, open the HTML report:
```bash
npx playwright show-report
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots at the point of failure
- Video recordings of the entire test
- Network logs and console output

## Best Practices

1. **Use Page Objects**: Keep locators and actions in page object classes
2. **Mock External APIs**: Use request interception for predictable tests
3. **Wait for Elements**: Use Playwright's auto-waiting features
4. **Descriptive Test Names**: Write clear, descriptive test descriptions
5. **Test Independence**: Each test should be independent and idempotent
6. **Realistic Test Data**: Use realistic medical imaging scenarios
7. **Error Scenarios**: Test both success and failure paths

## Medical Data Privacy

**Important**: Never commit real patient data or PHI (Protected Health Information):

- Use synthetic/mock medical data only
- Sample images should be publicly available test images
- Patient IDs should follow test patterns (PAT001, PAT002, etc.)
- All test data is clearly marked as synthetic

## Troubleshooting

### Common Issues

1. **Browsers not installed**:
   ```bash
   npm run playwright:install
   ```

2. **Port conflicts**:
   Ensure the application is running on the expected port (default: 3000)

3. **Test timeouts**:
   Increase timeout in `playwright.config.ts` if needed

4. **File upload tests failing**:
   Verify test image files exist in `tests/fixtures/`

### Environment Setup

Create `.env.local` for testing:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=test
```

## Contributing

When adding new tests:

1. Follow the existing Page Object Model structure
2. Add appropriate test data to `fixtures/`
3. Include both positive and negative test cases
4. Update this README if adding new test categories
5. Ensure tests pass in both headed and headless modes

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Test Configuration](https://playwright.dev/docs/test-configuration)
- [Debugging Tests](https://playwright.dev/docs/debug)