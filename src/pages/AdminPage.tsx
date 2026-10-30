import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Database,
  DollarSign,
  Plus,
  RefreshCw,
  ShieldCheck,
  Train,
  Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Booking } from '../types';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<any | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [systemHealth, setSystemHealth] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'stations' | 'audit'>('overview');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states for adding train/station in demo mode
  const [showAddTrain, setShowAddTrain] = useState(false);
  const [newTrainNumber, setNewTrainNumber] = useState('');
  const [newTrainName, setNewTrainName] = useState('');
  const [newTrainType, setNewTrainType] = useState('Vande Bharat');

  const [showAddStation, setShowAddStation] = useState(false);
  const [newStationCode, setNewStationCode] = useState('');
  const [newStationName, setNewStationName] = useState('');
  const [newStationCity, setNewStationCity] = useState('');
  const [newStationState, setNewStationState] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [ov, bk, logs, health] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminBookings(statusFilter),
        api.getAdminAuditLogs(),
        api.getAdminHealth(),
      ]);
      setOverview(ov);
      setBookings(bk.bookings || []);
      setAuditLogs(logs.logs || []);
      setSystemHealth(health);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadData();
    }
  }, [user, statusFilter]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Admin Privileges Required</h2>
        <p className="text-xs text-slate-500">
          You must be signed in with an administrator account to view the operations console.
        </p>
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-600 text-white font-semibold text-xs rounded-xl cursor-pointer"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const handleCreateTrain = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/trains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({
          trainNumber: newTrainNumber,
          name: newTrainName,
          trainType: newTrainType,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create train.');

      alert(`Train ${newTrainNumber} (${newTrainName}) created successfully!`);
      setShowAddTrain(false);
      setNewTrainNumber('');
      setNewTrainName('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({
          code: newStationCode,
          name: newStationName,
          city: newStationCity,
          state: newStationState,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create station.');

      alert(`Station ${newStationCode} created successfully!`);
      setShowAddStation(false);
      setNewStationCode('');
      setNewStationName('');
      setNewStationCity('');
      setNewStationState('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              System Environment: {systemHealth?.environment || 'development'} ({systemHealth?.providers?.railway?.mode || 'demo'})
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Operations & Admin Console
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddTrain(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Train (Demo)</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddStation(true)}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Station (Demo)</span>
          </button>
          <button
            type="button"
            onClick={loadData}
            title="Refresh metrics"
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        {[
          { id: 'overview', label: 'Metrics Overview' },
          { id: 'bookings', label: `All Bookings (${bookings.length})` },
          { id: 'audit', label: `Audit Security Logs (${auditLogs.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          {/* 4-KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Gross Platform Revenue
              </span>
              <div className="text-2xl font-extrabold font-mono text-emerald-700 tabular-nums">
                ₹{overview.stats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Verified sandbox payments</span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Total Bookings
              </span>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                {overview.stats.totalBookings}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {overview.stats.confirmedBookings} Confirmed · {overview.stats.cancelledBookings} Cancelled
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Active Trains & Routes
              </span>
              <div className="text-2xl font-extrabold font-mono text-blue-700 tabular-nums">
                {overview.stats.activeTrains}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Across {overview.stats.activeStations} major hubs
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                System Health
              </span>
              <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>{systemHealth?.status || 'HEALTHY'}</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Uptime: {Math.round(systemHealth?.uptime || 0)}s</span>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-4">
              Recent Platform Bookings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                    <th className="pb-2 font-semibold">Reference</th>
                    <th className="pb-2 font-semibold">Train</th>
                    <th className="pb-2 font-semibold">Route</th>
                    <th className="pb-2 font-semibold">Date</th>
                    <th className="pb-2 font-semibold">Amount</th>
                    <th className="pb-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {overview.recentBookings.map((b: any) => (
                    <tr key={b.id}>
                      <td className="py-2.5 font-bold text-slate-900">{b.publicReference}</td>
                      <td className="py-2.5 font-sans font-medium">{b.trainNumber} · {b.trainName}</td>
                      <td className="py-2.5 font-sans">{b.sourceStationCode} → {b.destStationCode}</td>
                      <td className="py-2.5">{b.journeyDate}</td>
                      <td className="py-2.5 font-bold text-slate-900">₹{b.fareBreakdown?.totalAmount}</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              All Bookings
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Filter Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
              >
                <option value="ALL">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                  <th className="pb-2">Reference</th>
                  <th className="pb-2">Passenger / Email</th>
                  <th className="pb-2">Train</th>
                  <th className="pb-2">Date & Class</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="py-3 font-mono font-bold text-slate-900">{b.publicReference}</td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-900">{b.userName || 'Passenger'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{b.userEmail}</div>
                    </td>
                    <td className="py-3">{b.trainNumber} · {b.trainName}</td>
                    <td className="py-3 font-mono">{b.journeyDate} · {b.classCode}</td>
                    <td className="py-3 font-mono font-bold text-slate-900">₹{b.fareBreakdown.totalAmount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Audit Trail & Security Logs
              </h3>
            </div>
            <span className="text-xs text-slate-400">Total Events: {auditLogs.length}</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-medium">Resource: {log.resourceType} ({log.resourceId || 'N/A'})</span>
                  </div>
                  {log.details && (
                    <div className="font-mono text-[11px] text-slate-500">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
                <div className="text-right text-[11px] text-slate-400 font-mono">
                  <div>{log.actorEmail || 'System'}</div>
                  <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Train Modal */}
      {showAddTrain && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Train (Demo Mode)</h3>
            <form onSubmit={handleCreateTrain} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Train Number (5 digits)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20901"
                  value={newTrainNumber}
                  onChange={(e) => setNewTrainNumber(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Train Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gujarat Vande Bharat"
                  value={newTrainName}
                  onChange={(e) => setNewTrainName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Train Type</label>
                <select
                  value={newTrainType}
                  onChange={(e) => setNewTrainType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                >
                  <option value="Vande Bharat">Vande Bharat</option>
                  <option value="Rajdhani">Rajdhani</option>
                  <option value="Shatabdi">Shatabdi</option>
                  <option value="Superfast">Superfast</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTrain(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
                >
                  Create Train
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Station Modal */}
      {showAddStation && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Station (Demo Mode)</h3>
            <form onSubmit={handleCreateStation} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Station Code (3-4 letters)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BRC"
                  value={newStationCode}
                  onChange={(e) => setNewStationCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border rounded-xl text-xs font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Station Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vadodara Junction"
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Vadodara"
                    value={newStationCity}
                    onChange={(e) => setNewStationCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="Gujarat"
                    value={newStationState}
                    onChange={(e) => setNewStationState(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStation(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl"
                >
                  Create Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
