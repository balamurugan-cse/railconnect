export interface CreateCheckoutSessionRequest {
  bookingId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  idempotencyKey?: string;
  returnUrl?: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  provider: string;
  expiresAt: string;
}

export interface WebhookVerificationResult {
  isValid: boolean;
  event: string;
  bookingId: string;
  paymentId: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
}

export interface RefundRequest {
  paymentId: string;
  bookingId: string;
  amount: number;
  currency: string;
  reason?: string;
}

export interface RefundResponse {
  refundId: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  refundedAmount: number;
}

export interface PaymentProvider {
  createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse>;
  verifyWebhook(payload: any, signature: string): Promise<WebhookVerificationResult>;
  refund(request: RefundRequest): Promise<RefundResponse>;
}
