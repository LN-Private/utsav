import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

interface Service {
  id: string;
  title: string;
  priceMin: number;
  priceMax: number;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
}

export const ProviderServices: React.FC = () => {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['my-services'],
    queryFn: async () => {
      const response = await api.get('/services/my');
      return response.data;
    },
  });

  if (isLoading) return <div className="py-8">Loading...</div>;

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Services</h1>
        <Button asChild>
          <Link to="/provider/services/new">Add New Service</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {services && services.length > 0 ? (
          services.map((service) => (
            <Card key={service.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{service.title}</h3>
                    <p className="text-nepal-red font-medium">
                      {formatCurrency(service.priceMin)} - {formatCurrency(service.priceMax)}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {service.isFeatured && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/provider/services/${service.id}/edit`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No services yet</p>
            <Button asChild>
              <Link to="/provider/services/new">Create Your First Service</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};