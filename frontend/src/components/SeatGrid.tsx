import React, { useState, useEffect } from 'react';
import { fetchSeats } from '../api';
import { Seat as SeatType } from '../types';
import SeatComponent from './Seat';
import './SeatGrid.css';

interface SeatGridProps {
  onSeatSelect: (seat: SeatType) => void;
  refreshKey: number;
}

const SeatGrid: React.FC<SeatGridProps> = ({ onSeatSelect, refreshKey }) => {
  const [seats, setSeats] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSeats = async () => {
      try {
        setLoading(true);
        const data = await fetchSeats();
        setSeats(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch seats. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    getSeats();
  }, [refreshKey]);

  if (loading) return <div>Loading seats...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="seat-grid">
      {seats.sort((a, b) => a.seatNumber - b.seatNumber).map(seat => (
        <SeatComponent key={seat.id} seat={seat} onClick={onSeatSelect} />
      ))}
    </div>
  );
};

export default SeatGrid;
