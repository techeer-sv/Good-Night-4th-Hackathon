import { test, expect } from '@playwright/test';

test('좌석 선택 → 모달 → 예약 → /details', async ({ page }) => {
  // 1) 모션 억제
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' });

  // 2) API 목킹 (필수는 아니지만 강력 추천)
  await page.route('**/api/v1/reserve', r =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, seat: { id: 1 } })
    })
  );

  await page.goto('/select');

  // Svelte의 tick 함수를 사용하기 위해 window 객체에 등록될 때까지 대기
  await page.waitForFunction(() => (window as any).svelte);

  // 3) 좌석 클릭 → 선택됨을 먼저 보장
  const seat = page.getByTestId('seat').first();
  await expect(seat).toBeEnabled();
  await seat.click();

  // 모달이 나타날 때까지 기다림
  await page.waitForSelector('dialog[open]');

  await expect(seat).toHaveAttribute('aria-pressed', 'true');

  // 4) 모달은 'open'이 진실
  const modal = page.locator('dialog[open]');
  await expect(modal).toBeVisible();

  await modal.locator('#name').fill('John Doe');
  await modal.locator('#contact').fill('010-1234-5678');

  await Promise.all([
    page.waitForURL('**/details'),
    modal.getByRole('button', { name: /book now/i }).click()
  ]);
});