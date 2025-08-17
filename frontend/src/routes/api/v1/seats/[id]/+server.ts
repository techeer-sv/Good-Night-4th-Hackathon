import type { RequestHandler } from '@sveltejs/kit';
import { getSeatById } from '$lib/server/tickettock';

export const GET: RequestHandler = async ({ params }) => {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return new Response(JSON.stringify({ success: false, reason: 'validation' }), {
        status: 400
      });
    }
    const seat = getSeatById(id);
    if (!seat) {
      return new Response(JSON.stringify({ success: false, reason: 'not_found' }), {
        status: 404
      });
    }
    return new Response(JSON.stringify({ success: true, seat }), { status: 200 });
  } catch (e) {
    console.error('GET /api/v1/seats/{id} failed:', e);
    return new Response(JSON.stringify({ success: false, reason: 'internal_error' }), {
      status: 500
    });
  }
};
