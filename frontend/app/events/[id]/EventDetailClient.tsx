"use client";
import { useQuery } from '@tanstack/react-query';
import { fetchEvent, eventDetailQueryKey, bookEvent } from '@/services/events';
import type { Event } from '@/types/events';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';
import Link from 'next/link';

export function EventDetailClient({ id }: { id: string }) {
  const qc = useQueryClient();
  const { success, error: toastError } = useToast();

  const { data, error, isLoading } = useQuery({
    queryKey: eventDetailQueryKey(id),
    queryFn: () => fetchEvent(id),
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: () => bookEvent(id),
    onSuccess: (res) => {
      success('Booking confirmed', `Remaining seats: ${res.remainingSeats}`);
      // Optimistically update cache
      qc.setQueryData(eventDetailQueryKey(id), (old: Event | undefined) => old ? { ...old, remainingSeats: res.remainingSeats } : old);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : 'Please try again';
      toastError('Booking failed', message);
    },
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error || !data) return <div className="p-8">Failed to load event.</div>;

  return (
    <main className="min-h-screen bg-neutral-50 py-14">
      <div className="mx-auto px-6 max-w-4xl">
        <Link href="/events" className="text-sm text-gray-600 hover:text-gray-900">← Back</Link>
        <article className="mt-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">{data.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span className="px-2 py-0.5 rounded-md border border-gray-300 bg-white capitalize">{data.category}</span>
              <span>{new Date(data.startsAt).toLocaleString()}</span>
              <span>{data.venue}</span>
              <span>{data.remainingSeats} seats</span>
            </div>
          </header>
          {data.poster && (
            <div className="w-full h-72 rounded-lg border border-gray-200 overflow-hidden mb-10 bg-gray-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.poster} alt={data.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="prose prose-neutral max-w-none mb-10">
            <p>{data.description}</p>
          </div>
          {data.price && (
            <div className="text-xl font-semibold text-gray-900 mb-6">Price: ${data.price}</div>
          )}
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || data.remainingSeats <= 0}
            className={`px-5 py-2.5 rounded-md text-sm font-medium border transition ${
              data.remainingSeats <= 0
                ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
                : 'bg-gray-900 text-white border-gray-900 hover:bg-gray-800'
            }`}
          >
            {data.remainingSeats <= 0 ? 'Sold Out' : (mutation.isPending ? 'Booking...' : 'Book Now')}
          </button>
        </article>
      </div>
    </main>
  );
}
