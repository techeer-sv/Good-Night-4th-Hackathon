import { test, expect } from '@playwright/test';

// 좌석 선택 및 예약 제출 플로우를 검증하는 E2E 테스트

test('좌석 선택 후 예약이 진행되어 /details로 이동해야 한다', async ({ page }) => {
  await page.goto('/select');

  // Find the first available seat and click it
  const availableSeat = page.locator('[role="button"][aria-disabled="false"]').first();
  await availableSeat.click();

  // Click the "Book Selected Seat" button
  await page.locator('.mt-4 button').click();

  // Take a screenshot to visually debug the modal's state
  await page.screenshot({ path: 'test-results/modal-debug-screenshot.png', fullPage: true });

  // 예약 모달이 열리는지 확인
  const modal = page.locator('[role="dialog"]');
  await expect(modal).toBeVisible({ timeout: 5000 });

  // 모달 내 name/contact 필드에 값 채우기
  await modal.locator('input[name="name"]').fill('테스트 사용자');
  await modal.locator('input[name="contact"]').fill('010-1234-5678');

  // 폼 제출
  await modal.locator('button[type="submit"]').click();

  await page.waitForURL('**/details', { timeout: 5000 });
  expect(page.url()).toContain('/details');

  // Details 페이지에서 추가 제출 흐름 검증
  await page.locator('input[name="name"]').fill('테스트 사용자 상세');
  await page.locator('input[name="contact"]').fill('010-9999-8888');
  await page.locator('button[type="submit"]').click();

  await page.waitForURL('**/confirm**', { timeout: 5000 });
  expect(page.url()).toContain('/confirm');
});
