import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { SERVICE_CATEGORIES } from '@utsav/shared';
import { validateNepaliPhone } from '@/lib/utils';
import { useAuthStore } from '@/lib/store';

interface ProviderRegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  businessName: string;
  categoryId: string;
  description?: string;
  location?: string;
}

export const ProviderRegister: React.FC = () => {
  const { register: registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProviderRegisterForm>();

  const onSubmit = async (data: ProviderRegisterForm) => {
    try {
      await registerUser({
        email: data.email,
        phone: data.phone,
        password: data.password,
        fullName: data.fullName,
        role: 'provider',
        businessName: data.businessName,
        categoryId: data.categoryId,
      });
      navigate('/provider/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Become a Provider</h1>
      <p className="text-gray-600 mb-8 text-center">
        Join Utsav and start offering your ceremony services
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <Input
                {...register('fullName', { required: 'Full name is required' })}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                })}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone (+977)</label>
              <Input
                {...register('phone', {
                  required: 'Phone is required',
                  validate: (value) => validateNepaliPhone(value) || 'Invalid Nepali phone number',
                })}
                placeholder="+977 98XXXXXXXX"
              />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                })}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
          </div>
        </div>

        <div className="border-b pb-4">
          <h2 className="text-lg font-semibold mb-4">Business Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Business Name</label>
              <Input
                {...register('businessName', { required: 'Business name is required' })}
                placeholder="Your Business Name"
              />
              {errors.businessName && (
                <p className="text-sm text-red-500">{errors.businessName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Category</label>
              <select
                {...register('categoryId', { required: 'Category is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a category</option>
{SERVICE_CATEGORIES.map((cat: { id: string; name: string; icon: string }) => (
                   <option key={cat.id} value={cat.id}>
                     {cat.icon} {cat.name}
                   </option>
                 ))}
              </select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location</label>
              <Input
                {...register('location')}
                placeholder="Kathmandu"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                {...register('description')}
                placeholder="Tell us about your services..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Register as Provider'}
        </Button>
      </form>

      <p className="text-center mt-4 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-nepal-red hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};