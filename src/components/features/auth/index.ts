/**
 * @file index.ts
 * @description Auth components barrel export
 * @module components/features/auth
 * 
 * Centralized exports for all authentication components:
 * - Login and registration forms
 * - Password reset functionality
 * - Authentication context and providers
 * - Role-based access control components
 * 
 * @reftools Standard barrel export pattern
 * @author Claude Code
 * @created 2025-08-13
 */

// Authentication forms
export { LoginForm } from './login-form';
export { RegisterForm } from './register-form';
export { ForgotPasswordForm } from './forgot-password-form';
export { ResetPasswordForm } from './reset-password-form';

// Authentication context and providers
export { 
  AuthProvider, 
  useAuth, 
  withRole, 
  ProtectedRoute 
} from './auth-provider';

// Type exports for convenience
export type { 
  // Add any auth-related types here as needed
} from './auth-provider';