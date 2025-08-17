// Event related shared types

export interface Event {
	id: string;
	name: string;
	date: string;          // ISO string
	venue: string;
	remainingSeats: number;
	category?: string;
	description?: string;
}

export interface EventListParams {
	page?: number;
	limit?: number;
	category?: string;
}

export interface EventListResponse {
	events: Event[];
	total: number;
	page: number;
	pageSize: number;
}
