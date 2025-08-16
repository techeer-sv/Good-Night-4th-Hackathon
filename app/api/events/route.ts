export const runtime = 'edge';
export const preferredRegion = 'auto';
export const fetchCache = 'default-no-store';

export async function GET() {
  // Placeholder list; MSW provides richer mock data client-side.
  return Response.json([]);
}
