import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NProgress from 'nprogress'

type SeatStatus = 'available' | 'unavailable'
interface Seat { id: number; status: SeatStatus }

const SeatsPage: React.FC = () => {
  const [seats, setSeats] = useState<Seat[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      NProgress.start()
      try {
        const res = await fetch(`${API_BASE}/api/seats`, { cache: 'no-store' })
        if (!res.ok) throw new Error('좌석 목록을 불러오지 못했습니다.')
        const raw = (await res.json()) as Array<{ seatId: number; status: string }>
        const mapped: Seat[] = raw.map((s) => ({ id: s.seatId, status: String(s.status).toLowerCase() as SeatStatus }))
        mapped.sort((a, b) => a.id - b.id)
        setSeats(mapped)
      } finally {
        setIsLoading(false)
        NProgress.done()
      }
    }
    load()
  }, [])

  const goReserve = (seat: Seat) => {
    if (seat.status === 'unavailable') {
      alert('이미 예약된 좌석입니다.')
      return
    }
    navigate(`/reserve/${seat.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container">
        <div className="panel relative">
          {isLoading ? (
            <div className="loader-overlay"><div className="spinner"></div></div>
          ) : null}
          <h1>공연 좌석 예약 시스템</h1>
          <div className="seat-map">
            {seats.map((seat) => (
              <button
                key={seat.id}
                className={["seat", seat.status].join(' ')}
                onClick={() => goReserve(seat)}
              >
                {seat.id}
              </button>
            ))}
          </div>
          <div className="status-guide">
            <div><span className="box available"></span> 예약 가능</div>
            <div><span className="box unavailable"></span> 예약 불가능</div>
            <div><span className="box selected"></span> 선택됨</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SeatsPage


