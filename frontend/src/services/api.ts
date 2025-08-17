const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : "http://localhost:3001");

export interface Seat {
  id: number;
  row: string;
  col: number;
  isReserved: boolean;
  isSelected: boolean;
}

export interface CreateReservationDto {
  name: string;
  phone: string;
  email: string;
  seatId: number;
}

export interface Reservation {
  id: string;
  seatId: number;
  name: string;
  phone: string;
  email: string;
  seatInfo: string;
  createdAt: string;
  status: "confirmed" | "failed";
}

export const api = {
  // 좌석 목록 조회
  async getSeats(): Promise<Seat[]> {
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("fetch 호출:", `${API_BASE_URL}/seats`);

    const response = await fetch(`${API_BASE_URL}/seats`);
    console.log("fetch 응답:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error("좌석 정보를 가져오는데 실패했습니다.");
    }

    const data = await response.json();
    console.log("API 응답 데이터:", data);
    return data;
  },

  // 좌석 예약
  async createReservation(
    data: CreateReservationDto,
    signal?: AbortSignal
  ): Promise<Reservation> {
    const response = await fetch(`${API_BASE_URL}/seats/reserve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "예약에 실패했습니다.");
    }

    return response.json();
  },

  // 예약 목록 조회
  async getReservations(): Promise<Reservation[]> {
    const response = await fetch(`${API_BASE_URL}/seats/reservations`);
    if (!response.ok) {
      throw new Error("예약 정보를 가져오는데 실패했습니다.");
    }
    return response.json();
  },
};
