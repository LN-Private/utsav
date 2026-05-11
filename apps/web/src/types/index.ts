import type { User, UserRole, AuthPayload } from '@utsav/shared/types/user';
import type { Service, ServiceCategory, ServiceSearchParams } from '@utsav/shared/types/service';
import type { Booking, BookingStatus, BookingWithDetails } from '@utsav/shared/types/booking';
import type { Payment, PaymentMethod, PaymentStatus } from '@utsav/shared/types/payment';
import type { Review } from '@utsav/shared/types/review';

export type {
  User,
  UserRole,
  AuthPayload,
  Service,
  ServiceCategory,
  ServiceSearchParams,
  Booking,
  BookingStatus,
  BookingWithDetails,
  Payment,
  PaymentMethod,
  PaymentStatus,
  Review,
};

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterCustomerInput {
  email: string;
  phone: string;
  password: string;
  fullName: string;
}

export interface RegisterProviderInput {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  businessName: string;
  categoryId: string;
  description?: string;
  location?: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface RootState {
  auth: AuthState;
}