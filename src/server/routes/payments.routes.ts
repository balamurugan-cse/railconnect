import { Router } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest, requireAuth } from '../middleware/auth.js';
import { SandboxPaymentProvider } from '../providers/payment/SandboxPaymentProvider.js';
import { Payment } from '../types.js';

export const paymentsRouter = Router();
const sandboxProvider = new SandboxPaymentProvider();

// POST /api/payments/create-session
paymentsRouter.post('/create-session', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { bookingId, returnUrl } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'bookingId is required.' });
    }

    const booking = db.bookings.get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found.' });
    }

    if (booking.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Unauthorized for this booking.' });
    }

    if (booking.status === 'CONFIRMED') {
      return res.status(400).json({ error: 'ALREADY_PAID', message: 'Booking is already confirmed.' });
    }

    const session = await sandboxProvider.createCheckoutSession({
      bookingId: booking.id,
      bookingReference: booking.publicReference,
      amount: booking.fareBreakdown.totalAmount,
      currency: booking.currency,
      customerEmail: user.email,
      customerName: user.name,
      returnUrl,
    });

    return res.json({
      success: true,
      session,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// POST /api/payments/sandbox-confirm
paymentsRouter.post('/sandbox-confirm', requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    const { bookingId, paymentMethod = 'UPI Sandbox (GPay)', shouldFail = false, idempotencyKey } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'bookingId is required.' });
    }

    const booking = db.bookings.get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found.' });
    }

    if (booking.userId !== user.id && user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Unauthorized.' });
    }

    // Idempotency check: if booking is already confirmed, return success idempotently
    if (booking.status === 'CONFIRMED') {
      return res.json({
        success: true,
        booking,
        message: 'Payment already processed and verified for this booking.',
        isIdempotent: true,
      });
    }

    // If simulating failure
    if (shouldFail) {
      const failedPayment: Payment = {
        id: `pay_fail_${Date.now()}`,
        bookingId: booking.id,
        provider: 'sandbox',
        amount: booking.fareBreakdown.totalAmount,
        currency: booking.currency,
        status: 'FAILED',
        paymentMethod,
        idempotencyKey,
        createdAt: new Date().toISOString(),
      };
      db.payments.set(failedPayment.id, failedPayment);

      db.logAudit({
        actorUserId: user.id,
        actorEmail: user.email,
        action: 'PAYMENT_FAILED_SIMULATED',
        resourceType: 'Payment',
        resourceId: failedPayment.id,
        requestId: req.requestId,
      });

      return res.status(402).json({
        error: 'PAYMENT_FAILED',
        message: 'Sandbox payment transaction failed as requested by test trigger.',
      });
    }

    // Process success
    const paymentId = `pay_sbx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payment: Payment = {
      id: paymentId,
      bookingId: booking.id,
      provider: 'sandbox',
      providerPaymentId: `sbx_tx_${Math.floor(10000000 + Math.random() * 90000000)}`,
      amount: booking.fareBreakdown.totalAmount,
      currency: booking.currency,
      status: 'SUCCESS',
      paymentMethod,
      idempotencyKey,
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    db.payments.set(payment.id, payment);

    // Transition booking state to CONFIRMED
    booking.status = 'CONFIRMED';
    booking.paymentId = payment.id;
    booking.updatedAt = new Date().toISOString();
    db.bookings.set(booking.id, booking);

    db.logAudit({
      actorUserId: user.id,
      actorEmail: user.email,
      action: 'PAYMENT_VERIFIED_CONFIRMED',
      resourceType: 'Booking',
      resourceId: booking.id,
      requestId: req.requestId,
      details: {
        paymentId: payment.id,
        amount: payment.amount,
        method: paymentMethod,
      },
    });

    return res.json({
      success: true,
      booking,
      payment,
      message: 'Payment verified and booking confirmed successfully.',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: err.message });
  }
});

// POST /api/payments/webhook
paymentsRouter.post('/webhook', async (req, res) => {
  try {
    const signature = (req.headers['x-railconnect-signature'] as string) || '';
    const payload = req.body;

    const verification = await sandboxProvider.verifyWebhook(payload, signature);

    if (!verification.isValid) {
      return res.status(400).json({
        error: 'INVALID_SIGNATURE',
        message: verification.errorMessage || 'Webhook signature verification failed.',
      });
    }

    const { bookingId, status, paymentId } = verification;
    const booking = db.bookings.get(bookingId);

    if (booking && status === 'SUCCESS') {
      booking.status = 'CONFIRMED';
      booking.paymentId = paymentId;
      booking.updatedAt = new Date().toISOString();
      db.bookings.set(booking.id, booking);

      db.logAudit({
        action: 'WEBHOOK_PAYMENT_CONFIRMED',
        resourceType: 'Booking',
        resourceId: booking.id,
        details: { webhookVerified: true, paymentId },
      });
    }

    return res.json({ received: true, status: 'PROCESSED' });
  } catch (err: any) {
    return res.status(500).json({ error: 'WEBHOOK_ERROR', message: err.message });
  }
});
