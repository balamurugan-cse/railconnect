export type Role = 'USER' | 'ADMIN';
export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'FAILED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type SourceMode = 'LIVE' | 'CACHED' | 'DEMO';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface Station {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  active: boolean;
}

export interface TrainClassInfo {
  code: string;
  label: string;
  fare: number;
  availability: {
    status: 'AVAILABLE' | 'RAC' | 'WL' | 'NOT_AVAILABLE';
    count: number | null;
    sourceMode: SourceMode;
    lastUpdated: string;
  };
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
  runningDays: string[];
  intermediateStopsCount: number;
  classes: TrainClassInfo[];
  sourceMode: SourceMode;
}

export interface PassengerInput {
  name: string;
  age: number | '';
  gender: 'Male' | 'Female' | 'Other';
  berthPreference: 'Lower' | 'Middle' | 'Upper' | 'Side Lower' | 'Side Upper' | 'Window' | 'Aisle' | 'No Preference';
}

export interface PassengerRecord extends PassengerInput {
  id: string;
  coach?: string;
  seatNumber?: string;
}

export interface FareBreakdown {
  baseFare: number;
  reservationCharge: number;
  superfastFee: number;
  taxes: number;
  discount: number;
  totalAmount: number;
}

export interface Booking {
  id: string;
  publicReference: string;
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
  passengers: PassengerRecord[];
  fareBreakdown: FareBreakdown;
  currency: string;
  idempotencyKey?: string;
  providerPnr: string | null;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
}
