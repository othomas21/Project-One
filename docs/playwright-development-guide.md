# Playwright Development Reference Guide

## 🎯 Quick Commands for Active Development

### **Essential Test Commands**
```bash
# Quick smoke test (fastest)
npx playwright test example.spec.ts

# Test specific feature after changes
npx playwright test auth.spec.ts           # Authentication flows
npx playwright test upload.spec.ts         # Medical image upload
npx playwright test search.spec.ts         # Search functionality  
npx playwright test dashboard.spec.ts      # Dashboard features

# Debug mode (visual debugging)
npm run test:e2e:debug

# Interactive test runner (best for development)
npm run test:e2e:ui

# Run tests with visible browser
npm run test:e2e:headed
```

### **Development Workflow Integration**

#### **After UI Changes**
```bash
# 1. Quick validation
npx playwright test --grep "smoke"

# 2. Feature-specific testing
npx playwright test --grep "login|auth"        # Authentication changes
npx playwright test --grep "upload|file"       # Upload functionality
npx playwright test --grep "search|filter"     # Search features
npx playwright test --grep "dashboard|nav"     # Navigation/dashboard
```

#### **Before Git Commit**
```bash
# Run all tests in parallel (full validation)
npm run test:e2e

# Or run critical path only (faster)
npx playwright test auth.spec.ts upload.spec.ts dashboard.spec.ts
```

#### **When Debugging Issues**
```bash
# Visual debugging with browser
npm run test:e2e:debug -- --grep "failing-test-name"

# Run single test in headed mode
npx playwright test auth.spec.ts --headed --workers=1

# Generate detailed report
npx playwright test --reporter=html
npx playwright show-report
```

## 🚀 **Claude Code Integration Prompts**

### **Quick Testing Requests**
Copy and use these exact prompts with Claude Code:

#### **After Feature Development**
```
"I just finished implementing [feature name]. Run the relevant Playwright tests to validate the changes."

"Test the login flow - I made changes to the authentication"

"Run upload tests to make sure the DICOM validation is working"

"Check if the dashboard loads correctly after my navigation changes"
```

#### **Bug Investigation**
```
"The upload isn't working. Run the upload tests in debug mode to see what's failing."

"Users report login issues. Run auth tests and show me any failures."

"Run a smoke test to see if the basic app functionality is broken."
```

#### **Pre-Deployment Validation**
```
"Run all Playwright tests before I deploy this to production."

"Quick validation - run the most critical user flows."

"Test mobile compatibility before deployment."
```

#### **Accessibility & Performance**
```
"Run accessibility tests on the new form I added."

"Check mobile responsiveness on the dashboard."

"Test performance on the image upload feature."
```

## 📋 **Medical App Specific Test Scenarios**

### **HIPAA/Privacy Testing**
```bash
# Test data privacy and security
npx playwright test --grep "security|privacy|hipaa"

# Network request validation
npx playwright test --grep "network|api|sensitive"
```

### **Medical Workflow Testing**
```bash
# Complete medical imaging workflow
npx playwright test upload.spec.ts search.spec.ts

# Patient data handling
npx playwright test --grep "patient|phi|medical"

# DICOM file processing
npx playwright test --grep "dicom|file.*format|medical.*image"
```

### **Compliance Testing**
```bash
# Accessibility compliance (WCAG 2.1 AA)
npx playwright test --grep "accessibility|a11y|wcag"

# Mobile/responsive design
npx playwright test --project="Mobile Chrome" --project="Mobile Safari"
```

## 🎭 **Test File Quick Reference**

| File | Purpose | When to Run |
|------|---------|-------------|
| `example.spec.ts` | Smoke tests, basic functionality | After any major change |
| `auth.spec.ts` | Login, registration, security | Authentication changes |
| `upload.spec.ts` | File upload, DICOM validation | Upload feature work |
| `search.spec.ts` | Search, filters, results | Search functionality |
| `dashboard.spec.ts` | Navigation, KPIs, dashboard | Dashboard/nav changes |

## 🔧 **Development Environment Setup**

### **First Time Setup**
```bash
# Install Playwright browsers
npm run playwright:install

# Verify setup
npx playwright test example.spec.ts
```

### **Environment Variables for Testing**
Create `.env.local` for development testing:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=test
# Add other test-specific environment variables
```

### **Test Data Management**
```bash
# Location of test fixtures
tests/fixtures/test-user.ts          # User credentials
tests/fixtures/sample-data.ts        # Medical test data
tests/fixtures/test-image.jpg        # Sample medical images
```

## 🐛 **Debugging Test Failures**

### **Common Issues & Solutions**

#### **Tests Timing Out**
```bash
# Increase timeout and run single-threaded
npx playwright test --timeout=60000 --workers=1
```

#### **Element Not Found**
```bash
# Run in headed mode to see what's happening
npx playwright test failing-test.spec.ts --headed --workers=1
```

#### **API/Network Issues**
```bash
# Check network logs in debug mode
npm run test:e2e:debug -- failing-test.spec.ts
```

#### **Environment Issues**
```bash
# Check if dev server is running
npm run dev

# Verify test environment
npx playwright test --list
```

### **Test Result Analysis**
```bash
# Generate HTML report
npx playwright test --reporter=html

# View detailed results
npx playwright show-report

# Check screenshots/videos of failures
ls test-results/
```

## 📊 **Test Coverage by Feature**

### **Critical User Flows (Always Test These)**
1. **Authentication**: Login → Dashboard
2. **Upload Flow**: Select File → Upload → Analysis Results
3. **Search Flow**: Search → Filter → View Results
4. **Mobile Navigation**: All flows on mobile devices

### **Test Pyramid for Medical App**
```
🔺 E2E Tests (Playwright)
   - Complete user workflows
   - Cross-browser compatibility
   - Medical imaging workflows
   
🔺 Integration Tests
   - API endpoint testing
   - Database integration
   
🔺 Unit Tests (Jest)
   - Component logic
   - Utility functions
   - Business logic
```

## ⚡ **Performance Optimization for Tests**

### **Faster Test Execution**
```bash
# Run tests in parallel with sharding
npx playwright test --shard=1/3
npx playwright test --shard=2/3  
npx playwright test --shard=3/3

# Run only changed tests
npx playwright test --only-changed

# Skip browser installation in CI
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
```

### **Selective Test Running**
```bash
# Run tests by tag
npx playwright test --grep "@smoke"
npx playwright test --grep "@critical"

# Skip slow tests in development
npx playwright test --grep "^((?!@slow).)*$"
```

## 🎯 **Quick Development Checklist**

### **Before Starting Development**
- [ ] Run smoke tests: `npx playwright test example.spec.ts`
- [ ] Ensure dev server is running: `npm run dev`

### **During Development**
- [ ] Test relevant features as you build
- [ ] Use debug mode for immediate feedback: `npm run test:e2e:debug`
- [ ] Check mobile compatibility early

### **Before Git Commit**
- [ ] Run full test suite: `npm run test:e2e`
- [ ] Check test coverage for new features
- [ ] Verify no new accessibility issues

### **Before Deployment**
- [ ] All tests passing in CI/CD pipeline
- [ ] Mobile tests pass
- [ ] Performance tests within thresholds

## 🔍 **Troubleshooting Quick Fixes**

| Problem | Quick Fix |
|---------|-----------|
| Browser not launching | `npm run playwright:install` |
| Tests timing out | Add `--timeout=60000` flag |
| Flaky tests | Run with `--workers=1` |
| Can't see what's happening | Use `--headed` flag |
| Need to debug step-by-step | Use `npm run test:e2e:debug` |
| Want to see network calls | Check browser DevTools in headed mode |

---

## 💡 **Pro Tips for Medical App Testing**

1. **Always test with realistic medical data** (but never real PHI)
2. **Test file upload with various DICOM formats** and sizes
3. **Validate medical imaging workflows end-to-end**
4. **Test accessibility** - medical apps must be accessible
5. **Monitor performance** - medical images can be large
6. **Test offline scenarios** - medical facilities may have unreliable internet
7. **Cross-browser testing** - different hospitals use different browsers

---

**Remember: Ask Claude Code to run these tests whenever you make UI changes!** 🎭