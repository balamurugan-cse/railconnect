import { AlertCircle, ArrowLeftRight, Calendar, Filter, RefreshCw, Search, SlidersHorizontal, Train as TrainIcon, Users } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { SearchForm } from '../components/SearchForm';
import { TrainCard } from '../components/TrainCard';
import { FilterState, TrainFilters } from '../components/TrainFilters';
import { api } from '../services/api';
import { TrainSearchResult } from '../types';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const from = searchParams.get('from') || 'NDLS';
  const to = searchParams.get('to') || 'MMCT';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const passengers = parseInt(searchParams.get('passengers') || '1', 10);
  const classCode = searchParams.get('class') || 'ALL';

  const [trains, setTrains] = useState<TrainSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModifySearch, setShowModifySearch] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<FilterState>({
    departureSlots: [],
    trainTypes: [],
    travelClasses: [],
    sortBy: 'dep_earliest',
  });

  const fetchTrains = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.searchTrains({
        from,
        to,
        date,
        passengers,
        classCode: classCode === 'ALL' ? undefined : classCode,
      });
      setTrains(res.trains || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load trains for selected route.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, [from, to, date, passengers, classCode]);

  // Extract available filter values from current results
  const availableTrainTypes = useMemo(() => {
    const types = new Set<string>();
    trains.forEach((t) => types.add(t.trainType));
    return Array.from(types);
  }, [trains]);

  const availableClasses = useMemo(() => {
    const classes = new Set<string>();
    trains.forEach((t) => t.classes.forEach((c) => classes.add(c.code)));
    return Array.from(classes);
  }, [trains]);

  // Filter & sort trains
  const filteredTrains = useMemo(() => {
    let result = [...trains];

    // Filter by departure slot
    if (filters.departureSlots.length > 0) {
      result = result.filter((t) => {
        const hour = parseInt(t.departureTime.split(':')[0], 10);
        return filters.departureSlots.some((slot) => {
          if (slot === 'early') return hour >= 0 && hour < 6;
          if (slot === 'morning') return hour >= 6 && hour < 12;
          if (slot === 'afternoon') return hour >= 12 && hour < 18;
          if (slot === 'night') return hour >= 18 && hour < 24;
          return false;
        });
      });
    }

    // Filter by train types
    if (filters.trainTypes.length > 0) {
      result = result.filter((t) => filters.trainTypes.includes(t.trainType));
    }

    // Filter by classes
    if (filters.travelClasses.length > 0) {
      result = result.filter((t) =>
        t.classes.some((c) => filters.travelClasses.includes(c.code))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'dep_earliest') {
        return a.departureTime.localeCompare(b.departureTime);
      }
      if (filters.sortBy === 'dep_latest') {
        return b.departureTime.localeCompare(a.departureTime);
      }
      if (filters.sortBy === 'duration_asc') {
        return a.durationMinutes - b.durationMinutes;
      }
      if (filters.sortBy === 'fare_asc') {
        const minFareA = Math.min(...a.classes.map((c) => c.fare));
        const minFareB = Math.min(...b.classes.map((c) => c.fare));
        return minFareA - minFareB;
      }
      return 0;
    });

    return result;
  }, [trains, filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Route Header Strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-mono text-slate-900">{from}</span>
            <span className="text-slate-400">→</span>
            <span className="text-xl font-bold font-mono text-slate-900">{to}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{passengers} Traveler{passengers > 1 ? 's' : ''}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModifySearch(!showModifySearch)}
          className="px-4 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
        >
          {showModifySearch ? 'Hide Search Form' : 'Modify Search'}
        </button>
      </div>

      {/* Modify Search Drawer */}
      {showModifySearch && (
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <SearchForm
            initialFrom={from}
            initialTo={to}
            initialDate={date}
            initialPassengers={passengers}
            initialClass={classCode}
            compact
          />
        </div>
      )}

      {/* Two-Column Grid: Filters Sidebar + Results List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-3">
          <TrainFilters
            filters={filters}
            onChange={setFilters}
            availableTrainTypes={availableTrainTypes}
            availableClasses={availableClasses}
          />
        </div>

        {/* Train Results Column */}
        <div className="lg:col-span-9 space-y-4">
          {/* Status count & Transparency Notice */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <strong className="text-slate-900 font-semibold">{filteredTrains.length}</strong> of{' '}
              <strong className="text-slate-900 font-semibold">{trains.length}</strong> train{trains.length === 1 ? '' : 's'} available
            </div>
            <div className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              DATA SOURCE: DEMO · Live seats subject to authorized integration
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse space-y-4">
                  <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-10 bg-slate-100 rounded"></div>
                    <div className="h-10 bg-slate-100 rounded"></div>
                    <div className="h-10 bg-slate-100 rounded"></div>
                  </div>
                  <div className="h-16 bg-slate-50 rounded"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">{error}</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Could not retrieve train schedules. Please check your station inputs or try refreshing.
              </p>
              <button
                type="button"
                onClick={fetchTrains}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Search</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && filteredTrains.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <TrainIcon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Direct Trains Found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                We couldn't find active trains running from <strong className="text-slate-800">{from}</strong> to{' '}
                <strong className="text-slate-800">{to}</strong> on {date}.
              </p>

              <div className="pt-2 text-xs text-slate-600">
                <span>Try one of these active seeded corridors:</span>
                <div className="flex flex-wrap justify-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => navigate('/trains?from=NDLS&to=MMCT&date=' + date)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-semibold cursor-pointer"
                  >
                    NDLS ⇄ MMCT (New Delhi to Mumbai)
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/trains?from=NDLS&to=CNB&date=' + date)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-semibold cursor-pointer"
                  >
                    NDLS ⇄ CNB (New Delhi to Kanpur)
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/trains?from=MAS&to=SBC&date=' + date)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 text-xs font-semibold cursor-pointer"
                  >
                    MAS ⇄ SBC (Chennai to Bengaluru)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results List */}
          {!isLoading && !error && filteredTrains.length > 0 && (
            <div className="space-y-4">
              {filteredTrains.map((train) => (
                <TrainCard
                  key={train.trainId}
                  train={train}
                  journeyDate={date}
                  passengersCount={passengers}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
