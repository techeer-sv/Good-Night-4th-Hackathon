import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import SelectPage from './+page.svelte';
import * as api from '$lib/services/api';
import * as navigation from '$app/navigation';

// Mock the entire api service module
vi.mock('$lib/services/api');

// Mock the navigation module
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
}));

const mockSeats = [
  { id: 1, status: true },
  { id: 2, status: false }, // booked
  { id: 3, status: true },
];

describe('Seat Selection Page', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    
    // Provide default mock implementations
    vi.mocked(api.getSeats).mockImplementation(async () => {
        const { initializeSeats } = await import('$lib/stores/booking');
        initializeSeats(mockSeats);
        return Promise.resolve();
    });
    vi.mocked(api.reserveSeat).mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
    
    // Mock window.alert
    window.alert = vi.fn();
  });

  it('should allow a user to select a seat and complete a booking', async () => {
    // Arrange
    const user = userEvent.setup();
    render(SelectPage);

    // Act
    const seatButton = await screen.findByText('1');
    await user.click(seatButton);
    const bookButton = await screen.findByText('Book Selected Seat');
    await user.click(bookButton);
    const nameInput = await screen.findByLabelText('Name');
    await user.type(nameInput, 'Test User');
    const contactInput = await screen.findByLabelText(/Contact/);
    await user.type(contactInput, '123-456-7890');
    const confirmButton = await screen.findByText('Confirm Booking');
    await user.click(confirmButton);

    // Assert
    expect(api.reserveSeat).toHaveBeenCalledWith({
      seatId: 1,
      userName: 'Test User',
      phone: '123-456-7890',
      userId: 'user-123',
    });
    expect(navigation.goto).toHaveBeenCalledWith('/confirm');
  });

  it('should handle booking failure and navigate to the failed page', async () => {
    // Arrange
    const user = userEvent.setup();
    const failureResponse = { success: false, reason: 'contention', message: 'Seat already taken' };
    vi.mocked(api.reserveSeat).mockResolvedValue(new Response(JSON.stringify(failureResponse), { status: 409 }));
    render(SelectPage);

    // Act
    const seatButton = await screen.findByText('3');
    await user.click(seatButton);
    const bookButton = await screen.findByText('Book Selected Seat');
    await user.click(bookButton);
    const nameInput = await screen.findByLabelText('Name');
    await user.type(nameInput, 'Another User');
    const contactInput = await screen.findByLabelText(/Contact/);
    await user.type(contactInput, '987-654-3210');
    const confirmButton = await screen.findByText('Confirm Booking');
    await user.click(confirmButton);

    // Assert
    expect(api.reserveSeat).toHaveBeenCalledWith({
      seatId: 3,
      userName: 'Another User',
      phone: '987-654-3210',
      userId: 'user-123',
    });
    expect(window.alert).toHaveBeenCalledWith('Booking failed: contention');
    expect(navigation.goto).toHaveBeenCalledWith('/failed');
  });
});
