import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '@/pages/customer/Home';
import { Login } from '@/pages/customer/Login';
import { Register } from '@/pages/customer/Register';
import { Services } from '@/pages/customer/Services';
import { ServiceDetail } from '@/pages/customer/ServiceDetail';
import { Dashboard as CustomerDashboard } from '@/pages/customer/Dashboard';
import { Profile } from '@/pages/customer/Profile';
import { BookingFlow } from '@/pages/customer/BookingFlow';
import { ProviderRegister } from '@/pages/provider/Register';
import { ProviderDashboard } from '@/pages/provider/Dashboard';
import { ProviderServices } from '@/pages/provider/Services';
import { ProviderBookings } from '@/pages/provider/Bookings';
import { ProviderEarnings } from '@/pages/provider/Earnings';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminUsers } from '@/pages/admin/Users';
import { AdminProviders } from '@/pages/admin/Providers';
import { AdminBookings } from '@/pages/admin/Bookings';
import { AdminReviews } from '@/pages/admin/Reviews';
import { useAuthStore } from '@/lib/store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('customer' | 'provider' | 'admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/services" element={<Services />} />
      <Route path="/services/:id" element={<ServiceDetail />} />

      {/* Customer protected routes */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/profile"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/book/:serviceId"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <BookingFlow />
          </ProtectedRoute>
        }
      />

      {/* Provider routes */}
      <Route path="/provider/register" element={<ProviderRegister />} />
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/services"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderServices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/bookings"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/earnings"
        element={
          <ProtectedRoute allowedRoles={['provider']}>
            <ProviderEarnings />
          </ProtectedRoute>
        }
      />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/providers"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminProviders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReviews />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<div className="py-8 text-center">Page not found</div>} />
    </Routes>
  );
};