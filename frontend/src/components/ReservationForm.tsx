import React, { useState, useEffect } from 'react';
import { reserveSeat } from '../api';
import type { Seat } from '../types';
import { SELECTION_TIMEOUT_SECONDS, SELECTION_TIMEOUT_MS, TIMER_UPDATE_INTERVAL_MS } from '../constants';
import { extractErrorMessage, isRetryableError } from '../utils/errorHandler';
import './ReservationForm.css';

interface ReservationFormProps {
  seat: Seat;
  userSession: string;
  onReservationSuccess: () => void;
  onCancel: () => void;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ seat, userSession, onReservationSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SELECTION_TIMEOUT_SECONDS);

  const attemptReservation = async () => {
    setIsSubmitting(true);
    setError(null);
    setShowRetry(false);

    try {
      await reserveSeat(seat.id, name, userSession);
      onReservationSuccess();
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);
      const retryable = isRetryableError(err);
      
      setError(`Reservation failed: ${errorMessage}`);
      setShowRetry(retryable);
      
      // Auto-refresh seat status on concurrent reservation failure
      if (retryable) {
        onReservationSuccess(); // This will trigger seat data refresh
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!seat.selectedAt) {
      setTimeRemaining(SELECTION_TIMEOUT_SECONDS);
      return;
    }
    
    // Handle UTC time from backend (add 'Z' if not present)
    const timeString = seat.selectedAt.endsWith('Z') ? seat.selectedAt : seat.selectedAt + 'Z';
    const selectedTime = new Date(timeString).getTime();
    let expirationTime = selectedTime + SELECTION_TIMEOUT_MS;
    
    // Set initial time remaining immediately
    const now = Date.now();
    let initialRemaining = Math.max(0, Math.floor((expirationTime - now) / 1000));
    
    // If time seems wrong (too little or expired), it might be a timezone issue or old data
    // For newly selected seats, give full timeout period
    if (initialRemaining <= 30) {
      initialRemaining = SELECTION_TIMEOUT_SECONDS;
      expirationTime = now + SELECTION_TIMEOUT_MS; // Full timeout from now
    }
    
    setTimeRemaining(initialRemaining);
    
    const timer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000));
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        clearInterval(timer);
        onCancel(); // Auto-cancel when time expires
      }
    }, TIMER_UPDATE_INTERVAL_MS);
    
    return () => clearInterval(timer);
  }, [seat.selectedAt, onCancel]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }

    await attemptReservation();
  };

  const handleRetry = async () => {
    await attemptReservation();
  };

  return (
    <div className="reservation-form-container">
      <h2>Reserve Seat {seat.seatNumber}</h2>
      <div className="timer-container" style={{ 
        textAlign: 'center', 
        margin: '10px 0', 
        padding: '10px', 
        backgroundColor: timeRemaining < 60 ? '#ffebee' : '#e8f5e8',
        border: `1px solid ${timeRemaining < 60 ? '#f44336' : '#4caf50'}`,
        borderRadius: '4px',
        color: timeRemaining < 60 ? '#c62828' : '#2e7d32'
      }}>
        <strong>Time remaining: {formatTime(timeRemaining)}</strong>
      </div>
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
        {error && (
          <div className="form-error">
            {error}
            {showRetry && (
              <button 
                type="button" 
                onClick={handleRetry} 
                disabled={isSubmitting}
                style={{ marginLeft: '10px', padding: '5px 10px', fontSize: '12px' }}
              >
                Try Again
              </button>
            )}
          </div>
        )}
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
