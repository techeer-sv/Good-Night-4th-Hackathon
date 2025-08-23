import { test, expect } from '@playwright/test';

test.describe('Booking Flow E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.request.post('/api/test/reset');
  });

  test('should allow a user to select an available seat, book it, and see it become booked', async ({ page }) => {
    await page.goto('/');
    
    const availableSeat = page.locator('[data-seat-id="1"][data-state="available"]');
    const bookedSeat = page.locator('[data-seat-id="2"][data-state="booked"]');
    await expect(availableSeat).toBeVisible();
    await expect(bookedSeat).toBeVisible();
    
    await availableSeat.click();

    const popup = page.locator('.popup');
    await expect(popup).toBeVisible();
    await expect(popup.locator('h3')).toContainText('Booking Details for 1');

    await popup.locator('#name').fill('Test User');
    await popup.locator('#contact').fill('010-1234-5678');
    await popup.getByRole('button', { name: 'Book Now' }).click();

    // The popup should close, and the seat should now be booked.
    await expect(popup).not.toBeVisible();
    const newlyBookedSeat = page.locator('[data-seat-id="1"][data-state="booked"]');
    await expect(newlyBookedSeat).toBeVisible();
  });

  test('should not open popup when a booked seat is clicked', async ({ page }) => {
    await page.goto('/');
    const bookedSeat = page.locator('[data-seat-id="2"][data-state="booked"]');
    await expect(bookedSeat).toBeVisible();

    await bookedSeat.click({ force: true });
    const popup = page.locator('.popup');
    await expect(popup).not.toBeVisible();
  });

  test('should show an error message if the seat is booked by someone else', async ({ page, context }) => {
    await page.goto('/');
    const availableSeat = page.locator('[data-seat-id="3"][data-state="available"]');
    await availableSeat.click();
    const popup = page.locator('.popup');
    await expect(popup).toBeVisible();

    // User 2 books the same seat in the background
    const user2Page = await context.newPage();
    await user2Page.goto('/');
    await user2Page.locator('[data-seat-id="3"][data-state="available"]').click();
    await user2Page.locator('.popup #name').fill('User Two');
    await user2Page.locator('.popup #contact').fill('987654321');
    await user2Page.locator('.popup button[type="submit"]').click();
    await expect(user2Page.locator('.popup')).not.toBeVisible();
    await user2Page.close();

    // User 1 now tries to submit their booking
    await popup.locator('#name').fill('User One');
    await popup.locator('#contact').fill('123456789');
    await popup.getByRole('button', { name: 'Book Now' }).click();

    const errorMessage = popup.locator('.text-red-600');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Seat is already booked.');
    await expect(popup).toBeVisible();
  });

  test('should show a validation error if name is missing', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-seat-id="1"][data-state="available"]').click();
    const popup = page.locator('.popup');
    await expect(popup).toBeVisible();

    await popup.locator('#contact').fill('123456789');
    await popup.getByRole('button', { name: 'Book Now' }).click();

    // Wait for the error message element to appear in the DOM
    const errorMessage = popup.locator('.text-red-600');
    await errorMessage.waitFor({ state: 'visible' });

    await expect(errorMessage).toContainText('Name and contact are required.');
    await expect(popup).toBeVisible();
    
    // Verify the seat remains available
    await expect(page.locator('[data-seat-id="1"][data-state="available"]')).toBeVisible();
  });
});