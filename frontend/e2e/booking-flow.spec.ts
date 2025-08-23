import { test, expect } from '@playwright/test';

test.describe('Booking Flow E2E Tests', () => {

  // This block runs before each test in this file
  test.beforeEach(async ({ page }) => {
    // Reset the database state by calling our test-only API endpoint
    await page.request.post('/api/test/reset');
  });

  // Scenario 1: Happy Path - Successful Seat Selection and Booking
  test('should allow a user to select an available seat, book it, and see it become booked', async ({ page }) => {
    // 1. Navigate to the main page
    await page.goto('/');
    
    // Wait for the main content to be ready before interacting
    await page.waitForSelector('h2:has-text("Select Your Seats")');

    // 2. Verify that both available and booked seats are rendered correctly from the initial state
    const availableSeat = page.locator('label:has-text("1")');
    const bookedSeat = page.locator('div.cursor-not-allowed:has-text("2")');
    await expect(availableSeat).toBeVisible();
    await expect(bookedSeat).toBeVisible();
    
    // 3. Click an available seat
    await availableSeat.click();

    // 4. Verify the booking popup appears
    const popup = page.locator('.popup');
    await expect(popup).toBeVisible();
    await expect(popup.locator('h3')).toContainText('Booking Details for 1');

    // 5. Fill in valid user information
    await popup.locator('#name').fill('Test User');
    await popup.locator('#contact').fill('010-1234-5678');

    // 6. Submit the form
    await popup.getByRole('button', { name: 'Book Now' }).click();

    // 7. Verify the popup closes after a successful submission
    await expect(popup).not.toBeVisible();

    // 8. Verify the seat is now in a booked state on the UI
    const newlyBookedSeat = page.locator('div.cursor-not-allowed:has-text("1")');
    await expect(newlyBookedSeat).toBeVisible();
    
    // Also, ensure the 'label' for seat 1 is gone
    await expect(page.locator('label:has-text("1")')).not.toBeVisible();
  });

  // Scenario 3: Clicking a booked seat should do nothing
  test('should not open popup when a booked seat is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h2:has-text("Select Your Seats")');

    // Find a seat that is initially booked (e.g., seat 2)
    const bookedSeat = page.locator('div.cursor-not-allowed:has-text("2")');
    await expect(bookedSeat).toBeVisible();

    // Click it and verify the popup does NOT appear
    await bookedSeat.click({ force: true }); // Use force click as it might be disabled
    const popup = page.locator('.popup');
    await expect(popup).not.toBeVisible();
  });

  // Scenario 2: Race Condition - trying to book a seat that gets taken
  test('should show an error message if the seat is booked by someone else', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForSelector('h2:has-text("Select Your Seats")');

    // 1. User 1 (on `page`) selects an available seat (e.g., seat 3)
    const availableSeat = page.locator('label:has-text("3")');
    await availableSeat.click();
    const popup = page.locator('.popup');
    await expect(popup).toBeVisible();

    // 2. SUDDENLY, User 2 (in a new page) books the same seat
    const user2Page = await context.newPage();
    await user2Page.goto('/');
    await user2Page.locator('label:has-text("3")').click();
    await user2Page.locator('.popup #name').fill('User Two');
    await user2Page.locator('.popup #contact').fill('987654321');
    await user2Page.locator('.popup button[type="submit"]').click();
    // Wait for User 2's booking to complete and popup to close
    await expect(user2Page.locator('.popup')).not.toBeVisible();
    await user2Page.close();

    // 3. User 1 now tries to submit their booking for the same seat
    await popup.locator('#name').fill('User One');
    await popup.locator('#contact').fill('123456789');
    await popup.getByRole('button', { name: 'Book Now' }).click();

    // 4. Verify the error message is shown in User 1's popup
    const errorMessage = popup.locator('.text-red-600');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Seat is already booked.');

    // 5. Verify the popup remains open
    await expect(popup).toBeVisible();
  });

  // Scenario 2: Input Validation - trying to book without a name
  test('should show a validation error if name is missing', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h2:has-text("Select Your Seats")');

    // 1. Select an available seat
    await page.locator('label:has-text("1")').click();
    const popup = page.locator('.popup');
    await expect(popup).toBeVisible();

    // 2. Fill in contact but leave name blank
    await popup.locator('#contact').fill('123456789');

    // 3. Submit the form and wait for the server's error response
    await popup.getByRole('button', { name: 'Book Now' }).click();
    await page.waitForResponse(response => response.url().endsWith('/') && response.status() === 400);

    // 4. Now that we've received the error, verify the message is visible
    const errorMessage = popup.locator('.text-red-600');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Name and contact are required.');

    // 5. Verify the popup remains open
    await expect(popup).toBeVisible();

    // 6. Verify the seat is NOT booked
    const availableSeat = page.locator('label:has-text("1")');
    await expect(availableSeat).toBeVisible();
  });
});
