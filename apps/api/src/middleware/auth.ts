// Authentication middleware for Utsav API
// JWT verification for protected routes

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, isTokenExpiredError, TokenPayload } from '../lib/auth';
import { ErrorCodes, HttpStatus } from '@utsav/shared';

// ============================================
// Types
// ============================================

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// ============================================
// Middleware
// ============================================

/**
 * Express middleware to verify JWT token and attach user to request
 * Must be used after express.json() middleware
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Authorization header is required',
        },
      });
      return;
    }

    // Check for Bearer token format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Authorization header must be in format: Bearer <token>',
        },
      });
      return;
    }

    const token = parts[1];

    // Verify the token
    const user = verifyAccessToken(token);
    req.user = user;

    next();
  } catch (error) {
    if (isTokenExpiredError(error)) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.TOKEN_EXPIRED,
          message: 'Token has expired',
        },
      });
      return;
    }

    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      error: {
        code: ErrorCodes.TOKEN_INVALID,
        message: 'Invalid token',
      },
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user to request if valid token provided, but doesn't require it
 * Useful for routes that behave differently for authenticated users
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      next();
      return;
    }

    const token = parts[1];
    const user = verifyAccessToken(token);
    req.user = user;

    next();
  } catch {
    // If token is invalid, just continue without user
    next();
  }
}