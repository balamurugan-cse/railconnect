import { AlertCircle, CheckCircle2, QrCode, Search, Train } from 'lucide-react';
import React, { useState } from 'react';
import { api } from '../services/api';

export const PnrStatusPage: React.FC = () => {
  const [pnrInput, setPnrInput] = useState('RC-BKG-849201');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pnrInput.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.getPnrStatus(pnrInput.trim());
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'PNR number or booking reference not found.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">PNR Status Inquiry</h1>
        <p className="text-xs text-slate-500">
          Enter your 10-digit railway PNR number or RailConnect platform reference (e.g. RC-BKG-849201).
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={pnrInput}
              onChange={(e) => setPnrInput(e.target.value.toUpperCase())}
              placeholder="e.g. RC-BKG-849201 or 1234567890"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Searching...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Get Status</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Quick Test References:</span>
          {['RC-BKG-849201', '8492017732'].map((ref) => (
            <button
              key={ref}
              type="button"
              onClick={() => {
                setPnrInput(ref);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono text-[11px] text-blue-700 font-semibold cursor-pointer"
            >
              {ref}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Reference Number</span>
              <div className="text-xl font-bold font-mono text-white">{result.reference}</div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              {result.bookingStatus || 'CONFIRMED'}
            </span>
          </div>

          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-900 flex justify-between items-center">
            <span>Notice: {result.notice}</span>
            <span className="font-mono font-bold text-[10px]">SOURCE: {result.sourceMode}</span>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Train Info</span>
                <span className="font-bold text-slate-900 text-sm">{result.trainNumber} · {result.trainName}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Journey Date & Class</span>
                <span className="font-bold text-slate-900 text-sm">{result.journeyDate} · Class {result.classCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">From Station</span>
                <span className="font-medium text-slate-800">{result.sourceStation}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">To Station</span>
                <span className="font-medium text-slate-800">{result.destStation}</span>
              </div>
            </div>

            {/* Passenger Seat Allocation */}
            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Passenger Berths</h4>
              <div className="space-y-2">
                {result.passengers.map((p: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-slate-500 text-[11px]">Seat: {p.seatNumber || `${p.coach}-12`}</span>
                    </div>
                    <span className="font-bold text-emerald-700 font-mono">{p.status || 'CNF'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
