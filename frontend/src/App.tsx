import React, { useState } from 'react';
import './App.css';
import SeatGrid from './components/SeatGrid';
import ReservationForm from './components/ReservationForm';
import { Seat } from './types';

function App() {
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat);
  };

  const handleReservationSuccess = () => {
    setSelectedSeat(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleCancel = () => {
    setSelectedSeat(null);
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
            onReservationSuccess={handleReservationSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <>
            <h2>Select a Seat</h2>
            <SeatGrid onSeatSelect={handleSeatSelect} refreshKey={refreshKey} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
