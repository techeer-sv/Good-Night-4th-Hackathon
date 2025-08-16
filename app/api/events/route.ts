import { NextRequest } from 'next/server';
import { EventListResponse } from '@/types/events';
import { events as mockEvents } from './data';

export const runtime = 'edge';
export const preferredRegion = 'auto';
export const fetchCache = 'default-no-store';


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const category = searchParams.get('category') || '';
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));

  // Filter by category if provided
  let filteredEvents = mockEvents;
  if (category && category.trim() !== '') {
    filteredEvents = mockEvents.filter(event => 
      event.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Calculate pagination
  const totalCount = filteredEvents.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const events = filteredEvents.slice(startIndex, endIndex);

  const response: EventListResponse = {
    events,
    totalCount,
    totalPages,
    currentPage: page,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };

  return Response.json(response);
}
