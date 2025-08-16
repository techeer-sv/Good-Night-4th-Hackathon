# 🎭 공연 좌석 예매 시스템 백엔드

Techeer Hackathon 4기 - 공연 좌석 예매 시스템의 백엔드 API 서버입니다.

## 🚀 주요 기능

### 🔒 동시성 제어 (Seat Lock System)
- 좌석별 락 시스템으로 동시 예약 방지
- 자동 락 만료 및 정리
- 사용자별 락 권한 관리

### 🎯 우선순위 시스템
- VIP > Premium > Normal 순서로 처리
- 대기열 우선순위 기반 처리
- 예상 대기 시간 계산

### 📊 실시간 상태 관리
- 좌석 상태 실시간 업데이트
- 예약 자동 만료 (5분)
- 실시간 통계 및 모니터링

## 🛠 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **데이터 저장**: 메모리 기반 (개발용)
- **동시성 제어**: Custom Seat Lock System
- **우선순위 큐**: Custom Priority Queue

## 📦 설치 및 실행

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp env.example .env
# .env 파일을 편집하여 필요한 설정 추가
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 프로덕션 서버 실행
```bash
npm start
```

## 🌐 API 엔드포인트

### 공연 관련
- `GET /api/concerts` - 공연 목록 조회
- `GET /api/concerts/:id` - 공연 상세 정보 조회
- `GET /api/concerts/:id/seats` - 공연별 좌석 정보 조회

### 예매 관련
- `POST /api/bookings/reserve` - 좌석 예약
- `POST /api/bookings/book` - 좌석 예매
- `DELETE /api/bookings/reserve` - 좌석 예약 해제
- `GET /api/bookings/user/:userId` - 사용자별 예매 내역 조회

### 대기열 관련
- `POST /api/queue/join` - 우선순위 대기열 등록
- `GET /api/queue/status/:concertId` - 대기열 상태 확인
- `DELETE /api/queue/leave` - 대기열에서 나가기

### 시스템 관련
- `GET /` - API 상태 및 정보
- `GET /api/health` - 서버 상태 확인
- `GET /api/docs` - API 문서

## 🔧 사용 예시

### 1. 공연 목록 조회
```bash
curl http://localhost:3001/api/concerts
```

### 2. 좌석 예약
```bash
curl -X POST http://localhost:3001/api/bookings/reserve \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "concert-id",
    "seatIds": ["seat-1", "seat-2"],
    "userId": "user1"
  }'
```

### 3. 우선순위 대기열 등록
```bash
curl -X POST http://localhost:3001/api/queue/join \
  -H "Content-Type: application/json" \
  -d '{
    "concertId": "concert-id",
    "userId": "user1",
    "priority": "vip"
  }'
```

## 🎯 챌린지 키워드 구현

### 동시성 제어
- **Seat Lock System**: 각 좌석에 대한 락 메커니즘
- **Rate Limiting**: API 요청 제한으로 서버 보호
- **자동 만료**: 예약 및 락의 자동 해제

### 동기화
- **실시간 상태 업데이트**: 좌석 상태 실시간 동기화
- **트랜잭션 처리**: 예약 → 예매 과정의 원자성 보장
- **일관성 검증**: 데이터 일관성 유지

### 우선순위
- **Priority Queue**: VIP, Premium, Normal 순서 처리
- **대기열 관리**: 우선순위별 대기 시간 계산
- **공정한 처리**: 같은 우선순위 내에서는 FIFO 원칙

## 📊 샘플 데이터

시스템 시작 시 자동으로 생성되는 샘플 데이터:

### 공연
- 2024 K-POP Festival (15,000석)
- Classical Symphony Night (2,500석)
- Rock Concert 2024 (12,000석)

### 사용자
- 김철수 (normal)
- 이영희 (premium)
- 박민수 (vip)

## 🔍 모니터링 및 디버깅

### 서버 상태 확인
```bash
curl http://localhost:3001/api/health
```

### 대기열 상태 확인
```bash
curl http://localhost:3001/api/queue/admin/status
```

### API 문서 확인
```bash
curl http://localhost:3001/api/docs
```

## 🚨 주의사항

1. **메모리 기반 저장**: 현재 메모리 기반으로 구현되어 서버 재시작 시 데이터가 초기화됩니다.
2. **동시성 테스트**: 실제 부하 테스트를 통해 동시성 제어 시스템을 검증하세요.
3. **에러 처리**: 모든 API 응답에 적절한 에러 처리가 포함되어 있습니다.

## 🔮 향후 개선 계획

- [ ] 데이터베이스 연동 (PostgreSQL/MongoDB)
- [ ] Redis를 이용한 세션 및 캐시 관리
- [ ] WebSocket을 이용한 실시간 알림
- [ ] 결제 시스템 연동
- [ ] 관리자 대시보드
- [ ] 로깅 및 모니터링 시스템

## 📝 라이선스

ISC License

---

**Techeer Hackathon 4기** - 공연 좌석 예매 시스템 백엔드 팀
