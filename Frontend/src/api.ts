// API를 호출하는 공용 유틸
import type { Seat, ReservationRequest, ReservationResponse } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const payload = await (async () => {
    try { return await res.json(); } catch { return null; }
  })();

  if (!res.ok) {
    const msg = ((payload as { message?: string } | null)?.message) ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return payload as T;
}

export const api = {
  getSeats: () => http<Seat[]>("/seats/"),
  reserve: (body: ReservationRequest) =>
    http<ReservationResponse>("/reserve/", { method: "POST", body: JSON.stringify(body) }),
  // 예약 확인 (이름 + 전화번호)
  lookup: (body: { name: string; phone: string }) =>
    http<{ message: string; seats: Seat[] }>(
      "/lookup/",
      { method: "POST", body: JSON.stringify(body) }
    )
};