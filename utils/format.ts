import { User, Booking } from "@/types";
import { Property } from '@/hooks/useProperties';

/**
 * Format number with commas
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat("en-US").format(number);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(number: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(number);
}

/**
 * Format percentage
 */
export function formatPercentage(number: number, decimals: number = 1): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number / 100);
}

/**
 * Format phone number
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, "");
  
  // Check if the number is valid
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  } else if (cleaned.length === 11 && cleaned[0] === "1") {
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "+$1 ($2) $3-$4");
  }
  
  // Return original if format doesn't match
  return phoneNumber;
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format duration in minutes to readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Format user name for display
 */
export function formatUserName(user: Pick<User, "name" | "email">): string {
  return user.name || user.email.split("@")[0];
}

/**
 * Format user initials for avatar
 */
export function formatUserInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Format property title for SEO
 */
export function formatPropertyTitle(property: Pick<Property, "title" | "city" | "country">): string {
  return `${property.title} - ${property.city}, ${property.country}`;
}

/**
 * Format booking confirmation number
 */
export function formatBookingConfirmation(bookingId: string): string {
  return `BK-${bookingId.slice(-8).toUpperCase()}`;
}

/**
 * Format payment confirmation number
 */
export function formatPaymentConfirmation(paymentId: string): string {
  return `PMT-${paymentId.slice(-8).toUpperCase()}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Convert camelCase to Title Case
 */
export function camelCaseToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, char => char.toUpperCase())
    .trim();
}

/**
 * Convert snake_case to Title Case
 */
export function snakeCaseToTitleCase(str: string): string {
  return str
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generate a slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
    JPY: "¥",
  };
  
  return symbols[currency] || currency;
}

/**
 * Format rating with stars
 */
export function formatRating(rating: number, max: number = 5): string {
  return "★".repeat(Math.floor(rating)) + "☆".repeat(max - Math.floor(rating));
}

/**
 * Format social media handle
 */
export function formatSocialHandle(handle: string, platform: "twitter" | "instagram" | "facebook"): string {
  const prefixes = {
    twitter: "@",
    instagram: "@",
    facebook: "",
  };
  
  return prefixes[platform] + handle.replace(/^@/, "");
}

/**
 * Format list of items with proper grammar
 */
export function formatList(items: string[], conjunction: string = "and"): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return items.join(` ${conjunction} `);
  
  return items.slice(0, -1).join(", ") + `, ${conjunction} ` + items[items.length - 1];
}

/**
 * Format relative time in a human-readable way
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = typeof date === "string" ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Format credit card number for display
 */
export function formatCreditCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s+/g, "").replace(/\D/g, "");
  const matches = cleaned.match(/.{1,4}/g);
  return matches ? matches.join(" ") : cardNumber;
}

/**
 * Mask sensitive information
 */
export function maskSensitiveInfo(text: string, visibleChars: number = 4): string {
  if (text.length <= visibleChars * 2) {
    return "*".repeat(text.length);
  }
  
  const firstVisible = text.slice(0, visibleChars);
  const lastVisible = text.slice(-visibleChars);
  const masked = "*".repeat(text.length - visibleChars * 2);
  
  return firstVisible + masked + lastVisible;
}

/**
 * Generate a random color based on string input
 */
export function generateColorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}