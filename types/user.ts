import { z } from "zod";

// User Roles
export type UserRole = "USER" | "HOST" | "ADMIN" | "MODERATOR";

// User Status
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING_VERIFICATION";

// User Schemas
export const userSchema = {
  create: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
    phone: z.string().min(10, "Phone number must be at least 10 characters").optional(),
    avatar: z.string().url("Invalid avatar URL").optional(),
    role: z.enum(["USER", "HOST", "ADMIN", "MODERATOR"]).default("USER"),
  }),

  update: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(10).optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(500, "Bio too long").optional(),
    dateOfBirth: z.string().datetime().optional(),
    address: z.object({
      street: z.string().min(1).optional(),
      city: z.string().min(1).optional(),
      state: z.string().min(1).optional(),
      zipCode: z.string().min(1).optional(),
      country: z.string().min(1).optional(),
    }).optional(),
    notificationPreferences: z.object({
      email: z.boolean().default(true),
      sms: z.boolean().default(false),
      push: z.boolean().default(true),
    }).optional(),
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
  }),

  search: z.object({
    query: z.string().optional(),
    role: z.enum(["USER", "HOST", "ADMIN", "MODERATOR"]).optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING_VERIFICATION"]).optional(),
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
  }),
};

// User Types
export type UserCreateInput = z.infer<typeof userSchema.create>;
export type UserUpdateInput = z.infer<typeof userSchema.update>;
export type UserChangePasswordInput = z.infer<typeof userSchema.changePassword>;
export type UserSearchInput = z.infer<typeof userSchema.search>;

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  dateOfBirth?: Date;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  
  // Statistics (computed fields)
  stats?: {
    totalBookings: number;
    totalProperties: number;
    totalReviews: number;
    averageRating: number;
  };
}

// User Response Types
export interface UserResponse {
  user: User;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

// User Profile (public view)
export interface UserProfile {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  joinedAt: Date;
  stats: {
    totalReviews: number;
    averageRating: number;
    responseRate: number;
    responseTime: string;
  };
  isVerified: boolean;
  isSuperhost: boolean;
}

// User Statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  userGrowthRate: number;
  averageBookingsPerUser: number;
}

// User Verification
export interface UserVerification {
  id: string;
  userId: string;
  type: "EMAIL" | "PHONE" | "IDENTITY";
  status: "PENDING" | "VERIFIED" | "REJECTED";
  documentUrl?: string;
  verifiedAt?: Date;
  createdAt: Date;
}