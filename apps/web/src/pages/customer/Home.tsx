import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { SERVICE_CATEGORIES } from '@utsav/shared';
import { formatCurrency } from '@/lib/utils';

export const Home: React.FC = () => {
  return (
    <div className="space-y-12 py-8">
      <section className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Nepal's <span className="text-nepal-red">First</span> Ceremony Marketplace
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Connect with trusted photographers, caterers, decorators, and more for your special
          occasions
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link to="/services">Browse Services</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/register">Join as Provider</Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Our Service Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((category) => (
            <Link key={category.id} to={`/services?category=${category.slug}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <h3 className="font-semibold">{category.name}</h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 -mx-4 px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose Utsav?</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="text-4xl mb-3">✓</div>
              <h3 className="font-semibold mb-2">Verified Providers</h3>
              <p className="text-gray-600">All service providers are verified and rated</p>
            </div>
            <div>
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Pay safely with eSewa, Khalti, or cash</p>
            </div>
            <div>
              <div className="text-4xl mb-3">📱</div>
              <h3 className="font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">Book services in just a few clicks</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};