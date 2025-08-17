import type { RequestHandler } from '@sveltejs/kit';
import { reserveSeatFcfs } from '$lib/server/tickettock';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const userId = request.headers.get('x-user-id') || request.headers.get('X-User-Id');
    if (!userId) {
      return new Response(JSON.stringify({ success: false, reason: 'missing_user' }), {
        status: 400
      });
    }

    const body = (await request.json().catch(() => ({}))) as {
      user_name?: string;
      phone?: string;
    };
    if (!body || !body.user_name || !body.phone) {
      return new Response(JSON.stringify({ success: false, reason: 'validation' }), {
        status: 400
      });
    }

    const result = reserveSeatFcfs(userId, {
      user_name: body.user_name,
      phone: body.phone
    });

    if (result.success) {
      return new Response(JSON.stringify(result), { status: 200 });
    }

    // map reason to status codes per PRD
    const statusByReason: Record<string, number> = {
      sold_out: 409,
      duplicate: 409,
      contention: 409,
      already_reserved: 409,
      validation: 400,
      missing_user: 400,
      service_unavailable: 503,
      redis_error: 503,
      sequence_unavailable: 503,
      not_found: 404,
      internal_error: 500
    };

    const status = statusByReason[result.reason] ?? 500;
    return new Response(JSON.stringify({ success: false, reason: result.reason }), {
      status
    });
  } catch (e) {
    console.error('POST /api/v1/seats/reservation/fcfs failed:', e);
    return new Response(JSON.stringify({ success: false, reason: 'internal_error' }), {
      status: 500
    });
  }
};
