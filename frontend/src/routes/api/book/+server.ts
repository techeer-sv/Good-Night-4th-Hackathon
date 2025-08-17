import type { RequestHandler } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { seats } from '$lib/stores/booking';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { name, contact, seatId } = await request.json();

    if (!name || !contact || !seatId) {
      return new Response(JSON.stringify({ error: 'validation' }), { status: 400 });
    }

    // 현재 좌석 상태 확인
    const current = get(seats);
    const s = current.find((x) => x.id === String(seatId));
    if (!s) {
      return new Response(JSON.stringify({ error: 'seat_not_found' }), { status: 404 });
    }
    if (s.state === 'booked') {
      return new Response(JSON.stringify({ error: 'seat_unavailable' }), { status: 409 });
    }

    // 좌석 예약 처리
    seats.update((arr) => {
      const idx = arr.findIndex((x) => x.id === String(seatId));
      if (idx >= 0) {
        const next = [...arr];
        next[idx] = { ...next[idx], state: 'booked' };
        return next;
      }
      return arr;
    });

    // 성공 응답
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error('Booking failed:', error);
    return new Response(JSON.stringify({ error: 'internal_server_error' }), { status: 500 });
  }
};