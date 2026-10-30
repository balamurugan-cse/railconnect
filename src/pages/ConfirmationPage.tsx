import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Printer,
  Sparkles,
  Train,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TicketView } from '../components/TicketView';
import { api } from '../services/api';
import { Booking } from '../types';

export const ConfirmationPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) return;
      try {
        const res = await api.getBooking(bookingId);
        setBooking(res.booking);
      } catch (err) {
        console.error('Failed to load booking confirmation:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadBooking();
  }, [bookingId]);

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-medium">Generating ticket confirmation...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Booking Confirmation Not Found</h2>
        <Link to="/trains" className="text-xs font-semibold text-blue-600 hover:underline">
          Return to Train Search
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Stepper Header (hidden during print) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Select Train</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Passenger Details</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Sandbox Payment</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      {/* Confirmation Success Banner (hidden during print) */}
      <div className="no-print bg-emerald-500 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Booking Confirmed!</h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              Your electronic reservation slip has been confirmed and stored in your account.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/my-trips"
            className="px-4 py-2 text-xs font-semibold bg-white text-emerald-900 rounded-xl hover:bg-emerald-50 transition-colors shadow-xs"
          >
            View in My Trips
          </Link>
          <Link
            to="/trains"
            className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-colors"
          >
            Book Another Train
          </Link>
        </div>
      </div>

      {/* Embedded Full E-Ticket */}
      <TicketView booking={booking} />
    </div>
  );
};
