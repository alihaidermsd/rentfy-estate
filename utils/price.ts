import { Currency } from "@/types/payment";

// Exchange rates (would typically come from an API)
const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  CAD: 1.25,
  AUD: 1.35,
  JPY: 110,
};

/**
 * Format price with currency symbol and localization
 */
export function formatPrice(
  amount: number,
  currency: Currency = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price with decimals for precise amounts
 */
export function formatPriceWithDecimals(
  amount: number,
  currency: Currency = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate total price for a booking
 */
export function calculateTotalPrice(
  basePrice: number,
  nights: number,
  guests: number,
  options?: {
    serviceFeePercentage?: number;
    taxPercentage?: number;
    cleaningFee?: number;
    extraGuestFee?: number;
    currency?: Currency;
  }
) {
  const {
    serviceFeePercentage = 10,
    taxPercentage = 8,
    cleaningFee = 0,
    extraGuestFee = 0,
    currency = "USD",
  } = options || {};

  // Base price for all nights
  const baseTotal = basePrice * nights;
  
  // Extra guest fees
  const extraGuests = Math.max(0, guests - 1); // First guest is included
  const extraGuestTotal = extraGuestFee * extraGuests * nights;
  
  // Subtotal
  const subtotal = baseTotal + extraGuestTotal + cleaningFee;
  
  // Fees and taxes
  const serviceFee = (subtotal * serviceFeePercentage) / 100;
  const tax = (subtotal * taxPercentage) / 100;
  
  // Total
  const total = subtotal + serviceFee + tax;

  return {
    basePrice,
    nights,
    guests,
    baseTotal,
    extraGuestTotal,
    cleaningFee,
    subtotal,
    serviceFee,
    tax,
    total,
    currency,
    breakdown: {
      baseTotal,
      extraGuestTotal,
      cleaningFee,
      serviceFee,
      tax,
      subtotal,
      total,
    },
  };
}

/**
 * Convert price between currencies
 */
export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  
  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency];
  return amountInUSD * EXCHANGE_RATES[toCurrency];
}

/**
 * Calculate service fee
 */
export function calculateServiceFee(amount: number, percentage: number = 10): number {
  return (amount * percentage) / 100;
}

/**
 * Calculate tax amount
 */
export function calculateTax(amount: number, taxRate: number = 8): number {
  return (amount * taxRate) / 100;
}

/**
 * Apply seasonal pricing multiplier
 */
export function applySeasonalPricing(
  basePrice: number,
  season: "LOW" | "HIGH" | "PEAK"
): number {
  const multipliers = {
    LOW: 0.8,   // 20% discount in low season
    HIGH: 1,    // Standard price in high season
    PEAK: 1.3,  // 30% premium in peak season
  };
  
  return Math.round(basePrice * multipliers[season]);
}

/**
 * Calculate discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

/**
 * Format price range for search results
 */
export function formatPriceRange(minPrice: number, maxPrice: number, currency: Currency = "USD"): string {
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency);
  }
  return `${formatPrice(minPrice, currency)} - ${formatPrice(maxPrice, currency)}`;
}

/**
 * Validate price input
 */
export function isValidPrice(price: number): boolean {
  return !isNaN(price) && isFinite(price) && price >= 0;
}

/**
 * Round price to nearest increment (for pricing strategies)
 */
export function roundPrice(price: number, increment: number = 5): number {
  return Math.round(price / increment) * increment;
}

/**
 * Calculate average daily rate (ADR)
 */
export function calculateADR(totalRevenue: number, nightsSold: number): number {
  return nightsSold > 0 ? totalRevenue / nightsSold : 0;
}

/**
 * Calculate revenue per available room (RevPAR)
 */
export function calculateRevPAR(totalRevenue: number, availableRooms: number): number {
  return availableRooms > 0 ? totalRevenue / availableRooms : 0;
}

/**
 * Generate price suggestions based on market data
 */
export function generatePriceSuggestions(
  basePrice: number,
  marketData: {
    min: number;
    max: number;
    average: number;
  }
): {
  competitive: number;
  premium: number;
  economy: number;
} {
  return {
    competitive: Math.max(basePrice, marketData.average * 0.9),
    premium: Math.max(basePrice, marketData.average * 1.1),
    economy: Math.max(basePrice * 0.8, marketData.min),
  };
}