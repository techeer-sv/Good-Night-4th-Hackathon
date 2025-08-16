import React, { useState } from "react";

const BookingForm = ({ selectedSeat, setCurrentPage, setBookingResult }) => {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // ... (스타일 코드는 이전과 동일)

  const handleBookingConfirm = async () => {
    setIsProcessing(true);
    const bookingData = {
      seatId: selectedSeat.id,
      name,
      phoneNumber,
    };

    try {
      const response = await fetch("http://localhost:8000/api/book-seat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setBookingResult(true);
      } else {
        setBookingResult(false);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      setBookingResult(false);
    } finally {
      setIsProcessing(false);
      setCurrentPage("booking-result");
    }
  };

  const formStyle = {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "30px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const inputStyle = {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    width: "100%",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    padding: "15px",
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
    backgroundColor: "#3498db",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  };

  return (
    <div style={formStyle}>
      <h2 style={{ textAlign: "center" }}>좌석 {selectedSeat.id} 예약하기</h2>
      <input
        type="text"
        placeholder="이름"
        style={inputStyle}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="tel"
        placeholder="전화 번호 (예: 010-1234-5678)"
        style={inputStyle}
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button
        style={buttonStyle}
        onClick={handleBookingConfirm}
        disabled={!name || !phoneNumber || isProcessing}
      >
        {isProcessing ? "예약 처리 중..." : "예약 확정"}
      </button>
    </div>
  );
};

export default BookingForm;
