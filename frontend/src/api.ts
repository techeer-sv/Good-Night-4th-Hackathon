import axios from 'axios';
import type { Seat } from './types';

export const fetchSeats = async (): Promise<Seat[]> => {
  const response = await axios.get<Seat[]>('/api/seats');
  return response.data;
};

export const fetchSeatStatus = async (): Promise<{ hash: string; lastModified: number }> => {
  const response = await axios.get<{ hash: string; lastModified: number }>('/api/seats/status');
  return response.data;
};

export const selectSeat = async (seatId: number, selectedBy: string): Promise<Seat> => {
    const response = await axios.post<Seat>(`/api/seats/${seatId}/select`, { selectedBy });
    return response.data;
};

export const cancelSeatSelection = async (seatId: number, selectedBy: string): Promise<Seat> => {
    const response = await axios.post<Seat>(`/api/seats/${seatId}/cancel`, { selectedBy });
    return response.data;
};

export const reserveSeat = async (seatId: number, reservedBy: string, selectedBy?: string): Promise<Seat> => {
    const response = await axios.post<Seat>(`/api/seats/${seatId}/reserve`, { reservedBy, selectedBy });
    return response.data;
};

export const resetAllSeats = async (): Promise<{ message: string; resetCount: number; timestamp: number }> => {
    const response = await axios.post<{ message: string; resetCount: number; timestamp: number }>('/api/seats/reset');
    return response.data;
};
