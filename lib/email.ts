import { z } from "zod";

// Email schemas
export const emailSchema = {
  send: z.object({
    to: z.string().email(),
    subject: z.string().min(1),
    template: z.string().min(1),
    data: z.record(z.string(), z.any()), // Fixed: added key type
  }),
  template: z.object({
    name: z.string().min(1),
    subject: z.string().min(1),
    html: z.string().min(1),
    text: z.string().min(1),
  }),
};

// Email templates with proper typing
interface WelcomeTemplateData {
  name: string;
  verificationUrl: string;
}

interface PasswordResetTemplateData {
  name: string;
  resetUrl: string;
}

interface OrderConfirmationTemplateData {
  orderId: string;
  items: any[];
  total: number;
}

// Email templates
export const emailTemplates = {
  welcome: {
    subject: "Welcome to Our App!",
    html: (data: WelcomeTemplateData) => `
      <div>
        <h1>Welcome, ${data.name}!</h1>
        <p>Thank you for joining our app.</p>
        <a href="${data.verificationUrl}">Verify your email</a>
      </div>
    `,
    text: (data: WelcomeTemplateData) =>
      `Welcome, ${data.name}! Thank you for joining. Verify your email: ${data.verificationUrl}`,
  },
  passwordReset: {
    subject: "Reset Your Password",
    html: (data: PasswordResetTemplateData) => `
      <div>
        <h1>Password Reset</h1>
        <p>Hello ${data.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="${data.resetUrl}">Reset Password</a>
      </div>
    `,
    text: (data: PasswordResetTemplateData) =>
      `Hello ${data.name}, reset your password: ${data.resetUrl}`,
  },
  orderConfirmation: {
    subject: "Order Confirmation",
    html: (data: OrderConfirmationTemplateData) => `
      <div>
        <h1>Order Confirmed</h1>
        <p>Your order #${data.orderId} has been confirmed.</p>
        <p>Total: $${data.total}</p>
      </div>
    `,
    text: (data: OrderConfirmationTemplateData) =>
      `Order #${data.orderId} confirmed. Total: $${data.total}`,
  },
};

// Email service with better typing
export class EmailService {
  private transporter: any;

  constructor() {
    // Initialize email transporter (Nodemailer, Resend, etc.)
  }

  async sendEmail(to: string, subject: string, html: string, text: string): Promise<void> {
    // Implementation for sending email
    console.log("Sending email:", { to, subject });
    
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // return await resend.emails.send({
    //   from: 'your-email@domain.com',
    //   to,
    //   subject,
    //   html,
    //   text,
    // });
  }

  async sendTemplate(
    templateName: keyof typeof emailTemplates, 
    to: string, 
    data: WelcomeTemplateData | PasswordResetTemplateData | OrderConfirmationTemplateData
  ): Promise<void> {
    const template = emailTemplates[templateName];
    
    // Type-safe template rendering
    const html = template.html(data as any);
    const text = template.text(data as any);
    
    return this.sendEmail(to, template.subject, html, text);
  }
}

export const emailService = new EmailService();