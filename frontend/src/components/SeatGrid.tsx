"use client";

import { useState } from "react";

interface Seat {
  id: number;
  row: string;
  col: number;
  isReserved: boolean;
  isSelected: boolean;
}

interface SeatGridProps {
  seats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  loading: boolean;
}

export default function SeatGrid({
  seats,
  onSeatSelect,
  loading,
}: SeatGridProps) {
  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">좌석 정보를 불러오는 중...</p>
      </div>
    );
  }

  const handleSeatClick = (seat: Seat) => {
    // 모든 좌석 클릭을 부모 컴포넌트로 전달
    onSeatSelect(seat);
  };

  const getSeatStyle = (seat: Seat) => {
    const baseStyle =
      "w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 cursor-pointer transition-all duration-200 flex items-center justify-center font-bold text-base md:text-lg";

    if (seat.isReserved) {
      return `${baseStyle} bg-gray-500 text-white border-gray-600 cursor-not-allowed opacity-75`;
    }

    if (seat.isSelected) {
      return `${baseStyle} bg-blue-500 text-white border-blue-600 transform scale-105 shadow-lg`;
    }

    return `${baseStyle} bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:border-green-400`;
  };

  return (
    <div className="max-w-sm md:max-w-md mx-auto">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 text-gray-800">
        좌석 선택
      </h2>

      {/* 무대 표시 */}
      <div className="mb-6 text-center">
        <div className="bg-gray-300 text-black py-2 px-16 md:py-3 md:px-20 rounded-lg inline-block">
          <span className="text-base md:text-lg font-semibold">STAGE</span>
        </div>
      </div>

      {/* 좌석 그리드 */}
      <div className="flex justify-center mb-3">
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          {seats.map((seat) => (
            <div
              key={seat.id}
              className={getSeatStyle(seat)}
              onClick={() => handleSeatClick(seat)}
              title={seat.isReserved ? "예약됨" : `${seat.row}${seat.col} 좌석`}
            >
              {seat.row}
              {seat.col}
            </div>
          ))}
        </div>
      </div>

      {/* 좌석 상태 설명 */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
          <span>선택 가능</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-500 border-2 border-blue-600 rounded"></div>
          <span>선택됨</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-500 border-2 border-gray-600 rounded opacity-75"></div>
          <span>예약됨</span>
        </div>
      </div>
    </div>
  );
}
