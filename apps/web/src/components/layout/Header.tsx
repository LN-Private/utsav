import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Menu, X, User, LogOut } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white border-b sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-nepal-red">Utsav</span>
            <span className="text-sm text-gray-600 hidden sm:inline">Nepal Ceremony Marketplace</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/services" className="text-gray-700 hover:text-nepal-red">
              Services
            </Link>
            {isAuthenticated && user?.role === 'customer' && (
              <Link to="/customer/dashboard" className="text-gray-700 hover:text-nepal-red">
                Dashboard
              </Link>
            )}
            {isAuthenticated && user?.role === 'provider' && (
              <Link to="/provider/dashboard" className="text-gray-700 hover:text-nepal-red">
                Provider Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700 hidden sm:inline">
                  {user?.fullName}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-nepal-red"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </div>
            )}

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link
                to="/services"
                className="text-gray-700 hover:text-nepal-red"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              {isAuthenticated && user?.role === 'customer' && (
                <Link
                  to="/customer/dashboard"
                  className="text-gray-700 hover:text-nepal-red"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              {isAuthenticated && user?.role === 'provider' && (
                <Link
                  to="/provider/dashboard"
                  className="text-gray-700 hover:text-nepal-red"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Provider Dashboard
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};