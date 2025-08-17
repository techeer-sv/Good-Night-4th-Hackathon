import { reserveSeat } from '../_store/seats';

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const fetchCache = 'default-no-store';

interface ReserveBody { seatId?: string; user?: string }

// POST /api/reservations { seatId, user }
export async function POST(req: Request) {
  let body: ReserveBody = {};
  try {
    if (req.headers.get('content-type')?.includes('application/json')) body = await req.json();
  } catch { /* ignore malformed */ }
  if (!body.seatId) return Response.json({ ok:false, reason:'validation' }, { status:400 });
  const result = reserveSeat(body.seatId, body.user);
  if (!result.ok) {
    const status = result.reason === 'not_found' ? 404 : 409;
    return Response.json({ ok:false, reason: result.reason, seat: result.seat?.seatId }, { status });
  }
  return Response.json({ ok:true, seat: result.seat?.seatId });
}
