import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import http from 'http';

export const GET: RequestHandler = async () => {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/v1/seats',
      method: 'GET',
      headers: {
        'User-Agent': 'curl/8.7.1' // Keep the user-agent just in case
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(json(JSON.parse(data)));
        } catch (e) {
          console.error('Failed to parse JSON from upstream API:', e);
          resolve(json({ success: false, message: 'Invalid JSON response from upstream' }, { status: 500 }));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Error in proxy API route (http.request):', error);
      resolve(json({ success: false, message: 'Internal server error' }, { status: 500 }));
    });

    req.end();
  });
};
