// Shared utilities for Utsav marketplace
// Validation helpers and common utilities

import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================

/**
 * Email validation regex pattern
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Nepal phone number validation (10 digits, starts with 98/97/96)
 */
export const phoneRegex = /^(98|97|96)\d{7}$/;

/**
 * Strong password validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
 */
export const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// ============================================
// Validation Helpers
// ============================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

/**
 * Validate Nepal phone number format
 */
export function isValidPhone(phone: string): boolean {
  return phoneRegex.test(phone);
}

/**
 * Validate strong password
 */
export function isStrongPassword(password: string): boolean {
  return strongPasswordRegex.test(password);
}

/**
 * Sanitize string input (trim and remove extra whitespace)
 */
export function sanitizeString(input: string): string {
  return input.trim().replace(/\s+/g, ' ');
}

/**
 * Generate a random verification code
 */
export function generateVerificationCode(length: number = 6): string {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}

/**
 * Generate a random token
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }
  return token;
}

// ============================================
// Date Helpers
// ============================================

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  return date < new Date();
}

/**
 * Check if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
  return date > new Date();
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================
// Zod Custom Validators
// ============================================

/**
 * Custom Zod validator for email
 */
export const zEmail = z.string().email('Invalid email format');

/**
 * Custom Zod validator for Nepal phone
 */
export const zPhone = z
  .string()
  .regex(phoneRegex, 'Invalid Nepal phone number format');

/**
 * Custom Zod validator for password
 */
export const zPassword = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(100, 'Password must be less than 100 characters');

/**
 * Custom Zod validator for optional password (allows undefined)
 */
export const zOptionalPassword = zPassword.optional();

// ============================================
// Response Helpers
// ============================================

/**
 * Create a success API response
 */
export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create an error API response
 */
export function createErrorResponse(code: string, message: string, details?: Record<string, unknown>) {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}