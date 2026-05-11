// Authentication utilities for Utsav API
// JWT token generation/verification and password hashing

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRole } from '@utsav/shared';

// ============================================
// Types
// ============================================

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ============================================
// Configuration
// ============================================

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-me';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-me';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d';
const BCRYPT_ROUNDS = 12;

// ============================================
// Password Functions
// ============================================

/**
 * Hash a plain text password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password to compare
 * @param hashedPassword - Hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================
// JWT Token Functions
// ============================================

/**
 * Generate access and refresh tokens for a user
 * @param payload - User data to include in the token
 * @returns Object containing access and refresh tokens
 */
export function generateTokens(payload: TokenPayload): AuthTokens {
  const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'],
  });

  return { accessToken, refreshToken };
}

/**
 * Verify and decode an access token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
}

/**
 * Verify and decode a refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
}

/**
 * Generate only an access token (for token refresh)
 * @param payload - User data to include in the token
 * @returns Access token string
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'],
  });
}

/**
 * Verify and decode an access token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Check if a token has expired based on the error
 * @param error - JWT error to check
 * @returns True if error is due to expiration
 */
export function isTokenExpiredError(error: unknown): boolean {
  if (error instanceof jwt.TokenExpiredError) {
    return true;
  }
  return false;
}

/**
 * Check if a token is invalid (not just expired)
 * @param error - JWT error to check
 * @returns True if error is due to invalid token
 */
export function isTokenInvalidError(error: unknown): boolean {
  if (error instanceof jwt.JsonWebTokenError) {
    return true;
  }
  return false;
}