import { Compass, LogOut, Menu, Train, User as UserIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Demo Mode Notice Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center text-xs font-medium text-amber-900 flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
        <span>DEMO ENVIRONMENT · Sample railway data for prototyping · Not official railway reservation portal</span>
      </div>

      {/* Top Bar 3-Zone Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single-element Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <Train className="w-5 h-5" />
            </div>
            <span>RailConnect</span>
          </Link>

          {/* Zone 2: 4-5 concise single-line text nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              to="/trains"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-blue-600 ${
                isActive('/trains') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Book Tickets
            </Link>
            <Link
              to="/pnr-status"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-blue-600 ${
                isActive('/pnr-status') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              PNR Status
            </Link>
            <Link
              to="/live-status"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-blue-600 ${
                isActive('/live-status') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Live Status
            </Link>
            <Link
              to="/my-trips"
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-blue-600 ${
                isActive('/my-trips') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              My Trips
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-blue-600 ${
                  isActive('/admin') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Zone 3: 1 primary action / account area */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/account/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="truncate max-w-[120px]">{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/trains"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800"
          >
            Book Tickets
          </Link>
          <Link
            to="/pnr-status"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800"
          >
            PNR Status
          </Link>
          <Link
            to="/live-status"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800"
          >
            Live Train Status
          </Link>
          <Link
            to="/my-trips"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-800"
          >
            My Trips
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-base font-medium text-blue-600 font-semibold"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/account/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 text-sm font-medium text-slate-700 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Profile ({user.name})</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-sm font-medium text-rose-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-medium text-slate-700 border border-slate-300 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold text-white bg-blue-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
