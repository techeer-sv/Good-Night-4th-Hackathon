import { initializeSeats } from '$lib/stores/booking';

// All API calls are now relative and rely on the Vite proxy or server routes.
const API_BASE = '';

export async function getSeats(fetchFn: typeof fetch = fetch) {
	try {
		const response = await fetchFn(`${API_BASE}/api/v1/seats`);
		if (!response.ok) {
			throw new Error(`Failed to fetch seats: ${response.statusText}`);
		}
		const data = await response.json();
		if (data.success) {
			initializeSeats(data.seats);
			return data.seats;
		} else {
			throw new Error(data.message || 'Failed to process seat data');
		}
	} catch (error) {
		console.error('Error fetching seats:', error);
		return [];
	}
}

export async function reserveSeat(
	bookingDetails: {
		seatId: number;
		userName: string;
		phone: string;
		userId: string;
	},
	fetchFn: typeof fetch = fetch
) {
	try {
		const response = await fetchFn(`${API_BASE}/api/v1/reserve`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(bookingDetails)
		});
		return response.json();
	} catch (error) {
		console.error('Error reserving seat:', error);
		throw error;
	}
}
