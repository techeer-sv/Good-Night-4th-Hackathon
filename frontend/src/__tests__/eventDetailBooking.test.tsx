import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rest } from 'msw';
import { server } from '../mocks/server';
import { EventDetailClient } from 'app/events/[id]/EventDetailClient';

function setup(id: string) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <EventDetailClient id={id} />
    </QueryClientProvider>
  );
}

describe('EventDetailClient booking', () => {
  it('optimistically updates remaining seats after booking', async () => {
    // Override handler to provide consistent event detail with remainingSeats 2
    server.use(
      rest.get('/api/events/:id', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({
          id: req.params['id'],
          title: 'Test Event',
          category: 'test',
          startsAt: new Date().toISOString(),
          venue: 'Test Hall',
          remainingSeats: 3,
          description: 'Desc',
        }));
      }),
      rest.post('/api/events/:id/book', (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ success: true, eventId: 'e-test', remainingSeats: 2 }));
      })
    );

    setup('e-test');

    // Wait for initial load
    expect(await screen.findByText('Test Event')).toBeInTheDocument();
  // Initial remaining seats
  expect(screen.getByText(/3\s*seats/i)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /book now/i }));
  await waitFor(() => expect(screen.getByText(/2\s*seats/i)).toBeInTheDocument());
  });
});
