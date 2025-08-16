import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";
import type { Seat } from "../types";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ReservePage() {
  const q = useQuery();
  const row = Number(q.get("row"));
  const col = Number(q.get("col"));
  const seatCode = q.get("code") || `${row}-${col}`;
  const navigate = useNavigate();

  // 예약자 입력
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // 좌석 목록 및 상태
  const [seats, setSeats] = useState<Seat[] | null>(null);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSeats = async () => {
    setLoadingSeats(true);
    setError(null);
    try {
      setSeats(await api.getSeats());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "좌석을 불러오지 못했습니다");
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    // row/col이 바뀌어도 그리드가 즉시 반영되도록, search 변경에 반응
    // (Vite/React Router는 기본적으로 다시 렌더링 됨)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row, col]);

  // 3x3 행 묶기
  const grid = useMemo(() => {
    if (!seats) return [] as Seat[][];
    return [1, 2, 3].map((r) => seats.filter((s) => s.row === r));
  }, [seats]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await api.reserve({ row, col, name, phone });
      setMessage(`${res.message} (좌석 ${res.seat.seat_code ?? `${res.seat.row}-${res.seat.col}`})`);
      // 성공했으면 최신 좌석 현황 반영
      await fetchSeats();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "예약에 실패했습니다");

      // 이미 다른 사용자가 예약한 경우 → 알림창으로 안내 후 메인으로 이동
      if (msg && /이미.*예약/.test(msg)) {
        // alert()는 동기적으로 사용자 확인을 기다립니다.
        window.alert(`${msg}\n메인 화면으로 이동합니다.`);
        navigate("/");
        return; // 아래 fetchSeats는 생략 (메인에서 목록을 새로 로드함)
      }

      // 그 외 오류: 최신 좌석 현황만 갱신
      await fetchSeats();
    } finally {
      setSubmitting(false);
    }
  };

  const gotoSeat = (s: Seat) => {
    if (s.status !== "available") return;
    navigate(`/reserve?row=${s.row}&col=${s.col}&code=${s.seat_code ?? ""}`);
  };

  const isPendingSeat = (s: Seat) => s.row === row && s.col === col;

  return (
    <div className="container">
      <button className="link" onClick={() => navigate("/")}>← 메인으로</button>
      <h2>좌석 예약: {seatCode}</h2>

    <div className="legend compact" aria-hidden>
      <span className="badge available" /> 선택 가능 좌석
      <span className="badge reserved" /> 예약된 좌석
      <span className="badge pending" /> 현재 선택된 좌석
    </div>

      {/* 무대 */}
      <div className="stage" aria-hidden>STAGE</div>

      {/* 좌석 그리드 (현재 선택한 좌석은 pending으로 강조) */}
      {loadingSeats && <p>좌석 불러오는 중...</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <div className="grid theater-grid" role="grid" aria-label="좌석 표">
        {grid.map((rowSeats, i) => (
          <div className="row" role="row" key={i}>
            {rowSeats.map((s) => {
              const pending = isPendingSeat(s);
              const base = pending ? "pending" : s.status; // available/reserved
              return (
                <button
                  key={s.id}
                  className={`seat ${base}`}
                  disabled={s.status === "reserved" || pending}
                  onClick={() => gotoSeat(s)}
                  role="gridcell"
                  aria-label={`좌석 ${s.seat_code ?? `${s.row}-${s.col}`} 상태 ${
                    pending ? "선택됨" : s.status === "available" ? "가능" : "예약됨"
                  }`}
                  title={s.seat_code ?? `${s.row}-${s.col}`}
                >
                  {s.seat_code ?? `${s.row}-${s.col}`}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 예약 폼 */}
      <form onSubmit={submit} className="form" style={{ marginTop: 16 }}>
        <label>
          이름
          <input
            type="text"
            value={name}
            onChange={(e)=>setName(e.target.value)}
            required
            placeholder="홍길동"
          />
        </label>

        <label>
          전화번호
          <input
            type="tel"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
            required
            placeholder="010-1234-5678 / +82 10 1234 5678"
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "예약 중..." : "예약하기"}
        </button>
      </form>

      {message && (
        <div className="ok" style={{ marginTop: 12 }}>
          <p>{message}</p>
          <button onClick={() => navigate("/")}>좌석으로 돌아가기</button>
        </div>
      )}
      {error && <p className="error" style={{ marginTop: 12 }}>{error}</p>}
    </div>
  );
}