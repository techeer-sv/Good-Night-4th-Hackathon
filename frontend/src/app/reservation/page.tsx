"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReservationForm from "@/components/ReservationForm";
import { api, Seat as ApiSeat } from "@/services/api";

interface Seat {
  id: number;
  row: string;
  col: number;
  isReserved: boolean;
  isSelected: boolean;
}

interface ReservationData {
  name: string;
  phone: string;
  email: string;
  seatId: number;
  seatInfo: string;
}

// localStorage 키
const STORAGE_KEY = "reservation_form_data";

export default function ReservationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSlowMessage, setShowSlowMessage] = useState(false);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ReservationData>>({});

  // AbortController와 타이머 ref
  const abortControllerRef = useRef<AbortController | null>(null);
  const slowMessageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // URL 파라미터에서 좌석 정보 가져오기
  useEffect(() => {
    const seatId = searchParams.get("seatId");
    const row = searchParams.get("row");
    const col = searchParams.get("col");

    if (!seatId || !row || !col) {
      alert("좌석 정보가 없습니다.");
      router.push("/");
      return;
    }

    // 좌석이 실제로 예약 가능한지 확인
    const checkSeatAvailability = async () => {
      try {
        const seats = await api.getSeats();
        const seat = seats.find((s) => s.id === parseInt(seatId));

        if (!seat) {
          alert("존재하지 않는 좌석입니다.");
          router.push("/");
          return;
        }

        if (seat.isReserved) {
          alert("이미 예약된 좌석입니다.");
          router.push("/");
          return;
        }

        setSelectedSeat({
          id: parseInt(seatId),
          row: row,
          col: parseInt(col),
          isReserved: false,
          isSelected: true,
        });
      } catch (error) {
        console.error("좌석 정보 확인 실패:", error);
        alert("좌석 정보를 확인할 수 없습니다.");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkSeatAvailability();
  }, [searchParams, router]);

  // localStorage에서 폼 데이터 복원
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
      } catch (error) {
        console.error("저장된 폼 데이터 파싱 실패:", error);
      }
    }
  }, []);

  // 폼 데이터를 localStorage에 저장
  const saveFormData = (data: Partial<ReservationData>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("폼 데이터 저장 실패:", error);
    }
  };

  // 폼 데이터 초기화
  const clearFormData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setFormData({});
  };

  const handleReservationSubmit = async (formData: ReservationData) => {
    // 즉시 피드백: 버튼 비활성화 및 스피너 표시
    setIsSubmitting(true);
    setShowSlowMessage(false);

    // AbortController 생성
    abortControllerRef.current = new AbortController();

    // 1.5초 후 지연 알림 표시
    slowMessageTimerRef.current = setTimeout(() => {
      setShowSlowMessage(true);
    }, 1500);

    try {
      // 폼 데이터 저장
      saveFormData(formData);

      const reservation = await api.createReservation(
        {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          seatId: formData.seatId,
        },
        abortControllerRef.current.signal
      );

      // 타이머 정리
      if (slowMessageTimerRef.current) {
        clearTimeout(slowMessageTimerRef.current);
        slowMessageTimerRef.current = null;
      }

      if (reservation.status === "confirmed") {
        alert(`예약이 완료되었습니다!\n좌석: ${reservation.seatInfo}`);
        clearFormData(); // 성공 시 저장된 데이터 삭제
        setReservationError(null); // 성공 시 에러 상태 초기화
        router.push("/");
      } else {
        setReservationError("예약에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      // 타이머 정리
      if (slowMessageTimerRef.current) {
        clearTimeout(slowMessageTimerRef.current);
        slowMessageTimerRef.current = null;
      }

      if (error instanceof Error && error.name === "AbortError") {
        alert("예약이 취소되었습니다.");
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "알 수 없는 오류";
        setReservationError(`예약 실패: ${errorMessage}`);
      }
    } finally {
      setIsSubmitting(false);
      setShowSlowMessage(false);
      abortControllerRef.current = null;
    }
  };

  const handleBackToSeatSelection = () => {
    router.push("/");
  };

  // 요청 취소
  const handleCancelRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // 다시 시도
  const handleRetry = () => {
    setReservationError(null);
    if (formData.name && formData.phone && formData.email) {
      handleReservationSubmit(formData as ReservationData);
    }
  };

  // 다른 좌석 보기
  const handleViewOtherSeats = () => {
    clearFormData();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">좌석 정보를 확인하는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSeat) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b py-8">
      <div className="max-w-4xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            예약자 정보 입력
          </h1>
          <p className="text-lg text-gray-600">
            선택하신 좌석: {selectedSeat.row}
            {selectedSeat.col}
          </p>
        </header>

        {/* 지연 알림 배지 */}
        {showSlowMessage && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                <span className="text-yellow-800 font-medium">
                  조금만 기다려 주세요.
                </span>
              </div>
              <button
                onClick={handleCancelRequest}
                className="mt-2 text-yellow-600 hover:text-yellow-800 text-sm underline"
              >
                요청 취소
              </button>
            </div>
          </div>
        )}

        {/* 예약 실패 에러 메시지 */}
        {reservationError && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    예약에 실패하였습니다
                  </h3>
                  <p className="text-sm text-red-700 mb-3">
                    {reservationError}
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleRetry}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                    >
                      다시 시도
                    </button>
                    <button
                      onClick={handleViewOtherSeats}
                      className="px-3 py-1.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
                    >
                      다른 좌석 보기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex justify-center">
          <div className="w-full max-w-md">
            <ReservationForm
              selectedSeat={selectedSeat}
              onBack={handleBackToSeatSelection}
              onSubmit={handleReservationSubmit}
              isSubmitting={isSubmitting}
              initialData={formData}
              onFormDataChange={saveFormData}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
