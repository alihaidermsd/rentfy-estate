import { z } from "zod";

// Payment schemas
export const paymentSchema = {
  create: z.object({
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().length(3, "Currency must be 3 characters"),
    description: z.string().optional(),
    metadata: z.record(z.string(), z.any()).optional(), // Fixed: added key type
  }),
  confirm: z.object({
    paymentIntentId: z.string().min(1, "Payment intent ID is required"),
  }),
  webhook: z.object({
    id: z.string(),
    type: z.string(),
    data: z.object({
      object: z.record(z.string(), z.any()), // Fixed: added key type
    }),
  }),
};

// Payment service interface
export interface PaymentProvider {
  createPaymentIntent(amount: number, currency: string, metadata?: any): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }>;
  confirmPayment(paymentIntentId: string): Promise<boolean>;
  handleWebhook(payload: any, signature: string): Promise<any>;
}

// Stripe implementation
export class StripePayment implements PaymentProvider {
  private stripe: any;

  constructor() {
    this.stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  }

  async createPaymentIntent(amount: number, currency: string = "usd", metadata?: any) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent.status === "succeeded";
  }

  async handleWebhook(payload: any, signature: string) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    return event;
  }
}

// PayPal implementation
export class PayPalPayment implements PaymentProvider {
  // PayPal implementation would go here
  async createPaymentIntent(amount: number, currency: string, metadata?: any) {
    // PayPal implementation
    return { clientSecret: "paypal-secret", paymentIntentId: "paypal-id" };
  }

  async confirmPayment(paymentIntentId: string) {
    return true;
  }

  async handleWebhook(payload: any, signature: string) {
    return payload;
  }
}

// Payment factory
export class PaymentService {
  private provider: PaymentProvider;

  constructor(provider: "stripe" | "paypal" = "stripe") {
    this.provider = provider === "stripe" ? new StripePayment() : new PayPalPayment();
  }

  async createPaymentIntent(amount: number, currency: string, metadata?: any) {
    return this.provider.createPaymentIntent(amount, currency, metadata);
  }

  async confirmPayment(paymentIntentId: string) {
    return this.provider.confirmPayment(paymentIntentId);
  }

  async handleWebhook(payload: any, signature: string) {
    return this.provider.handleWebhook(payload, signature);
  }
}

export const paymentService = new PaymentService();