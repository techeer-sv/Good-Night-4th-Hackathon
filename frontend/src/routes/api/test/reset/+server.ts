import { json, type RequestHandler } from '@sveltejs/kit';
import { resetDatabase } from '$lib/server/database';

/**
 * This endpoint is for testing purposes only.
 * It resets the in-memory database to its initial state.
 */
export const POST: RequestHandler = async () => {
  resetDatabase();
  return json({ success: true, message: 'Database has been reset.' });
};
