import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useForm } from 'react-hook-form';
import { formatCurrency } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface BookingForm {
  eventDate: string;
  eventLocation: string;
  guestCount: number;
  specialRequests?: string;
}

export const BookingFlow: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookingForm>();

  const { data: service } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: async () => {
      const response = await api.get(`/services/${serviceId}`);
      return response.data;
    },
    enabled: !!serviceId,
  });

  const onSubmit = (data: BookingForm) => {
    console.log('Booking:', { ...data, serviceId });
  };

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Book Service</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Event Date</label>
                  <Input type="date" {...register('eventDate', { required: 'Date is required' })} />
                  {errors.eventDate && (
                    <p className="text-sm text-red-500">{errors.eventDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Event Location</label>
                  <Input
                    {...register('eventLocation', { required: 'Location is required' })}
                    placeholder="Kathmandu"
                  />
                  {errors.eventLocation && (
                    <p className="text-sm text-red-500">{errors.eventLocation.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Guest Count</label>
                  <Input
                    type="number"
                    {...register('guestCount', { required: 'Guest count is required' })}
                    placeholder="100"
                  />
                  {errors.guestCount && (
                    <p className="text-sm text-red-500">{errors.guestCount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Special Requests</label>
                  <Textarea
                    {...register('specialRequests')}
                    placeholder="Any special requirements..."
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Proceed to Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {service ? (
                <div className="space-y-3">
                  <h3 className="font-semibold">{service.title}</h3>
                  <div className="flex justify-between">
                    <span>Price Range:</span>
                    <span className="font-medium">
                      {formatCurrency(service.priceMin)} - {formatCurrency(service.priceMax)}
                    </span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-nepal-red">{formatCurrency(service.priceMin)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading...</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};