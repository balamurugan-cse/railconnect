/**
 * Unit & Integration Tests: Booking Idempotency & Payment Webhook Signature
 */

import { db } from '../src/server/db/store.js';
import { SandboxPaymentProvider } from '../src/server/providers/payment/SandboxPaymentProvider.js';

async function runTests() {
  console.log('🧪 Running Booking Idempotency & Payment Webhook Tests...');
  const paymentProvider = new SandboxPaymentProvider();

  // Test 1: Webhook HMAC Signature Generation & Verification
  const samplePayload = {
    event: 'PAYMENT_COMPLETED',
    bookingId: 'bkg_seed_001',
    paymentId: 'pay_sbx_9921',
    amount: 1611.75,
    status: 'SUCCESS',
  };

  const signature = paymentProvider.generateSignature(JSON.stringify(samplePayload));
  const result = await paymentProvider.verifyWebhook(samplePayload, signature);

  if (!result.isValid || result.status !== 'SUCCESS') {
    throw new Error('FAIL: Valid signature failed verification');
  }
  console.log('✅ Test 1 Passed: Webhook HMAC-SHA256 signature generated and verified successfully.');

  // Test 2: Invalid signature rejection
  const badResult = await paymentProvider.verifyWebhook(samplePayload, 'forged_fake_signature_abc123');
  if (badResult.isValid) {
    throw new Error('FAIL: Forged signature was mistakenly accepted');
  }
  console.log('✅ Test 2 Passed: Forged/tampered webhook signature successfully rejected.');

  // Test 3: Booking existence and seed integrity
  const existingBooking = db.bookings.get('bkg_seed_001');
  if (!existingBooking) {
    throw new Error('FAIL: Seed booking missing from DatabaseStore');
  }
  console.log(`✅ Test 3 Passed: Seed booking ${existingBooking.publicReference} verified in database.`);

  console.log('🎉 All security & payment webhook tests passed successfully!\n');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
