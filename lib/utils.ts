import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price with currency
export function formatPrice(price: number | null | undefined): string {
  if (!price && price !== 0) return 'Price on request';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Format date
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

// Calculate property rating average
export function calculateAverageRating(reviews: any[]): number {
  if (!reviews || reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + (review.rating || 0), 0);
  return Number((sum / reviews.length).toFixed(1));
}

// Format area with unit
export function formatArea(area: number, unit: string = 'SQFT'): string {
  return `${area.toLocaleString()} ${unit}`;
}

// Get property type label
export function getPropertyTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'APARTMENT': 'Apartment',
    'HOUSE': 'House',
    'VILLA': 'Villa',
    'CONDO': 'Condo',
    'TOWNHOUSE': 'Townhouse',
    'COMMERCIAL': 'Commercial',
    'LAND': 'Land',
    'RESIDENTIAL': 'Residential',
  };
  
  return typeMap[type] || type.toLowerCase().replace('_', ' ');
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

// Calculate monthly mortgage payment (simplified)
export function calculateMortgage(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 12 / 100;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  const mortgage =
    principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return Number(mortgage.toFixed(2));
}