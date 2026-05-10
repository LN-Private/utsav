// User types for Utsav marketplace
// Supports both customers and service providers

export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer extends User {
  role: 'customer';
}

export interface ServiceProvider extends User {
  role: 'provider';
  businessName: string;
  description?: string;
  categoryId: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  verified: boolean;
  subscriptionTier: 'free' | 'basic' | 'premium';
  rating: number;
  reviewCount: number;
}

export interface CreateUserInput {
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface UpdateUserInput {
  email?: string;
  phone?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface CreateProviderInput extends CreateUserInput {
  role: 'provider';
  businessName: string;
  description?: string;
  categoryId: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenPayload {
  accessToken: string;
}