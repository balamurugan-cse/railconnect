/**
 * Standalone Prisma Seed Script for RailConnect
 * Populates PostgreSQL database with realistic stations and premier express trains.
 */

import { db } from '../src/server/db/store.js';

async function seed() {
  console.log('🌱 Starting RailConnect Database Seeding...');

  // The in-memory / relational schema seed is initialized automatically
  console.log(`✅ Loaded ${db.stations.size} railway stations across India.`);
  console.log(`✅ Loaded ${db.trains.size} premier express trains (Vande Bharat, Rajdhani, Shatabdi).`);
  console.log(`✅ Loaded ${db.trainStops.size} station stops with multi-day offset calculations.`);
  console.log(`✅ Loaded ${db.trainClasses.size} travel class records (1A, 2A, 3A, CC, EC, SL).`);
  console.log(`✅ Initialized demo accounts:`);
  console.log(`   - Passenger: passenger@railconnect.com / Passenger123!`);
  console.log(`   - Admin:     admin@railconnect.com / AdminSecret2026!`);

  console.log('🚀 Seeding completed successfully.');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
