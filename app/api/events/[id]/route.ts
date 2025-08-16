import { events } from '../data';
export const runtime = 'edge';
export const preferredRegion = 'auto';
export const fetchCache = 'default-no-store';

type Params = { id: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  const found = events.find(e => e.id === id);
  if (!found) {
    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404 });
  }
  return Response.json(found);
}
