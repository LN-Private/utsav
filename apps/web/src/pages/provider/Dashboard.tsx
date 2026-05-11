import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

interface EarningsData {
  totalEarnings: number;
  pendingPayout: number;
  completedBookings: number;
}

interface Booking {
  id: string;
  service: { title: string };
  eventDate: string;
  totalAmount: number;
  status: string;
}

export const ProviderDashboard: React.FC = () => {
  const { data: earnings } = useQuery<EarningsData>({
    queryKey: ['earnings'],
    queryFn: async () => {
      const response = await api.get('/providers/earnings');
      return response.data;
    },
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ['provider-bookings'],
    queryFn: async () => {
      const response = await api.get('/providers/bookings');
      return response.data;
    },
  });

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Provider Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(earnings?.totalEarnings || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(earnings?.pendingPayout || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{earnings?.completedBookings || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Recent Bookings</h2>
        <Button asChild>
          <Link to="/provider/bookings">View All</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {bookings?.slice(0, 5).map((booking) => (
          <Card key={booking.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{booking.service.title}</h3>
                  <p className="text-sm text-gray-600">Event: {booking.eventDate}</p>
                  <p className="text-sm font-medium">{formatCurrency(booking.totalAmount)}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {booking.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};