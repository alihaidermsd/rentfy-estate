import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchFilters {
  q?: string;
  type?: string;
  category?: string;
  city?: string;
  state?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  page?: number;
}

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filters, setFilters] = useState<SearchFilters>({
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    city: searchParams.get('city') || '',
    state: searchParams.get('state') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    page: 1
  });

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, value.toString());
      }
    });

    router.push(`/search?${params.toString()}`);
  };

  const resetFilters = () => {
    const resetFilters = {
      q: '',
      type: '',
      category: '',
      city: '',
      state: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      page: 1
    };
    
    setFilters(resetFilters);
    router.push('/search');
  };

  // Update filters when URL changes
  useEffect(() => {
    setFilters({
      q: searchParams.get('q') || '',
      type: searchParams.get('type') || '',
      category: searchParams.get('category') || '',
      city: searchParams.get('city') || '',
      state: searchParams.get('state') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      bedrooms: searchParams.get('bedrooms') || '',
      page: 1
    });
  }, [searchParams]);

  return {
    filters,
    updateFilters,
    resetFilters
  };
}