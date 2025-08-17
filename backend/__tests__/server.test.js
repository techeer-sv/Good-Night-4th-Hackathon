const request = require('supertest');
const app = require('../server');

const baseSeats = [
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

describe('최소 요구사항 테스트', () => {
  beforeEach(() => {
    // !!! 중요: server.js는 모듈 스코프 배열(seats/reservations)을 씀.
    // app.locals에 "새 배열을 재할당"하면 server의 seats 참조는 안 바뀌므로,
    // 반드시 "제자리에서 비우고 다시 채우기"로 리셋한다.
    app.locals.seats.length = 0;
    app.locals.seats.push(...baseSeats.map((s) => ({ ...s }))); // deep copy

    app.locals.reservations.length = 0;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  //
  // 1) 좌석 현황 표시 (GET /seats)
  //
  it('GET /seats → 3x3 총 9좌석과 상태를 반환한다', async () => {
    const res = await request(app).get('/seats').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(9);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    const s1 = res.body[0];
    expect(s1).toHaveProperty('id');
    expect(s1).toHaveProperty('row');
    expect(s1).toHaveProperty('col');
    expect(s1).toHaveProperty('isReserved');
  });

  //
  // 2) 좌석 예약 기능 (POST /seats/reserve)
  //
  const payload = {
    name: '홍길동',
    phone: '010-1234-5678',
    email: 'test@example.com',
    seatId: 1,
  };

  it('99% 경로(성공): 201 + status=confirmed, 좌석 상태가 예약됨', async () => {
    // server.js: isSuccess = Math.random() > 0.01  → 0.5면 성공
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const res = await request(app)
      .post('/seats/reserve')
      .send(payload)
      .expect(201);
    expect(res.body).toHaveProperty('status', 'confirmed');
    expect(res.body).toHaveProperty('seatId', 1);

    const after = await request(app).get('/seats').expect(200);
    const s1 = after.body.find((s) => s.id === 1);
    expect(s1.isReserved).toBe(true);
  });

  it('1% 경로(의도적 실패): 201 + status=failed, 좌석 상태는 그대로', async () => {
    // 실패 강제: 0.005 > 0.01 는 false → 실패 분기
    jest.spyOn(Math, 'random').mockReturnValue(0.005);

    const res = await request(app)
      .post('/seats/reserve')
      .send({ ...payload, seatId: 2 })
      .expect(201);

    expect(res.body).toHaveProperty('status', 'failed');
    expect(res.body).toHaveProperty('seatId', 2);

    const after = await request(app).get('/seats').expect(200);
    const s2 = after.body.find((s) => s.id === 2);
    expect(s2.isReserved).toBe(false);
  });

  it('이미 예약된 좌석이면 409 반환', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);
    await request(app).post('/seats/reserve').send(payload).expect(201);

    await request(app).post('/seats/reserve').send(payload).expect(409);
  });

  it('필수 필드 누락 시 400 반환', async () => {
    await request(app).post('/seats/reserve').send({ seatId: 3 }).expect(400);
  });

  it('존재하지 않는 좌석이면 404 반환', async () => {
    await request(app)
      .post('/seats/reserve')
      .send({ ...payload, seatId: 999 })
      .expect(404);
  });

  //
  // 3) 좌석 단건 조회 (서버 구현에 맞춤: 없으면 400)
  //
  it('GET /seats/:id → 좌석 없으면 400 반환(서버 구현에 맞춤)', async () => {
    await request(app).get('/seats/999').expect(400);
  });
});
