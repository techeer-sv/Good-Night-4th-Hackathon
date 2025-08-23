import type { PageServerLoad, Actions } from './$types';
import { initializeSeats, seats } from '$lib/stores/booking';
import { get } from 'svelte/store';
import { fail } from '@sveltejs/kit';
import { getSeats, bookSeat } from '$lib/server/database';

export const load: PageServerLoad = async () => {
  const apiSeats = getSeats();
  initializeSeats(apiSeats);
  const seatData = get(seats);

  return {
    seats: seatData
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const seatId = formData.get('seatId');
    const name = formData.get('name');
    const contact = formData.get('contact');

    if (!seatId) {
      return fail(400, { message: 'No seat ID provided.' });
    }

    // Simple validation for name and contact
    if (!name || !contact) {
      return fail(400, { message: 'Name and contact are required.', name, contact });
    }

    const id = parseInt(seatId as string, 10);
    const result = bookSeat(id);

    if (!result.success) {
      // Standardize all error messages to use the `message` property
      return fail(409, { message: result.error || 'Failed to book seat.' });
    }

    // On success, return the UPDATED list of all seats.
    const updatedApiSeats = getSeats();
    initializeSeats(updatedApiSeats);
    const updatedSeatData = get(seats);

    return {
      success: true,
      seats: updatedSeatData
    };
  }
};
