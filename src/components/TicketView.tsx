import { CheckCircle2, Download, Printer, QrCode, Shield, Train } from 'lucide-react';
import React from 'react';
import { Booking } from '../types';

interface TicketViewProps {
  booking: Booking;
  onCancel?: () => void;
  canCancel?: boolean;
}

export const TicketView: React.FC<TicketViewProps> = ({ booking, onCancel, canCancel = false }) => {
  const handlePrint = () => {
    window.print();
  };

  const isConfirmed = booking.status === 'CONFIRMED';
  const isCancelled = booking.status === 'CANCELLED';
  const isSuburban = booking.trainName.includes('Local') ||
    booking.trainName.includes('EMU') ||
    booking.trainName.includes('MRTS') ||
    booking.classCode === 'II';

  return (
    <div className="space-y-4">
      {/* Top action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
              isConfirmed
                ? 'bg-emerald-100 text-emerald-800'
                : isCancelled
                ? 'bg-rose-100 text-rose-800'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            {booking.status}
          </span>
          <span className="text-xs text-slate-500">
            Reference: <strong className="font-mono text-slate-800">{booking.publicReference}</strong>
          </span>
          {isSuburban && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
              Chennai Suburban EMU
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {canCancel && isConfirmed && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel Booking
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print E-Ticket</span>
          </button>
        </div>
      </div>

      {/* Printable Boarding Ticket */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden text-slate-900">
        {/* Ticket Header */}
        <div className={`${isSuburban ? 'bg-indigo-950' : 'bg-blue-900'} text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">
                {isSuburban ? 'Southern Railway · Chennai Suburban Local E-Ticket' : 'RailConnect Electronic Reservation Slip'}
              </div>
              <div className="text-xs text-blue-200">
                {isSuburban ? 'Paperless Suburban Journey Ticket (UTS Division: MAS)' : 'Standard Railway Passenger E-Ticket'}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-blue-200">Platform Reference</div>
            <div className="text-base font-mono font-bold tracking-wider">{booking.publicReference}</div>
          </div>
        </div>

        {/* Demo Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center justify-between">
          <span>
            <strong>DEMO PASSENGER TICKET:</strong> This electronic ticket is issued in sandbox demo mode for testing and integration.
          </span>
          <span className="font-mono font-semibold">PROVIDER: DEMO</span>
        </div>

        {/* Train & Journey Meta */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Train Details</div>
              <div className="text-base font-bold text-slate-900 mt-1 font-mono">{booking.trainNumber}</div>
              <div className="text-xs font-medium text-slate-600 truncate">{booking.trainName}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Travel Class & Date</div>
              <div className="text-base font-bold text-slate-900 mt-1">{booking.className} ({booking.classCode})</div>
              <div className="text-xs font-medium text-slate-600">{booking.journeyDate}</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Departure (From)</div>
              <div className="text-base font-bold text-slate-900 mt-1 font-mono">{booking.departureTime}</div>
              <div className="text-xs font-medium text-slate-600">{booking.sourceStationName} ({booking.sourceStationCode})</div>
            </div>

            <div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Arrival (To)</div>
              <div className="text-base font-bold text-slate-900 mt-1 font-mono">{booking.arrivalTime}</div>
              <div className="text-xs font-medium text-slate-600">{booking.destStationName} ({booking.destStationCode})</div>
            </div>
          </div>
        </div>

        {/* Passenger Manifest Table */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Passenger Manifest</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                  <th className="pb-2 font-semibold">#</th>
                  <th className="pb-2 font-semibold">Passenger Name</th>
                  <th className="pb-2 font-semibold">Age / Gender</th>
                  <th className="pb-2 font-semibold">Berth Preference</th>
                  <th className="pb-2 font-semibold">Coach / Seat</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {booking.passengers.map((p, idx) => (
                  <tr key={p.id || idx}>
                    <td className="py-3 text-slate-400">{idx + 1}</td>
                    <td className="py-3 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3">{p.age} yrs / {p.gender}</td>
                    <td className="py-3 text-slate-600">{p.berthPreference || 'No Preference'}</td>
                    <td className="py-3 font-mono font-bold text-blue-700">
                      {p.seatNumber || `${p.coach || 'B2'}-${20 + idx}`}
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-emerald-700">
                        {isConfirmed ? 'CNF (Confirmed)' : booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Fare Summary & Barcode */}
        <div className="p-6 sm:p-8 bg-slate-50/70 flex flex-wrap items-center justify-between gap-6">
          {/* Fare Breakdown */}
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex gap-6">
              <span>Base Ticket Fare:</span>
              <span className="font-mono text-slate-800">₹{booking.fareBreakdown.baseFare.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex gap-6">
              <span>Reservation & Superfast Fee:</span>
              <span className="font-mono text-slate-800">₹{(booking.fareBreakdown.reservationCharge + booking.fareBreakdown.superfastFee).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex gap-6">
              <span>GST Taxes (5%):</span>
              <span className="font-mono text-slate-800">₹{booking.fareBreakdown.taxes.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex gap-6 pt-1 text-sm font-bold text-slate-900">
              <span>Total Paid Amount:</span>
              <span className="font-mono text-blue-700">₹{booking.fareBreakdown.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Barcode & Verification Badge */}
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200">
            {/* SVG Simulated Barcode */}
            <div className="h-10 w-44 flex items-center justify-between px-1">
              {[3, 1, 4, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3].map((width, i) => (
                <div
                  key={i}
                  className="bg-slate-900 h-full"
                  style={{ width: `${width * 1.5}px` }}
                ></div>
              ))}
            </div>
            <div className="text-[10px] font-mono tracking-widest text-slate-500 mt-1">
              {booking.publicReference}
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed flex items-center justify-between">
          <span>Valid with recognized government photo ID card (Aadhaar, Passport, Driving License, Voter ID).</span>
          <span>Booked on: {new Date(booking.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};
