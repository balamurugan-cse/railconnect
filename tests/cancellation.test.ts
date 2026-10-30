/**
 * Unit & Integration Tests: Cancellation & Refund Calculations
 */

import { DemoRailwayProvider } from '../src/server/providers/railway/DemoRailwayProvider.js';

async function runTests() {
  console.log('🧪 Running Booking Cancellation Tests...');
  const railwayProvider = new DemoRailwayProvider();

  // Test 1: Standard cancellation fee calculation
  const res = await railwayProvider.cancelReservation('DEMO-RES-1234');
  if (res.status !== 'CANCELLED') {
    throw new Error('FAIL: Expected status CANCELLED');
  }
  if (res.cancellationFee <= 0) {
    throw new Error('FAIL: Cancellation fee should be positive');
  }
  console.log(`✅ Test 1 Passed: Cancellation status is CANCELLED with fee ₹${res.cancellationFee}.`);

  console.log('🎉 All cancellation tests passed successfully!\n');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
