// Seat & venue related domain types
export interface Seat {
	id: string;        // unique seat identifier
	section?: string;  // optional section name (e.g., "Orchestra")
	row: string;       // row label, e.g. 'A'
	number: string;    // seat number within a row, keep string for potential leading zeros
	price: number;     // seat price for selection summary
	status: 'available' | 'reserved';
}

export interface SeatSection {
	id: string;
	name: string;
	color?: string;    // UI accent color
	seats: Seat[];     // flattened list of seats in this section
}

export interface VenueLayout {
	id: string;
	name: string;        // Name displayed above the seat map
	totalSeats: number;  // Precomputed total for quick display
	sections: SeatSection[]; // Sections with their seats
}

export interface SeatSelection {
	seats: Seat[];      // Currently selected seats (resolved objects)
	totalPrice: number; // Sum of prices
}

// Runtime helper type guard (optional future use)
export function isSeat(value: unknown): value is Seat {
	return !!value && typeof value === 'object' && 'id' in (value as any) && 'row' in (value as any);
}
