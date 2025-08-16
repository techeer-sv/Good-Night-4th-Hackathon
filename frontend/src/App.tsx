import { useState } from 'react';
import './App.css';
import SeatGrid from './components/SeatGrid';
import ReservationForm from './components/ReservationForm';
import Notification from './components/Notification';
import { selectSeat, cancelSeatSelection } from './api';
import type { Seat } from './types';
import { extractErrorMessage } from './utils/errorHandler';

function App() {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userSession] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleSeatSelect = async (seat: Seat) => {
    if (seat.isReserved) return;
    
    // If this seat is already selected by current user, go directly to reservation form
    if (seat.selectedBy === userSession) {
      setSelectedSeat(seat);
      return;
    }
    
    try {
      // Select the seat first
      const updatedSeat = await selectSeat(seat.id, userSession);
      setSelectedSeat(updatedSeat);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err);
      setNotification({ message: `Selection failed: ${errorMessage}`, type: 'error' });
    }
  };

  const handleReservationSuccess = () => {
    setSelectedSeat(null);
    setRefreshKey(prev => prev + 1);
    setNotification({ message: 'Reservation successful!', type: 'success' });
  };

  const handleCancel = async () => {
    if (selectedSeat) {
      try {
        // Cancel the seat selection on the server
        await cancelSeatSelection(selectedSeat.id, userSession);
      } catch (err: unknown) {
        console.error('Failed to cancel selection:', err);
        // Still proceed to close the form even if API call fails
      }
    }
    setSelectedSeat(null);
    setRefreshKey(prev => prev + 1); // Refresh the seat grid
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Seat Reservation System</h1>
      </header>
      <main>
        {selectedSeat ? (
          <ReservationForm
            seat={selectedSeat}
            userSession={userSession}
            onReservationSuccess={handleReservationSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <h2>Select a Seat</h2>
            <SeatGrid onSeatSelect={handleSeatSelect} refreshKey={refreshKey} userSession={userSession} />
          </>
        )}
      </main>
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;
