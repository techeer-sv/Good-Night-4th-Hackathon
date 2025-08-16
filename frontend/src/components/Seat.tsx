import React from 'react';
import './Seat.css';
import type { Seat as SeatType } from '../types';

interface SeatProps {
  seat: SeatType;
  userSession: string;
  onClick: (seat: SeatType) => void;
}

const SeatComponent: React.FC<SeatProps> = ({ seat, userSession, onClick }) => {
  const isReserved = seat.isReserved;
  const isSelected = seat.selectedBy && seat.selectedAt;
  const isSelectedByCurrentUser = isSelected && seat.selectedBy === userSession;
  const isSelectedByOther = isSelected && seat.selectedBy !== userSession;
  
  let seatClass = 'seat';
  let isClickable = true;
  
  if (isReserved) {
    seatClass += ' reserved';
    isClickable = false;
  } else if (isSelectedByOther) {
    seatClass += ' selected-by-other';
    isClickable = false;
  } else if (isSelectedByCurrentUser) {
    seatClass += ' selected';
    isClickable = true;
  } else {
    seatClass += ' available';
    isClickable = true;
  }

  const getTooltip = () => {
    if (isSelectedByOther) {
      return `Selected by another user`;
    } else if (isSelectedByCurrentUser) {
      return `Selected by you`;
    }
    return '';
  };

  const getAriaLabel = () => {
    let status = '';
    if (isReserved) {
      status = 'reserved';
    } else if (isSelectedByOther) {
      status = 'selected by another user';
    } else if (isSelectedByCurrentUser) {
      status = 'selected by you';
    } else {
      status = 'available';
    }
    return `Seat ${seat.seatNumber}, ${status}`;
  };

  return (
    <button
      className={seatClass}
      onClick={() => isClickable && onClick(seat)}
      title={getTooltip()}
      aria-label={getAriaLabel()}
      disabled={!isClickable}
      tabIndex={0}
    >
      {seat.seatNumber}
    </button>
  );
};

export default SeatComponent;
