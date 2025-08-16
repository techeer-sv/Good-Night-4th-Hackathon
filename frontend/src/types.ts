export interface Seat {
  id: number;
  seatNumber: number;
  isReserved: boolean;
  reservedBy: string | null;
  reservationTime: string | null;
  selectedBy: string | null;
  selectedAt: string | null;
}
