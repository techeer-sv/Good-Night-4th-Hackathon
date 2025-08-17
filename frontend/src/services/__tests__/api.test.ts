import "@testing-library/jest-dom";
import { api } from "../api";

// Mock fetch globally
global.fetch = jest.fn();

describe("API Service", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  describe("getSeats", () => {
    it("좌석 목록을 성공적으로 가져온다", async () => {
      const mockSeats = [
        { id: 1, row: "A", col: 1, isReserved: false, isSelected: false },
        { id: 2, row: "A", col: 2, isReserved: true, isSelected: false },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSeats,
      });

      const result = await api.getSeats();

      expect(fetch).toHaveBeenCalledWith("http://localhost:3001/seats");
      expect(result).toEqual(mockSeats);
    });

    it("API 오류 시 에러를 던진다", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      await expect(api.getSeats()).rejects.toThrow(
        "좌석 정보를 가져오는데 실패했습니다."
      );
    });
  });

  describe("createReservation", () => {
    it("예약을 성공적으로 생성한다", async () => {
      const mockReservation = {
        id: "res_1",
        name: "홍길동",
        phone: "010-1234-5678",
        email: "test@example.com",
        seatId: 1,
        seatInfo: "A1",
        status: "confirmed",
        createdAt: "2024-01-01T00:00:00Z",
      };

      const reservationData = {
        name: "홍길동",
        phone: "010-1234-5678",
        email: "test@example.com",
        seatId: 1,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReservation,
      });

      const result = await api.createReservation(reservationData);

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/seats/reserve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reservationData),
        }
      );
      expect(result).toEqual(mockReservation);
    });

    it("AbortSignal과 함께 예약을 생성한다", async () => {
      const mockReservation = {
        id: "res_1",
        status: "confirmed",
        seatInfo: "A1",
      };
      const reservationData = {
        name: "홍길동",
        phone: "010-1234-5678",
        email: "test@example.com",
        seatId: 1,
      };
      const abortController = new AbortController();

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReservation,
      });

      const result = await api.createReservation(
        reservationData,
        abortController.signal
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/seats/reserve",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reservationData),
          signal: abortController.signal,
        }
      );
      expect(result).toEqual(mockReservation);
    });

    it("AbortSignal로 요청이 취소되면 AbortError를 던진다", async () => {
      const reservationData = {
        name: "홍길동",
        phone: "010-1234-5678",
        email: "test@example.com",
        seatId: 1,
      };
      const abortController = new AbortController();

      // fetch가 AbortError를 던지도록 모킹
      (fetch as jest.Mock).mockImplementationOnce(() => {
        const error = new Error("The user aborted a request.");
        error.name = "AbortError";
        throw error;
      });

      await expect(
        api.createReservation(reservationData, abortController.signal)
      ).rejects.toThrow("The user aborted a request.");
    });

    it("예약 실패 시 에러를 던진다", async () => {
      const reservationData = {
        name: "홍길동",
        phone: "010-1234-5678",
        email: "test@example.com",
        seatId: 1,
      };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => ({ message: "예약에 실패했습니다." }),
      });

      await expect(api.createReservation(reservationData)).rejects.toThrow(
        "예약에 실패했습니다."
      );
    });
  });

  describe("getReservations", () => {
    it("예약 목록을 성공적으로 가져온다", async () => {
      const mockReservations = [
        {
          id: "res_1",
          name: "홍길동",
          phone: "010-1234-5678",
          email: "test@example.com",
          seatId: 1,
          seatInfo: "A1",
          status: "confirmed",
          createdAt: "2024-01-01T00:00:00Z",
        },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockReservations,
      });

      const result = await api.getReservations();

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/seats/reservations"
      );
      expect(result).toEqual(mockReservations);
    });
  });
});
