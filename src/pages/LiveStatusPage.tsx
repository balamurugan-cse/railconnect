import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  RefreshCw,
  Search,
  Train,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

export const LiveStatusPage: React.FC = () => {
  const [trainNumber, setTrainNumber] = useState('22436');
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveStatus = async (num: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getLiveStatus(num);
      setStatusData(res);
    } catch (err: any) {
      setError(err.message || 'Train running status not available.');
      setStatusData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStatus(trainNumber);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNumber.trim()) return;
    fetchLiveStatus(trainNumber.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Live Train Running Status</h1>
        <p className="text-xs text-slate-500">
          Track real-time GPS location, station arrivals, halts, and delays across the railway network.
        </p>
      </div>

      {/* Train Selector / Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="Enter 5-digit Train Number (e.g. 22436, 12952, 12002)"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white tracking-wider"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <span>Tracking...</span>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Track Train</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Active Trains:</span>
          {[
            { num: '22436', name: 'Vande Bharat' },
            { num: '12952', name: 'Tejas Rajdhani' },
            { num: '12002', name: 'Bhopal Shatabdi' },
            { num: '20608', name: 'MAS-SBC Vande Bharat' },
          ].map((t) => (
            <button
              key={t.num}
              type="button"
              onClick={() => {
                setTrainNumber(t.num);
                fetchLiveStatus(t.num);
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 font-mono text-[11px] text-blue-700 font-semibold cursor-pointer"
            >
              {t.num} ({t.name})
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Status Card & Timeline */}
      {statusData && (
        <div className="space-y-6">
          {/* Main Status Banner */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded border border-blue-900">
                  #{statusData.trainNumber}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                  {statusData.trainName}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {statusData.currentStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Current Station</span>
                <span className="font-bold text-white text-sm">{statusData.currentStation}</span>
                <span className="text-slate-400 block font-mono text-[11px]">({statusData.currentStationCode})</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Next Station</span>
                <span className="font-bold text-white text-sm">{statusData.nextStation}</span>
                <span className="text-slate-400 block font-mono text-[11px]">({statusData.nextStationCode})</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Cruising Speed</span>
                <span className="font-bold font-mono text-emerald-400 text-base">{statusData.speedKmH} km/h</span>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Distance Covered</span>
                <span className="font-bold font-mono text-white text-sm">
                  {statusData.distanceCoveredKm} / {statusData.totalDistanceKm} km
                </span>
              </div>
            </div>
          </div>

          {/* Route Progression Timeline */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-6">
              Station Halts & Schedule Progress
            </h3>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {statusData.stops.map((stop: any, idx: number) => {
                const isDeparted = stop.status === 'DEPARTED';
                const isCurrent = stop.status === 'CURRENT';
                const isUpcoming = stop.status === 'UPCOMING';

                return (
                  <div key={idx} className="relative group">
                    {/* Node Dot */}
                    <div
                      className={`absolute -left-6 sm:-left-8 top-1 w-4 h-4 rounded-full border-2 border-white transition-all ${
                        isCurrent
                          ? 'bg-blue-600 ring-4 ring-blue-100'
                          : isDeparted
                          ? 'bg-emerald-500'
                          : 'bg-slate-300'
                      }`}
                    ></div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{stop.stationName}</span>
                          <span className="font-mono text-xs font-semibold text-slate-500">({stop.stationCode})</span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              TRAIN AT STATION
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Platform: <strong className="text-slate-700 font-mono">{stop.platform || '1'}</strong>
                        </div>
                      </div>

                      <div className="text-right text-xs">
                        <div className="font-mono text-slate-700">
                          Arr: {stop.scheduledArrival} · Dep: {stop.scheduledDeparture}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          On Time (0m delay)
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
