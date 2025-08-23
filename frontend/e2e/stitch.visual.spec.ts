import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Visual Comparison: Stitch Page', () => {
  test('should match the saved snapshot', async ({ page }) => {
    // example/stitch.html 파일의 절대 경로를 생성합니다.
    const stitchHtmlPath = path.resolve(process.cwd(), 'example', 'stitch.html');
    const stitchUrl = `file://${stitchHtmlPath}`;

    // 파일 URL로 이동합니다.
    await page.goto(stitchUrl);

    // 페이지 전체 스크린샷이 스냅샷과 일치하는지 확인합니다.
    // 스냅샷이 없으면 새로 생성됩니다.
    await expect(page).toHaveScreenshot('stitch-page.png', {
      fullPage: true,
      maxDiffPixels: 100 // 약간의 픽셀 차이를 허용하여 유연성을 줍니다.
    });
  });
});
