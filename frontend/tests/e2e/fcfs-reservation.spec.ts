import { test, expect } from '@playwright/test';

// FCFS reservation endpoint smoke test
// NOTE: This uses the in-memory mock implementation; state will persist across tests in the same worker.

import type { Page } from '@playwright/test';

async function reserve(page: Page, phone?: string) {
  return await page.request.post('/api/v1/seats/reservation/fcfs', {
    data: phone ? { phone } : {}
  });
}

test.describe('FCFS Reservation API', () => {
  test('successful seat reservation returns success true', async ({ page }) => {
    const res = await reserve(page, '+821012345600');
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.seat_id).toBeTruthy();
  });

  test('same phone returns already_reserved on second call', async ({ page }) => {
    const phone = '+821012345601';
    const first = await reserve(page, phone);
    expect((await first.json()).success).toBe(true);
    const second = await reserve(page, phone);
    const secondJson = await second.json();
    expect(secondJson.success).toBe(false);
    expect(secondJson.reason).toBe('already_reserved');
    expect(secondJson.seat_id).toBeTruthy();
  });

  test('reserve until sold_out (artificial loop)', async ({ page }) => {
    // We'll attempt a bunch of reservations to eventually hit sold_out.
    // Limit loop to avoid infinite runs.
    let soldOutHit = false;
    for (let i = 0; i < 30; i++) {
      const res = await reserve(page, `+8210999${100 + i}`);
      const json = await res.json();
      if (json.reason === 'sold_out') { soldOutHit = true; break; }
    }
    expect(soldOutHit).toBeTruthy();
  });
});
