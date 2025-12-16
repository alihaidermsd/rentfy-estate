
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  propertyCreateSchema,
  propertyQuerySchema,
} from '@/lib/validations';
import { z } from 'zod';

// Extend the base property schema to include fields added by the API
// Use merge instead of extend since propertyCreateSchema has refinements
const apiPropertySchema = propertyCreateSchema.merge(z.object({
  id: z.string(), // Add the ID field as it's returned from the API
  averageRating: z.number().nullable(),
  totalReviews: z.number(),
  isFavorite: z.boolean(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    image: z.string().nullable(),
  }),
}));

// Define the type for a single property returned by the API
export type Property = z.infer<typeof apiPropertySchema>;

// Define the type for the API response
type ApiResponse = {
  success: boolean;
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

// Define the type for the search filters
type PropertySearchFilters = z.infer<typeof propertyQuerySchema>;

export const useProperties = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<PropertySearchFilters>({
    page: 1,
    limit: 12,
    type: undefined,
    category: undefined,
    purpose: undefined,
    city: undefined,
    state: undefined,
    country: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minRent: undefined,
    maxRent: undefined,
    bedrooms: undefined,
    bathrooms: undefined,
    minArea: undefined,
    maxArea: undefined,
    furnished: false,
    petFriendly: false,
    featured: false,
    verified: false,
    status: undefined,
    userId: undefined,
    agentId: undefined,
    developerId: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    search: undefined,
  });

  // Fetch properties with search and filters
  const {
    data: queryData,
    isLoading,
    error,
    refetch,
  } = useQuery<ApiResponse>({
    queryKey: ['properties', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      const response = await fetch(`/api/properties?${queryParams}`);

      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();

      // Map API response to expected property shape without strict validation
      const safeData = (data.data || []).map((p: any) => ({
        ...p,
        // normalize favorited flag name
        isFavorite: p.isFavorite ?? p.isFavorited ?? false,
        // ensure images/amenities arrays
        images: typeof p.images === 'string' ? p.images.split(',').filter((s: string) => s.trim()) : Array.isArray(p.images) ? p.images : [],
        amenities: typeof p.amenities === 'string' ? p.amenities.split(',').filter((s: string) => s.trim()) : Array.isArray(p.amenities) ? p.amenities : [],
      }));

      // Return a normalized response object compatible with the rest of the app
      return {
        success: data.success,
        data: safeData,
        pagination: data.pagination || { page: 1, limit: 20, total: safeData.length, pages: 1 },
      } as ApiResponse;
    },
  });

  // Create property mutation
  const createProperty = useMutation({
    mutationFn: async (
      propertyData: z.infer<typeof propertyCreateSchema> // Use propertyCreateSchema
    ) => {
      // Validate input data before sending
      propertyCreateSchema.parse(propertyData); // Use propertyCreateSchema

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create property');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  // Update property mutation
  const updateProperty = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Property> }) => {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update property');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  // Delete property mutation
  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/properties/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete property');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  // Filter and pagination methods
  const updateFilters = useCallback((newFilters: Partial<PropertySearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  return {
    // State
    properties: queryData?.data || [],
    pagination: queryData?.pagination,
    isLoading,
    error: error as Error | null,
    filters,

    // Actions
    refetch,
    updateFilters,
    setPage,

    // Mutations
    createProperty: {
      mutate: createProperty.mutate,
      mutateAsync: createProperty.mutateAsync,
      isLoading: (createProperty as any).isPending || (createProperty as any).isLoading || false,
      error: createProperty.error as Error | null,
    },
    updateProperty: {
      mutate: updateProperty.mutate,
      mutateAsync: updateProperty.mutateAsync,
      isLoading: (updateProperty as any).isPending || (updateProperty as any).isLoading || false,
      error: updateProperty.error as Error | null,
    },
    deleteProperty: {
      mutate: deleteProperty.mutate,
      mutateAsync: deleteProperty.mutateAsync,
      isLoading: (deleteProperty as any).isPending || (deleteProperty as any).isLoading || false,
      error: deleteProperty.error as Error | null,
    },
  };
};