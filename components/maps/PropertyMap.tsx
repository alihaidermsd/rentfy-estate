'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Image from 'next/image';
import Link from 'next/link';

// Fix for default marker icon not showing
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
  iconUrl: 'leaflet/images/marker-icon.png',
  shadowUrl: 'leaflet/images/marker-shadow.png',
});

// Define the structure for a property with location
interface MapProperty {
  id: string;
  title: string;
  category: string;
  rentPrice?: number;
  price?: number;
  city: string;
  state: string;
  images: string[];
  latitude: number;
  longitude: number;
}

interface InteractivePropertyMapProps {
  properties: MapProperty[];
  initialCenter?: [number, number];
  zoom?: number;
  className?: string; // Add className prop for custom styling
}

export function PropertyMap({
  properties,
  initialCenter = [40.7128, -74.0060], // Default to New York City
  zoom = 13,
  className = 'w-full h-[500px]' // Default class for hero section height
}: InteractivePropertyMapProps) {
  if (typeof window === 'undefined') {
    return (
      <div className={`${className} bg-muted rounded-lg flex items-center justify-center`}>
        <p className="text-muted-foreground">Map loading...</p>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden z-0`}> {/* Ensure z-0 to avoid issues with other elements */}
      <MapContainer center={initialCenter} zoom={zoom} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property) => (
          property.latitude && property.longitude && (
            <Marker key={property.id} position={[property.latitude, property.longitude]}>
              <Popup>
                <div className="flex flex-col gap-2 p-1 min-w-[180px]">
                  {property.images && property.images.length > 0 && (
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      width={200}
                      height={120}
                      style={{ objectFit: 'cover' }}
                      className="rounded-md"
                    />
                  )}
                  <h3 className="font-semibold text-lg">{property.title}</h3>
                  <p className="text-sm text-gray-600">{property.city}, {property.state}</p>
                  <p className="font-bold text-blue-600">
                    {property.category === 'RENT'
                      ? `$${property.rentPrice?.toLocaleString()}/month`
                      : `$${property.price?.toLocaleString()}`}
                  </p>
                  <Link href={`/properties/${property.id}`} className="text-blue-500 hover:underline text-sm">
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}
