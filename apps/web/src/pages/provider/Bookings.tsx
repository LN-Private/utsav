import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '@/lib/utils';
import api from '@/lib/api';

interface Booking {
  id: string;
  customer: { fullName: string; phone: string };
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  totalAmount: number;
  status: string;
}

export const ProviderBookings: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery<Booking[]>({
    queryKey: ['provider-bookings'],
    queryFn: async () => {
      const response = await api.get('/providers/bookings');
      return response.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/bookings/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
    },
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  if (isLoading) return <div className="py-8">Loading...</div>;

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Bookings</h1>

      <div className="space-y-4">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{booking.customer.fullName}</h3>
                    <p className="text-sm text-gray-600">{booking.customer.phone}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${statusColors[booking.status]}`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Event Date:</strong> {formatDate(booking.eventDate)}
                  </div>
                  <div>
                    <strong>Location:</strong> {booking.eventLocation}
                  </div>
                  <div>
                    <strong>Guests:</strong> {booking.guestCount}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="font-medium">{formatCurrency(booking.totalAmount)}</span>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
};