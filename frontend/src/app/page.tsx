"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SeatGrid from "@/components/SeatGrid";
import { api, Seat as ApiSeat } from "@/services/api";

interface Seat {
  id: number;
  row: string;
  col: number;
  isReserved: boolean;
  isSelected: boolean;
}

export default function Home() {
  const router = useRouter();
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  // 좌석 데이터 로드
  useEffect(() => {
    const loadSeats = async () => {
      try {
        const apiSeats = await api.getSeats();
        setSeats(apiSeats);
      } catch (error) {
        console.error("좌석 정보 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, []);

  const handleSeatSelect = (seat: Seat) => {
    console.log("클릭된 좌석:", seat);
    console.log("isReserved 값:", seat.isReserved);

    // 이미 예약된 좌석인지 확인
    if (seat.isReserved) {
      console.log("예약된 좌석 클릭됨");
      alert(`이미 예약된 좌석입니다.\n좌석: ${seat.row}${seat.col}`);
      return;
    }

    // 다른 좌석 선택 해제하고 현재 좌석 선택
    setSeats((prev) =>
      prev.map((s) => ({
        ...s,
        isSelected: s.id === seat.id ? !s.isSelected : false,
      }))
    );

    setSelectedSeat(seat);
    console.log("선택된 좌석:", seat);
  };

  const handleReservationProceed = () => {
    if (!selectedSeat) {
      alert("좌석을 선택해주세요.");
      return;
    }

    // 예약 페이지로 이동 (URL 파라미터 포함)
    router.push(
      `/reservation?seatId=${selectedSeat.id}&row=${selectedSeat.row}&col=${selectedSeat.col}`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Techeer 티켓 예매
          </h1>
          <p className="text-lg text-gray-600">
            원하는 좌석을 선택하고 예약하세요
          </p>
        </header>

        <main className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* 좌석 선택 영역 */}
          <div className="flex-1">
            <SeatGrid
              seats={seats}
              onSeatSelect={handleSeatSelect}
              loading={loading}
            />
          </div>

          {/* 선택된 좌석 정보 */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                선택된 좌석 정보
              </h3>

              {selectedSeat ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">좌석 번호:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedSeat.row}
                      {selectedSeat.col}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">행:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedSeat.row}행
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">열:</span>
                    <span className="font-semibold text-gray-800">
                      {selectedSeat.col}열
                    </span>
                  </div>

                  <button
                    onClick={handleReservationProceed}
                    className="w-full mt-4 bg-blue-600 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    예약 진행하기
                  </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-6">
                  <div className="text-3xl mb-2">🎫</div>
                  <p>좌석을 선택해주세요</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
