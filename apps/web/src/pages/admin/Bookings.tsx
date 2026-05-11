import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';

interface Booking {
  id: string;
  service: { title: string };
  customer: { fullName: string };
  provider: { businessName: string };
  eventDate: string;
  totalAmount: number;
  status: string;
}

export const AdminBookings: React.FC = () => {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const response = await api.get('/admin/bookings');
      return response.data;
    },
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

      <div className="mb-4">
        <Input placeholder="Search bookings..." className="max-w-sm" />
      </div>

      <div className="space-y-4">
        {bookings?.map((booking) => (
          <Card key={booking.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{booking.service.title}</h3>
                  <p className="text-sm text-gray-600">Customer: {booking.customer.fullName}</p>
                  <p className="text-sm text-gray-600">Provider: {booking.provider.businessName}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${statusColors[booking.status]}`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-sm">
                  <p>Event: {formatDate(booking.eventDate)}</p>
                </div>
                <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};