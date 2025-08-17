// Deprecated duplicate (moved to src/components/seats/SeatComponent.tsx)
"use client";
import React from 'react';
import { clsx } from 'clsx';
import type { Seat } from '../src/types/seat';

interface SeatComponentProps {
  seat: Seat;
  isSelected: boolean;
  onClick: (seat: Seat) => void;
  showPrice?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SeatComponent({
  seat,
  isSelected,
  onClick,
  showPrice = false,
  size = 'md',
  className,
}: SeatComponentProps) {
  const isDisabled = seat.status === 'reserved';
  const isAvailable = seat.status === 'available';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const handleClick = () => {
    if (!isDisabled) {
      onClick(seat);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
      e.preventDefault();
      onClick(seat);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isDisabled}
      aria-pressed={isSelected}
      aria-label={`Seat ${seat.row}${seat.number}, ${seat.status}${showPrice ? `, $${seat.price}` : ''}`}
      className={clsx(
        'relative flex flex-col items-center justify-center',
        'border-2 rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
        sizeClasses[size],
        {
          // Available seat
          'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50': 
            isAvailable && !isSelected,
          
          // Selected seat
          'border-blue-600 bg-blue-600 text-white shadow-md scale-105': 
            isSelected,
          
          // Reserved seat
          'border-gray-400 bg-gray-300 text-gray-600 cursor-not-allowed': 
            isDisabled,
          
          // Hover effects
          'hover:scale-105': isAvailable && !isDisabled,
        },
        className
      )}
    >
      <span className="font-medium leading-none">
        {seat.row}{seat.number}
      </span>
      {showPrice && (
        <span className={clsx(
          'text-xs mt-0.5 leading-none',
          isSelected ? 'text-blue-100' : 'text-gray-600'
        )}>
          ${seat.price}
        </span>
      )}
      
      {/* Visual indicator */}
      <div className={clsx(
        'absolute -top-1 -right-1 w-3 h-3 rounded-full border border-white',
        {
          'bg-green-500': isAvailable && !isSelected,
          'bg-blue-600': isSelected,
          'bg-red-500': isDisabled,
        }
      )} />
    </button>
  );
}
