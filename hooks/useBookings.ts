import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { bookingCreateSchema } from "@/lib/validations";

type Booking = z.infer<typeof bookingCreateSchema> & {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  userId: string;
  propertyId: string;
  totalAmount: number;
};

export const useBookings = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 10,
  });

  // Fetch bookings
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/bookings?${queryParams}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      return data as {
        bookings: Booking[];
        total: number;
        page: number;
        totalPages: number;
      };
    },
  });

  // Create booking mutation
  const createBooking = useMutation({
    mutationFn: async (bookingData: z.infer<typeof bookingCreateSchema>) => {
      bookingCreateSchema.parse(bookingData);

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create booking");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  // Update booking status mutation
  const updateBookingStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Booking["status"] }) => {
      const response = await fetch(`/api/bookings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update booking status");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  // Cancel booking mutation
  const cancelBooking = useMutation({
    mutationFn: async (id: string) => {
      return updateBookingStatus.mutateAsync({ id, status: "CANCELLED" });
    },
  });



  // Check date availability
  const checkAvailability = useCallback(async (propertyId: string, dates: { checkIn: string; checkOut: string }) => {
    const response = await fetch(`/api/properties/${propertyId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dates),
    });

    if (!response.ok) {
      throw new Error("Failed to check availability");
    }

    return response.json();
  }, []);

  return {
    // State
    bookings: bookings?.bookings || [],
    total: bookings?.total || 0,
    currentPage: bookings?.page || 1,
    totalPages: bookings?.totalPages || 0,
    isLoading,
    error: error as Error,
    filters,

    // Actions
    setFilters: (newFilters: Partial<typeof filters>) => 
      setFilters(prev => ({ ...prev, ...newFilters })),

    // Mutations
    createBooking: {
      mutate: createBooking.mutate,
      mutateAsync: createBooking.mutateAsync,
      isLoading: createBooking.isPending,
      error: createBooking.error,
    },
    updateBookingStatus: {
      mutate: updateBookingStatus.mutate,
      mutateAsync: updateBookingStatus.mutateAsync,
      isLoading: updateBookingStatus.isPending,
      error: updateBookingStatus.error,
    },
    cancelBooking: {
      mutate: cancelBooking.mutate,
      mutateAsync: cancelBooking.mutateAsync,
      isLoading: cancelBooking.isPending,
      error: cancelBooking.error,
    },

    // Utilities
    checkAvailability,
  };
};