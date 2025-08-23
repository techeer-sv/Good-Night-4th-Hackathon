import { test, expect } from '@playwright/test';

test.describe('Seat Reservation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Emulate reduced motion to disable animations and transitions.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    // Wait for the main content to be visible
    await expect(page.locator('h1')).toContainText('TicketTock');
  });

  test('should allow a user to select a seat and open the booking modal', async ({ page }) => {
    // 1. Find an available seat and click it
    const availableSeat = page.locator('button.bg-green-500').first();
    await expect(availableSeat).toBeEnabled();
    await availableSeat.click();

    // 2. Verify the seat becomes selected
    await expect(availableSeat).toHaveClass(/bg-blue-500/);

    // 3. Click the "Book Now" button
    const bookNowButton = page.getByRole('button', { name: 'Book Now' });
    await expect(bookNowButton).toBeVisible();
    await bookNowButton.click();

    // 4. Verify the booking modal appears and is open
    const modal = page.locator('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveJSProperty('open', true);
    await expect(modal.locator('h2')).toContainText('Book Seat:');
  });

  test('should show an error if no seat is selected when booking', async ({ page }) => {
    // 1. Click the "Book Now" button without selecting a seat
    const bookNowButton = page.getByRole('button', { name: 'Book Now' });
    await bookNowButton.click();

    // 2. Verify an error message/toast appears
    const toast = page.locator('body').getByText('Please select a seat first');
    await expect(toast).toBeVisible();
  });

  test('should close the modal when the close button is clicked', async ({ page }) => {
    // 1. Select a seat and open the modal
    await page.locator('button.bg-green-500').first().click();
    await page.getByRole('button', { name: 'Book Now' }).click();

    // 2. Verify the modal is visible and open
    const modal = page.locator('dialog');
    await expect(modal).toBeVisible();
    await expect(modal).toHaveJSProperty('open', true);

    // 3. Click the close button
    const closeButton = modal.locator('[aria-label="Close modal"]');
    await closeButton.click();

    // 4. Verify the modal is no longer open
    await expect(modal).toHaveJSProperty('open', false);
  });

  test('should successfully book a seat and show a confirmation', async ({ page }) => {
    // Mock the API response for a successful booking
    await page.route('**/api/v1/reserve', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Booking successful!' }),
      });
    });

    // 1. Select a seat and open the modal
    const availableSeat = page.locator('button.bg-green-500').first();
    const seatId = await availableSeat.textContent();
    await availableSeat.click();
    await page.getByRole('button', { name: 'Book Now' }).click();

    // 2. Fill out the booking form
    const modal = page.locator('dialog');
    await expect(modal).toBeVisible();
    await modal.locator('#name').fill('Test User');
    await modal.locator('#contact').fill('test@example.com');

    // 3. Submit the form
    await modal.getByRole('button', { name: 'Confirm Booking' }).click();

    // 4. Verify the modal closes
    await expect(modal).toHaveJSProperty('open', false);

    // 5. Verify a success message is shown
    const successToast = page.locator('body').getByText('Booking successful!');
    await expect(successToast).toBeVisible();

    // 6. Verify the seat is now marked as booked
    const bookedSeat = page.getByRole('button', { name: seatId! });
    await expect(bookedSeat).toHaveClass(/bg-gray-500/);
  });
});
