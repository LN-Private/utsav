// Main application entry point for Utsav API
// Initializes Express server with middleware and routes

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import serviceRoutes from './routes/services';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import reviewRoutes from './routes/reviews';
import adminRoutes from './routes/admin';
import { HttpStatus, ErrorCodes } from '@utsav/shared';
import { rateLimiter, authRateLimiter } from './middleware/rateLimit';

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================

// CORS - Allow requests from frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// JSON body parser
app.use(express.json());

// URL-encoded body parser
app.use(express.urlencoded({ extended: true }));

// ============================================
// Health Check
// ============================================

app.get('/health', (_req: Request, res: Response) => {
  res.status(HttpStatus.OK).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

// ============================================
// API Routes
// ============================================

// Mount auth routes at /api/auth
app.use('/api/auth', authRateLimiter, authRoutes);

// Mount user routes at /api/users
app.use('/api/users', rateLimiter, userRoutes);

// Mount service routes at /api/services
app.use('/api/services', rateLimiter, serviceRoutes);

// Mount booking routes at /api/bookings
app.use('/api/bookings', rateLimiter, bookingRoutes);

// Mount payment routes at /api/payments
app.use('/api/payments', rateLimiter, paymentRoutes);

// Mount review routes at /api/reviews
app.use('/api/reviews', rateLimiter, reviewRoutes);

// Mount admin routes at /api/admin
app.use('/api/admin', rateLimiter, adminRoutes);

// ============================================
// Error Handling
// ============================================

// 404 handler for unmatched routes
app.use((_req: Request, res: Response) => {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: process.env.NODE_ENV === 'production' 
        ? 'An internal server error occurred' 
        : err.message,
    },
  });
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 Utsav API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
  console.log(`👤 User routes: http://localhost:${PORT}/api/users`);
  console.log(`📸 Service routes: http://localhost:${PORT}/api/services`);
  console.log(`📅 Booking routes: http://localhost:${PORT}/api/bookings`);
  console.log(`💳 Payment routes: http://localhost:${PORT}/api/payments`);
  console.log(`⭐ Review routes: http://localhost:${PORT}/api/reviews`);
  console.log(`🛠️ Admin routes: http://localhost:${PORT}/api/admin`);
});

export default app;