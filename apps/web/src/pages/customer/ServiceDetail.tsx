import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Rating } from '@/components/ui/Rating';
import { formatCurrency } from '@/lib/utils';
import { getServiceCategoryIcon } from '@/lib/utils';
import api from '@/lib/api';

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: service, isLoading } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const response = await api.get(`/services/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="py-8">Loading...</div>;
  }

  if (!service) {
    return <div className="py-8">Service not found</div>;
  }

  return (
    <div className="py-8">
      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="h-96 bg-gray-200 rounded-lg overflow-hidden mb-4">
            {service.images?.[selectedImage] && (
              <img
                src={service.images[selectedImage]}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {service.images && service.images.length > 1 && (
            <div className="flex gap-2">
              {service.images.map((img: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded border-2 ${
                    selectedImage === index ? 'border-nepal-red' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt={`${service.title} ${index + 1}`} className="w-full h-full object-cover rounded" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
          <p className="text-xl text-nepal-red font-semibold mb-4">
            {formatCurrency(service.priceMin)} - {formatCurrency(service.priceMax)}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <Rating rating={service.rating || 0} />
            <span className="text-gray-600">{service.reviewCount || 0} reviews</span>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Provider</h3>
            <p>{service.provider?.businessName}</p>
            {service.provider?.verified && (
              <span className="text-green-600 text-sm">✓ Verified Provider</span>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-600">{service.description || 'No description available'}</p>
          </div>

          <Button size="lg" className="w-full" asChild>
            <Link to={`/customer/book/${id}`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};