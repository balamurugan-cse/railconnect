import crypto from 'crypto';
import { db } from '../../db/store.js';
import { Payment } from '../../types.js';
import {
  CheckoutSessionResponse,
  CreateCheckoutSessionRequest,
  PaymentProvider,
  RefundRequest,
  RefundResponse,
  WebhookVerificationResult,
} from './PaymentProvider.js';

export class SandboxPaymentProvider implements PaymentProvider {
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYMENT_WEBHOOK_SECRET || 'sandbox_webhook_secret_key_railconnect';
  }

  /**
   * Generates HMAC-SHA256 signature for sandbox webhook verification
   */
  public generateSignature(payloadString: string): string {
    return crypto.createHmac('sha256', this.secretKey).update(payloadString).digest('hex');
  }

  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const sessionId = `chk_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

    // Create a pending payment entry in db
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payment: Payment = {
      id: paymentId,
      bookingId: request.bookingId,
      provider: 'sandbox',
      amount: request.amount,
      currency: request.currency,
      status: 'PENDING',
      idempotencyKey: request.idempotencyKey || sessionId,
      createdAt: new Date().toISOString(),
    };
    db.payments.set(payment.id, payment);

    return {
      sessionId,
      checkoutUrl: `/payment/${request.bookingId}?session=${sessionId}`,
      provider: 'sandbox',
      expiresAt,
    };
  }

  async verifyWebhook(payload: any, signature: string): Promise<WebhookVerificationResult> {
    if (!payload || !signature) {
      return {
        isValid: false,
        event: 'UNKNOWN',
        bookingId: '',
        paymentId: '',
        amount: 0,
        status: 'FAILED',
        errorMessage: 'Missing payload or signature header',
      };
    }

    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const expectedSignature = this.generateSignature(payloadString);

    // Safe constant-time string comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature, 'utf8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf8');
    const isValid = sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);

    if (!isValid) {
      return {
        isValid: false,
        event: payload.event || 'PAYMENT_COMPLETED',
        bookingId: payload.bookingId || '',
        paymentId: payload.paymentId || '',
        amount: payload.amount || 0,
        status: 'FAILED',
        errorMessage: 'HMAC signature verification failed',
      };
    }

    return {
      isValid: true,
      event: payload.event || 'PAYMENT_COMPLETED',
      bookingId: payload.bookingId,
      paymentId: payload.paymentId,
      amount: payload.amount,
      status: payload.status === 'SUCCESS' ? 'SUCCESS' : 'FAILED',
    };
  }

  async refund(request: RefundRequest): Promise<RefundResponse> {
    const refundId = `ref_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const payment = db.payments.get(request.paymentId);

    if (payment) {
      payment.status = 'REFUNDED';
    }

    return {
      refundId,
      status: 'SUCCESS',
      refundedAmount: request.amount,
    };
  }
}
