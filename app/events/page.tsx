import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getServerQueryClient } from '@/lib/reactQuery';
import type { EventListParams } from '@/types/events';
import { EventsPageClient } from './EventsPageClient';
import { fetchEventList, eventListQueryKey } from '@/services/events';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

// Next.js (v15) expects searchParams to be a Promise in PageProps type guard
interface EventsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: EventsPageProps) {
  const resolved = (await searchParams) || {};
  const pageRaw = resolved['page'];
  const categoryRaw = resolved['category'];
  const pageParam = Array.isArray(pageRaw) ? pageRaw[0] : pageRaw;
  const categoryParam = Array.isArray(categoryRaw) ? categoryRaw[0] : categoryRaw;
  const page = Math.max(1, parseInt(pageParam || '1', 10));
  const category = categoryParam || '';
  
  const queryParams: EventListParams = {
    page,
    category,
    limit: 12,
  };

  const queryClient = getServerQueryClient();
  await queryClient.prefetchQuery({
    queryKey: eventListQueryKey(queryParams),
    queryFn: () => fetchEventList(queryParams),
    staleTime: 5 * 60 * 1000,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <EventsPageClient initialParams={queryParams} />
    </HydrationBoundary>
  );
}
