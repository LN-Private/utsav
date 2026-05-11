import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
}

export const AdminUsers: React.FC = () => {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data;
    },
  });

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      <div className="mb-4">
        <Input placeholder="Search users..." className="max-w-sm" />
      </div>

      <div className="space-y-4">
        {users?.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{user.fullName}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">{user.phone}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded">{user.role}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
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