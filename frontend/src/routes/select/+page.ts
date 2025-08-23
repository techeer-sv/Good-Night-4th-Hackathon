import type { PageLoad } from './$types';
import { initializeSeats } from '$lib/stores/booking';
import { browser } from '$app/environment';

// On the server, fetch directly from the backend.
// On the client, the request will go through the Vite proxy.
const API_BASE = browser ? '' : 'http://localhost:8080';

export const load: PageLoad = async ({ fetch }) => {
	try {
		const response = await fetch(`${API_BASE}/api/v1/seats`);
		if (!response.ok) {
			throw new Error(`API fetch failed: ${response.status}`);
		}
		
		const data = await response.json();

		// The actual API response for seats is a direct array.
		if (Array.isArray(data)) {
			initializeSeats(data);
			return { seats: data };
		} else {
			console.error('API returned unexpected data format:', data);
			initializeSeats([]); // Set empty seats on error
			return { seats: [] };
		}
	} catch (error) {
		console.error('Error in load function:', error);
		initializeSeats([]); // Set empty seats on error
		return { seats: [] };
	}
};
