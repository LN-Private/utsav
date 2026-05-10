// Booking types for Utsav marketplace

import type { Payment } from './payment';
import type { Review } from './review';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export interface Booking {
  id: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  eventDate: Date;
  eventLocation: string;
  eventLocationLat?: number;
  eventLocationLng?: number;
  guestCount: number;
  totalAmount: number;
  commissionAmount: number;
  platformFee: number;
  providerPayout: number;
  status: BookingStatus;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingInput {
  serviceId: string;
  customerId: string;
  providerId: string;
  eventDate: Date;
  eventLocation: string;
  eventLocationLat?: number;
  eventLocationLng?: number;
  guestCount: number;
  specialRequests?: string;
}

export interface UpdateBookingInput {
  eventDate?: Date;
  eventLocation?: string;
  eventLocationLat?: number;
  eventLocationLng?: number;
  guestCount?: number;
  specialRequests?: string;
  status?: BookingStatus;
}

export interface BookingSearchParams {
  customerId?: string;
  providerId?: string;
  status?: BookingStatus;
  dateFrom?: Date;
  dateTo?: Date;
  page?: number;
  limit?: number;
}

export interface BookingWithDetails extends Booking {
  service: {
    id: string;
    title: string;
    category: string;
    images: string[];
  };
  customer: {
    id: string;
    fullName: string;
    phone: string;
    avatarUrl?: string;
  };
  provider: {
    id: string;
    businessName: string;
    phone: string;
    avatarUrl?: string;
  };
  payment?: Payment;
  review?: Review;
}