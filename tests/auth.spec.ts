/**
 * @file auth.spec.ts
 * @description Authentication flow tests for login, registration, and password reset
 */

import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth-page';
import { DashboardPage } from './pages/dashboard-page';
import { TEST_USERS, TEST_CREDENTIALS } from './fixtures/test-user';

test.describe('Authentication', () => {
  let authPage: AuthPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test.describe('Login', () => {
    test('should login with valid credentials', async ({ page }) => {
      await authPage.gotoLogin();
      await authPage.fillLoginForm(TEST_USERS.validUser);
      await authPage.submitLogin();
      
      await authPage.expectLoginSuccess();
      await dashboardPage.expectOnDashboard();
    });

    test('should show error with invalid email', async ({ page }) => {
      await authPage.gotoLogin();
      await authPage.fillLoginForm({
        email: TEST_CREDENTIALS.INVALID_EMAIL,
        password: TEST_CREDENTIALS.VALID_PASSWORD
      });
      await authPage.submitLogin();
      
      await authPage.expectValidationError('email');
    });

    test('should show error with invalid password', async ({ page }) => {
      await authPage.gotoLogin();
      await authPage.fillLoginForm({
        email: TEST_CREDENTIALS.VALID_EMAIL,
        password: TEST_CREDENTIALS.INVALID_PASSWORD
      });
      await authPage.submitLogin();
      
      await authPage.expectLoginError();
    });

    test('should show validation for empty fields', async ({ page }) => {
      await authPage.gotoLogin();
      await authPage.submitLogin();
      
      // Should show validation errors for both fields
      await authPage.expectValidationError('email');
      await authPage.expectValidationError('password');
    });

    test('should navigate to registration page', async ({ page }) => {
      await authPage.gotoLogin();
      await authPage.signupLink.click();
      
      await expect(page).toHaveURL(/\/auth\/register/);
    });

    test('should navigate to forgot password page', async ({ page }) => {
      await authPage.gotoLogin();
      await authPage.forgotPasswordLink.click();
      
      await expect(page).toHaveURL(/\/auth\/forgot-password/);
    });
  });

  test.describe('Registration', () => {
    test('should register with valid information', async ({ page }) => {
      await authPage.gotoRegister();
      await authPage.fillRegisterForm(TEST_USERS.validUser);
      await authPage.submitRegister();
      
      // Should redirect to login or dashboard (depending on email verification flow)
      await Promise.race([
        authPage.expectLoginSuccess(),
        expect(page).toHaveURL(/\/auth\/login/)
      ]);
    });

    test('should show error for invalid email format', async ({ page }) => {
      await authPage.gotoRegister();
      await authPage.fillRegisterForm({
        ...TEST_USERS.validUser,
        email: TEST_CREDENTIALS.INVALID_EMAIL
      });
      await authPage.submitRegister();
      
      await authPage.expectValidationError('email');
    });

    test('should validate password strength', async ({ page }) => {
      await authPage.gotoRegister();
      
      // Test weak password
      await authPage.checkPasswordStrength(TEST_CREDENTIALS.WEAK_PASSWORD, 'weak');
      
      // Test strong password
      await authPage.checkPasswordStrength(TEST_CREDENTIALS.VALID_PASSWORD, 'strong');
    });

    test('should validate password confirmation match', async ({ page }) => {
      await authPage.gotoRegister();
      await authPage.fillRegisterForm(TEST_USERS.validUser);
      
      // Change confirm password to not match
      await authPage.confirmPasswordInput.fill('DifferentPassword123!');
      await authPage.submitRegister();
      
      await authPage.expectValidationError('confirmPassword', 'Passwords must match');
    });

    test('should navigate back to login', async ({ page }) => {
      await authPage.gotoRegister();
      await authPage.loginLink.click();
      
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should show error for duplicate email', async ({ page }) => {
      // This test would require pre-existing test data
      test.skip(true, 'Requires test database setup with existing users');
    });
  });

  test.describe('Password Reset', () => {
    test('should show password reset form', async ({ page }) => {
      await authPage.gotoForgotPassword();
      
      await expect(authPage.emailInput).toBeVisible();
      const submitButton = page.locator('button[type="submit"]');
      await expect(submitButton).toBeVisible();
    });

    test('should validate email format for reset', async ({ page }) => {
      await authPage.gotoForgotPassword();
      
      await authPage.emailInput.fill(TEST_CREDENTIALS.INVALID_EMAIL);
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      await authPage.expectValidationError('email');
    });

    test('should show success message for valid email', async ({ page }) => {
      await authPage.gotoForgotPassword();
      
      await authPage.emailInput.fill(TEST_CREDENTIALS.VALID_EMAIL);
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      const successMessage = page.locator('[data-testid="success"], .success-message');
      await expect(successMessage).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      // Login first
      await authPage.login(TEST_USERS.validUser);
      await dashboardPage.expectOnDashboard();
      
      // Refresh page
      await page.reload();
      await dashboardPage.expectOnDashboard();
    });

    test('should logout successfully', async ({ page }) => {
      // Login first
      await authPage.login(TEST_USERS.validUser);
      await dashboardPage.expectOnDashboard();
      
      // Logout
      await dashboardPage.logout();
      
      // Should be redirected to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should redirect to login when accessing protected routes', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Should be redirected to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Security', () => {
    test('should not expose sensitive information in network requests', async ({ page }) => {
      const responses: any[] = [];
      
      page.on('response', (response) => {
        responses.push(response);
      });
      
      await authPage.login(TEST_USERS.validUser);
      
      // Check that password is not exposed in any response
      for (const response of responses) {
        const responseBody = await response.text().catch(() => '');
        expect(responseBody).not.toContain(TEST_USERS.validUser.password);
      }
    });

    test('should have proper HTTPS redirect in production', async ({ page, baseURL }) => {
      if (baseURL?.startsWith('https://')) {
        const httpUrl = baseURL.replace('https://', 'http://');
        const response = await page.request.get(httpUrl);
        expect(response.status()).toBe(301); // Redirect to HTTPS
      } else {
        test.skip(true, 'Not a production HTTPS environment');
      }
    });

    test('should have security headers', async ({ page }) => {
      const response = await page.goto('/auth/login');
      const headers = response?.headers();
      
      if (headers) {
        // Check for common security headers
        expect(headers['x-content-type-options']).toBe('nosniff');
        expect(headers['x-frame-options']).toBeTruthy();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('login form should be accessible', async ({ page }) => {
      await authPage.gotoLogin();
      
      // Check for proper labels
      await expect(authPage.emailInput).toHaveAttribute('aria-label');
      await expect(authPage.passwordInput).toHaveAttribute('aria-label');
      
      // Check for form validation accessibility
      await authPage.submitLogin();
      const errorElements = page.locator('[role="alert"]');
      if (await errorElements.count() > 0) {
        await expect(errorElements.first()).toBeVisible();
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      await authPage.gotoLogin();
      
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(authPage.emailInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(authPage.passwordInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(authPage.loginButton).toBeFocused();
    });
  });
});