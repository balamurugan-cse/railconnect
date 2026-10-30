import { AvailabilitySnapshot, FareQuote, TrainSearchResult } from '../../types.js';

export interface SearchTrainsParams {
  fromStationCode: string;
  toStationCode: string;
  journeyDate: string; // YYYY-MM-DD
  passengerCount?: number;
  classCode?: string;
}

export interface RailwayReservationRequest {
  trainNumber: string;
  journeyDate: string;
  classCode: string;
  sourceStationCode: string;
  destStationCode: string;
  passengers: {
    name: string;
    age: number;
    gender?: string;
    berthPreference?: string;
  }[];
  idempotencyKey?: string;
}

export interface RailwayReservationResponse {
  success: boolean;
  providerReference: string;
  providerPnr: string | null; // null if demo or not issued
  status: 'CONFIRMED' | 'RAC' | 'WL' | 'FAILED';
  allocatedSeats: {
    name: string;
    coach: string;
    seatNumber: string;
    berth: string;
  }[];
  sourceMode: 'LIVE' | 'CACHED' | 'DEMO';
  message: string;
}

export interface RailwayCancellationResponse {
  success: boolean;
  status: 'REQUESTED' | 'PROCESSING' | 'CANCELLED' | 'REJECTED';
  refundAmount: number;
  cancellationFee: number;
  sourceMode: 'LIVE' | 'CACHED' | 'DEMO';
  message: string;
}

export interface RailwayProvider {
  searchTrains(params: SearchTrainsParams): Promise<TrainSearchResult[]>;
  getTrainDetails(trainId: string): Promise<any>;
  getAvailability(trainId: string, journeyDate: string, classCode: string): Promise<AvailabilitySnapshot>;
  getFare(trainId: string, classCode: string, fromCode?: string, toCode?: string): Promise<FareQuote>;
  createReservation(request: RailwayReservationRequest): Promise<RailwayReservationResponse>;
  cancelReservation(providerReference: string, reason?: string): Promise<RailwayCancellationResponse>;
}
