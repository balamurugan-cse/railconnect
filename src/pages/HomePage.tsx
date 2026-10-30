import {
  ArrowRight,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Train,
  Zap,
} from 'lucide-react';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SearchForm } from '../components/SearchForm';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const popularRoutes = [
    { from: 'NDLS', fromName: 'New Delhi', to: 'MMCT', toName: 'Mumbai Central', duration: '15h 40m', trains: '6 Daily' },
    { from: 'NDLS', fromName: 'New Delhi', to: 'HWH', toName: 'Howrah (Kolkata)', duration: '17h 05m', trains: '5 Daily' },
    { from: 'MAS', fromName: 'Chennai Central', to: 'SBC', toName: 'KSR Bengaluru', duration: '4h 20m', trains: '8 Daily' },
    { from: 'MMCT', fromName: 'Mumbai Central', to: 'ADI', toName: 'Ahmedabad', duration: '5h 25m', trains: '7 Daily' },
  ];

  const chennaiLocalRoutes = [
    { from: 'MSB', fromName: 'Chennai Beach', to: 'TBM', toName: 'Tambaram', duration: '43m', fare: '₹10', tag: 'South Line Fast' },
    { from: 'MSB', fromName: 'Chennai Beach', to: 'VLCY', toName: 'Velachery', duration: '45m', fare: '₹10', tag: 'MRTS Elevated' },
    { from: 'MASS', fromName: 'Chennai Central (MMC)', to: 'AVD', toName: 'Avadi', duration: '37m', fare: '₹10', tag: 'West Line Local' },
    { from: 'MS', fromName: 'Chennai Egmore', to: 'TLM', toName: 'Tirusulam (Airport)', duration: '23m', fare: '₹10', tag: 'Airport Fast Local' },
    { from: 'MSB', fromName: 'Chennai Beach', to: 'CGL', toName: 'Chengalpattu', duration: '1h 25m', fare: '₹15', tag: 'South Express EMU' },
  ];

  const handleQuickRoute = (route: { from: string; fromName: string; to: string; toName: string }) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    navigate(`/trains?from=${route.from}&fromName=${encodeURIComponent(route.fromName)}&to=${route.to}&toName=${encodeURIComponent(route.toName)}&date=${dateStr}&passengers=1&class=ALL`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white">
        {/* Subtle Railway Grid Backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>National Express & Chennai Suburban Local EMU Booking</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Your Journey Begins with RailConnect
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Discover intercity express trains and book Chennai local suburban EMU tickets across Beach, Tambaram, Velachery, Avadi, and Airport lines.
            </p>
          </div>

          {/* Embedded Search Form in Hero */}
          <div className="max-w-4xl mx-auto text-slate-900">
            <SearchForm />
          </div>

          {/* Quick Route Shortcuts */}
          <div className="max-w-4xl mx-auto mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400">Popular Corridors:</span>
            {popularRoutes.map((route, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickRoute(route)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{route.fromName}</span>
                <span className="text-blue-300">⇄</span>
                <span>{route.toName}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Chennai Suburban Local Train Quick Booking Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-blue-800/50">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                <Train className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">Chennai Suburban & Local EMU Trains</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                    Live Booking
                  </span>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  Book paperless UTS-style suburban local tickets (Second Class ₹10, First Class ₹65, AC EMU ₹80)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleQuickRoute({ from: 'MSB', fromName: 'Chennai Beach', to: 'TBM', toName: 'Tambaram' })}
              className="px-4 py-2 text-xs font-semibold bg-white text-blue-900 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore Chennai Local Routes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-5">
            {chennaiLocalRoutes.map((cr, idx) => (
              <div
                key={idx}
                onClick={() => handleQuickRoute(cr)}
                className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold text-blue-300 uppercase tracking-wider">{cr.tag}</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{cr.fare}</span>
                  </div>
                  <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">
                    {cr.fromName}
                  </div>
                  <div className="text-xs text-blue-300 my-0.5">↓</div>
                  <div className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors">
                    {cr.toName}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                  <span>{cr.duration}</span>
                  <span className="text-blue-300 font-semibold group-hover:underline">Book Ticket →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Utilities Strip: PNR Lookup & Live Running Status */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1">Quick Inquiry</div>
              <h3 className="text-lg font-bold text-slate-900">Check PNR Status</h3>
              <p className="text-xs text-slate-500 mt-1">
                Lookup booking confirmation, passenger coach, and berth details instantly.
              </p>
            </div>
            <Link
              to="/pnr-status"
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <span>Check PNR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Live Tracking</div>
              <h3 className="text-lg font-bold text-slate-900">Live Train Running Status</h3>
              <p className="text-xs text-slate-500 mt-1">
                Track current train position, next upcoming halt, and on-time performance.
              </p>
            </div>
            <Link
              to="/live-status"
              className="px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <span>Track Train</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose RailConnect Bento Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Designed for Modern Train Travelers
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every feature is engineered for speed, transparency, and effortless journey planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Ultra-Fast Route Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Our intelligent routing algorithm evaluates thousands of train segments, intermediate stop sequences, and midnight cross-day offsets in milliseconds.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Transparent Availability</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              No hidden guesswork. Every seat query displays its exact data origin tag (LIVE, CACHED, or DEMO) and timestamp, so you always know what inventory you are seeing.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Idempotent Payment Sandbox</h3>
            <p className="text-xs text-slate-600 leading-relaxed mt-2">
              Integrated sandbox payment gateway with HMAC SHA-256 webhook verification. Never experience duplicate charges or unconfirmed reservation drops.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Stepper */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Simple 4-Step Booking Workflow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              From station search to boarding pass in under two minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Search Corridors', desc: 'Select origin and destination stations with intelligent autocomplete and travel date.' },
              { step: '02', title: 'Compare Classes', desc: 'Review Vande Bharat, Rajdhani, Shatabdi, fares, and real-time seat availability.' },
              { step: '03', title: 'Passenger Details', desc: 'Enter traveler names, age, gender, and preferred berth types with instant validation.' },
              { step: '04', title: 'Secure Confirmation', desc: 'Complete checkout in our payment sandbox and receive your verifiable electronic ticket.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
                <div className="text-3xl font-extrabold font-mono text-blue-600/30 mb-2">
                  {item.step}
                </div>
                <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Premier Trains Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Premier Train Services
            </h2>
            <p className="text-xs text-slate-500 mt-1">High-speed and executive express trains available for booking</p>
          </div>
          <Link
            to="/trains"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Trains</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-r from-blue-700 to-indigo-900 p-6 flex flex-col justify-end text-white">
              <span className="text-xs font-mono uppercase tracking-wider text-blue-200">Semi-High Speed</span>
              <h3 className="text-lg font-bold">Vande Bharat Express</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                India's flagship indigenous semi-high speed train featuring 160 km/h operational speeds, rotating executive chairs, and onboard Wi-Fi.
              </p>
              <div className="text-xs font-semibold text-blue-600">Routes: NDLS-PNBE, MAS-SBC</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-r from-amber-700 to-red-900 p-6 flex flex-col justify-end text-white">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-200">Premier Long-Distance</span>
              <h3 className="text-lg font-bold">Tejas Rajdhani Express</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Fully air-conditioned luxury express connecting national capital with premier metropolitan hubs with automatic doors and meal service.
              </p>
              <div className="text-xs font-semibold text-amber-700">Routes: NDLS-MMCT, NDLS-HWH</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow">
            <div className="h-32 bg-gradient-to-r from-teal-700 to-blue-900 p-6 flex flex-col justify-end text-white">
              <span className="text-xs font-mono uppercase tracking-wider text-teal-200">Daytime Intercity</span>
              <h3 className="text-lg font-bold">Shatabdi Express</h3>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                Fast intercity day trains designed for business and short travel between major economic hubs with AC Chair Car and Executive comfort.
              </p>
              <div className="text-xs font-semibold text-teal-700">Routes: NDLS-BPL, MMCT-ADI</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
