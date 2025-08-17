"use client";

import { useState } from "react";

interface Seat {
  id: number;
  row: string;
  col: number;
  isReserved: boolean;
  isSelected: boolean;
}

interface ReservationFormProps {
  selectedSeat: Seat;
  onBack: () => void;
  onSubmit: (formData: ReservationData) => void;
  isSubmitting: boolean;
  initialData?: Partial<ReservationData>;
  onFormDataChange?: (data: Partial<ReservationData>) => void;
}

interface ReservationData {
  name: string;
  phone: string;
  email: string;
  seatId: number;
  seatInfo: string;
}

export default function ReservationForm({
  selectedSeat,
  onBack,
  onSubmit,
  isSubmitting,
  initialData = {},
  onFormDataChange,
}: ReservationFormProps) {
  const [formData, setFormData] = useState<
    Omit<ReservationData, "seatId" | "seatInfo">
  >({
    name: initialData.name || "",
    phone: initialData.phone || "",
    email: initialData.email || "",
  });

  const [errors, setErrors] = useState<Partial<ReservationData>>({});

  const validateForm = () => {
    const newErrors: Partial<ReservationData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요";
    } else if (!/^[0-9-+\s()]+$/.test(formData.phone)) {
      newErrors.phone = "올바른 전화번호 형식이 아닙니다";
    }

    if (!formData.email.trim()) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const reservationData: ReservationData = {
        ...formData,
        seatId: selectedSeat.id,
        seatInfo: `${selectedSeat.row}${selectedSeat.col}`,
      };

      onSubmit(reservationData);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // localStorage에 저장
    if (onFormDataChange) {
      onFormDataChange(newFormData);
    }

    // 에러 메시지 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">예약자 정보 입력</h2>
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← 뒤로
          </button>
        </div>

        {/* 선택된 좌석 정보 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-2">선택된 좌석</h3>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold">
              {selectedSeat.row}
              {selectedSeat.col}
            </div>
            <span className="text-blue-700">
              {selectedSeat.row}행 {selectedSeat.col}열
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 이름 입력 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이름 *
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="홍길동"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* 전화번호 입력 */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              전화번호 *
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="010-1234-5678"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* 이메일 입력 */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              이메일 *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="example@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center space-x-2 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting && (
              <div
                data-testid="spinner"
                className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
            )}
            <span>{isSubmitting ? "요청 중..." : "예약 확정하기"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
