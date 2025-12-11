import { z } from "zod";

// Booking Status
export type BookingStatus = 
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "REFUNDED"
  | "EXPIRED";

// Booking Schemas
export const bookingSchema = {
  create: z.object({
    propertyId: z.string().min(1, "Property ID is required"),
    checkIn: z.string().datetime("Invalid check-in date"),
    checkOut: z.string().datetime("Invalid check-out date"),
    guests: z.number().int().positive("Number of guests must be positive"),
    specialRequests: z.string().max(500, "Special requests too long").optional(),
    paymentMethod: z.enum(["CARD", "PAYPAL", "BANK_TRANSFER"]),
    guestInfo: z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email address"),
      phone: z.string().min(1, "Phone number is required"),
      address: z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().min(1, "State is required"),
        zipCode: z.string().min(1, "ZIP code is required"),
        country: z.string().min(1, "Country is required"),
      }).optional(),
    }),
  }),

  update: z.object({
    checkIn: z.string().datetime().optional(),
    checkOut: z.string().datetime().optional(),
    guests: z.number().int().positive().optional(),
    specialRequests: z.string().max(500).optional(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REFUNDED", "EXPIRED"]).optional(),
  }),

  search: z.object({
    userId: z.string().optional(),
    propertyId: z.string().optional(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REFUNDED", "EXPIRED"]).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
    sortBy: z.enum(["createdAt", "checkIn", "totalAmount"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
};

// Booking Types
export type BookingCreateInput = z.infer<typeof bookingSchema.create>;
export type BookingUpdateInput = z.infer<typeof bookingSchema.update>;
export type BookingSearchInput = z.infer<typeof bookingSchema.search>;

// Booking Interface
export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  nights: number;
  basePrice: number;
  serviceFee: number;
  taxes: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  specialRequests?: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  paymentIntentId?: string;
  cancellationReason?: string;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Populated fields (optional)
  property?: {
    id: string;
    title: string;
    images: string[];
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Booking Response Types
export interface BookingResponse {
  booking: Booking;
}

export interface BookingsResponse {
  bookings: Booking[];
  total: number;
  page: number;
  totalPages: number;
}

// Booking Summary
export interface BookingSummary {
  property: {
    title: string;
    images: string[];
    location: {
      city: string;
      country: string;
    };
  };
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  basePrice: number;
  serviceFee: number;
  taxes: number;
  totalAmount: number;
  currency: string;
}

// Booking Statistics
export interface BookingStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
}

// Cancellation Policy
export interface CancellationPolicy {
  id: string;
  name: string;
  description: string;
  refundPercentage: number;
  hoursBeforeCheckIn: number;
}

// Booking Availability
export interface BookingAvailability {
  available: boolean;
  conflictingBookings?: Booking[];
  message?: string;
}