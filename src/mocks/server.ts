import { setupServer } from 'msw/node';
import { rest } from 'msw';

const events = [
	{ id: 'e1', title: 'Mock Concert', remainingSeats: 42 },
	{ id: 'e2', title: 'Mock Conference', remainingSeats: 10 },
];

// Mock session state for testing
let mockIsAuthenticated = false;
let mockUser = {
	id: 'user-123',
	email: 'demo@example.com',
	name: 'Demo User',
	createdAt: '2024-01-01T00:00:00Z',
};

export const handlers = [
	// Events endpoints
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

	// Auth endpoints
	rest.get('/api/me', (_req, res, ctx) => {
		if (mockIsAuthenticated) {
			return res(ctx.status(200), ctx.json(mockUser));
		} else {
			return res(
				ctx.status(401),
				ctx.json({ error: 'Unauthorized', message: 'No valid session found' })
			);
		}
	}),
	rest.post('/api/auth/login', async (req, res, ctx) => {
		try {
			const body = await req.json();
			const { email, password } = body as { email: string; password: string };

			if (!email || !password) {
				return res(
					ctx.status(400),
					ctx.json({ error: 'Validation Error', message: 'Email and password are required' })
				);
			}

			// Mock authentication - accept any email with password "password"
			if (password !== 'password') {
				return res(
					ctx.status(401),
					ctx.json({ error: 'Authentication Failed', message: 'Invalid email or password' })
				);
			}

			// Set mock authenticated state
			mockIsAuthenticated = true;
			const emailUsername = email.split('@')[0] || 'user';
			mockUser = {
				...mockUser,
				email: email,
				name: emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1),
			};

			return res(
				ctx.status(200),
				ctx.json({ user: mockUser, message: 'Login successful' })
			);
		} catch {
			return res(
				ctx.status(500),
				ctx.json({ error: 'Internal Server Error', message: 'Login failed' })
			);
		}
	}),
	rest.post('/api/auth/logout', (_req, res, ctx) => {
		mockIsAuthenticated = false;
		return res(
			ctx.status(200),
			ctx.json({ message: 'Logout successful' })
		);
	}),
];

export const server = setupServer(...handlers);

// Export helper functions for testing
export const setMockAuthState = (isAuth: boolean) => {
	mockIsAuthenticated = isAuth;
};

export const getMockAuthState = () => mockIsAuthenticated;
