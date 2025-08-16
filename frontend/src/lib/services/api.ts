// API service for backend communication
const API_BASE = 'http://localhost:8080/api/v1';

export interface Seat {
  id: number;
  number: number;
  is_available: boolean;
}

export interface ReservationRequest {
  id: number;
  fname: string;
  lname: string;
  email: string;
}

export interface SeatRequest {
  id: number;
  number: number;
}

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all seats
  async getSeats(): Promise<Seat[]> {
    return this.request<Seat[]>('/seats');
  }

  // Get a specific seat
  async getSeat(id: number): Promise<Seat> {
    return this.request<Seat>(`/seats/${id}`);
  }

  // Reserve a seat
  async reserveSeat(seat: SeatRequest): Promise<any> {
    return this.request('/seats/reserve', {
      method: 'POST',
      body: JSON.stringify(seat),
    });
  }

  // Unreserve a seat
  async unreserveSeat(seat: SeatRequest): Promise<any> {
    return this.request('/seats/unreserve', {
      method: 'DELETE',
      body: JSON.stringify(seat),
    });
  }

  // Buy a seat
  async buySeat(reservation: ReservationRequest): Promise<any> {
    return this.request('/seats/buy', {
      method: 'POST',
      body: JSON.stringify(reservation),
    });
  }

  // Cancel a reservation
  async cancelReservation(reservation: ReservationRequest): Promise<any> {
    return this.request('/seats/cancel', {
      method: 'DELETE',
      body: JSON.stringify(reservation),
    });
  }
}

export const apiService = new ApiService();
