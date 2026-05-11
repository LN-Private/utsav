import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-nepal-red mb-4">Utsav</h3>
            <p className="text-gray-400">Nepal's First Ceremony Service Marketplace</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Customers</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/services" className="hover:text-white">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Providers</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/provider/register" className="hover:text-white">
                  Become a Provider
                </Link>
              </li>
              <li>
                <Link to="/provider/login" className="hover:text-white">
                  Provider Login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li>support@utsav.com.np</li>
              <li>+977-1-5XXXXXX</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Utsav. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};