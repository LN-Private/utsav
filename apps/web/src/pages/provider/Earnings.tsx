import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';

interface EarningsData {
  totalEarnings: number;
  pendingPayout: number;
  completedBookings: number;
  monthlyEarnings: { month: string; amount: number }[];
}

export const ProviderEarnings: React.FC = () => {
  const { data: earnings, isLoading } = useQuery<EarningsData>({
    queryKey: ['earnings'],
    queryFn: async () => {
      const response = await api.get('/providers/earnings');
      return response.data;
    },
  });

  if (isLoading) return <div className="py-8">Loading...</div>;

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Earnings Overview</h1>

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

      <Card>
        <CardHeader>
          <CardTitle>Monthly Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings?.monthlyEarnings.map((month) => (
              <div key={month.month} className="flex justify-between items-center">
                <span>{month.month}</span>
                <span className="font-medium">{formatCurrency(month.amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};