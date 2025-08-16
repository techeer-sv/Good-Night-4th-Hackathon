export const runtime = 'edge';
export const preferredRegion = 'auto';
export const fetchCache = 'default-no-store';

type Params = { id: string };

export async function GET(_req: Request, { params }: { params: Promise<Params> }) {
  const { id } = await params;
  return Response.json({ id, title: 'TBD', remainingSeats: 0 });
}
