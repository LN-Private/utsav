// Authentication routes for Utsav API
// POST /register - User registration
// POST /login - User login
// POST /send-otp - Send OTP for phone verification
// POST /verify-otp - Verify OTP
// POST /forgot-password - Request password reset
// POST /reset-password - Reset password with OTP
// POST /refresh-token - Refresh access token

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword, generateTokens, verifyToken, TokenPayload } from '../lib/auth';
import { ErrorCodes, HttpStatus, UserRole } from '@utsav/shared';

const router = Router();

// ============================================
// Utility Functions
// ============================================

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP expiry time (10 minutes)
function getOTPExpiry(): Date {
  return new Date(Date.now() + 10 * 60 * 1000);
}

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

// ============================================
// OTP & Password Reset Schemas
// ============================================

const sendOTPSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
});

const verifyOTPSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
});

// ============================================
// Additional Auth Routes
// ============================================

/**
 * POST /api/auth/send-otp
 * Send OTP for phone verification
 */
router.post('/send-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = sendOTPSchema.safeParse(req.body);
    
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

    const { phone } = validationResult.data;

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.USER_NOT_FOUND,
          message: 'User with this phone number not found',
        },
      });
      return;
    }

    // Generate OTP and expiry
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Save OTP to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationOTP: otp,
        verificationOTPExpiry: otpExpiry,
      },
    });

    // In production, send OTP via SMS (e.g., using Sparrow SMS or similar Nepal SMS provider)
    // For development, we return the OTP in response
    console.log(`OTP for ${phone}: ${otp}`);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        message: 'OTP sent successfully',
        // Only include OTP in development
        ...(process.env.NODE_ENV !== 'production' && { otp }),
      },
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while sending OTP',
      },
    });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP for phone verification
 */
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = verifyOTPSchema.safeParse(req.body);
    
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

    const { phone, otp } = validationResult.data;

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.USER_NOT_FOUND,
          message: 'User with this phone number not found',
        },
      });
      return;
    }

    // Check if OTP matches and is not expired
    if (user.verificationOTP !== otp) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_OTP,
          message: 'Invalid OTP',
        },
      });
      return;
    }

    if (!user.verificationOTPExpiry || user.verificationOTPExpiry < new Date()) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.OTP_EXPIRED,
          message: 'OTP has expired. Please request a new one.',
        },
      });
      return;
    }

    // Mark user as verified and clear OTP
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationOTP: null,
        verificationOTPExpiry: null,
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        message: 'Phone number verified successfully',
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while verifying OTP',
      },
    });
  }
});

/**
 * POST /api/auth/forgot-password
 * Request password reset OTP
 */
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    
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

    const { email } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found (security best practice)
      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          message: 'If an account with this email exists, a password reset OTP has been sent',
        },
      });
      return;
    }

    // Generate OTP and expiry
    const otp = generateOTP();
    const otpExpiry = getOTPExpiry();

    // Save password reset OTP to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOTP: otp,
        passwordResetOTPExpiry: otpExpiry,
      },
    });

    // In production, send OTP via email
    console.log(`Password reset OTP for ${email}: ${otp}`);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        message: 'If an account with this email exists, a password reset OTP has been sent',
        // Only include OTP in development
        ...(process.env.NODE_ENV !== 'production' && { otp }),
      },
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while processing password reset request',
      },
    });
  }
});

/**
 * POST /api/auth/reset-password
 * Reset password with OTP
 */
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = resetPasswordSchema.safeParse(req.body);
    
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

    const { email, otp, newPassword } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        },
      });
      return;
    }

    // Check if OTP matches and is not expired
    if (user.passwordResetOTP !== otp) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_OTP,
          message: 'Invalid OTP',
        },
      });
      return;
    }

    if (!user.passwordResetOTPExpiry || user.passwordResetOTPExpiry < new Date()) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.OTP_EXPIRED,
          message: 'OTP has expired. Please request a new one.',
        },
      });
      return;
    }

    // Hash new password and clear OTP
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetOTP: null,
        passwordResetOTPExpiry: null,
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        message: 'Password reset successfully',
      },
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while resetting password',
      },
    });
  }
});

/**
 * POST /api/auth/refresh-token
 * Refresh access token using refresh token
 */
router.post('/refresh-token', async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = refreshTokenSchema.safeParse(req.body);
    
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

    const { refreshToken } = validationResult.data;

    // Verify refresh token
    let payload: TokenPayload;
    try {
      payload = verifyToken(refreshToken);
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_TOKEN,
          message: 'Invalid or expired refresh token',
        },
      });
      return;
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.isActive) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_TOKEN,
          message: 'User not found or inactive',
        },
      });
      return;
    }

    // Generate new tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    const tokens = generateTokens(tokenPayload);

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while refreshing token',
      },
    });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile (protected route)
 */
router.get('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Access token required',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_TOKEN,
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.USER_NOT_FOUND,
          message: 'User not found',
        },
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while fetching profile',
      },
    });
  }
});

/**
 * PATCH /api/auth/profile
 * Update current user profile (protected route)
 */
router.patch('/profile', async (req: Request, res: Response): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.UNAUTHORIZED,
          message: 'Access token required',
        },
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    let payload: TokenPayload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_TOKEN,
          message: 'Invalid or expired token',
        },
      });
      return;
    }

    // Validate request body
    const validationResult = updateProfileSchema.safeParse(req.body);
    
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

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: validationResult.data,
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: { user: updatedUser },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while updating profile',
      },
    });
  }
});

export default router;