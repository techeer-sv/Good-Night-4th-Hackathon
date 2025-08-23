import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE_URL = 'http://localhost:8080';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const userId = request.headers.get('X-User-Id');

		if (!userId) {
			return json({ success: false, reason: 'missing_user' }, { status: 400 });
		}

		const response = await fetch(`${API_BASE_URL}/fcfs/join`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-User-Id': userId
			},
			body: JSON.stringify(body)
		});

		const data = await response.json();
		return json(data, { status: response.status });

	} catch (error) {
		// Log the detailed error to the server console for debugging
		console.error('Error in reservation proxy route:', error);
		return json({ success: false, reason: 'internal_error' }, { status: 500 });
	}
};