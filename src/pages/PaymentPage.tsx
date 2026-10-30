import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  Lock,
  QrCode,
  ShieldCheck,
  Smartphone,
  Train,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Booking } from '../types';

export const PaymentPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('passenger@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [expiry, setExpiry] = useState('11/28');
  const [cvv, setCvv] = useState('•••');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return;
      setIsLoading(true);
      try {
        const res = await api.getBooking(bookingId);
        setBooking(res.booking);

        // If already paid and confirmed, redirect straight to confirmation
        if (res.booking.status === 'CONFIRMED') {
          navigate(`/booking-confirmation/${bookingId}`);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve booking.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId, navigate]);

  const handlePayNow = async () => {
    if (!booking) return;
    setIsProcessing(true);
    setError(null);

    try {
      const methodLabel =
        paymentMethod === 'upi'
          ? `UPI (${upiId})`
          : paymentMethod === 'card'
          ? 'Card Sandbox (RuPay / Visa)'
          : `NetBanking (${selectedBank})`;

      const res = await api.confirmSandboxPayment({
        bookingId: booking.id,
        paymentMethod: methodLabel,
        shouldFail: simulateFailure,
        idempotencyKey: `pay_idemp_${booking.id}_${Date.now()}`,
      });

      if (res.success) {
        navigate(`/booking-confirmation/${booking.id}`);
      }
    } catch (err: any) {
      setError(err.message || 'Payment transaction was declined.');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-medium">Loading checkout session...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Booking Session Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This booking may have expired or is invalid.'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
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
          <div className="flex items-center gap-2 text-blue-600">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-mono">3</span>
            <span>Sandbox Payment</span>
          </div>
          <span className="text-slate-300">———</span>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-mono">4</span>
            <span>Confirmation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Payment Methods */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                  Payment Gateway Sandbox
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                256-BIT ENCRYPTED
              </span>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-800 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Smartphone className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs">Cards</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'netbanking'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <Building2 className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                <span className="text-xs">NetBanking</span>
              </button>
            </div>

            {/* Method Details */}
            {paymentMethod === 'upi' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-semibold text-slate-700">Enter UPI ID (VPA)</div>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@okhdfcbank"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <div className="flex gap-2">
                  {['passenger@okhdfcbank', 'traveler@upi', 'test@paytm'].map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setUpiId(id)}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-semibold text-slate-700">Test Sandbox Card</div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Expiry</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      maxLength={4}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Notice: Never enter real debit or credit card details. This is an emulated test environment.
                </p>
              </div>
            )}

            {paymentMethod === 'netbanking' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-semibold text-slate-700">Select Bank</div>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Sandbox Testing Mode Toggle */}
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-2">
              <span className="font-bold text-amber-900 block">QA Sandbox Simulation Controls</span>
              <label className="flex items-center gap-2 text-amber-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 border-amber-300"
                />
                <span>Simulate payment gateway decline (tests error state)</span>
              </label>
            </div>

            {/* Pay Button */}
            <button
              type="button"
              onClick={handlePayNow}
              disabled={isProcessing}
              className={`w-full py-3.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isProcessing
                  ? 'bg-slate-400 cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying Server-Side Payment...</span>
                </>
              ) : (
                <span>
                  Authorize & Pay ₹{booking.fareBreakdown.totalAmount.toLocaleString('en-IN')}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100">
              Booking Details
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Booking Reference</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{booking.publicReference}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Train Journey</span>
                <span className="font-bold text-slate-800">{booking.trainNumber} · {booking.trainName}</span>
                <span className="text-slate-500 block">{booking.sourceStationName} → {booking.destStationName}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Class & Date</span>
                <span className="font-bold text-slate-800">{booking.className} ({booking.classCode})</span>
                <span className="text-slate-500 block">{booking.journeyDate}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Passengers</span>
                <span className="font-bold text-slate-800">{booking.passengers.length} traveler{booking.passengers.length > 1 ? 's' : ''}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline font-bold text-slate-900">
                <span>Amount Due:</span>
                <span className="text-xl font-mono text-emerald-700">
                  ₹{booking.fareBreakdown.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
