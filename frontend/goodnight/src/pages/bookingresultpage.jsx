import React from "react";

const BookingResult = ({ bookingResult, setCurrentPage }) => {
  const resultStyle = {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "40px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  };

  const successStyle = {
    ...resultStyle,
    backgroundColor: "#e8f6e8",
    color: "#27ae60",
  };

  const failureStyle = {
    ...resultStyle,
    backgroundColor: "#fcecec",
    color: "#c0392b",
  };

  const buttonStyle = {
    marginTop: "30px",
    padding: "12px 24px",
    fontSize: "16px",
    cursor: "pointer",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#3498db",
    color: "white",
  };

  const handleGoBack = () => {
    setCurrentPage("seat-selection");
  };

  if (bookingResult === null) {
    return null; // 결과가 없을 때 아무것도 표시하지 않음
  }

  return (
    <div style={bookingResult ? successStyle : failureStyle}>
      <h1>{bookingResult ? "🎉 예약 성공!" : "⚠️ 예약 실패..."}</h1>
      <p>
        {bookingResult
          ? "성공적으로 좌석이 예약되었습니다. 감사합니다."
          : "죄송합니다. 예약 과정에서 오류가 발생했습니다. 다시 시도해 주세요."}
      </p>
      <button style={buttonStyle} onClick={handleGoBack}>
        다시 예약하기
      </button>
    </div>
  );
};

export default BookingResult;
