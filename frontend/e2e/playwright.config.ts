import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'bun run build && bun run preview',
    port: 5173,  // aligned with local dev server (bun vite dev)
    timeout: 120000
  },
  testDir: 'e2e'
});