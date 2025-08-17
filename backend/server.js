const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

/** 공통 에러 응답 헬퍼 */
const sendErr = (res, status, code, message) =>
  res.status(status).json({ error: true, code, message });

// 미들웨어
app.use(
  cors({
    origin: true, // 모든 origin 허용 (개발 환경용)
    credentials: true,
  }),
);
app.use(express.json());

// 메모리 데이터 저장소
let seats = [
  { id: 1, row: 'A', col: 1, isReserved: false, isSelected: false },
  { id: 2, row: 'A', col: 2, isReserved: false, isSelected: false },
  { id: 3, row: 'A', col: 3, isReserved: false, isSelected: false },
  { id: 4, row: 'B', col: 1, isReserved: false, isSelected: false },
  { id: 5, row: 'B', col: 2, isReserved: false, isSelected: false },
  { id: 6, row: 'B', col: 3, isReserved: false, isSelected: false },
  { id: 7, row: 'C', col: 1, isReserved: false, isSelected: false },
  { id: 8, row: 'C', col: 2, isReserved: false, isSelected: false },
  { id: 9, row: 'C', col: 3, isReserved: false, isSelected: false },
];

let reservations = [];

// 테스트를 위해 app.locals에 데이터 저장
app.locals.seats = seats;
app.locals.reservations = reservations;

// ───────────────── API 라우트

// 0. 헬스체크(선택)
app.get('/healthz', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// 1. 모든 좌석 조회
app.get('/seats', (_req, res) => {
  res.json(seats);
});

// 2. 특정 좌석 조회 (없는 좌석은 기존처럼 400 유지)
app.get('/seats/:id', (req, res) => {
  try {
    const seatId = parseInt(req.params.id);
    if (!Number.isInteger(seatId) || seatId <= 0) {
      return sendErr(
        res,
        400,
        'SEAT_BAD_ID',
        '좌석 ID 형식이 올바르지 않습니다.',
      );
    }
    const seat = seats.find((s) => s.id === seatId);
    if (!seat) {
      return sendErr(
        res,
        400,
        'SEAT_NOT_FOUND',
        `좌석 ID ${seatId}를 찾을 수 없습니다.`,
      );
    }
    res.json(seat);
  } catch (e) {
    console.error(e);
    return sendErr(res, 500, 'INTERNAL', '서버 에러가 발생했습니다.');
  }
});

// 3. 좌석 예약
app.post('/seats/reserve', (req, res) => {
  try {
    const { seatId, name, phone, email } = req.body || {};

    // 입력 검증 (400)
    if (!seatId || !name || !phone || !email) {
      return sendErr(res, 400, 'VALIDATION', '모든 필드를 입력해주세요.');
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      return sendErr(
        res,
        400,
        'VALIDATION',
        '이메일 형식이 올바르지 않습니다.',
      );
    }

    // 좌석 존재 (404)
    const seat = seats.find((s) => s.id === seatId);
    if (!seat) {
      return sendErr(
        res,
        404,
        'SEAT_NOT_FOUND',
        `좌석 ID ${seatId}를 찾을 수 없습니다.`,
      );
    }

    // 이미 예약 (409)
    if (seat.isReserved) {
      return sendErr(
        res,
        409,
        'ALREADY_RESERVED',
        `좌석 ${seat.row}${seat.col}는 이미 예약되었습니다.`,
      );
    }

    // ── (테스트 편의) 강제 실패/500 스위치
    const forceFail =
      req.query.force === 'fail' || req.get('x-force-fail') === '1';
    const force500 =
      req.query.force500 === '1' || req.get('x-force-500') === '1';
    if (force500) {
      throw new Error('forced 500');
    }

    // 99% 성공 / 1% 실패 (성공일 때만 좌석 상태 변경 → 정합성 보장)
    const isSuccess = forceFail ? false : Math.random() > 0.01;

    const reservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      seatId,
      name,
      phone,
      email,
      seatInfo: `${seat.row}${seat.col}`,
      createdAt: new Date(),
      status: isSuccess ? 'confirmed' : 'failed',
    };

    if (isSuccess) {
      seat.isReserved = true;
      seat.reservationId = reservation.id;
      reservations.push(reservation);
    }

    return res.status(201).json(reservation);
  } catch (e) {
    console.error(e);
    return sendErr(res, 500, 'INTERNAL', '서버 에러가 발생했습니다.');
  }
});

// 4. 모든 예약 조회
app.get('/seats/reservations', (_req, res) => {
  res.json(reservations);
});

// 5. 특정 예약 조회
app.get('/seats/reservations/:id', (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = reservations.find((r) => r.id === reservationId);

    if (!reservation) {
      return sendErr(
        res,
        404,
        'RESERVATION_NOT_FOUND',
        `예약 ID ${reservationId}를 찾을 수 없습니다.`,
      );
    }

    res.json(reservation);
  } catch (e) {
    console.error(e);
    return sendErr(res, 500, 'INTERNAL', '서버 에러가 발생했습니다.');
  }
});

// ── 중앙 오류 핸들러(예기치 못한 에러 잡기)
app.use((err, _req, res, _next) => {
  console.error(err);
  return sendErr(res, 500, 'INTERNAL', '서버 에러가 발생했습니다.');
});

// 서버 시작
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Express 서버가 포트 ${PORT}에서 실행 중`);
    console.log(`좌석 API:        http://localhost:${PORT}/seats`);
    console.log(`좌석 단건 API:   http://localhost:${PORT}/seats/:id`);
    console.log(`예약 API:        http://localhost:${PORT}/seats/reserve`);
    console.log(`헬스체크:        http://localhost:${PORT}/healthz`);
  });
}

module.exports = app;
