import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { AdminPage } from './pages/AdminPage';
import { BookingPage } from './pages/BookingPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { HomePage } from './pages/HomePage';
import { LiveStatusPage } from './pages/LiveStatusPage';
import { LoginPage } from './pages/LoginPage';
import { MyTripsPage } from './pages/MyTripsPage';
import { PaymentPage } from './pages/PaymentPage';
import { PnrStatusPage } from './pages/PnrStatusPage';
import { ProfilePage } from './pages/ProfilePage';
import { RegisterPage } from './pages/RegisterPage';
import { SearchResultsPage } from './pages/SearchResultsPage';

function AppLayout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
        </Routes>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trains" element={<SearchResultsPage />} />
          <Route path="/booking/:trainId" element={<BookingPage />} />
          <Route path="/payment/:bookingId" element={<PaymentPage />} />
          <Route path="/booking-confirmation/:bookingId" element={<ConfirmationPage />} />
          <Route path="/my-trips" element={<MyTripsPage />} />
          <Route path="/my-trips/:bookingId" element={<MyTripsPage />} />
          <Route path="/pnr-status" element={<PnrStatusPage />} />
          <Route path="/live-status" element={<LiveStatusPage />} />
          <Route path="/account/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
