import { writable, derived } from 'svelte/store';

export type SeatState = 'available' | 'booked' | 'selected';

export interface Seat {
	id: number;
	isBooked: boolean;
	state: SeatState;
}

export interface BookingInfo {
	name: string;
	contact: string;
	seatId: number;
}

// Store for the list of all seats
export const seats = writable<Seat[]>([]);

// Store for ONLY the ID of the currently selected seat. This is the single source of truth.
export const selectedSeatId = writable<number | null>(null);

// A derived store to easily get the full object of the selected seat
export const selectedSeat = derived(
	[seats, selectedSeatId],
	([$seats, $selectedSeatId]) => {
		if (!$selectedSeatId) return null;
		return $seats.find(s => s.id === $selectedSeatId) || null;
	}
);

// Store for the final booking details
export const booking = writable<BookingInfo | null>(null);

export function initializeSeats(apiSeats: { id: number; status: boolean }[]) {
	const uiSeats = apiSeats.map((apiSeat) => ({
		id: apiSeat.id,
		// Corrected logic: status:false means AVAILABLE, status:true means BOOKED.
		isBooked: apiSeat.status,
		state: apiSeat.status ? 'booked' : 'available'
	}));
	seats.set(uiSeats);
	selectedSeatId.set(null); // Always reset selection when new seats are loaded
}