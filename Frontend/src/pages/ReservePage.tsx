// 예약 폼 페이지
import { type FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api";

function useQuery() { return new URLSearchParams(useLocation().search); }

export default function ReservePage() {
  const q = useQuery();
  const row = Number(q.get("row"));
  const col = Number(q.get("col"));
  const seatCode = q.get("code") || `${row}-${col}`;
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null); setMessage(null);
    try {
      const res = await api.reserve({ row, col, name, phone });
      setMessage(`${res.message} (좌석 ${res.seat.seat_code ?? `${res.seat.row}-${res.seat.col}`})`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "예약에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <button className="link" onClick={() => navigate(-1)}>← 뒤로</button>
      <h2>좌석 예약: {seatCode}</h2>

      <form onSubmit={submit} className="form">
        <label>
          이름
          <input type="text" value={name} onChange={e=>setName(e.target.value)} required placeholder="홍길동"/>
        </label>

        <label>
          전화번호
          <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} required placeholder="010-1234-5678 / +82 10 1234 5678"/>
        </label>

        <button type="submit" disabled={loading}>{loading ? "예약 중..." : "예약하기"}</button>
      </form>

      {message && <div className="ok">
        <p>{message}</p>
        <button onClick={() => navigate("/")}>좌석으로 돌아가기</button>
      </div>}

      {error && <p className="error">{error}</p>}

      <p className="hint small">* 서버는 1% 확률로 의도적으로 실패(409)를 반환합니다. 실패 시 다시 시도해 주세요.</p>
    </div>
  );
}