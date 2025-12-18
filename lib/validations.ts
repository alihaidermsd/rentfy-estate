import { z } from 'zod';

// Validation schemas for property operations
export const propertyQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'price', 'rentPrice', 'views', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  
  // Filters
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 'OFFICE', 'RETAIL', 'INDUSTRIAL', 'LAND', 'OTHER']).optional(),
  category: z.enum(['RENT', 'SALE']).optional(),
  purpose: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'SOLD', 'RENTED']).optional(),
  
  // User filters
  userId: z.string().optional(),
  agentId: z.string().optional(),
  developerId: z.string().optional(),
  
  // Price filters
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRent: z.coerce.number().min(0).optional(),
  maxRent: z.coerce.number().min(0).optional(),
  
  // Property details
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  minArea: z.coerce.number().min(0).optional(),
  maxArea: z.coerce.number().min(0).optional(),
  furnished: z.coerce.boolean().optional(),
  petFriendly: z.coerce.boolean().optional(),
  
  // Search
  search: z.string().optional(),
  
  // Status filters
  featured: z.coerce.boolean().optional(),
  verified: z.coerce.boolean().optional(),
});

export const propertyCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 'OFFICE', 'RETAIL', 'INDUSTRIAL', 'LAND', 'OTHER']),
  category: z.enum(['RENT', 'SALE']),
  purpose: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL']),
  
  // Pricing
  price: z.number().min(0).nullable().optional(),
  rentPrice: z.number().min(0).nullable().optional(),
  bookingPrice: z.number().min(0).nullable().optional(),
  securityDeposit: z.number().min(0).nullable().optional(),
  currency: z.string().default('USD'),
  pricePerSqft: z.number().min(0).nullable().optional(),
  maintenanceFee: z.number().min(0).nullable().optional(),
  
  // Location
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  zipCode: z.string().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  neighborhood: z.string().nullable().optional(),
  landmark: z.string().nullable().optional(),
  
  // Details
  bedrooms: z.number().int().min(0).nullable().optional(),
  bathrooms: z.number().int().min(0).nullable().optional(),
  area: z.number().min(1),
  areaUnit: z.enum(['SQFT', 'SQM', 'ACRES']).default('SQFT'),
  yearBuilt: z.number().int().nullable().optional(),
  parkingSpaces: z.number().int().min(0).nullable().optional(),
  floors: z.number().int().min(1).nullable().optional(),
  floorNumber: z.number().int().min(0).nullable().optional(),
  furnished: z.boolean().default(false),
  petFriendly: z.boolean().default(false),
  amenities: z.array(z.string()).optional(),
  utilitiesIncluded: z.boolean().default(false),
  
  // Booking
  minStay: z.number().int().min(1).nullable().optional(),
  maxStay: z.number().int().min(1).nullable().optional(),
  availableFrom: z.string().nullable().optional(),
  instantBook: z.boolean().default(false),
  checkInTime: z.string().default('14:00'),
  checkOutTime: z.string().default('11:00'),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT', 'SUPER_STRICT']).default('STRICT'),
  
  // Media
  images: z.array(z.string()).min(1),
  videos: z.array(z.string()).optional(),
  virtualTour: z.string().nullable().optional(),
  floorPlan: z.string().nullable().optional(),
  
  // Status
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'SOLD', 'RENTED']).default('DRAFT'),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  
  // Relations
  agentId: z.string().nullable().optional(),
  developerId: z.string().nullable().optional(),
});

export const propertyUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).optional(),
  type: z.enum(['APARTMENT', 'HOUSE', 'VILLA', 'CONDO', 'TOWNHOUSE', 'OFFICE', 'RETAIL', 'INDUSTRIAL', 'LAND', 'OTHER']).optional(),
  category: z.enum(['RENT', 'SALE']).optional(),
  purpose: z.enum(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL']).optional(),
  
  // Pricing
  price: z.number().min(0).optional().nullable(),
  rentPrice: z.number().min(0).optional().nullable(),
  bookingPrice: z.number().min(0).optional().nullable(),
  securityDeposit: z.number().min(0).optional().nullable(),
  currency: z.string().optional(),
  pricePerSqft: z.number().min(0).optional().nullable(),
  maintenanceFee: z.number().min(0).optional().nullable(),
  
  // Location
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  zipCode: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  landmark: z.string().optional().nullable(),
  
  // Details
  bedrooms: z.number().int().min(0).optional().nullable(),
  bathrooms: z.number().int().min(0).optional().nullable(),
  area: z.number().min(1).optional(),
  areaUnit: z.enum(['SQFT', 'SQM', 'ACRES']).optional(),
  yearBuilt: z.number().int().optional().nullable(),
  parkingSpaces: z.number().int().min(0).optional().nullable(),
  floors: z.number().int().min(1).optional().nullable(),
  floorNumber: z.number().int().min(0).optional().nullable(),
  furnished: z.boolean().optional(),
  petFriendly: z.boolean().optional(),
  amenities: z.array(z.string()).optional(),
  utilitiesIncluded: z.boolean().optional(),
  
  // Booking
  minStay: z.number().int().min(1).optional().nullable(),
  maxStay: z.number().int().min(1).optional().nullable(),
  availableFrom: z.string().optional().nullable(),
  instantBook: z.boolean().optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT', 'SUPER_STRICT']).optional().nullable(),
  
  // Media
  images: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional().nullable(),
  virtualTour: z.string().optional().nullable(),
  floorPlan: z.string().optional().nullable(),
  documents: z.string().optional().nullable(),
  
  // Status
  status: z.enum(['DRAFT', 'PUBLISHED', 'UNAVAILABLE', 'SOLD', 'RENTED']).optional(),
  featured: z.boolean().optional(),
  verified: z.boolean().optional(),
  isActive: z.boolean().optional(),
  featuredUntil: z.string().optional().nullable(),
  
  // Relations
  agentId: z.string().optional().nullable(),
  developerId: z.string().optional().nullable(),
  
  // SEO
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  keywords: z.array(z.string()).optional().nullable(),
});