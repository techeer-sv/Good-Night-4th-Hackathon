// This file acts as a simple in-memory database for demonstration purposes.
// In a real application, you would use a proper database like PostgreSQL, MySQL, or SQLite.

export interface SeatData {
  id: number;
  status: boolean; // false = available, true = booked
}

const initialSeats: SeatData[] = [
  { id: 1, status: false },
  { id: 2, status: true },
  { id: 3, status: false },
  { id: 4, status: false },
  { id: 5, status: true },
  { id: 6, status: false },
  { id: 7, status: false },
  { id: 8, status: true },
  { id: 9, status: false },
];

// Use a deep copy to ensure the initial state is never mutated directly.
let database: SeatData[] = JSON.parse(JSON.stringify(initialSeats));

export function getSeats(): SeatData[] {
  return database;
}

export function bookSeat(id: number): { success: boolean; error?: string } {
  const seat = database.find(s => s.id === id);
  if (!seat) {
    return { success: false, error: 'Seat not found.' };
  }
  if (seat.status) {
    return { success: false, error: 'Seat is already booked.' };
  }
  seat.status = true;
  return { success: true };
}

export function resetDatabase(): void {
  // Reset the database to its initial state
  database = JSON.parse(JSON.stringify(initialSeats));
}
