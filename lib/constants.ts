// App constants with schema validation
import { z } from "zod";

export const appConstants = {
  roles: ["USER", "ADMIN", "MODERATOR"] as const,
  orderStatuses: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"] as const,
  paymentMethods: ["CARD", "PAYPAL", "BANK_TRANSFER", "CRYPTO"] as const,
  productCategories: ["ELECTRONICS", "CLOTHING", "BOOKS", "HOME", "SPORTS"] as const,
} as const;

// Constants schemas
export const constantsSchema = {
  role: z.enum(appConstants.roles),
  orderStatus: z.enum(appConstants.orderStatuses),
  paymentMethod: z.enum(appConstants.paymentMethods),
  productCategory: z.enum(appConstants.productCategories),
};

// App configuration
export const config = {
  app: {
    name: "My App",
    version: "1.0.0",
    description: "A modern web application",
  },
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
    timeout: 10000,
    retries: 3,
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  upload: {
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedDocumentTypes: ["application/pdf", "application/msword"],
  },
  security: {
    passwordMinLength: 8,
    sessionDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
} as const;

// Feature flags
export const features = {
  enablePayments: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true",
  enableMaps: process.env.NEXT_PUBLIC_ENABLE_MAPS === "true",
  enableEmail: process.env.NEXT_PUBLIC_ENABLE_EMAIL === "true",
  enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
} as const;