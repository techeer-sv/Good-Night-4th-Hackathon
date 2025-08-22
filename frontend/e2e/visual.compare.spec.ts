import { test } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const outDir = path.resolve(process.cwd(), 'test-results', 'visual');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

test('capture app /select and example/stitch screenshots', async ({ page, baseURL }) => {
  // Navigate to app route (Playwright's webServer should provide baseURL)
  const appUrl = (baseURL ?? 'http://localhost:5173') + '/select';
  await page.goto(appUrl, { waitUntil: 'networkidle' });
  await page.locator('body').waitFor();
  const appPath = path.join(outDir, 'app-select.png');
  await page.screenshot({ path: appPath, fullPage: true });
  console.log('Saved', appPath);

  // Open example file from disk
  const exampleFile = path.resolve(process.cwd(), 'example', 'stitch.html');
  const fileUrl = 'file://' + exampleFile;
  await page.goto(fileUrl, { waitUntil: 'load' });
  await page.locator('body').waitFor();
  const examplePath = path.join(outDir, 'example-stitch.png');
  await page.screenshot({ path: examplePath, fullPage: true });
  console.log('Saved', examplePath);
});
