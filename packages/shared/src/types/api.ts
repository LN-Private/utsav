// API response types for Utsav marketplace

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiRequestParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// HTTP status codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API error codes
export const ErrorCodes = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  
  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_ROLE: 'INVALID_ROLE',
  
  // Service
  SERVICE_NOT_FOUND: 'SERVICE_NOT_FOUND',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  
  // Booking
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  BOOKING_INVALID_STATUS: 'BOOKING_INVALID_STATUS',
  BOOKING_ALREADY_EXISTS: 'BOOKING_ALREADY_EXISTS',
  CANNOT_CANCEL: 'CANNOT_CANCEL',
  
  // Payment
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  
  // Review
  REVIEW_NOT_FOUND: 'REVIEW_NOT_FOUND',
  REVIEW_ALREADY_EXISTS: 'REVIEW_ALREADY_EXISTS',
  CANNOT_REVIEW: 'CANNOT_REVIEW',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',
} as const;