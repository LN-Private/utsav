// Admin routes for Utsav API
// GET /api/admin/dashboard - Overview stats
// GET /api/admin/users - List all users with search/filter
// GET /api/admin/users/:id - Get user details
// PATCH /api/admin/users/:id - Update user status
// GET /api/admin/providers - List all providers with search
// PATCH /api/admin/providers/:id/verify - Verify provider registration
// PATCH /api/admin/providers/:id/status - Update provider status
// GET /api/admin/bookings - List all bookings with filters
// GET /api/admin/reviews - List all reviews
// DELETE /api/admin/reviews/:id - Remove review

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { ErrorCodes, HttpStatus, PAGINATION } from '@utsav/shared';

const router = Router();

// ============================================
// Middleware - Admin Role Check
// ============================================

function requireAdmin(req: AuthenticatedRequest, res: Response, next: () => void): void {
  if (req.user?.role !== 'admin') {
    res.status(HttpStatus.FORBIDDEN).json({
      success: false,
      error: {
        code: ErrorCodes.FORBIDDEN,
        message: 'Admin access required',
      },
    });
    return;
  }
  next();
}

// ============================================
// Validation Schemas
// ============================================

const usersQuerySchema = z.object({
  role: z.enum(['customer', 'provider', 'admin']).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
});

const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

const providersQuerySchema = z.object({
  verified: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
});

const bookingsQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed']).optional(),
  page: z.coerce.number().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
});

const reviewsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
});

// ============================================
// GET /api/admin/dashboard
// Overview stats (users, providers, bookings, revenue)
// ============================================

router.get('/dashboard', authenticate, requireAdmin, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalProviders,
      totalBookings,
      completedBookings,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.provider.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'completed' } }),
      prisma.booking.aggregate({
        where: { status: 'completed' },
        _sum: { providerPayout: true },
      }),
    ]);

    const pendingBookings = await prisma.booking.count({ where: { status: 'pending' } });
    const pendingProviders = await prisma.provider.count({ where: { verified: false } });

    res.status(HttpStatus.OK).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
        },
        providers: {
          total: totalProviders,
          pendingVerification: pendingProviders,
        },
        bookings: {
          total: totalBookings,
          completed: completedBookings,
          pending: pendingBookings,
        },
        revenue: {
          total: totalRevenue._sum.providerPayout || 0,
        },
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch dashboard stats',
      },
    });
  }
});

// ============================================
// GET /api/admin/users
// List all users with search/filter
// ============================================

router.get('/users', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validationResult = usersQuerySchema.safeParse(req.query);

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

    const { role, isActive, search, page, limit } = validationResult.data;
    const skip = (page - 1) * limit;

    const where: {
      role?: 'customer' | 'provider' | 'admin';
      isActive?: boolean;
      OR?: Array<{ email?: { contains: string; mode: 'insensitive' }; fullName?: { contains: string; mode: 'insensitive' }; phone?: { contains: string; mode: 'insensitive' } }>;
    } = {};

    if (role) {
      where.role = role;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          phone: true,
          fullName: true,
          role: true,
          isVerified: true,
          isActive: true,
          avatarUrl: true,
          createdAt: true,
          updatedAt: true,
          provider: {
            select: {
              id: true,
              businessName: true,
              verified: true,
              rating: true,
              reviewCount: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(HttpStatus.OK).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch users',
      },
    });
  }
});

// ============================================
// GET /api/admin/users/:id
// Get user details
// ============================================

router.get('/users/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        isVerified: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        provider: {
          select: {
            id: true,
            businessName: true,
            description: true,
            verified: true,
            location: true,
            rating: true,
            reviewCount: true,
            subscriptionTier: true,
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
        _count: {
          select: {
            customerBookings: true,
            reviews: true,
          },
        },
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

    res.status(HttpStatus.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch user',
      },
    });
  }
});

// ============================================
// PATCH /api/admin/users/:id
// Update user status (suspend/activate)
// ============================================

router.patch('/users/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const validationResult = updateUserStatusSchema.safeParse(req.body);

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

    const { isActive } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { id },
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

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        role: true,
        isVerified: true,
        isActive: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedUser,
      message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to update user',
      },
    });
  }
});

// ============================================
// GET /api/admin/providers
// List all providers with search
// ============================================

router.get('/providers', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validationResult = providersQuerySchema.safeParse(req.query);

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

    const { verified, isActive, search, page, limit } = validationResult.data;
    const skip = (page - 1) * limit;

    const where: {
      verified?: boolean;
      user?: {
        isActive?: boolean;
        OR?: Array<{ email?: { contains: string; mode: 'insensitive' }; fullName?: { contains: string; mode: 'insensitive' } }>;
      };
    } = {
      user: {},
    };

    if (verified !== undefined) {
      where.verified = verified;
    }
    if (isActive !== undefined && where.user) {
      where.user.isActive = isActive;
    }
    if (search && where.user) {
      where.user.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              fullName: true,
              avatarUrl: true,
              isVerified: true,
              isActive: true,
              createdAt: true,
            },
          },
          category: {
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { services: true, providerBookings: true },
          },
        },
      }),
      prisma.provider.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(HttpStatus.OK).json({
      success: true,
      data: providers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch providers',
      },
    });
  }
});

// ============================================
// PATCH /api/admin/providers/:id/verify
// Verify provider registration
// ============================================

router.patch('/providers/:id/verify', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Provider not found',
        },
      });
      return;
    }

    const updatedProvider = await prisma.provider.update({
      where: { id },
      data: { verified: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            fullName: true,
            avatarUrl: true,
            isVerified: true,
            isActive: true,
          },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedProvider,
      message: 'Provider verified successfully',
    });
  } catch (error) {
    console.error('Verify provider error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to verify provider',
      },
    });
  }
});

// ============================================
// PATCH /api/admin/providers/:id/status
// Update provider status
// ============================================

router.patch('/providers/:id/status', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const validationResult = updateUserStatusSchema.safeParse(req.body);

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

    const { isActive } = validationResult.data;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: 'Provider not found',
        },
      });
      return;
    }

    await prisma.user.update({
      where: { id: provider.userId },
      data: { isActive },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: `Provider ${isActive ? 'activated' : 'suspended'} successfully`,
    });
  } catch (error) {
    console.error('Update provider status error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to update provider status',
      },
    });
  }
});

// ============================================
// GET /api/admin/bookings
// List all bookings with filters
// ============================================

router.get('/bookings', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validationResult = bookingsQuerySchema.safeParse(req.query);

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

    const { status, page, limit } = validationResult.data;
    const skip = (page - 1) * limit;

    const where: {
      status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
    } = {};

    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          service: {
            select: {
              id: true,
              title: true,
              category: {
                select: { id: true, name: true },
              },
            },
          },
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              avatarUrl: true,
            },
          },
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  phone: true,
                  avatarUrl: true,
                },
              },
            },
          },
          payment: true,
          review: true,
        },
      }),
      prisma.booking.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(HttpStatus.OK).json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch bookings',
      },
    });
  }
});

// ============================================
// GET /api/admin/reviews
// List all reviews
// ============================================

router.get('/reviews', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const validationResult = reviewsQuerySchema.safeParse(req.query);

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

    const { page, limit } = validationResult.data;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          provider: {
            include: {
              user: {
                select: { id: true, fullName: true, avatarUrl: true },
              },
            },
          },
          service: {
            select: { id: true, title: true },
          },
          booking: {
            select: { id: true, eventDate: true },
          },
        },
      }),
      prisma.review.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(HttpStatus.OK).json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to fetch reviews',
      },
    });
  }
});

// ============================================
// DELETE /api/admin/reviews/:id
// Remove review
// ============================================

router.delete('/reviews/:id', authenticate, requireAdmin, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.REVIEW_NOT_FOUND,
          message: 'Review not found',
        },
      });
      return;
    }

    await prisma.review.delete({
      where: { id },
    });

    // Update provider's rating after review deletion
    const reviews = await prisma.review.findMany({
      where: { providerId: review.providerId },
      select: { rating: true },
    });

    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    await prisma.provider.update({
      where: { id: review.providerId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Failed to delete review',
      },
    });
  }
});

export default router;