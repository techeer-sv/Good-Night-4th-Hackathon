import React, { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import NProgress from 'nprogress'

const ReservePage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const seatId = Number(id)
  const navigate = useNavigate()
  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const formRef = useRef<HTMLFormElement | null>(null)
  const nameRef = useRef<HTMLInputElement | null>(null)
  const phoneRef = useRef<HTMLInputElement | null>(null)

  const formatPhone = (digits: string): string => {
    if (!digits) return ''
    const only = digits.replace(/\D/g, '').slice(0, 11)
    const p1 = only.slice(0, 3)
    const p2 = only.slice(3, 7)
    const p3 = only.slice(7, 11)
    return [p1, p2, p3].filter(Boolean).join('-')
  }
  const isValidPhone = (value: string) => value.replace(/\D/g, '').length === 11 && value.startsWith('010')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = formatPhone(e.target.value)
    setPhone(next)
    setPhoneError(next && !isValidPhone(next) ? '휴대폰 번호는 010으로 시작하는 11자리여야 합니다.' : '')
  }

  const submitReservation = async (seatId: number, user: { name: string; phone: string }) => {
    NProgress.start()
    try {
      const res = await fetch(`${API_BASE}/api/seats/${seatId}/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
      if (!res.ok) throw new Error(await res.text())
    } finally {
      NProgress.done()
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!seatId) return
    const name = (formRef.current?.elements.namedItem('name') as HTMLInputElement)?.value || ''
    if (!isValidPhone(phone)) {
      setPhoneError('휴대폰 번호는 010으로 시작하는 11자리여야 합니다.')
      phoneRef.current?.focus()
      return
    }
    setIsSubmitting(true)
    try {
      await submitReservation(seatId, { name, phone: phone.replace(/\D/g, '') })
      alert('✅ 예약이 성공적으로 완료되었습니다!')
      navigate('/')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '예약에 실패했습니다.'
      alert(`❌ ${message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container">
        <div className="panel">
          <h1>좌석 {seatId} 예약</h1>
          <form ref={formRef} onSubmit={onSubmit} className="mt-4 max-w-md mx-auto w-full">
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input id="name" name="name" type="text" required ref={nameRef} />
            </div>
            <div className="form-group">
              <label htmlFor="phone">연락처</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="010-1234-5678"
                autoComplete="tel"
                inputMode="numeric"
                value={phone}
                onChange={handlePhoneChange}
                ref={phoneRef}
                className={phoneError ? 'input-invalid' : ''}
                required
              />
              {phoneError ? <p className="error-text">{phoneError}</p> : null}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button type="button" className="cancel-btn w-full sm:w-auto" onClick={() => navigate(-1)}>이전</button>
              <button type="submit" className="submit-btn w-full sm:w-auto" disabled={isSubmitting}>
                {isSubmitting ? '처리 중...' : '예약 확정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ReservePage


