import { listSeats } from '../_store/seats';

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const fetchCache = 'default-no-store';

// GET /api/seats  -> list for SeatGrid
export async function GET() {
  const data = listSeats().map(s => ({ seatId: s.seatId, status: s.status }));
  return Response.json(data, { headers: { 'cache-control': 'no-store' } });
}
