import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';

interface Booking {
  id: string;
  service: {
    title: string;
  };
  eventDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const response = await api.get('/bookings/my');
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
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{bookings?.length || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatCurrency(
                bookings?.reduce((sum, b) => sum + b.totalAmount, 0) || 0
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {bookings?.filter((b) => new Date(b.eventDate) > new Date()).length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">My Bookings</h2>

      {isLoading ? (
        <div>Loading...</div>
      ) : bookings && bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{booking.service.title}</h3>
                    <p className="text-sm text-gray-600">
                      Event Date: {formatDate(booking.eventDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Amount: {formatCurrency(booking.totalAmount)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${statusColors[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No bookings yet</p>
          <Button asChild>
            <Link to="/services">Browse Services</Link>
          </Button>
        </div>
      )}
    </div>
  );
};