// Moved from root components/ to src/components/seats/
"use client";
import React, { useMemo } from 'react';
import { clsx } from 'clsx';
import { SeatSectionComponent } from './SeatSectionComponent';
import { useSeatSelection } from '@/hooks/useSeatSelection';
import type { VenueLayout, Seat, SeatSelection } from '@/types/seat';

interface SeatMapProps {
  venue: VenueLayout;
  maxSelection?: number;
  onSelectionChange?: (selection: SeatSelection) => void;
  showPrices?: boolean;
  seatSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SeatMap({
  venue,
  maxSelection = 4,
  onSelectionChange,
  showPrices = false,
  seatSize = 'md',
  className,
}: SeatMapProps) {
  const {
    selectedSeatIds,
    toggleSeat,
    clearSelection,
    isSelected,
  } = useSeatSelection();

  const allSeats = venue.sections.flatMap(section => section.seats);

  const handleSeatClick = (seat: Seat) => {
    if (isSelected(seat.id) || selectedSeatIds.size < maxSelection) {
      toggleSeat(seat.id);
    }
  };

  const currentSelection = useMemo(() => {
    const selectedSeats = allSeats.filter(seat => selectedSeatIds.has(seat.id));
    return {
      seats: selectedSeats,
      totalPrice: selectedSeats.reduce((sum, seat) => sum + seat.price, 0),
    };
  }, [allSeats, selectedSeatIds]);

  React.useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(currentSelection);
    }
  }, [currentSelection, onSelectionChange]);

  const selectedCount = selectedSeatIds.size;
  const canSelectMore = selectedCount < maxSelection;

  return (
    <div className={clsx('w-full', className)}>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{venue.name}</h2>
        <div className="flex flex-wrap justify-center items-center gap-4 text-sm text-gray-600">
          <span>Total seats: {venue.totalSeats}</span>
          <span>Available: {allSeats.filter(s => s.status === 'available').length}</span>
          <span>Selected: {selectedCount}/{maxSelection}</span>
        </div>
      </div>
      <div className="flex justify-center mb-6">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-300 border-2 border-gray-400 rounded"></div>
            <span>Reserved</span>
          </div>
        </div>
      </div>
      <div className="mb-8">
        <div className="mx-auto max-w-md h-4 bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 rounded-full flex items-center justify-center">
          <span className="text-xs font-medium text-white">STAGE</span>
        </div>
      </div>
      <div className="space-y-8">
        {venue.sections.map(section => (
          <SeatSectionComponent
            key={section.id}
            section={section}
            selectedSeatIds={selectedSeatIds}
            onSeatClick={handleSeatClick}
            showPrices={showPrices}
            seatSize={seatSize}
          />
        ))}
      </div>
      {selectedCount > 0 && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-gray-800">Selected Seats</h3>
            <button
              onClick={clearSelection}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {currentSelection.seats.map((seat: Seat) => (
              <div key={seat.id} className="flex justify-between items-center text-sm">
                <span>{seat.section ? `${seat.section} - ` : ''}{seat.row}{seat.number}</span>
                <span className="font-medium">${seat.price}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex justify-between items-center font-semibold">
              <span>Total ({selectedCount} seats)</span>
              <span className="text-lg">${currentSelection.totalPrice}</span>
            </div>
          </div>
          {!canSelectMore && (
            <div className="mt-2 text-xs text-amber-600">
              Maximum {maxSelection} seats selected
            </div>
          )}
        </div>
      )}
    </div>
  );
}
