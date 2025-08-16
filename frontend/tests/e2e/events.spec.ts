import { test, expect } from '@playwright/test';

// Events listing & navigation

test.describe('Events Listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/events');
  });

  test('shows events header and loads a list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Events' })).toBeVisible();
    // Wait for at least one event card link
    const firstCard = page.locator('ul[role="list"] li a').first();
    await expect(firstCard).toBeVisible();
  });

  test('filter by category and update listing text', async ({ page }) => {
    const musicBtn = page.getByRole('button', { name: 'music' });
    await musicBtn.click();
    await expect(page.getByText(/events in music/i)).toBeVisible();
  });

  test('pagination next/previous works (if multiple pages)', async ({ page }) => {
    // If only a single page of results, pagination nav isn't rendered at all.
    const paginationNav = page.locator('nav[aria-label="Pagination"]');
    if (await paginationNav.count() === 0) test.skip();
    const next = page.getByRole('button', { name: 'Next page' });
    if (!(await next.isVisible())) test.skip();
    if (await next.isDisabled()) test.skip();
    await next.click();
    await expect(page.getByText(/Page 2 of/)).toBeVisible();
    const prev = page.getByRole('button', { name: 'Previous page' });
    await prev.click();
    await expect(page.getByText(/Page 1 of/)).toBeVisible();
  });

  test('navigate to event detail and back', async ({ page }) => {
    const firstCard = page.locator('ul[role="list"] li a').first();
    const title = await firstCard.locator('h3').innerText();
    await firstCard.click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    // Instead of relying on history (which proved flaky producing about:blank), explicitly navigate back.
    // Prefer clicking a consistent nav element if available; fallback to direct goto.
    const eventsNavLink = page.getByRole('link', { name: 'Events' }).first();
    if (await eventsNavLink.count()) {
      await eventsNavLink.click();
    } else {
      await page.goto('/events');
    }
    // Wait for either heading variant (there are two possible h1s depending on layout) to appear.
    const heading = page.getByRole('heading', { name: 'Events' });
    await expect(heading).toBeVisible({ timeout: 15000 });
  });
});
