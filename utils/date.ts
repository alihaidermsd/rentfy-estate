import { format, formatDistance, formatRelative, isBefore, isAfter, addDays, differenceInDays, parseISO } from "date-fns";

// Date formats
export const DATE_FORMATS = {
  SHORT: "MMM dd, yyyy",
  MEDIUM: "MMM dd, yyyy, hh:mm a",
  LONG: "EEEE, MMMM dd, yyyy",
  TIME: "hh:mm a",
  DATE_TIME: "MMM dd, yyyy 'at' hh:mm a",
  ISO: "yyyy-MM-dd",
  DISPLAY: "MMMM yyyy",
} as const;

/**
 * Format date with consistent formatting across the app
 */
export function formatDate(
  date: Date | string | number,
  formatStr: string = DATE_FORMATS.SHORT,
  options?: { locale?: any }
): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return format(dateObj, formatStr, options);
}

/**
 * Format date as relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Format date as relative to now (e.g., "today at 2:30 PM")
 */
export function formatRelativeToNow(date: Date | string | number): string {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return formatRelative(dateObj, new Date());
}

/**
 * Check if a date range is valid
 */
export function isValidDateRange(checkIn: Date, checkOut: Date): boolean {
  return isBefore(checkIn, checkOut) && isAfter(checkOut, checkIn);
}

/**
 * Calculate number of nights between two dates
 */
export function calculateNights(checkIn: Date | string, checkOut: Date | string): number {
  const start = typeof checkIn === "string" ? parseISO(checkIn) : new Date(checkIn);
  const end = typeof checkOut === "string" ? parseISO(checkOut) : new Date(checkOut);
  return Math.max(0, differenceInDays(end, start));
}

/**
 * Add days to a date
 */
export function addDaysToDate(date: Date | string, days: number): Date {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return addDays(dateObj, days);
}

/**
 * Check if date is in the past
 */
export function isDateInPast(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  return isBefore(dateObj, new Date());
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

/**
 * Get minimum check-in date (usually today or tomorrow)
 */
export function getMinCheckInDate(minAdvanceDays: number = 0): Date {
  return addDays(new Date(), minAdvanceDays);
}

/**
 * Get maximum check-out date based on max stay
 */
export function getMaxCheckOutDate(checkIn: Date | string, maxStay: number = 30): Date {
  const checkInDate = typeof checkIn === "string" ? parseISO(checkIn) : new Date(checkIn);
  return addDays(checkInDate, maxStay);
}

/**
 * Generate array of dates between two dates
 */
export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

/**
 * Check if a date is available (not in blocked dates)
 */
export function isDateAvailable(
  date: Date, 
  blockedDates: Date[], 
  bookings: Array<{ checkIn: Date; checkOut: Date }> = []
): boolean {
  // Check blocked dates
  const isBlocked = blockedDates.some(blockedDate => 
    blockedDate.toDateString() === date.toDateString()
  );
  
  if (isBlocked) return false;
  
  // Check bookings
  const isBooked = bookings.some(booking => 
    date >= booking.checkIn && date < booking.checkOut
  );
  
  return !isBooked;
}

/**
 * Format duration between two dates
 */
export function formatDuration(start: Date, end: Date): string {
  const nights = calculateNights(start, end);
  const days = nights + 1;
  
  if (nights === 0) {
    return "1 day";
  } else if (nights === 1) {
    return "1 night";
  } else {
    return `${nights} nights, ${days} days`;
  }
}

/**
 * Get season from date (for dynamic pricing)
 */
export function getSeason(date: Date): "LOW" | "HIGH" | "PEAK" {
  const month = date.getMonth() + 1;
  
  // High season: June-August
  if (month >= 6 && month <= 8) return "HIGH";
  
  // Peak season: December
  if (month === 12) return "PEAK";
  
  // Low season: rest of the year
  return "LOW";
}