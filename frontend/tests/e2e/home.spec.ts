import { test, expect } from '@playwright/test';

// Basic landing page smoke test
// Verifies that core homepage UI elements render.

test.describe('Home Page', () => {
  test('renders hero content and footer links', async ({ page }) => {
    await page.goto('/');

    // Logo image alt
    await expect(page.getByAltText('Next.js logo')).toBeVisible();

    // Tailwind verification block
    await expect(page.getByText('Tailwind utilities active', { exact: false })).toBeVisible();

    // CTA buttons
    const deployLink = page.getByRole('link', { name: /Deploy now/i });
    await expect(deployLink).toBeVisible();

    // Footer links
    await expect(page.getByRole('link', { name: /Learn/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Examples/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Go to nextjs.org/i })).toBeVisible();
  });
});
