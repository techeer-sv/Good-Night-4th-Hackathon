import type { RequestHandler } from '@sveltejs/kit';
import { listSeats } from '$lib/server/tickettock';

export const GET: RequestHandler = async () => {
  try {
    const seats = listSeats();
    return new Response(JSON.stringify({ success: true, seats }), { status: 200 });
  } catch (e) {
    console.error('GET /api/v1/seats failed:', e);
    return new Response(JSON.stringify({ success: false, reason: 'internal_error' }), {
      status: 500
    });
  }
};
