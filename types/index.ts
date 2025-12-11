// Main export file
export * from "./property";
export * from "./booking";
export * from "./user";
export * from "./auth";
export * from "./payment";

// Common Types
export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SearchParams {
  query?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationParams;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface FileUpload {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  uploadedAt: Date;
}

// Form Types
export interface FormState {
  isSubmitting: boolean;
  isSubmitted: boolean;
  isValid: boolean;
  errors: Record<string, string>;
}

// Notification Types
export interface Notification {
  id: string;
  type: "SUCCESS" | "ERROR" | "WARNING" | "INFO";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Analytics Types
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

export interface PageView {
  page: string;
  title: string;
  url: string;
  timestamp: Date;
  duration?: number;
  referrer?: string;
}

// Settings Types
export interface AppSettings {
  site: {
    name: string;
    description: string;
    logo: string;
    favicon: string;
    theme: "light" | "dark" | "auto";
  };
  booking: {
    minStay: number;
    maxStay: number;
    advanceBooking: number;
    cancellationWindow: number;
  };
  payments: {
    currency: string;
    serviceFee: number;
    taxRate: number;
    allowedMethods: string[];
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Re-export Zod for convenience
export { z } from "zod";