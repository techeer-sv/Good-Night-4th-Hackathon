export interface Event {
  id: string;
  title: string;
  category: string;
  startsAt: string; // ISO date string
  venue: string;
  remainingSeats: number;
  description: string;
  // Optional fields for rich content
  poster?: string; // Image URL
  price?: number;
  duration?: number; // in minutes
}

export interface EventListParams {
  page?: number;
  category?: string;
  limit?: number;
}

export interface EventListResponse {
  events: Event[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  status: 'CONFIRMED' | 'CANCELLED';
  createdAt: string; // ISO date string
  event?: Event; // Populated in some contexts
}
