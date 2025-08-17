import { reserveSeat as reserveInStore, getSeat } from '../_store/seats';

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const fetchCache = 'default-no-store';

interface ReserveBody { seatId?: string; user?: string }

// POST /api/reserve { seatId, user }
// Implements simple 99% success / 1% simulated transient failure.
export async function POST(req: Request) {
  let body: ReserveBody = {};
  try {
    if (req.headers.get('content-type')?.includes('application/json')) body = await req.json();
  } catch { /* ignore malformed */ }

  // Input validation
  if (!body.seatId || typeof body.seatId !== 'string') {
    return Response.json({ ok: false, reason: 'validation' }, { status: 400 });
  }

  // 1% simulated transient failure BEFORE mutating state
  if (Math.random() < 0.01) {
    return Response.json({ ok: false, reason: 'transient_failure' }, { status: 503 });
  }

  // Fetch current seat
  const seat = getSeat(body.seatId);
  if (!seat) {
    return Response.json({ ok: false, reason: 'not_found' }, { status: 404 });
  }
  if (seat.status === 'reserved') {
    return Response.json({ ok: false, reason: 'already_reserved', seat: seat.seatId }, { status: 409 });
  }

  // Attempt reservation
  const result = reserveInStore(body.seatId, body.user);
  if (!result.ok) {
    const status = result.reason === 'already_reserved' ? 409 : 400;
    return Response.json({ ok: false, reason: result.reason }, { status });
  }

  return Response.json({ ok: true, seat: result.seat?.seatId });
}
