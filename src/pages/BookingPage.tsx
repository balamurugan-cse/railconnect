import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  Shield,
  Trash2,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FareBreakdown, PassengerInput } from '../types';

export const BookingPage: React.FC = () => {
  const { trainId } = useParams<{ trainId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const trainNumber = searchParams.get('trainNumber') || '12002';
  const trainName = searchParams.get('trainName') || 'Express';
  const trainType = searchParams.get('trainType') || 'Superfast';
  const classCode = searchParams.get('classCode') || '3A';
  const className = searchParams.get('className') || 'AC 3 Tier';
  const fromCode = searchParams.get('fromCode') || 'NDLS';
  const fromName = searchParams.get('fromName') || 'New Delhi';
  const toCode = searchParams.get('toCode') || 'MMCT';
  const toName = searchParams.get('toName') || 'Mumbai Central';
  const departureTime = searchParams.get('departureTime') || '06:00';
  const arrivalTime = searchParams.get('arrivalTime') || '14:00';
  const journeyDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const initialCount = parseInt(searchParams.get('passengers') || '1', 10);

  const [passengers, setPassengers] = useState<PassengerInput[]>(
    Array.from({ length: Math.max(1, Math.min(6, initialCount)) }, (_, idx) => ({
      name: idx === 0 && user ? user.name : '',
      age: idx === 0 ? 30 : '',
      gender: 'Male',
      berthPreference: classCode === 'CC' || classCode === 'EC' ? 'Window' : 'Lower',
    }))
  );

  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 43210');
  const [termsAccepted, setTermsAccepted] = useState(true);

  const [quote, setQuote] = useState<FareBreakdown | null>(null);
  const [isQuoting, setIsQuoting] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update contact email if user logs in
  useEffect(() => {
    if (user) {
      if (!contactEmail) setContactEmail(user.email);
      if (passengers[0] && !passengers[0].name) {
        setPassengers((prev) => [{ ...prev[0], name: user.name }, ...prev.slice(1)]);
      }
    }
  }, [user]);

  // Fetch server-calculated quote whenever passenger count changes
  useEffect(() => {
    async function loadQuote() {
      if (!trainId) return;
      setIsQuoting(true);
      try {
        const res = await api.getFareQuote({
          trainId,
          classCode,
          passengerCount: passengers.length,
          fromCode,
          toCode,
        });
        setQuote(res.quote.breakdown);
      } catch (err: any) {
        console.error('Failed to get fare quote:', err);
      } finally {
        setIsQuoting(false);
      }
    }
    loadQuote();
  }, [trainId, classCode, passengers.length, fromCode, toCode]);

  const handleAddPassenger = () => {
    if (passengers.length >= 6) return;
    setPassengers((prev) => [
      ...prev,
      {
        name: '',
        age: '',
        gender: 'Male',
        berthPreference: classCode === 'CC' || classCode === 'EC' ? 'Window' : 'Lower',
      },
    ]);
  };

  const handleRemovePassenger = (index: number) => {
    if (passengers.length <= 1) return;
    setPassengers((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePassengerChange = (index: number, field: keyof PassengerInput, val: any) => {
    setPassengers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in to complete your booking reservation.');
      return;
    }

    // Validate passengers
    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];
      if (!p.name || p.name.trim().length < 2) {
        setError(`Passenger #${i + 1} requires a valid full name.`);
        return;
      }
      if (!p.age || Number(p.age) < 1 || Number(p.age) > 120) {
        setError(`Passenger #${i + 1} requires a valid age between 1 and 120.`);
        return;
      }
    }

    if (!termsAccepted) {
      setError('You must accept the journey terms and conditions.');
      return;
    }

    setIsSubmitting(true);
    try {
      const idempotencyKey = `idemp_${user.id}_${trainId}_${journeyDate}_${Date.now()}`;

      const res = await api.createBooking({
        trainId,
        trainNumber,
        trainName,
        sourceStationCode: fromCode,
        sourceStationName: fromName,
        destStationCode: toCode,
        destStationName: toName,
        departureTime,
        arrivalTime,
        journeyDate,
        classCode,
        className,
        passengers: passengers.map((p) => ({
          name: p.name.trim(),
          age: Number(p.age),
          gender: p.gender,
          berthPreference: p.berthPreference,
        })),
        idempotencyKey,
      });

      // Navigate to payment page for this booking
      navigate(`/payment/${res.booking.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create booking.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-semibold">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-mono">1</span>
            <span>Select Train</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2 text-blue-600">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono">2</span>
            <span>Passenger Details</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-mono">3</span>
            <span>Sandbox Payment</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-mono">4</span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      {/* Main Booking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Passenger & Contact Form */}
        <div className="lg:col-span-8 space-y-6">
          {/* Journey Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {trainNumber}
                </span>
                <span className="font-bold text-slate-900 text-base">{trainName}</span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-medium text-slate-500">{trainType}</span>
              </div>
              <div className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                {className} ({classCode})
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Departure Station</span>
                <span className="font-bold text-slate-800 text-sm">{fromCode} · {fromName}</span>
                <span className="text-slate-500 block font-mono mt-0.5">{departureTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Arrival Station</span>
                <span className="font-bold text-slate-800 text-sm">{toCode} · {toName}</span>
                <span className="text-slate-500 block font-mono mt-0.5">{arrivalTime}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Journey Date</span>
                <span className="font-bold text-slate-800 text-sm">{journeyDate}</span>
                <span className="text-slate-500 block mt-0.5">DEMO Provider Data</span>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Passenger Form */}
          <form onSubmit={handleSubmitBooking} className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                    Passenger Details ({passengers.length} of 6)
                  </h3>
                </div>

                {passengers.length < 6 && (
                  <button
                    type="button"
                    onClick={handleAddPassenger}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Passenger</span>
                  </button>
                )}
              </div>

              {/* Passenger Cards */}
              <div className="space-y-4">
                {passengers.map((p, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Passenger {index + 1}</span>
                      {passengers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePassenger(index)}
                          className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                          title="Remove passenger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Name */}
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Full Name (as per Govt ID)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rahul Verma"
                          value={p.name}
                          onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      {/* Age */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Age
                        </label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={120}
                          placeholder="Age"
                          value={p.age}
                          onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>

                      {/* Gender */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Gender
                        </label>
                        <select
                          value={p.gender}
                          onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Berth Preference */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Berth / Seat
                        </label>
                        <select
                          value={p.berthPreference}
                          onChange={(e) => handlePassengerChange(index, 'berthPreference', e.target.value)}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                        >
                          {classCode === 'CC' || classCode === 'EC' ? (
                            <>
                              <option value="Window">Window</option>
                              <option value="Aisle">Aisle</option>
                              <option value="No Preference">No Preference</option>
                            </>
                          ) : (
                            <>
                              <option value="Lower">Lower Berth</option>
                              <option value="Middle">Middle Berth</option>
                              <option value="Upper">Upper Berth</option>
                              <option value="Side Lower">Side Lower</option>
                              <option value="Side Upper">Side Upper</option>
                              <option value="No Preference">No Preference</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Information */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Ticket Communication Info
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Email Address (for E-Ticket)
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="passenger@railconnect.com"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Mobile Number (for SMS updates)
                    </label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 mt-0.5"
                  />
                  <span>
                    I accept RailConnect's booking policy, refund rules, and acknowledge this is a sandbox prototype demonstration.
                  </span>
                </label>
              </div>
            </div>

            {/* Auth Banner if guest */}
            {!user && (
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="text-blue-900">
                  <strong className="block font-bold">Sign In Required to Reserve</strong>
                  <span>Please sign in or register to complete your train ticket booking.</span>
                </div>
                <Link
                  to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Sign In / Register
                </Link>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Search</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !user}
                className={`px-8 py-3 text-xs font-bold text-white rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer ${
                  isSubmitting || !user
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <span>Reserving Seats...</span>
                ) : (
                  <>
                    <span>Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Fare Breakdown Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Fare Breakdown
            </h3>

            {isQuoting ? (
              <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                Calculating official fare quote...
              </div>
            ) : quote ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Base Ticket Fare ({passengers.length} traveler{passengers.length > 1 ? 's' : ''}):</span>
                  <span className="font-mono text-slate-900 tabular-nums">₹{quote.baseFare.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Reservation Charges:</span>
                  <span className="font-mono text-slate-900 tabular-nums">₹{quote.reservationCharge.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Superfast Supplementary Charge:</span>
                  <span className="font-mono text-slate-900 tabular-nums">₹{quote.superfastFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Goods & Services Tax (GST 5%):</span>
                  <span className="font-mono text-slate-900 tabular-nums">₹{quote.taxes.toLocaleString('en-IN')}</span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-sm font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-xl font-mono text-blue-700 tabular-nums">
                    ₹{quote.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 leading-relaxed">
              Fares calculated on the server. Includes authorized safety surcharges and taxes.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Seat Allocation Rule</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Berth preferences are assigned subject to availability. Senior citizens and women traveling alone are automatically prioritized for lower berths.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
