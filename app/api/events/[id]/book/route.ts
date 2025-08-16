import { events } from '../../data';

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const fetchCache = 'default-no-store';

type Params = { id: string };

export async function POST(_req: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const event = events.find(e => e.id === id);
  if (!event) {
    return new Response(JSON.stringify({ error: 'Event not found' }), { status: 404 });
  }
  if (event.remainingSeats <= 0) {
    return new Response(JSON.stringify({ error: 'Sold out' }), { status: 409 });
  }
  event.remainingSeats -= 1; // mock decrement
  return Response.json({ success: true, eventId: id, remainingSeats: event.remainingSeats });
}
