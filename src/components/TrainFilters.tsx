import { Clock, Filter, RotateCcw, SlidersHorizontal, Train } from 'lucide-react';
import React from 'react';

export interface FilterState {
  departureSlots: string[]; // 'early' (0-6), 'morning' (6-12), 'afternoon' (12-18), 'night' (18-24)
  trainTypes: string[];
  travelClasses: string[];
  sortBy: 'fare_asc' | 'duration_asc' | 'dep_earliest' | 'dep_latest';
}

interface TrainFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  availableTrainTypes: string[];
  availableClasses: string[];
}

export const TrainFilters: React.FC<TrainFiltersProps> = ({
  filters,
  onChange,
  availableTrainTypes,
  availableClasses,
}) => {
  const toggleDepartureSlot = (slot: string) => {
    const next = filters.departureSlots.includes(slot)
      ? filters.departureSlots.filter((s) => s !== slot)
      : [...filters.departureSlots, slot];
    onChange({ ...filters, departureSlots: next });
  };

  const toggleTrainType = (type: string) => {
    const next = filters.trainTypes.includes(type)
      ? filters.trainTypes.filter((t) => t !== type)
      : [...filters.trainTypes, type];
    onChange({ ...filters, trainTypes: next });
  };

  const toggleTravelClass = (cls: string) => {
    const next = filters.travelClasses.includes(cls)
      ? filters.travelClasses.filter((c) => c !== cls)
      : [...filters.travelClasses, cls];
    onChange({ ...filters, travelClasses: next });
  };

  const handleReset = () => {
    onChange({
      departureSlots: [],
      trainTypes: [],
      travelClasses: [],
      sortBy: 'dep_earliest',
    });
  };

  const hasActiveFilters =
    filters.departureSlots.length > 0 ||
    filters.trainTypes.length > 0 ||
    filters.travelClasses.length > 0 ||
    filters.sortBy !== 'dep_earliest';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span>Filters & Sort</span>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
          Sort Results By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
        >
          <option value="dep_earliest">Earliest Departure</option>
          <option value="dep_latest">Latest Departure</option>
          <option value="fare_asc">Lowest Fare</option>
          <option value="duration_asc">Fastest Journey</option>
        </select>
      </div>

      {/* Departure Time Slots */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2.5">
          Departure Time
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'early', label: '00:00 - 06:00', title: 'Early Morning' },
            { id: 'morning', label: '06:00 - 12:00', title: 'Morning' },
            { id: 'afternoon', label: '12:00 - 18:00', title: 'Afternoon' },
            { id: 'night', label: '18:00 - 24:00', title: 'Night' },
          ].map((slot) => {
            const isChecked = filters.departureSlots.includes(slot.id);
            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => toggleDepartureSlot(slot.id)}
                className={`p-2 rounded-xl text-left border transition-all text-xs ${
                  isChecked
                    ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-medium truncate">{slot.title}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{slot.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Train Types */}
      {availableTrainTypes.length > 0 && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Train Category
          </label>
          <div className="space-y-1.5">
            {availableTrainTypes.map((type) => {
              const isChecked = filters.trainTypes.includes(type);
              return (
                <label
                  key={type}
                  className="flex items-center gap-2.5 text-xs text-slate-700 hover:text-slate-900 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleTrainType(type)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span>{type}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* Travel Classes */}
      {availableClasses.length > 0 && (
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Travel Class
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableClasses.map((cls) => {
              const isChecked = filters.travelClasses.includes(cls);
              return (
                <button
                  key={cls}
                  type="button"
                  onClick={() => toggleTravelClass(cls)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    isChecked
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {cls}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
