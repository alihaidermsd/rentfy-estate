'use client';

import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Property Buyer',
    content: 'Found my dream home in just 2 weeks! The process was smooth and transparent.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Property Owner',
    content: 'Rented out my apartment quickly with great tenants. Highly recommended!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  },
  {
    id: 3,
    name: 'Emma Williams',
    role: 'Real Estate Investor',
    content: 'The analytics and market insights helped me make smart investment decisions.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
  },
];

export default function Testimonials() {
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Join thousands of satisfied customers who found their perfect property
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-gray-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                  />
                ))}
              </div>
              <p className="text-gray-300">{testimonial.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}