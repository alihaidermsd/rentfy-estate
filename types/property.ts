export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  category: 'RENT' | 'SALE';
  purpose: string;
  slug: string;
  
  // Pricing
  price: number | null;
  rentPrice: number | null;
  bookingPrice: number | null;
  securityDeposit: number | null;
  currency: string;
  pricePerSqft: number | null;
  maintenanceFee: number | null;
  
  // Location
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  neighborhood: string | null;
  landmark: string | null;
  
  // Details
  bedrooms: number | null;
  bathrooms: number | null;
  area: number;
  areaUnit: string;
  yearBuilt: number | null;
  parkingSpaces: number | null;
  floors: number | null;
  floorNumber: number | null;
  furnished: boolean | null;
  petFriendly: boolean | null;
  amenities: string | null;
  utilitiesIncluded: boolean;
  
  // Booking-specific
  minStay: number | null;
  maxStay: number | null;
  availableFrom: Date | null;
  instantBook: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  cancellationPolicy: string | null;
  
  // Media
  images: string | null;
  videos: string | null;
  virtualTour: string | null;
  floorPlan: string | null;
  documents: any | null;
  
  // Status
  status: string;
  featured: boolean;
  verified: boolean;
  isActive: boolean;
  views: number;
  featuredUntil: Date | null;
  
  // Relations
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  agentId: string | null;
  agent: any | null;
  developerId: string | null;
  developer: any | null;
  
  // Metadata
  tags: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  keywords: string[] | null;
  
  // Counts
  _count?: {
    favorites: number;
    reviews: number;
    bookings: number;
    inquiries: number;
  };
  
  // Reviews
  averageRating: number | null;
  totalReviews: number;
  
  // Dates
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
}

export interface PropertyFilters {
  page?: number;
  limit?: number;
  type?: string;
  category?: 'RENT' | 'SALE' | string;
  purpose?: string;
  city?: string;
  state?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  maxArea?: number;
  furnished?: boolean;
  petFriendly?: boolean;
  featured?: boolean;
  verified?: boolean;
  status?: string;
  userId?: string;
  agentId?: string;
  developerId?: string;
  sortBy?: 'price' | 'rentPrice' | 'area' | 'createdAt' | 'views';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PropertyPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PropertyResponse {
  success: boolean;
  data: Property[];
  pagination: PropertyPagination;
}