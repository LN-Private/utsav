// Authentication routes for Utsav API
// POST /register - User registration
// POST /login - User login

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, generateTokens, TokenPayload } from '../lib/auth';
import { ErrorCodes, HttpStatus, UserRole } from '@utsav/shared';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['customer', 'provider']).default('customer'),
});

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'],
});

// ============================================
// Types
// ============================================

interface RegisterBody {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

interface LoginBody {
  email?: string;
  phone?: string;
  password: string;
}

// ============================================
// Routes
// ============================================

/**
 * POST /api/auth/register
 * Register a new user (customer or provider)
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: validationResult.error.flatten(),
        },
      });
      return;
    }

    const { email, phone, password, fullName, role } = validationResult.data as RegisterBody;

    // Check if user already exists (by email or phone)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    });

    if (existingUser) {
      // Determine which field caused the conflict
      const field = existingUser.email === email ? 'email' : 'phone';
      res.status(HttpStatus.CONFLICT).json({
        success: false,
        error: {
          code: ErrorCodes.USER_ALREADY_EXISTS,
          message: `User with this ${field} already exists`,
        },
      });
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        fullName,
        role: role || 'customer',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'User registered successfully',
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred during registration',
      },
    });
  }
});

/**
 * POST /api/auth/login
 * Login with email or phone and password
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: validationResult.error.flatten(),
        },
      });
      return;
    }

    const { email, phone, password } = validationResult.data as LoginBody;

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phone: phone || undefined },
        ],
      },
    });

    if (!user) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_CREDENTIALS,
          message: 'Invalid email/phone or password',
        },
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_CREDENTIALS,
          message: 'Account is deactivated. Please contact support.',
        },
      });
      return;
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_CREDENTIALS,
          message: 'Invalid email/phone or password',
        },
      });
      return;
    }

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.fullName,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred during login',
      },
    });
  }
});

export default router;