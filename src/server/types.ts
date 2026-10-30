/**
 * RailConnect - Core Backend Types & Contracts
 */

export type Role = 'USER' | 'ADMIN';

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'FAILED' | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type SourceMode = 'LIVE' | 'CACHED' | 'DEMO';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  active: boolean;
}

export interface Train {
  id: string;
  trainNumber: string;
  name: string;
  trainType: string;
  active: boolean;
}

export interface TrainStop {
  id: string;
  trainId: string;
  stationId: string;
  stationCode: string;
  stationName: string;
  sequence: number;
  arrivalTime: string;   // e.g. "06:00"
  departureTime: string; // e.g. "06:10"
  dayOffset: number;     // 0 = day 1, 1 = day 2
  distanceKm?: number;
  platform?: string;
}

export interface TrainClass {
  id: string;
  trainId: string;
  code: string;  // 1A, 2A, 3A, 3E, CC, EC, SL, 2S
  label: string; // AC First Class, AC 2 Tier, AC 3 Tier, etc.
}

export interface FareQuote {
  id: string;
  trainId: string;
  classCode: string;
  baseAmount: number;
  reservationFee: number;
  superfastCharge: number;
  taxAmount: number; // 5% GST
  totalAmount: number;
  currency: string;
  sourceMode: SourceMode;
  fetchedAt: string;
  expiresAt: string;
}

export interface AvailabilitySnapshot {
  id: string;
  trainId: string;
  journeyDate: string; // YYYY-MM-DD
  classCode: string;
  status: 'AVAILABLE' | 'RAC' | 'WL' | 'NOT_AVAILABLE';
  availableCount: number | null; // e.g. 42 seats, or RAC 14, WL 8
  sourceMode: SourceMode;
  fetchedAt: string;
}

export interface Passenger {
  id: string;
  bookingId: string;
  name: string;
  age: number;
  gender?: 'Male' | 'Female' | 'Other';
  berthPreference?: 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'Window' | 'Aisle' | 'No Preference';
  coach?: string;
  seatNumber?: string;
}

export interface Booking {
  id: string;
  publicReference: string; // e.g. RC-BKG-849201
  userId: string;
  userEmail?: string;
  userName?: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  sourceStationCode: string;
  sourceStationName: string;
  destStationCode: string;
  destStationName: string;
  departureTime: string;
  arrivalTime: string;
  journeyDate: string;
  classCode: string;
  className: string;
  status: BookingStatus;
  passengers: Passenger[];
  fareBreakdown: {
    baseFare: number;
    reservationCharge: number;
    superfastFee: number;
    taxes: number;
    discount: number;
    totalAmount: number;
  };
  currency: string;
  idempotencyKey?: string;
  providerPnr: string | null; // null in demo or authorized until live confirmation
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  provider: string; // 'sandbox' | 'stripe' | 'razorpay'
  providerPaymentId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  idempotencyKey?: string;
  paidAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorUserId?: string;
  actorEmail?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  requestId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface TrainSearchResult {
  trainId: string;
  trainNumber: string;
  name: string;
  trainType: string;
  originStation: Station;
  destinationStation: Station;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  durationFormatted: string;
  dayOffset: number;
  runningDays: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  intermediateStopsCount: number;
  classes: {
    code: string;
    label: string;
    fare: number;
    availability: {
      status: 'AVAILABLE' | 'RAC' | 'WL' | 'NOT_AVAILABLE';
      count: number | null;
      sourceMode: SourceMode;
      lastUpdated: string;
    };
  }[];
  sourceMode: SourceMode;
}
