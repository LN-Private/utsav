// Payment routes for Utsav API
// POST /api/payments/initiate - Initiate payment for a booking (customer)
// POST /api/payments/webhook/:gateway - Handle payment webhooks from eSewa/Khalti
// GET /api/payments/:id - Get payment details
// GET /api/payments/booking/:bookingId - Get payment for a booking
// POST /api/payments/refund - Process refund

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { ErrorCodes, HttpStatus } from '@utsav/shared';
import { PaymentMethod } from '@utsav/shared';
import { PaymentGatewayFactory, calculateCommission } from '../services/payment';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const initiatePaymentSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  method: z.enum(['esewa', 'khalti', 'cash', 'bank_transfer', 'card']),
});

const refundSchema = z.object({
  paymentId: z.string().min(1, 'Payment ID is required'),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().min(1, 'Reason is required').max(500, 'Reason must be at most 500 characters'),
});

// ============================================
// Routes
// ============================================

/**
 * POST /api/payments/initiate
 * Initiate payment for a booking (customer role required)
 */
router.post('/initiate', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only customers can initiate payments
    if (req.user?.role !== 'customer') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Only customers can initiate payments',
        },
      });
      return;
    }

    const validationResult = initiatePaymentSchema.safeParse(req.body);

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

    const { bookingId, method } = validationResult.data;

    // Get the booking and verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        payment: true,
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

    // Verify user owns this booking
    if (booking.customerId !== req.user.userId) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You can only initiate payment for your own bookings',
        },
      });
      return;
    }

    // Check if booking is in a payable state
    if (booking.status !== 'confirmed') {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_FAILED,
          message: 'Only confirmed bookings can be paid',
        },
      });
      return;
    }

    // Check if payment already exists
    if (booking.payment) {
      res.status(HttpStatus.CONFLICT).json({
        success: false,
        error: {
          code: ErrorCodes.DUPLICATE_RESOURCE,
          message: 'Payment already exists for this booking',
        },
      });
      return;
    }

    // Calculate commission for amount calculations
    calculateCommission(Number(booking.totalAmount));
    
    // Create payment intent via PaymentGatewayFactory for supported methods
    let paymentIntent;
    if (method === 'esewa' || method === 'khalti') {
      const gateway = PaymentGatewayFactory.getGateway(method as PaymentMethod);
      paymentIntent = await gateway.createIntent(Number(booking.totalAmount), bookingId);
    }

    // Create the payment
    const payment = await prisma.payment.create({
      data: {
        bookingId,
        amount: booking.totalAmount,
        method: method as PaymentMethod,
        status: 'pending',
      },
      include: {
        booking: {
          select: {
            id: true,
            totalAmount: true,
            service: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    });

    res.status(HttpStatus.CREATED).json({
      success: true,
      data: {
        ...payment,
        redirectUrl: paymentIntent?.redirectUrl,
      },
      message: 'Payment initiated successfully',
    });
  } catch (error) {
    console.error('Initiate payment error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while initiating payment',
      },
    });
  }
});

/**
 * POST /api/payments/webhook/:gateway
 * Handle payment webhooks from eSewa/Khalti
 */
router.post('/webhook/:gateway', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { gateway } = req.params;

    // Validate gateway
    if (gateway !== 'esewa' && gateway !== 'khalti') {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Invalid payment gateway',
        },
      });
      return;
    }

    const signature = req.headers['x-signature'] as string || '';
    const gatewayInstance = PaymentGatewayFactory.getGateway(gateway as PaymentMethod);
    
    // Verify webhook using PaymentGatewayFactory
    const verificationResult = await gatewayInstance.verifyWebhook(req.body, signature);
    
    if (!verificationResult.isValid) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Invalid webhook signature',
        },
      });
      return;
    }

    const { transactionId, status } = verificationResult;
    const bookingId = req.body.bookingId || req.body.booking_id;

    if (!bookingId) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Booking ID is required',
        },
      });
      return;
    }

    // Find and update the payment
    const payment = await prisma.payment.findFirst({
      where: { bookingId },
      include: { booking: true },
    });

    if (!payment) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_NOT_FOUND,
          message: 'Payment not found for this booking',
        },
      });
      return;
    }

    // Update payment status based on webhook data
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        transactionId,
        status: status || 'completed',
        paidAt: status === 'completed' ? new Date() : undefined,
        gatewayResponse: req.body,
      },
    });

    // Update booking status if payment is completed
    if (status === 'completed') {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'confirmed' },
      });
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedPayment,
      message: 'Webhook processed successfully',
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while processing webhook',
      },
    });
  }
});

/**
 * GET /api/payments/:id
 * Get payment details
 */
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            service: {
              select: {
                id: true,
                title: true,
              },
            },
            customer: {
              select: {
                id: true,
                fullName: true,
                phone: true,
              },
            },
            provider: {
              include: {
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_NOT_FOUND,
          message: 'Payment not found',
        },
      });
      return;
    }

    // Verify user has access to this payment
    const hasAccess = 
      payment.booking.customerId === req.user?.userId ||
      payment.booking.provider.userId === req.user?.userId;

    if (!hasAccess) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'You do not have access to this payment',
        },
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while fetching payment',
      },
    });
  }
});

/**
 * GET /api/payments/booking/:bookingId
 * Get payment for a booking
 */
router.get('/booking/:bookingId', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    // Get the booking first to verify access
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    // Get the payment
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
    });

    if (!payment) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_NOT_FOUND,
          message: 'Payment not found for this booking',
        },
      });
      return;
    }

    res.status(HttpStatus.OK).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error('Get payment by booking error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while fetching payment',
      },
    });
  }
});

/**
 * POST /api/payments/refund
 * Process refund (provider or admin only)
 */
router.post('/refund', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Only providers or admins can process refunds
    if (req.user?.role !== 'provider' && req.user?.role !== 'admin') {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: 'Only providers or admins can process refunds',
        },
      });
      return;
    }

    const validationResult = refundSchema.safeParse(req.body);

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

    const { paymentId, amount, reason } = validationResult.data;

    // Get the payment with booking info
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: true,
      },
    });

    if (!payment) {
      res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_NOT_FOUND,
          message: 'Payment not found',
        },
      });
      return;
    }

    // Verify provider owns the booking (unless admin)
    if (req.user.role === 'provider') {
      const provider = await prisma.provider.findUnique({
        where: { userId: req.user.userId },
      });

      if (provider?.id !== payment.booking.providerId) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            code: ErrorCodes.FORBIDDEN,
            message: 'You can only refund payments for your bookings',
          },
        });
        return;
      }
    }

    // Verify payment can be refunded
    if (payment.status !== 'completed') {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.PAYMENT_FAILED,
          message: 'Only completed payments can be refunded',
        },
      });
      return;
    }

    // Verify refund amount doesn't exceed payment amount
    const paymentAmount = Number(payment.amount);
    if (amount > paymentAmount) {
      res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: {
          code: ErrorCodes.INVALID_AMOUNT,
          message: 'Refund amount cannot exceed payment amount',
        },
      });
      return;
    }

    // Process refund via PaymentGatewayFactory for supported methods
    if (payment.method === 'esewa' || payment.method === 'khalti') {
      const gateway = PaymentGatewayFactory.getGateway(payment.method as PaymentMethod);
      const refundResult = await gateway.refund(payment.transactionId || '', amount);
      if (!refundResult.success) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            code: ErrorCodes.PAYMENT_FAILED,
            message: 'Refund failed',
          },
        });
        return;
      }
    }

    // Update payment to refunded status
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'refunded',
        gatewayResponse: {
          ...(payment.gatewayResponse as Record<string, unknown> || {}),
          refundReason: reason,
        },
      },
    });

    res.status(HttpStatus.OK).json({
      success: true,
      data: updatedPayment,
      message: 'Refund processed successfully',
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An error occurred while processing refund',
      },
    });
  }
});

export default router;