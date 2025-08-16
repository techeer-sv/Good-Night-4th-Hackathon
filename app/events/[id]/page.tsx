export const dynamic = 'force-dynamic';

type Params = { id: string };

export async function generateStaticParams() {
  // Stub illustrating pattern; real data fetching later.
  return [{ id: 'example' }];
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  return <div className="p-4">Event detail placeholder for {id}</div>;
}
