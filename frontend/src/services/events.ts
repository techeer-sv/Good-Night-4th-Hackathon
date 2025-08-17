import { apiFetch } from '@/lib/api';
import type { EventListResponse, EventListParams, Event } from '@/types/events';

// Event list query key factory
export const eventListQueryKey = (params: EventListParams) => 
  ['events', 'list', params] as const;

// Event detail query key factory
export const eventDetailQueryKey = (id: string) => ['events', 'detail', id] as const;

// Server-side fetch function for event list
export async function fetchEventList(params: EventListParams): Promise<EventListResponse> {
  const searchParams = new URLSearchParams();
  searchParams.set('page', String(params.page ?? 1));
  searchParams.set('limit', String(params.limit ?? 12));
  if (params.category) searchParams.set('category', params.category);

  return apiFetch<EventListResponse>(`/api/events?${searchParams.toString()}`);
}

// Server-side fetch function for event detail
export async function fetchEvent(id: string): Promise<Event> {
  return apiFetch<Event>(`/api/events/${id}`);
}

// Book event (mock mutation) returns remaining seats
export interface BookEventResult {
  success: boolean;
  eventId: string;
  remainingSeats: number;
}

export async function bookEvent(id: string): Promise<BookEventResult> {
  return apiFetch<BookEventResult>(`/api/events/${id}/book`, { method: 'POST' });
}
