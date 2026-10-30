import { Check, Clock, MapPin, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { Station } from '../types';

interface StationAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string; // Station code
  stationName?: string;
  excludeCode?: string;
  onChange: (station: Station) => void;
  required?: boolean;
}

export const StationAutocomplete: React.FC<StationAutocompleteProps> = ({
  label,
  placeholder = 'Search station or city...',
  value,
  stationName,
  excludeCode,
  onChange,
  required = false,
}) => {
  const [query, setQuery] = useState(stationName || value || '');
  const [stations, setStations] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (stationName) {
      setQuery(`${stationName} (${value})`);
    } else if (value) {
      setQuery(value);
    }
  }, [value, stationName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchStations = async (text: string) => {
    setIsLoading(true);
    try {
      const results = await api.searchStations(text);
      const filtered = excludeCode
        ? results.filter((s) => s.code.toUpperCase() !== excludeCode.toUpperCase())
        : results;
      setStations(filtered);
    } catch {
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
    fetchStations(val);
  };

  const handleSelect = (station: Station) => {
    onChange(station);
    setQuery(`${station.name} (${station.code})`);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        fetchStations(query);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < stations.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : stations.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < stations.length) {
        handleSelect(stations[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div className="relative flex items-center">
        <div className="absolute left-3.5 text-slate-400 pointer-events-none">
          <MapPin className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            fetchStations(query);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
              fetchStations('');
            }}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-md"
            aria-label="Clear input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg max-h-64 overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Searching stations...</span>
            </div>
          ) : stations.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No matching stations found. Try searching by city name (e.g., Delhi, Mumbai) or code (e.g., NDLS).
            </div>
          ) : (
            stations.map((station, index) => {
              const isSelected = station.code === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => handleSelect(station)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors ${
                    isHighlighted ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm tracking-tight text-slate-900">
                        {station.code}
                      </span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {station.name}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {station.city}, {station.state}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
