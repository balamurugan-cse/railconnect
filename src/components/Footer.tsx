import { ShieldCheck, Train } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Wordmark & Statement */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Train className="w-4 h-4" />
              </div>
              <span>RailConnect</span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400">
              Modern railway journey discovery, fare comparison, and seat availability platform designed for speed, clarity, and simplicity.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>TLS 1.3 256-bit Secure Encryption</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Railway Services</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/trains" className="hover:text-white transition-colors">Book Train Tickets</Link>
              </li>
              <li>
                <Link to="/pnr-status" className="hover:text-white transition-colors">PNR Status Inquiry</Link>
              </li>
              <li>
                <Link to="/live-status" className="hover:text-white transition-colors">Live Train Running Status</Link>
              </li>
              <li>
                <Link to="/my-trips" className="hover:text-white transition-colors">Manage My Bookings</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Corridors */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Popular Corridors</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/trains?from=NDLS&to=MMCT&date=2026-11-05" className="hover:text-white transition-colors">
                  New Delhi ⇄ Mumbai Central
                </Link>
              </li>
              <li>
                <Link to="/trains?from=NDLS&to=HWH&date=2026-11-05" className="hover:text-white transition-colors">
                  New Delhi ⇄ Howrah (Kolkata)
                </Link>
              </li>
              <li>
                <Link to="/trains?from=MAS&to=SBC&date=2026-11-05" className="hover:text-white transition-colors">
                  Chennai Central ⇄ Bengaluru City
                </Link>
              </li>
              <li>
                <Link to="/trains?from=MMCT&to=ADI&date=2026-11-05" className="hover:text-white transition-colors">
                  Mumbai Central ⇄ Ahmedabad
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Compliance & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Regulatory & Legal</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              RailConnect operates as an independent prototype application. We do not claim official affiliation with IRCTC or Ministry of Railways.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-400">
              <span className="hover:text-slate-200 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-200 cursor-pointer">Cancellation Policy</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} RailConnect. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Server Uptime: 99.98%</span>
            <span>·</span>
            <span>PCI-DSS Sandbox Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
