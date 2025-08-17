import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getServerQueryClient } from '@/lib/reactQuery';
import { fetchEvent, eventDetailQueryKey } from '@/services/events';
import { notFound } from 'next/navigation';
import { EventDetailClient } from './EventDetailClient';

export const dynamic = 'force-dynamic';
type Params = { id: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const queryClient = getServerQueryClient();
  try {
    await queryClient.prefetchQuery({
      queryKey: eventDetailQueryKey(id),
      queryFn: () => fetchEvent(id),
      staleTime: 5 * 60 * 1000,
    });
  } catch {
    return notFound();
  }
  const dehydratedState = dehydrate(queryClient);
  return (
    <HydrationBoundary state={dehydratedState}>
      <EventDetailClient id={id} />
    </HydrationBoundary>
  );
}
