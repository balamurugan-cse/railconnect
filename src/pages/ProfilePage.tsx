import { CheckCircle2, KeyRound, Lock, Shield, Train, User as UserIcon } from 'lucide-react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    if (newPassword !== confirmPassword) {
      setStatusMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    if (newPassword.length < 8) {
      setStatusMsg({ text: 'New password must be at least 8 characters long.', isError: true });
      return;
    }

    setIsUpdating(true);
    try {
      await api.getMe(); // Check session
      // Call update endpoint
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password.');

      setStatusMsg({ text: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatusMsg({ text: err.message, isError: true });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-xs text-slate-500">
        Please sign in to view your profile.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Account Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your RailConnect traveler credentials and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* User Card */}
        <div className="md:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Account Role:</span>
              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {user.role}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Phone Number:</span>
              <span className="text-slate-800 font-medium">{user.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">User ID:</span>
              <span className="font-mono text-[11px] text-slate-400">{user.id}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              to="/my-trips"
              className="w-full py-2 text-center text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              View My Bookings & Tickets
            </Link>
            {user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="w-full py-2 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Open Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Security & Password
            </h3>
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                statusMsg.isError
                  ? 'bg-rose-50 border border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                New Password (min 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
            >
              {isUpdating ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
