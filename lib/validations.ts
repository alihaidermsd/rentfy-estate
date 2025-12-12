import { z } from 'zod';

// ========== PROPERTY SCHEMAS ==========

export const propertyCreateSchema = z.object({
  // Basic Information
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 'OFFICE', 'RETAIL', 'INDUSTRIAL', 'LAND', 'OTHER']),
  category: z.enum(['RENT', 'SALE']),
  purpose: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL']),
  
  // Pricing
  price: z.number().min(0).optional().nullable(),
  rentPrice: z.number().min(0).optional().nullable(),
  bookingPrice: z.number().min(0).optional().nullable(),
  securityDeposit: z.number().min(0).optional().nullable(),
  currency: z.string().default('USD'),
  pricePerSqft: z.number().min(0).optional().nullable(),
  maintenanceFee: z.number().min(0).optional().nullable(),
  
  // Location
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zipCode: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  
  // Property Details
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  area: z.number().min(1, 'Area must be greater than 0'),
  areaUnit: z.enum(['SQFT', 'SQM', 'ACRES']).default('SQFT'),
  yearBuilt: z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
  parkingSpaces: z.number().int().min(0).optional().nullable(),
  floors: z.number().int().min(1).optional().nullable(),
  floorNumber: z.number().int().min(0).optional().nullable(),
  furnished: z.boolean().optional().nullable(),
  petFriendly: z.boolean().optional().nullable(),
  amenities: z.array(z.string()).optional(),
  utilitiesIncluded: z.boolean().optional(),
  
  // Booking Details (for rental properties)
  minStay: z.number().int().min(1).optional().nullable(),
  maxStay: z.number().int().min(1).optional().nullable(),
  availableFrom: z.string().optional().nullable(),
  instantBook: z.boolean().optional(),
  checkInTime: z.string().optional().nullable(),
  checkOutTime: z.string().optional().nullable(),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT', 'SUPER_STRICT']).optional().nullable(),
  
  // Media
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional().nullable(),
  virtualTour: z.string().optional().nullable(),
  floorPlan: z.string().optional().nullable(),
  documents: z.string().optional().nullable(),
  
  // Status
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'SOLD', 'RENTED']).default('DRAFT'),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  featuredUntil: z.string().optional().nullable(),
  
  // Relations
  agentId: z.string().optional().nullable(),
  developerId: z.string().optional().nullable(),
  
  // Metadata
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  keywords: z.array(z.string()).optional().nullable(),
}).refine(
  (data) => {
    // Ensure price is provided based on category
    if (data.category === 'RENT') {
      return data.rentPrice !== undefined && data.rentPrice !== null && data.rentPrice > 0;
    } else if (data.category === 'SALE') {
      return data.price !== undefined && data.price !== null && data.price > 0;
    }
    return true;
  },
  {
    message: 'Price is required for this category',
    path: ['category'],
  }
);

export const propertyUpdateSchema = propertyCreateSchema.partial();

// ========== QUERY SCHEMAS ==========

export const propertyQuerySchema = z.object({
  page: z.string().optional().default('1').transform(val => {
    const num = Number(val);
    return isNaN(num) ? 1 : Math.max(1, num);
  }),
  limit: z.string().optional().default('20').transform(val => {
    const num = Number(val);
    return isNaN(num) ? 20 : Math.max(1, Math.min(num, 100));
  }),
  type: z.string().optional(),
  category: z.string().optional(),
  purpose: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  minPrice: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : Math.max(0, num);
  }),
  maxPrice: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : Math.max(0, num);
  }),
  minRent: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : Math.max(0, num);
  }),
  maxRent: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : Math.max(0, num);
  }),
  bedrooms: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : Math.max(0, num);
  }),
  bathrooms: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : Math.max(0, num);
  }),
  minArea: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : Math.max(0, num);
  }),
  maxArea: z.string().optional().transform(val => {
    const num = Number(val);
    return isNaN(num) ? undefined : Math.max(0, num);
  }),
  furnished: z.string().optional().transform(val => val === 'true'),
  petFriendly: z.string().optional().transform(val => val === 'true'),
  featured: z.string().optional().transform(val => val === 'true'),
  verified: z.string().optional().transform(val => val === 'true'),
  status: z.string().optional(),
  userId: z.string().optional(),
  agentId: z.string().optional(),
  developerId: z.string().optional(),
  sortBy: z.enum(['price', 'rentPrice', 'area', 'createdAt', 'views']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional(),
});

// ========== USER SCHEMAS ==========

export const userCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  role: z.enum(['USER', 'OWNER', 'AGENT', 'DEVELOPER', 'ADMIN', 'SUPER_ADMIN']).default('USER'),
});

export const userUpdateSchema = userCreateSchema.partial();

// ========== AUTH SCHEMAS ==========

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Schema for the frontend registration form
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ========== BOOKING SCHEMAS ==========

export const bookingCreateSchema = z.object({
  propertyId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  guests: z.number().int().min(1),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  guestAddress: z.string().optional(),
  specialRequests: z.string().optional(),
});

// ========== TYPE INFERENCES ==========

export type PropertyCreateInput = z.infer<typeof propertyCreateSchema>;
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>;
export type PropertyQueryInput = z.infer<typeof propertyQuerySchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>; // Add this new type inference
export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

export const fileSchema = z.object({
  url: z.string().url('Invalid URL format').optional(), // Make URL optional
  type: z.string().min(1, 'File type is required'),
  size: z.number().min(1, 'File size must be greater than 0'),
});

export type FileInput = z.infer<typeof fileSchema>;