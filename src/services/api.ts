import { Booking, Station, TrainSearchResult, User } from '../types';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('rc_access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('rc_access_token', token);
    } else {
      localStorage.removeItem('rc_access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.message || data.error || `HTTP error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // Stations
  async searchStations(query: string): Promise<Station[]> {
    const res = await this.request<{ stations: Station[] }>(`/stations?query=${encodeURIComponent(query)}`);
    return res.stations || [];
  }

  async getPopularStations(): Promise<Station[]> {
    const res = await this.request<{ stations: Station[] }>('/stations/popular');
    return res.stations || [];
  }

  async getChennaiSuburbanStations(): Promise<Station[]> {
    const res = await this.request<{ stations: Station[] }>('/stations/chennai-suburban');
    return res.stations || [];
  }

  // Trains
  async searchTrains(params: {
    from: string;
    to: string;
    date: string;
    passengers?: number;
    classCode?: string;
  }): Promise<{ trains: TrainSearchResult[]; meta: any }> {
    const query = new URLSearchParams({
      from: params.from,
      to: params.to,
      date: params.date,
      passengers: String(params.passengers || 1),
    });
    if (params.classCode && params.classCode !== 'ALL') {
      query.set('class', params.classCode);
    }

    return this.request<{ trains: TrainSearchResult[]; meta: any }>(`/trains/search?${query.toString()}`);
  }

  async getTrainDetails(trainId: string): Promise<any> {
    return this.request<{ success: boolean; train: any }>(`/trains/${trainId}`);
  }

  async getAvailability(trainId: string, date: string, classCode: string): Promise<any> {
    return this.request<{ success: boolean; availability: any }>(
      `/trains/${trainId}/availability?date=${encodeURIComponent(date)}&class=${encodeURIComponent(classCode)}`
    );
  }

  async getLiveStatus(trainNumber: string): Promise<any> {
    return this.request<any>(`/trains/status/live/${encodeURIComponent(trainNumber)}`);
  }

  async getPnrStatus(pnrNumber: string): Promise<any> {
    return this.request<any>(`/trains/status/pnr/${encodeURIComponent(pnrNumber)}`);
  }

  // Bookings
  async getFareQuote(payload: {
    trainId: string;
    classCode: string;
    passengerCount: number;
    fromCode?: string;
    toCode?: string;
  }): Promise<any> {
    return this.request<any>('/bookings/quote', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async createBooking(payload: any): Promise<{ success: boolean; booking: Booking }> {
    return this.request<{ success: boolean; booking: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getBookings(): Promise<{ bookings: Booking[] }> {
    return this.request<{ bookings: Booking[] }>('/bookings');
  }

  async getBooking(bookingId: string): Promise<{ booking: Booking }> {
    return this.request<{ booking: Booking }>(`/bookings/${bookingId}`);
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<any> {
    return this.request<any>(`/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Payment
  async createPaymentSession(bookingId: string): Promise<any> {
    return this.request<any>('/payments/create-session', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  }

  async confirmSandboxPayment(payload: {
    bookingId: string;
    paymentMethod: string;
    shouldFail?: boolean;
    idempotencyKey?: string;
  }): Promise<any> {
    return this.request<any>('/payments/sandbox-confirm', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; accessToken: string }> {
    const res = await this.request<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async register(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    termsAccepted: boolean;
  }): Promise<{ user: User; accessToken: string }> {
    const res = await this.request<{ user: User; accessToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.accessToken);
    return res;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      this.setToken(null);
    }
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/users/me');
  }

  // Admin
  async getAdminOverview(): Promise<any> {
    return this.request<any>('/admin/overview');
  }

  async getAdminBookings(status?: string): Promise<any> {
    const q = status ? `?status=${status}` : '';
    return this.request<any>(`/admin/bookings${q}`);
  }

  async getAdminAuditLogs(): Promise<any> {
    return this.request<any>('/admin/audit-logs');
  }

  async getAdminHealth(): Promise<any> {
    return this.request<any>('/admin/system-health');
  }
}

export const api = new ApiClient();
