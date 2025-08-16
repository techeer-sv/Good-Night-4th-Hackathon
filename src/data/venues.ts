import type { VenueLayout, Seat } from '../types/seat';

// Generate a row of seats with customizable properties
function generateSeatRow(
  sectionId: string,
  rowLetter: string,
  seatCount: number,
  basePrice: number,
  startNumber: number = 1,
  reservedNumbers: number[] = []
): Seat[] {
  const seats: Seat[] = [];
  
  for (let i = 0; i < seatCount; i++) {
    const seatNumber = startNumber + i;
    const isReserved = reservedNumbers.includes(seatNumber);
    
    seats.push({
      id: `${sectionId}-${rowLetter}${seatNumber}`,
      row: rowLetter,
      number: seatNumber.toString(),
      status: isReserved ? 'reserved' : 'available',
      price: basePrice,
      accessibility: false,
      section: sectionId,
    });
  }
  
  return seats;
}

// Generate accessible seats for a section
function generateAccessibleSeats(
  sectionId: string,
  rowLetter: string,
  count: number,
  basePrice: number
): Seat[] {
  const seats: Seat[] = [];
  
  for (let i = 1; i <= count; i++) {
    seats.push({
      id: `${sectionId}-${rowLetter}A${i}`,
      row: `${rowLetter}A`,
      number: i.toString(),
      status: 'available',
      price: basePrice,
      accessibility: true,
      section: sectionId,
    });
  }
  
  return seats;
}

// Sample venue layout for a concert hall
export const sampleConcertHall: VenueLayout = {
  id: 'concert-hall-1',
  name: 'Seoul Concert Hall',
  totalSeats: 1250,
  sections: [
    // Orchestra section (premium)
    {
      id: 'ORCH',
      name: 'Orchestra',
      seats: [
        ...generateSeatRow('ORCH', 'A', 20, 150, 1, [5, 6, 15, 16]),
        ...generateSeatRow('ORCH', 'B', 22, 150, 1, [8, 9, 10]),
        ...generateSeatRow('ORCH', 'C', 24, 140, 1, [12, 13]),
        ...generateSeatRow('ORCH', 'D', 24, 140, 1, []),
        ...generateSeatRow('ORCH', 'E', 26, 130, 1, [3, 4, 23, 24]),
        ...generateSeatRow('ORCH', 'F', 26, 130, 1, []),
        ...generateSeatRow('ORCH', 'G', 28, 120, 1, [14, 15, 16]),
        ...generateSeatRow('ORCH', 'H', 28, 120, 1, []),
        ...generateAccessibleSeats('ORCH', 'H', 4, 120),
      ].flat(),
      color: '#dc2626', // red-600
    },
    
    // Mezzanine Left
    {
      id: 'MEZZ-L',
      name: 'Mezzanine Left',
      seats: [
        ...generateSeatRow('MEZZ-L', 'AA', 14, 110, 1, [2, 3]),
        ...generateSeatRow('MEZZ-L', 'BB', 16, 100, 1, []),
        ...generateSeatRow('MEZZ-L', 'CC', 16, 100, 1, [8, 9]),
        ...generateSeatRow('MEZZ-L', 'DD', 18, 90, 1, []),
        ...generateSeatRow('MEZZ-L', 'EE', 18, 90, 1, [10, 11, 12]),
      ].flat(),
      color: '#ea580c', // orange-600
    },
    
    // Mezzanine Center
    {
      id: 'MEZZ-C',
      name: 'Mezzanine Center',
      seats: [
        ...generateSeatRow('MEZZ-C', 'AA', 24, 120, 1, []),
        ...generateSeatRow('MEZZ-C', 'BB', 26, 110, 1, [13, 14]),
        ...generateSeatRow('MEZZ-C', 'CC', 26, 110, 1, []),
        ...generateSeatRow('MEZZ-C', 'DD', 28, 100, 1, [5, 6, 23, 24]),
        ...generateSeatRow('MEZZ-C', 'EE', 28, 100, 1, []),
      ].flat(),
      color: '#ca8a04', // yellow-600
    },
    
    // Mezzanine Right
    {
      id: 'MEZZ-R',
      name: 'Mezzanine Right',
      seats: [
        ...generateSeatRow('MEZZ-R', 'AA', 14, 110, 1, []),
        ...generateSeatRow('MEZZ-R', 'BB', 16, 100, 1, [7, 8, 9]),
        ...generateSeatRow('MEZZ-R', 'CC', 16, 100, 1, []),
        ...generateSeatRow('MEZZ-R', 'DD', 18, 90, 1, [2, 3]),
        ...generateSeatRow('MEZZ-R', 'EE', 18, 90, 1, []),
      ].flat(),
      color: '#16a34a', // green-600
    },
    
    // Balcony
    {
      id: 'BALC',
      name: 'Balcony',
      seats: [
        ...generateSeatRow('BALC', 'A', 30, 80, 1, [8, 9, 10, 22, 23]),
        ...generateSeatRow('BALC', 'B', 32, 75, 1, []),
        ...generateSeatRow('BALC', 'C', 32, 75, 1, [15, 16, 17, 18]),
        ...generateSeatRow('BALC', 'D', 34, 70, 1, []),
        ...generateSeatRow('BALC', 'E', 34, 70, 1, [12, 13, 25, 26]),
        ...generateSeatRow('BALC', 'F', 36, 65, 1, []),
        ...generateAccessibleSeats('BALC', 'F', 2, 65),
      ].flat(),
      color: '#2563eb', // blue-600
    },
  ],
};

// Sample venue layout for a smaller theater
export const sampleTheater: VenueLayout = {
  id: 'theater-1',
  name: 'Intimate Theater',
  totalSeats: 450,
  sections: [
    // Main floor
    {
      id: 'MAIN',
      name: 'Main Floor',
      seats: [
        ...generateSeatRow('MAIN', 'A', 16, 85, 1, []),
        ...generateSeatRow('MAIN', 'B', 18, 85, 1, [9, 10]),
        ...generateSeatRow('MAIN', 'C', 18, 80, 1, []),
        ...generateSeatRow('MAIN', 'D', 20, 80, 1, [7, 8, 13, 14]),
        ...generateSeatRow('MAIN', 'E', 20, 75, 1, []),
        ...generateSeatRow('MAIN', 'F', 22, 75, 1, [11, 12]),
        ...generateSeatRow('MAIN', 'G', 22, 70, 1, []),
        ...generateSeatRow('MAIN', 'H', 24, 70, 1, []),
        ...generateAccessibleSeats('MAIN', 'H', 3, 70),
      ].flat(),
      color: '#7c3aed', // violet-600
    },
    
    // Upper tier
    {
      id: 'UPPER',
      name: 'Upper Tier',
      seats: [
        ...generateSeatRow('UPPER', 'A', 20, 60, 1, [5, 6]),
        ...generateSeatRow('UPPER', 'B', 22, 55, 1, []),
        ...generateSeatRow('UPPER', 'C', 22, 55, 1, [10, 11, 12]),
        ...generateSeatRow('UPPER', 'D', 24, 50, 1, []),
        ...generateSeatRow('UPPER', 'E', 24, 50, 1, [8, 9, 16, 17]),
      ].flat(),
      color: '#db2777', // pink-600
    },
  ],
};

// Arena layout for sports/large concerts
export const sampleArena: VenueLayout = {
  id: 'arena-1',
  name: 'Grand Arena',
  totalSeats: 2800,
  sections: [
    // Floor (general admission areas simulated as sections)
    {
      id: 'FLOOR-A',
      name: 'Floor Section A',
      seats: [
        ...generateSeatRow('FLOOR-A', 'GA', 50, 200, 1, [12, 13, 14, 35, 36, 37]),
      ].flat(),
      color: '#dc2626', // red-600
    },
    
    {
      id: 'FLOOR-B',
      name: 'Floor Section B',
      seats: [
        ...generateSeatRow('FLOOR-B', 'GA', 50, 200, 1, [8, 9, 25, 26, 42, 43]),
      ].flat(),
      color: '#dc2626', // red-600
    },
    
    // Lower bowl
    {
      id: 'LOWER-100',
      name: 'Section 100',
      seats: [
        ...generateSeatRow('LOWER-100', 'A', 20, 120, 1, []),
        ...generateSeatRow('LOWER-100', 'B', 22, 115, 1, [11, 12]),
        ...generateSeatRow('LOWER-100', 'C', 22, 115, 1, []),
        ...generateSeatRow('LOWER-100', 'D', 24, 110, 1, [5, 6, 19, 20]),
        ...generateSeatRow('LOWER-100', 'E', 24, 110, 1, []),
      ].flat(),
      color: '#ea580c', // orange-600
    },
    
    {
      id: 'LOWER-101',
      name: 'Section 101',
      seats: [
        ...generateSeatRow('LOWER-101', 'A', 20, 120, 1, [3, 4]),
        ...generateSeatRow('LOWER-101', 'B', 22, 115, 1, []),
        ...generateSeatRow('LOWER-101', 'C', 22, 115, 1, [15, 16, 17]),
        ...generateSeatRow('LOWER-101', 'D', 24, 110, 1, []),
        ...generateSeatRow('LOWER-101', 'E', 24, 110, 1, [12, 13]),
      ].flat(),
      color: '#ea580c', // orange-600
    },
    
    // Upper bowl
    {
      id: 'UPPER-200',
      name: 'Section 200',
      seats: [
        ...generateSeatRow('UPPER-200', 'A', 18, 80, 1, []),
        ...generateSeatRow('UPPER-200', 'B', 20, 75, 1, [7, 8, 13, 14]),
        ...generateSeatRow('UPPER-200', 'C', 20, 75, 1, []),
        ...generateSeatRow('UPPER-200', 'D', 22, 70, 1, []),
        ...generateSeatRow('UPPER-200', 'E', 22, 70, 1, [10, 11, 16, 17]),
      ].flat(),
      color: '#16a34a', // green-600
    },
    
    {
      id: 'UPPER-201',
      name: 'Section 201',
      seats: [
        ...generateSeatRow('UPPER-201', 'A', 18, 80, 1, [2, 3]),
        ...generateSeatRow('UPPER-201', 'B', 20, 75, 1, []),
        ...generateSeatRow('UPPER-201', 'C', 20, 75, 1, [9, 10, 11]),
        ...generateSeatRow('UPPER-201', 'D', 22, 70, 1, []),
        ...generateSeatRow('UPPER-201', 'E', 22, 70, 1, []),
      ].flat(),
      color: '#16a34a', // green-600
    },
  ],
};

// Utility function to get venue by type
export function getVenueByType(type: 'concert' | 'theater' | 'arena'): VenueLayout {
  switch (type) {
    case 'concert':
      return sampleConcertHall;
    case 'theater':
      return sampleTheater;
    case 'arena':
      return sampleArena;
    default:
      return sampleConcertHall;
  }
}

// Utility to calculate total available seats
export function getAvailableSeatsCount(venue: VenueLayout): number {
  return venue.sections.reduce((total, section) => {
    return total + section.seats.filter(seat => seat.status === 'available').length;
  }, 0);
}

// Utility to get price range for a venue
export function getPriceRange(venue: VenueLayout): { min: number; max: number } {
  const allSeats = venue.sections.flatMap(section => section.seats);
  const prices = allSeats.map(seat => seat.price);
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
