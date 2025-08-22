import { writable } from 'svelte/store';

// Client-side state, including 'selected' which doesn't exist on the server
export type SeatState = 'available' | 'booked' | 'selected';

// Represents a seat in the UI. Combines server data with client state.
export interface Seat {
  id: number;       // From API
  isBooked: boolean; // Derived from API status
  state: SeatState; // Client-side state
}

export interface BookingInfo {
  name: string;
  contact: string;
  seatId: number;
}

// The store for seats
export const seats = writable<Seat[]>([]);

// The store for the current booking attempt
export const booking = writable<BookingInfo | null>(null);

/**
 * Initializes the seats store from an array of raw seat data from the API.
 * @param apiSeats The array of seats from the GET /api/v1/seats endpoint.
 */
export function initializeSeats(apiSeats: { id: number; status: boolean }[]) {
  const uiSeats = apiSeats.map(apiSeat => ({
    id: apiSeat.id,
    isBooked: !apiSeat.status, // Assuming status:true means available
    state: !apiSeat.status ? 'booked' : 'available'
  }));
  seats.set(uiSeats);
}

/**
 * Updates the state of a single seat in the store.
 * @param id The numeric ID of the seat to update.
 * @param newState The new state for the seat.
 */
export function setSeatState(id: number, newState: SeatState) {
  seats.update(currentSeats =>
    currentSeats.map(seat =>
      seat.id === id ? { ...seat, state: newState } : seat
    )
  );
}

// Example of initializing with some default data.
// In a real app, you'd call a service function that fetches and then calls initializeSeats.
const initialSeats: Seat[] = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  isBooked: Math.random() > 0.7, // Randomly book some seats
  state: 'available'
}));
initialSeats.forEach(seat => {
  if (seat.isBooked) {
    seat.state = 'booked';
  }
});
seats.set(initialSeats);
