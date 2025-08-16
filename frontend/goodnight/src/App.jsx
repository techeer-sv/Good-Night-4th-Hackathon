import React, { useState } from "react";
import "./App.css";
import SeatBooking from "./pages/seatbookingpage.jsx";
import BookingForm from "./pages/bookingformpage.jsx";
import BookingResult from "./pages/bookingresultpage.jsx";

function App() {
  const [currentPage, setCurrentPage] = useState("seat-selection");
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);

  const renderPage = () => {
    switch (currentPage) {
      case "seat-selection":
        return (
          <SeatBooking
            setCurrentPage={setCurrentPage}
            setSelectedSeat={setSelectedSeat}
          />
        );
      case "booking-form":
        return (
          <BookingForm
            selectedSeat={selectedSeat}
            setCurrentPage={setCurrentPage}
            setBookingResult={setBookingResult}
          />
        );
      case "booking-result":
        return (
          <BookingResult
            bookingResult={bookingResult}
            setCurrentPage={setCurrentPage}
          />
        );
      default:
        return (
          <SeatBooking
            setCurrentPage={setCurrentPage}
            setSelectedSeat={setSelectedSeat}
          />
        );
    }
  };

  return <div className="App">{renderPage()}</div>;
}

export default App;
