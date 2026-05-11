import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface Provider {
  id: string;
  businessName: string;
  fullName: string;
  email: string;
  phone: string;
  verified: boolean;
  isActive: boolean;
  rating: number;
}

export const AdminProviders: React.FC = () => {
  const { data: providers, isLoading } = useQuery<Provider[]>({
    queryKey: ['admin-providers'],
    queryFn: async () => {
      const response = await api.get('/admin/providers');
      return response.data;
    },
  });

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Providers</h1>

      <div className="mb-4">
        <Input placeholder="Search providers..." className="max-w-sm" />
      </div>

      <div className="space-y-4">
        {providers?.map((provider) => (
          <Card key={provider.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{provider.businessName}</h3>
                  <p className="text-sm text-gray-600">{provider.fullName}</p>
                  <p className="text-sm text-gray-600">{provider.email}</p>
                  <p className="text-sm text-gray-600">{provider.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  {provider.verified && (
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Verified
                    </span>
                  )}
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      provider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {provider.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};