export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  createdAt?: string; // ISO
  status?: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
}
