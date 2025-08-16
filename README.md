<<<<<<< HEAD

# Good-Night-4th-Hackathon

공연 좌석 예매 시스템 풀스택 구현

## 프로젝트 개요

이 프로젝트는 실시간 공연 좌석 예매 시스템으로, Next.js 프론트엔드와 Rust 백엔드로 구성된 풀스택 애플리케이션입니다.

### 구현된 주요 기능

- **FCFS 좌석 예약 시스템**: 선착순 좌석 예약 API (`/api/v1/seats/reservation/fcfs`)
- **이벤트 발견 및 예약**: 페이지네이션, 필터링, 상세 정보
- **반응형 좌석 선택 UI**: Gamma.app 스타일의 모던한 디자인
- **실시간 상태 업데이트**: React Query를 통한 낙관적 업데이트
- **포괄적인 테스트**: Jest + MSW 단위 테스트, Playwright E2E 설정

## Frontend 기술 스택

- **Next.js 15**: App Router, React 19, TypeScript
- **상태 관리**: React Query (TanStack Query)
- **스타일링**: Tailwind CSS + styled-jsx
- **테스팅**: Jest + MSW, Playwright
- **개발 도구**: ESLint, TypeScript strict mode

## 시작하기

### 개발 서버 실행

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 결과를 확인하세요.

### 빌드 및 테스트

```bash
# 빌드
npm run build

# 단위 테스트
npm run test

# E2E 테스트 (설정 완료)
npm run e2e

# 린팅
npm run lint
```

## API 엔드포인트

### 이벤트 API

- `GET /api/events`: 이벤트 목록 (페이지네이션, 카테고리 필터)
- `GET /api/events/[id]`: 이벤트 상세 정보
- `POST /api/events/[id]/book`: 간단한 이벤트 예약

### FCFS 좌석 예약 API

- `POST /api/v1/seats/reservation/fcfs`: 선착순 좌석 예약
- `GET /api/v1/seats/reservation/fcfs`: 디버깅용 좌석 상태 조회

## 주요 구현 특징

### 동시성 처리

- 재시도 루프를 통한 경합 상황 시뮬레이션
- 원자적 좌석 할당 로직
- 상태 코드: `sold_out`, `already_reserved`, `contention`

### 사용자 경험

- 반응형 디자인 (모바일 최적화)
- 접근성 지원 (ARIA 레이블, 키보드 내비게이션)
- 로딩 상태 및 에러 처리
- 직관적인 좌석 선택 인터페이스

### 코드 품질

- TypeScript strict mode
- 포괄적인 테스트 커버리지
- ESLint 규칙 준수
- 모듈화된 컴포넌트 구조

## 백엔드 통합

이 프론트엔드는 Rust 백엔드와 통합되도록 설계되었습니다:

```
backend/
  Cargo.toml (워크스페이스 루트)
  src/main.rs (앱 엔트리)
  config/ (API & DB 설정)
  seat/ (좌석 도메인 로직)
openresty/ (API Gateway)
redis/ (캐싱 및 세션)
```

## 다음 단계

1. 실제 데이터베이스 연동
2. WebSocket을 통한 실시간 좌석 상태 동기화
3. 사용자 인증 시스템
4. 결제 통합
5. 성능 모니터링 및 메트릭

---

# _이 프로젝트는 [Next.js](https://nextjs.org)로 부트스트랩되었으며 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app)을 사용합니다._

# Good-Night-4th-Hackathon

공연 좌석 예매 시스템 풀스택 구현

## 안내사항

- 본 레포지토리를 **fork**하여 과제를 수행하고, 완료시 PR을 보냅니다.
- 과제의 소스코드는 본인의 GitHub 레포지토리에 **Public**으로 올려주세요.
- 진행 간 문의사항은 이 레포지토리의 Issue로 등록해주세요.
- 구현 내용은 README.md 하단에 이어서 작성해 주세요.

## 과제 목표

공연 좌석 예매 시스템 구현

### 기술 스택

- Backend: 자유 선택 (Spring Boot, Node.js, Django, FastAPI 등)
- Frontend: 자유 선택 (React, Vue, Svelte, Vanilla JS 등)
- Database: 자유 선택
- 선택한 기술 스택에 대한 이유를 README에 간단히 설명해주세요

### 평가 항목

- 문제 해결 접근 방식에서 기술적 의사결정
- 구현 완성도와 문서화 수준

## 요구사항

### 최소 요구사항

> 아래 목표들을 달성하기 위한 구현 방법은 자유롭게 선택하세요.

1. **좌석 현황 표시**
   - 3x3 격자 형태로 총 9개의 좌석 표시
   - 각 좌석의 예약 가능/불가능 상태를 시각적으로 구분
2. **좌석 예약 기능**
   - 사용자가 빈 좌석을 클릭하여 선택
   - 페이지를 이동하여 예약자 정보 입력
   - 정보 입력 완료 후 예약 확정 시도
     - 99% 확률로 예약 성공 처리
     - 1% 확률로 의도적 실패 처리
   - 예약 성공/실패에 대한 명확한 피드백 제공
3. **API 엔드포인트**
   - 좌석 목록 조회 API
   - 좌석 예약 요청 API
   - HTTP 통신을 통한 데이터 교환
4. **코드 품질 보장**
   - 테스트 코드
   - 타입 체크
   - 린팅

### 기본 요구사항

> 아래 목표들을 달성하기 위한 구현 방법은 자유롭게 선택하세요.

> 각 목표를 어떻게 해결했는지 README에 설명해주세요.

1. **사용자 경험 개선**
   - **목표**: 사용자가 서비스를 이용할 때 발생할 수 있는 불편함 최소화
   - **예시**
     - 직관적인 UI
     - 네트워크 지연이 발생했을 때 편의성
     - 예약이 실패했을 때 편의성
     - 모바일에서 접속했을 때 편의성
2. **안정적인 서비스 운영**
   - **목표**: 예상치 못한 상황에서도 서비스가 안정적으로 동작
   - **예시**
     - 잘못된 요청이 들어왔을 때
     - 존재하지 않는 좌석을 예약하려 할 때
     - 서버 에러가 발생했을 때
     - 데이터 정합성 보장

### 심화 요구사항

> 아래 목표들을 달성하기 윈한 구현 방법은 자유롭게 선택하세요.

> 각 목표를 달성했음을 검증할 방법을 마련하세요.

> 시도한 방법이 어떤 방식으로 문제를 해결했으며 보유한 한계점에 대해 상세히 README에 설명해주세요.

1. **동시성 제어**
   - **상황**: 여러 사용자가 동시에 같은 좌석을 예약하려고 시도하는 경우
   - **목표**: 한 좌석에 대해 단 한 명만 예약에 성공하도록 보장
2. **실시간 좌석 상태 동기화**
   - 상황: UI에서 사용자들이 이미 선택된 좌석을 선택하게 되는 경우
   - 목표: 실시간 좌석 예약 상태를 확인할 수 있도록 실시간 동기화 제공
3. **선택한 좌석에 대한 우선순위 제공**
   - 상황 : 좌석 선택 후 예약자 정보를 입력하는 동안 다른 사용자가 좌석을 예약하게 되는 경우
   - 목표: 동일 좌석에 대해 먼저 선택을 한 사용자에게 예약 우선순위 제공

## 참고사항

### 진행 방식

- 최소 요구사항을 먼저 완성한 후 기본 기능을 구현해주세요
- 심화 요구사항은 구현에 실패해도 고민한 해결 방법이 있으면 작성해주세요.

### 필수 제출 항목

- **README.md**: 다음 내용을 반드시 포함
  - 프로젝트 실행 방법 (상세하게)
  - 기술 스택 선택 이유
  - 구현한 요구사항 체크리스트
  - 각 요구사항별 해결 방법 설명

### 선택 제출 항목

- 아키텍처 다이어그램
- 시연 영상 또는 GIF

---

<!-- 구현 내용 작성 -->

## 프로젝트 구조 (2025 Refactor)

```
backend/
  Cargo.toml (워크스페이스 루트 & 바이너리)
  src/main.rs (앱 엔트리)
  config/
     api/ (라우터 & ApiConfig)
     database/ (DB 초기화)
     migration/ (SeaORM migration)
  seat/
     model/ (SeaORM Entity: Seat)
     service/ (Query & Mutation 로직)
     controller/ (HTTP Handler)
openresty/ (Nginx + Lua, API Gateway 예정)
redis/ (Redis 설정)
docker-compose.yml (redis 등 서비스 정의)
```

### 주요 변경 사항

- 워크스페이스를 `backend/` 단일 Cargo.toml로 통합
- SeaORM 1.1.\* 로 업그레이드 및 Entity/Service 모듈 정리
- 중복되던 `entity` 크레이트 제거 → `seat_model` 로 단순화
- 컨트롤러/서비스 레이어 분리 (model ↔ service ↔ controller)
- Redis 연결 및 PING 헬스체크 코드 정비
- 공통 의존성/에디션/린트 설정을 workspace 수준으로 통합

### 실행 방법

1. (선택) 환경 변수 설정: `.env` (예: DB_URL, REDIS_URL 등)
2. 마이그레이션 (필요 시):
   ```bash
   cd backend
   cargo run -p migration
   ```
3. 서버 실행:
   ```bash
   cd backend
   cargo run
   ```
   실행 후 OpenAPI 스펙(JSON): http://localhost:5800/openapi.json
4. (예정) OpenResty + Redis 조합 실행:
   ```bash
   docker compose up -d redis
   # openresty 서비스 정의 추가 예정
   ```

### 좌석 도메인 개요

- Seat: id, status (예약 가능/불가)
- Query: 전체 좌석/단일 좌석 조회
- Mutation: 상태 변경 (경합 해결은 추후 Redis/DB 락 전략 적용 예정)

### 다음 개선 예정 (Todo)

- docker-compose에 `app`, `gateway` 서비스 추가 및 OpenResty entrypoint 수정
- 동시성 제어(낙관락 또는 분산락) 적용
- 실시간 좌석 상태(WS or SSE) 반영
- 테스트 커버리지 확장 (service + controller 통합 테스트)
- README에 아키텍처 다이어그램 추가

> > > > > > > 6b2d63060bf8e5006bcffc5267808b80ee29d5d2
