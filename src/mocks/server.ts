import { setupServer } from 'msw/node';
import { rest } from 'msw';

const events = [
	{ id: 'e1', title: 'Mock Concert', remainingSeats: 42 },
	{ id: 'e2', title: 'Mock Conference', remainingSeats: 10 },
];

export const handlers = [
	rest.get('/api/events', (_req, res, ctx) => {
		return res(ctx.status(200), ctx.json(events));
	}),
	rest.get('/api/events/:id', (req, res, ctx) => {
		const id = req.params['id'] as string;
		const event = events.find(e => e.id === id);
		if (!event) return res(ctx.status(404));
		return res(ctx.status(200), ctx.json(event));
	}),
	rest.post('/api/bookings', async (req, res, ctx) => {
		try {
			const body = await req.json();
			const eventId = (body as { eventId?: string }).eventId;
			if (eventId) {
				const target = events.find(e => e.id === eventId);
				if (target && target.remainingSeats > 0) target.remainingSeats -= 1;
			}
			return res(ctx.status(201), ctx.json({ ok: true }));
		} catch {
			return res(ctx.status(400));
		}
	}),
];

export const server = setupServer(...handlers);
