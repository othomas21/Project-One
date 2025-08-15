/**
 * @file test-user.ts
 * @description Test user fixtures and utilities for Playwright tests
 */

export interface TestUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export const TEST_USERS = {
  validUser: {
    email: 'test@example.com',
    password: 'TestPassword123!',
    firstName: 'John',
    lastName: 'Doe'
  },
  adminUser: {
    email: 'admin@example.com', 
    password: 'AdminPassword123!',
    firstName: 'Admin',
    lastName: 'User'
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword123!'
  }
} as const;

export const TEST_CREDENTIALS = {
  VALID_EMAIL: 'test@radiologyapp.com',
  VALID_PASSWORD: 'SecurePassword123!',
  INVALID_EMAIL: 'invalid-email',
  INVALID_PASSWORD: '123',
  WEAK_PASSWORD: 'weak'
} as const;

export const MEDICAL_DATA = {
  SAMPLE_DICOM_FILE: 'sample.dcm',
  SAMPLE_IMAGE_FILE: 'chest-xray.jpg',
  LARGE_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  SUPPORTED_FORMATS: ['.dcm', '.jpg', '.png', '.jpeg'],
  UNSUPPORTED_FORMATS: ['.txt', '.pdf', '.doc']
} as const;