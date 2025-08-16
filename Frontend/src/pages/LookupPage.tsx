// 예약 확인 페이지 
import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import type { Seat } from "../types";

export default function LookupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<Seat[] | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setResult(null);
    try {
      const res = await api.lookup({ name, phone });
      setMessage(res.message);
      setResult(res.seats);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "조회 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <button className="link" onClick={() => navigate(-1)}>← 뒤로</button>
      <h2>예약 확인</h2>

      <form onSubmit={submit} className="form">
        <label>
          이름
          <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required />
        </label>
        <label>
          전화번호
          <input type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} required placeholder="010-1234-5678 / +82 10 1234 5678" />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "조회 중..." : "예약 조회"}
        </button>
      </form>

      {message && <p className="hint">{message}</p>}
      {error && <p className="error">{error}</p>}

      {result && result.length > 0 && (
        <div className="ok" style={{ marginTop: 12 }}>
          <strong>예약한 좌석</strong>
          <ul>
            {result.map((s) => (
              <li key={s.id}>
                {s.seat_code ?? `${s.row}-${s.col}`}
              </li>
            ))}
          </ul>
          <button onClick={() => navigate("/")}>좌석 목록으로</button>
        </div>
      )}
    </div>
  );
}