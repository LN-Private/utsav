import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Rating } from '@/components/ui/Rating';
import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import api from '@/lib/api';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  customer: { fullName: string };
  provider: { businessName: string };
  service: { title: string };
  createdAt: string;
}

export const AdminReviews: React.FC = () => {
  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      const response = await api.get('/admin/reviews');
      return response.data;
    },
  });

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Reviews</h1>

      <div className="mb-4">
        <Input placeholder="Search reviews..." className="max-w-sm" />
      </div>

      <div className="space-y-4">
        {reviews?.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{review.customer.fullName}</h3>
                  <p className="text-sm text-gray-600">
                    {review.provider.businessName} - {review.service.title}
                  </p>
                </div>
                <Rating rating={review.rating} />
              </div>

              <p className="text-gray-700 mb-3">{review.comment}</p>
              <p className="text-xs text-gray-500">{formatDate(review.createdAt)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};