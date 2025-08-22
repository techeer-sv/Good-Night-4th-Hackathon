import type { PageLoad } from './$types';
import { initializeSeats } from '$lib/stores/booking';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const response = await fetch('/api/v1/seats');
    if (response.ok) {
      const apiSeats = await response.json();
      initializeSeats(apiSeats.seats);
    } else {
      console.error('Failed to fetch seats:', response.statusText);
    }
  } catch (error) {
    console.error('An error occurred while fetching seats:', error);
  }
};
