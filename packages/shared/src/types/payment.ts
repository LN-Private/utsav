// Payment types for Utsav marketplace
// Nepal marketplace with NPR currency

export type PaymentMethod = 
  | 'esewa'
  | 'khalti'
  | 'cash'
  | 'bank-transfer'
  | 'card';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string; // NPR
  method: PaymentMethod;
  transactionId?: string;
  gatewayResponse?: Record<string, unknown>;
  status: PaymentStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string;
}

export interface PaymentGatewayConfig {
  esewa: {
    merchantId: string;
    merchantSecret: string;
    callbackUrl: string;
  };
  khalti: {
    publicKey: string;
    returnUrl: string;
  };
}

export interface RefundInput {
  paymentId: string;
  amount: number;
  reason: string;
}