import React, { useState, useEffect, useRef, useMemo } from 'react';
import { fetchSeats, fetchSeatStatus, resetAllSeats } from '../api';
import type { Seat as SeatType } from '../types';
import SeatComponent from './Seat';
import { POLLING_INTERVAL_MS } from '../constants';
import './SeatGrid.css';

interface SeatGridProps {
  onSeatSelect: (seat: SeatType) => void;
  refreshKey: number;
  userSession: string;
}

const SeatGrid: React.FC<SeatGridProps> = ({ onSeatSelect, refreshKey, userSession }) => {
  const [seats, setSeats] = useState<SeatType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastHash, setLastHash] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const pollingInterval = useRef<number | null>(null);
  
  const sortedSeats = useMemo(() => {
    return seats.sort((a, b) => a.seatNumber - b.seatNumber);
  }, [seats]);

  const loadSeats = async () => {
    try {
      setLoading(true);
      const data = await fetchSeats();
      setSeats(data);
      setError(null);
      
      // Update hash after loading seats
      const status = await fetchSeatStatus();
      setLastHash(status.hash);
    } catch {
      setError('Failed to fetch seats. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkForUpdates = async () => {
    try {
      const status = await fetchSeatStatus();
      if (status.hash !== lastHash && lastHash !== '') {
        // Hash changed, reload seats
        const data = await fetchSeats();
        setSeats(data);
        setLastHash(status.hash);
      } else if (lastHash === '') {
        setLastHash(status.hash);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const startPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
    }
    
    setIsPolling(true);
    pollingInterval.current = setInterval(checkForUpdates, POLLING_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
    setIsPolling(false);
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all seats to available? This action cannot be undone.')) {
      return;
    }

    try {
      setIsResetting(true);
      setError(null);
      await resetAllSeats();
      
      // Refresh seat data after reset
      await loadSeats();
    } catch (err) {
      setError('Failed to reset seats. Please try again.');
      console.error('Reset failed:', err);
    } finally {
      setIsResetting(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSeats();
  }, [refreshKey]);

  // Start/stop polling based on page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    // Start polling when component mounts
    startPolling();
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [lastHash]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading seats...</div>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '4px solid rgba(255, 255, 255, 0.1)', 
        borderTop: '4px solid #2196f3',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto'
      }}></div>
    </div>
  );
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '5px' }}>
          Seat Status
        </div>
        <div style={{ fontSize: '12px', color: isPolling ? '#4CAF50' : '#888' }}>
          {isPolling ? '🔄 Live updates active' : '⏸️ Updates paused'}
        </div>
      </div>
      <div className="seat-grid">
        {sortedSeats.map(seat => (
          <SeatComponent key={seat.id} seat={seat} userSession={userSession} onClick={onSeatSelect} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={handleReset}
          disabled={isResetting || loading}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: isResetting ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isResetting || loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
            minHeight: '44px',
            minWidth: '120px'
          }}
          onMouseOver={(e) => {
            if (!isResetting && !loading) {
              e.currentTarget.style.backgroundColor = '#d32f2f';
            }
          }}
          onMouseOut={(e) => {
            if (!isResetting && !loading) {
              e.currentTarget.style.backgroundColor = '#f44336';
            }
          }}
        >
          {isResetting ? 'Resetting...' : 'Reset All Seats'}
        </button>
      </div>
    </div>
  );
};

export default SeatGrid;
