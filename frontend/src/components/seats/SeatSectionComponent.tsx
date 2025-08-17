// Moved from root components/ to src/components/seats/
"use client";
import React from 'react';
import { SeatComponent } from './SeatComponent';
import type { SeatSection, Seat } from '@/types/seat';

interface SeatSectionComponentProps {
  section: SeatSection;
  selectedSeatIds: Set<string>;
  onSeatClick: (seat: Seat) => void;
  showPrices?: boolean;
  seatSize?: 'sm' | 'md' | 'lg';
}

export function SeatSectionComponent({
  section,
  selectedSeatIds,
  onSeatClick,
  showPrices = false,
  seatSize = 'md',
}: SeatSectionComponentProps) {
  const seatsByRow = section.seats.reduce((acc, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row]!.push(seat);
    return acc;
  }, {} as Record<string, Seat[]>);

  const sortedRows = Object.keys(seatsByRow).sort();
  sortedRows.forEach(row => {
    const rowSeats = seatsByRow[row];
    if (rowSeats) {
      rowSeats.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    }
  });

  return (
    <div className="mb-8">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{section.name}</h3>
        <div 
          className="w-12 h-1 mx-auto mt-2 rounded"
          style={{ backgroundColor: section.color || '#6b7280' }}
        />
      </div>
      <div className="space-y-2">
        {sortedRows.map(rowLetter => {
          const rowSeats = seatsByRow[rowLetter];
          if (!rowSeats) return null;
          return (
            <div key={`${section.id}-${rowLetter}`} className="flex items-center justify-center gap-1">
              <div className="w-8 text-center text-sm font-medium text-gray-600 mr-2">
                {rowLetter}
              </div>
              <div className="flex gap-1">
                {rowSeats.map(seat => (
                  <SeatComponent
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeatIds.has(seat.id)}
                    onClick={() => onSeatClick(seat)}
                    showPrice={showPrices}
                    size={seatSize}
                  />
                ))}
              </div>
              {rowSeats.length > 20 && (
                <div className="w-8 text-center text-sm font-medium text-gray-600 ml-2">
                  {rowLetter}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
