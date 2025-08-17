import { writable } from 'svelte/store';

export type SeatState = 'available' | 'booked' | 'selected';

export interface Seat {
  id: string;      // e.g., "A1"
  state: SeatState;
}

export interface BookingInfo {
  name: string;
  contact: string;
  seatId: string;
}

export const seats = writable<Seat[]>([
  { id: 'A1', state: 'available' },
  { id: 'A2', state: 'booked' },
  { id: 'A3', state: 'available' },
  { id: 'B1', state: 'available' },
  { id: 'B2', state: 'booked' },
  { id: 'B3', state: 'available' },
  { id: 'C1', state: 'available' },
  { id: 'C2', state: 'booked' },
  { id: 'C3', state: 'available' }
]);

export const booking = writable<BookingInfo | null>(null);

export function setSeatState(id: string, state: SeatState) {
  seats.update((list) => list.map((s) => (s.id === id ? { ...s, state } : s)));
}