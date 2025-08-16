# Backend API 서버

좌석 예매 시스템을 위한 백엔드 API 서버입니다.

## 🚀 실행 방법

### 개발 모드 (데이터베이스 초기화 포함)
```bash
npm run dev
```
- 데이터베이스를 초기화하고 서버를 시작합니다
- 기존 데이터가 모두 삭제되고 새로운 데이터베이스가 생성됩니다
- nodemon을 사용하여 코드 변경 시 자동 재시작됩니다

### 프로덕션 모드
```bash
npm start
```
- 기존 데이터베이스를 유지하며 서버를 시작합니다

### 데이터베이스만 초기화
```bash
npm run init-db
```
- 데이터베이스만 초기화하고 서버는 시작하지 않습니다

## 📊 데이터베이스 스키마

### users 테이블
- `id`: 사용자 고유 ID (자동 증가)
- `name`: 사용자 이름
- `email`: 사용자 이메일

### seat_bookings 테이블
- `id`: 예매 고유 ID (자동 증가)
- `seat_number`: 좌석 번호
- `booking_date`: 예매 날짜 (자동 설정)
- `status`: 예매 상태 (기본값: 'booked')

## 🔌 API 엔드포인트

- `GET /` - 서버 상태 확인
- `GET /api/test` - API 테스트
- `POST /api/book-seats` - 좌석 예매
- `GET /api/booked-seats` - 예매된 좌석 조회

## ⚠️ 주의사항

- `npm run dev` 실행 시 기존 데이터가 모두 삭제됩니다
- 개발 중에만 사용하고, 프로덕션에서는 `npm start`를 사용하세요 