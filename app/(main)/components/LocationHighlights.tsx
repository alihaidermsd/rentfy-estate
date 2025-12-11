'use client';

import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const locations = [
  { id: 1, name: 'Downtown', count: 234, image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000' },
  { id: 2, name: 'Suburban', count: 189, image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785' },
  { id: 3, name: 'Waterfront', count: 156, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' },
  { id: 4, name: 'Historic District', count: 98, image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df' },
];

export default function LocationHighlights() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {locations.map((location) => (
        <Card key={location.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
          <div className="relative h-40">
            <img
              src={location.image}
              alt={location.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <h3 className="font-semibold text-lg">{location.name}</h3>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {location.count} properties
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}