export type SeatStatus = 'available' | 'reserved' | 'selected';

export interface Seat {
  id: string;
  row: string;
  number: string; // Changed to string for flexibility (e.g., "1A", "Box1")
  status: SeatStatus;
  price: number;
  accessibility?: boolean;
  section?: string;
  x?: number; // Optional position for custom layouts
  y?: number;
}

export interface SeatSection {
  id: string;
  name: string;
  seats: Seat[];
  color?: string;
  basePrice?: number;
  layout?: {
    rows: number;
    seatsPerRow: number;
  };
}

export interface VenueLayout {
  id: string;
  name: string;
  sections: SeatSection[];
  totalSeats: number;
}

export interface SeatSelection {
  seats: Seat[];
  totalPrice: number;
  maxSeats?: number;
}

export interface SeatMapProps {
  venue: VenueLayout;
  selectedSeats: string[];
  onSeatSelect: (seatId: string) => void;
  onSeatDeselect: (seatId: string) => void;
  maxSelection?: number;
  className?: string;
}
