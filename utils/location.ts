import { mapService, MapUtils } from "@/lib/maps";

// Common countries with their codes
export const COUNTRIES = {
  US: "United States",
  CA: "Canada",
  GB: "United Kingdom",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  IT: "Italy",
  ES: "Spain",
  JP: "Japan",
  KR: "South Korea",
  CN: "China",
  IN: "India",
  BR: "Brazil",
  MX: "Mexico",
} as const;

// US states
export const US_STATES = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
} as const;

/**
 * Format address for display
 */
export function formatAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): string {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean);
  
  return parts.join(", ");
}

/**
 * Format address for maps
 */
export function formatAddressForMaps(address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): string {
  const parts = [
    address.street,
    `${address.city}, ${address.state} ${address.zipCode}`,
    address.country,
  ].filter(Boolean);
  
  return parts.join(" ");
}

/**
 * Get distance between two coordinates in kilometers
 */
export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  return mapService.calculateDistance({ lat: lat1, lng: lng1 }, { lat: lat2, lng: lng2 });
}

/**
 * Get distance in miles
 */
export function getDistanceInMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const km = getDistance(lat1, lng1, lat2, lng2);
  return km * 0.621371; // Convert km to miles
}

/**
 * Format distance for display
 */
export function formatDistance(distance: number, unit: "km" | "miles" = "km"): string {
  if (distance < 1) {
    const meters = unit === "km" ? distance * 1000 : distance * 1609.34;
    return `${Math.round(meters)} m`;
  }
  
  return `${distance.toFixed(1)} ${unit === "km" ? "km" : "mi"}`;
}

/**
 * Check if coordinates are valid
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return MapUtils.isValidCoordinate(lat, lng);
}

/**
 * Get bounding box for map display
 */
export function getBoundingBox(
  coordinates: Array<{ lat: number; lng: number }>,
  padding: number = 0.01
): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  return MapUtils.getBounds(coordinates);
}

/**
 * Geocode address to coordinates
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  try {
    return await mapService.geocode(address);
  } catch (error) {
    throw new Error(`Geocoding failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    return await mapService.reverseGeocode(lat, lng);
  } catch (error) {
    throw new Error(`Reverse geocoding failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Calculate travel time between two points
 */
export async function calculateTravelTime(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  mode: "driving" | "walking" | "bicycling" | "transit" = "driving"
): Promise<{ duration: number; distance: number }> {
  // This would typically use Google Maps Distance Matrix API
  // For now, we'll estimate based on distance
  
  const distance = getDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  
  // Estimate speed based on travel mode (km/h)
  const speeds = {
    driving: 50,
    walking: 5,
    bicycling: 15,
    transit: 30,
  };
  
  const duration = (distance / speeds[mode]) * 60; // Convert to minutes
  
  return {
    duration: Math.round(duration),
    distance: Math.round(distance * 10) / 10,
  };
}

/**
 * Generate static map URL
 */
export function generateStaticMapUrl(
  center: { lat: number; lng: number },
  markers: Array<{ lat: number; lng: number; color?: string; label?: string }> = [],
  options: {
    width?: number;
    height?: number;
    zoom?: number;
    scale?: number;
  } = {}
): string {
  const { width = 600, height = 400, zoom = 13, scale = 2 } = options;
  
  const baseUrl = "https://maps.googleapis.com/maps/api/staticmap";
  const params = new URLSearchParams({
    center: `${center.lat},${center.lng}`,
    zoom: zoom.toString(),
    size: `${width}x${height}`,
    scale: scale.toString(),
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  
  // Add markers
  markers.forEach(marker => {
    const markerParams = [
      `color:${marker.color || "red"}`,
      `label:${marker.label || "P"}`,
      `${marker.lat},${marker.lng}`,
    ];
    params.append("markers", markerParams.join("|"));
  });
  
  return `${baseUrl}?${params.toString()}`;
}

/**
 * Validate address components
 */
export function validateAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!address.street?.trim()) errors.push("Street address is required");
  if (!address.city?.trim()) errors.push("City is required");
  if (!address.state?.trim()) errors.push("State is required");
  if (!address.zipCode?.trim()) errors.push("ZIP code is required");
  if (!address.country?.trim()) errors.push("Country is required");
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get timezone from coordinates
 */
export async function getTimezoneFromCoordinates(lat: number, lng: number): Promise<string> {
  // This would typically use Google Time Zone API
  // For now, we'll return a placeholder
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    return data.timeZoneId || "America/New_York";
  } catch (error) {
    return "America/New_York"; // Fallback timezone
  }
}