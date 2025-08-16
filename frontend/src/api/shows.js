import api from './axios';

// 공연 목록 조회
export const getShows = async () => {
  try {
    const response = await api.get('/shows');
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || '공연 목록을 불러오는데 실패했습니다.';
    throw new Error(message);
  }
};

// 특정 공연의 시간 조회
export const getShowPerformances = async (showId) => {
  try {
    const response = await api.get(`/shows/${showId}/performances`);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || '공연 시간을 불러오는데 실패했습니다.';
    throw new Error(message);
  }
};

// 특정 공연 시간의 좌석 조회
export const getPerformanceSeats = async (performanceId) => {
  try {
    const response = await api.get(`/performances/${performanceId}/seats`);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || '좌석 정보를 불러오는데 실패했습니다.';
    throw new Error(message);
  }
};

// 예약 생성
export const createReservation = async (reservationData) => {
  try {
    // userId는 제거 - 백엔드에서 세션을 통해 사용자 식별
    const { userId: _userId, ...dataToSend } = reservationData;
    const response = await api.post('/reservations', dataToSend);
    return { success: true, data: response.data };
  } catch (error) {
    const message = error.response?.data?.message || '예약에 실패했습니다.';
    throw new Error(message);
  }
}; 