/**
 * Unit & Integration Tests: Train Route Search Engine
 */

import { DemoRailwayProvider } from '../src/server/providers/railway/DemoRailwayProvider.js';

async function runTests() {
  console.log('🧪 Running Train Route Search Tests...');
  const provider = new DemoRailwayProvider();

  // Test 1: Origin before destination returns valid route
  const results = await provider.searchTrains({
    fromStationCode: 'NDLS',
    toStationCode: 'MMCT',
    journeyDate: '2026-11-10',
    passengerCount: 1,
  });

  if (results.length === 0) {
    throw new Error('FAIL: Expected trains between NDLS and MMCT, got 0');
  }
  console.log(`✅ Test 1 Passed: Found ${results.length} trains from NDLS to MMCT.`);

  // Test 2: Inverted sequence (MMCT to NDLS on a southbound-only train) or non-existent route
  const sameStationResults = await provider.searchTrains({
    fromStationCode: 'NDLS',
    toStationCode: 'NDLS',
    journeyDate: '2026-11-10',
  });
  if (sameStationResults.length !== 0) {
    throw new Error('FAIL: Expected 0 trains for identical source and destination');
  }
  console.log('✅ Test 2 Passed: Identical station pair correctly returns empty list.');

  // Test 3: Duration calculation crosses midnight correctly
  const rajdhani = results.find((t) => t.trainNumber === '12952');
  if (rajdhani) {
    if (rajdhani.dayOffset !== 1) {
      throw new Error(`FAIL: Expected dayOffset 1 for overnight train 12952, got ${rajdhani.dayOffset}`);
    }
    console.log(`✅ Test 3 Passed: Overnight journey duration calculated correctly: ${rajdhani.durationFormatted} (+${rajdhani.dayOffset} day).`);
  }

  // Test 4: Check demo sourceMode label
  if (results[0].sourceMode !== 'DEMO') {
    throw new Error('FAIL: Source mode must be DEMO in sandbox');
  }
  console.log('✅ Test 4 Passed: Inventory correctly marked with DEMO compliance flag.');

  // Test 5: Chennai Suburban Local EMU search
  const chennaiLocals = await provider.searchTrains({
    fromStationCode: 'MSB',
    toStationCode: 'TBM',
    journeyDate: '2026-11-10',
    passengerCount: 1,
  });

  if (chennaiLocals.length === 0) {
    throw new Error('FAIL: Expected Chennai Suburban trains between MSB and TBM, got 0');
  }
  const emu = chennaiLocals.find((t) => t.trainNumber === '40001');
  if (!emu) {
    throw new Error('FAIL: Expected Fast Local EMU 40001 in results');
  }
  const secondClass = emu.classes.find((c) => c.code === 'II');
  if (!secondClass || secondClass.fare !== 10) {
    throw new Error(`FAIL: Expected suburban II fare of ₹10, got ${secondClass?.fare}`);
  }
  console.log(`✅ Test 5 Passed: Chennai Suburban Local train found (${chennaiLocals.length} trains from Beach to Tambaram) with correct suburban fare (₹${secondClass.fare}).`);

  console.log('🎉 All train search tests passed successfully!\n');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
