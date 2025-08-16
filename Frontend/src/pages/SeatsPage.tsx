// 좌석 목록 페이지
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { Seat } from "../types";

export default function SeatsPage() {
  const [seats, setSeats] = useState<Seat[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSeats = async () => {
    setLoading(true); setError(null);
    try { setSeats(await api.getSeats()); }
    catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "좌석을 불러오지 못했습니다");
    }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSeats(); }, []);

  // 3x3 그리드로 묶기 (row = 1..3)
  const grid = useMemo(() => {
    if (!seats) return [] as Seat[][];
    return [1,2,3].map((r) => seats.filter((s) => s.row === r));
  }, [seats]);

  return (
    <div className="container">
      <header>
        <h1>공연 좌석 예매 서비스</h1>
        <div className="header-actions">
          <button className="outline" onClick={fetchSeats} disabled={loading}>새로고침</button>
          <button className="outline" onClick={() => navigate("/lookup")}>예약 확인</button>
        </div>
      </header>

      <div className="legend compact" aria-hidden>
        <span className="badge available" /> 선택 가능 좌석
        <span className="badge reserved" /> 예약된 좌석
      </div>

      {/* 무대 배너 */}
      <div className="stage" aria-hidden>
        STAGE
      </div>

      {loading && <p>불러오는 중...</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid theater-grid">
        {grid.map((row, i) => (
          <div className="row" key={i}>
            {row.map((seat) => (
              <button
                key={seat.id}
                className={`seat ${seat.status}`}
                disabled={seat.status === "reserved"}
                onClick={() => navigate(`/reserve?row=${seat.row}&col=${seat.col}&code=${seat.seat_code ?? ""}`)}
                aria-label={`${seat.seat_code ?? `${seat.row}-${seat.col}`} ${seat.status}`}
              >
                {seat.seat_code ?? `${seat.row}-${seat.col}`}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}