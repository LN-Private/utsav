// User profile routes for Utsav API
// GET /me - Get current user profile
// PUT /me - Update current user profile
// GET /me/provider - Get provider profile (for providers)
// PUT /me/provider - Update provider profile

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { ErrorCodes, HttpStatus } from '@utsav/shared';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  phone: z.string().min(10, 'Phone must be at least 10 digits').optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

const updateProviderSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional().nullable(),
  categoryId: z.string().uuid('Invalid category ID').optional(),
  location: z.string().max(255).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// ============================================
// Types
// ============================================

interface UpdateProfileBody {
  fullName?: string;
  phone?: string;
  avatarUrl?: string | null;
}

interface UpdateProviderBody {
  businessName?: string;
  description?: string | null;
  categoryId?: string;
  location?: string | null;
  latitude?: number;
  longitude?: number;
}

// ============================================
// Routes (all require authentication)
// ============================================

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        fullName: true,
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
          code: ErrorCodes.NOT_FOUND,
          message: 'User not found',
        },
      });
      return;
    }

    // If user is a provider, include provider-specific fields
    if (user.role === 'provider') {
      const provider = await prisma.provider.findUnique({
        where: { userId: user.id },
      });

      res.status(HttpStatus.OK).json({
        success: true,
        data: {
          ...user,
          provider: provider || null,
        },
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch user profile',
      },
    });
  }
});

/**
 * PUT /api/users/me
 * Update current user profile
 */
router.put('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

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

    const data = validationResult.data as UpdateProfileBody;

    // Check if phone is being updated and if it's already in use
    if (data.phone) {
      const existingUser = await prisma.user.findFirst({
        where: {
          phone: data.phone,
          NOT: { id: userId },
        },
      });

      if (existingUser) {
        res.status(HttpStatus.CONFLICT).json({
          success: false,
          error: {
            code: ErrorCodes.DUPLICATE_RESOURCE,
            message: 'Phone number already in use',
          },
        });
        return;
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        avatarUrl: data.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        fullName: true,
        avatarUrl: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to update user profile',
      },
    });
  }
});

/**
 * GET /api/users/me/provider
 * Get provider profile (for users with provider role)
 */
router.get('/me/provider', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // First check if user is a provider
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'provider') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Only providers can access this endpoint',
        },
      });
      return;
    }

    const provider = await prisma.provider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
            createdAt: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!provider) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Provider profile not found',
        },
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: provider,
    });
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch provider profile',
      },
    });
  }
});

/**
 * PUT /api/users/me/provider
 * Update provider profile
 */
router.put('/me/provider', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // First check if user is a provider
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== 'provider') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Only providers can access this endpoint',
        },
      });
      return;
    }

    // Validate request body
    const validationResult = updateProviderSchema.safeParse(req.body);

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

    const data = validationResult.data as UpdateProviderBody;

    // Check if category exists if being updated
    if (data.categoryId) {
      const category = await prisma.serviceCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            code: ErrorCodes.VALIDATION_ERROR,
            message: 'Invalid category ID',
          },
        });
        return;
      }
    }

    // Update provider profile
    const updatedProvider = await prisma.provider.upsert({
      where: { userId },
      create: {
        userId,
        businessName: data.businessName || '',
        description: data.description,
        categoryId: data.categoryId!,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      update: {
        businessName: data.businessName,
        description: data.description,
        categoryId: data.categoryId,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedProvider,
    });
  } catch (error) {
    console.error('Error updating provider profile:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to update provider profile',
      },
    });
  }
});

export default router;