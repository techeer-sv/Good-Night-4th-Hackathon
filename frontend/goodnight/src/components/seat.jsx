import React from "react";

// 개별 좌석을 나타내는 컴포넌트
const Seat = ({ id, isBooked, onSeatClick }) => {
  const seatStyle = {
    width: "60px",
    height: "60px",
    margin: "10px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    backgroundColor: isBooked ? "#ff6b6b" : "#2ecc71", // 예약됨: 빨간색, 예약 가능: 초록색
    color: "white",
    transition: "background-color 0.3s ease",
  };

  return (
    <div style={seatStyle} onClick={() => onSeatClick(id)}>
      {isBooked ? "❌" : "✅"}
    </div>
  );
};

export default Seat;
