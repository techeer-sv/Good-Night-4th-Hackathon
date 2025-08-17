// Moved from root components/ to src/components/seats/
"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

type SeatType = 'standard' | 'premium' | 'aisle' | 'wheel' | 'sold';

interface GammaSeatSelectorProps {
  rows?: number;
  cols?: number;
  maxSelect?: number;
  soldSeats?: string[];
  onChange?: (selected: string[], totalPrice: number) => void;
  className?: string;
}

const PRICE: Record<Exclude<SeatType, 'sold'>, number> = {
  standard: 12000,
  premium: 18000,
  aisle: 14000,
  wheel: 12000,
};

function seatId(r: number, c: number) { return `${String.fromCharCode(65 + (r-1))}-${c}`; }

function classifySeat(r: number, c: number, rows: number, cols: number): SeatType {
  const isEdge = c === 1 || c === cols;
  const isAisle = c === Math.ceil(cols/3) || c === Math.ceil(cols*2/3);
  if (r <= 3) return 'premium';
  if (isEdge || isAisle) return 'aisle';
  if (r === Math.ceil(rows/2) && (c <= 2 || c >= cols-1)) return 'wheel';
  return 'standard';
}

export const GammaSeatSelector: React.FC<GammaSeatSelectorProps> = ({
  rows = 12,
  cols = 18,
  maxSelect = 4,
  soldSeats = ['B-5','B-6','C-8','C-9','H-10','H-11','K-2'],
  onChange,
  className,
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [currentMax, setCurrentMax] = useState(maxSelect);
  const hallRef = useRef<HTMLDivElement>(null);

  const seatTypes = useMemo(() => {
    const map: Record<string, SeatType> = {};
    for (let r=1; r<=rows; r++) {
      for (let c=1; c<=cols; c++) {
        const id = seatId(r,c);
        map[id] = soldSeats.includes(id) ? 'sold' : classifySeat(r,c,rows,cols);
      }
    }
    return map;
  }, [rows, cols, soldSeats]);

  const selectedArr = useMemo(() => Array.from(selected).sort(), [selected]);

  const totalPrice = useMemo(() => selectedArr.reduce((acc, id) => {
    const type = seatTypes[id];
    if (type && type !== 'sold') acc += PRICE[type as Exclude<SeatType,'sold'>] || 0;
    return acc;
  }, 0), [selectedArr, seatTypes]);

  useEffect(() => { onChange?.(selectedArr, totalPrice); }, [selectedArr, totalPrice, onChange]);

  const toggleSeat = useCallback((id: string) => {
    const type = seatTypes[id];
    if (!type || type === 'sold') return;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < currentMax) next.add(id);
      return next;
    });
  }, [seatTypes, currentMax]);

  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, r: number, c: number) => {
    const key = e.key;
    if (key === ' ' || key === 'Enter') {
      e.preventDefault();
      toggleSeat(seatId(r,c));
      return;
    }
    let nr = r, nc = c;
    if (key === 'ArrowRight') nc = Math.min(cols, c+1);
    if (key === 'ArrowLeft') nc = Math.max(1, c-1);
    if (key === 'ArrowDown') nr = Math.min(rows, r+1);
    if (key === 'ArrowUp') nr = Math.max(1, r-1);
    if (nr !== r || nc !== c) {
      e.preventDefault();
      const gridIndex = (nr-1)*2 + 1; // label + grid pattern
      const hall = hallRef.current;
      const grid = hall?.children[gridIndex] as HTMLElement | undefined;
      const btn = grid?.querySelector<HTMLButtonElement>(`.gamma-seat:nth-child(${nc})`);
      btn?.focus();
    }
  };

  const clear = () => setSelected(new Set());
  const decMax = () => setCurrentMax(m => Math.max(1, m-1));
  const incMax = () => setCurrentMax(m => Math.min(8, m+1));

  useEffect(() => {
    setSelected(prev => {
      if (prev.size <= currentMax) return prev;
      return new Set(Array.from(prev).slice(0, currentMax));
    });
  }, [currentMax]);

  return (
    <div className={inter.className + ' gamma-seat-wrap mx-auto'} style={{maxWidth: '1100px'}}>
      <div className="mb-4">
        <h1 className="flex items-center gap-3 font-bold tracking-tight text-[clamp(20px,3.5vw,28px)]">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold text-white" style={{background:'var(--gamma-accent-grad)', boxShadow:'var(--gamma-shadow-md)'}}>BETA</span>
          공연장 좌석 선택 (Gamma 스타일)
        </h1>
        <p className="text-sm text-[var(--gamma-muted)]">부드러운 카드, 그라데이션 포인트, 명확한 계층 구조를 갖춘 좌석 선택 UI.</p>
      </div>
      <div className={"gamma-seat-card " + (className||'')} role="region" aria-label="좌석 선택 컴포넌트">
        <div className="gamma-toolbar">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="gamma-chip" aria-live="polite">최대 선택 <strong>{currentMax}</strong>석</span>
            <button className="gamma-btn" onClick={clear} aria-label="선택 모두 해제">선택 해제</button>
          </div>
          <div className="flex items-center gap-3">
            <button className="gamma-btn" onClick={decMax}>-1</button>
            <button className="gamma-btn" onClick={incMax}>+1</button>
            <button className="gamma-btn primary" disabled={selected.size===0}>예약</button>
          </div>
        </div>
        <div className="gamma-screen"><span>STAGE</span></div>
        <div className="gamma-legend" aria-hidden="true">
          <div className="gamma-legend-item"><span className="gamma-k std" /> 일반</div>
          <div className="gamma-legend-item"><span className="gamma-k prm" /> 프리미엄</div>
          <div className="gamma-legend-item"><span className="gamma-k ais" /> 통로</div>
          <div className="gamma-legend-item"><span className="gamma-k whl" /> 휠체어</div>
          <div className="gamma-legend-item"><span className="gamma-k sold" /> 매진</div>
        </div>
        <div className="gamma-hall" role="grid" aria-rowcount={rows} aria-colcount={cols} ref={hallRef}>
          {Array.from({length: rows}).map((_, rIdx) => {
            const r = rIdx + 1;
            return (
              <React.Fragment key={r}>
                <div className="gamma-row-label" aria-hidden>{String.fromCharCode(65 + (r-1))}</div>
                <div className="gamma-seat-grid" role="row">
                  {Array.from({length: cols}).map((__, cIdx) => {
                    const c = cIdx + 1;
                    const id = seatId(r,c);
                    const type = seatTypes[id];
                    const isSelected = selected.has(id);
                    const isSold = type === 'sold';
                    return (
                      <button
                        key={id}
                        type="button"
                        className={"gamma-seat" + (isSold ? ' is-sold' : '') + (isSelected ? ' is-selected' : '')}
                        data-id={id}
                        data-type={type}
                        onClick={() => toggleSeat(id)}
                        onKeyDown={(e) => onKey(e, r, c)}
                        aria-label={`좌석 ${id} (${type})`}
                        aria-pressed={isSelected}
                        disabled={isSold}
                      >{c}</button>
                    );
                  })}
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <div className="gamma-summary">
          <div className="gamma-selected-list" aria-live="polite">
            {selectedArr.map(id => {
              const type = seatTypes[id];
              return <span key={id} className="gamma-pill">{id} • {type}</span>;
            })}
            {selectedArr.length === 0 && <span className="text-xs text-[var(--gamma-muted)]">좌석을 선택하세요</span>}
          </div>
          <div className="gamma-price">결제 예정 금액: <strong>₩{totalPrice.toLocaleString()}</strong></div>
        </div>
      </div>
      <style jsx>{`
        :root { --gamma-bg: #f7f7fb; --gamma-card-bg: #ffffff; --gamma-text: #111827; --gamma-muted: #6b7280; --gamma-line: #e5e7eb; --gamma-accent-500: #7c3aed; --gamma-accent-400: #8b5cf6; --gamma-accent-300: #a78bfa; --gamma-accent-grad: linear-gradient(135deg, var(--gamma-accent-500) 0%, var(--gamma-accent-300) 100%); --gamma-shadow-lg: 0 20px 40px rgba(17,24,39,0.10); --gamma-shadow-md: 0 10px 24px rgba(17,24,39,0.08); --gamma-seat-size: 36px; --gamma-gap: 8px; --gamma-seat-std: #e9ecf5; --gamma-seat-premium: #e7e7ff; --gamma-seat-aisle: #eaf8ff; --gamma-seat-wheel: #e7ffe7; --gamma-seat-sold: #f3f4f6; --gamma-seat-ring: rgba(124,58,237,0.22); }
        .gamma-seat-card { background: var(--gamma-card-bg); border:1px solid var(--gamma-line); border-radius:16px; box-shadow:var(--gamma-shadow-lg); padding:18px; }
        .gamma-toolbar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .gamma-chip { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; font-size:13px; border:1px solid var(--gamma-line); background:#fff; border-radius:999px; }
        .gamma-btn { appearance:none; border:1px solid var(--gamma-line); background:#fff; color:var(--gamma-text); padding:9px 14px; border-radius:999px; font-weight:600; cursor:pointer; transition: transform .06s ease, box-shadow .2s ease, border-color .2s ease; font-size:14px; }
        .gamma-btn:hover { box-shadow: var(--gamma-shadow-md); transform: translateY(-1px); }
        .gamma-btn:active { transform: translateY(0); }
        .gamma-btn.primary { border-color:transparent; color:#fff; background:var(--gamma-accent-grad); }
        .gamma-screen { background: conic-gradient(from 180deg at 50% 0%, #fff, #fafafa); border:1px solid var(--gamma-line); border-radius:12px; padding:10px; text-align:center; font-weight:700; color:var(--gamma-muted); margin:12px auto 18px; width:min(760px, 92%); position:relative; box-shadow: inset 0 10px 20px rgba(0,0,0,0.04); }
        .gamma-screen span { font-size:12px; letter-spacing:0.2em; font-weight:800; color:#9aa0aa; }
        .gamma-legend { display:flex; flex-wrap:wrap; gap:10px; align-items:center; padding:8px 10px; border-radius:12px; background:#fafafe; border:1px solid var(--gamma-line); margin-bottom:14px; }
        .gamma-legend-item { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--gamma-muted); }
        .gamma-k { width:18px; height:18px; border-radius:6px; border:1px solid var(--gamma-line); }
        .gamma-k.std { background: var(--gamma-seat-std); }
        .gamma-k.prm { background: var(--gamma-seat-premium); }
        .gamma-k.ais { background: var(--gamma-seat-aisle); }
        .gamma-k.whl { background: var(--gamma-seat-wheel); }
        .gamma-k.sold { background: var(--gamma-seat-sold); position:relative; }
        .gamma-k.sold:after { content:""; position:absolute; inset:0; background: repeating-linear-gradient(45deg, transparent 0 5px, rgba(0,0,0,0.08) 5px 10px); border-radius:6px; }
        .gamma-hall { display:grid; gap:16px; grid-template-columns: 28px 1fr; }
        .gamma-row-label { color:var(--gamma-muted); font-weight:700; display:grid; place-items:center; font-size:12px; }
        .gamma-seat-grid { display:grid; gap: var(--gamma-gap); grid-template-columns: repeat(var(--gamma-cols, 18), var(--gamma-seat-size)); align-items:center; }
        .gamma-seat { width:var(--gamma-seat-size); height:var(--gamma-seat-size); border-radius:10px; border:1px solid var(--gamma-line); display:grid; place-items:center; font-size:12px; font-weight:600; background:var(--gamma-seat-std); color:#1f2937; cursor:pointer; position:relative; outline:none; transition: transform .08s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease; }
        .gamma-seat[data-type="premium"] { background: var(--gamma-seat-premium); }
        .gamma-seat[data-type="aisle"] { background: var(--gamma-seat-aisle); }
        .gamma-seat[data-type="wheel"] { background: var(--gamma-seat-wheel); }
        .gamma-seat.is-sold { background: var(--gamma-seat-sold); color:#9ca3af; cursor:not-allowed; text-decoration:line-through; opacity:.8; }
        .gamma-seat:hover:not(.is-sold) { box-shadow:0 0 0 4px var(--gamma-seat-ring); transform:translateY(-1px); }
        .gamma-seat:focus-visible { box-shadow:0 0 0 4px var(--gamma-seat-ring); }
        .gamma-seat.is-selected { background:#ffffff; border-color:transparent; color:#111827; box-shadow:0 8px 20px rgba(124,58,237,.35), 0 0 0 2px #fff, 0 0 0 6px rgba(124,58,237,.25); }
        .gamma-seat[data-type="wheel"]:after { content:""; position:absolute; width:14px; height:14px; right:4px; bottom:4px; opacity:.9; border:2px solid #16a34a; border-radius:50%; box-shadow:-6px -6px 0 -4px #16a34a, -8px -2px 0 -4px #16a34a; }
        .gamma-summary { margin-top:18px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; padding-top:12px; border-top:1px dashed var(--gamma-line); }
        .gamma-price { font-size:14px; color:var(--gamma-muted); }
        .gamma-price strong { color:#111827; font-size:18px; }
        .gamma-selected-list { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .gamma-pill { background:#fff; border:1px solid var(--gamma-line); border-radius:999px; padding:6px 10px; font-size:12px; font-weight:600; }
        @media (max-width:900px){ :root { --gamma-seat-size:32px; } .gamma-seat-grid { grid-template-columns: repeat(var(--gamma-cols,14), var(--gamma-seat-size)); } }
        @media (max-width:640px){ :root { --gamma-seat-size:28px; } .gamma-seat-grid { grid-template-columns: repeat(var(--gamma-cols,12), var(--gamma-seat-size)); } }
      `}</style>
    </div>
  );
};

export default GammaSeatSelector;
