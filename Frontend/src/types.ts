// 좌석 하나에 대한 타입 정의
export interface Seat {
  id: number;
  row: number;
  col: number;
  status: "available" | "reserved";
  seat_code?: string;               // 좌석 코드
  reserver_name?: string | null;
  reserver_phone?: string | null;
}

// 예약 요청 시 서버로 보내는 타입
export interface ReservationRequest {
  row: number;
  col: number;
  name: string;
  phone: string;
}

// 예약 결과 응답 타입
export interface ReservationResponse {
  message: string;
  seat: Seat; // 백엔드가 seat 객체를 그대로 반환
}