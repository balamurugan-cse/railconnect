import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  Train,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TicketView } from '../components/TicketView';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Booking } from '../types';

export const MyTripsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await api.getBookings();
      setBookings(res.bookings || []);
      if (res.bookings && res.bookings.length > 0 && !selectedBooking) {
        setSelectedBooking(res.bookings[0]);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setIsCancelling(true);
    try {
      const res = await api.cancelBooking(cancelModalBooking.id, 'Passenger cancellation request');
      setCancelSuccessMsg(res.cancellation?.message || 'Booking cancelled successfully.');
      setCancelModalBooking(null);
      await fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Train className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign In to View Your Trips</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Access your confirmed train tickets, passenger manifests, and cancellation requests.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <Link
            to="/login?redirect=/my-trips"
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
          >
            Sign In to View Trips
          </Link>
          <Link
            to="/login?mode=register&redirect=/my-trips"
            className="px-6 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl"
          >
            Register Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Train Trips</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and view your upcoming journeys and historical bookings</p>
        </div>

        <Link
          to="/trains"
          className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
        >
          Book New Ticket
        </Link>
      </div>

      {cancelSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800 flex items-center justify-between">
          <span>{cancelSuccessMsg}</span>
          <button
            type="button"
            onClick={() => setCancelSuccessMsg(null)}
            className="text-xs text-emerald-700 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Grid: Trips List + Detailed Ticket Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Bookings List */}
        <div className="lg:col-span-5 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-xs text-slate-500">You don't have any train bookings yet.</p>
              <Link
                to="/trains"
                className="text-xs font-bold text-blue-600 hover:underline inline-block"
              >
                Search Trains & Book
              </Link>
            </div>
          ) : (
            bookings.map((b) => {
              const isSelected = selectedBooking?.id === b.id;
              const isConfirmed = b.status === 'CONFIRMED';
              const isCancelled = b.status === 'CANCELLED';

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 ring-2 ring-blue-600/10 bg-white shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {b.publicReference}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        isConfirmed
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCancelled
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-900 truncate">
                    {b.trainNumber} · {b.trainName}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <span>{b.sourceStationCode}</span>
                    <span className="text-slate-400">→</span>
                    <span>{b.destStationCode}</span>
                    <span className="text-slate-300">·</span>
                    <span>{b.journeyDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <span>{b.className} ({b.passengers.length} pax)</span>
                    <span className="font-mono font-bold text-slate-900">
                      ₹{b.fareBreakdown.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Booking Detail / Ticket View */}
        <div className="lg:col-span-7">
          {selectedBooking ? (
            <TicketView
              booking={selectedBooking}
              canCancel={selectedBooking.status === 'CONFIRMED'}
              onCancel={() => setCancelModalBooking(selectedBooking)}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
              Select a trip from the left list to view ticket details.
            </div>
          )}
        </div>
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Cancel Booking?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to cancel booking <strong className="font-mono text-slate-900">{cancelModalBooking.publicReference}</strong>?
            </p>

            {/* Refund Calculation Preview */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Original Fare Paid:</span>
                <span className="font-mono text-slate-900">₹{cancelModalBooking.fareBreakdown.totalAmount}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Cancellation Charges (₹120/pax):</span>
                <span className="font-mono text-rose-600">-₹{120 * cancelModalBooking.passengers.length}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Estimated Refund:</span>
                <span className="font-mono text-emerald-700">
                  ₹{Math.max(0, cancelModalBooking.fareBreakdown.totalAmount - 120 * cancelModalBooking.passengers.length)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalBooking(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                {isCancelling ? 'Processing...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
