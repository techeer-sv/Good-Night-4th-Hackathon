import axios from 'axios';
import { 
  Concert, 
  Seat, 
  Booking, 
  ApiResponse, 
  ReservationRequest, 
  BookingRequest, 
  QueueJoinRequest,
  QueueStatus,
  SeatStats
} from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API 요청: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API 요청 오류:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API 응답: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API 응답 오류:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// 공연 관련 API
export const concertAPI = {
  // 공연 목록 조회
  getConcerts: async (): Promise<ApiResponse<Concert[]>> => {
    const response = await api.get('/concerts');
    return response.data;
  },

  // 공연 상세 정보 조회
  getConcertById: async (id: string): Promise<ApiResponse<Concert & { stats: SeatStats; seats: Seat[] }>> => {
    const response = await api.get(`/concerts/${id}`);
    return response.data;
  },

  // 공연별 좌석 정보 조회
  getConcertSeats: async (id: string): Promise<ApiResponse<{ concert: Concert; seats: Seat[]; stats: SeatStats }>> => {
    const response = await api.get(`/concerts/${id}/seats`);
    return response.data;
  },
};

// 예매 관련 API
export const bookingAPI = {
  // 좌석 예약
  reserveSeats: async (data: ReservationRequest): Promise<ApiResponse<{ reservationId: string; expiresAt: string }>> => {
    const response = await api.post('/bookings/reserve', data);
    return response.data;
  },

  // 좌석 예매 (동시성 제어)
  bookSeats: async (data: BookingRequest): Promise<ApiResponse<{ bookingId: string; status: string }>> => {
    const response = await api.post('/concurrency/book-seats', data);
    return response.data;
  },

  // 좌석 예약 해제
  releaseSeats: async (seatIds: string[], userId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete('/bookings/reserve', {
      data: { seatIds, userId }
    });
    return response.data;
  },

  // 사용자별 예매 내역 조회
  getUserBookings: async (userId: string): Promise<ApiResponse<Booking[]>> => {
    const response = await api.get(`/bookings/user/${userId}`);
    return response.data;
  },
};

// 대기열 관련 API
export const queueAPI = {
  // 우선순위 대기열 등록
  joinQueue: async (data: QueueJoinRequest): Promise<ApiResponse<{ queueId: string; position: number }>> => {
    const response = await api.post('/queue/join', data);
    return response.data;
  },

  // 대기열 상태 확인
  getQueueStatus: async (concertId: string): Promise<ApiResponse<QueueStatus>> => {
    const response = await api.get(`/queue/status/${concertId}`);
    return response.data;
  },

  // 대기열에서 나가기
  leaveQueue: async (concertId: string, userId: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete('/queue/leave', {
      data: { concertId, userId }
    });
    return response.data;
  },

  // 대기열 전체 상태 확인 (관리자용)
  getAdminQueueStatus: async (): Promise<ApiResponse<{ queues: QueueStatus[] }>> => {
    const response = await api.get('/queue/admin/status');
    return response.data;
  },
};

// 시스템 관련 API
export const systemAPI = {
  // 서버 상태 확인
  getHealth: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await api.get('/health');
    return response.data;
  },

  // API 문서
  getDocs: async (): Promise<{ endpoints: string[]; version: string }> => {
    const response = await api.get('/docs');
    return response.data;
  },
};

export default api;
