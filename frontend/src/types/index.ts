// 공연 정보 타입
export interface Concert {
  id: string;
  title: string;
  artist: string;
  date: string;
  venue: string;
  totalSeats: number;
  price: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

// 좌석 정보 타입
export interface Seat {
  id: string;
  concertId: string;
  seatNumber: number;
  row: number;
  section: string;
  status: 'available' | 'reserved' | 'booked' | 'maintenance';
  price: number;
  priority: 'normal' | 'premium' | 'vip';
  reservedAt: string | null;
  reservedBy: string | null;
  bookedAt: string | null;
  bookedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// 예매 정보 타입
export interface Booking {
  id: string;
  concertId: string;
  userId: string;
  seatIds: string[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  bookingDate: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

// 사용자 정보 타입
export interface User {
  id: string;
  name: string;
  email: string;
  priority: 'normal' | 'premium' | 'vip';
}

// 좌석 통계 타입
export interface SeatStats {
  totalSeats: number;
  availableSeats: number;
  reservedSeats: number;
  bookedSeats: number;
  reservationRate: number;
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

// 예약 요청 타입
export interface ReservationRequest {
  concertId: string;
  seatIds: string[];
  userId: string;
}

// 예매 요청 타입
export interface BookingRequest {
  concertId: string;
  seatIds: string[];
  userId: string;
  paymentMethod: string;
}

// 대기열 등록 요청 타입
export interface QueueJoinRequest {
  concertId: string;
  userId: string;
  priority: 'normal' | 'premium' | 'vip';
}

// 대기열 상태 타입
export interface QueueStatus {
  totalWaiting: number;
  vipWaiting: number;
  premiumWaiting: number;
  normalWaiting: number;
  estimatedWaitTime: number;
}

// 좌석 선택 상태 타입
export interface SeatSelection {
  seatId: string;
  seatNumber: number;
  row: number;
  section: string;
  price: number;
  priority: 'normal' | 'premium' | 'vip';
}

// 예약자 정보 타입
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  paymentMethod: 'card' | 'bank_transfer' | 'mobile_payment';
}
