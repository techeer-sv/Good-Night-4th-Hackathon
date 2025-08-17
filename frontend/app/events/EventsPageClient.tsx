'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import type { EventListParams } from '@/types/events';
import { eventListQueryKey, eventDetailQueryKey, fetchEventList, fetchEvent } from '@/services/events';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

interface EventsPageClientProps {
  initialParams: EventListParams; // retained for potential future use
}

// Reusable EventCard with prefetch
function EventCard({ eventId, title, category, poster, remainingSeats, description, venue, startsAt, price }: {
  eventId: string; title: string; category: string; poster?: string; remainingSeats: number; description: string; venue: string; startsAt: string; price?: number;
}) {
  const qc = useQueryClient();
  const prefetch = () => {
    qc.prefetchQuery({
      queryKey: eventDetailQueryKey(eventId),
      queryFn: () => fetchEvent(eventId),
      staleTime: 5 * 60 * 1000,
    }).catch(() => {});
  };
  return (
    <li className="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-all focus-within:border-gray-400 hover:border-gray-300">
      <Link
        href={`/events/${eventId}`}
        prefetch={false}
        onMouseEnter={prefetch}
        onFocus={prefetch}
        className="block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-5"
        aria-describedby={`event-${eventId}-desc`}
      >
        <div className="flex gap-5">
          <div className="w-28 h-28 flex-shrink-0 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center text-gray-400 text-xl font-semibold">
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt={title} className="w-full h-full object-cover" />
            ) : (
              title.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded-full border border-gray-300 text-xs capitalize bg-white text-gray-700 group-hover:border-gray-400">{category}</span>
              <span className="text-xs text-gray-500">{new Date(startsAt).toLocaleDateString()}</span>
              <span className="text-xs text-gray-500">{venue}</span>
              <span className="text-xs text-gray-500">{remainingSeats} seats</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 tracking-tight">{title}</h3>
            <p id={`event-${eventId}-desc`} className="text-gray-600 text-sm line-clamp-2">{description}</p>
            {price && <div className="mt-2 text-sm font-medium text-gray-900">${price}</div>}
          </div>
        </div>
      </Link>
    </li>
  );
}

function EventsPageContent({}: EventsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  
  // Current URL parameters
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const currentCategory = searchParams.get('category') || '';
  
  const queryParams: EventListParams = {
    page: currentPage,
    category: currentCategory,
    limit: 12,
  };

  // Use React Query to fetch data (will use prefetched data on initial load)
  const { data, isLoading, error } = useQuery({
    queryKey: eventListQueryKey(queryParams),
    queryFn: () => fetchEventList(queryParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Avoid refetch-on-mount if dehydrated (handled by react-query automatically, but be explicit):
    refetchOnMount: false,
  });

  // Scroll & focus on page/category changes
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
    // Smooth scroll to top of main content
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, currentCategory]);

  // Handle page navigation
  const updateSearchParams = (newParams: Partial<EventListParams>) => {
    const params = new URLSearchParams(searchParams);
    
    if (newParams.page !== undefined) {
      if (newParams.page === 1) {
        params.delete('page');
      } else {
        params.set('page', newParams.page.toString());
      }
    }
    
    if (newParams.category !== undefined) {
      if (newParams.category === '') {
        params.delete('category');
      } else {
        params.set('category', newParams.category);
      }
    }
    
    router.push(`/events?${params.toString()}`);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Events</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">Failed to load events. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="mx-auto px-6 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 ref={headingRef} tabIndex={-1} className="text-4xl font-bold tracking-tight text-gray-900 mb-3 focus:outline-none">Events</h1>
          <p className="text-base text-gray-600">Discover upcoming sessions. Clean minimalist style like a knowledge workspace.</p>
        </div>

        {/* Category Filter */}
        <div className="mb-8" role="navigation" aria-label="Event categories">
          <div className="flex flex-wrap gap-2" role="list">
            <button
              onClick={() => updateSearchParams({ category: '', page: 1 })}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                currentCategory === ''
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 hover:border-gray-400 border-gray-300'
              }`}
              aria-pressed={currentCategory === ''}
            >
              All Categories
            </button>
            {['music', 'theater', 'comedy', 'conference', 'workshop', 'food', 'wellness', 'film'].map((category) => (
              <button
                key={category}
                onClick={() => updateSearchParams({ category, page: 1 })}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize border ${
                  currentCategory === category
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 hover:border-gray-400 border-gray-300'
                }`}
                aria-pressed={currentCategory === category}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        )}

        {/* Events Grid */}
        {data && !isLoading && (
          <>
            {/* Results Info */}
            <div className="mb-6 text-center text-gray-600">
              {currentCategory ? (
                <p>
                  Showing {data.events.length} of {data.totalCount} events in{' '}
                  <span className="font-medium capitalize">{currentCategory}</span>
                </p>
              ) : (
                <p>
                  Showing {data.events.length} of {data.totalCount} events
                </p>
              )}
            </div>

            {/* Event Cards */}
            {data.events.length > 0 ? (
              <ul className="space-y-4 mb-10" role="list">
                {data.events.map((event) => (
                  <EventCard key={event.id} eventId={event.id} title={event.title} category={event.category} poster={event.poster} remainingSeats={event.remainingSeats} description={event.description} venue={event.venue} startsAt={event.startsAt} price={event.price} />
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {currentCategory 
                    ? `No events found in the ${currentCategory} category.`
                    : 'No events found.'
                  }
                </p>
              </div>
            )}

            {/* Pagination */}
            {data.totalPages > 1 && (
              <nav className="flex justify-center items-center space-x-4" aria-label="Pagination">
                <button
                  onClick={() => updateSearchParams({ page: currentPage - 1 })}
                  disabled={!data.hasPreviousPage}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    data.hasPreviousPage
                      ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Previous page"
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {data.currentPage} of {data.totalPages}
                </span>
                
                <button
                  onClick={() => updateSearchParams({ page: currentPage + 1 })}
                  disabled={!data.hasNextPage}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    data.hasNextPage
                      ? 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  aria-label="Next page"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function EventsPageClient(props: EventsPageClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    }>
      <EventsPageContent {...props} />
    </Suspense>
  );
}
