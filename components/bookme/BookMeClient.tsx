"use client";

import { useMemo, useState } from 'react';
import BookingModal from '@/components/booking/BookingModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import Header from '@/components/layout/Header';
import PropertyCard from '@/components/property/PropertyCard'; // Import PropertyCard
import Link from 'next/link';

export default function BookMeClient({ properties }: { properties: any[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);

  const openBooking = (p: any) => {
    setSelectedProperty(p);
    setModalOpen(true);
  };

  const lahore = useMemo(() => (properties || []).filter((p: any) => String(p.city || '').toLowerCase().includes('lahore')), [properties]);
  const islamabad = useMemo(() => (properties || []).filter((p: any) => String(p.city || '').toLowerCase().includes('islamabad')), [properties]);

  if (!properties) return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="py-20"><LoadingSpinner /></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <header className="relative bg-white/0 backdrop-blur-sm py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold">Find places to stay — Book instantly</h1>
            <p className="text-gray-600 mt-2">Popular stays, curated for you.</p>
            <div className="mt-4">
              <Link href="/user/bookings" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium">
                My Bookings
              </Link>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <div className="w-full md:w-3/4 lg:w-2/3">
              <div className="flex items-center bg-white rounded-full shadow-lg px-4 py-3">
                <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                  <div>
                    <label className="text-xs text-gray-500">Where</label>
                    <input placeholder="Search destinations" className="w-full outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">When</label>
                    <input placeholder="Add dates" className="w-full outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Who</label>
                    <input placeholder="Add guests" className="w-full outline-none text-sm" />
                  </div>
                </div>

                <button className="ml-4 bg-pink-500 hover:bg-pink-600 text-white rounded-full px-4 py-2">🔍</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <>
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Popular homes in Lahore</h2>
              <a className="text-sm text-gray-600">Show all</a>
            </div>

            <div className="-mx-2 overflow-x-auto pb-2">
              <div className="flex gap-4 px-2">
                {/* Use PropertyCard component */}
                {(lahore.length ? lahore : properties || []).slice(0, 10).map((p: any) => (
                  <div key={p.id} className="w-72 flex-shrink-0">
                    <PropertyCard property={p} onBookClick={() => openBooking(p)} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Available in Islamabad this weekend</h2>
              <a className="text-sm text-gray-600">Show all</a>
            </div>

            <div className="-mx-2 overflow-x-auto pb-2">
              <div className="flex gap-4 px-2">
                {(islamabad.length ? islamabad : properties || []).slice(0, 10).map((p: any) => (
                  <div key={p.id} className="w-72 flex-shrink-0">
                    <PropertyCard property={p} onBookClick={() => openBooking(p)} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>

        <BookingModal open={modalOpen} onOpenChange={setModalOpen} propertyId={selectedProperty?.id || null} propertyTitle={selectedProperty?.title} />
      </main>
    </div>
  );
}
