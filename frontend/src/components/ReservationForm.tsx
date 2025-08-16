import React, { useState } from 'react';
import { reserveSeat } from '../api';
import { Seat } from '../types';
import './ReservationForm.css';

interface ReservationFormProps {
  seat: Seat;
  onReservationSuccess: () => void;
  onCancel: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ seat, onReservationSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reserveSeat(seat.id, name);
      alert('Reservation successful!');
      onReservationSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'An unknown error occurred.';
      setError(`Reservation failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reservation-form-container">
      <h2>Reserve Seat {seat.seatNumber}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>
        {error && <div className="form-error">{error}</div>}
        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Reserving...' : 'Confirm Reservation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
