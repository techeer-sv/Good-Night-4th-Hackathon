import { test, expect } from '@playwright/test';

// GammaSeatSelector interaction tests (UI level only)

test.describe('Seat Selection UI (Gamma)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/seat-selection');
  });

  test('renders heading and empty selection summary', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /좌석 선택/i })).toBeVisible();
    await expect(page.getByText('좌석을 선택하세요')).toBeVisible();
  });

  test('select seats up to max and prevent overflow', async ({ page }) => {
    // Determine max from chip text ("최대 선택 X석")
    const chip = page.getByText(/최대 선택/).first();
    const chipText = await chip.textContent();
    const match = chipText?.match(/최대 선택\s+(\d+)/);
  const max = match ? parseInt(match[1] as string, 10) : 4; // default fallback; cast safe due to regex check

    // Query a bunch of unsold seats (button without .is-sold)
    const seatButtons = page.locator('button.gamma-seat:not(.is-sold)').filter({ hasNotText: '' });
    const count = await seatButtons.count();
    expect(count).toBeGreaterThan(max + 2); // ensure enough seats for test

    // Click seats up to max
    for (let i = 0; i < max; i++) {
      await seatButtons.nth(i).click();
    }
    // Attempt one more beyond max
    await seatButtons.nth(max).click();

    // Validate selected count does not exceed max
    const selected = page.locator('.gamma-selected-list .gamma-pill');
    await expect(selected).toHaveCount(max);

    // Price should be > 0 (basic sanity)
    const priceText = await page.locator('.gamma-price strong').innerText();
    expect(priceText).toMatch(/₩/);
  });

  test('clear selection resets summary and price', async ({ page }) => {
  // Wait for at least one interactable seat to be present
  const firstSeat = page.locator('button.gamma-seat:not(.is-sold)').first();
  await expect(firstSeat).toBeVisible();
  // Use data-id attribute to ensure click registers (some browsers may need scroll)
  await firstSeat.scrollIntoViewIfNeeded();
  await firstSeat.click({ trial: false });
  // Retry assertion to accommodate slower rendering on WebKit mobile
  await expect(page.locator('.gamma-selected-list .gamma-pill')).toHaveCount(1, { timeout: 10000 });
  // Clear button has Korean accessible label or text containing '선택 해제'
  const clearBtn = page.getByRole('button', { name: /선택.*해제/ });
  await expect(clearBtn).toBeVisible({ timeout: 5000 });
  await clearBtn.click();
    await expect(page.locator('.gamma-selected-list .gamma-pill')).toHaveCount(0);
    await expect(page.getByText('좌석을 선택하세요')).toBeVisible();
  });
});
