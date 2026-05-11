// Services routes for Utsav API
// GET /api/services - List/search services
// GET /api/services/:id - Get single service
// POST /api/services - Create service (provider only)
// PUT /api/services/:id - Update service (owner only)
// DELETE /api/services/:id - Delete service (owner only)

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { ServiceCategorySlug } from '@utsav/shared';
import { ErrorCodes, HttpStatus, PAGINATION } from '@utsav/shared';

const router = Router();

type PriceTypeEnum = 'fixed' | 'per_person' | 'per_hour' | 'package';

const serviceSearchSchema = z.object({
  category: z.string().optional(),
  location: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  page: z.coerce.number().min(1).optional().default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce.number().min(1).max(PAGINATION.MAX_LIMIT).optional().default(PAGINATION.DEFAULT_LIMIT),
});

const createServiceSchema = z.object({
  categoryId: z.string().min(1, 'Category ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters').optional(),
  priceMin: z.number().min(0, 'Minimum price must be non-negative'),
  priceMax: z.number().min(0, 'Maximum price must be non-negative'),
  priceType: z.enum(['fixed', 'per_person', 'per_hour', 'package']).default('fixed'),
  images: z.array(z.string().url()).max(10, 'Maximum 10 images allowed').optional(),
}).refine((data) => data.priceMax >= data.priceMin, {
  message: 'Maximum price must be greater than or equal to minimum price',
  path: ['priceMax'],
});

const updateServiceSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  priceType: z.enum(['fixed', 'per_person', 'per_hour', 'package']).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
}).refine((data) => {
  if (data.priceMin !== undefined && data.priceMax !== undefined) {
    return data.priceMax >= data.priceMin;
  }
  return true;
}, {
  message: 'Maximum price must be greater than or equal to minimum price',
  path: ['priceMax'],
});

// ============================================
// Routes
// ============================================

/**
 * GET /api/services
 * Public endpoint to search/list services with filtering
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = serviceSearchSchema.safeParse(req.query);

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

    const { category, location, priceMin, priceMax, rating, page, limit } = validationResult.data;

    // Build where clause for filtering
    const where: {
      isActive: boolean;
      categoryId?: string;
      priceMin?: { gte: number };
      priceMax?: { lte: number };
      provider?: {
        location?: { contains: string; mode: 'insensitive' };
        rating?: { gte: number };
      };
    } = { isActive: true };

    if (category) {
      const categoryRecord = await prisma.serviceCategory.findUnique({
        where: { slug: category as ServiceCategorySlug },
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    if (priceMin !== undefined) {
      where.priceMin = { gte: priceMin };
    }

    if (priceMax !== undefined) {
      where.priceMax = { lte: priceMax };
    }

    if (location || rating) {
      where.provider = {};
      if (location) {
        where.provider.location = { contains: location, mode: 'insensitive' };
      }
      if (rating) {
        where.provider.rating = { gte: rating };
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Fetch services with provider info
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          provider: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                  avatarUrl: true,
                },
              },
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(HttpStatus.OK).json({
      success: true,
      data: services,
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
    console.error('Get services error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while fetching services',
      },
    });
  }
});

/**
 * GET /api/services/:id
 * Get a single service by ID with provider info
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                phone: true,
                email: true,
              },
            },
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        packages: true,
      },
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

    res.status(HttpStatus.OK).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while fetching service',
      },
    });
  }
});

/**
 * POST /api/services
 * Create a new service (authenticated, provider role required)
 */
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Check if user is a provider
    if (req.user?.role !== 'provider') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Only providers can create services',
        },
      });
      return;
    }

    const validationResult = createServiceSchema.safeParse(req.body);

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

    const { categoryId, title, description, priceMin, priceMax, priceType, images } = validationResult.data;

    // Verify the provider exists
    const provider = await prisma.provider.findUnique({
      where: { userId: req.user.userId },
    });

    if (!provider) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.USER_NOT_FOUND,
          message: 'Provider profile not found',
        },
      });
      return;
    }

    // Verify category exists
    const category = await prisma.serviceCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.CATEGORY_NOT_FOUND,
          message: 'Category not found',
        },
      });
      return;
    }

    const service = await prisma.service.create({
      data: {
        providerId: provider.id,
        categoryId,
        title,
        description,
        priceMin,
        priceMax,
        priceType: priceType as PriceTypeEnum,
        images: images || [],
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        category: true,
      },
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: service,
      message: 'Service created successfully',
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while creating service',
      },
    });
  }
});

/**
 * PUT /api/services/:id
 * Update a service (provider who owns it only)
 */
router.put('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const validationResult = updateServiceSchema.safeParse(req.body);

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

    const { title, description, priceMin, priceMax, priceType, images, isActive, isFeatured } = validationResult.data;

    // Find the service and verify ownership
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!existingService) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.SERVICE_NOT_FOUND,
          message: 'Service not found',
        },
      });
      return;
    }

    // Verify the user owns this service
    if (existingService.provider.userId !== req.user?.userId) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You can only update your own services',
        },
      });
      return;
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priceMin !== undefined && { priceMin }),
        ...(priceMax !== undefined && { priceMax }),
        ...(priceType !== undefined && { priceType: priceType as PriceTypeEnum }),
        ...(images !== undefined && { images }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
      },
      include: {
        provider: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
              },
            },
          },
        },
        category: true,
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedService,
      message: 'Service updated successfully',
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while updating service',
      },
    });
  }
});

/**
 * DELETE /api/services/:id
 * Delete a service (provider who owns it only)
 */
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Find the service and verify ownership
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: { provider: true },
    });

    if (!existingService) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.SERVICE_NOT_FOUND,
          message: 'Service not found',
        },
      });
      return;
    }

    // Verify the user owns this service
    if (existingService.provider.userId !== req.user?.userId) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You can only delete your own services',
        },
      });
      return;
    }

    await prisma.service.delete({
      where: { id },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while deleting service',
      },
    });
  }
});

export default router;