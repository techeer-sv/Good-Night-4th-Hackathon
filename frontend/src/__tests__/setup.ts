import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'node:util';

// Polyfill global TextEncoder/TextDecoder for libraries expecting them (MSW/interceptors)
// Limited mutable reference to global for polyfilling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g = globalThis as any;
if (!g.TextEncoder) g.TextEncoder = TextEncoder as unknown as typeof g.TextEncoder;
if (!g.TextDecoder) g.TextDecoder = TextDecoder as unknown as typeof g.TextDecoder;

import { server } from '../mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Jest requires at least one test per file treated as a suite; provide a noop to avoid failure.
test('test environment setup loaded', () => {
	expect(true).toBe(true);
});
