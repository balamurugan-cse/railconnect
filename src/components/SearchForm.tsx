import { ArrowLeftRight, Calendar, Compass, MapPin, Search, Train, Users } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Station } from '../types';
import { StationAutocomplete } from './StationAutocomplete';

interface SearchFormProps {
  initialFrom?: string;
  initialFromName?: string;
  initialTo?: string;
  initialToName?: string;
  initialDate?: string;
  initialPassengers?: number;
  initialClass?: string;
  compact?: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({
  initialFrom = 'NDLS',
  initialFromName = 'New Delhi Railway Station',
  initialTo = 'MMCT',
  initialToName = 'Mumbai Central',
  initialDate,
  initialPassengers = 1,
  initialClass = 'ALL',
  compact = false,
}) => {
  const navigate = useNavigate();

  // Get tomorrow's date formatted as YYYY-MM-DD
  const getDefaultDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const isInitialChennai = ['MSB', 'MS', 'MASS', 'MBM', 'GDY', 'TLM', 'TBM', 'CGL', 'VLCY', 'AVD', 'TRL'].includes(initialFrom);

  const [serviceCategory, setServiceCategory] = useState<'all' | 'chennai-local'>(
    isInitialChennai ? 'chennai-local' : 'all'
  );
  const [fromCode, setFromCode] = useState(initialFrom);
  const [fromName, setFromName] = useState(initialFromName);
  const [toCode, setToCode] = useState(initialTo);
  const [toName, setToName] = useState(initialToName);
  const [journeyDate, setJourneyDate] = useState(initialDate || getDefaultDate());
  const [passengers, setPassengers] = useState(initialPassengers);
  const [travelClass, setTravelClass] = useState(initialClass);
  const [validationError, setValidationError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSwap = () => {
    const tempCode = fromCode;
    const tempName = fromName;
    setFromCode(toCode);
    setFromName(toName);
    setToCode(tempCode);
    setToName(tempName);
    setValidationError(null);
  };

  const handleFromSelect = (station: Station) => {
    setFromCode(station.code);
    setFromName(station.name);
    setValidationError(null);
  };

  const handleToSelect = (station: Station) => {
    setToCode(station.code);
    setToName(station.name);
    setValidationError(null);
  };

  const handleSwitchCategory = (cat: 'all' | 'chennai-local') => {
    setServiceCategory(cat);
    setValidationError(null);
    if (cat === 'chennai-local') {
      setFromCode('MSB');
      setFromName('Chennai Beach');
      setToCode('TBM');
      setToName('Tambaram');
      setTravelClass('ALL');
    } else {
      setFromCode('NDLS');
      setFromName('New Delhi Railway Station');
      setToCode('MMCT');
      setToName('Mumbai Central');
      setTravelClass('ALL');
    }
  };

  const handleChennaiPreset = (from: string, fName: string, to: string, tName: string) => {
    setServiceCategory('chennai-local');
    setFromCode(from);
    setFromName(fName);
    setToCode(to);
    setToName(tName);
    setValidationError(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromCode || !toCode) {
      setValidationError('Please select both Origin and Destination stations.');
      return;
    }

    if (fromCode.toUpperCase() === toCode.toUpperCase()) {
      setValidationError('Source and Destination stations cannot be identical.');
      return;
    }

    if (!journeyDate || journeyDate < todayStr) {
      setValidationError('Please select a valid future travel date.');
      return;
    }

    setValidationError(null);

    const query = new URLSearchParams({
      from: fromCode,
      fromName,
      to: toCode,
      toName,
      date: journeyDate,
      passengers: String(passengers),
      class: travelClass,
    });

    navigate(`/trains?${query.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-md ${
        compact ? 'p-4' : 'p-6 sm:p-8'
      }`}
    >
      {/* Category Tabs: Intercity Express vs Chennai Local Train */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => handleSwitchCategory('all')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              serviceCategory === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Express & Intercity
          </button>
          <button
            type="button"
            onClick={() => handleSwitchCategory('chennai-local')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              serviceCategory === 'chennai-local'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>Chennai Local / Suburban EMU</span>
          </button>
        </div>

        {serviceCategory === 'chennai-local' && (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
            Chennai Suburban Network · South, West & MRTS
          </span>
        )}
      </div>

      {/* Chennai Suburban Quick Preset Chips */}
      {serviceCategory === 'chennai-local' && (
        <div className="mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-blue-900 text-[11px]">Popular Corridors:</span>
          <button
            type="button"
            onClick={() => handleChennaiPreset('MSB', 'Chennai Beach', 'TBM', 'Tambaram')}
            className="px-2.5 py-1 bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-800 rounded-lg font-medium text-[11px] cursor-pointer"
          >
            Beach ⇄ Tambaram
          </button>
          <button
            type="button"
            onClick={() => handleChennaiPreset('MSB', 'Chennai Beach', 'VLCY', 'Velachery (MRTS)')}
            className="px-2.5 py-1 bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-800 rounded-lg font-medium text-[11px] cursor-pointer"
          >
            Beach ⇄ Velachery (MRTS)
          </button>
          <button
            type="button"
            onClick={() => handleChennaiPreset('MASS', 'Chennai Central Suburban (MMC)', 'AVD', 'Avadi')}
            className="px-2.5 py-1 bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-800 rounded-lg font-medium text-[11px] cursor-pointer"
          >
            Central ⇄ Avadi
          </button>
          <button
            type="button"
            onClick={() => handleChennaiPreset('MS', 'Chennai Egmore', 'TLM', 'Tirusulam (Chennai Airport)')}
            className="px-2.5 py-1 bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-800 rounded-lg font-medium text-[11px] cursor-pointer"
          >
            Egmore ⇄ Airport (Tirusulam)
          </button>
          <button
            type="button"
            onClick={() => handleChennaiPreset('MSB', 'Chennai Beach', 'CGL', 'Chengalpattu Junction')}
            className="px-2.5 py-1 bg-white hover:bg-blue-100/60 border border-blue-200 text-blue-800 rounded-lg font-medium text-[11px] cursor-pointer"
          >
            Beach ⇄ Chengalpattu
          </button>
        </div>
      )}

      {validationError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* Origin Station */}
        <div className="lg:col-span-4">
          <StationAutocomplete
            label="From Station"
            value={fromCode}
            stationName={fromName}
            excludeCode={toCode}
            onChange={handleFromSelect}
            placeholder={serviceCategory === 'chennai-local' ? 'e.g. Chennai Beach (MSB), Egmore, Mambalam...' : 'Origin station, city, code...'}
            required
          />
        </div>

        {/* Swap Button */}
        <div className="lg:col-span-1 flex items-center justify-center pb-1">
          <button
            type="button"
            onClick={handleSwap}
            title="Swap source and destination"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-all shadow-xs cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Destination Station */}
        <div className="lg:col-span-4">
          <StationAutocomplete
            label="To Station"
            value={toCode}
            stationName={toName}
            excludeCode={fromCode}
            onChange={handleToSelect}
            placeholder={serviceCategory === 'chennai-local' ? 'e.g. Tambaram (TBM), Airport, Velachery...' : 'Destination station, city, code...'}
            required
          />
        </div>

        {/* Date Field */}
        <div className="lg:col-span-3">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Journey Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              min={todayStr}
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
              required
            />
          </div>
        </div>
      </div>

      {/* Second row: Passengers, Travel Class & Submit */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end mt-4 pt-4 border-t border-slate-100">
        {/* Passengers */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Passengers
          </label>
          <div className="relative flex items-center">
            <div className="absolute left-3.5 text-slate-400 pointer-events-none">
              <Users className="w-4 h-4" />
            </div>
            <select
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
            >
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'Passenger' : 'Passengers'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Travel Class */}
        <div className="sm:col-span-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Travel Class
          </label>
          <select
            value={travelClass}
            onChange={(e) => setTravelClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-xs"
          >
            <option value="ALL">All Travel Classes</option>
            {serviceCategory === 'chennai-local' ? (
              <>
                <option value="II">Second Class Ordinary (II) · ₹10</option>
                <option value="FC">First Class Suburban (FC) · ₹65</option>
                <option value="AC">AC Suburban EMU (AC) · ₹80</option>
              </>
            ) : (
              <>
                <option value="1A">AC First Class (1A)</option>
                <option value="2A">AC 2 Tier (2A)</option>
                <option value="3A">AC 3 Tier (3A)</option>
                <option value="EC">Executive Chair Car (EC)</option>
                <option value="CC">AC Chair Car (CC)</option>
                <option value="SL">Sleeper Class (SL)</option>
                <option value="II">Suburban / Local Second Class (II)</option>
                <option value="FC">Suburban First Class (FC)</option>
                <option value="AC">AC Local EMU (AC)</option>
              </>
            )}
          </select>
        </div>

        {/* Search CTA */}
        <div className="sm:col-span-4">
          <button
            type="submit"
            className="w-full h-[42px] px-6 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>{serviceCategory === 'chennai-local' ? 'Search Chennai Local Trains' : 'Search Trains'}</span>
          </button>
        </div>
      </div>
    </form>
  );
};
