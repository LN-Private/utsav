import crypto from 'crypto';
import type { PaymentMethod, PaymentStatus } from '@utsav/shared';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  redirectUrl: string;
  referenceId: string;
}

export interface WebhookPayload {
  [key: string]: unknown;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  transactionId?: string;
  status?: PaymentStatus;
  amount?: number;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: PaymentStatus;
  transactionId: string;
  amount?: number;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  status?: PaymentStatus;
}

export interface CommissionCalculation {
  totalAmount: number;
  platformFee: number;
  commission: number;
  providerPayout: number;
}

export interface PaymentGateway {
  createIntent(amount: number, bookingId: string): Promise<PaymentIntent>;
  verifyWebhook(payload: WebhookPayload, signature: string): Promise<WebhookVerificationResult>;
  verifyPayment(transactionId: string): Promise<PaymentVerificationResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
}

const PLATFORM_FEE_RATE = 0.05;
const COMMISSION_RATE = 0.10;

export function calculateCommission(totalAmount: number): CommissionCalculation {
  const platformFee = parseFloat((totalAmount * PLATFORM_FEE_RATE).toFixed(2));
  const commission = parseFloat((totalAmount * COMMISSION_RATE).toFixed(2));
  const providerPayout = parseFloat((totalAmount - platformFee - commission).toFixed(2));
  return {
    totalAmount,
    platformFee,
    commission,
    providerPayout,
  };
}

export class EsewaGateway implements PaymentGateway {
  private merchantId: string;
  private merchantSecret: string;
  private baseUrl: string;
  private callbackUrl: string;

  constructor() {
    this.merchantId = process.env.ESEWA_MERCHANT_ID || '';
    this.merchantSecret = process.env.ESEWA_MERCHANT_SECRET || '';
    this.baseUrl = process.env.ESEWA_BASE_URL || 'https://esewa.com.np';
    this.callbackUrl = process.env.ESEWA_CALLBACK_URL || '';
  }

  async createIntent(amount: number, bookingId: string): Promise<PaymentIntent> {
    const referenceId = `utsav_${bookingId}_${Date.now()}`;
    const redirectUrl = `${this.baseUrl}/epay/main?amt=${amount}&psc=0&psc2=0&txAmt=0&tAmt=${amount}&pid=${referenceId}&scd=${this.merchantId}&su=${this.callbackUrl}/success&fu=${this.callbackUrl}/failure`;
    return {
      id: referenceId,
      amount,
      currency: 'NPR',
      redirectUrl,
      referenceId,
    };
  }

  async verifyWebhook(payload: WebhookPayload, signature: string): Promise<WebhookVerificationResult> {
    const expectedSignature = crypto
      .createHmac('sha256', this.merchantSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    if (signature !== expectedSignature) {
      return { isValid: false };
    }
    const status = (payload.status as string) === 'success' ? 'completed' : 'failed';
    return {
      isValid: true,
      transactionId: (payload.transaction_id as string) || (payload.refId as string),
      status,
      amount: payload.amount as number,
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/epay/transaction/status?transactionId=${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.merchantSecret}`,
        },
      });
      const data = await response.json() as Record<string, unknown>;
      return {
        success: data.status === 'success',
        status: data.status === 'success' ? 'completed' : 'failed',
        transactionId: (data.transactionId as string) || transactionId,
        amount: data.amount as number,
      };
    } catch {
      return {
        success: false,
        status: 'failed',
        transactionId,
      };
    }
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/epay/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.merchantSecret}`,
        },
        body: JSON.stringify({ transactionId, amount }),
      });
      const data = await response.json() as Record<string, unknown>;
      return {
        success: data.status === 'success',
        refundId: data.refundId as string,
        status: data.status === 'success' ? 'refunded' : 'failed',
      };
    } catch {
      return { success: false, status: 'failed' };
    }
  }
}

export class KhaltiGateway implements PaymentGateway {
  private publicKey: string;
  private secretKey: string;
  private baseUrl: string;
  private returnUrl: string;

  constructor() {
    this.publicKey = process.env.KHALTI_PUBLIC_KEY || '';
    this.secretKey = process.env.KHALTI_SECRET_KEY || '';
    this.baseUrl = process.env.KHALTI_BASE_URL || 'https://khalti.com';
    this.returnUrl = process.env.KHALTI_RETURN_URL || '';
  }

  async createIntent(amount: number, bookingId: string): Promise<PaymentIntent> {
    const referenceId = `utsav_${bookingId}_${Date.now()}`;
    const redirectUrl = `${this.baseUrl}/api/v2/epayment/initiate/?public_key=${this.publicKey}&amount=${amount * 100}&purchase_order_id=${referenceId}&purchase_order_name=Utsav Booking&return_url=${this.returnUrl}&website_url=${process.env.FRONTEND_URL}`;
    return {
      id: referenceId,
      amount,
      currency: 'NPR',
      redirectUrl,
      referenceId,
    };
  }

  async verifyWebhook(payload: WebhookPayload, signature: string): Promise<WebhookVerificationResult> {
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(JSON.stringify(payload))
      .digest('hex');
    if (signature !== expectedSignature) {
      return { isValid: false };
    }
    const status = (payload.status as string) === 'Completed' ? 'completed' : 
                   (payload.status as string) === 'Refunded' ? 'refunded' : 'failed';
    return {
      isValid: true,
      transactionId: (payload.transaction_id as string) || (payload.pidx as string),
      status,
      amount: payload.amount ? (payload.amount as number) / 100 : undefined,
    };
  }

  async verifyPayment(transactionId: string): Promise<PaymentVerificationResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/epayment/status?transaction_id=${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${this.secretKey}`,
        },
      });
      const data = await response.json() as Record<string, unknown>;
      const amount = data.amount ? (data.amount as number) / 100 : undefined;
      return {
        success: data.status === 'Completed',
        status: data.status === 'Completed' ? 'completed' : 
              data.status === 'Refunded' ? 'refunded' : 'failed',
        transactionId: transactionId,
        amount,
      };
    } catch {
      return {
        success: false,
        status: 'failed',
        transactionId,
      };
    }
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v2/epayment/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${this.secretKey}`,
        },
        body: JSON.stringify({ transaction_id: transactionId, amount: amount * 100 }),
      });
      const data = await response.json() as Record<string, unknown>;
      return {
        success: data.status === 'success',
        refundId: data.refund_id as string,
        status: data.status === 'success' ? 'refunded' : 'failed',
      };
    } catch {
      return { success: false, status: 'failed' };
    }
  }
}

export class PaymentGatewayFactory {
  private static gateways: Map<PaymentMethod, PaymentGateway> = new Map();

  static getGateway(method: PaymentMethod): PaymentGateway {
    if (!this.gateways.has(method)) {
      let gateway: PaymentGateway;
      switch (method) {
        case 'esewa':
          gateway = new EsewaGateway();
          break;
        case 'khalti':
          gateway = new KhaltiGateway();
          break;
        default:
          throw new Error(`Unsupported payment method: ${method}`);
      }
      this.gateways.set(method, gateway);
    }
    return this.gateways.get(method)!;
  }

  static reset(): void {
    this.gateways.clear();
  }
}