import { db } from '../../db/store.js';
import { AvailabilitySnapshot, FareQuote, Station, TrainSearchResult } from '../../types.js';
import {
  RailwayCancellationResponse,
  RailwayProvider,
  RailwayReservationRequest,
  RailwayReservationResponse,
  SearchTrainsParams,
} from './RailwayProvider.js';

export class DemoRailwayProvider implements RailwayProvider {
  /**
   * Search trains where stop sequence includes origin before destination.
   */
  async searchTrains(params: SearchTrainsParams): Promise<TrainSearchResult[]> {
    const fromCode = params.fromStationCode.trim().toUpperCase();
    const toCode = params.toStationCode.trim().toUpperCase();

    if (fromCode === toCode) {
      return [];
    }

    const results: TrainSearchResult[] = [];

    // Find all active trains
    for (const train of db.trains.values()) {
      if (!train.active) continue;

      // Find all stops for this train sorted by sequence
      const stops = Array.from(db.trainStops.values())
        .filter((s) => s.trainId === train.id)
        .sort((a, b) => a.sequence - b.sequence);

      const originStop = stops.find((s) => s.stationCode === fromCode);
      const destStop = stops.find((s) => s.stationCode === toCode);

      // Origin must exist, Destination must exist, and Origin must come strictly before Destination
      if (!originStop || !destStop || originStop.sequence >= destStop.sequence) {
        continue;
      }

      // Calculate travel duration accurately across day offsets
      const [depH, depM] = originStop.departureTime.split(':').map(Number);
      const [arrH, arrM] = destStop.arrivalTime.split(':').map(Number);

      const originDayMinutes = depH * 60 + depM;
      const dayDiff = destStop.dayOffset - originStop.dayOffset;
      const destDayMinutes = dayDiff * 1440 + (arrH * 60 + arrM);
      const durationMinutes = destDayMinutes - originDayMinutes;

      const durH = Math.floor(durationMinutes / 60);
      const durM = durationMinutes % 60;
      const durationFormatted = `${durH}h ${durM.toString().padStart(2, '0')}m`;

      // Intermediate stops between origin and destination
      const intermediateStopsCount = Math.max(0, destStop.sequence - originStop.sequence - 1);

      // Get origin and destination station info
      const originStation = db.stations.get(originStop.stationId) || {
        id: originStop.stationId,
        code: originStop.stationCode,
        name: originStop.stationName,
        city: '',
        state: '',
        active: true,
      };

      const destStation = db.stations.get(destStop.stationId) || {
        id: destStop.stationId,
        code: destStop.stationCode,
        name: destStop.stationName,
        city: '',
        state: '',
        active: true,
      };

      // Get classes and generate availability
      const trainClasses = Array.from(db.trainClasses.values()).filter((c) => c.trainId === train.id);

      const classesWithFares = await Promise.all(
        trainClasses.map(async (cls) => {
          const fareQuote = await this.getFare(train.id, cls.code, fromCode, toCode);
          const availability = await this.getAvailability(train.id, params.journeyDate, cls.code);

          return {
            code: cls.code,
            label: cls.label,
            fare: fareQuote.totalAmount,
            availability: {
              status: availability.status,
              count: availability.availableCount,
              sourceMode: availability.sourceMode,
              lastUpdated: availability.fetchedAt,
            },
          };
        })
      );

      // Filter by requested class if specified
      const filteredClasses = params.classCode && params.classCode !== 'ALL'
        ? classesWithFares.filter((c) => c.code === params.classCode)
        : classesWithFares;

      if (filteredClasses.length === 0) continue;

      results.push({
        trainId: train.id,
        trainNumber: train.trainNumber,
        name: train.name,
        trainType: train.trainType,
        originStation,
        destinationStation: destStation,
        departureTime: originStop.departureTime,
        arrivalTime: destStop.arrivalTime,
        durationMinutes,
        durationFormatted,
        dayOffset: dayDiff,
        runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        intermediateStopsCount,
        classes: filteredClasses,
        sourceMode: 'DEMO',
      });
    }

    return results;
  }

  async getTrainDetails(trainId: string): Promise<any> {
    const train = db.trains.get(trainId);
    if (!train) return null;

    const stops = Array.from(db.trainStops.values())
      .filter((s) => s.trainId === train.id)
      .sort((a, b) => a.sequence - b.sequence);

    const classes = Array.from(db.trainClasses.values())
      .filter((c) => c.trainId === train.id);

    return {
      ...train,
      stops,
      classes,
      sourceMode: 'DEMO',
    };
  }

  async getAvailability(trainId: string, journeyDate: string, classCode: string): Promise<AvailabilitySnapshot> {
    const key = `${trainId}_${journeyDate}_${classCode}`;
    const existing = db.availabilitySnapshots.get(key);

    if (existing) {
      return existing;
    }

    // Generate deterministic demo availability based on date & train
    const dateNum = journeyDate ? parseInt(journeyDate.replace(/-/g, ''), 10) : 20261105;
    const train = db.trains.get(trainId);
    const trainNum = train ? parseInt(train.trainNumber, 10) : 12002;
    const seed = (dateNum + trainNum + classCode.charCodeAt(0)) % 100;

    let status: 'AVAILABLE' | 'RAC' | 'WL' | 'NOT_AVAILABLE' = 'AVAILABLE';
    let availableCount: number | null = 42;

    if (seed < 70) {
      status = 'AVAILABLE';
      availableCount = Math.floor((seed / 70) * 80) + 6;
    } else if (seed < 88) {
      status = 'RAC';
      availableCount = Math.floor(((seed - 70) / 18) * 24) + 1;
    } else if (seed < 96) {
      status = 'WL';
      availableCount = Math.floor(((seed - 88) / 8) * 15) + 1;
    } else {
      status = 'NOT_AVAILABLE';
      availableCount = null;
    }

    const snapshot: AvailabilitySnapshot = {
      id: `avail_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      trainId,
      journeyDate,
      classCode,
      status,
      availableCount,
      sourceMode: 'DEMO',
      fetchedAt: new Date().toISOString(),
    };

    db.availabilitySnapshots.set(key, snapshot);
    return snapshot;
  }

  async getFare(trainId: string, classCode: string, fromCode?: string, toCode?: string): Promise<FareQuote> {
    const quoteKey = `fq_${trainId}_${classCode}`;
    const defaultQuote = Array.from(db.fareQuotes.values()).find(
      (q) => q.trainId === trainId && q.classCode === classCode
    );

    const train = db.trains.get(trainId);
    const isSuburban = Boolean(train && (
      train.trainType.includes('Suburban') ||
      train.trainType.includes('EMU') ||
      train.trainType.includes('Local') ||
      train.trainType.includes('MRTS')
    ));

    let baseFare = defaultQuote ? defaultQuote.baseAmount : (isSuburban ? 10 : 1200);

    // Adjust fare based on distance if stops are provided (only for long distance trains)
    if (!isSuburban && fromCode && toCode) {
      const stops = Array.from(db.trainStops.values())
        .filter((s) => s.trainId === trainId)
        .sort((a, b) => a.sequence - b.sequence);

      const originStop = stops.find((s) => s.stationCode === fromCode);
      const destStop = stops.find((s) => s.stationCode === toCode);

      if (originStop && destStop && originStop.distanceKm !== undefined && destStop.distanceKm !== undefined) {
        const segDist = Math.max(50, destStop.distanceKm - originStop.distanceKm);
        const totalDist = Math.max(100, stops[stops.length - 1].distanceKm || 1000);
        baseFare = Math.round((baseFare * segDist) / totalDist);
      }
    }

    const reservationFee = isSuburban ? 0 : 40;
    const superfastCharge = isSuburban ? 0 : 45;
    const taxAmount = isSuburban ? 0 : Math.round(baseFare * 0.05 * 100) / 100;
    const totalAmount = Math.round((baseFare + reservationFee + superfastCharge + taxAmount) * 100) / 100;

    return {
      id: quoteKey,
      trainId,
      classCode,
      baseAmount: baseFare,
      reservationFee,
      superfastCharge,
      taxAmount,
      totalAmount,
      currency: 'INR',
      sourceMode: 'DEMO',
      fetchedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    };
  }

  async createReservation(request: RailwayReservationRequest): Promise<RailwayReservationResponse> {
    const providerReference = `DEMO-RES-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const train = Array.from(db.trains.values()).find((t) => t.trainNumber === request.trainNumber);
    const isSuburban = Boolean(train && (
      train.trainType.includes('Suburban') ||
      train.trainType.includes('EMU') ||
      train.trainType.includes('Local') ||
      train.trainType.includes('MRTS')
    ));

    const coachPrefix = isSuburban
      ? (request.classCode === 'AC' ? 'AC-D2' : request.classCode === 'FC' ? 'FC-1' : 'GEN')
      : request.classCode === '1A' ? 'H1'
      : request.classCode === '2A' ? 'A1'
      : request.classCode === '3A' ? 'B2'
      : request.classCode === 'EC' ? 'E1'
      : request.classCode === 'CC' ? 'C3'
      : 'S4';

    const allocatedSeats = request.passengers.map((p, idx) => {
      const seatNum = Math.floor(10 + Math.random() * 50) + idx;
      const berth = isSuburban
        ? (request.classCode === 'AC' ? 'AC Suburban Seating' : request.classCode === 'FC' ? 'Suburban First Class' : 'Suburban General')
        : p.berthPreference && p.berthPreference !== 'No Preference'
        ? p.berthPreference
        : (request.classCode === 'CC' || request.classCode === 'EC')
          ? (idx % 2 === 0 ? 'Window' : 'Aisle')
          : (idx % 3 === 0 ? 'Lower' : idx % 3 === 1 ? 'Middle' : 'Upper');

      return {
        name: p.name,
        coach: coachPrefix,
        seatNumber: isSuburban ? `${coachPrefix} (Unreserved/Open Seating)` : `${coachPrefix}-${seatNum}`,
        berth,
      };
    });

    return {
      success: true,
      providerReference,
      providerPnr: null, // Strictly null: "Never generate or invent an official railway PNR. providerPnr stays null until supplied by authorized provider"
      status: 'CONFIRMED',
      allocatedSeats,
      sourceMode: 'DEMO',
      message: 'Demo railway reservation allocated successfully. Notice: Not a real railway reservation.',
    };
  }

  async cancelReservation(providerReference: string, reason?: string): Promise<RailwayCancellationResponse> {
    const cancellationFee = 180; // Standard demo cancellation fee
    return {
      success: true,
      status: 'CANCELLED',
      refundAmount: 0, // Will be computed relative to booking total
      cancellationFee,
      sourceMode: 'DEMO',
      message: 'Demo reservation cancelled successfully according to railway cancellation rules.',
    };
  }
}
