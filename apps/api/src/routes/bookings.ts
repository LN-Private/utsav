// Bookings routes for Utsav API
// GET /api/bookings - List bookings for authenticated user
// GET /api/bookings/:id - Get a single booking by ID
// POST /api/bookings - Create a new booking
// PUT /api/bookings/:id/status - Update booking status
// DELETE /api/bookings/:id - Cancel a booking

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { ErrorCodes, HttpStatus, PAGINATION, BOOKING } from '@utsav/shared';
import { Prisma } from '@prisma/client';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const createBookingSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  eventDate: z.string().datetime('Invalid date format').transform((val) => new Date(val)),
  eventLocation: z.string().min(5, 'Event location must be at least 5 characters'),
  eventLocationLat: z.number().optional(),
  eventLocationLng: z.number().optional(),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1'),
  specialRequests: z.string().max(1000, 'Special requests must be at most 1000 characters').optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed']),
});

const bookingsQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed']).optional(),
  page: z.coerce.number().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
});

// ============================================
// Types
// ============================================

interface CreateBookingBody {
  serviceId: string;
  eventDate: Date;
  eventLocation: string;
  eventLocationLat?: number;
  eventLocationLng?: number;
  guestCount: number;
  specialRequests?: string;
}

// ============================================
// Helper Functions
// ============================================

function calculateBookingAmounts(priceMin: number | Prisma.Decimal, priceMax: number | Prisma.Decimal, guestCount: number): {
  totalAmount: Prisma.Decimal;
  commissionAmount: Prisma.Decimal;
  platformFee: Prisma.Decimal;
  providerPayout: Prisma.Decimal;
} {
  // Use average of min/max price as base
  const min = typeof priceMin === 'number' ? priceMin : Number(priceMin);
  const max = typeof priceMax === 'number' ? priceMax : Number(priceMax);
  const basePrice = (min + max) / 2;
  const totalAmount = new Prisma.Decimal(basePrice * guestCount);
  
  const commissionAmount = totalAmount.times(BOOKING.COMMISSION_RATE);
  const platformFee = totalAmount.times(BOOKING.PLATFORM_FEE);
  const providerPayout = totalAmount.minus(commissionAmount).minus(platformFee);
  
  return { totalAmount, commissionAmount, platformFee, providerPayout };
}

// ============================================
// Routes
// ============================================

/**
 * GET /api/bookings
 * List bookings for authenticated user
 * Customers see their bookings, providers see bookings for their services
 */
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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
      customerId?: string;
      providerId?: string;
      status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
    } = {};

    if (req.user?.role === 'customer') {
      where.customerId = req.user.userId;
    } else if (req.user?.role === 'provider') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.userId },
      });
      if (provider) {
        where.providerId = provider.id;
      }
    }

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
                select: { id: true, name: true, slug: true },
              },
              images: true,
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
        message: 'An error occurred while fetching bookings',
      },
    });
  }
});

/**
 * GET /api/bookings/:id
 * Get a single booking by ID
 */
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            description: true,
            images: true,
            provider: {
              select: { id: true },
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

    // Verify user has access to this booking
    const provider = await prisma.provider.findUnique({
      where: { id: booking.providerId },
    });
    
    const hasAccess = 
      booking.customerId === req.user?.userId ||
      (req.user?.role === 'provider' && provider?.userId === req.user.userId);

    if (!hasAccess) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You do not have access to this booking',
        },
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while fetching booking',
      },
    });
  }
});

/**
 * POST /api/bookings
 * Create a new booking (customer role required)
 */
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only customers can create bookings
    if (req.user?.role !== 'customer') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Only customers can create bookings',
        },
      });
      return;
    }

    const validationResult = createBookingSchema.safeParse(req.body);

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

    const { serviceId, eventDate, eventLocation, eventLocationLat, eventLocationLng, guestCount, specialRequests } = validationResult.data as CreateBookingBody;

    // Get the service with provider info
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.SERVICE_NOT_FOUND,
          message: 'Service not found',
        },
      });
      return;
    }

    if (!service.isActive) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: 'This service is currently unavailable',
        },
      });
      return;
    }

    // Check if service is available on the requested date
    const existingBooking = await prisma.booking.findFirst({
      where: {
        serviceId,
        eventDate,
        status: { in: ['pending', 'confirmed', 'in_progress'] },
      },
    });

    if (existingBooking) {
      res.status(HttpStatus.CONFLICT).json({
        success: false,
        error: {
          code: ErrorCodes.BOOKING_ALREADY_EXISTS,
          message: 'This service is already booked for the selected date',
        },
      });
      return;
    }

    // Calculate amounts
    const { totalAmount, commissionAmount, platformFee, providerPayout } = calculateBookingAmounts(
      service.priceMin,
      service.priceMax,
      guestCount
    );

    const booking = await prisma.booking.create({
      data: {
        serviceId,
        customerId: req.user.userId,
        providerId: service.providerId,
        eventDate,
        eventLocation,
        eventLocationLat,
        eventLocationLng,
        guestCount,
        totalAmount,
        commissionAmount,
        platformFee,
        providerPayout,
        specialRequests,
      },
      include: {
        service: {
          select: {
            id: true,
            title: true,
            images: true,
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
      },
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: booking,
      message: 'Booking created successfully',
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while creating booking',
      },
    });
  }
});

/**
 * PUT /api/bookings/:id/status
 * Update booking status (pending -> confirmed -> in_progress -> completed)
 */
router.put('/:id/status', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const validationResult = updateBookingStatusSchema.safeParse(req.body);

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

    const { status } = validationResult.data;

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        service: {
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

    // Verify user can update this booking
    const canUpdate = 
      booking.customerId === req.user?.userId ||
      (req.user?.role === 'provider' && booking.providerId === (await prisma.provider.findUnique({ where: { userId: req.user.userId } }))?.id);

    if (!canUpdate) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You do not have permission to update this booking',
        },
      });
      return;
    }

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'disputed'],
      completed: [],
      cancelled: [],
      disputed: ['completed'],
    };

    if (!validTransitions[booking.status].includes(status)) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.BOOKING_INVALID_STATUS,
          message: `Cannot transition from ${booking.status} to ${status}`,
        },
      });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        service: {
          select: { id: true, title: true },
        },
        customer: {
          select: { id: true, fullName: true },
        },
        provider: {
          include: {
            user: {
              select: { id: true, fullName: true },
            },
          },
        },
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedBooking,
      message: 'Booking status updated successfully',
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while updating booking status',
      },
    });
  }
});

/**
 * DELETE /api/bookings/:id
 * Cancel a booking (before confirmed status)
 */
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
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

    // Verify user owns this booking
    if (booking.customerId !== req.user?.userId) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You can only cancel your own bookings',
        },
      });
      return;
    }

    // Can only cancel pending bookings
    if (booking.status !== 'pending') {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.CANNOT_CANCEL,
          message: 'This booking cannot be cancelled',
        },
      });
      return;
    }

    // Cancel the booking
    await prisma.booking.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Booking cancelled successfully',
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while cancelling booking',
      },
    });
  }
});

export default router;