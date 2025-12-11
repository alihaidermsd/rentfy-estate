import { z } from "zod";

// Payment Status
export type PaymentStatus = 
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "CANCELLED";

// Payment Method
export type PaymentMethod = 
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "PAYPAL"
  | "BANK_TRANSFER"
  | "CRYPTO"
  | "WALLET";

// Currency
export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD" | "JPY";

// Payment Schemas
export const paymentSchema = {
  create: z.object({
    bookingId: z.string().min(1, "Booking ID is required"),
    amount: z.number().positive("Amount must be positive"),
    currency: z.enum(["USD", "EUR", "GBP", "CAD", "AUD", "JPY"]).default("USD"),
    paymentMethod: z.enum(["CREDIT_CARD", "DEBIT_CARD", "PAYPAL", "BANK_TRANSFER", "CRYPTO", "WALLET"]),
    paymentMethodDetails: z.record(z.string(), z.any()).optional(),
    returnUrl: z.string().url("Invalid return URL").optional(),
  }),

  confirm: z.object({
    paymentIntentId: z.string().min(1, "Payment intent ID is required"),
    paymentMethodId: z.string().optional(),
  }),

  refund: z.object({
    paymentId: z.string().min(1, "Payment ID is required"),
    amount: z.number().positive("Amount must be positive").optional(),
    reason: z.string().max(500, "Reason too long").optional(),
  }),

  webhook: z.object({
    id: z.string(),
    type: z.string(),
    data: z.object({
      object: z.record(z.string(), z.any()),
    }),
  }),
};

// Payment Types
export type PaymentCreateInput = z.infer<typeof paymentSchema.create>;
export type PaymentConfirmInput = z.infer<typeof paymentSchema.confirm>;
export type PaymentRefundInput = z.infer<typeof paymentSchema.refund>;
export type PaymentWebhookInput = z.infer<typeof paymentSchema.webhook>;

// Payment Interface
export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentMethodDetails: Record<string, any>;
  paymentIntentId?: string;
  processorTransactionId?: string;
  refundedAmount: number;
  failureReason?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  refundedAt?: Date;
  
  // Populated fields (optional)
  booking?: {
    id: string;
    checkIn: Date;
    checkOut: Date;
    property: {
      title: string;
      images: string[];
    };
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Payment Response Types
export interface PaymentResponse {
  payment: Payment;
}

export interface PaymentsResponse {
  payments: Payment[];
  total: number;
  page: number;
  totalPages: number;
}

// Payment Intent
export interface PaymentIntent {
  id: string;
  clientSecret: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  paymentMethodTypes: string[];
  metadata: Record<string, any>;
  createdAt: Date;
}

// Payment Method Details
export interface CreditCardDetails {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  country: string;
}

export interface PayPalDetails {
  email: string;
  payerId: string;
}

export interface BankTransferDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}

// Payment Statistics
export interface PaymentStats {
  totalRevenue: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  refundedAmount: number;
  averageTransactionValue: number;
  revenueByCurrency: Record<Currency, number>;
  revenueByPaymentMethod: Record<PaymentMethod, number>;
}

// Refund Interface
export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  currency: Currency;
  reason?: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  processorRefundId?: string;
  createdAt: Date;
  processedAt?: Date;
}

// Webhook Events
export type WebhookEventType = 
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "payment_intent.cancelled"
  | "charge.refunded"
  | "charge.failed";

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: {
    object: any;
  };
  created: number;
  livemode: boolean;
}