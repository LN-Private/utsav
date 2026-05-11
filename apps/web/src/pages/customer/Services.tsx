import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { SERVICE_CATEGORIES } from '@utsav/shared';
import { formatCurrency, getServiceCategoryIcon } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Service {
  id: string;
  title: string;
  description?: string;
  priceMin: number;
  priceMax: number;
  priceType: string;
  rating: number;
  reviewCount: number;
  provider: {
    businessName: string;
    verified: boolean;
  };
  images: string[];
}

export const Services: React.FC = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['services', category],
    queryFn: async () => {
      const response = await api.get('/services', { params: { category } });
      return response.data;
    },
  });

  const categoriesWithAll = [{ id: 'all', name: 'All Services', slug: 'all', icon: '📦' }, ...SERVICE_CATEGORIES];

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Our Services</h1>

      <div className="flex overflow-x-auto gap-2 pb-4 mb-6">
        {categoriesWithAll.map((cat) => (
          <Link
            key={cat.id}
            to={`/services?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              category === cat.slug || (!category && cat.slug === 'all')
                ? 'bg-nepal-red text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200" />
              <CardContent className="pt-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services?.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                {service.images[0] && (
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <p className="text-sm text-gray-600">{service.provider.businessName}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <Rating rating={service.rating} />
                  <span className="text-sm text-gray-500">({service.reviewCount} reviews)</span>
                </div>
                <p className="font-semibold text-nepal-red mb-3">
                  {formatCurrency(service.priceMin)} - {formatCurrency(service.priceMax)}
                </p>
                <Button asChild className="w-full">
                  <Link to={`/services/${service.id}`}>View Details</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};