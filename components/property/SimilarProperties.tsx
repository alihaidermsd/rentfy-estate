'use client'

import { useState, useEffect } from 'react';
import { PropertyGrid } from './PropertyGrid';
import { Property } from '@/hooks/useProperties'; // Assuming Property is exported from here

export function SimilarProperties() {
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarProperties = async () => {
      try {
        setLoading(true);
        // For now, fetch some general properties.
        // In a real app, this would be based on the current property's characteristics.
        const response = await fetch('/api/properties?limit=4'); // Fetch 4 properties
        const result = await response.json();

        if (result.success) {
          setSimilarProperties(result.data);
        } else {
          setError(result.error || 'Failed to fetch similar properties');
        }
      } catch (err) {
        setError('Failed to fetch similar properties');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarProperties();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Similar Properties</h2>
        <p>Loading similar properties...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Similar Properties</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (similarProperties.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Similar Properties</h2>
        <p>No similar properties found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Similar Properties</h2>
      <PropertyGrid properties={similarProperties} />
    </div>
  );
}