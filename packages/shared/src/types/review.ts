// Review types for Utsav marketplace

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  rating: number; // 1-5
  comment?: string;
  images?: string[];
  isVerified: boolean; // Verified if from completed booking
  providerResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateReviewInput {
  bookingId: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  rating: number;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
  images?: string[];
  providerResponse?: string;
}

export interface ReviewSearchParams {
  providerId?: string;
  serviceId?: string;
  customerId?: string;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}