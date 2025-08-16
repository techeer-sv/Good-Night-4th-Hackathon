import React, { useState, useEffect } from "react";
import Seat from "/src/components/Seat.jsx";

const SeatBooking = ({ setCurrentPage, setSelectedSeat }) => {
  const [seats, setSeats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트가 처음 렌더링될 때 좌석 목록 API를 호출
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/seats");
        if (!response.ok) {
          throw new Error("좌석 목록을 불러오는 데 실패했습니다.");
        }
        const data = await response.json();
        console.log("받은 좌석 데이터:", data); // 디버깅용 로그 추가
        setSeats(data);
      } catch (error) {
        console.error("Fetching seats failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();
  }, []);

  const handleSeatClick = (id) => {
    const seatToSelect = seats.find((seat) => seat.id === id);
    if (!seatToSelect.isBooked) {
      setSelectedSeat(seatToSelect);
      setCurrentPage("booking-form");
    }
  };

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    padding: "40px",
    width: "fit-content",
    margin: "50px auto",
    backgroundColor: "#f0f0f0",
    borderRadius: "12px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  if (isLoading) {
    return (
      <h1 style={{ textAlign: "center", marginTop: "100px" }}>
        좌석 정보를 불러오는 중입니다...
      </h1>
    );
  }

  return (
    <div>
      <h1 style={{ textAlign: "center", color: "#333" }}>좌석 현황</h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
        <span style={{ color: "#2ecc71" }}>✅ 예약 가능</span> |{" "}
        <span style={{ color: "#ff6b6b" }}>❌ 예약 불가</span>
      </p>
      <div style={containerStyle}>
        {seats.map((seat) => (
          <Seat
            key={seat.id}
            id={seat.id}
            isBooked={seat.isBooked}
            onSeatClick={handleSeatClick}
          />
        ))}
      </div>
    </div>
  );
};

export default SeatBooking;
