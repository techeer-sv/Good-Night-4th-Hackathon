import axios from 'axios';
import { Seat } from './types';

export const fetchSeats = async (): Promise<Seat[]> => {
  const response = await axios.get<Seat[]>('/api/seats');
  return response.data;
};

export const reserveSeat = async (seatId: number, reservedBy: string): Promise<Seat> => {
    const response = await axios.post<Seat>(`/api/seats/${seatId}/reserve`, { reservedBy });
    return response.data;
};
