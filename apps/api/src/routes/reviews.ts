// Reviews routes for Utsav API
// POST /api/reviews - Create a review for a completed booking (customer only)
// GET /api/reviews/:id - Get a single review
// GET /api/reviews/service/:serviceId - Get reviews for a service
// GET /api/reviews/provider/:providerId - Get reviews for a provider
// PUT /api/reviews/:id - Update own review (customer who wrote it)
// POST /api/reviews/:id/response - Add provider response to review

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { ErrorCodes, HttpStatus, PAGINATION, REVIEW } from '@utsav/shared';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  rating: z.number().int().min(REVIEW.MIN_RATING).max(REVIEW.MAX_RATING),
  comment: z.string().max(2000, 'Comment must be at most 2000 characters').optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(REVIEW.MIN_RATING).max(REVIEW.MAX_RATING).optional(),
  comment: z.string().max(2000, 'Comment must be at most 2000 characters').optional(),
  images: z.array(z.string().url()).max(5, 'Maximum 5 images allowed').optional(),
});

const providerResponseSchema = z.object({
  response: z.string().min(1, 'Response is required').max(2000, 'Response must be at most 2000 characters'),
});

const reviewsQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
});

// ============================================
// Routes
// ============================================

/**
 * POST /api/reviews
 * Create a review for a completed booking (customer only)
 */
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'customer') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Only customers can create reviews',
        },
      });
      return;
    }

    const validationResult = createReviewSchema.safeParse(req.body);

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

    const { bookingId, rating, comment, images } = validationResult.data;

    // Get the booking with service and provider info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: {
          select: { id: true, providerId: true },
        },
        provider: {
          select: { id: true },
        },
      },
    });

    if (!booking) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.BOOKING_NOT_FOUND,
          message: 'Booking not found',
        },
      });
      return;
    }

    // Verify the booking belongs to the authenticated user
    if (booking.customerId !== req.user.userId) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You can only review your own bookings',
        },
      });
      return;
    }

    // Verify booking is completed
    if (booking.status !== 'completed') {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.CANNOT_REVIEW,
          message: 'You can only review completed bookings',
        },
      });
      return;
    }

    // Check if review already exists
    const existingReview = await prisma.review.findUnique({
      where: { bookingId },
    });

    if (existingReview) {
      res.status(HttpStatus.CONFLICT).json({
        success: false,
        error: {
          code: ErrorCodes.REVIEW_ALREADY_EXISTS,
          message: 'A review already exists for this booking',
        },
      });
      return;
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        bookingId,
        customerId: req.user.userId,
        providerId: booking.providerId,
        serviceId: booking.serviceId,
        rating,
        comment,
        images: images || [],
        isVerified: true,
      },
      include: {
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });

    // Update provider's rating and review count
    const reviews = await prisma.review.findMany({
      where: { providerId: booking.providerId },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.provider.update({
      where: { id: booking.providerId },
      data: {
        rating: avgRating,
        reviewCount: reviews.length,
      },
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: review,
      message: 'Review created successfully',
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while creating review',
      },
    });
  }
});

/**
 * GET /api/reviews/:id
 * Get a single review by ID
 */
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const review = await prisma.review.findUnique({
      where: { id },
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
          select: { id: true, title: true, images: true },
        },
        booking: {
          select: { id: true, eventDate: true, eventLocation: true },
        },
      },
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

    // Verify user has access to this review
    const hasAccess =
      review.customerId === req.user?.userId ||
      (await prisma.provider.findUnique({ where: { userId: req.user?.userId } }))?.id === review.providerId;

    if (!hasAccess && req.user?.role !== 'admin') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You do not have access to this review',
        },
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while fetching review',
      },
    });
  }
});

/**
 * GET /api/reviews/service/:serviceId
 * Get reviews for a service
 */
router.get('/service/:serviceId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { serviceId } = req.params;
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
        where: { serviceId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
        },
      }),
      prisma.review.count({ where: { serviceId } }),
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
    console.error('Get service reviews error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while fetching reviews',
      },
    });
  }
});

/**
 * GET /api/reviews/provider/:providerId
 * Get reviews for a provider
 */
router.get('/provider/:providerId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { providerId } = req.params;
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
        where: { providerId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: { id: true, fullName: true, avatarUrl: true },
          },
          service: {
            select: { id: true, title: true },
          },
        },
      }),
      prisma.review.count({ where: { providerId } }),
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
    console.error('Get provider reviews error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while fetching reviews',
      },
    });
  }
});

/**
 * PUT /api/reviews/:id
 * Update own review (customer who wrote it)
 */
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'customer') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Only customers can update reviews',
        },
      });
      return;
    }

    const { id } = req.params;
    const validationResult = updateReviewSchema.safeParse(req.body);

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

    const { rating, comment, images } = validationResult.data;

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

    // Verify the user owns this review
    if (review.customerId !== req.user.userId) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You can only update your own reviews',
        },
      });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: rating ?? review.rating,
        comment,
        images: images ?? review.images,
      },
      include: {
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });

    // Update provider's rating
    const reviews = await prisma.review.findMany({
      where: { providerId: review.providerId },
      select: { rating: true },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await prisma.provider.update({
      where: { id: review.providerId },
      data: { rating: avgRating },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedReview,
      message: 'Review updated successfully',
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while updating review',
      },
    });
  }
});

/**
 * POST /api/reviews/:id/response
 * Add provider response to review
 */
router.post('/:id/response', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== 'provider') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Only providers can respond to reviews',
        },
      });
      return;
    }

    const { id } = req.params;
    const validationResult = providerResponseSchema.safeParse(req.body);

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

    const { response } = validationResult.data;

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

    // Get provider profile
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId },
    });

    if (!provider) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Provider profile not found',
        },
      });
      return;
    }

    // Verify the provider owns this review
    if (review.providerId !== provider.id) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You can only respond to reviews for your services',
        },
      });
      return;
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { providerResponse: response },
      include: {
        customer: {
          select: { id: true, fullName: true, avatarUrl: true },
        },
        service: {
          select: { id: true, title: true },
        },
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedReview,
      message: 'Response added successfully',
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while adding response',
      },
    });
  }
});

export default router;