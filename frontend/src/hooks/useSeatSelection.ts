"use client";
import { useState, useCallback, useMemo } from 'react';
import type { SeatSelection } from '../types/seat';

export const useSeatSelection = (initialSelectedSeats: string[] = []) => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(
    new Set(initialSelectedSeats)
  );

  const toggleSeat = useCallback((seatId: string) => {
    setSelectedSeatIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(seatId)) {
        newSet.delete(seatId);
      } else {
        newSet.add(seatId);
      }
      return newSet;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSeatIds(new Set());
  }, []);

  const isSelected = useCallback((seatId: string) => {
    return selectedSeatIds.has(seatId);
  }, [selectedSeatIds]);

  const selectedSeats = useMemo(() => Array.from(selectedSeatIds), [selectedSeatIds]);

  const selection: SeatSelection = useMemo(() => ({
    seats: [],
    totalPrice: 0,
  }), []);

  return {
    selectedSeatIds,
    selectedSeats,
    selection,
    toggleSeat,
    clearSelection,
    isSelected,
  };
};
