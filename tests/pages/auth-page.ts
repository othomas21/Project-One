/**
 * @file auth-page.ts
 * @description Page object model for authentication pages
 */

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';
import { TestUser } from '../fixtures/test-user';

export class AuthPage extends BasePage {
  // Login page elements
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly signupLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;

  // Register page elements
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Login elements
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    this.loginButton = page.locator('button[type="submit"]', { hasText: /sign in|login/i });
    this.signupLink = page.locator('a', { hasText: /sign up|register/i });
    this.forgotPasswordLink = page.locator('a', { hasText: /forgot password/i });
    this.errorMessage = page.locator('[role="alert"], .error, [data-testid="error"]');

    // Register elements
    this.firstNameInput = page.locator('input[name="firstName"], input[name="first_name"]');
    this.lastNameInput = page.locator('input[name="lastName"], input[name="last_name"]');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"], input[name="confirm_password"]');
    this.registerButton = page.locator('button[type="submit"]', { hasText: /sign up|register|create account/i });
    this.loginLink = page.locator('a', { hasText: /sign in|login/i });
  }

  /**
   * Navigate to login page
   */
  async gotoLogin() {
    await this.goto('/auth/login');
    await this.waitForLoad();
  }

  /**
   * Navigate to register page
   */
  async gotoRegister() {
    await this.goto('/auth/register');
    await this.waitForLoad();
  }

  /**
   * Navigate to forgot password page
   */
  async gotoForgotPassword() {
    await this.goto('/auth/forgot-password');
    await this.waitForLoad();
  }

  /**
   * Fill login form
   */
  async fillLoginForm(user: TestUser) {
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
  }

  /**
   * Fill register form
   */
  async fillRegisterForm(user: TestUser) {
    if (user.firstName) await this.firstNameInput.fill(user.firstName);
    if (user.lastName) await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
  }

  /**
   * Submit login form
   */
  async submitLogin() {
    await this.loginButton.click();
    await this.waitForLoadingToComplete();
  }

  /**
   * Submit register form
   */
  async submitRegister() {
    await this.registerButton.click();
    await this.waitForLoadingToComplete();
  }

  /**
   * Perform complete login flow
   */
  async login(user: TestUser) {
    await this.gotoLogin();
    await this.fillLoginForm(user);
    await this.submitLogin();
  }

  /**
   * Perform complete registration flow
   */
  async register(user: TestUser) {
    await this.gotoRegister();
    await this.fillRegisterForm(user);
    await this.submitRegister();
  }

  /**
   * Check if user is logged in by looking for dashboard redirect
   */
  async expectLoginSuccess() {
    // Wait for redirect to dashboard or home page
    await this.page.waitForURL(/\/(dashboard|$)/, { timeout: 10000 });
    await expect(this.page).not.toHaveURL(/\/auth\/login/);
  }

  /**
   * Check for login error
   */
  async expectLoginError(message?: string) {
    await this.errorMessage.waitFor({ state: 'visible' });
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  /**
   * Check for validation errors
   */
  async expectValidationError(field: 'email' | 'password', message?: string) {
    const errorSelector = `[data-testid="${field}-error"], [id="${field}-error"], input[name="${field}"] + .error`;
    const error = this.page.locator(errorSelector);
    await error.waitFor({ state: 'visible' });
    
    if (message) {
      await expect(error).toContainText(message);
    }
  }

  /**
   * Test password strength indicator
   */
  async checkPasswordStrength(password: string, expectedStrength: 'weak' | 'medium' | 'strong') {
    await this.passwordInput.fill(password);
    
    const strengthIndicator = this.page.locator('[data-testid="password-strength"], .password-strength');
    await strengthIndicator.waitFor({ state: 'visible' });
    await expect(strengthIndicator).toContainText(expectedStrength, { ignoreCase: true });
  }
}