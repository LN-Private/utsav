// Service types for Utsav marketplace
// Categories: photographers, caterers, decorators, tent suppliers, venues, bands

export type ServiceCategorySlug = 
  | 'photographer'
  | 'caterer'
  | 'decorator'
  | 'tent-supplier'
  | 'venue'
  | 'band'
  | 'dj'
  | 'makeup-artist'
  | 'flower-decorator'
  | 'mehndi-artist';

export interface ServiceCategory {
  id: string;
  name: string;
  slug: ServiceCategorySlug;
  icon?: string;
  description?: string;
  parentId?: string;
  sortOrder: number;
  isActive: boolean;
}

export type PriceType = 'fixed' | 'per-person' | 'per-hour' | 'package';

export interface Service {
  id: string;
  providerId: string;
  categoryId: string;
  title: string;
  description?: string;
  priceMin: number;
  priceMax: number;
  priceType: PriceType;
  images: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServicePackage {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  price: number;
  features: string[];
  isPopular: boolean;
}

export interface CreateServiceInput {
  providerId: string;
  categoryId: string;
  title: string;
  description?: string;
  priceMin: number;
  priceMax: number;
  priceType: PriceType;
  images?: string[];
}

export interface UpdateServiceInput {
  title?: string;
  description?: string;
  priceMin?: number;
  priceMax?: number;
  priceType?: PriceType;
  images?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface ServiceSearchParams {
  category?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  query?: string;
  sortBy?: 'price' | 'rating' | 'distance' | 'newest';
  page?: number;
  limit?: number;
}