export interface Event {
  id: string;
  title: string;
  description?: string;
  startTime?: string; // ISO
  endTime?: string;   // ISO
  remainingSeats: number;
}
