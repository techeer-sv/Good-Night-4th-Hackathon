import type { RequestHandler } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { seats } from '$lib/stores/booking';

export const GET: RequestHandler = async () => {
  try {
    const current = get(seats);
    return new Response(JSON.stringify(current), { status: 200 });
  } catch (error) {
    console.error('Failed to fetch seats:', error);
    return new Response(JSON.stringify({ error: 'internal_server_error' }), { status: 500 });
  }
};