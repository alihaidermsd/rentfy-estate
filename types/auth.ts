import { z } from "zod";

// Auth Schemas
export const authSchema = {
  login: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().default(false),
  }),

  register: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  resetPassword: z.object({
    email: z.string().email("Invalid email address"),
  }),

  resetPasswordConfirm: z.object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  }),

  changePassword: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase letter, one uppercase letter, and one number"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  }),

  verifyEmail: z.object({
    token: z.string().min(1, "Token is required"),
  }),

  refreshToken: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
};

// Auth Types
export type LoginInput = z.infer<typeof authSchema.login>;
export type RegisterInput = z.infer<typeof authSchema.register>;
export type ResetPasswordInput = z.infer<typeof authSchema.resetPassword>;
export type ResetPasswordConfirmInput = z.infer<typeof authSchema.resetPasswordConfirm>;
export type ChangePasswordInput = z.infer<typeof authSchema.changePassword>;
export type VerifyEmailInput = z.infer<typeof authSchema.verifyEmail>;
export type RefreshTokenInput = z.infer<typeof authSchema.refreshToken>;

// Auth Response Types
export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    emailVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface VerifyEmailResponse {
  verified: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// Session Types
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

// OAuth Types
export interface OAuthProvider {
  id: string;
  name: string;
  enabled: boolean;
}

export interface OAuthConfig {
  google: {
    clientId: string;
    clientSecret: string;
    enabled: boolean;
  };
  facebook: {
    clientId: string;
    clientSecret: string;
    enabled: boolean;
  };
  github: {
    clientId: string;
    clientSecret: string;
    enabled: boolean;
  };
}

// Security Types
export interface SecurityLog {
  id: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  status: "SUCCESS" | "FAILED";
  details?: any;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  successful: boolean;
  reason?: string;
}