import React from 'react';
import './Seat.css';
import { Seat as SeatType } from '../types';

interface SeatProps {
  seat: SeatType;
  onClick: (seat: SeatType) => void;
}

const SeatComponent: React.FC<SeatProps> = ({ seat, onClick }) => {
  const isReserved = seat.isReserved;
  const seatClass = isReserved ? 'seat reserved' : 'seat available';

  return (
    <div
      className={seatClass}
      onClick={() => !isReserved && onClick(seat)}
    >
      {seat.seatNumber}
    </div>
  );
};

export default SeatComponent;
