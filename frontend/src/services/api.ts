import { initializeSeats } from '$lib/stores/booking';

const BASE_URL = 'http://localhost:5800'; // From api-spec.md

export async function getSeats() {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/seats`);
    if (!response.ok) {
      throw new Error('Failed to fetch seats');
    }
    const data = await response.json();
    if (data.success) {
      initializeSeats(data.seats);
    } else {
      throw new Error(data.message || 'Failed to process seat data');
    }
  } catch (error) {
    console.error('Error fetching seats:', error);
    // Handle error appropriately in the UI
  }
}

export async function reserveSeat(payload: { seatId: number; userName: string; phone: string; userId: string }) {
    const { seatId, userName, phone, userId } = payload;
    const response = await fetch(`${BASE_URL}/api/v1/seats/reservation/fcfs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId,
        },
        body: JSON.stringify({ user_name: userName, phone }),
    });
    return response;
}
